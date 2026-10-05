// Posts a devlog to the itch.io game page by submitting the same HTML form
// a human would. itch doesn't publish a devlog API, so this uses a stored
// session cookie (ITCH_SESSION_COOKIE) + a freshly-scraped CSRF token.
//
// Required env:
//   ITCH_SESSION_COOKIE  — value of the `itchio` cookie
//   ITCH_GAME_ID         — numeric game id (ROUGED = 5104941)
//   ITCH_UPLOAD_ID       — upload to attach to the post (ROUGED web zip = 19574261)
//   POST_TITLE           — devlog title
//   POST_BODY            — devlog body (plain text or minimal HTML; newlines → <p>)
//
// Optional env:
//   ITCH_POST_TYPE       — one of: general_update | major_update | postmortem |
//                          tech_discussion | culture | tutorial | game_design |
//                          marketing   (default: general_update)
//
// Fails loudly on any non-200 response, missing CSRF, or redirect to /login
// (expired cookie). Prints the resulting devlog URL on success.

const COOKIE   = process.env.ITCH_SESSION_COOKIE;
const GAME_ID  = process.env.ITCH_GAME_ID;
const UPLOAD_ID = process.env.ITCH_UPLOAD_ID;
const TITLE    = process.env.POST_TITLE;
const BODY     = process.env.POST_BODY;
const POST_TYPE = process.env.ITCH_POST_TYPE || 'general_update';

if (!COOKIE || !GAME_ID || !UPLOAD_ID || !TITLE || !BODY) {
  console.error('Missing one of: ITCH_SESSION_COOKIE, ITCH_GAME_ID, ITCH_UPLOAD_ID, POST_TITLE, POST_BODY');
  process.exit(1);
}

const UA = 'Mozilla/5.0 (compatible; eeman-itch-devlog-bot/1.0; +https://github.com/eeman1113/rouged)';
const base = `https://itch.io/dashboard/game/${GAME_ID}`;

function cookieHeader() { return `itchio=${COOKIE}`; }

// Convert the plain-text body to minimal HTML the Redactor editor accepts.
// Preserves lists (`- item`, `* item`) and double-blank-line paragraph breaks.
function toHtml(text) {
  const paragraphs = text.replace(/\r\n/g, '\n').split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  return paragraphs.map(p => {
    const lines = p.split('\n');
    const isList = lines.every(l => /^[-*•]\s+/.test(l));
    if (isList) {
      return '<ul>' + lines.map(l => `<li>${escapeHtml(l.replace(/^[-*•]\s+/, ''))}</li>`).join('') + '</ul>';
    }
    return `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`;
  }).join('');
}
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function fetchJsonOrHtml(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    redirect: 'manual',
    headers: {
      'User-Agent': UA,
      'Cookie': cookieHeader(),
      ...(init.headers || {}),
    },
  });
  const location = res.headers.get('location') || '';
  if (location.includes('/login')) {
    throw new Error('Session cookie expired — the request was redirected to /login. Refresh ITCH_SESSION_COOKIE.');
  }
  return res;
}

// Step 1 — GET the new-devlog form to extract a fresh CSRF token.
const formUrl = `${base}/new-devlog`;
console.log('GET', formUrl);
const formRes = await fetchJsonOrHtml(formUrl);
if (!formRes.ok && formRes.status !== 302) {
  console.error('Failed to load devlog form:', formRes.status, formRes.statusText);
  process.exit(1);
}
const formHtml = await formRes.text();
const csrfMatch = formHtml.match(/name="csrf_token"\s+value="([^"]+)"/);
if (!csrfMatch) {
  console.error('Could not find csrf_token in the devlog form page.');
  process.exit(1);
}
const csrfToken = csrfMatch[1];
console.log('Got CSRF token');

// Step 2 — POST the devlog form with the same fields the UI submits.
const bodyHtml = toHtml(BODY);
const form = new URLSearchParams();
form.set('csrf_token', csrfToken);
form.set('post[title]', TITLE);
form.set('post[user_classification]', POST_TYPE);
form.set('attachment[1][object_type]', 'upload');
form.set('attachment[1][object_id]', UPLOAD_ID);
form.set('post[body]', bodyHtml);
form.set('post[languages][]', 'en');
form.set('post[published]', 'on');

console.log('POST', formUrl);
const postRes = await fetchJsonOrHtml(formUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Referer': formUrl,
    'Origin': 'https://itch.io',
  },
  body: form.toString(),
});

// Expected success: 302 redirect to the new devlog's permalink
if (postRes.status === 302 || postRes.status === 303) {
  const loc = postRes.headers.get('location') || '(unknown)';
  console.log('✓ Devlog posted:', loc);
  process.exit(0);
}

const text = await postRes.text();
console.error('✗ Devlog POST returned', postRes.status, '— first 1000 chars of response:');
console.error(text.slice(0, 1000));
process.exit(1);
