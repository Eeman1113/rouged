var Zl=Object.defineProperty;var Jl=(i,e,t)=>e in i?Zl(i,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):i[e]=t;var W=(i,e,t)=>Jl(i,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}})();/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Gr="160",Ql=0,aa=1,ec=2,el=1,tc=2,rn=3,bn=0,Ct=1,an=2,hn=0,gi=1,Ar=2,oa=3,la=4,nc=5,Fn=100,ic=101,sc=102,ca=103,ha=104,rc=200,ac=201,oc=202,lc=203,wr=204,br=205,cc=206,hc=207,uc=208,fc=209,dc=210,pc=211,mc=212,gc=213,_c=214,vc=0,xc=1,Mc=2,vs=3,Sc=4,yc=5,Ec=6,Tc=7,Vr=0,Ac=1,wc=2,En=0,bc=1,Rc=2,Cc=3,Lc=4,Pc=5,Dc=6,tl=300,vi=301,xi=302,Rr=303,Cr=304,bs=306,xs=1e3,Xt=1001,Lr=1002,ht=1003,ua=1004,zs=1005,zt=1006,Uc=1007,Oi=1008,Tn=1009,Ic=1010,Nc=1011,Wr=1012,nl=1013,xn=1014,Mn=1015,un=1016,il=1017,sl=1018,zn=1020,Oc=1021,qt=1023,Fc=1024,Bc=1025,Hn=1026,Mi=1027,zc=1028,rl=1029,Hc=1030,al=1031,ol=1033,Hs=33776,ks=33777,Gs=33778,Vs=33779,fa=35840,da=35841,pa=35842,ma=35843,ll=36196,ga=37492,_a=37496,va=37808,xa=37809,Ma=37810,Sa=37811,ya=37812,Ea=37813,Ta=37814,Aa=37815,wa=37816,ba=37817,Ra=37818,Ca=37819,La=37820,Pa=37821,Ws=36492,Da=36494,Ua=36495,kc=36283,Ia=36284,Na=36285,Oa=36286,cl=3e3,kn=3001,Gc=3200,Vc=3201,Xr=0,Wc=1,kt="",ut="srgb",fn="srgb-linear",qr="display-p3",Rs="display-p3-linear",Ms="linear",Je="srgb",Ss="rec709",ys="p3",Kn=7680,Fa=519,Xc=512,qc=513,Yc=514,hl=515,Kc=516,$c=517,jc=518,Zc=519,Pr=35044,Ba="300 es",Dr=1035,ln=2e3,Es=2001;class Ti{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const n=this._listeners;return n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const s=this._listeners[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const n=this._listeners[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const xt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Xs=Math.PI/180,Ur=180/Math.PI;function An(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(xt[i&255]+xt[i>>8&255]+xt[i>>16&255]+xt[i>>24&255]+"-"+xt[e&255]+xt[e>>8&255]+"-"+xt[e>>16&15|64]+xt[e>>24&255]+"-"+xt[t&63|128]+xt[t>>8&255]+"-"+xt[t>>16&255]+xt[t>>24&255]+xt[n&255]+xt[n>>8&255]+xt[n>>16&255]+xt[n>>24&255]).toLowerCase()}function Rt(i,e,t){return Math.max(e,Math.min(t,i))}function Jc(i,e){return(i%e+e)%e}function qs(i,e,t){return(1-t)*i+t*e}function za(i){return(i&i-1)===0&&i!==0}function Ir(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function on(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Ke(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}class _e{constructor(e=0,t=0){_e.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Rt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ke{constructor(e,t,n,s,r,a,o,c,h){ke.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,h)}set(e,t,n,s,r,a,o,c,h){const l=this.elements;return l[0]=e,l[1]=s,l[2]=o,l[3]=t,l[4]=r,l[5]=c,l[6]=n,l[7]=a,l[8]=h,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],c=n[6],h=n[1],l=n[4],f=n[7],p=n[2],m=n[5],_=n[8],g=s[0],d=s[3],u=s[6],E=s[1],M=s[4],A=s[7],P=s[2],R=s[5],w=s[8];return r[0]=a*g+o*E+c*P,r[3]=a*d+o*M+c*R,r[6]=a*u+o*A+c*w,r[1]=h*g+l*E+f*P,r[4]=h*d+l*M+f*R,r[7]=h*u+l*A+f*w,r[2]=p*g+m*E+_*P,r[5]=p*d+m*M+_*R,r[8]=p*u+m*A+_*w,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],h=e[7],l=e[8];return t*a*l-t*o*h-n*r*l+n*o*c+s*r*h-s*a*c}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],h=e[7],l=e[8],f=l*a-o*h,p=o*c-l*r,m=h*r-a*c,_=t*f+n*p+s*m;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const g=1/_;return e[0]=f*g,e[1]=(s*h-l*n)*g,e[2]=(o*n-s*a)*g,e[3]=p*g,e[4]=(l*t-s*c)*g,e[5]=(s*r-o*t)*g,e[6]=m*g,e[7]=(n*c-h*t)*g,e[8]=(a*t-n*r)*g,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){const c=Math.cos(r),h=Math.sin(r);return this.set(n*c,n*h,-n*(c*a+h*o)+a+e,-s*h,s*c,-s*(-h*a+c*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(Ys.makeScale(e,t)),this}rotate(e){return this.premultiply(Ys.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ys.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Ys=new ke;function ul(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Ts(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Qc(){const i=Ts("canvas");return i.style.display="block",i}const Ha={};function Ni(i){i in Ha||(Ha[i]=!0,console.warn(i))}const ka=new ke().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Ga=new ke().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Wi={[fn]:{transfer:Ms,primaries:Ss,toReference:i=>i,fromReference:i=>i},[ut]:{transfer:Je,primaries:Ss,toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[Rs]:{transfer:Ms,primaries:ys,toReference:i=>i.applyMatrix3(Ga),fromReference:i=>i.applyMatrix3(ka)},[qr]:{transfer:Je,primaries:ys,toReference:i=>i.convertSRGBToLinear().applyMatrix3(Ga),fromReference:i=>i.applyMatrix3(ka).convertLinearToSRGB()}},eh=new Set([fn,Rs]),Ye={enabled:!0,_workingColorSpace:fn,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!eh.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,e,t){if(this.enabled===!1||e===t||!e||!t)return i;const n=Wi[e].toReference,s=Wi[t].fromReference;return s(n(i))},fromWorkingColorSpace:function(i,e){return this.convert(i,this._workingColorSpace,e)},toWorkingColorSpace:function(i,e){return this.convert(i,e,this._workingColorSpace)},getPrimaries:function(i){return Wi[i].primaries},getTransfer:function(i){return i===kt?Ms:Wi[i].transfer}};function _i(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ks(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let $n;class fl{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{$n===void 0&&($n=Ts("canvas")),$n.width=e.width,$n.height=e.height;const n=$n.getContext("2d");e instanceof ImageData?n.putImageData(e,0,0):n.drawImage(e,0,0,e.width,e.height),t=$n}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Ts("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=_i(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(_i(t[n]/255)*255):t[n]=_i(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let th=0;class dl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:th++}),this.uuid=An(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push($s(s[a].image)):r.push($s(s[a]))}else r=$s(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function $s(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?fl.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let nh=0;class Lt extends Ti{constructor(e=Lt.DEFAULT_IMAGE,t=Lt.DEFAULT_MAPPING,n=Xt,s=Xt,r=zt,a=Oi,o=qt,c=Tn,h=Lt.DEFAULT_ANISOTROPY,l=kt){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:nh++}),this.uuid=An(),this.name="",this.source=new dl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=h,this.format=o,this.internalFormat=null,this.type=c,this.offset=new _e(0,0),this.repeat=new _e(1,1),this.center=new _e(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ke,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof l=="string"?this.colorSpace=l:(Ni("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=l===kn?ut:kt),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==tl)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case xs:e.x=e.x-Math.floor(e.x);break;case Xt:e.x=e.x<0?0:1;break;case Lr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case xs:e.y=e.y-Math.floor(e.y);break;case Xt:e.y=e.y<0?0:1;break;case Lr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return Ni("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===ut?kn:cl}set encoding(e){Ni("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===kn?ut:kt}}Lt.DEFAULT_IMAGE=null;Lt.DEFAULT_MAPPING=tl;Lt.DEFAULT_ANISOTROPY=1;class tt{constructor(e=0,t=0,n=0,s=1){tt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const c=e.elements,h=c[0],l=c[4],f=c[8],p=c[1],m=c[5],_=c[9],g=c[2],d=c[6],u=c[10];if(Math.abs(l-p)<.01&&Math.abs(f-g)<.01&&Math.abs(_-d)<.01){if(Math.abs(l+p)<.1&&Math.abs(f+g)<.1&&Math.abs(_+d)<.1&&Math.abs(h+m+u-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const M=(h+1)/2,A=(m+1)/2,P=(u+1)/2,R=(l+p)/4,w=(f+g)/4,H=(_+d)/4;return M>A&&M>P?M<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(M),s=R/n,r=w/n):A>P?A<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(A),n=R/s,r=H/s):P<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(P),n=w/r,s=H/r),this.set(n,s,r,t),this}let E=Math.sqrt((d-_)*(d-_)+(f-g)*(f-g)+(p-l)*(p-l));return Math.abs(E)<.001&&(E=1),this.x=(d-_)/E,this.y=(f-g)/E,this.z=(p-l)/E,this.w=Math.acos((h+m+u-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class ih extends Ti{constructor(e=1,t=1,n={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new tt(0,0,e,t),this.scissorTest=!1,this.viewport=new tt(0,0,e,t);const s={width:e,height:t,depth:1};n.encoding!==void 0&&(Ni("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),n.colorSpace=n.encoding===kn?ut:kt),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:zt,depthBuffer:!0,stencilBuffer:!1,depthTexture:null,samples:0},n),this.texture=new Lt(s,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=n.generateMipmaps,this.texture.internalFormat=n.internalFormat,this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}setSize(e,t,n=1){(this.width!==e||this.height!==t||this.depth!==n)&&(this.width=e,this.height=t,this.depth=n,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=n,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new dl(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Yt extends ih{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class pl extends Lt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=ht,this.minFilter=ht,this.wrapR=Xt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class sh extends Lt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=ht,this.minFilter=ht,this.wrapR=Xt,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Bi{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let c=n[s+0],h=n[s+1],l=n[s+2],f=n[s+3];const p=r[a+0],m=r[a+1],_=r[a+2],g=r[a+3];if(o===0){e[t+0]=c,e[t+1]=h,e[t+2]=l,e[t+3]=f;return}if(o===1){e[t+0]=p,e[t+1]=m,e[t+2]=_,e[t+3]=g;return}if(f!==g||c!==p||h!==m||l!==_){let d=1-o;const u=c*p+h*m+l*_+f*g,E=u>=0?1:-1,M=1-u*u;if(M>Number.EPSILON){const P=Math.sqrt(M),R=Math.atan2(P,u*E);d=Math.sin(d*R)/P,o=Math.sin(o*R)/P}const A=o*E;if(c=c*d+p*A,h=h*d+m*A,l=l*d+_*A,f=f*d+g*A,d===1-o){const P=1/Math.sqrt(c*c+h*h+l*l+f*f);c*=P,h*=P,l*=P,f*=P}}e[t]=c,e[t+1]=h,e[t+2]=l,e[t+3]=f}static multiplyQuaternionsFlat(e,t,n,s,r,a){const o=n[s],c=n[s+1],h=n[s+2],l=n[s+3],f=r[a],p=r[a+1],m=r[a+2],_=r[a+3];return e[t]=o*_+l*f+c*m-h*p,e[t+1]=c*_+l*p+h*f-o*m,e[t+2]=h*_+l*m+o*p-c*f,e[t+3]=l*_-o*f-c*p-h*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,h=o(n/2),l=o(s/2),f=o(r/2),p=c(n/2),m=c(s/2),_=c(r/2);switch(a){case"XYZ":this._x=p*l*f+h*m*_,this._y=h*m*f-p*l*_,this._z=h*l*_+p*m*f,this._w=h*l*f-p*m*_;break;case"YXZ":this._x=p*l*f+h*m*_,this._y=h*m*f-p*l*_,this._z=h*l*_-p*m*f,this._w=h*l*f+p*m*_;break;case"ZXY":this._x=p*l*f-h*m*_,this._y=h*m*f+p*l*_,this._z=h*l*_+p*m*f,this._w=h*l*f-p*m*_;break;case"ZYX":this._x=p*l*f-h*m*_,this._y=h*m*f+p*l*_,this._z=h*l*_-p*m*f,this._w=h*l*f+p*m*_;break;case"YZX":this._x=p*l*f+h*m*_,this._y=h*m*f+p*l*_,this._z=h*l*_-p*m*f,this._w=h*l*f-p*m*_;break;case"XZY":this._x=p*l*f-h*m*_,this._y=h*m*f-p*l*_,this._z=h*l*_+p*m*f,this._w=h*l*f+p*m*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],c=t[9],h=t[2],l=t[6],f=t[10],p=n+o+f;if(p>0){const m=.5/Math.sqrt(p+1);this._w=.25/m,this._x=(l-c)*m,this._y=(r-h)*m,this._z=(a-s)*m}else if(n>o&&n>f){const m=2*Math.sqrt(1+n-o-f);this._w=(l-c)/m,this._x=.25*m,this._y=(s+a)/m,this._z=(r+h)/m}else if(o>f){const m=2*Math.sqrt(1+o-n-f);this._w=(r-h)/m,this._x=(s+a)/m,this._y=.25*m,this._z=(c+l)/m}else{const m=2*Math.sqrt(1+f-n-o);this._w=(a-s)/m,this._x=(r+h)/m,this._y=(c+l)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<Number.EPSILON?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Rt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,c=t._y,h=t._z,l=t._w;return this._x=n*l+a*o+s*h-r*c,this._y=s*l+a*c+r*o-n*h,this._z=r*l+a*h+n*c-s*o,this._w=a*l-n*o-s*c-r*h,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,s=this._y,r=this._z,a=this._w;let o=a*e._w+n*e._x+s*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;const c=1-o*o;if(c<=Number.EPSILON){const m=1-t;return this._w=m*a+t*this._w,this._x=m*n+t*this._x,this._y=m*s+t*this._y,this._z=m*r+t*this._z,this.normalize(),this}const h=Math.sqrt(c),l=Math.atan2(h,o),f=Math.sin((1-t)*l)/h,p=Math.sin(t*l)/h;return this._w=a*f+this._w*p,this._x=n*f+this._x*p,this._y=s*f+this._y*p,this._z=r*f+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=Math.random(),t=Math.sqrt(1-e),n=Math.sqrt(e),s=2*Math.PI*Math.random(),r=2*Math.PI*Math.random();return this.set(t*Math.cos(s),n*Math.sin(r),n*Math.cos(r),t*Math.sin(s))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class b{constructor(e=0,t=0,n=0){b.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Va.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Va.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,c=e.w,h=2*(a*s-o*n),l=2*(o*t-r*s),f=2*(r*n-a*t);return this.x=t+c*h+a*f-o*l,this.y=n+c*l+o*h-r*f,this.z=s+c*f+r*l-a*h,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(e,Math.min(t,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=s*c-r*o,this.y=r*a-n*c,this.z=n*o-s*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return js.copy(this).projectOnVector(e),this.sub(js)}reflect(e){return this.sub(js.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Rt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,n=Math.sqrt(1-e**2);return this.x=n*Math.cos(t),this.y=n*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const js=new b,Va=new Bi;class zi{constructor(e=new b(1/0,1/0,1/0),t=new b(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Gt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Gt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Gt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Gt):Gt.fromBufferAttribute(r,a),Gt.applyMatrix4(e.matrixWorld),this.expandByPoint(Gt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Xi.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Xi.copy(n.boundingBox)),Xi.applyMatrix4(e.matrixWorld),this.union(Xi)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,Gt),Gt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(bi),qi.subVectors(this.max,bi),jn.subVectors(e.a,bi),Zn.subVectors(e.b,bi),Jn.subVectors(e.c,bi),dn.subVectors(Zn,jn),pn.subVectors(Jn,Zn),Pn.subVectors(jn,Jn);let t=[0,-dn.z,dn.y,0,-pn.z,pn.y,0,-Pn.z,Pn.y,dn.z,0,-dn.x,pn.z,0,-pn.x,Pn.z,0,-Pn.x,-dn.y,dn.x,0,-pn.y,pn.x,0,-Pn.y,Pn.x,0];return!Zs(t,jn,Zn,Jn,qi)||(t=[1,0,0,0,1,0,0,0,1],!Zs(t,jn,Zn,Jn,qi))?!1:(Yi.crossVectors(dn,pn),t=[Yi.x,Yi.y,Yi.z],Zs(t,jn,Zn,Jn,qi))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Gt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Gt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Qt[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Qt[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Qt[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Qt[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Qt[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Qt[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Qt[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Qt[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Qt),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const Qt=[new b,new b,new b,new b,new b,new b,new b,new b],Gt=new b,Xi=new zi,jn=new b,Zn=new b,Jn=new b,dn=new b,pn=new b,Pn=new b,bi=new b,qi=new b,Yi=new b,Dn=new b;function Zs(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Dn.fromArray(i,r);const o=s.x*Math.abs(Dn.x)+s.y*Math.abs(Dn.y)+s.z*Math.abs(Dn.z),c=e.dot(Dn),h=t.dot(Dn),l=n.dot(Dn);if(Math.max(-Math.max(c,h,l),Math.min(c,h,l))>o)return!1}return!0}const rh=new zi,Ri=new b,Js=new b;class Cs{constructor(e=new b,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):rh.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ri.subVectors(e,this.center);const t=Ri.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Ri,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Js.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ri.copy(e.center).add(Js)),this.expandByPoint(Ri.copy(e.center).sub(Js))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const en=new b,Qs=new b,Ki=new b,mn=new b,er=new b,$i=new b,tr=new b;class ml{constructor(e=new b,t=new b(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,en)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=en.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(en.copy(this.origin).addScaledVector(this.direction,t),en.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Qs.copy(e).add(t).multiplyScalar(.5),Ki.copy(t).sub(e).normalize(),mn.copy(this.origin).sub(Qs);const r=e.distanceTo(t)*.5,a=-this.direction.dot(Ki),o=mn.dot(this.direction),c=-mn.dot(Ki),h=mn.lengthSq(),l=Math.abs(1-a*a);let f,p,m,_;if(l>0)if(f=a*c-o,p=a*o-c,_=r*l,f>=0)if(p>=-_)if(p<=_){const g=1/l;f*=g,p*=g,m=f*(f+a*p+2*o)+p*(a*f+p+2*c)+h}else p=r,f=Math.max(0,-(a*p+o)),m=-f*f+p*(p+2*c)+h;else p=-r,f=Math.max(0,-(a*p+o)),m=-f*f+p*(p+2*c)+h;else p<=-_?(f=Math.max(0,-(-a*r+o)),p=f>0?-r:Math.min(Math.max(-r,-c),r),m=-f*f+p*(p+2*c)+h):p<=_?(f=0,p=Math.min(Math.max(-r,-c),r),m=p*(p+2*c)+h):(f=Math.max(0,-(a*r+o)),p=f>0?r:Math.min(Math.max(-r,-c),r),m=-f*f+p*(p+2*c)+h);else p=a>0?-r:r,f=Math.max(0,-(a*p+o)),m=-f*f+p*(p+2*c)+h;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(Qs).addScaledVector(Ki,p),m}intersectSphere(e,t){en.subVectors(e.center,this.origin);const n=en.dot(this.direction),s=en.dot(en)-n*n,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,c;const h=1/this.direction.x,l=1/this.direction.y,f=1/this.direction.z,p=this.origin;return h>=0?(n=(e.min.x-p.x)*h,s=(e.max.x-p.x)*h):(n=(e.max.x-p.x)*h,s=(e.min.x-p.x)*h),l>=0?(r=(e.min.y-p.y)*l,a=(e.max.y-p.y)*l):(r=(e.max.y-p.y)*l,a=(e.min.y-p.y)*l),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),f>=0?(o=(e.min.z-p.z)*f,c=(e.max.z-p.z)*f):(o=(e.max.z-p.z)*f,c=(e.min.z-p.z)*f),n>c||o>s)||((o>n||n!==n)&&(n=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,en)!==null}intersectTriangle(e,t,n,s,r){er.subVectors(t,e),$i.subVectors(n,e),tr.crossVectors(er,$i);let a=this.direction.dot(tr),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;mn.subVectors(this.origin,e);const c=o*this.direction.dot($i.crossVectors(mn,$i));if(c<0)return null;const h=o*this.direction.dot(er.cross(mn));if(h<0||c+h>a)return null;const l=-o*mn.dot(tr);return l<0?null:this.at(l/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class at{constructor(e,t,n,s,r,a,o,c,h,l,f,p,m,_,g,d){at.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,h,l,f,p,m,_,g,d)}set(e,t,n,s,r,a,o,c,h,l,f,p,m,_,g,d){const u=this.elements;return u[0]=e,u[4]=t,u[8]=n,u[12]=s,u[1]=r,u[5]=a,u[9]=o,u[13]=c,u[2]=h,u[6]=l,u[10]=f,u[14]=p,u[3]=m,u[7]=_,u[11]=g,u[15]=d,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new at().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,s=1/Qn.setFromMatrixColumn(e,0).length(),r=1/Qn.setFromMatrixColumn(e,1).length(),a=1/Qn.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(s),h=Math.sin(s),l=Math.cos(r),f=Math.sin(r);if(e.order==="XYZ"){const p=a*l,m=a*f,_=o*l,g=o*f;t[0]=c*l,t[4]=-c*f,t[8]=h,t[1]=m+_*h,t[5]=p-g*h,t[9]=-o*c,t[2]=g-p*h,t[6]=_+m*h,t[10]=a*c}else if(e.order==="YXZ"){const p=c*l,m=c*f,_=h*l,g=h*f;t[0]=p+g*o,t[4]=_*o-m,t[8]=a*h,t[1]=a*f,t[5]=a*l,t[9]=-o,t[2]=m*o-_,t[6]=g+p*o,t[10]=a*c}else if(e.order==="ZXY"){const p=c*l,m=c*f,_=h*l,g=h*f;t[0]=p-g*o,t[4]=-a*f,t[8]=_+m*o,t[1]=m+_*o,t[5]=a*l,t[9]=g-p*o,t[2]=-a*h,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){const p=a*l,m=a*f,_=o*l,g=o*f;t[0]=c*l,t[4]=_*h-m,t[8]=p*h+g,t[1]=c*f,t[5]=g*h+p,t[9]=m*h-_,t[2]=-h,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){const p=a*c,m=a*h,_=o*c,g=o*h;t[0]=c*l,t[4]=g-p*f,t[8]=_*f+m,t[1]=f,t[5]=a*l,t[9]=-o*l,t[2]=-h*l,t[6]=m*f+_,t[10]=p-g*f}else if(e.order==="XZY"){const p=a*c,m=a*h,_=o*c,g=o*h;t[0]=c*l,t[4]=-f,t[8]=h*l,t[1]=p*f+g,t[5]=a*l,t[9]=m*f-_,t[2]=_*f-m,t[6]=o*l,t[10]=g*f+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(ah,e,oh)}lookAt(e,t,n){const s=this.elements;return Ut.subVectors(e,t),Ut.lengthSq()===0&&(Ut.z=1),Ut.normalize(),gn.crossVectors(n,Ut),gn.lengthSq()===0&&(Math.abs(n.z)===1?Ut.x+=1e-4:Ut.z+=1e-4,Ut.normalize(),gn.crossVectors(n,Ut)),gn.normalize(),ji.crossVectors(Ut,gn),s[0]=gn.x,s[4]=ji.x,s[8]=Ut.x,s[1]=gn.y,s[5]=ji.y,s[9]=Ut.y,s[2]=gn.z,s[6]=ji.z,s[10]=Ut.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],c=n[8],h=n[12],l=n[1],f=n[5],p=n[9],m=n[13],_=n[2],g=n[6],d=n[10],u=n[14],E=n[3],M=n[7],A=n[11],P=n[15],R=s[0],w=s[4],H=s[8],x=s[12],T=s[1],z=s[5],V=s[9],ee=s[13],L=s[2],F=s[6],G=s[10],Y=s[14],X=s[3],q=s[7],K=s[11],te=s[15];return r[0]=a*R+o*T+c*L+h*X,r[4]=a*w+o*z+c*F+h*q,r[8]=a*H+o*V+c*G+h*K,r[12]=a*x+o*ee+c*Y+h*te,r[1]=l*R+f*T+p*L+m*X,r[5]=l*w+f*z+p*F+m*q,r[9]=l*H+f*V+p*G+m*K,r[13]=l*x+f*ee+p*Y+m*te,r[2]=_*R+g*T+d*L+u*X,r[6]=_*w+g*z+d*F+u*q,r[10]=_*H+g*V+d*G+u*K,r[14]=_*x+g*ee+d*Y+u*te,r[3]=E*R+M*T+A*L+P*X,r[7]=E*w+M*z+A*F+P*q,r[11]=E*H+M*V+A*G+P*K,r[15]=E*x+M*ee+A*Y+P*te,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],c=e[9],h=e[13],l=e[2],f=e[6],p=e[10],m=e[14],_=e[3],g=e[7],d=e[11],u=e[15];return _*(+r*c*f-s*h*f-r*o*p+n*h*p+s*o*m-n*c*m)+g*(+t*c*m-t*h*p+r*a*p-s*a*m+s*h*l-r*c*l)+d*(+t*h*f-t*o*m-r*a*f+n*a*m+r*o*l-n*h*l)+u*(-s*o*l-t*c*f+t*o*p+s*a*f-n*a*p+n*c*l)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],h=e[7],l=e[8],f=e[9],p=e[10],m=e[11],_=e[12],g=e[13],d=e[14],u=e[15],E=f*d*h-g*p*h+g*c*m-o*d*m-f*c*u+o*p*u,M=_*p*h-l*d*h-_*c*m+a*d*m+l*c*u-a*p*u,A=l*g*h-_*f*h+_*o*m-a*g*m-l*o*u+a*f*u,P=_*f*c-l*g*c-_*o*p+a*g*p+l*o*d-a*f*d,R=t*E+n*M+s*A+r*P;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const w=1/R;return e[0]=E*w,e[1]=(g*p*r-f*d*r-g*s*m+n*d*m+f*s*u-n*p*u)*w,e[2]=(o*d*r-g*c*r+g*s*h-n*d*h-o*s*u+n*c*u)*w,e[3]=(f*c*r-o*p*r-f*s*h+n*p*h+o*s*m-n*c*m)*w,e[4]=M*w,e[5]=(l*d*r-_*p*r+_*s*m-t*d*m-l*s*u+t*p*u)*w,e[6]=(_*c*r-a*d*r-_*s*h+t*d*h+a*s*u-t*c*u)*w,e[7]=(a*p*r-l*c*r+l*s*h-t*p*h-a*s*m+t*c*m)*w,e[8]=A*w,e[9]=(_*f*r-l*g*r-_*n*m+t*g*m+l*n*u-t*f*u)*w,e[10]=(a*g*r-_*o*r+_*n*h-t*g*h-a*n*u+t*o*u)*w,e[11]=(l*o*r-a*f*r-l*n*h+t*f*h+a*n*m-t*o*m)*w,e[12]=P*w,e[13]=(l*g*s-_*f*s+_*n*p-t*g*p-l*n*d+t*f*d)*w,e[14]=(_*o*s-a*g*s-_*n*c+t*g*c+a*n*d-t*o*d)*w,e[15]=(a*f*s-l*o*s+l*n*c-t*f*c-a*n*p+t*o*p)*w,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,c=e.z,h=r*a,l=r*o;return this.set(h*a+n,h*o-s*c,h*c+s*o,0,h*o+s*c,l*o+n,l*c-s*a,0,h*c-s*o,l*c+s*a,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,h=r+r,l=a+a,f=o+o,p=r*h,m=r*l,_=r*f,g=a*l,d=a*f,u=o*f,E=c*h,M=c*l,A=c*f,P=n.x,R=n.y,w=n.z;return s[0]=(1-(g+u))*P,s[1]=(m+A)*P,s[2]=(_-M)*P,s[3]=0,s[4]=(m-A)*R,s[5]=(1-(p+u))*R,s[6]=(d+E)*R,s[7]=0,s[8]=(_+M)*w,s[9]=(d-E)*w,s[10]=(1-(p+g))*w,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;let r=Qn.set(s[0],s[1],s[2]).length();const a=Qn.set(s[4],s[5],s[6]).length(),o=Qn.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],Vt.copy(this);const h=1/r,l=1/a,f=1/o;return Vt.elements[0]*=h,Vt.elements[1]*=h,Vt.elements[2]*=h,Vt.elements[4]*=l,Vt.elements[5]*=l,Vt.elements[6]*=l,Vt.elements[8]*=f,Vt.elements[9]*=f,Vt.elements[10]*=f,t.setFromRotationMatrix(Vt),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,s,r,a,o=ln){const c=this.elements,h=2*r/(t-e),l=2*r/(n-s),f=(t+e)/(t-e),p=(n+s)/(n-s);let m,_;if(o===ln)m=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===Es)m=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=l,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=ln){const c=this.elements,h=1/(t-e),l=1/(n-s),f=1/(a-r),p=(t+e)*h,m=(n+s)*l;let _,g;if(o===ln)_=(a+r)*f,g=-2*f;else if(o===Es)_=r*f,g=-1*f;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=2*h,c[4]=0,c[8]=0,c[12]=-p,c[1]=0,c[5]=2*l,c[9]=0,c[13]=-m,c[2]=0,c[6]=0,c[10]=g,c[14]=-_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const Qn=new b,Vt=new at,ah=new b(0,0,0),oh=new b(1,1,1),gn=new b,ji=new b,Ut=new b,Wa=new at,Xa=new Bi;class Ls{constructor(e=0,t=0,n=0,s=Ls.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],a=s[4],o=s[8],c=s[1],h=s[5],l=s[9],f=s[2],p=s[6],m=s[10];switch(t){case"XYZ":this._y=Math.asin(Rt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,m),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(p,h),this._z=0);break;case"YXZ":this._x=Math.asin(-Rt(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(c,h)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(Rt(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-f,m),this._z=Math.atan2(-a,h)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Rt(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(p,m),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,h));break;case"YZX":this._z=Math.asin(Rt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-l,h),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-Rt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(p,h),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-l,m),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Wa.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Wa,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Xa.setFromEuler(this),this.setFromQuaternion(Xa,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ls.DEFAULT_ORDER="XYZ";class gl{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let lh=0;const qa=new b,ei=new Bi,tn=new at,Zi=new b,Ci=new b,ch=new b,hh=new Bi,Ya=new b(1,0,0),Ka=new b(0,1,0),$a=new b(0,0,1),uh={type:"added"},fh={type:"removed"};class yt extends Ti{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:lh++}),this.uuid=An(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=yt.DEFAULT_UP.clone();const e=new b,t=new Ls,n=new Bi,s=new b(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new at},normalMatrix:{value:new ke}}),this.matrix=new at,this.matrixWorld=new at,this.matrixAutoUpdate=yt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new gl,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ei.setFromAxisAngle(e,t),this.quaternion.multiply(ei),this}rotateOnWorldAxis(e,t){return ei.setFromAxisAngle(e,t),this.quaternion.premultiply(ei),this}rotateX(e){return this.rotateOnAxis(Ya,e)}rotateY(e){return this.rotateOnAxis(Ka,e)}rotateZ(e){return this.rotateOnAxis($a,e)}translateOnAxis(e,t){return qa.copy(e).applyQuaternion(this.quaternion),this.position.add(qa.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ya,e)}translateY(e){return this.translateOnAxis(Ka,e)}translateZ(e){return this.translateOnAxis($a,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(tn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Zi.copy(e):Zi.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Ci.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?tn.lookAt(Ci,Zi,this.up):tn.lookAt(Zi,Ci,this.up),this.quaternion.setFromRotationMatrix(tn),s&&(tn.extractRotation(s.matrixWorld),ei.setFromRotationMatrix(tn),this.quaternion.premultiply(ei.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(uh)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(fh)),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),tn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),tn.multiply(e.parent.matrixWorld)),e.applyMatrix4(tn),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ci,e,ch),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ci,hh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++){const r=t[n];(r.matrixWorldAutoUpdate===!0||e===!0)&&r.updateMatrixWorld(e)}}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.matrixWorldAutoUpdate===!0&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++){const o=s[r];o.matrixWorldAutoUpdate===!0&&o.updateWorldMatrix(!1,!0)}}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),s.maxGeometryCount=this._maxGeometryCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let h=0,l=c.length;h<l;h++){const f=c[h];r(e.shapes,f)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,h=this.material.length;c<h;c++)o.push(r(e.materials,this.material[c]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];s.animations.push(r(e.animations,c))}}if(t){const o=a(e.geometries),c=a(e.materials),h=a(e.textures),l=a(e.images),f=a(e.shapes),p=a(e.skeletons),m=a(e.animations),_=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),h.length>0&&(n.textures=h),l.length>0&&(n.images=l),f.length>0&&(n.shapes=f),p.length>0&&(n.skeletons=p),m.length>0&&(n.animations=m),_.length>0&&(n.nodes=_)}return n.object=s,n;function a(o){const c=[];for(const h in o){const l=o[h];delete l.metadata,c.push(l)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}}yt.DEFAULT_UP=new b(0,1,0);yt.DEFAULT_MATRIX_AUTO_UPDATE=!0;yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Wt=new b,nn=new b,nr=new b,sn=new b,ti=new b,ni=new b,ja=new b,ir=new b,sr=new b,rr=new b;let Ji=!1;class Ht{constructor(e=new b,t=new b,n=new b){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Wt.subVectors(e,t),s.cross(Wt);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Wt.subVectors(s,t),nn.subVectors(n,t),nr.subVectors(e,t);const a=Wt.dot(Wt),o=Wt.dot(nn),c=Wt.dot(nr),h=nn.dot(nn),l=nn.dot(nr),f=a*h-o*o;if(f===0)return r.set(0,0,0),null;const p=1/f,m=(h*c-o*l)*p,_=(a*l-o*c)*p;return r.set(1-m-_,_,m)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,sn)===null?!1:sn.x>=0&&sn.y>=0&&sn.x+sn.y<=1}static getUV(e,t,n,s,r,a,o,c){return Ji===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Ji=!0),this.getInterpolation(e,t,n,s,r,a,o,c)}static getInterpolation(e,t,n,s,r,a,o,c){return this.getBarycoord(e,t,n,s,sn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,sn.x),c.addScaledVector(a,sn.y),c.addScaledVector(o,sn.z),c)}static isFrontFacing(e,t,n,s){return Wt.subVectors(n,t),nn.subVectors(e,t),Wt.cross(nn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Wt.subVectors(this.c,this.b),nn.subVectors(this.a,this.b),Wt.cross(nn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Ht.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Ht.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,n,s,r){return Ji===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),Ji=!0),Ht.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}getInterpolation(e,t,n,s,r){return Ht.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return Ht.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Ht.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let a,o;ti.subVectors(s,n),ni.subVectors(r,n),ir.subVectors(e,n);const c=ti.dot(ir),h=ni.dot(ir);if(c<=0&&h<=0)return t.copy(n);sr.subVectors(e,s);const l=ti.dot(sr),f=ni.dot(sr);if(l>=0&&f<=l)return t.copy(s);const p=c*f-l*h;if(p<=0&&c>=0&&l<=0)return a=c/(c-l),t.copy(n).addScaledVector(ti,a);rr.subVectors(e,r);const m=ti.dot(rr),_=ni.dot(rr);if(_>=0&&m<=_)return t.copy(r);const g=m*h-c*_;if(g<=0&&h>=0&&_<=0)return o=h/(h-_),t.copy(n).addScaledVector(ni,o);const d=l*_-m*f;if(d<=0&&f-l>=0&&m-_>=0)return ja.subVectors(r,s),o=(f-l)/(f-l+(m-_)),t.copy(s).addScaledVector(ja,o);const u=1/(d+g+p);return a=g*u,o=p*u,t.copy(n).addScaledVector(ti,a).addScaledVector(ni,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const _l={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},_n={h:0,s:0,l:0},Qi={h:0,s:0,l:0};function ar(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class xe{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ut){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ye.toWorkingColorSpace(this,t),this}setRGB(e,t,n,s=Ye.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ye.toWorkingColorSpace(this,s),this}setHSL(e,t,n,s=Ye.workingColorSpace){if(e=Jc(e,1),t=Rt(t,0,1),n=Rt(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=ar(a,r,e+1/3),this.g=ar(a,r,e),this.b=ar(a,r,e-1/3)}return Ye.toWorkingColorSpace(this,s),this}setStyle(e,t=ut){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ut){const n=_l[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=_i(e.r),this.g=_i(e.g),this.b=_i(e.b),this}copyLinearToSRGB(e){return this.r=Ks(e.r),this.g=Ks(e.g),this.b=Ks(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ut){return Ye.fromWorkingColorSpace(Mt.copy(this),e),Math.round(Rt(Mt.r*255,0,255))*65536+Math.round(Rt(Mt.g*255,0,255))*256+Math.round(Rt(Mt.b*255,0,255))}getHexString(e=ut){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ye.workingColorSpace){Ye.fromWorkingColorSpace(Mt.copy(this),t);const n=Mt.r,s=Mt.g,r=Mt.b,a=Math.max(n,s,r),o=Math.min(n,s,r);let c,h;const l=(o+a)/2;if(o===a)c=0,h=0;else{const f=a-o;switch(h=l<=.5?f/(a+o):f/(2-a-o),a){case n:c=(s-r)/f+(s<r?6:0);break;case s:c=(r-n)/f+2;break;case r:c=(n-s)/f+4;break}c/=6}return e.h=c,e.s=h,e.l=l,e}getRGB(e,t=Ye.workingColorSpace){return Ye.fromWorkingColorSpace(Mt.copy(this),t),e.r=Mt.r,e.g=Mt.g,e.b=Mt.b,e}getStyle(e=ut){Ye.fromWorkingColorSpace(Mt.copy(this),e);const t=Mt.r,n=Mt.g,s=Mt.b;return e!==ut?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(_n),this.setHSL(_n.h+e,_n.s+t,_n.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(_n),e.getHSL(Qi);const n=qs(_n.h,Qi.h,t),s=qs(_n.s,Qi.s,t),r=qs(_n.l,Qi.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Mt=new xe;xe.NAMES=_l;let dh=0;class Rn extends Ti{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:dh++}),this.uuid=An(),this.name="",this.type="Material",this.blending=gi,this.side=bn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=wr,this.blendDst=br,this.blendEquation=Fn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new xe(0,0,0),this.blendAlpha=0,this.depthFunc=vs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Fa,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Kn,this.stencilZFail=Kn,this.stencilZPass=Kn,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==gi&&(n.blending=this.blending),this.side!==bn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==wr&&(n.blendSrc=this.blendSrc),this.blendDst!==br&&(n.blendDst=this.blendDst),this.blendEquation!==Fn&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==vs&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Fa&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Kn&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Kn&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Kn&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const a=[];for(const o in r){const c=r[o];delete c.metadata,a.push(c)}return a}if(t){const r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class cn extends Rn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new xe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Vr,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const ct=new b,es=new _e;class Kt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Pr,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=Mn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)es.fromBufferAttribute(this,t),es.applyMatrix3(e),this.setXY(t,es.x,es.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)ct.fromBufferAttribute(this,t),ct.applyMatrix3(e),this.setXYZ(t,ct.x,ct.y,ct.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)ct.fromBufferAttribute(this,t),ct.applyMatrix4(e),this.setXYZ(t,ct.x,ct.y,ct.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)ct.fromBufferAttribute(this,t),ct.applyNormalMatrix(e),this.setXYZ(t,ct.x,ct.y,ct.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)ct.fromBufferAttribute(this,t),ct.transformDirection(e),this.setXYZ(t,ct.x,ct.y,ct.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=on(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ke(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=on(t,this.array)),t}setX(e,t){return this.normalized&&(t=Ke(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=on(t,this.array)),t}setY(e,t){return this.normalized&&(t=Ke(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=on(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Ke(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=on(t,this.array)),t}setW(e,t){return this.normalized&&(t=Ke(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Ke(t,this.array),n=Ke(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Ke(t,this.array),n=Ke(n,this.array),s=Ke(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Ke(t,this.array),n=Ke(n,this.array),s=Ke(s,this.array),r=Ke(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Pr&&(e.usage=this.usage),e}}class vl extends Kt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class xl extends Kt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class ft extends Kt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let ph=0;const Bt=new at,or=new yt,ii=new b,It=new zi,Li=new zi,_t=new b;class Pt extends Ti{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ph++}),this.uuid=An(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(ul(e)?xl:vl)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new ke().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Bt.makeRotationFromQuaternion(e),this.applyMatrix4(Bt),this}rotateX(e){return Bt.makeRotationX(e),this.applyMatrix4(Bt),this}rotateY(e){return Bt.makeRotationY(e),this.applyMatrix4(Bt),this}rotateZ(e){return Bt.makeRotationZ(e),this.applyMatrix4(Bt),this}translate(e,t,n){return Bt.makeTranslation(e,t,n),this.applyMatrix4(Bt),this}scale(e,t,n){return Bt.makeScale(e,t,n),this.applyMatrix4(Bt),this}lookAt(e){return or.lookAt(e),or.updateMatrix(),this.applyMatrix4(or.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ii).negate(),this.translate(ii.x,ii.y,ii.z),this}setFromPoints(e){const t=[];for(let n=0,s=e.length;n<s;n++){const r=e[n];t.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new ft(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new zi);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new b(-1/0,-1/0,-1/0),new b(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];It.setFromBufferAttribute(r),this.morphTargetsRelative?(_t.addVectors(this.boundingBox.min,It.min),this.boundingBox.expandByPoint(_t),_t.addVectors(this.boundingBox.max,It.max),this.boundingBox.expandByPoint(_t)):(this.boundingBox.expandByPoint(It.min),this.boundingBox.expandByPoint(It.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Cs);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new b,1/0);return}if(e){const n=this.boundingSphere.center;if(It.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];Li.setFromBufferAttribute(o),this.morphTargetsRelative?(_t.addVectors(It.min,Li.min),It.expandByPoint(_t),_t.addVectors(It.max,Li.max),It.expandByPoint(_t)):(It.expandByPoint(Li.min),It.expandByPoint(Li.max))}It.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)_t.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(_t));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],c=this.morphTargetsRelative;for(let h=0,l=o.count;h<l;h++)_t.fromBufferAttribute(o,h),c&&(ii.fromBufferAttribute(e,h),_t.add(ii)),s=Math.max(s,n.distanceToSquared(_t))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.array,s=t.position.array,r=t.normal.array,a=t.uv.array,o=s.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Kt(new Float32Array(4*o),4));const c=this.getAttribute("tangent").array,h=[],l=[];for(let T=0;T<o;T++)h[T]=new b,l[T]=new b;const f=new b,p=new b,m=new b,_=new _e,g=new _e,d=new _e,u=new b,E=new b;function M(T,z,V){f.fromArray(s,T*3),p.fromArray(s,z*3),m.fromArray(s,V*3),_.fromArray(a,T*2),g.fromArray(a,z*2),d.fromArray(a,V*2),p.sub(f),m.sub(f),g.sub(_),d.sub(_);const ee=1/(g.x*d.y-d.x*g.y);isFinite(ee)&&(u.copy(p).multiplyScalar(d.y).addScaledVector(m,-g.y).multiplyScalar(ee),E.copy(m).multiplyScalar(g.x).addScaledVector(p,-d.x).multiplyScalar(ee),h[T].add(u),h[z].add(u),h[V].add(u),l[T].add(E),l[z].add(E),l[V].add(E))}let A=this.groups;A.length===0&&(A=[{start:0,count:n.length}]);for(let T=0,z=A.length;T<z;++T){const V=A[T],ee=V.start,L=V.count;for(let F=ee,G=ee+L;F<G;F+=3)M(n[F+0],n[F+1],n[F+2])}const P=new b,R=new b,w=new b,H=new b;function x(T){w.fromArray(r,T*3),H.copy(w);const z=h[T];P.copy(z),P.sub(w.multiplyScalar(w.dot(z))).normalize(),R.crossVectors(H,z);const ee=R.dot(l[T])<0?-1:1;c[T*4]=P.x,c[T*4+1]=P.y,c[T*4+2]=P.z,c[T*4+3]=ee}for(let T=0,z=A.length;T<z;++T){const V=A[T],ee=V.start,L=V.count;for(let F=ee,G=ee+L;F<G;F+=3)x(n[F+0]),x(n[F+1]),x(n[F+2])}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Kt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let p=0,m=n.count;p<m;p++)n.setXYZ(p,0,0,0);const s=new b,r=new b,a=new b,o=new b,c=new b,h=new b,l=new b,f=new b;if(e)for(let p=0,m=e.count;p<m;p+=3){const _=e.getX(p+0),g=e.getX(p+1),d=e.getX(p+2);s.fromBufferAttribute(t,_),r.fromBufferAttribute(t,g),a.fromBufferAttribute(t,d),l.subVectors(a,r),f.subVectors(s,r),l.cross(f),o.fromBufferAttribute(n,_),c.fromBufferAttribute(n,g),h.fromBufferAttribute(n,d),o.add(l),c.add(l),h.add(l),n.setXYZ(_,o.x,o.y,o.z),n.setXYZ(g,c.x,c.y,c.z),n.setXYZ(d,h.x,h.y,h.z)}else for(let p=0,m=t.count;p<m;p+=3)s.fromBufferAttribute(t,p+0),r.fromBufferAttribute(t,p+1),a.fromBufferAttribute(t,p+2),l.subVectors(a,r),f.subVectors(s,r),l.cross(f),n.setXYZ(p+0,l.x,l.y,l.z),n.setXYZ(p+1,l.x,l.y,l.z),n.setXYZ(p+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)_t.fromBufferAttribute(e,t),_t.normalize(),e.setXYZ(t,_t.x,_t.y,_t.z)}toNonIndexed(){function e(o,c){const h=o.array,l=o.itemSize,f=o.normalized,p=new h.constructor(c.length*l);let m=0,_=0;for(let g=0,d=c.length;g<d;g++){o.isInterleavedBufferAttribute?m=c[g]*o.data.stride+o.offset:m=c[g]*l;for(let u=0;u<l;u++)p[_++]=h[m++]}return new Kt(p,l,f)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Pt,n=this.index.array,s=this.attributes;for(const o in s){const c=s[o],h=e(c,n);t.setAttribute(o,h)}const r=this.morphAttributes;for(const o in r){const c=[],h=r[o];for(let l=0,f=h.length;l<f;l++){const p=h[l],m=e(p,n);c.push(m)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,c=a.length;o<c;o++){const h=a[o];t.addGroup(h.start,h.count,h.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const h in c)c[h]!==void 0&&(e[h]=c[h]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const h=n[c];e.data.attributes[c]=h.toJSON(e.data)}const s={};let r=!1;for(const c in this.morphAttributes){const h=this.morphAttributes[c],l=[];for(let f=0,p=h.length;f<p;f++){const m=h[f];l.push(m.toJSON(e.data))}l.length>0&&(s[c]=l,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone(t));const s=e.attributes;for(const h in s){const l=s[h];this.setAttribute(h,l.clone(t))}const r=e.morphAttributes;for(const h in r){const l=[],f=r[h];for(let p=0,m=f.length;p<m;p++)l.push(f[p].clone(t));this.morphAttributes[h]=l}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let h=0,l=a.length;h<l;h++){const f=a[h];this.addGroup(f.start,f.count,f.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Za=new at,Un=new ml,ts=new Cs,Ja=new b,si=new b,ri=new b,ai=new b,lr=new b,ns=new b,is=new _e,ss=new _e,rs=new _e,Qa=new b,eo=new b,to=new b,as=new b,os=new b;class lt extends yt{constructor(e=new Pt,t=new cn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const o=this.morphTargetInfluences;if(r&&o){ns.set(0,0,0);for(let c=0,h=r.length;c<h;c++){const l=o[c],f=r[c];l!==0&&(lr.fromBufferAttribute(f,e),a?ns.addScaledVector(lr,l):ns.addScaledVector(lr.sub(t),l))}t.add(ns)}return t}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ts.copy(n.boundingSphere),ts.applyMatrix4(r),Un.copy(e.ray).recast(e.near),!(ts.containsPoint(Un.origin)===!1&&(Un.intersectSphere(ts,Ja)===null||Un.origin.distanceToSquared(Ja)>(e.far-e.near)**2))&&(Za.copy(r).invert(),Un.copy(e.ray).applyMatrix4(Za),!(n.boundingBox!==null&&Un.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Un)))}_computeIntersections(e,t,n){let s;const r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,h=r.attributes.uv,l=r.attributes.uv1,f=r.attributes.normal,p=r.groups,m=r.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,g=p.length;_<g;_++){const d=p[_],u=a[d.materialIndex],E=Math.max(d.start,m.start),M=Math.min(o.count,Math.min(d.start+d.count,m.start+m.count));for(let A=E,P=M;A<P;A+=3){const R=o.getX(A),w=o.getX(A+1),H=o.getX(A+2);s=ls(this,u,e,n,h,l,f,R,w,H),s&&(s.faceIndex=Math.floor(A/3),s.face.materialIndex=d.materialIndex,t.push(s))}}else{const _=Math.max(0,m.start),g=Math.min(o.count,m.start+m.count);for(let d=_,u=g;d<u;d+=3){const E=o.getX(d),M=o.getX(d+1),A=o.getX(d+2);s=ls(this,a,e,n,h,l,f,E,M,A),s&&(s.faceIndex=Math.floor(d/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let _=0,g=p.length;_<g;_++){const d=p[_],u=a[d.materialIndex],E=Math.max(d.start,m.start),M=Math.min(c.count,Math.min(d.start+d.count,m.start+m.count));for(let A=E,P=M;A<P;A+=3){const R=A,w=A+1,H=A+2;s=ls(this,u,e,n,h,l,f,R,w,H),s&&(s.faceIndex=Math.floor(A/3),s.face.materialIndex=d.materialIndex,t.push(s))}}else{const _=Math.max(0,m.start),g=Math.min(c.count,m.start+m.count);for(let d=_,u=g;d<u;d+=3){const E=d,M=d+1,A=d+2;s=ls(this,a,e,n,h,l,f,E,M,A),s&&(s.faceIndex=Math.floor(d/3),t.push(s))}}}}function mh(i,e,t,n,s,r,a,o){let c;if(e.side===Ct?c=n.intersectTriangle(a,r,s,!0,o):c=n.intersectTriangle(s,r,a,e.side===bn,o),c===null)return null;os.copy(o),os.applyMatrix4(i.matrixWorld);const h=t.ray.origin.distanceTo(os);return h<t.near||h>t.far?null:{distance:h,point:os.clone(),object:i}}function ls(i,e,t,n,s,r,a,o,c,h){i.getVertexPosition(o,si),i.getVertexPosition(c,ri),i.getVertexPosition(h,ai);const l=mh(i,e,t,n,si,ri,ai,as);if(l){s&&(is.fromBufferAttribute(s,o),ss.fromBufferAttribute(s,c),rs.fromBufferAttribute(s,h),l.uv=Ht.getInterpolation(as,si,ri,ai,is,ss,rs,new _e)),r&&(is.fromBufferAttribute(r,o),ss.fromBufferAttribute(r,c),rs.fromBufferAttribute(r,h),l.uv1=Ht.getInterpolation(as,si,ri,ai,is,ss,rs,new _e),l.uv2=l.uv1),a&&(Qa.fromBufferAttribute(a,o),eo.fromBufferAttribute(a,c),to.fromBufferAttribute(a,h),l.normal=Ht.getInterpolation(as,si,ri,ai,Qa,eo,to,new b),l.normal.dot(n.direction)>0&&l.normal.multiplyScalar(-1));const f={a:o,b:c,c:h,normal:new b,materialIndex:0};Ht.getNormal(si,ri,ai,f.normal),l.face=f}return l}class qn extends Pt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const c=[],h=[],l=[],f=[];let p=0,m=0;_("z","y","x",-1,-1,n,t,e,a,r,0),_("z","y","x",1,-1,n,t,-e,a,r,1),_("x","z","y",1,1,e,n,t,s,a,2),_("x","z","y",1,-1,e,n,-t,s,a,3),_("x","y","z",1,-1,e,t,n,s,r,4),_("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new ft(h,3)),this.setAttribute("normal",new ft(l,3)),this.setAttribute("uv",new ft(f,2));function _(g,d,u,E,M,A,P,R,w,H,x){const T=A/w,z=P/H,V=A/2,ee=P/2,L=R/2,F=w+1,G=H+1;let Y=0,X=0;const q=new b;for(let K=0;K<G;K++){const te=K*z-ee;for(let ne=0;ne<F;ne++){const k=ne*T-V;q[g]=k*E,q[d]=te*M,q[u]=L,h.push(q.x,q.y,q.z),q[g]=0,q[d]=0,q[u]=R>0?1:-1,l.push(q.x,q.y,q.z),f.push(ne/w),f.push(1-K/H),Y+=1}}for(let K=0;K<H;K++)for(let te=0;te<w;te++){const ne=p+te+F*K,k=p+te+F*(K+1),$=p+(te+1)+F*(K+1),le=p+(te+1)+F*K;c.push(ne,k,le),c.push(k,$,le),X+=6}o.addGroup(m,X,x),m+=X,p+=Y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new qn(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Si(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function bt(i){const e={};for(let t=0;t<i.length;t++){const n=Si(i[t]);for(const s in n)e[s]=n[s]}return e}function gh(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Ml(i){return i.getRenderTarget()===null?i.outputColorSpace:Ye.workingColorSpace}const As={clone:Si,merge:bt};var _h=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,vh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ot extends Rn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=_h,this.fragmentShader=vh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1,clipCullDistance:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Si(e.uniforms),this.uniformsGroups=gh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Sl extends yt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new at,this.projectionMatrix=new at,this.projectionMatrixInverse=new at,this.coordinateSystem=ln}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}class Nt extends Sl{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Ur*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Xs*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ur*2*Math.atan(Math.tan(Xs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Xs*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const c=a.fullWidth,h=a.fullHeight;r+=a.offsetX*s/c,t-=a.offsetY*n/h,s*=a.width/c,n*=a.height/h}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const oi=-90,li=1;class xh extends yt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Nt(oi,li,e,t);s.layers=this.layers,this.add(s);const r=new Nt(oi,li,e,t);r.layers=this.layers,this.add(r);const a=new Nt(oi,li,e,t);a.layers=this.layers,this.add(a);const o=new Nt(oi,li,e,t);o.layers=this.layers,this.add(o);const c=new Nt(oi,li,e,t);c.layers=this.layers,this.add(c);const h=new Nt(oi,li,e,t);h.layers=this.layers,this.add(h)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,c]=t;for(const h of t)this.remove(h);if(e===ln)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Es)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const h of t)this.add(h),h.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,c,h,l]=this.children,f=e.getRenderTarget(),p=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;const g=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,a),e.setRenderTarget(n,2,s),e.render(t,o),e.setRenderTarget(n,3,s),e.render(t,c),e.setRenderTarget(n,4,s),e.render(t,h),n.texture.generateMipmaps=g,e.setRenderTarget(n,5,s),e.render(t,l),e.setRenderTarget(f,p,m),e.xr.enabled=_,n.texture.needsPMREMUpdate=!0}}class yl extends Lt{constructor(e,t,n,s,r,a,o,c,h,l){e=e!==void 0?e:[],t=t!==void 0?t:vi,super(e,t,n,s,r,a,o,c,h,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Mh extends Yt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];t.encoding!==void 0&&(Ni("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===kn?ut:kt),this.texture=new yl(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:zt}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new qn(5,5,5),r=new Ot({name:"CubemapFromEquirect",uniforms:Si(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ct,blending:hn});r.uniforms.tEquirect.value=t;const a=new lt(s,r),o=t.minFilter;return t.minFilter===Oi&&(t.minFilter=zt),new xh(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t,n,s){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}}const cr=new b,Sh=new b,yh=new ke;class Nn{constructor(e=new b(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=cr.subVectors(n,t).cross(Sh.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(cr),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||yh.getNormalMatrix(e),s=this.coplanarPoint(cr).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const In=new Cs,cs=new b;class Yr{constructor(e=new Nn,t=new Nn,n=new Nn,s=new Nn,r=new Nn,a=new Nn){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=ln){const n=this.planes,s=e.elements,r=s[0],a=s[1],o=s[2],c=s[3],h=s[4],l=s[5],f=s[6],p=s[7],m=s[8],_=s[9],g=s[10],d=s[11],u=s[12],E=s[13],M=s[14],A=s[15];if(n[0].setComponents(c-r,p-h,d-m,A-u).normalize(),n[1].setComponents(c+r,p+h,d+m,A+u).normalize(),n[2].setComponents(c+a,p+l,d+_,A+E).normalize(),n[3].setComponents(c-a,p-l,d-_,A-E).normalize(),n[4].setComponents(c-o,p-f,d-g,A-M).normalize(),t===ln)n[5].setComponents(c+o,p+f,d+g,A+M).normalize();else if(t===Es)n[5].setComponents(o,f,g,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),In.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),In.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(In)}intersectsSprite(e){return In.center.set(0,0,0),In.radius=.7071067811865476,In.applyMatrix4(e.matrixWorld),this.intersectsSphere(In)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(cs.x=s.normal.x>0?e.max.x:e.min.x,cs.y=s.normal.y>0?e.max.y:e.min.y,cs.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(cs)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function El(){let i=null,e=!1,t=null,n=null;function s(r,a){t(r,a),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Eh(i,e){const t=e.isWebGL2,n=new WeakMap;function s(h,l){const f=h.array,p=h.usage,m=f.byteLength,_=i.createBuffer();i.bindBuffer(l,_),i.bufferData(l,f,p),h.onUploadCallback();let g;if(f instanceof Float32Array)g=i.FLOAT;else if(f instanceof Uint16Array)if(h.isFloat16BufferAttribute)if(t)g=i.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else g=i.UNSIGNED_SHORT;else if(f instanceof Int16Array)g=i.SHORT;else if(f instanceof Uint32Array)g=i.UNSIGNED_INT;else if(f instanceof Int32Array)g=i.INT;else if(f instanceof Int8Array)g=i.BYTE;else if(f instanceof Uint8Array)g=i.UNSIGNED_BYTE;else if(f instanceof Uint8ClampedArray)g=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+f);return{buffer:_,type:g,bytesPerElement:f.BYTES_PER_ELEMENT,version:h.version,size:m}}function r(h,l,f){const p=l.array,m=l._updateRange,_=l.updateRanges;if(i.bindBuffer(f,h),m.count===-1&&_.length===0&&i.bufferSubData(f,0,p),_.length!==0){for(let g=0,d=_.length;g<d;g++){const u=_[g];t?i.bufferSubData(f,u.start*p.BYTES_PER_ELEMENT,p,u.start,u.count):i.bufferSubData(f,u.start*p.BYTES_PER_ELEMENT,p.subarray(u.start,u.start+u.count))}l.clearUpdateRanges()}m.count!==-1&&(t?i.bufferSubData(f,m.offset*p.BYTES_PER_ELEMENT,p,m.offset,m.count):i.bufferSubData(f,m.offset*p.BYTES_PER_ELEMENT,p.subarray(m.offset,m.offset+m.count)),m.count=-1),l.onUploadCallback()}function a(h){return h.isInterleavedBufferAttribute&&(h=h.data),n.get(h)}function o(h){h.isInterleavedBufferAttribute&&(h=h.data);const l=n.get(h);l&&(i.deleteBuffer(l.buffer),n.delete(h))}function c(h,l){if(h.isGLBufferAttribute){const p=n.get(h);(!p||p.version<h.version)&&n.set(h,{buffer:h.buffer,type:h.type,bytesPerElement:h.elementSize,version:h.version});return}h.isInterleavedBufferAttribute&&(h=h.data);const f=n.get(h);if(f===void 0)n.set(h,s(h,l));else if(f.version<h.version){if(f.size!==h.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(f.buffer,h,l),f.version=h.version}}return{get:a,remove:o,update:c}}class Gn extends Pt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,a=t/2,o=Math.floor(n),c=Math.floor(s),h=o+1,l=c+1,f=e/o,p=t/c,m=[],_=[],g=[],d=[];for(let u=0;u<l;u++){const E=u*p-a;for(let M=0;M<h;M++){const A=M*f-r;_.push(A,-E,0),g.push(0,0,1),d.push(M/o),d.push(1-u/c)}}for(let u=0;u<c;u++)for(let E=0;E<o;E++){const M=E+h*u,A=E+h*(u+1),P=E+1+h*(u+1),R=E+1+h*u;m.push(M,A,R),m.push(A,P,R)}this.setIndex(m),this.setAttribute("position",new ft(_,3)),this.setAttribute("normal",new ft(g,3)),this.setAttribute("uv",new ft(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Gn(e.width,e.height,e.widthSegments,e.heightSegments)}}var Th=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Ah=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,wh=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,bh=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Rh=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,Ch=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Lh=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Ph=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Dh=`#ifdef USE_BATCHING
	attribute float batchId;
	uniform highp sampler2D batchingTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Uh=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( batchId );
#endif`,Ih=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Nh=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Oh=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Fh=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Bh=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,zh=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,Hh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,kh=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Gh=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Vh=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Wh=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Xh=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,qh=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,Yh=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Kh=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,$h=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,jh=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Zh=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Jh=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Qh=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,eu="gl_FragColor = linearToOutputTexel( gl_FragColor );",tu=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}
vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}`,nu=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,iu=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,su=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,ru=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,au=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,ou=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,lu=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,cu=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,hu=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,uu=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,fu=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,du=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,pu=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,mu=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,gu=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,_u=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,vu=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,xu=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Mu=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Su=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,yu=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Eu=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Tu=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Au=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,wu=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,bu=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Ru=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Cu=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,Lu=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,Pu=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Du=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Uu=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Iu=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Nu=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Ou=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Fu=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Bu=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,zu=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,Hu=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,ku=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Gu=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Vu=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Wu=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Xu=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,qu=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Yu=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Ku=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,$u=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ju=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Zu=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Ju=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Qu=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,ef=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,tf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,nf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,sf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,rf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,af=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,of=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,lf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,cf=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,hf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,uf=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,ff=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,df=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,pf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,mf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,gf=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,_f=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color *= toneMappingExposure;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	return color;
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,vf=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,xf=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Mf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Sf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,yf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Ef=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Tf=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Af=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,bf=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Rf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Cf=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Lf=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Pf=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,Df=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Uf=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,If=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Nf=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Of=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ff=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Bf=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,zf=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Hf=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,kf=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Gf=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Vf=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wf=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Xf=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,qf=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Yf=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Kf=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,$f=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jf=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Zf=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jf=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Qf=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ed=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,td=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,nd=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,id=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ie={alphahash_fragment:Th,alphahash_pars_fragment:Ah,alphamap_fragment:wh,alphamap_pars_fragment:bh,alphatest_fragment:Rh,alphatest_pars_fragment:Ch,aomap_fragment:Lh,aomap_pars_fragment:Ph,batching_pars_vertex:Dh,batching_vertex:Uh,begin_vertex:Ih,beginnormal_vertex:Nh,bsdfs:Oh,iridescence_fragment:Fh,bumpmap_pars_fragment:Bh,clipping_planes_fragment:zh,clipping_planes_pars_fragment:Hh,clipping_planes_pars_vertex:kh,clipping_planes_vertex:Gh,color_fragment:Vh,color_pars_fragment:Wh,color_pars_vertex:Xh,color_vertex:qh,common:Yh,cube_uv_reflection_fragment:Kh,defaultnormal_vertex:$h,displacementmap_pars_vertex:jh,displacementmap_vertex:Zh,emissivemap_fragment:Jh,emissivemap_pars_fragment:Qh,colorspace_fragment:eu,colorspace_pars_fragment:tu,envmap_fragment:nu,envmap_common_pars_fragment:iu,envmap_pars_fragment:su,envmap_pars_vertex:ru,envmap_physical_pars_fragment:_u,envmap_vertex:au,fog_vertex:ou,fog_pars_vertex:lu,fog_fragment:cu,fog_pars_fragment:hu,gradientmap_pars_fragment:uu,lightmap_fragment:fu,lightmap_pars_fragment:du,lights_lambert_fragment:pu,lights_lambert_pars_fragment:mu,lights_pars_begin:gu,lights_toon_fragment:vu,lights_toon_pars_fragment:xu,lights_phong_fragment:Mu,lights_phong_pars_fragment:Su,lights_physical_fragment:yu,lights_physical_pars_fragment:Eu,lights_fragment_begin:Tu,lights_fragment_maps:Au,lights_fragment_end:wu,logdepthbuf_fragment:bu,logdepthbuf_pars_fragment:Ru,logdepthbuf_pars_vertex:Cu,logdepthbuf_vertex:Lu,map_fragment:Pu,map_pars_fragment:Du,map_particle_fragment:Uu,map_particle_pars_fragment:Iu,metalnessmap_fragment:Nu,metalnessmap_pars_fragment:Ou,morphcolor_vertex:Fu,morphnormal_vertex:Bu,morphtarget_pars_vertex:zu,morphtarget_vertex:Hu,normal_fragment_begin:ku,normal_fragment_maps:Gu,normal_pars_fragment:Vu,normal_pars_vertex:Wu,normal_vertex:Xu,normalmap_pars_fragment:qu,clearcoat_normal_fragment_begin:Yu,clearcoat_normal_fragment_maps:Ku,clearcoat_pars_fragment:$u,iridescence_pars_fragment:ju,opaque_fragment:Zu,packing:Ju,premultiplied_alpha_fragment:Qu,project_vertex:ef,dithering_fragment:tf,dithering_pars_fragment:nf,roughnessmap_fragment:sf,roughnessmap_pars_fragment:rf,shadowmap_pars_fragment:af,shadowmap_pars_vertex:of,shadowmap_vertex:lf,shadowmask_pars_fragment:cf,skinbase_vertex:hf,skinning_pars_vertex:uf,skinning_vertex:ff,skinnormal_vertex:df,specularmap_fragment:pf,specularmap_pars_fragment:mf,tonemapping_fragment:gf,tonemapping_pars_fragment:_f,transmission_fragment:vf,transmission_pars_fragment:xf,uv_pars_fragment:Mf,uv_pars_vertex:Sf,uv_vertex:yf,worldpos_vertex:Ef,background_vert:Tf,background_frag:Af,backgroundCube_vert:wf,backgroundCube_frag:bf,cube_vert:Rf,cube_frag:Cf,depth_vert:Lf,depth_frag:Pf,distanceRGBA_vert:Df,distanceRGBA_frag:Uf,equirect_vert:If,equirect_frag:Nf,linedashed_vert:Of,linedashed_frag:Ff,meshbasic_vert:Bf,meshbasic_frag:zf,meshlambert_vert:Hf,meshlambert_frag:kf,meshmatcap_vert:Gf,meshmatcap_frag:Vf,meshnormal_vert:Wf,meshnormal_frag:Xf,meshphong_vert:qf,meshphong_frag:Yf,meshphysical_vert:Kf,meshphysical_frag:$f,meshtoon_vert:jf,meshtoon_frag:Zf,points_vert:Jf,points_frag:Qf,shadow_vert:ed,shadow_frag:td,sprite_vert:nd,sprite_frag:id},se={common:{diffuse:{value:new xe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ke}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ke}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ke}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ke},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ke},normalScale:{value:new _e(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ke},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ke}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ke}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ke}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new xe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new xe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0},uvTransform:{value:new ke}},sprite:{diffuse:{value:new xe(16777215)},opacity:{value:1},center:{value:new _e(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ke},alphaMap:{value:null},alphaMapTransform:{value:new ke},alphaTest:{value:0}}},jt={basic:{uniforms:bt([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.fog]),vertexShader:Ie.meshbasic_vert,fragmentShader:Ie.meshbasic_frag},lambert:{uniforms:bt([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new xe(0)}}]),vertexShader:Ie.meshlambert_vert,fragmentShader:Ie.meshlambert_frag},phong:{uniforms:bt([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new xe(0)},specular:{value:new xe(1118481)},shininess:{value:30}}]),vertexShader:Ie.meshphong_vert,fragmentShader:Ie.meshphong_frag},standard:{uniforms:bt([se.common,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.roughnessmap,se.metalnessmap,se.fog,se.lights,{emissive:{value:new xe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ie.meshphysical_vert,fragmentShader:Ie.meshphysical_frag},toon:{uniforms:bt([se.common,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.gradientmap,se.fog,se.lights,{emissive:{value:new xe(0)}}]),vertexShader:Ie.meshtoon_vert,fragmentShader:Ie.meshtoon_frag},matcap:{uniforms:bt([se.common,se.bumpmap,se.normalmap,se.displacementmap,se.fog,{matcap:{value:null}}]),vertexShader:Ie.meshmatcap_vert,fragmentShader:Ie.meshmatcap_frag},points:{uniforms:bt([se.points,se.fog]),vertexShader:Ie.points_vert,fragmentShader:Ie.points_frag},dashed:{uniforms:bt([se.common,se.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ie.linedashed_vert,fragmentShader:Ie.linedashed_frag},depth:{uniforms:bt([se.common,se.displacementmap]),vertexShader:Ie.depth_vert,fragmentShader:Ie.depth_frag},normal:{uniforms:bt([se.common,se.bumpmap,se.normalmap,se.displacementmap,{opacity:{value:1}}]),vertexShader:Ie.meshnormal_vert,fragmentShader:Ie.meshnormal_frag},sprite:{uniforms:bt([se.sprite,se.fog]),vertexShader:Ie.sprite_vert,fragmentShader:Ie.sprite_frag},background:{uniforms:{uvTransform:{value:new ke},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ie.background_vert,fragmentShader:Ie.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:Ie.backgroundCube_vert,fragmentShader:Ie.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ie.cube_vert,fragmentShader:Ie.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ie.equirect_vert,fragmentShader:Ie.equirect_frag},distanceRGBA:{uniforms:bt([se.common,se.displacementmap,{referencePosition:{value:new b},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ie.distanceRGBA_vert,fragmentShader:Ie.distanceRGBA_frag},shadow:{uniforms:bt([se.lights,se.fog,{color:{value:new xe(0)},opacity:{value:1}}]),vertexShader:Ie.shadow_vert,fragmentShader:Ie.shadow_frag}};jt.physical={uniforms:bt([jt.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ke},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ke},clearcoatNormalScale:{value:new _e(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ke},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ke},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ke},sheen:{value:0},sheenColor:{value:new xe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ke},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ke},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ke},transmissionSamplerSize:{value:new _e},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ke},attenuationDistance:{value:0},attenuationColor:{value:new xe(0)},specularColor:{value:new xe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ke},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ke},anisotropyVector:{value:new _e},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ke}}]),vertexShader:Ie.meshphysical_vert,fragmentShader:Ie.meshphysical_frag};const hs={r:0,b:0,g:0};function sd(i,e,t,n,s,r,a){const o=new xe(0);let c=r===!0?0:1,h,l,f=null,p=0,m=null;function _(d,u){let E=!1,M=u.isScene===!0?u.background:null;M&&M.isTexture&&(M=(u.backgroundBlurriness>0?t:e).get(M)),M===null?g(o,c):M&&M.isColor&&(g(M,1),E=!0);const A=i.xr.getEnvironmentBlendMode();A==="additive"?n.buffers.color.setClear(0,0,0,1,a):A==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||E)&&i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil),M&&(M.isCubeTexture||M.mapping===bs)?(l===void 0&&(l=new lt(new qn(1,1,1),new Ot({name:"BackgroundCubeMaterial",uniforms:Si(jt.backgroundCube.uniforms),vertexShader:jt.backgroundCube.vertexShader,fragmentShader:jt.backgroundCube.fragmentShader,side:Ct,depthTest:!1,depthWrite:!1,fog:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(P,R,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(l)),l.material.uniforms.envMap.value=M,l.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,l.material.uniforms.backgroundBlurriness.value=u.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=u.backgroundIntensity,l.material.toneMapped=Ye.getTransfer(M.colorSpace)!==Je,(f!==M||p!==M.version||m!==i.toneMapping)&&(l.material.needsUpdate=!0,f=M,p=M.version,m=i.toneMapping),l.layers.enableAll(),d.unshift(l,l.geometry,l.material,0,0,null)):M&&M.isTexture&&(h===void 0&&(h=new lt(new Gn(2,2),new Ot({name:"BackgroundMaterial",uniforms:Si(jt.background.uniforms),vertexShader:jt.background.vertexShader,fragmentShader:jt.background.fragmentShader,side:bn,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),Object.defineProperty(h.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(h)),h.material.uniforms.t2D.value=M,h.material.uniforms.backgroundIntensity.value=u.backgroundIntensity,h.material.toneMapped=Ye.getTransfer(M.colorSpace)!==Je,M.matrixAutoUpdate===!0&&M.updateMatrix(),h.material.uniforms.uvTransform.value.copy(M.matrix),(f!==M||p!==M.version||m!==i.toneMapping)&&(h.material.needsUpdate=!0,f=M,p=M.version,m=i.toneMapping),h.layers.enableAll(),d.unshift(h,h.geometry,h.material,0,0,null))}function g(d,u){d.getRGB(hs,Ml(i)),n.buffers.color.setClear(hs.r,hs.g,hs.b,u,a)}return{getClearColor:function(){return o},setClearColor:function(d,u=1){o.set(d),c=u,g(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(d){c=d,g(o,c)},render:_}}function rd(i,e,t,n){const s=i.getParameter(i.MAX_VERTEX_ATTRIBS),r=n.isWebGL2?null:e.get("OES_vertex_array_object"),a=n.isWebGL2||r!==null,o={},c=d(null);let h=c,l=!1;function f(L,F,G,Y,X){let q=!1;if(a){const K=g(Y,G,F);h!==K&&(h=K,m(h.object)),q=u(L,Y,G,X),q&&E(L,Y,G,X)}else{const K=F.wireframe===!0;(h.geometry!==Y.id||h.program!==G.id||h.wireframe!==K)&&(h.geometry=Y.id,h.program=G.id,h.wireframe=K,q=!0)}X!==null&&t.update(X,i.ELEMENT_ARRAY_BUFFER),(q||l)&&(l=!1,H(L,F,G,Y),X!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(X).buffer))}function p(){return n.isWebGL2?i.createVertexArray():r.createVertexArrayOES()}function m(L){return n.isWebGL2?i.bindVertexArray(L):r.bindVertexArrayOES(L)}function _(L){return n.isWebGL2?i.deleteVertexArray(L):r.deleteVertexArrayOES(L)}function g(L,F,G){const Y=G.wireframe===!0;let X=o[L.id];X===void 0&&(X={},o[L.id]=X);let q=X[F.id];q===void 0&&(q={},X[F.id]=q);let K=q[Y];return K===void 0&&(K=d(p()),q[Y]=K),K}function d(L){const F=[],G=[],Y=[];for(let X=0;X<s;X++)F[X]=0,G[X]=0,Y[X]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:G,attributeDivisors:Y,object:L,attributes:{},index:null}}function u(L,F,G,Y){const X=h.attributes,q=F.attributes;let K=0;const te=G.getAttributes();for(const ne in te)if(te[ne].location>=0){const $=X[ne];let le=q[ne];if(le===void 0&&(ne==="instanceMatrix"&&L.instanceMatrix&&(le=L.instanceMatrix),ne==="instanceColor"&&L.instanceColor&&(le=L.instanceColor)),$===void 0||$.attribute!==le||le&&$.data!==le.data)return!0;K++}return h.attributesNum!==K||h.index!==Y}function E(L,F,G,Y){const X={},q=F.attributes;let K=0;const te=G.getAttributes();for(const ne in te)if(te[ne].location>=0){let $=q[ne];$===void 0&&(ne==="instanceMatrix"&&L.instanceMatrix&&($=L.instanceMatrix),ne==="instanceColor"&&L.instanceColor&&($=L.instanceColor));const le={};le.attribute=$,$&&$.data&&(le.data=$.data),X[ne]=le,K++}h.attributes=X,h.attributesNum=K,h.index=Y}function M(){const L=h.newAttributes;for(let F=0,G=L.length;F<G;F++)L[F]=0}function A(L){P(L,0)}function P(L,F){const G=h.newAttributes,Y=h.enabledAttributes,X=h.attributeDivisors;G[L]=1,Y[L]===0&&(i.enableVertexAttribArray(L),Y[L]=1),X[L]!==F&&((n.isWebGL2?i:e.get("ANGLE_instanced_arrays"))[n.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](L,F),X[L]=F)}function R(){const L=h.newAttributes,F=h.enabledAttributes;for(let G=0,Y=F.length;G<Y;G++)F[G]!==L[G]&&(i.disableVertexAttribArray(G),F[G]=0)}function w(L,F,G,Y,X,q,K){K===!0?i.vertexAttribIPointer(L,F,G,X,q):i.vertexAttribPointer(L,F,G,Y,X,q)}function H(L,F,G,Y){if(n.isWebGL2===!1&&(L.isInstancedMesh||Y.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;M();const X=Y.attributes,q=G.getAttributes(),K=F.defaultAttributeValues;for(const te in q){const ne=q[te];if(ne.location>=0){let k=X[te];if(k===void 0&&(te==="instanceMatrix"&&L.instanceMatrix&&(k=L.instanceMatrix),te==="instanceColor"&&L.instanceColor&&(k=L.instanceColor)),k!==void 0){const $=k.normalized,le=k.itemSize,ge=t.get(k);if(ge===void 0)continue;const me=ge.buffer,Le=ge.type,De=ge.bytesPerElement,Te=n.isWebGL2===!0&&(Le===i.INT||Le===i.UNSIGNED_INT||k.gpuType===nl);if(k.isInterleavedBufferAttribute){const We=k.data,U=We.stride,Et=k.offset;if(We.isInstancedInterleavedBuffer){for(let Me=0;Me<ne.locationSize;Me++)P(ne.location+Me,We.meshPerAttribute);L.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=We.meshPerAttribute*We.count)}else for(let Me=0;Me<ne.locationSize;Me++)A(ne.location+Me);i.bindBuffer(i.ARRAY_BUFFER,me);for(let Me=0;Me<ne.locationSize;Me++)w(ne.location+Me,le/ne.locationSize,Le,$,U*De,(Et+le/ne.locationSize*Me)*De,Te)}else{if(k.isInstancedBufferAttribute){for(let We=0;We<ne.locationSize;We++)P(ne.location+We,k.meshPerAttribute);L.isInstancedMesh!==!0&&Y._maxInstanceCount===void 0&&(Y._maxInstanceCount=k.meshPerAttribute*k.count)}else for(let We=0;We<ne.locationSize;We++)A(ne.location+We);i.bindBuffer(i.ARRAY_BUFFER,me);for(let We=0;We<ne.locationSize;We++)w(ne.location+We,le/ne.locationSize,Le,$,le*De,le/ne.locationSize*We*De,Te)}}else if(K!==void 0){const $=K[te];if($!==void 0)switch($.length){case 2:i.vertexAttrib2fv(ne.location,$);break;case 3:i.vertexAttrib3fv(ne.location,$);break;case 4:i.vertexAttrib4fv(ne.location,$);break;default:i.vertexAttrib1fv(ne.location,$)}}}}R()}function x(){V();for(const L in o){const F=o[L];for(const G in F){const Y=F[G];for(const X in Y)_(Y[X].object),delete Y[X];delete F[G]}delete o[L]}}function T(L){if(o[L.id]===void 0)return;const F=o[L.id];for(const G in F){const Y=F[G];for(const X in Y)_(Y[X].object),delete Y[X];delete F[G]}delete o[L.id]}function z(L){for(const F in o){const G=o[F];if(G[L.id]===void 0)continue;const Y=G[L.id];for(const X in Y)_(Y[X].object),delete Y[X];delete G[L.id]}}function V(){ee(),l=!0,h!==c&&(h=c,m(h.object))}function ee(){c.geometry=null,c.program=null,c.wireframe=!1}return{setup:f,reset:V,resetDefaultState:ee,dispose:x,releaseStatesOfGeometry:T,releaseStatesOfProgram:z,initAttributes:M,enableAttribute:A,disableUnusedAttributes:R}}function ad(i,e,t,n){const s=n.isWebGL2;let r;function a(l){r=l}function o(l,f){i.drawArrays(r,l,f),t.update(f,r,1)}function c(l,f,p){if(p===0)return;let m,_;if(s)m=i,_="drawArraysInstanced";else if(m=e.get("ANGLE_instanced_arrays"),_="drawArraysInstancedANGLE",m===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}m[_](r,l,f,p),t.update(f,r,p)}function h(l,f,p){if(p===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let _=0;_<p;_++)this.render(l[_],f[_]);else{m.multiDrawArraysWEBGL(r,l,0,f,0,p);let _=0;for(let g=0;g<p;g++)_+=f[g];t.update(_,r,1)}}this.setMode=a,this.render=o,this.renderInstances=c,this.renderMultiDraw=h}function od(i,e,t){let n;function s(){if(n!==void 0)return n;if(e.has("EXT_texture_filter_anisotropic")===!0){const w=e.get("EXT_texture_filter_anisotropic");n=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function r(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}const a=typeof WebGL2RenderingContext<"u"&&i.constructor.name==="WebGL2RenderingContext";let o=t.precision!==void 0?t.precision:"highp";const c=r(o);c!==o&&(console.warn("THREE.WebGLRenderer:",o,"not supported, using",c,"instead."),o=c);const h=a||e.has("WEBGL_draw_buffers"),l=t.logarithmicDepthBuffer===!0,f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),m=i.getParameter(i.MAX_TEXTURE_SIZE),_=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),d=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),u=i.getParameter(i.MAX_VARYING_VECTORS),E=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),M=p>0,A=a||e.has("OES_texture_float"),P=M&&A,R=a?i.getParameter(i.MAX_SAMPLES):0;return{isWebGL2:a,drawBuffers:h,getMaxAnisotropy:s,getMaxPrecision:r,precision:o,logarithmicDepthBuffer:l,maxTextures:f,maxVertexTextures:p,maxTextureSize:m,maxCubemapSize:_,maxAttributes:g,maxVertexUniforms:d,maxVaryings:u,maxFragmentUniforms:E,vertexTextures:M,floatFragmentTextures:A,floatVertexTextures:P,maxSamples:R}}function ld(i){const e=this;let t=null,n=0,s=!1,r=!1;const a=new Nn,o=new ke,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(f,p){const m=f.length!==0||p||n!==0||s;return s=p,n=f.length,m},this.beginShadows=function(){r=!0,l(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,p){t=l(f,p,0)},this.setState=function(f,p,m){const _=f.clippingPlanes,g=f.clipIntersection,d=f.clipShadows,u=i.get(f);if(!s||_===null||_.length===0||r&&!d)r?l(null):h();else{const E=r?0:n,M=E*4;let A=u.clippingState||null;c.value=A,A=l(_,p,M,m);for(let P=0;P!==M;++P)A[P]=t[P];u.clippingState=A,this.numIntersection=g?this.numPlanes:0,this.numPlanes+=E}};function h(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function l(f,p,m,_){const g=f!==null?f.length:0;let d=null;if(g!==0){if(d=c.value,_!==!0||d===null){const u=m+g*4,E=p.matrixWorldInverse;o.getNormalMatrix(E),(d===null||d.length<u)&&(d=new Float32Array(u));for(let M=0,A=m;M!==g;++M,A+=4)a.copy(f[M]).applyMatrix4(E,o),a.normal.toArray(d,A),d[A+3]=a.constant}c.value=d,c.needsUpdate=!0}return e.numPlanes=g,e.numIntersection=0,d}}function cd(i){let e=new WeakMap;function t(a,o){return o===Rr?a.mapping=vi:o===Cr&&(a.mapping=xi),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===Rr||o===Cr)if(e.has(a)){const c=e.get(a).texture;return t(c,a.mapping)}else{const c=a.image;if(c&&c.height>0){const h=new Mh(c.height/2);return h.fromEquirectangularTexture(i,a),e.set(a,h),a.addEventListener("dispose",s),t(h.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const c=e.get(o);c!==void 0&&(e.delete(o),c.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}class Tl extends Sl{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=s+t,c=s-t;if(this.view!==null&&this.view.enabled){const h=(this.right-this.left)/this.view.fullWidth/this.zoom,l=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=h*this.view.offsetX,a=r+h*this.view.width,o-=l*this.view.offsetY,c=o-l*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const pi=4,no=[.125,.215,.35,.446,.526,.582],Bn=20,hr=new Tl,io=new xe;let ur=null,fr=0,dr=0;const On=(1+Math.sqrt(5))/2,ci=1/On,so=[new b(1,1,1),new b(-1,1,1),new b(1,1,-1),new b(-1,1,-1),new b(0,On,ci),new b(0,On,-ci),new b(ci,0,On),new b(-ci,0,On),new b(On,ci,0),new b(-On,ci,0)];class ro{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100){ur=this._renderer.getRenderTarget(),fr=this._renderer.getActiveCubeFace(),dr=this._renderer.getActiveMipmapLevel(),this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,n,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=lo(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=oo(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(ur,fr,dr),e.scissorTest=!1,us(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===vi||e.mapping===xi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),ur=this._renderer.getRenderTarget(),fr=this._renderer.getActiveCubeFace(),dr=this._renderer.getActiveMipmapLevel();const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:zt,minFilter:zt,generateMipmaps:!1,type:un,format:qt,colorSpace:fn,depthBuffer:!1},s=ao(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ao(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=hd(r)),this._blurMaterial=ud(r,e,t)}return s}_compileMaterial(e){const t=new lt(this._lodPlanes[0],e);this._renderer.compile(t,hr)}_sceneToCubeUV(e,t,n,s){const o=new Nt(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],l=this._renderer,f=l.autoClear,p=l.toneMapping;l.getClearColor(io),l.toneMapping=En,l.autoClear=!1;const m=new cn({name:"PMREM.Background",side:Ct,depthWrite:!1,depthTest:!1}),_=new lt(new qn,m);let g=!1;const d=e.background;d?d.isColor&&(m.color.copy(d),e.background=null,g=!0):(m.color.copy(io),g=!0);for(let u=0;u<6;u++){const E=u%3;E===0?(o.up.set(0,c[u],0),o.lookAt(h[u],0,0)):E===1?(o.up.set(0,0,c[u]),o.lookAt(0,h[u],0)):(o.up.set(0,c[u],0),o.lookAt(0,0,h[u]));const M=this._cubeSize;us(s,E*M,u>2?M:0,M,M),l.setRenderTarget(s),g&&l.render(_,o),l.render(e,o)}_.geometry.dispose(),_.material.dispose(),l.toneMapping=p,l.autoClear=f,e.background=d}_textureToCubeUV(e,t){const n=this._renderer,s=e.mapping===vi||e.mapping===xi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=lo()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=oo());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new lt(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=e;const c=this._cubeSize;us(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,hr)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;for(let s=1;s<this._lodPlanes.length;s++){const r=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=so[(s-1)%so.length];this._blur(e,s-1,s,r,a)}t.autoClear=n}_blur(e,t,n,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,s,"latitudinal",r),this._halfBlur(a,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,a,o){const c=this._renderer,h=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const l=3,f=new lt(this._lodPlanes[s],h),p=h.uniforms,m=this._sizeLods[n]-1,_=isFinite(r)?Math.PI/(2*m):2*Math.PI/(2*Bn-1),g=r/_,d=isFinite(r)?1+Math.floor(l*g):Bn;d>Bn&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${d} samples when the maximum is set to ${Bn}`);const u=[];let E=0;for(let w=0;w<Bn;++w){const H=w/g,x=Math.exp(-H*H/2);u.push(x),w===0?E+=x:w<d&&(E+=2*x)}for(let w=0;w<u.length;w++)u[w]=u[w]/E;p.envMap.value=e.texture,p.samples.value=d,p.weights.value=u,p.latitudinal.value=a==="latitudinal",o&&(p.poleAxis.value=o);const{_lodMax:M}=this;p.dTheta.value=_,p.mipInt.value=M-n;const A=this._sizeLods[s],P=3*A*(s>M-pi?s-M+pi:0),R=4*(this._cubeSize-A);us(t,P,R,3*A,2*A),c.setRenderTarget(t),c.render(f,hr)}}function hd(i){const e=[],t=[],n=[];let s=i;const r=i-pi+1+no.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);t.push(o);let c=1/o;a>i-pi?c=no[a-i+pi-1]:a===0&&(c=0),n.push(c);const h=1/(o-2),l=-h,f=1+h,p=[l,l,f,l,f,f,l,l,f,f,l,f],m=6,_=6,g=3,d=2,u=1,E=new Float32Array(g*_*m),M=new Float32Array(d*_*m),A=new Float32Array(u*_*m);for(let R=0;R<m;R++){const w=R%3*2/3-1,H=R>2?0:-1,x=[w,H,0,w+2/3,H,0,w+2/3,H+1,0,w,H,0,w+2/3,H+1,0,w,H+1,0];E.set(x,g*_*R),M.set(p,d*_*R);const T=[R,R,R,R,R,R];A.set(T,u*_*R)}const P=new Pt;P.setAttribute("position",new Kt(E,g)),P.setAttribute("uv",new Kt(M,d)),P.setAttribute("faceIndex",new Kt(A,u)),e.push(P),s>pi&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function ao(i,e,t){const n=new Yt(i,e,t);return n.texture.mapping=bs,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function us(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function ud(i,e,t){const n=new Float32Array(Bn),s=new b(0,1,0);return new Ot({name:"SphericalGaussianBlur",defines:{n:Bn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Kr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:hn,depthTest:!1,depthWrite:!1})}function oo(){return new Ot({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Kr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:hn,depthTest:!1,depthWrite:!1})}function lo(){return new Ot({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Kr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:hn,depthTest:!1,depthWrite:!1})}function Kr(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function fd(i){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const c=o.mapping,h=c===Rr||c===Cr,l=c===vi||c===xi;if(h||l)if(o.isRenderTargetTexture&&o.needsPMREMUpdate===!0){o.needsPMREMUpdate=!1;let f=e.get(o);return t===null&&(t=new ro(i)),f=h?t.fromEquirectangular(o,f):t.fromCubemap(o,f),e.set(o,f),f.texture}else{if(e.has(o))return e.get(o).texture;{const f=o.image;if(h&&f&&f.height>0||l&&f&&s(f)){t===null&&(t=new ro(i));const p=h?t.fromEquirectangular(o):t.fromCubemap(o);return e.set(o,p),o.addEventListener("dispose",r),p.texture}else return null}}}return o}function s(o){let c=0;const h=6;for(let l=0;l<h;l++)o[l]!==void 0&&c++;return c===h}function r(o){const c=o.target;c.removeEventListener("dispose",r);const h=e.get(c);h!==void 0&&(e.delete(c),h.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function dd(i){const e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(n){n.isWebGL2?(t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance")):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(n){const s=t(n);return s===null&&console.warn("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function pd(i,e,t,n){const s={},r=new WeakMap;function a(f){const p=f.target;p.index!==null&&e.remove(p.index);for(const _ in p.attributes)e.remove(p.attributes[_]);for(const _ in p.morphAttributes){const g=p.morphAttributes[_];for(let d=0,u=g.length;d<u;d++)e.remove(g[d])}p.removeEventListener("dispose",a),delete s[p.id];const m=r.get(p);m&&(e.remove(m),r.delete(p)),n.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function o(f,p){return s[p.id]===!0||(p.addEventListener("dispose",a),s[p.id]=!0,t.memory.geometries++),p}function c(f){const p=f.attributes;for(const _ in p)e.update(p[_],i.ARRAY_BUFFER);const m=f.morphAttributes;for(const _ in m){const g=m[_];for(let d=0,u=g.length;d<u;d++)e.update(g[d],i.ARRAY_BUFFER)}}function h(f){const p=[],m=f.index,_=f.attributes.position;let g=0;if(m!==null){const E=m.array;g=m.version;for(let M=0,A=E.length;M<A;M+=3){const P=E[M+0],R=E[M+1],w=E[M+2];p.push(P,R,R,w,w,P)}}else if(_!==void 0){const E=_.array;g=_.version;for(let M=0,A=E.length/3-1;M<A;M+=3){const P=M+0,R=M+1,w=M+2;p.push(P,R,R,w,w,P)}}else return;const d=new(ul(p)?xl:vl)(p,1);d.version=g;const u=r.get(f);u&&e.remove(u),r.set(f,d)}function l(f){const p=r.get(f);if(p){const m=f.index;m!==null&&p.version<m.version&&h(f)}else h(f);return r.get(f)}return{get:o,update:c,getWireframeAttribute:l}}function md(i,e,t,n){const s=n.isWebGL2;let r;function a(m){r=m}let o,c;function h(m){o=m.type,c=m.bytesPerElement}function l(m,_){i.drawElements(r,_,o,m*c),t.update(_,r,1)}function f(m,_,g){if(g===0)return;let d,u;if(s)d=i,u="drawElementsInstanced";else if(d=e.get("ANGLE_instanced_arrays"),u="drawElementsInstancedANGLE",d===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}d[u](r,_,o,m*c,g),t.update(_,r,g)}function p(m,_,g){if(g===0)return;const d=e.get("WEBGL_multi_draw");if(d===null)for(let u=0;u<g;u++)this.render(m[u]/c,_[u]);else{d.multiDrawElementsWEBGL(r,_,0,o,m,0,g);let u=0;for(let E=0;E<g;E++)u+=_[E];t.update(u,r,1)}}this.setMode=a,this.setIndex=h,this.render=l,this.renderInstances=f,this.renderMultiDraw=p}function gd(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function _d(i,e){return i[0]-e[0]}function vd(i,e){return Math.abs(e[1])-Math.abs(i[1])}function xd(i,e,t){const n={},s=new Float32Array(8),r=new WeakMap,a=new tt,o=[];for(let h=0;h<8;h++)o[h]=[h,0];function c(h,l,f){const p=h.morphTargetInfluences;if(e.isWebGL2===!0){const _=l.morphAttributes.position||l.morphAttributes.normal||l.morphAttributes.color,g=_!==void 0?_.length:0;let d=r.get(l);if(d===void 0||d.count!==g){let F=function(){ee.dispose(),r.delete(l),l.removeEventListener("dispose",F)};var m=F;d!==void 0&&d.texture.dispose();const M=l.morphAttributes.position!==void 0,A=l.morphAttributes.normal!==void 0,P=l.morphAttributes.color!==void 0,R=l.morphAttributes.position||[],w=l.morphAttributes.normal||[],H=l.morphAttributes.color||[];let x=0;M===!0&&(x=1),A===!0&&(x=2),P===!0&&(x=3);let T=l.attributes.position.count*x,z=1;T>e.maxTextureSize&&(z=Math.ceil(T/e.maxTextureSize),T=e.maxTextureSize);const V=new Float32Array(T*z*4*g),ee=new pl(V,T,z,g);ee.type=Mn,ee.needsUpdate=!0;const L=x*4;for(let G=0;G<g;G++){const Y=R[G],X=w[G],q=H[G],K=T*z*4*G;for(let te=0;te<Y.count;te++){const ne=te*L;M===!0&&(a.fromBufferAttribute(Y,te),V[K+ne+0]=a.x,V[K+ne+1]=a.y,V[K+ne+2]=a.z,V[K+ne+3]=0),A===!0&&(a.fromBufferAttribute(X,te),V[K+ne+4]=a.x,V[K+ne+5]=a.y,V[K+ne+6]=a.z,V[K+ne+7]=0),P===!0&&(a.fromBufferAttribute(q,te),V[K+ne+8]=a.x,V[K+ne+9]=a.y,V[K+ne+10]=a.z,V[K+ne+11]=q.itemSize===4?a.w:1)}}d={count:g,texture:ee,size:new _e(T,z)},r.set(l,d),l.addEventListener("dispose",F)}let u=0;for(let M=0;M<p.length;M++)u+=p[M];const E=l.morphTargetsRelative?1:1-u;f.getUniforms().setValue(i,"morphTargetBaseInfluence",E),f.getUniforms().setValue(i,"morphTargetInfluences",p),f.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),f.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}else{const _=p===void 0?0:p.length;let g=n[l.id];if(g===void 0||g.length!==_){g=[];for(let A=0;A<_;A++)g[A]=[A,0];n[l.id]=g}for(let A=0;A<_;A++){const P=g[A];P[0]=A,P[1]=p[A]}g.sort(vd);for(let A=0;A<8;A++)A<_&&g[A][1]?(o[A][0]=g[A][0],o[A][1]=g[A][1]):(o[A][0]=Number.MAX_SAFE_INTEGER,o[A][1]=0);o.sort(_d);const d=l.morphAttributes.position,u=l.morphAttributes.normal;let E=0;for(let A=0;A<8;A++){const P=o[A],R=P[0],w=P[1];R!==Number.MAX_SAFE_INTEGER&&w?(d&&l.getAttribute("morphTarget"+A)!==d[R]&&l.setAttribute("morphTarget"+A,d[R]),u&&l.getAttribute("morphNormal"+A)!==u[R]&&l.setAttribute("morphNormal"+A,u[R]),s[A]=w,E+=w):(d&&l.hasAttribute("morphTarget"+A)===!0&&l.deleteAttribute("morphTarget"+A),u&&l.hasAttribute("morphNormal"+A)===!0&&l.deleteAttribute("morphNormal"+A),s[A]=0)}const M=l.morphTargetsRelative?1:1-E;f.getUniforms().setValue(i,"morphTargetBaseInfluence",M),f.getUniforms().setValue(i,"morphTargetInfluences",s)}}return{update:c}}function Md(i,e,t,n){let s=new WeakMap;function r(c){const h=n.render.frame,l=c.geometry,f=e.get(c,l);if(s.get(f)!==h&&(e.update(f),s.set(f,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),s.get(c)!==h&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),s.set(c,h))),c.isSkinnedMesh){const p=c.skeleton;s.get(p)!==h&&(p.update(),s.set(p,h))}return f}function a(){s=new WeakMap}function o(c){const h=c.target;h.removeEventListener("dispose",o),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:r,dispose:a}}class Al extends Lt{constructor(e,t,n,s,r,a,o,c,h,l){if(l=l!==void 0?l:Hn,l!==Hn&&l!==Mi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&l===Hn&&(n=xn),n===void 0&&l===Mi&&(n=zn),super(null,s,r,a,o,c,l,n,h),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=o!==void 0?o:ht,this.minFilter=c!==void 0?c:ht,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const wl=new Lt,bl=new Al(1,1);bl.compareFunction=hl;const Rl=new pl,Cl=new sh,Ll=new yl,co=[],ho=[],uo=new Float32Array(16),fo=new Float32Array(9),po=new Float32Array(4);function Ai(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=co[s];if(r===void 0&&(r=new Float32Array(s),co[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function dt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function pt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Ps(i,e){let t=ho[e];t===void 0&&(t=new Int32Array(e),ho[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Sd(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function yd(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dt(t,e))return;i.uniform2fv(this.addr,e),pt(t,e)}}function Ed(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(dt(t,e))return;i.uniform3fv(this.addr,e),pt(t,e)}}function Td(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dt(t,e))return;i.uniform4fv(this.addr,e),pt(t,e)}}function Ad(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(dt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),pt(t,e)}else{if(dt(t,n))return;po.set(n),i.uniformMatrix2fv(this.addr,!1,po),pt(t,n)}}function wd(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(dt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),pt(t,e)}else{if(dt(t,n))return;fo.set(n),i.uniformMatrix3fv(this.addr,!1,fo),pt(t,n)}}function bd(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(dt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),pt(t,e)}else{if(dt(t,n))return;uo.set(n),i.uniformMatrix4fv(this.addr,!1,uo),pt(t,n)}}function Rd(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Cd(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dt(t,e))return;i.uniform2iv(this.addr,e),pt(t,e)}}function Ld(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(dt(t,e))return;i.uniform3iv(this.addr,e),pt(t,e)}}function Pd(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dt(t,e))return;i.uniform4iv(this.addr,e),pt(t,e)}}function Dd(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Ud(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dt(t,e))return;i.uniform2uiv(this.addr,e),pt(t,e)}}function Id(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(dt(t,e))return;i.uniform3uiv(this.addr,e),pt(t,e)}}function Nd(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dt(t,e))return;i.uniform4uiv(this.addr,e),pt(t,e)}}function Od(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);const r=this.type===i.SAMPLER_2D_SHADOW?bl:wl;t.setTexture2D(e||r,s)}function Fd(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Cl,s)}function Bd(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Ll,s)}function zd(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Rl,s)}function Hd(i){switch(i){case 5126:return Sd;case 35664:return yd;case 35665:return Ed;case 35666:return Td;case 35674:return Ad;case 35675:return wd;case 35676:return bd;case 5124:case 35670:return Rd;case 35667:case 35671:return Cd;case 35668:case 35672:return Ld;case 35669:case 35673:return Pd;case 5125:return Dd;case 36294:return Ud;case 36295:return Id;case 36296:return Nd;case 35678:case 36198:case 36298:case 36306:case 35682:return Od;case 35679:case 36299:case 36307:return Fd;case 35680:case 36300:case 36308:case 36293:return Bd;case 36289:case 36303:case 36311:case 36292:return zd}}function kd(i,e){i.uniform1fv(this.addr,e)}function Gd(i,e){const t=Ai(e,this.size,2);i.uniform2fv(this.addr,t)}function Vd(i,e){const t=Ai(e,this.size,3);i.uniform3fv(this.addr,t)}function Wd(i,e){const t=Ai(e,this.size,4);i.uniform4fv(this.addr,t)}function Xd(i,e){const t=Ai(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function qd(i,e){const t=Ai(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Yd(i,e){const t=Ai(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Kd(i,e){i.uniform1iv(this.addr,e)}function $d(i,e){i.uniform2iv(this.addr,e)}function jd(i,e){i.uniform3iv(this.addr,e)}function Zd(i,e){i.uniform4iv(this.addr,e)}function Jd(i,e){i.uniform1uiv(this.addr,e)}function Qd(i,e){i.uniform2uiv(this.addr,e)}function ep(i,e){i.uniform3uiv(this.addr,e)}function tp(i,e){i.uniform4uiv(this.addr,e)}function np(i,e,t){const n=this.cache,s=e.length,r=Ps(t,s);dt(n,r)||(i.uniform1iv(this.addr,r),pt(n,r));for(let a=0;a!==s;++a)t.setTexture2D(e[a]||wl,r[a])}function ip(i,e,t){const n=this.cache,s=e.length,r=Ps(t,s);dt(n,r)||(i.uniform1iv(this.addr,r),pt(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Cl,r[a])}function sp(i,e,t){const n=this.cache,s=e.length,r=Ps(t,s);dt(n,r)||(i.uniform1iv(this.addr,r),pt(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||Ll,r[a])}function rp(i,e,t){const n=this.cache,s=e.length,r=Ps(t,s);dt(n,r)||(i.uniform1iv(this.addr,r),pt(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Rl,r[a])}function ap(i){switch(i){case 5126:return kd;case 35664:return Gd;case 35665:return Vd;case 35666:return Wd;case 35674:return Xd;case 35675:return qd;case 35676:return Yd;case 5124:case 35670:return Kd;case 35667:case 35671:return $d;case 35668:case 35672:return jd;case 35669:case 35673:return Zd;case 5125:return Jd;case 36294:return Qd;case 36295:return ep;case 36296:return tp;case 35678:case 36198:case 36298:case 36306:case 35682:return np;case 35679:case 36299:case 36307:return ip;case 35680:case 36300:case 36308:case 36293:return sp;case 36289:case 36303:case 36311:case 36292:return rp}}class op{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Hd(t.type)}}class lp{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=ap(t.type)}}class cp{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(e,t[o.id],n)}}}const pr=/(\w+)(\])?(\[|\.)?/g;function mo(i,e){i.seq.push(e),i.map[e.id]=e}function hp(i,e,t){const n=i.name,s=n.length;for(pr.lastIndex=0;;){const r=pr.exec(n),a=pr.lastIndex;let o=r[1];const c=r[2]==="]",h=r[3];if(c&&(o=o|0),h===void 0||h==="["&&a+2===s){mo(t,h===void 0?new op(o,i,e):new lp(o,i,e));break}else{let f=t.map[o];f===void 0&&(f=new cp(o),mo(t,f)),t=f}}}class _s{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=e.getActiveUniform(t,s),a=e.getUniformLocation(t,r.name);hp(r,a,this)}}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){const o=t[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in t&&n.push(a)}return n}}function go(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const up=37297;let fp=0;function dp(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}function pp(i){const e=Ye.getPrimaries(Ye.workingColorSpace),t=Ye.getPrimaries(i);let n;switch(e===t?n="":e===ys&&t===Ss?n="LinearDisplayP3ToLinearSRGB":e===Ss&&t===ys&&(n="LinearSRGBToLinearDisplayP3"),i){case fn:case Rs:return[n,"LinearTransferOETF"];case ut:case qr:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function _o(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),s=i.getShaderInfoLog(e).trim();if(n&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const a=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+dp(i.getShaderSource(e),a)}else return s}function mp(i,e){const t=pp(e);return`vec4 ${i}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`}function gp(i,e){let t;switch(e){case bc:t="Linear";break;case Rc:t="Reinhard";break;case Cc:t="OptimizedCineon";break;case Lc:t="ACESFilmic";break;case Dc:t="AgX";break;case Pc:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function _p(i){return[i.extensionDerivatives||i.envMapCubeUVHeight||i.bumpMap||i.normalMapTangentSpace||i.clearcoatNormalMap||i.flatShading||i.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(i.extensionFragDepth||i.logarithmicDepthBuffer)&&i.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",i.extensionDrawBuffers&&i.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(i.extensionShaderTextureLOD||i.envMap||i.transmission)&&i.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter(mi).join(`
`)}function vp(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":""].filter(mi).join(`
`)}function xp(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Mp(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),a=r.name;let o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function mi(i){return i!==""}function vo(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function xo(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Sp=/^[ \t]*#include +<([\w\d./]+)>/gm;function Nr(i){return i.replace(Sp,Ep)}const yp=new Map([["encodings_fragment","colorspace_fragment"],["encodings_pars_fragment","colorspace_pars_fragment"],["output_fragment","opaque_fragment"]]);function Ep(i,e){let t=Ie[e];if(t===void 0){const n=yp.get(e);if(n!==void 0)t=Ie[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Nr(t)}const Tp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Mo(i){return i.replace(Tp,Ap)}function Ap(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function So(i){let e="precision "+i.precision+` float;
precision `+i.precision+" int;";return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function wp(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===el?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===tc?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===rn&&(e="SHADOWMAP_TYPE_VSM"),e}function bp(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case vi:case xi:e="ENVMAP_TYPE_CUBE";break;case bs:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Rp(i){let e="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case xi:e="ENVMAP_MODE_REFRACTION";break}return e}function Cp(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Vr:e="ENVMAP_BLENDING_MULTIPLY";break;case Ac:e="ENVMAP_BLENDING_MIX";break;case wc:e="ENVMAP_BLENDING_ADD";break}return e}function Lp(i){const e=i.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function Pp(i,e,t,n){const s=i.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const c=wp(t),h=bp(t),l=Rp(t),f=Cp(t),p=Lp(t),m=t.isWebGL2?"":_p(t),_=vp(t),g=xp(r),d=s.createProgram();let u,E,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(u=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(mi).join(`
`),u.length>0&&(u+=`
`),E=[m,"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(mi).join(`
`),E.length>0&&(E+=`
`)):(u=[So(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(mi).join(`
`),E=[m,So(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.envMap?"#define "+l:"",t.envMap?"#define "+f:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==En?"#define TONE_MAPPING":"",t.toneMapping!==En?Ie.tonemapping_pars_fragment:"",t.toneMapping!==En?gp("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ie.colorspace_pars_fragment,mp("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(mi).join(`
`)),a=Nr(a),a=vo(a,t),a=xo(a,t),o=Nr(o),o=vo(o,t),o=xo(o,t),a=Mo(a),o=Mo(o),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,u=[_,"precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+u,E=["precision mediump sampler2DArray;","#define varying in",t.glslVersion===Ba?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Ba?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+E);const A=M+u+a,P=M+E+o,R=go(s,s.VERTEX_SHADER,A),w=go(s,s.FRAGMENT_SHADER,P);s.attachShader(d,R),s.attachShader(d,w),t.index0AttributeName!==void 0?s.bindAttribLocation(d,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(d,0,"position"),s.linkProgram(d);function H(V){if(i.debug.checkShaderErrors){const ee=s.getProgramInfoLog(d).trim(),L=s.getShaderInfoLog(R).trim(),F=s.getShaderInfoLog(w).trim();let G=!0,Y=!0;if(s.getProgramParameter(d,s.LINK_STATUS)===!1)if(G=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,d,R,w);else{const X=_o(s,R,"vertex"),q=_o(s,w,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(d,s.VALIDATE_STATUS)+`

Program Info Log: `+ee+`
`+X+`
`+q)}else ee!==""?console.warn("THREE.WebGLProgram: Program Info Log:",ee):(L===""||F==="")&&(Y=!1);Y&&(V.diagnostics={runnable:G,programLog:ee,vertexShader:{log:L,prefix:u},fragmentShader:{log:F,prefix:E}})}s.deleteShader(R),s.deleteShader(w),x=new _s(s,d),T=Mp(s,d)}let x;this.getUniforms=function(){return x===void 0&&H(this),x};let T;this.getAttributes=function(){return T===void 0&&H(this),T};let z=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return z===!1&&(z=s.getProgramParameter(d,up)),z},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(d),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=fp++,this.cacheKey=e,this.usedTimes=1,this.program=d,this.vertexShader=R,this.fragmentShader=w,this}let Dp=0;class Up{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new Ip(e),t.set(e,n)),n}}class Ip{constructor(e){this.id=Dp++,this.code=e,this.usedTimes=0}}function Np(i,e,t,n,s,r,a){const o=new gl,c=new Up,h=[],l=s.isWebGL2,f=s.logarithmicDepthBuffer,p=s.vertexTextures;let m=s.precision;const _={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return x===0?"uv":`uv${x}`}function d(x,T,z,V,ee){const L=V.fog,F=ee.geometry,G=x.isMeshStandardMaterial?V.environment:null,Y=(x.isMeshStandardMaterial?t:e).get(x.envMap||G),X=Y&&Y.mapping===bs?Y.image.height:null,q=_[x.type];x.precision!==null&&(m=s.getMaxPrecision(x.precision),m!==x.precision&&console.warn("THREE.WebGLProgram.getParameters:",x.precision,"not supported, using",m,"instead."));const K=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,te=K!==void 0?K.length:0;let ne=0;F.morphAttributes.position!==void 0&&(ne=1),F.morphAttributes.normal!==void 0&&(ne=2),F.morphAttributes.color!==void 0&&(ne=3);let k,$,le,ge;if(q){const Tt=jt[q];k=Tt.vertexShader,$=Tt.fragmentShader}else k=x.vertexShader,$=x.fragmentShader,c.update(x),le=c.getVertexShaderID(x),ge=c.getFragmentShaderID(x);const me=i.getRenderTarget(),Le=ee.isInstancedMesh===!0,De=ee.isBatchedMesh===!0,Te=!!x.map,We=!!x.matcap,U=!!Y,Et=!!x.aoMap,Me=!!x.lightMap,Re=!!x.bumpMap,fe=!!x.normalMap,nt=!!x.displacementMap,Ne=!!x.emissiveMap,y=!!x.metalnessMap,v=!!x.roughnessMap,N=x.anisotropy>0,J=x.clearcoat>0,Z=x.iridescence>0,Q=x.sheen>0,de=x.transmission>0,oe=N&&!!x.anisotropyMap,he=J&&!!x.clearcoatMap,Ee=J&&!!x.clearcoatNormalMap,Oe=J&&!!x.clearcoatRoughnessMap,j=Z&&!!x.iridescenceMap,qe=Z&&!!x.iridescenceThicknessMap,Ge=Q&&!!x.sheenColorMap,be=Q&&!!x.sheenRoughnessMap,ve=!!x.specularMap,ue=!!x.specularColorMap,Ue=!!x.specularIntensityMap,Xe=de&&!!x.transmissionMap,st=de&&!!x.thicknessMap,ze=!!x.gradientMap,ie=!!x.alphaMap,C=x.alphaTest>0,re=!!x.alphaHash,ae=!!x.extensions,Ae=!!F.attributes.uv1,Se=!!F.attributes.uv2,$e=!!F.attributes.uv3;let je=En;return x.toneMapped&&(me===null||me.isXRRenderTarget===!0)&&(je=i.toneMapping),{isWebGL2:l,shaderID:q,shaderType:x.type,shaderName:x.name,vertexShader:k,fragmentShader:$,defines:x.defines,customVertexShaderID:le,customFragmentShaderID:ge,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:m,batching:De,instancing:Le,instancingColor:Le&&ee.instanceColor!==null,supportsVertexTextures:p,outputColorSpace:me===null?i.outputColorSpace:me.isXRRenderTarget===!0?me.texture.colorSpace:fn,map:Te,matcap:We,envMap:U,envMapMode:U&&Y.mapping,envMapCubeUVHeight:X,aoMap:Et,lightMap:Me,bumpMap:Re,normalMap:fe,displacementMap:p&&nt,emissiveMap:Ne,normalMapObjectSpace:fe&&x.normalMapType===Wc,normalMapTangentSpace:fe&&x.normalMapType===Xr,metalnessMap:y,roughnessMap:v,anisotropy:N,anisotropyMap:oe,clearcoat:J,clearcoatMap:he,clearcoatNormalMap:Ee,clearcoatRoughnessMap:Oe,iridescence:Z,iridescenceMap:j,iridescenceThicknessMap:qe,sheen:Q,sheenColorMap:Ge,sheenRoughnessMap:be,specularMap:ve,specularColorMap:ue,specularIntensityMap:Ue,transmission:de,transmissionMap:Xe,thicknessMap:st,gradientMap:ze,opaque:x.transparent===!1&&x.blending===gi,alphaMap:ie,alphaTest:C,alphaHash:re,combine:x.combine,mapUv:Te&&g(x.map.channel),aoMapUv:Et&&g(x.aoMap.channel),lightMapUv:Me&&g(x.lightMap.channel),bumpMapUv:Re&&g(x.bumpMap.channel),normalMapUv:fe&&g(x.normalMap.channel),displacementMapUv:nt&&g(x.displacementMap.channel),emissiveMapUv:Ne&&g(x.emissiveMap.channel),metalnessMapUv:y&&g(x.metalnessMap.channel),roughnessMapUv:v&&g(x.roughnessMap.channel),anisotropyMapUv:oe&&g(x.anisotropyMap.channel),clearcoatMapUv:he&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:Ee&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Oe&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:j&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:qe&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:Ge&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:be&&g(x.sheenRoughnessMap.channel),specularMapUv:ve&&g(x.specularMap.channel),specularColorMapUv:ue&&g(x.specularColorMap.channel),specularIntensityMapUv:Ue&&g(x.specularIntensityMap.channel),transmissionMapUv:Xe&&g(x.transmissionMap.channel),thicknessMapUv:st&&g(x.thicknessMap.channel),alphaMapUv:ie&&g(x.alphaMap.channel),vertexTangents:!!F.attributes.tangent&&(fe||N),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,vertexUv1s:Ae,vertexUv2s:Se,vertexUv3s:$e,pointsUvs:ee.isPoints===!0&&!!F.attributes.uv&&(Te||ie),fog:!!L,useFog:x.fog===!0,fogExp2:L&&L.isFogExp2,flatShading:x.flatShading===!0,sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:f,skinning:ee.isSkinnedMesh===!0,morphTargets:F.morphAttributes.position!==void 0,morphNormals:F.morphAttributes.normal!==void 0,morphColors:F.morphAttributes.color!==void 0,morphTargetsCount:te,morphTextureStride:ne,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&z.length>0,shadowMapType:i.shadowMap.type,toneMapping:je,useLegacyLights:i._useLegacyLights,decodeVideoTexture:Te&&x.map.isVideoTexture===!0&&Ye.getTransfer(x.map.colorSpace)===Je,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===an,flipSided:x.side===Ct,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionDerivatives:ae&&x.extensions.derivatives===!0,extensionFragDepth:ae&&x.extensions.fragDepth===!0,extensionDrawBuffers:ae&&x.extensions.drawBuffers===!0,extensionShaderTextureLOD:ae&&x.extensions.shaderTextureLOD===!0,extensionClipCullDistance:ae&&x.extensions.clipCullDistance&&n.has("WEBGL_clip_cull_distance"),rendererExtensionFragDepth:l||n.has("EXT_frag_depth"),rendererExtensionDrawBuffers:l||n.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:l||n.has("EXT_shader_texture_lod"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()}}function u(x){const T=[];if(x.shaderID?T.push(x.shaderID):(T.push(x.customVertexShaderID),T.push(x.customFragmentShaderID)),x.defines!==void 0)for(const z in x.defines)T.push(z),T.push(x.defines[z]);return x.isRawShaderMaterial===!1&&(E(T,x),M(T,x),T.push(i.outputColorSpace)),T.push(x.customProgramCacheKey),T.join()}function E(x,T){x.push(T.precision),x.push(T.outputColorSpace),x.push(T.envMapMode),x.push(T.envMapCubeUVHeight),x.push(T.mapUv),x.push(T.alphaMapUv),x.push(T.lightMapUv),x.push(T.aoMapUv),x.push(T.bumpMapUv),x.push(T.normalMapUv),x.push(T.displacementMapUv),x.push(T.emissiveMapUv),x.push(T.metalnessMapUv),x.push(T.roughnessMapUv),x.push(T.anisotropyMapUv),x.push(T.clearcoatMapUv),x.push(T.clearcoatNormalMapUv),x.push(T.clearcoatRoughnessMapUv),x.push(T.iridescenceMapUv),x.push(T.iridescenceThicknessMapUv),x.push(T.sheenColorMapUv),x.push(T.sheenRoughnessMapUv),x.push(T.specularMapUv),x.push(T.specularColorMapUv),x.push(T.specularIntensityMapUv),x.push(T.transmissionMapUv),x.push(T.thicknessMapUv),x.push(T.combine),x.push(T.fogExp2),x.push(T.sizeAttenuation),x.push(T.morphTargetsCount),x.push(T.morphAttributeCount),x.push(T.numDirLights),x.push(T.numPointLights),x.push(T.numSpotLights),x.push(T.numSpotLightMaps),x.push(T.numHemiLights),x.push(T.numRectAreaLights),x.push(T.numDirLightShadows),x.push(T.numPointLightShadows),x.push(T.numSpotLightShadows),x.push(T.numSpotLightShadowsWithMaps),x.push(T.numLightProbes),x.push(T.shadowMapType),x.push(T.toneMapping),x.push(T.numClippingPlanes),x.push(T.numClipIntersection),x.push(T.depthPacking)}function M(x,T){o.disableAll(),T.isWebGL2&&o.enable(0),T.supportsVertexTextures&&o.enable(1),T.instancing&&o.enable(2),T.instancingColor&&o.enable(3),T.matcap&&o.enable(4),T.envMap&&o.enable(5),T.normalMapObjectSpace&&o.enable(6),T.normalMapTangentSpace&&o.enable(7),T.clearcoat&&o.enable(8),T.iridescence&&o.enable(9),T.alphaTest&&o.enable(10),T.vertexColors&&o.enable(11),T.vertexAlphas&&o.enable(12),T.vertexUv1s&&o.enable(13),T.vertexUv2s&&o.enable(14),T.vertexUv3s&&o.enable(15),T.vertexTangents&&o.enable(16),T.anisotropy&&o.enable(17),T.alphaHash&&o.enable(18),T.batching&&o.enable(19),x.push(o.mask),o.disableAll(),T.fog&&o.enable(0),T.useFog&&o.enable(1),T.flatShading&&o.enable(2),T.logarithmicDepthBuffer&&o.enable(3),T.skinning&&o.enable(4),T.morphTargets&&o.enable(5),T.morphNormals&&o.enable(6),T.morphColors&&o.enable(7),T.premultipliedAlpha&&o.enable(8),T.shadowMapEnabled&&o.enable(9),T.useLegacyLights&&o.enable(10),T.doubleSided&&o.enable(11),T.flipSided&&o.enable(12),T.useDepthPacking&&o.enable(13),T.dithering&&o.enable(14),T.transmission&&o.enable(15),T.sheen&&o.enable(16),T.opaque&&o.enable(17),T.pointsUvs&&o.enable(18),T.decodeVideoTexture&&o.enable(19),x.push(o.mask)}function A(x){const T=_[x.type];let z;if(T){const V=jt[T];z=As.clone(V.uniforms)}else z=x.uniforms;return z}function P(x,T){let z;for(let V=0,ee=h.length;V<ee;V++){const L=h[V];if(L.cacheKey===T){z=L,++z.usedTimes;break}}return z===void 0&&(z=new Pp(i,T,x,r),h.push(z)),z}function R(x){if(--x.usedTimes===0){const T=h.indexOf(x);h[T]=h[h.length-1],h.pop(),x.destroy()}}function w(x){c.remove(x)}function H(){c.dispose()}return{getParameters:d,getProgramCacheKey:u,getUniforms:A,acquireProgram:P,releaseProgram:R,releaseShaderCache:w,programs:h,dispose:H}}function Op(){let i=new WeakMap;function e(r){let a=i.get(r);return a===void 0&&(a={},i.set(r,a)),a}function t(r){i.delete(r)}function n(r,a,o){i.get(r)[a]=o}function s(){i=new WeakMap}return{get:e,remove:t,update:n,dispose:s}}function Fp(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function yo(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Eo(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(f,p,m,_,g,d){let u=i[e];return u===void 0?(u={id:f.id,object:f,geometry:p,material:m,groupOrder:_,renderOrder:f.renderOrder,z:g,group:d},i[e]=u):(u.id=f.id,u.object=f,u.geometry=p,u.material=m,u.groupOrder=_,u.renderOrder=f.renderOrder,u.z=g,u.group=d),e++,u}function o(f,p,m,_,g,d){const u=a(f,p,m,_,g,d);m.transmission>0?n.push(u):m.transparent===!0?s.push(u):t.push(u)}function c(f,p,m,_,g,d){const u=a(f,p,m,_,g,d);m.transmission>0?n.unshift(u):m.transparent===!0?s.unshift(u):t.unshift(u)}function h(f,p){t.length>1&&t.sort(f||Fp),n.length>1&&n.sort(p||yo),s.length>1&&s.sort(p||yo)}function l(){for(let f=e,p=i.length;f<p;f++){const m=i[f];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:o,unshift:c,finish:l,sort:h}}function Bp(){let i=new WeakMap;function e(n,s){const r=i.get(n);let a;return r===void 0?(a=new Eo,i.set(n,[a])):s>=r.length?(a=new Eo,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function zp(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new b,color:new xe};break;case"SpotLight":t={position:new b,direction:new b,color:new xe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new b,color:new xe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new b,skyColor:new xe,groundColor:new xe};break;case"RectAreaLight":t={color:new xe,position:new b,halfWidth:new b,halfHeight:new b};break}return i[e.id]=t,t}}}function Hp(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _e};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _e};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new _e,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let kp=0;function Gp(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Vp(i,e){const t=new zp,n=Hp(),s={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)s.probe.push(new b);const r=new b,a=new at,o=new at;function c(l,f){let p=0,m=0,_=0;for(let V=0;V<9;V++)s.probe[V].set(0,0,0);let g=0,d=0,u=0,E=0,M=0,A=0,P=0,R=0,w=0,H=0,x=0;l.sort(Gp);const T=f===!0?Math.PI:1;for(let V=0,ee=l.length;V<ee;V++){const L=l[V],F=L.color,G=L.intensity,Y=L.distance,X=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)p+=F.r*G*T,m+=F.g*G*T,_+=F.b*G*T;else if(L.isLightProbe){for(let q=0;q<9;q++)s.probe[q].addScaledVector(L.sh.coefficients[q],G);x++}else if(L.isDirectionalLight){const q=t.get(L);if(q.color.copy(L.color).multiplyScalar(L.intensity*T),L.castShadow){const K=L.shadow,te=n.get(L);te.shadowBias=K.bias,te.shadowNormalBias=K.normalBias,te.shadowRadius=K.radius,te.shadowMapSize=K.mapSize,s.directionalShadow[g]=te,s.directionalShadowMap[g]=X,s.directionalShadowMatrix[g]=L.shadow.matrix,A++}s.directional[g]=q,g++}else if(L.isSpotLight){const q=t.get(L);q.position.setFromMatrixPosition(L.matrixWorld),q.color.copy(F).multiplyScalar(G*T),q.distance=Y,q.coneCos=Math.cos(L.angle),q.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),q.decay=L.decay,s.spot[u]=q;const K=L.shadow;if(L.map&&(s.spotLightMap[w]=L.map,w++,K.updateMatrices(L),L.castShadow&&H++),s.spotLightMatrix[u]=K.matrix,L.castShadow){const te=n.get(L);te.shadowBias=K.bias,te.shadowNormalBias=K.normalBias,te.shadowRadius=K.radius,te.shadowMapSize=K.mapSize,s.spotShadow[u]=te,s.spotShadowMap[u]=X,R++}u++}else if(L.isRectAreaLight){const q=t.get(L);q.color.copy(F).multiplyScalar(G),q.halfWidth.set(L.width*.5,0,0),q.halfHeight.set(0,L.height*.5,0),s.rectArea[E]=q,E++}else if(L.isPointLight){const q=t.get(L);if(q.color.copy(L.color).multiplyScalar(L.intensity*T),q.distance=L.distance,q.decay=L.decay,L.castShadow){const K=L.shadow,te=n.get(L);te.shadowBias=K.bias,te.shadowNormalBias=K.normalBias,te.shadowRadius=K.radius,te.shadowMapSize=K.mapSize,te.shadowCameraNear=K.camera.near,te.shadowCameraFar=K.camera.far,s.pointShadow[d]=te,s.pointShadowMap[d]=X,s.pointShadowMatrix[d]=L.shadow.matrix,P++}s.point[d]=q,d++}else if(L.isHemisphereLight){const q=t.get(L);q.skyColor.copy(L.color).multiplyScalar(G*T),q.groundColor.copy(L.groundColor).multiplyScalar(G*T),s.hemi[M]=q,M++}}E>0&&(e.isWebGL2?i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=se.LTC_FLOAT_1,s.rectAreaLTC2=se.LTC_FLOAT_2):(s.rectAreaLTC1=se.LTC_HALF_1,s.rectAreaLTC2=se.LTC_HALF_2):i.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=se.LTC_FLOAT_1,s.rectAreaLTC2=se.LTC_FLOAT_2):i.has("OES_texture_half_float_linear")===!0?(s.rectAreaLTC1=se.LTC_HALF_1,s.rectAreaLTC2=se.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),s.ambient[0]=p,s.ambient[1]=m,s.ambient[2]=_;const z=s.hash;(z.directionalLength!==g||z.pointLength!==d||z.spotLength!==u||z.rectAreaLength!==E||z.hemiLength!==M||z.numDirectionalShadows!==A||z.numPointShadows!==P||z.numSpotShadows!==R||z.numSpotMaps!==w||z.numLightProbes!==x)&&(s.directional.length=g,s.spot.length=u,s.rectArea.length=E,s.point.length=d,s.hemi.length=M,s.directionalShadow.length=A,s.directionalShadowMap.length=A,s.pointShadow.length=P,s.pointShadowMap.length=P,s.spotShadow.length=R,s.spotShadowMap.length=R,s.directionalShadowMatrix.length=A,s.pointShadowMatrix.length=P,s.spotLightMatrix.length=R+w-H,s.spotLightMap.length=w,s.numSpotLightShadowsWithMaps=H,s.numLightProbes=x,z.directionalLength=g,z.pointLength=d,z.spotLength=u,z.rectAreaLength=E,z.hemiLength=M,z.numDirectionalShadows=A,z.numPointShadows=P,z.numSpotShadows=R,z.numSpotMaps=w,z.numLightProbes=x,s.version=kp++)}function h(l,f){let p=0,m=0,_=0,g=0,d=0;const u=f.matrixWorldInverse;for(let E=0,M=l.length;E<M;E++){const A=l[E];if(A.isDirectionalLight){const P=s.directional[p];P.direction.setFromMatrixPosition(A.matrixWorld),r.setFromMatrixPosition(A.target.matrixWorld),P.direction.sub(r),P.direction.transformDirection(u),p++}else if(A.isSpotLight){const P=s.spot[_];P.position.setFromMatrixPosition(A.matrixWorld),P.position.applyMatrix4(u),P.direction.setFromMatrixPosition(A.matrixWorld),r.setFromMatrixPosition(A.target.matrixWorld),P.direction.sub(r),P.direction.transformDirection(u),_++}else if(A.isRectAreaLight){const P=s.rectArea[g];P.position.setFromMatrixPosition(A.matrixWorld),P.position.applyMatrix4(u),o.identity(),a.copy(A.matrixWorld),a.premultiply(u),o.extractRotation(a),P.halfWidth.set(A.width*.5,0,0),P.halfHeight.set(0,A.height*.5,0),P.halfWidth.applyMatrix4(o),P.halfHeight.applyMatrix4(o),g++}else if(A.isPointLight){const P=s.point[m];P.position.setFromMatrixPosition(A.matrixWorld),P.position.applyMatrix4(u),m++}else if(A.isHemisphereLight){const P=s.hemi[d];P.direction.setFromMatrixPosition(A.matrixWorld),P.direction.transformDirection(u),d++}}}return{setup:c,setupView:h,state:s}}function To(i,e){const t=new Vp(i,e),n=[],s=[];function r(){n.length=0,s.length=0}function a(f){n.push(f)}function o(f){s.push(f)}function c(f){t.setup(n,f)}function h(f){t.setupView(n,f)}return{init:r,state:{lightsArray:n,shadowsArray:s,lights:t},setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o}}function Wp(i,e){let t=new WeakMap;function n(r,a=0){const o=t.get(r);let c;return o===void 0?(c=new To(i,e),t.set(r,[c])):a>=o.length?(c=new To(i,e),o.push(c)):c=o[a],c}function s(){t=new WeakMap}return{get:n,dispose:s}}class Xp extends Rn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Gc,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class qp extends Rn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Yp=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Kp=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function $p(i,e,t){let n=new Yr;const s=new _e,r=new _e,a=new tt,o=new Xp({depthPacking:Vc}),c=new qp,h={},l=t.maxTextureSize,f={[bn]:Ct,[Ct]:bn,[an]:an},p=new Ot({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new _e},radius:{value:4}},vertexShader:Yp,fragmentShader:Kp}),m=p.clone();m.defines.HORIZONTAL_PASS=1;const _=new Pt;_.setAttribute("position",new Kt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const g=new lt(_,p),d=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=el;let u=this.type;this.render=function(R,w,H){if(d.enabled===!1||d.autoUpdate===!1&&d.needsUpdate===!1||R.length===0)return;const x=i.getRenderTarget(),T=i.getActiveCubeFace(),z=i.getActiveMipmapLevel(),V=i.state;V.setBlending(hn),V.buffers.color.setClear(1,1,1,1),V.buffers.depth.setTest(!0),V.setScissorTest(!1);const ee=u!==rn&&this.type===rn,L=u===rn&&this.type!==rn;for(let F=0,G=R.length;F<G;F++){const Y=R[F],X=Y.shadow;if(X===void 0){console.warn("THREE.WebGLShadowMap:",Y,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;s.copy(X.mapSize);const q=X.getFrameExtents();if(s.multiply(q),r.copy(X.mapSize),(s.x>l||s.y>l)&&(s.x>l&&(r.x=Math.floor(l/q.x),s.x=r.x*q.x,X.mapSize.x=r.x),s.y>l&&(r.y=Math.floor(l/q.y),s.y=r.y*q.y,X.mapSize.y=r.y)),X.map===null||ee===!0||L===!0){const te=this.type!==rn?{minFilter:ht,magFilter:ht}:{};X.map!==null&&X.map.dispose(),X.map=new Yt(s.x,s.y,te),X.map.texture.name=Y.name+".shadowMap",X.camera.updateProjectionMatrix()}i.setRenderTarget(X.map),i.clear();const K=X.getViewportCount();for(let te=0;te<K;te++){const ne=X.getViewport(te);a.set(r.x*ne.x,r.y*ne.y,r.x*ne.z,r.y*ne.w),V.viewport(a),X.updateMatrices(Y,te),n=X.getFrustum(),A(w,H,X.camera,Y,this.type)}X.isPointLightShadow!==!0&&this.type===rn&&E(X,H),X.needsUpdate=!1}u=this.type,d.needsUpdate=!1,i.setRenderTarget(x,T,z)};function E(R,w){const H=e.update(g);p.defines.VSM_SAMPLES!==R.blurSamples&&(p.defines.VSM_SAMPLES=R.blurSamples,m.defines.VSM_SAMPLES=R.blurSamples,p.needsUpdate=!0,m.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new Yt(s.x,s.y)),p.uniforms.shadow_pass.value=R.map.texture,p.uniforms.resolution.value=R.mapSize,p.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(w,null,H,p,g,null),m.uniforms.shadow_pass.value=R.mapPass.texture,m.uniforms.resolution.value=R.mapSize,m.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(w,null,H,m,g,null)}function M(R,w,H,x){let T=null;const z=H.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(z!==void 0)T=z;else if(T=H.isPointLight===!0?c:o,i.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){const V=T.uuid,ee=w.uuid;let L=h[V];L===void 0&&(L={},h[V]=L);let F=L[ee];F===void 0&&(F=T.clone(),L[ee]=F,w.addEventListener("dispose",P)),T=F}if(T.visible=w.visible,T.wireframe=w.wireframe,x===rn?T.side=w.shadowSide!==null?w.shadowSide:w.side:T.side=w.shadowSide!==null?w.shadowSide:f[w.side],T.alphaMap=w.alphaMap,T.alphaTest=w.alphaTest,T.map=w.map,T.clipShadows=w.clipShadows,T.clippingPlanes=w.clippingPlanes,T.clipIntersection=w.clipIntersection,T.displacementMap=w.displacementMap,T.displacementScale=w.displacementScale,T.displacementBias=w.displacementBias,T.wireframeLinewidth=w.wireframeLinewidth,T.linewidth=w.linewidth,H.isPointLight===!0&&T.isMeshDistanceMaterial===!0){const V=i.properties.get(T);V.light=H}return T}function A(R,w,H,x,T){if(R.visible===!1)return;if(R.layers.test(w.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&T===rn)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,R.matrixWorld);const ee=e.update(R),L=R.material;if(Array.isArray(L)){const F=ee.groups;for(let G=0,Y=F.length;G<Y;G++){const X=F[G],q=L[X.materialIndex];if(q&&q.visible){const K=M(R,q,x,T);R.onBeforeShadow(i,R,w,H,ee,K,X),i.renderBufferDirect(H,null,ee,K,R,X),R.onAfterShadow(i,R,w,H,ee,K,X)}}}else if(L.visible){const F=M(R,L,x,T);R.onBeforeShadow(i,R,w,H,ee,F,null),i.renderBufferDirect(H,null,ee,F,R,null),R.onAfterShadow(i,R,w,H,ee,F,null)}}const V=R.children;for(let ee=0,L=V.length;ee<L;ee++)A(V[ee],w,H,x,T)}function P(R){R.target.removeEventListener("dispose",P);for(const H in h){const x=h[H],T=R.target.uuid;T in x&&(x[T].dispose(),delete x[T])}}}function jp(i,e,t){const n=t.isWebGL2;function s(){let C=!1;const re=new tt;let ae=null;const Ae=new tt(0,0,0,0);return{setMask:function(Se){ae!==Se&&!C&&(i.colorMask(Se,Se,Se,Se),ae=Se)},setLocked:function(Se){C=Se},setClear:function(Se,$e,je,mt,Tt){Tt===!0&&(Se*=mt,$e*=mt,je*=mt),re.set(Se,$e,je,mt),Ae.equals(re)===!1&&(i.clearColor(Se,$e,je,mt),Ae.copy(re))},reset:function(){C=!1,ae=null,Ae.set(-1,0,0,0)}}}function r(){let C=!1,re=null,ae=null,Ae=null;return{setTest:function(Se){Se?De(i.DEPTH_TEST):Te(i.DEPTH_TEST)},setMask:function(Se){re!==Se&&!C&&(i.depthMask(Se),re=Se)},setFunc:function(Se){if(ae!==Se){switch(Se){case vc:i.depthFunc(i.NEVER);break;case xc:i.depthFunc(i.ALWAYS);break;case Mc:i.depthFunc(i.LESS);break;case vs:i.depthFunc(i.LEQUAL);break;case Sc:i.depthFunc(i.EQUAL);break;case yc:i.depthFunc(i.GEQUAL);break;case Ec:i.depthFunc(i.GREATER);break;case Tc:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}ae=Se}},setLocked:function(Se){C=Se},setClear:function(Se){Ae!==Se&&(i.clearDepth(Se),Ae=Se)},reset:function(){C=!1,re=null,ae=null,Ae=null}}}function a(){let C=!1,re=null,ae=null,Ae=null,Se=null,$e=null,je=null,mt=null,Tt=null;return{setTest:function(Ze){C||(Ze?De(i.STENCIL_TEST):Te(i.STENCIL_TEST))},setMask:function(Ze){re!==Ze&&!C&&(i.stencilMask(Ze),re=Ze)},setFunc:function(Ze,At,$t){(ae!==Ze||Ae!==At||Se!==$t)&&(i.stencilFunc(Ze,At,$t),ae=Ze,Ae=At,Se=$t)},setOp:function(Ze,At,$t){($e!==Ze||je!==At||mt!==$t)&&(i.stencilOp(Ze,At,$t),$e=Ze,je=At,mt=$t)},setLocked:function(Ze){C=Ze},setClear:function(Ze){Tt!==Ze&&(i.clearStencil(Ze),Tt=Ze)},reset:function(){C=!1,re=null,ae=null,Ae=null,Se=null,$e=null,je=null,mt=null,Tt=null}}}const o=new s,c=new r,h=new a,l=new WeakMap,f=new WeakMap;let p={},m={},_=new WeakMap,g=[],d=null,u=!1,E=null,M=null,A=null,P=null,R=null,w=null,H=null,x=new xe(0,0,0),T=0,z=!1,V=null,ee=null,L=null,F=null,G=null;const Y=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let X=!1,q=0;const K=i.getParameter(i.VERSION);K.indexOf("WebGL")!==-1?(q=parseFloat(/^WebGL (\d)/.exec(K)[1]),X=q>=1):K.indexOf("OpenGL ES")!==-1&&(q=parseFloat(/^OpenGL ES (\d)/.exec(K)[1]),X=q>=2);let te=null,ne={};const k=i.getParameter(i.SCISSOR_BOX),$=i.getParameter(i.VIEWPORT),le=new tt().fromArray(k),ge=new tt().fromArray($);function me(C,re,ae,Ae){const Se=new Uint8Array(4),$e=i.createTexture();i.bindTexture(C,$e),i.texParameteri(C,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(C,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let je=0;je<ae;je++)n&&(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)?i.texImage3D(re,0,i.RGBA,1,1,Ae,0,i.RGBA,i.UNSIGNED_BYTE,Se):i.texImage2D(re+je,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Se);return $e}const Le={};Le[i.TEXTURE_2D]=me(i.TEXTURE_2D,i.TEXTURE_2D,1),Le[i.TEXTURE_CUBE_MAP]=me(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),n&&(Le[i.TEXTURE_2D_ARRAY]=me(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Le[i.TEXTURE_3D]=me(i.TEXTURE_3D,i.TEXTURE_3D,1,1)),o.setClear(0,0,0,1),c.setClear(1),h.setClear(0),De(i.DEPTH_TEST),c.setFunc(vs),Ne(!1),y(aa),De(i.CULL_FACE),fe(hn);function De(C){p[C]!==!0&&(i.enable(C),p[C]=!0)}function Te(C){p[C]!==!1&&(i.disable(C),p[C]=!1)}function We(C,re){return m[C]!==re?(i.bindFramebuffer(C,re),m[C]=re,n&&(C===i.DRAW_FRAMEBUFFER&&(m[i.FRAMEBUFFER]=re),C===i.FRAMEBUFFER&&(m[i.DRAW_FRAMEBUFFER]=re)),!0):!1}function U(C,re){let ae=g,Ae=!1;if(C)if(ae=_.get(re),ae===void 0&&(ae=[],_.set(re,ae)),C.isWebGLMultipleRenderTargets){const Se=C.texture;if(ae.length!==Se.length||ae[0]!==i.COLOR_ATTACHMENT0){for(let $e=0,je=Se.length;$e<je;$e++)ae[$e]=i.COLOR_ATTACHMENT0+$e;ae.length=Se.length,Ae=!0}}else ae[0]!==i.COLOR_ATTACHMENT0&&(ae[0]=i.COLOR_ATTACHMENT0,Ae=!0);else ae[0]!==i.BACK&&(ae[0]=i.BACK,Ae=!0);Ae&&(t.isWebGL2?i.drawBuffers(ae):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(ae))}function Et(C){return d!==C?(i.useProgram(C),d=C,!0):!1}const Me={[Fn]:i.FUNC_ADD,[ic]:i.FUNC_SUBTRACT,[sc]:i.FUNC_REVERSE_SUBTRACT};if(n)Me[ca]=i.MIN,Me[ha]=i.MAX;else{const C=e.get("EXT_blend_minmax");C!==null&&(Me[ca]=C.MIN_EXT,Me[ha]=C.MAX_EXT)}const Re={[rc]:i.ZERO,[ac]:i.ONE,[oc]:i.SRC_COLOR,[wr]:i.SRC_ALPHA,[dc]:i.SRC_ALPHA_SATURATE,[uc]:i.DST_COLOR,[cc]:i.DST_ALPHA,[lc]:i.ONE_MINUS_SRC_COLOR,[br]:i.ONE_MINUS_SRC_ALPHA,[fc]:i.ONE_MINUS_DST_COLOR,[hc]:i.ONE_MINUS_DST_ALPHA,[pc]:i.CONSTANT_COLOR,[mc]:i.ONE_MINUS_CONSTANT_COLOR,[gc]:i.CONSTANT_ALPHA,[_c]:i.ONE_MINUS_CONSTANT_ALPHA};function fe(C,re,ae,Ae,Se,$e,je,mt,Tt,Ze){if(C===hn){u===!0&&(Te(i.BLEND),u=!1);return}if(u===!1&&(De(i.BLEND),u=!0),C!==nc){if(C!==E||Ze!==z){if((M!==Fn||R!==Fn)&&(i.blendEquation(i.FUNC_ADD),M=Fn,R=Fn),Ze)switch(C){case gi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Ar:i.blendFunc(i.ONE,i.ONE);break;case oa:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case la:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",C);break}else switch(C){case gi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Ar:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case oa:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case la:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",C);break}A=null,P=null,w=null,H=null,x.set(0,0,0),T=0,E=C,z=Ze}return}Se=Se||re,$e=$e||ae,je=je||Ae,(re!==M||Se!==R)&&(i.blendEquationSeparate(Me[re],Me[Se]),M=re,R=Se),(ae!==A||Ae!==P||$e!==w||je!==H)&&(i.blendFuncSeparate(Re[ae],Re[Ae],Re[$e],Re[je]),A=ae,P=Ae,w=$e,H=je),(mt.equals(x)===!1||Tt!==T)&&(i.blendColor(mt.r,mt.g,mt.b,Tt),x.copy(mt),T=Tt),E=C,z=!1}function nt(C,re){C.side===an?Te(i.CULL_FACE):De(i.CULL_FACE);let ae=C.side===Ct;re&&(ae=!ae),Ne(ae),C.blending===gi&&C.transparent===!1?fe(hn):fe(C.blending,C.blendEquation,C.blendSrc,C.blendDst,C.blendEquationAlpha,C.blendSrcAlpha,C.blendDstAlpha,C.blendColor,C.blendAlpha,C.premultipliedAlpha),c.setFunc(C.depthFunc),c.setTest(C.depthTest),c.setMask(C.depthWrite),o.setMask(C.colorWrite);const Ae=C.stencilWrite;h.setTest(Ae),Ae&&(h.setMask(C.stencilWriteMask),h.setFunc(C.stencilFunc,C.stencilRef,C.stencilFuncMask),h.setOp(C.stencilFail,C.stencilZFail,C.stencilZPass)),N(C.polygonOffset,C.polygonOffsetFactor,C.polygonOffsetUnits),C.alphaToCoverage===!0?De(i.SAMPLE_ALPHA_TO_COVERAGE):Te(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ne(C){V!==C&&(C?i.frontFace(i.CW):i.frontFace(i.CCW),V=C)}function y(C){C!==Ql?(De(i.CULL_FACE),C!==ee&&(C===aa?i.cullFace(i.BACK):C===ec?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Te(i.CULL_FACE),ee=C}function v(C){C!==L&&(X&&i.lineWidth(C),L=C)}function N(C,re,ae){C?(De(i.POLYGON_OFFSET_FILL),(F!==re||G!==ae)&&(i.polygonOffset(re,ae),F=re,G=ae)):Te(i.POLYGON_OFFSET_FILL)}function J(C){C?De(i.SCISSOR_TEST):Te(i.SCISSOR_TEST)}function Z(C){C===void 0&&(C=i.TEXTURE0+Y-1),te!==C&&(i.activeTexture(C),te=C)}function Q(C,re,ae){ae===void 0&&(te===null?ae=i.TEXTURE0+Y-1:ae=te);let Ae=ne[ae];Ae===void 0&&(Ae={type:void 0,texture:void 0},ne[ae]=Ae),(Ae.type!==C||Ae.texture!==re)&&(te!==ae&&(i.activeTexture(ae),te=ae),i.bindTexture(C,re||Le[C]),Ae.type=C,Ae.texture=re)}function de(){const C=ne[te];C!==void 0&&C.type!==void 0&&(i.bindTexture(C.type,null),C.type=void 0,C.texture=void 0)}function oe(){try{i.compressedTexImage2D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function he(){try{i.compressedTexImage3D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function Ee(){try{i.texSubImage2D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function Oe(){try{i.texSubImage3D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function j(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function qe(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function Ge(){try{i.texStorage2D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function be(){try{i.texStorage3D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function ve(){try{i.texImage2D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function ue(){try{i.texImage3D.apply(i,arguments)}catch(C){console.error("THREE.WebGLState:",C)}}function Ue(C){le.equals(C)===!1&&(i.scissor(C.x,C.y,C.z,C.w),le.copy(C))}function Xe(C){ge.equals(C)===!1&&(i.viewport(C.x,C.y,C.z,C.w),ge.copy(C))}function st(C,re){let ae=f.get(re);ae===void 0&&(ae=new WeakMap,f.set(re,ae));let Ae=ae.get(C);Ae===void 0&&(Ae=i.getUniformBlockIndex(re,C.name),ae.set(C,Ae))}function ze(C,re){const Ae=f.get(re).get(C);l.get(re)!==Ae&&(i.uniformBlockBinding(re,Ae,C.__bindingPointIndex),l.set(re,Ae))}function ie(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),n===!0&&(i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null)),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),p={},te=null,ne={},m={},_=new WeakMap,g=[],d=null,u=!1,E=null,M=null,A=null,P=null,R=null,w=null,H=null,x=new xe(0,0,0),T=0,z=!1,V=null,ee=null,L=null,F=null,G=null,le.set(0,0,i.canvas.width,i.canvas.height),ge.set(0,0,i.canvas.width,i.canvas.height),o.reset(),c.reset(),h.reset()}return{buffers:{color:o,depth:c,stencil:h},enable:De,disable:Te,bindFramebuffer:We,drawBuffers:U,useProgram:Et,setBlending:fe,setMaterial:nt,setFlipSided:Ne,setCullFace:y,setLineWidth:v,setPolygonOffset:N,setScissorTest:J,activeTexture:Z,bindTexture:Q,unbindTexture:de,compressedTexImage2D:oe,compressedTexImage3D:he,texImage2D:ve,texImage3D:ue,updateUBOMapping:st,uniformBlockBinding:ze,texStorage2D:Ge,texStorage3D:be,texSubImage2D:Ee,texSubImage3D:Oe,compressedTexSubImage2D:j,compressedTexSubImage3D:qe,scissor:Ue,viewport:Xe,reset:ie}}function Zp(i,e,t,n,s,r,a){const o=s.isWebGL2,c=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,h=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new WeakMap;let f;const p=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(y,v){return m?new OffscreenCanvas(y,v):Ts("canvas")}function g(y,v,N,J){let Z=1;if((y.width>J||y.height>J)&&(Z=J/Math.max(y.width,y.height)),Z<1||v===!0)if(typeof HTMLImageElement<"u"&&y instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&y instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&y instanceof ImageBitmap){const Q=v?Ir:Math.floor,de=Q(Z*y.width),oe=Q(Z*y.height);f===void 0&&(f=_(de,oe));const he=N?_(de,oe):f;return he.width=de,he.height=oe,he.getContext("2d").drawImage(y,0,0,de,oe),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+y.width+"x"+y.height+") to ("+de+"x"+oe+")."),he}else return"data"in y&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+y.width+"x"+y.height+")."),y;return y}function d(y){return za(y.width)&&za(y.height)}function u(y){return o?!1:y.wrapS!==Xt||y.wrapT!==Xt||y.minFilter!==ht&&y.minFilter!==zt}function E(y,v){return y.generateMipmaps&&v&&y.minFilter!==ht&&y.minFilter!==zt}function M(y){i.generateMipmap(y)}function A(y,v,N,J,Z=!1){if(o===!1)return v;if(y!==null){if(i[y]!==void 0)return i[y];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+y+"'")}let Q=v;if(v===i.RED&&(N===i.FLOAT&&(Q=i.R32F),N===i.HALF_FLOAT&&(Q=i.R16F),N===i.UNSIGNED_BYTE&&(Q=i.R8)),v===i.RED_INTEGER&&(N===i.UNSIGNED_BYTE&&(Q=i.R8UI),N===i.UNSIGNED_SHORT&&(Q=i.R16UI),N===i.UNSIGNED_INT&&(Q=i.R32UI),N===i.BYTE&&(Q=i.R8I),N===i.SHORT&&(Q=i.R16I),N===i.INT&&(Q=i.R32I)),v===i.RG&&(N===i.FLOAT&&(Q=i.RG32F),N===i.HALF_FLOAT&&(Q=i.RG16F),N===i.UNSIGNED_BYTE&&(Q=i.RG8)),v===i.RGBA){const de=Z?Ms:Ye.getTransfer(J);N===i.FLOAT&&(Q=i.RGBA32F),N===i.HALF_FLOAT&&(Q=i.RGBA16F),N===i.UNSIGNED_BYTE&&(Q=de===Je?i.SRGB8_ALPHA8:i.RGBA8),N===i.UNSIGNED_SHORT_4_4_4_4&&(Q=i.RGBA4),N===i.UNSIGNED_SHORT_5_5_5_1&&(Q=i.RGB5_A1)}return(Q===i.R16F||Q===i.R32F||Q===i.RG16F||Q===i.RG32F||Q===i.RGBA16F||Q===i.RGBA32F)&&e.get("EXT_color_buffer_float"),Q}function P(y,v,N){return E(y,N)===!0||y.isFramebufferTexture&&y.minFilter!==ht&&y.minFilter!==zt?Math.log2(Math.max(v.width,v.height))+1:y.mipmaps!==void 0&&y.mipmaps.length>0?y.mipmaps.length:y.isCompressedTexture&&Array.isArray(y.image)?v.mipmaps.length:1}function R(y){return y===ht||y===ua||y===zs?i.NEAREST:i.LINEAR}function w(y){const v=y.target;v.removeEventListener("dispose",w),x(v),v.isVideoTexture&&l.delete(v)}function H(y){const v=y.target;v.removeEventListener("dispose",H),z(v)}function x(y){const v=n.get(y);if(v.__webglInit===void 0)return;const N=y.source,J=p.get(N);if(J){const Z=J[v.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&T(y),Object.keys(J).length===0&&p.delete(N)}n.remove(y)}function T(y){const v=n.get(y);i.deleteTexture(v.__webglTexture);const N=y.source,J=p.get(N);delete J[v.__cacheKey],a.memory.textures--}function z(y){const v=y.texture,N=n.get(y),J=n.get(v);if(J.__webglTexture!==void 0&&(i.deleteTexture(J.__webglTexture),a.memory.textures--),y.depthTexture&&y.depthTexture.dispose(),y.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(N.__webglFramebuffer[Z]))for(let Q=0;Q<N.__webglFramebuffer[Z].length;Q++)i.deleteFramebuffer(N.__webglFramebuffer[Z][Q]);else i.deleteFramebuffer(N.__webglFramebuffer[Z]);N.__webglDepthbuffer&&i.deleteRenderbuffer(N.__webglDepthbuffer[Z])}else{if(Array.isArray(N.__webglFramebuffer))for(let Z=0;Z<N.__webglFramebuffer.length;Z++)i.deleteFramebuffer(N.__webglFramebuffer[Z]);else i.deleteFramebuffer(N.__webglFramebuffer);if(N.__webglDepthbuffer&&i.deleteRenderbuffer(N.__webglDepthbuffer),N.__webglMultisampledFramebuffer&&i.deleteFramebuffer(N.__webglMultisampledFramebuffer),N.__webglColorRenderbuffer)for(let Z=0;Z<N.__webglColorRenderbuffer.length;Z++)N.__webglColorRenderbuffer[Z]&&i.deleteRenderbuffer(N.__webglColorRenderbuffer[Z]);N.__webglDepthRenderbuffer&&i.deleteRenderbuffer(N.__webglDepthRenderbuffer)}if(y.isWebGLMultipleRenderTargets)for(let Z=0,Q=v.length;Z<Q;Z++){const de=n.get(v[Z]);de.__webglTexture&&(i.deleteTexture(de.__webglTexture),a.memory.textures--),n.remove(v[Z])}n.remove(v),n.remove(y)}let V=0;function ee(){V=0}function L(){const y=V;return y>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+y+" texture units while this GPU supports only "+s.maxTextures),V+=1,y}function F(y){const v=[];return v.push(y.wrapS),v.push(y.wrapT),v.push(y.wrapR||0),v.push(y.magFilter),v.push(y.minFilter),v.push(y.anisotropy),v.push(y.internalFormat),v.push(y.format),v.push(y.type),v.push(y.generateMipmaps),v.push(y.premultiplyAlpha),v.push(y.flipY),v.push(y.unpackAlignment),v.push(y.colorSpace),v.join()}function G(y,v){const N=n.get(y);if(y.isVideoTexture&&nt(y),y.isRenderTargetTexture===!1&&y.version>0&&N.__version!==y.version){const J=y.image;if(J===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{le(N,y,v);return}}t.bindTexture(i.TEXTURE_2D,N.__webglTexture,i.TEXTURE0+v)}function Y(y,v){const N=n.get(y);if(y.version>0&&N.__version!==y.version){le(N,y,v);return}t.bindTexture(i.TEXTURE_2D_ARRAY,N.__webglTexture,i.TEXTURE0+v)}function X(y,v){const N=n.get(y);if(y.version>0&&N.__version!==y.version){le(N,y,v);return}t.bindTexture(i.TEXTURE_3D,N.__webglTexture,i.TEXTURE0+v)}function q(y,v){const N=n.get(y);if(y.version>0&&N.__version!==y.version){ge(N,y,v);return}t.bindTexture(i.TEXTURE_CUBE_MAP,N.__webglTexture,i.TEXTURE0+v)}const K={[xs]:i.REPEAT,[Xt]:i.CLAMP_TO_EDGE,[Lr]:i.MIRRORED_REPEAT},te={[ht]:i.NEAREST,[ua]:i.NEAREST_MIPMAP_NEAREST,[zs]:i.NEAREST_MIPMAP_LINEAR,[zt]:i.LINEAR,[Uc]:i.LINEAR_MIPMAP_NEAREST,[Oi]:i.LINEAR_MIPMAP_LINEAR},ne={[Xc]:i.NEVER,[Zc]:i.ALWAYS,[qc]:i.LESS,[hl]:i.LEQUAL,[Yc]:i.EQUAL,[jc]:i.GEQUAL,[Kc]:i.GREATER,[$c]:i.NOTEQUAL};function k(y,v,N){if(N?(i.texParameteri(y,i.TEXTURE_WRAP_S,K[v.wrapS]),i.texParameteri(y,i.TEXTURE_WRAP_T,K[v.wrapT]),(y===i.TEXTURE_3D||y===i.TEXTURE_2D_ARRAY)&&i.texParameteri(y,i.TEXTURE_WRAP_R,K[v.wrapR]),i.texParameteri(y,i.TEXTURE_MAG_FILTER,te[v.magFilter]),i.texParameteri(y,i.TEXTURE_MIN_FILTER,te[v.minFilter])):(i.texParameteri(y,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(y,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),(y===i.TEXTURE_3D||y===i.TEXTURE_2D_ARRAY)&&i.texParameteri(y,i.TEXTURE_WRAP_R,i.CLAMP_TO_EDGE),(v.wrapS!==Xt||v.wrapT!==Xt)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),i.texParameteri(y,i.TEXTURE_MAG_FILTER,R(v.magFilter)),i.texParameteri(y,i.TEXTURE_MIN_FILTER,R(v.minFilter)),v.minFilter!==ht&&v.minFilter!==zt&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),v.compareFunction&&(i.texParameteri(y,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(y,i.TEXTURE_COMPARE_FUNC,ne[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){const J=e.get("EXT_texture_filter_anisotropic");if(v.magFilter===ht||v.minFilter!==zs&&v.minFilter!==Oi||v.type===Mn&&e.has("OES_texture_float_linear")===!1||o===!1&&v.type===un&&e.has("OES_texture_half_float_linear")===!1)return;(v.anisotropy>1||n.get(v).__currentAnisotropy)&&(i.texParameterf(y,J.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy)}}function $(y,v){let N=!1;y.__webglInit===void 0&&(y.__webglInit=!0,v.addEventListener("dispose",w));const J=v.source;let Z=p.get(J);Z===void 0&&(Z={},p.set(J,Z));const Q=F(v);if(Q!==y.__cacheKey){Z[Q]===void 0&&(Z[Q]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,N=!0),Z[Q].usedTimes++;const de=Z[y.__cacheKey];de!==void 0&&(Z[y.__cacheKey].usedTimes--,de.usedTimes===0&&T(v)),y.__cacheKey=Q,y.__webglTexture=Z[Q].texture}return N}function le(y,v,N){let J=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(J=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(J=i.TEXTURE_3D);const Z=$(y,v),Q=v.source;t.bindTexture(J,y.__webglTexture,i.TEXTURE0+N);const de=n.get(Q);if(Q.version!==de.__version||Z===!0){t.activeTexture(i.TEXTURE0+N);const oe=Ye.getPrimaries(Ye.workingColorSpace),he=v.colorSpace===kt?null:Ye.getPrimaries(v.colorSpace),Ee=v.colorSpace===kt||oe===he?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ee);const Oe=u(v)&&d(v.image)===!1;let j=g(v.image,Oe,!1,s.maxTextureSize);j=Ne(v,j);const qe=d(j)||o,Ge=r.convert(v.format,v.colorSpace);let be=r.convert(v.type),ve=A(v.internalFormat,Ge,be,v.colorSpace,v.isVideoTexture);k(J,v,qe);let ue;const Ue=v.mipmaps,Xe=o&&v.isVideoTexture!==!0&&ve!==ll,st=de.__version===void 0||Z===!0,ze=P(v,j,qe);if(v.isDepthTexture)ve=i.DEPTH_COMPONENT,o?v.type===Mn?ve=i.DEPTH_COMPONENT32F:v.type===xn?ve=i.DEPTH_COMPONENT24:v.type===zn?ve=i.DEPTH24_STENCIL8:ve=i.DEPTH_COMPONENT16:v.type===Mn&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),v.format===Hn&&ve===i.DEPTH_COMPONENT&&v.type!==Wr&&v.type!==xn&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),v.type=xn,be=r.convert(v.type)),v.format===Mi&&ve===i.DEPTH_COMPONENT&&(ve=i.DEPTH_STENCIL,v.type!==zn&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),v.type=zn,be=r.convert(v.type))),st&&(Xe?t.texStorage2D(i.TEXTURE_2D,1,ve,j.width,j.height):t.texImage2D(i.TEXTURE_2D,0,ve,j.width,j.height,0,Ge,be,null));else if(v.isDataTexture)if(Ue.length>0&&qe){Xe&&st&&t.texStorage2D(i.TEXTURE_2D,ze,ve,Ue[0].width,Ue[0].height);for(let ie=0,C=Ue.length;ie<C;ie++)ue=Ue[ie],Xe?t.texSubImage2D(i.TEXTURE_2D,ie,0,0,ue.width,ue.height,Ge,be,ue.data):t.texImage2D(i.TEXTURE_2D,ie,ve,ue.width,ue.height,0,Ge,be,ue.data);v.generateMipmaps=!1}else Xe?(st&&t.texStorage2D(i.TEXTURE_2D,ze,ve,j.width,j.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,j.width,j.height,Ge,be,j.data)):t.texImage2D(i.TEXTURE_2D,0,ve,j.width,j.height,0,Ge,be,j.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){Xe&&st&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ze,ve,Ue[0].width,Ue[0].height,j.depth);for(let ie=0,C=Ue.length;ie<C;ie++)ue=Ue[ie],v.format!==qt?Ge!==null?Xe?t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ie,0,0,0,ue.width,ue.height,j.depth,Ge,ue.data,0,0):t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ie,ve,ue.width,ue.height,j.depth,0,ue.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Xe?t.texSubImage3D(i.TEXTURE_2D_ARRAY,ie,0,0,0,ue.width,ue.height,j.depth,Ge,be,ue.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ie,ve,ue.width,ue.height,j.depth,0,Ge,be,ue.data)}else{Xe&&st&&t.texStorage2D(i.TEXTURE_2D,ze,ve,Ue[0].width,Ue[0].height);for(let ie=0,C=Ue.length;ie<C;ie++)ue=Ue[ie],v.format!==qt?Ge!==null?Xe?t.compressedTexSubImage2D(i.TEXTURE_2D,ie,0,0,ue.width,ue.height,Ge,ue.data):t.compressedTexImage2D(i.TEXTURE_2D,ie,ve,ue.width,ue.height,0,ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Xe?t.texSubImage2D(i.TEXTURE_2D,ie,0,0,ue.width,ue.height,Ge,be,ue.data):t.texImage2D(i.TEXTURE_2D,ie,ve,ue.width,ue.height,0,Ge,be,ue.data)}else if(v.isDataArrayTexture)Xe?(st&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ze,ve,j.width,j.height,j.depth),t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,j.width,j.height,j.depth,Ge,be,j.data)):t.texImage3D(i.TEXTURE_2D_ARRAY,0,ve,j.width,j.height,j.depth,0,Ge,be,j.data);else if(v.isData3DTexture)Xe?(st&&t.texStorage3D(i.TEXTURE_3D,ze,ve,j.width,j.height,j.depth),t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,j.width,j.height,j.depth,Ge,be,j.data)):t.texImage3D(i.TEXTURE_3D,0,ve,j.width,j.height,j.depth,0,Ge,be,j.data);else if(v.isFramebufferTexture){if(st)if(Xe)t.texStorage2D(i.TEXTURE_2D,ze,ve,j.width,j.height);else{let ie=j.width,C=j.height;for(let re=0;re<ze;re++)t.texImage2D(i.TEXTURE_2D,re,ve,ie,C,0,Ge,be,null),ie>>=1,C>>=1}}else if(Ue.length>0&&qe){Xe&&st&&t.texStorage2D(i.TEXTURE_2D,ze,ve,Ue[0].width,Ue[0].height);for(let ie=0,C=Ue.length;ie<C;ie++)ue=Ue[ie],Xe?t.texSubImage2D(i.TEXTURE_2D,ie,0,0,Ge,be,ue):t.texImage2D(i.TEXTURE_2D,ie,ve,Ge,be,ue);v.generateMipmaps=!1}else Xe?(st&&t.texStorage2D(i.TEXTURE_2D,ze,ve,j.width,j.height),t.texSubImage2D(i.TEXTURE_2D,0,0,0,Ge,be,j)):t.texImage2D(i.TEXTURE_2D,0,ve,Ge,be,j);E(v,qe)&&M(J),de.__version=Q.version,v.onUpdate&&v.onUpdate(v)}y.__version=v.version}function ge(y,v,N){if(v.image.length!==6)return;const J=$(y,v),Z=v.source;t.bindTexture(i.TEXTURE_CUBE_MAP,y.__webglTexture,i.TEXTURE0+N);const Q=n.get(Z);if(Z.version!==Q.__version||J===!0){t.activeTexture(i.TEXTURE0+N);const de=Ye.getPrimaries(Ye.workingColorSpace),oe=v.colorSpace===kt?null:Ye.getPrimaries(v.colorSpace),he=v.colorSpace===kt||de===oe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,he);const Ee=v.isCompressedTexture||v.image[0].isCompressedTexture,Oe=v.image[0]&&v.image[0].isDataTexture,j=[];for(let ie=0;ie<6;ie++)!Ee&&!Oe?j[ie]=g(v.image[ie],!1,!0,s.maxCubemapSize):j[ie]=Oe?v.image[ie].image:v.image[ie],j[ie]=Ne(v,j[ie]);const qe=j[0],Ge=d(qe)||o,be=r.convert(v.format,v.colorSpace),ve=r.convert(v.type),ue=A(v.internalFormat,be,ve,v.colorSpace),Ue=o&&v.isVideoTexture!==!0,Xe=Q.__version===void 0||J===!0;let st=P(v,qe,Ge);k(i.TEXTURE_CUBE_MAP,v,Ge);let ze;if(Ee){Ue&&Xe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,st,ue,qe.width,qe.height);for(let ie=0;ie<6;ie++){ze=j[ie].mipmaps;for(let C=0;C<ze.length;C++){const re=ze[C];v.format!==qt?be!==null?Ue?t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,C,0,0,re.width,re.height,be,re.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,C,ue,re.width,re.height,0,re.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ue?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,C,0,0,re.width,re.height,be,ve,re.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,C,ue,re.width,re.height,0,be,ve,re.data)}}}else{ze=v.mipmaps,Ue&&Xe&&(ze.length>0&&st++,t.texStorage2D(i.TEXTURE_CUBE_MAP,st,ue,j[0].width,j[0].height));for(let ie=0;ie<6;ie++)if(Oe){Ue?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,j[ie].width,j[ie].height,be,ve,j[ie].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,ue,j[ie].width,j[ie].height,0,be,ve,j[ie].data);for(let C=0;C<ze.length;C++){const ae=ze[C].image[ie].image;Ue?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,C+1,0,0,ae.width,ae.height,be,ve,ae.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,C+1,ue,ae.width,ae.height,0,be,ve,ae.data)}}else{Ue?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,0,0,be,ve,j[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0,ue,be,ve,j[ie]);for(let C=0;C<ze.length;C++){const re=ze[C];Ue?t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,C+1,0,0,be,ve,re.image[ie]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ie,C+1,ue,be,ve,re.image[ie])}}}E(v,Ge)&&M(i.TEXTURE_CUBE_MAP),Q.__version=Z.version,v.onUpdate&&v.onUpdate(v)}y.__version=v.version}function me(y,v,N,J,Z,Q){const de=r.convert(N.format,N.colorSpace),oe=r.convert(N.type),he=A(N.internalFormat,de,oe,N.colorSpace);if(!n.get(v).__hasExternalTextures){const Oe=Math.max(1,v.width>>Q),j=Math.max(1,v.height>>Q);Z===i.TEXTURE_3D||Z===i.TEXTURE_2D_ARRAY?t.texImage3D(Z,Q,he,Oe,j,v.depth,0,de,oe,null):t.texImage2D(Z,Q,he,Oe,j,0,de,oe,null)}t.bindFramebuffer(i.FRAMEBUFFER,y),fe(v)?c.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,J,Z,n.get(N).__webglTexture,0,Re(v)):(Z===i.TEXTURE_2D||Z>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,J,Z,n.get(N).__webglTexture,Q),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Le(y,v,N){if(i.bindRenderbuffer(i.RENDERBUFFER,y),v.depthBuffer&&!v.stencilBuffer){let J=o===!0?i.DEPTH_COMPONENT24:i.DEPTH_COMPONENT16;if(N||fe(v)){const Z=v.depthTexture;Z&&Z.isDepthTexture&&(Z.type===Mn?J=i.DEPTH_COMPONENT32F:Z.type===xn&&(J=i.DEPTH_COMPONENT24));const Q=Re(v);fe(v)?c.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Q,J,v.width,v.height):i.renderbufferStorageMultisample(i.RENDERBUFFER,Q,J,v.width,v.height)}else i.renderbufferStorage(i.RENDERBUFFER,J,v.width,v.height);i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.RENDERBUFFER,y)}else if(v.depthBuffer&&v.stencilBuffer){const J=Re(v);N&&fe(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,J,i.DEPTH24_STENCIL8,v.width,v.height):fe(v)?c.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,J,i.DEPTH24_STENCIL8,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,i.DEPTH_STENCIL,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.RENDERBUFFER,y)}else{const J=v.isWebGLMultipleRenderTargets===!0?v.texture:[v.texture];for(let Z=0;Z<J.length;Z++){const Q=J[Z],de=r.convert(Q.format,Q.colorSpace),oe=r.convert(Q.type),he=A(Q.internalFormat,de,oe,Q.colorSpace),Ee=Re(v);N&&fe(v)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ee,he,v.width,v.height):fe(v)?c.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ee,he,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,he,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function De(y,v){if(v&&v.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,y),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(v.depthTexture).__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),G(v.depthTexture,0);const J=n.get(v.depthTexture).__webglTexture,Z=Re(v);if(v.depthTexture.format===Hn)fe(v)?c.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,J,0,Z):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,J,0);else if(v.depthTexture.format===Mi)fe(v)?c.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,J,0,Z):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,J,0);else throw new Error("Unknown depthTexture format")}function Te(y){const v=n.get(y),N=y.isWebGLCubeRenderTarget===!0;if(y.depthTexture&&!v.__autoAllocateDepthBuffer){if(N)throw new Error("target.depthTexture not supported in Cube render targets");De(v.__webglFramebuffer,y)}else if(N){v.__webglDepthbuffer=[];for(let J=0;J<6;J++)t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[J]),v.__webglDepthbuffer[J]=i.createRenderbuffer(),Le(v.__webglDepthbuffer[J],y,!1)}else t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer=i.createRenderbuffer(),Le(v.__webglDepthbuffer,y,!1);t.bindFramebuffer(i.FRAMEBUFFER,null)}function We(y,v,N){const J=n.get(y);v!==void 0&&me(J.__webglFramebuffer,y,y.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),N!==void 0&&Te(y)}function U(y){const v=y.texture,N=n.get(y),J=n.get(v);y.addEventListener("dispose",H),y.isWebGLMultipleRenderTargets!==!0&&(J.__webglTexture===void 0&&(J.__webglTexture=i.createTexture()),J.__version=v.version,a.memory.textures++);const Z=y.isWebGLCubeRenderTarget===!0,Q=y.isWebGLMultipleRenderTargets===!0,de=d(y)||o;if(Z){N.__webglFramebuffer=[];for(let oe=0;oe<6;oe++)if(o&&v.mipmaps&&v.mipmaps.length>0){N.__webglFramebuffer[oe]=[];for(let he=0;he<v.mipmaps.length;he++)N.__webglFramebuffer[oe][he]=i.createFramebuffer()}else N.__webglFramebuffer[oe]=i.createFramebuffer()}else{if(o&&v.mipmaps&&v.mipmaps.length>0){N.__webglFramebuffer=[];for(let oe=0;oe<v.mipmaps.length;oe++)N.__webglFramebuffer[oe]=i.createFramebuffer()}else N.__webglFramebuffer=i.createFramebuffer();if(Q)if(s.drawBuffers){const oe=y.texture;for(let he=0,Ee=oe.length;he<Ee;he++){const Oe=n.get(oe[he]);Oe.__webglTexture===void 0&&(Oe.__webglTexture=i.createTexture(),a.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(o&&y.samples>0&&fe(y)===!1){const oe=Q?v:[v];N.__webglMultisampledFramebuffer=i.createFramebuffer(),N.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,N.__webglMultisampledFramebuffer);for(let he=0;he<oe.length;he++){const Ee=oe[he];N.__webglColorRenderbuffer[he]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,N.__webglColorRenderbuffer[he]);const Oe=r.convert(Ee.format,Ee.colorSpace),j=r.convert(Ee.type),qe=A(Ee.internalFormat,Oe,j,Ee.colorSpace,y.isXRRenderTarget===!0),Ge=Re(y);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ge,qe,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.RENDERBUFFER,N.__webglColorRenderbuffer[he])}i.bindRenderbuffer(i.RENDERBUFFER,null),y.depthBuffer&&(N.__webglDepthRenderbuffer=i.createRenderbuffer(),Le(N.__webglDepthRenderbuffer,y,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Z){t.bindTexture(i.TEXTURE_CUBE_MAP,J.__webglTexture),k(i.TEXTURE_CUBE_MAP,v,de);for(let oe=0;oe<6;oe++)if(o&&v.mipmaps&&v.mipmaps.length>0)for(let he=0;he<v.mipmaps.length;he++)me(N.__webglFramebuffer[oe][he],y,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,he);else me(N.__webglFramebuffer[oe],y,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+oe,0);E(v,de)&&M(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Q){const oe=y.texture;for(let he=0,Ee=oe.length;he<Ee;he++){const Oe=oe[he],j=n.get(Oe);t.bindTexture(i.TEXTURE_2D,j.__webglTexture),k(i.TEXTURE_2D,Oe,de),me(N.__webglFramebuffer,y,Oe,i.COLOR_ATTACHMENT0+he,i.TEXTURE_2D,0),E(Oe,de)&&M(i.TEXTURE_2D)}t.unbindTexture()}else{let oe=i.TEXTURE_2D;if((y.isWebGL3DRenderTarget||y.isWebGLArrayRenderTarget)&&(o?oe=y.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(oe,J.__webglTexture),k(oe,v,de),o&&v.mipmaps&&v.mipmaps.length>0)for(let he=0;he<v.mipmaps.length;he++)me(N.__webglFramebuffer[he],y,v,i.COLOR_ATTACHMENT0,oe,he);else me(N.__webglFramebuffer,y,v,i.COLOR_ATTACHMENT0,oe,0);E(v,de)&&M(oe),t.unbindTexture()}y.depthBuffer&&Te(y)}function Et(y){const v=d(y)||o,N=y.isWebGLMultipleRenderTargets===!0?y.texture:[y.texture];for(let J=0,Z=N.length;J<Z;J++){const Q=N[J];if(E(Q,v)){const de=y.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,oe=n.get(Q).__webglTexture;t.bindTexture(de,oe),M(de),t.unbindTexture()}}}function Me(y){if(o&&y.samples>0&&fe(y)===!1){const v=y.isWebGLMultipleRenderTargets?y.texture:[y.texture],N=y.width,J=y.height;let Z=i.COLOR_BUFFER_BIT;const Q=[],de=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,oe=n.get(y),he=y.isWebGLMultipleRenderTargets===!0;if(he)for(let Ee=0;Ee<v.length;Ee++)t.bindFramebuffer(i.FRAMEBUFFER,oe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,oe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,oe.__webglMultisampledFramebuffer),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,oe.__webglFramebuffer);for(let Ee=0;Ee<v.length;Ee++){Q.push(i.COLOR_ATTACHMENT0+Ee),y.depthBuffer&&Q.push(de);const Oe=oe.__ignoreDepthValues!==void 0?oe.__ignoreDepthValues:!1;if(Oe===!1&&(y.depthBuffer&&(Z|=i.DEPTH_BUFFER_BIT),y.stencilBuffer&&(Z|=i.STENCIL_BUFFER_BIT)),he&&i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,oe.__webglColorRenderbuffer[Ee]),Oe===!0&&(i.invalidateFramebuffer(i.READ_FRAMEBUFFER,[de]),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[de])),he){const j=n.get(v[Ee]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,j,0)}i.blitFramebuffer(0,0,N,J,0,0,N,J,Z,i.NEAREST),h&&i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Q)}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),he)for(let Ee=0;Ee<v.length;Ee++){t.bindFramebuffer(i.FRAMEBUFFER,oe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.RENDERBUFFER,oe.__webglColorRenderbuffer[Ee]);const Oe=n.get(v[Ee]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,oe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.TEXTURE_2D,Oe,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,oe.__webglMultisampledFramebuffer)}}function Re(y){return Math.min(s.maxSamples,y.samples)}function fe(y){const v=n.get(y);return o&&y.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function nt(y){const v=a.render.frame;l.get(y)!==v&&(l.set(y,v),y.update())}function Ne(y,v){const N=y.colorSpace,J=y.format,Z=y.type;return y.isCompressedTexture===!0||y.isVideoTexture===!0||y.format===Dr||N!==fn&&N!==kt&&(Ye.getTransfer(N)===Je?o===!1?e.has("EXT_sRGB")===!0&&J===qt?(y.format=Dr,y.minFilter=zt,y.generateMipmaps=!1):v=fl.sRGBToLinear(v):(J!==qt||Z!==Tn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",N)),v}this.allocateTextureUnit=L,this.resetTextureUnits=ee,this.setTexture2D=G,this.setTexture2DArray=Y,this.setTexture3D=X,this.setTextureCube=q,this.rebindTextures=We,this.setupRenderTarget=U,this.updateRenderTargetMipmap=Et,this.updateMultisampleRenderTarget=Me,this.setupDepthRenderbuffer=Te,this.setupFrameBufferTexture=me,this.useMultisampledRTT=fe}function Jp(i,e,t){const n=t.isWebGL2;function s(r,a=kt){let o;const c=Ye.getTransfer(a);if(r===Tn)return i.UNSIGNED_BYTE;if(r===il)return i.UNSIGNED_SHORT_4_4_4_4;if(r===sl)return i.UNSIGNED_SHORT_5_5_5_1;if(r===Ic)return i.BYTE;if(r===Nc)return i.SHORT;if(r===Wr)return i.UNSIGNED_SHORT;if(r===nl)return i.INT;if(r===xn)return i.UNSIGNED_INT;if(r===Mn)return i.FLOAT;if(r===un)return n?i.HALF_FLOAT:(o=e.get("OES_texture_half_float"),o!==null?o.HALF_FLOAT_OES:null);if(r===Oc)return i.ALPHA;if(r===qt)return i.RGBA;if(r===Fc)return i.LUMINANCE;if(r===Bc)return i.LUMINANCE_ALPHA;if(r===Hn)return i.DEPTH_COMPONENT;if(r===Mi)return i.DEPTH_STENCIL;if(r===Dr)return o=e.get("EXT_sRGB"),o!==null?o.SRGB_ALPHA_EXT:null;if(r===zc)return i.RED;if(r===rl)return i.RED_INTEGER;if(r===Hc)return i.RG;if(r===al)return i.RG_INTEGER;if(r===ol)return i.RGBA_INTEGER;if(r===Hs||r===ks||r===Gs||r===Vs)if(c===Je)if(o=e.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(r===Hs)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===ks)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===Gs)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Vs)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=e.get("WEBGL_compressed_texture_s3tc"),o!==null){if(r===Hs)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===ks)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===Gs)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Vs)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===fa||r===da||r===pa||r===ma)if(o=e.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(r===fa)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===da)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===pa)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===ma)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===ll)return o=e.get("WEBGL_compressed_texture_etc1"),o!==null?o.COMPRESSED_RGB_ETC1_WEBGL:null;if(r===ga||r===_a)if(o=e.get("WEBGL_compressed_texture_etc"),o!==null){if(r===ga)return c===Je?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(r===_a)return c===Je?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===va||r===xa||r===Ma||r===Sa||r===ya||r===Ea||r===Ta||r===Aa||r===wa||r===ba||r===Ra||r===Ca||r===La||r===Pa)if(o=e.get("WEBGL_compressed_texture_astc"),o!==null){if(r===va)return c===Je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===xa)return c===Je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===Ma)return c===Je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===Sa)return c===Je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===ya)return c===Je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===Ea)return c===Je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===Ta)return c===Je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===Aa)return c===Je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===wa)return c===Je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===ba)return c===Je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===Ra)return c===Je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===Ca)return c===Je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===La)return c===Je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===Pa)return c===Je?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===Ws||r===Da||r===Ua)if(o=e.get("EXT_texture_compression_bptc"),o!==null){if(r===Ws)return c===Je?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===Da)return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===Ua)return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===kc||r===Ia||r===Na||r===Oa)if(o=e.get("EXT_texture_compression_rgtc"),o!==null){if(r===Ws)return o.COMPRESSED_RED_RGTC1_EXT;if(r===Ia)return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===Na)return o.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===Oa)return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===zn?n?i.UNSIGNED_INT_24_8:(o=e.get("WEBGL_depth_texture"),o!==null?o.UNSIGNED_INT_24_8_WEBGL:null):i[r]!==void 0?i[r]:null}return{convert:s}}class Qp extends Nt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Sn extends yt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const em={type:"move"};class mr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Sn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Sn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new b,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new b),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Sn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new b,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new b),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null;const o=this._targetRay,c=this._grip,h=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(h&&e.hand){a=!0;for(const g of e.hand.values()){const d=t.getJointPose(g,n),u=this._getHandJoint(h,g);d!==null&&(u.matrix.fromArray(d.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,u.jointRadius=d.radius),u.visible=d!==null}const l=h.joints["index-finger-tip"],f=h.joints["thumb-tip"],p=l.position.distanceTo(f.position),m=.02,_=.005;h.inputState.pinching&&p>m+_?(h.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!h.inputState.pinching&&p<=m-_&&(h.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(em)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),h!==null&&(h.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Sn;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class tm extends Ti{constructor(e,t){super();const n=this;let s=null,r=1,a=null,o="local-floor",c=1,h=null,l=null,f=null,p=null,m=null,_=null;const g=t.getContextAttributes();let d=null,u=null;const E=[],M=[],A=new _e;let P=null;const R=new Nt;R.layers.enable(1),R.viewport=new tt;const w=new Nt;w.layers.enable(2),w.viewport=new tt;const H=[R,w],x=new Qp;x.layers.enable(1),x.layers.enable(2);let T=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(k){let $=E[k];return $===void 0&&($=new mr,E[k]=$),$.getTargetRaySpace()},this.getControllerGrip=function(k){let $=E[k];return $===void 0&&($=new mr,E[k]=$),$.getGripSpace()},this.getHand=function(k){let $=E[k];return $===void 0&&($=new mr,E[k]=$),$.getHandSpace()};function V(k){const $=M.indexOf(k.inputSource);if($===-1)return;const le=E[$];le!==void 0&&(le.update(k.inputSource,k.frame,h||a),le.dispatchEvent({type:k.type,data:k.inputSource}))}function ee(){s.removeEventListener("select",V),s.removeEventListener("selectstart",V),s.removeEventListener("selectend",V),s.removeEventListener("squeeze",V),s.removeEventListener("squeezestart",V),s.removeEventListener("squeezeend",V),s.removeEventListener("end",ee),s.removeEventListener("inputsourceschange",L);for(let k=0;k<E.length;k++){const $=M[k];$!==null&&(M[k]=null,E[k].disconnect($))}T=null,z=null,e.setRenderTarget(d),m=null,p=null,f=null,s=null,u=null,ne.stop(),n.isPresenting=!1,e.setPixelRatio(P),e.setSize(A.width,A.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(k){r=k,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(k){o=k,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return h||a},this.setReferenceSpace=function(k){h=k},this.getBaseLayer=function(){return p!==null?p:m},this.getBinding=function(){return f},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(k){if(s=k,s!==null){if(d=e.getRenderTarget(),s.addEventListener("select",V),s.addEventListener("selectstart",V),s.addEventListener("selectend",V),s.addEventListener("squeeze",V),s.addEventListener("squeezestart",V),s.addEventListener("squeezeend",V),s.addEventListener("end",ee),s.addEventListener("inputsourceschange",L),g.xrCompatible!==!0&&await t.makeXRCompatible(),P=e.getPixelRatio(),e.getSize(A),s.renderState.layers===void 0||e.capabilities.isWebGL2===!1){const $={antialias:s.renderState.layers===void 0?g.antialias:!0,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,t,$),s.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),u=new Yt(m.framebufferWidth,m.framebufferHeight,{format:qt,type:Tn,colorSpace:e.outputColorSpace,stencilBuffer:g.stencil})}else{let $=null,le=null,ge=null;g.depth&&(ge=g.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,$=g.stencil?Mi:Hn,le=g.stencil?zn:xn);const me={colorFormat:t.RGBA8,depthFormat:ge,scaleFactor:r};f=new XRWebGLBinding(s,t),p=f.createProjectionLayer(me),s.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),u=new Yt(p.textureWidth,p.textureHeight,{format:qt,type:Tn,depthTexture:new Al(p.textureWidth,p.textureHeight,le,void 0,void 0,void 0,void 0,void 0,void 0,$),stencilBuffer:g.stencil,colorSpace:e.outputColorSpace,samples:g.antialias?4:0});const Le=e.properties.get(u);Le.__ignoreDepthValues=p.ignoreDepthValues}u.isXRRenderTarget=!0,this.setFoveation(c),h=null,a=await s.requestReferenceSpace(o),ne.setContext(s),ne.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode};function L(k){for(let $=0;$<k.removed.length;$++){const le=k.removed[$],ge=M.indexOf(le);ge>=0&&(M[ge]=null,E[ge].disconnect(le))}for(let $=0;$<k.added.length;$++){const le=k.added[$];let ge=M.indexOf(le);if(ge===-1){for(let Le=0;Le<E.length;Le++)if(Le>=M.length){M.push(le),ge=Le;break}else if(M[Le]===null){M[Le]=le,ge=Le;break}if(ge===-1)break}const me=E[ge];me&&me.connect(le)}}const F=new b,G=new b;function Y(k,$,le){F.setFromMatrixPosition($.matrixWorld),G.setFromMatrixPosition(le.matrixWorld);const ge=F.distanceTo(G),me=$.projectionMatrix.elements,Le=le.projectionMatrix.elements,De=me[14]/(me[10]-1),Te=me[14]/(me[10]+1),We=(me[9]+1)/me[5],U=(me[9]-1)/me[5],Et=(me[8]-1)/me[0],Me=(Le[8]+1)/Le[0],Re=De*Et,fe=De*Me,nt=ge/(-Et+Me),Ne=nt*-Et;$.matrixWorld.decompose(k.position,k.quaternion,k.scale),k.translateX(Ne),k.translateZ(nt),k.matrixWorld.compose(k.position,k.quaternion,k.scale),k.matrixWorldInverse.copy(k.matrixWorld).invert();const y=De+nt,v=Te+nt,N=Re-Ne,J=fe+(ge-Ne),Z=We*Te/v*y,Q=U*Te/v*y;k.projectionMatrix.makePerspective(N,J,Z,Q,y,v),k.projectionMatrixInverse.copy(k.projectionMatrix).invert()}function X(k,$){$===null?k.matrixWorld.copy(k.matrix):k.matrixWorld.multiplyMatrices($.matrixWorld,k.matrix),k.matrixWorldInverse.copy(k.matrixWorld).invert()}this.updateCamera=function(k){if(s===null)return;x.near=w.near=R.near=k.near,x.far=w.far=R.far=k.far,(T!==x.near||z!==x.far)&&(s.updateRenderState({depthNear:x.near,depthFar:x.far}),T=x.near,z=x.far);const $=k.parent,le=x.cameras;X(x,$);for(let ge=0;ge<le.length;ge++)X(le[ge],$);le.length===2?Y(x,R,w):x.projectionMatrix.copy(R.projectionMatrix),q(k,x,$)};function q(k,$,le){le===null?k.matrix.copy($.matrixWorld):(k.matrix.copy(le.matrixWorld),k.matrix.invert(),k.matrix.multiply($.matrixWorld)),k.matrix.decompose(k.position,k.quaternion,k.scale),k.updateMatrixWorld(!0),k.projectionMatrix.copy($.projectionMatrix),k.projectionMatrixInverse.copy($.projectionMatrixInverse),k.isPerspectiveCamera&&(k.fov=Ur*2*Math.atan(1/k.projectionMatrix.elements[5]),k.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(p===null&&m===null))return c},this.setFoveation=function(k){c=k,p!==null&&(p.fixedFoveation=k),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=k)};let K=null;function te(k,$){if(l=$.getViewerPose(h||a),_=$,l!==null){const le=l.views;m!==null&&(e.setRenderTargetFramebuffer(u,m.framebuffer),e.setRenderTarget(u));let ge=!1;le.length!==x.cameras.length&&(x.cameras.length=0,ge=!0);for(let me=0;me<le.length;me++){const Le=le[me];let De=null;if(m!==null)De=m.getViewport(Le);else{const We=f.getViewSubImage(p,Le);De=We.viewport,me===0&&(e.setRenderTargetTextures(u,We.colorTexture,p.ignoreDepthValues?void 0:We.depthStencilTexture),e.setRenderTarget(u))}let Te=H[me];Te===void 0&&(Te=new Nt,Te.layers.enable(me),Te.viewport=new tt,H[me]=Te),Te.matrix.fromArray(Le.transform.matrix),Te.matrix.decompose(Te.position,Te.quaternion,Te.scale),Te.projectionMatrix.fromArray(Le.projectionMatrix),Te.projectionMatrixInverse.copy(Te.projectionMatrix).invert(),Te.viewport.set(De.x,De.y,De.width,De.height),me===0&&(x.matrix.copy(Te.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),ge===!0&&x.cameras.push(Te)}}for(let le=0;le<E.length;le++){const ge=M[le],me=E[le];ge!==null&&me!==void 0&&me.update(ge,$,h||a)}K&&K(k,$),$.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:$}),_=null}const ne=new El;ne.setAnimationLoop(te),this.setAnimationLoop=function(k){K=k},this.dispose=function(){}}}function nm(i,e){function t(d,u){d.matrixAutoUpdate===!0&&d.updateMatrix(),u.value.copy(d.matrix)}function n(d,u){u.color.getRGB(d.fogColor.value,Ml(i)),u.isFog?(d.fogNear.value=u.near,d.fogFar.value=u.far):u.isFogExp2&&(d.fogDensity.value=u.density)}function s(d,u,E,M,A){u.isMeshBasicMaterial||u.isMeshLambertMaterial?r(d,u):u.isMeshToonMaterial?(r(d,u),f(d,u)):u.isMeshPhongMaterial?(r(d,u),l(d,u)):u.isMeshStandardMaterial?(r(d,u),p(d,u),u.isMeshPhysicalMaterial&&m(d,u,A)):u.isMeshMatcapMaterial?(r(d,u),_(d,u)):u.isMeshDepthMaterial?r(d,u):u.isMeshDistanceMaterial?(r(d,u),g(d,u)):u.isMeshNormalMaterial?r(d,u):u.isLineBasicMaterial?(a(d,u),u.isLineDashedMaterial&&o(d,u)):u.isPointsMaterial?c(d,u,E,M):u.isSpriteMaterial?h(d,u):u.isShadowMaterial?(d.color.value.copy(u.color),d.opacity.value=u.opacity):u.isShaderMaterial&&(u.uniformsNeedUpdate=!1)}function r(d,u){d.opacity.value=u.opacity,u.color&&d.diffuse.value.copy(u.color),u.emissive&&d.emissive.value.copy(u.emissive).multiplyScalar(u.emissiveIntensity),u.map&&(d.map.value=u.map,t(u.map,d.mapTransform)),u.alphaMap&&(d.alphaMap.value=u.alphaMap,t(u.alphaMap,d.alphaMapTransform)),u.bumpMap&&(d.bumpMap.value=u.bumpMap,t(u.bumpMap,d.bumpMapTransform),d.bumpScale.value=u.bumpScale,u.side===Ct&&(d.bumpScale.value*=-1)),u.normalMap&&(d.normalMap.value=u.normalMap,t(u.normalMap,d.normalMapTransform),d.normalScale.value.copy(u.normalScale),u.side===Ct&&d.normalScale.value.negate()),u.displacementMap&&(d.displacementMap.value=u.displacementMap,t(u.displacementMap,d.displacementMapTransform),d.displacementScale.value=u.displacementScale,d.displacementBias.value=u.displacementBias),u.emissiveMap&&(d.emissiveMap.value=u.emissiveMap,t(u.emissiveMap,d.emissiveMapTransform)),u.specularMap&&(d.specularMap.value=u.specularMap,t(u.specularMap,d.specularMapTransform)),u.alphaTest>0&&(d.alphaTest.value=u.alphaTest);const E=e.get(u).envMap;if(E&&(d.envMap.value=E,d.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,d.reflectivity.value=u.reflectivity,d.ior.value=u.ior,d.refractionRatio.value=u.refractionRatio),u.lightMap){d.lightMap.value=u.lightMap;const M=i._useLegacyLights===!0?Math.PI:1;d.lightMapIntensity.value=u.lightMapIntensity*M,t(u.lightMap,d.lightMapTransform)}u.aoMap&&(d.aoMap.value=u.aoMap,d.aoMapIntensity.value=u.aoMapIntensity,t(u.aoMap,d.aoMapTransform))}function a(d,u){d.diffuse.value.copy(u.color),d.opacity.value=u.opacity,u.map&&(d.map.value=u.map,t(u.map,d.mapTransform))}function o(d,u){d.dashSize.value=u.dashSize,d.totalSize.value=u.dashSize+u.gapSize,d.scale.value=u.scale}function c(d,u,E,M){d.diffuse.value.copy(u.color),d.opacity.value=u.opacity,d.size.value=u.size*E,d.scale.value=M*.5,u.map&&(d.map.value=u.map,t(u.map,d.uvTransform)),u.alphaMap&&(d.alphaMap.value=u.alphaMap,t(u.alphaMap,d.alphaMapTransform)),u.alphaTest>0&&(d.alphaTest.value=u.alphaTest)}function h(d,u){d.diffuse.value.copy(u.color),d.opacity.value=u.opacity,d.rotation.value=u.rotation,u.map&&(d.map.value=u.map,t(u.map,d.mapTransform)),u.alphaMap&&(d.alphaMap.value=u.alphaMap,t(u.alphaMap,d.alphaMapTransform)),u.alphaTest>0&&(d.alphaTest.value=u.alphaTest)}function l(d,u){d.specular.value.copy(u.specular),d.shininess.value=Math.max(u.shininess,1e-4)}function f(d,u){u.gradientMap&&(d.gradientMap.value=u.gradientMap)}function p(d,u){d.metalness.value=u.metalness,u.metalnessMap&&(d.metalnessMap.value=u.metalnessMap,t(u.metalnessMap,d.metalnessMapTransform)),d.roughness.value=u.roughness,u.roughnessMap&&(d.roughnessMap.value=u.roughnessMap,t(u.roughnessMap,d.roughnessMapTransform)),e.get(u).envMap&&(d.envMapIntensity.value=u.envMapIntensity)}function m(d,u,E){d.ior.value=u.ior,u.sheen>0&&(d.sheenColor.value.copy(u.sheenColor).multiplyScalar(u.sheen),d.sheenRoughness.value=u.sheenRoughness,u.sheenColorMap&&(d.sheenColorMap.value=u.sheenColorMap,t(u.sheenColorMap,d.sheenColorMapTransform)),u.sheenRoughnessMap&&(d.sheenRoughnessMap.value=u.sheenRoughnessMap,t(u.sheenRoughnessMap,d.sheenRoughnessMapTransform))),u.clearcoat>0&&(d.clearcoat.value=u.clearcoat,d.clearcoatRoughness.value=u.clearcoatRoughness,u.clearcoatMap&&(d.clearcoatMap.value=u.clearcoatMap,t(u.clearcoatMap,d.clearcoatMapTransform)),u.clearcoatRoughnessMap&&(d.clearcoatRoughnessMap.value=u.clearcoatRoughnessMap,t(u.clearcoatRoughnessMap,d.clearcoatRoughnessMapTransform)),u.clearcoatNormalMap&&(d.clearcoatNormalMap.value=u.clearcoatNormalMap,t(u.clearcoatNormalMap,d.clearcoatNormalMapTransform),d.clearcoatNormalScale.value.copy(u.clearcoatNormalScale),u.side===Ct&&d.clearcoatNormalScale.value.negate())),u.iridescence>0&&(d.iridescence.value=u.iridescence,d.iridescenceIOR.value=u.iridescenceIOR,d.iridescenceThicknessMinimum.value=u.iridescenceThicknessRange[0],d.iridescenceThicknessMaximum.value=u.iridescenceThicknessRange[1],u.iridescenceMap&&(d.iridescenceMap.value=u.iridescenceMap,t(u.iridescenceMap,d.iridescenceMapTransform)),u.iridescenceThicknessMap&&(d.iridescenceThicknessMap.value=u.iridescenceThicknessMap,t(u.iridescenceThicknessMap,d.iridescenceThicknessMapTransform))),u.transmission>0&&(d.transmission.value=u.transmission,d.transmissionSamplerMap.value=E.texture,d.transmissionSamplerSize.value.set(E.width,E.height),u.transmissionMap&&(d.transmissionMap.value=u.transmissionMap,t(u.transmissionMap,d.transmissionMapTransform)),d.thickness.value=u.thickness,u.thicknessMap&&(d.thicknessMap.value=u.thicknessMap,t(u.thicknessMap,d.thicknessMapTransform)),d.attenuationDistance.value=u.attenuationDistance,d.attenuationColor.value.copy(u.attenuationColor)),u.anisotropy>0&&(d.anisotropyVector.value.set(u.anisotropy*Math.cos(u.anisotropyRotation),u.anisotropy*Math.sin(u.anisotropyRotation)),u.anisotropyMap&&(d.anisotropyMap.value=u.anisotropyMap,t(u.anisotropyMap,d.anisotropyMapTransform))),d.specularIntensity.value=u.specularIntensity,d.specularColor.value.copy(u.specularColor),u.specularColorMap&&(d.specularColorMap.value=u.specularColorMap,t(u.specularColorMap,d.specularColorMapTransform)),u.specularIntensityMap&&(d.specularIntensityMap.value=u.specularIntensityMap,t(u.specularIntensityMap,d.specularIntensityMapTransform))}function _(d,u){u.matcap&&(d.matcap.value=u.matcap)}function g(d,u){const E=e.get(u).light;d.referencePosition.value.setFromMatrixPosition(E.matrixWorld),d.nearDistance.value=E.shadow.camera.near,d.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function im(i,e,t,n){let s={},r={},a=[];const o=t.isWebGL2?i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS):0;function c(E,M){const A=M.program;n.uniformBlockBinding(E,A)}function h(E,M){let A=s[E.id];A===void 0&&(_(E),A=l(E),s[E.id]=A,E.addEventListener("dispose",d));const P=M.program;n.updateUBOMapping(E,P);const R=e.render.frame;r[E.id]!==R&&(p(E),r[E.id]=R)}function l(E){const M=f();E.__bindingPointIndex=M;const A=i.createBuffer(),P=E.__size,R=E.usage;return i.bindBuffer(i.UNIFORM_BUFFER,A),i.bufferData(i.UNIFORM_BUFFER,P,R),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,M,A),A}function f(){for(let E=0;E<o;E++)if(a.indexOf(E)===-1)return a.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(E){const M=s[E.id],A=E.uniforms,P=E.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let R=0,w=A.length;R<w;R++){const H=Array.isArray(A[R])?A[R]:[A[R]];for(let x=0,T=H.length;x<T;x++){const z=H[x];if(m(z,R,x,P)===!0){const V=z.__offset,ee=Array.isArray(z.value)?z.value:[z.value];let L=0;for(let F=0;F<ee.length;F++){const G=ee[F],Y=g(G);typeof G=="number"||typeof G=="boolean"?(z.__data[0]=G,i.bufferSubData(i.UNIFORM_BUFFER,V+L,z.__data)):G.isMatrix3?(z.__data[0]=G.elements[0],z.__data[1]=G.elements[1],z.__data[2]=G.elements[2],z.__data[3]=0,z.__data[4]=G.elements[3],z.__data[5]=G.elements[4],z.__data[6]=G.elements[5],z.__data[7]=0,z.__data[8]=G.elements[6],z.__data[9]=G.elements[7],z.__data[10]=G.elements[8],z.__data[11]=0):(G.toArray(z.__data,L),L+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,V,z.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function m(E,M,A,P){const R=E.value,w=M+"_"+A;if(P[w]===void 0)return typeof R=="number"||typeof R=="boolean"?P[w]=R:P[w]=R.clone(),!0;{const H=P[w];if(typeof R=="number"||typeof R=="boolean"){if(H!==R)return P[w]=R,!0}else if(H.equals(R)===!1)return H.copy(R),!0}return!1}function _(E){const M=E.uniforms;let A=0;const P=16;for(let w=0,H=M.length;w<H;w++){const x=Array.isArray(M[w])?M[w]:[M[w]];for(let T=0,z=x.length;T<z;T++){const V=x[T],ee=Array.isArray(V.value)?V.value:[V.value];for(let L=0,F=ee.length;L<F;L++){const G=ee[L],Y=g(G),X=A%P;X!==0&&P-X<Y.boundary&&(A+=P-X),V.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),V.__offset=A,A+=Y.storage}}}const R=A%P;return R>0&&(A+=P-R),E.__size=A,E.__cache={},this}function g(E){const M={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(M.boundary=4,M.storage=4):E.isVector2?(M.boundary=8,M.storage=8):E.isVector3||E.isColor?(M.boundary=16,M.storage=12):E.isVector4?(M.boundary=16,M.storage=16):E.isMatrix3?(M.boundary=48,M.storage=48):E.isMatrix4?(M.boundary=64,M.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),M}function d(E){const M=E.target;M.removeEventListener("dispose",d);const A=a.indexOf(M.__bindingPointIndex);a.splice(A,1),i.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function u(){for(const E in s)i.deleteBuffer(s[E]);a=[],s={},r={}}return{bind:c,update:h,dispose:u}}class Pl{constructor(e={}){const{canvas:t=Qc(),context:n=null,depth:s=!0,stencil:r=!0,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:h=!1,powerPreference:l="default",failIfMajorPerformanceCaveat:f=!1}=e;this.isWebGLRenderer=!0;let p;n!==null?p=n.getContextAttributes().alpha:p=a;const m=new Uint32Array(4),_=new Int32Array(4);let g=null,d=null;const u=[],E=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=ut,this._useLegacyLights=!1,this.toneMapping=En,this.toneMappingExposure=1;const M=this;let A=!1,P=0,R=0,w=null,H=-1,x=null;const T=new tt,z=new tt;let V=null;const ee=new xe(0);let L=0,F=t.width,G=t.height,Y=1,X=null,q=null;const K=new tt(0,0,F,G),te=new tt(0,0,F,G);let ne=!1;const k=new Yr;let $=!1,le=!1,ge=null;const me=new at,Le=new _e,De=new b,Te={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function We(){return w===null?Y:1}let U=n;function Et(S,D){for(let O=0;O<S.length;O++){const B=S[O],I=t.getContext(B,D);if(I!==null)return I}return null}try{const S={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:h,powerPreference:l,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Gr}`),t.addEventListener("webglcontextlost",ie,!1),t.addEventListener("webglcontextrestored",C,!1),t.addEventListener("webglcontextcreationerror",re,!1),U===null){const D=["webgl2","webgl","experimental-webgl"];if(M.isWebGL1Renderer===!0&&D.shift(),U=Et(D,S),U===null)throw Et(D)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}typeof WebGLRenderingContext<"u"&&U instanceof WebGLRenderingContext&&console.warn("THREE.WebGLRenderer: WebGL 1 support was deprecated in r153 and will be removed in r163."),U.getShaderPrecisionFormat===void 0&&(U.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(S){throw console.error("THREE.WebGLRenderer: "+S.message),S}let Me,Re,fe,nt,Ne,y,v,N,J,Z,Q,de,oe,he,Ee,Oe,j,qe,Ge,be,ve,ue,Ue,Xe;function st(){Me=new dd(U),Re=new od(U,Me,e),Me.init(Re),ue=new Jp(U,Me,Re),fe=new jp(U,Me,Re),nt=new gd(U),Ne=new Op,y=new Zp(U,Me,fe,Ne,Re,ue,nt),v=new cd(M),N=new fd(M),J=new Eh(U,Re),Ue=new rd(U,Me,J,Re),Z=new pd(U,J,nt,Ue),Q=new Md(U,Z,J,nt),Ge=new xd(U,Re,y),Oe=new ld(Ne),de=new Np(M,v,N,Me,Re,Ue,Oe),oe=new nm(M,Ne),he=new Bp,Ee=new Wp(Me,Re),qe=new sd(M,v,N,fe,Q,p,c),j=new $p(M,Q,Re),Xe=new im(U,nt,Re,fe),be=new ad(U,Me,nt,Re),ve=new md(U,Me,nt,Re),nt.programs=de.programs,M.capabilities=Re,M.extensions=Me,M.properties=Ne,M.renderLists=he,M.shadowMap=j,M.state=fe,M.info=nt}st();const ze=new tm(M,U);this.xr=ze,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const S=Me.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=Me.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return Y},this.setPixelRatio=function(S){S!==void 0&&(Y=S,this.setSize(F,G,!1))},this.getSize=function(S){return S.set(F,G)},this.setSize=function(S,D,O=!0){if(ze.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}F=S,G=D,t.width=Math.floor(S*Y),t.height=Math.floor(D*Y),O===!0&&(t.style.width=S+"px",t.style.height=D+"px"),this.setViewport(0,0,S,D)},this.getDrawingBufferSize=function(S){return S.set(F*Y,G*Y).floor()},this.setDrawingBufferSize=function(S,D,O){F=S,G=D,Y=O,t.width=Math.floor(S*O),t.height=Math.floor(D*O),this.setViewport(0,0,S,D)},this.getCurrentViewport=function(S){return S.copy(T)},this.getViewport=function(S){return S.copy(K)},this.setViewport=function(S,D,O,B){S.isVector4?K.set(S.x,S.y,S.z,S.w):K.set(S,D,O,B),fe.viewport(T.copy(K).multiplyScalar(Y).floor())},this.getScissor=function(S){return S.copy(te)},this.setScissor=function(S,D,O,B){S.isVector4?te.set(S.x,S.y,S.z,S.w):te.set(S,D,O,B),fe.scissor(z.copy(te).multiplyScalar(Y).floor())},this.getScissorTest=function(){return ne},this.setScissorTest=function(S){fe.setScissorTest(ne=S)},this.setOpaqueSort=function(S){X=S},this.setTransparentSort=function(S){q=S},this.getClearColor=function(S){return S.copy(qe.getClearColor())},this.setClearColor=function(){qe.setClearColor.apply(qe,arguments)},this.getClearAlpha=function(){return qe.getClearAlpha()},this.setClearAlpha=function(){qe.setClearAlpha.apply(qe,arguments)},this.clear=function(S=!0,D=!0,O=!0){let B=0;if(S){let I=!1;if(w!==null){const ce=w.texture.format;I=ce===ol||ce===al||ce===rl}if(I){const ce=w.texture.type,pe=ce===Tn||ce===xn||ce===Wr||ce===zn||ce===il||ce===sl,ye=qe.getClearColor(),we=qe.getClearAlpha(),Fe=ye.r,Ce=ye.g,Pe=ye.b;pe?(m[0]=Fe,m[1]=Ce,m[2]=Pe,m[3]=we,U.clearBufferuiv(U.COLOR,0,m)):(_[0]=Fe,_[1]=Ce,_[2]=Pe,_[3]=we,U.clearBufferiv(U.COLOR,0,_))}else B|=U.COLOR_BUFFER_BIT}D&&(B|=U.DEPTH_BUFFER_BIT),O&&(B|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),U.clear(B)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ie,!1),t.removeEventListener("webglcontextrestored",C,!1),t.removeEventListener("webglcontextcreationerror",re,!1),he.dispose(),Ee.dispose(),Ne.dispose(),v.dispose(),N.dispose(),Q.dispose(),Ue.dispose(),Xe.dispose(),de.dispose(),ze.dispose(),ze.removeEventListener("sessionstart",Tt),ze.removeEventListener("sessionend",Ze),ge&&(ge.dispose(),ge=null),At.stop()};function ie(S){S.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),A=!0}function C(){console.log("THREE.WebGLRenderer: Context Restored."),A=!1;const S=nt.autoReset,D=j.enabled,O=j.autoUpdate,B=j.needsUpdate,I=j.type;st(),nt.autoReset=S,j.enabled=D,j.autoUpdate=O,j.needsUpdate=B,j.type=I}function re(S){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function ae(S){const D=S.target;D.removeEventListener("dispose",ae),Ae(D)}function Ae(S){Se(S),Ne.remove(S)}function Se(S){const D=Ne.get(S).programs;D!==void 0&&(D.forEach(function(O){de.releaseProgram(O)}),S.isShaderMaterial&&de.releaseShaderCache(S))}this.renderBufferDirect=function(S,D,O,B,I,ce){D===null&&(D=Te);const pe=I.isMesh&&I.matrixWorld.determinant()<0,ye=Yl(S,D,O,B,I);fe.setMaterial(B,pe);let we=O.index,Fe=1;if(B.wireframe===!0){if(we=Z.getWireframeAttribute(O),we===void 0)return;Fe=2}const Ce=O.drawRange,Pe=O.attributes.position;let ot=Ce.start*Fe,Dt=(Ce.start+Ce.count)*Fe;ce!==null&&(ot=Math.max(ot,ce.start*Fe),Dt=Math.min(Dt,(ce.start+ce.count)*Fe)),we!==null?(ot=Math.max(ot,0),Dt=Math.min(Dt,we.count)):Pe!=null&&(ot=Math.max(ot,0),Dt=Math.min(Dt,Pe.count));const gt=Dt-ot;if(gt<0||gt===1/0)return;Ue.setup(I,B,ye,O,we);let Jt,it=be;if(we!==null&&(Jt=J.get(we),it=ve,it.setIndex(Jt)),I.isMesh)B.wireframe===!0?(fe.setLineWidth(B.wireframeLinewidth*We()),it.setMode(U.LINES)):it.setMode(U.TRIANGLES);else if(I.isLine){let He=B.linewidth;He===void 0&&(He=1),fe.setLineWidth(He*We()),I.isLineSegments?it.setMode(U.LINES):I.isLineLoop?it.setMode(U.LINE_LOOP):it.setMode(U.LINE_STRIP)}else I.isPoints?it.setMode(U.POINTS):I.isSprite&&it.setMode(U.TRIANGLES);if(I.isBatchedMesh)it.renderMultiDraw(I._multiDrawStarts,I._multiDrawCounts,I._multiDrawCount);else if(I.isInstancedMesh)it.renderInstances(ot,gt,I.count);else if(O.isInstancedBufferGeometry){const He=O._maxInstanceCount!==void 0?O._maxInstanceCount:1/0,Ns=Math.min(O.instanceCount,He);it.renderInstances(ot,gt,Ns)}else it.render(ot,gt)};function $e(S,D,O){S.transparent===!0&&S.side===an&&S.forceSinglePass===!1?(S.side=Ct,S.needsUpdate=!0,Vi(S,D,O),S.side=bn,S.needsUpdate=!0,Vi(S,D,O),S.side=an):Vi(S,D,O)}this.compile=function(S,D,O=null){O===null&&(O=S),d=Ee.get(O),d.init(),E.push(d),O.traverseVisible(function(I){I.isLight&&I.layers.test(D.layers)&&(d.pushLight(I),I.castShadow&&d.pushShadow(I))}),S!==O&&S.traverseVisible(function(I){I.isLight&&I.layers.test(D.layers)&&(d.pushLight(I),I.castShadow&&d.pushShadow(I))}),d.setupLights(M._useLegacyLights);const B=new Set;return S.traverse(function(I){const ce=I.material;if(ce)if(Array.isArray(ce))for(let pe=0;pe<ce.length;pe++){const ye=ce[pe];$e(ye,O,I),B.add(ye)}else $e(ce,O,I),B.add(ce)}),E.pop(),d=null,B},this.compileAsync=function(S,D,O=null){const B=this.compile(S,D,O);return new Promise(I=>{function ce(){if(B.forEach(function(pe){Ne.get(pe).currentProgram.isReady()&&B.delete(pe)}),B.size===0){I(S);return}setTimeout(ce,10)}Me.get("KHR_parallel_shader_compile")!==null?ce():setTimeout(ce,10)})};let je=null;function mt(S){je&&je(S)}function Tt(){At.stop()}function Ze(){At.start()}const At=new El;At.setAnimationLoop(mt),typeof self<"u"&&At.setContext(self),this.setAnimationLoop=function(S){je=S,ze.setAnimationLoop(S),S===null?At.stop():At.start()},ze.addEventListener("sessionstart",Tt),ze.addEventListener("sessionend",Ze),this.render=function(S,D){if(D!==void 0&&D.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(A===!0)return;S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),ze.enabled===!0&&ze.isPresenting===!0&&(ze.cameraAutoUpdate===!0&&ze.updateCamera(D),D=ze.getCamera()),S.isScene===!0&&S.onBeforeRender(M,S,D,w),d=Ee.get(S,E.length),d.init(),E.push(d),me.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),k.setFromProjectionMatrix(me),le=this.localClippingEnabled,$=Oe.init(this.clippingPlanes,le),g=he.get(S,u.length),g.init(),u.push(g),$t(S,D,0,M.sortObjects),g.finish(),M.sortObjects===!0&&g.sort(X,q),this.info.render.frame++,$===!0&&Oe.beginShadows();const O=d.state.shadowsArray;if(j.render(O,S,D),$===!0&&Oe.endShadows(),this.info.autoReset===!0&&this.info.reset(),qe.render(g,S),d.setupLights(M._useLegacyLights),D.isArrayCamera){const B=D.cameras;for(let I=0,ce=B.length;I<ce;I++){const pe=B[I];ea(g,S,pe,pe.viewport)}}else ea(g,S,D);w!==null&&(y.updateMultisampleRenderTarget(w),y.updateRenderTargetMipmap(w)),S.isScene===!0&&S.onAfterRender(M,S,D),Ue.resetDefaultState(),H=-1,x=null,E.pop(),E.length>0?d=E[E.length-1]:d=null,u.pop(),u.length>0?g=u[u.length-1]:g=null};function $t(S,D,O,B){if(S.visible===!1)return;if(S.layers.test(D.layers)){if(S.isGroup)O=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(D);else if(S.isLight)d.pushLight(S),S.castShadow&&d.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||k.intersectsSprite(S)){B&&De.setFromMatrixPosition(S.matrixWorld).applyMatrix4(me);const pe=Q.update(S),ye=S.material;ye.visible&&g.push(S,pe,ye,O,De.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||k.intersectsObject(S))){const pe=Q.update(S),ye=S.material;if(B&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),De.copy(S.boundingSphere.center)):(pe.boundingSphere===null&&pe.computeBoundingSphere(),De.copy(pe.boundingSphere.center)),De.applyMatrix4(S.matrixWorld).applyMatrix4(me)),Array.isArray(ye)){const we=pe.groups;for(let Fe=0,Ce=we.length;Fe<Ce;Fe++){const Pe=we[Fe],ot=ye[Pe.materialIndex];ot&&ot.visible&&g.push(S,pe,ot,O,De.z,Pe)}}else ye.visible&&g.push(S,pe,ye,O,De.z,null)}}const ce=S.children;for(let pe=0,ye=ce.length;pe<ye;pe++)$t(ce[pe],D,O,B)}function ea(S,D,O,B){const I=S.opaque,ce=S.transmissive,pe=S.transparent;d.setupLightsView(O),$===!0&&Oe.setGlobalState(M.clippingPlanes,O),ce.length>0&&ql(I,ce,D,O),B&&fe.viewport(T.copy(B)),I.length>0&&Gi(I,D,O),ce.length>0&&Gi(ce,D,O),pe.length>0&&Gi(pe,D,O),fe.buffers.depth.setTest(!0),fe.buffers.depth.setMask(!0),fe.buffers.color.setMask(!0),fe.setPolygonOffset(!1)}function ql(S,D,O,B){if((O.isScene===!0?O.overrideMaterial:null)!==null)return;const ce=Re.isWebGL2;ge===null&&(ge=new Yt(1,1,{generateMipmaps:!0,type:Me.has("EXT_color_buffer_half_float")?un:Tn,minFilter:Oi,samples:ce?4:0})),M.getDrawingBufferSize(Le),ce?ge.setSize(Le.x,Le.y):ge.setSize(Ir(Le.x),Ir(Le.y));const pe=M.getRenderTarget();M.setRenderTarget(ge),M.getClearColor(ee),L=M.getClearAlpha(),L<1&&M.setClearColor(16777215,.5),M.clear();const ye=M.toneMapping;M.toneMapping=En,Gi(S,O,B),y.updateMultisampleRenderTarget(ge),y.updateRenderTargetMipmap(ge);let we=!1;for(let Fe=0,Ce=D.length;Fe<Ce;Fe++){const Pe=D[Fe],ot=Pe.object,Dt=Pe.geometry,gt=Pe.material,Jt=Pe.group;if(gt.side===an&&ot.layers.test(B.layers)){const it=gt.side;gt.side=Ct,gt.needsUpdate=!0,ta(ot,O,B,Dt,gt,Jt),gt.side=it,gt.needsUpdate=!0,we=!0}}we===!0&&(y.updateMultisampleRenderTarget(ge),y.updateRenderTargetMipmap(ge)),M.setRenderTarget(pe),M.setClearColor(ee,L),M.toneMapping=ye}function Gi(S,D,O){const B=D.isScene===!0?D.overrideMaterial:null;for(let I=0,ce=S.length;I<ce;I++){const pe=S[I],ye=pe.object,we=pe.geometry,Fe=B===null?pe.material:B,Ce=pe.group;ye.layers.test(O.layers)&&ta(ye,D,O,we,Fe,Ce)}}function ta(S,D,O,B,I,ce){S.onBeforeRender(M,D,O,B,I,ce),S.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),I.onBeforeRender(M,D,O,B,S,ce),I.transparent===!0&&I.side===an&&I.forceSinglePass===!1?(I.side=Ct,I.needsUpdate=!0,M.renderBufferDirect(O,D,B,I,S,ce),I.side=bn,I.needsUpdate=!0,M.renderBufferDirect(O,D,B,I,S,ce),I.side=an):M.renderBufferDirect(O,D,B,I,S,ce),S.onAfterRender(M,D,O,B,I,ce)}function Vi(S,D,O){D.isScene!==!0&&(D=Te);const B=Ne.get(S),I=d.state.lights,ce=d.state.shadowsArray,pe=I.state.version,ye=de.getParameters(S,I.state,ce,D,O),we=de.getProgramCacheKey(ye);let Fe=B.programs;B.environment=S.isMeshStandardMaterial?D.environment:null,B.fog=D.fog,B.envMap=(S.isMeshStandardMaterial?N:v).get(S.envMap||B.environment),Fe===void 0&&(S.addEventListener("dispose",ae),Fe=new Map,B.programs=Fe);let Ce=Fe.get(we);if(Ce!==void 0){if(B.currentProgram===Ce&&B.lightsStateVersion===pe)return ia(S,ye),Ce}else ye.uniforms=de.getUniforms(S),S.onBuild(O,ye,M),S.onBeforeCompile(ye,M),Ce=de.acquireProgram(ye,we),Fe.set(we,Ce),B.uniforms=ye.uniforms;const Pe=B.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Pe.clippingPlanes=Oe.uniform),ia(S,ye),B.needsLights=$l(S),B.lightsStateVersion=pe,B.needsLights&&(Pe.ambientLightColor.value=I.state.ambient,Pe.lightProbe.value=I.state.probe,Pe.directionalLights.value=I.state.directional,Pe.directionalLightShadows.value=I.state.directionalShadow,Pe.spotLights.value=I.state.spot,Pe.spotLightShadows.value=I.state.spotShadow,Pe.rectAreaLights.value=I.state.rectArea,Pe.ltc_1.value=I.state.rectAreaLTC1,Pe.ltc_2.value=I.state.rectAreaLTC2,Pe.pointLights.value=I.state.point,Pe.pointLightShadows.value=I.state.pointShadow,Pe.hemisphereLights.value=I.state.hemi,Pe.directionalShadowMap.value=I.state.directionalShadowMap,Pe.directionalShadowMatrix.value=I.state.directionalShadowMatrix,Pe.spotShadowMap.value=I.state.spotShadowMap,Pe.spotLightMatrix.value=I.state.spotLightMatrix,Pe.spotLightMap.value=I.state.spotLightMap,Pe.pointShadowMap.value=I.state.pointShadowMap,Pe.pointShadowMatrix.value=I.state.pointShadowMatrix),B.currentProgram=Ce,B.uniformsList=null,Ce}function na(S){if(S.uniformsList===null){const D=S.currentProgram.getUniforms();S.uniformsList=_s.seqWithValue(D.seq,S.uniforms)}return S.uniformsList}function ia(S,D){const O=Ne.get(S);O.outputColorSpace=D.outputColorSpace,O.batching=D.batching,O.instancing=D.instancing,O.instancingColor=D.instancingColor,O.skinning=D.skinning,O.morphTargets=D.morphTargets,O.morphNormals=D.morphNormals,O.morphColors=D.morphColors,O.morphTargetsCount=D.morphTargetsCount,O.numClippingPlanes=D.numClippingPlanes,O.numIntersection=D.numClipIntersection,O.vertexAlphas=D.vertexAlphas,O.vertexTangents=D.vertexTangents,O.toneMapping=D.toneMapping}function Yl(S,D,O,B,I){D.isScene!==!0&&(D=Te),y.resetTextureUnits();const ce=D.fog,pe=B.isMeshStandardMaterial?D.environment:null,ye=w===null?M.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:fn,we=(B.isMeshStandardMaterial?N:v).get(B.envMap||pe),Fe=B.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,Ce=!!O.attributes.tangent&&(!!B.normalMap||B.anisotropy>0),Pe=!!O.morphAttributes.position,ot=!!O.morphAttributes.normal,Dt=!!O.morphAttributes.color;let gt=En;B.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(gt=M.toneMapping);const Jt=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,it=Jt!==void 0?Jt.length:0,He=Ne.get(B),Ns=d.state.lights;if($===!0&&(le===!0||S!==x)){const Ft=S===x&&B.id===H;Oe.setState(B,S,Ft)}let rt=!1;B.version===He.__version?(He.needsLights&&He.lightsStateVersion!==Ns.state.version||He.outputColorSpace!==ye||I.isBatchedMesh&&He.batching===!1||!I.isBatchedMesh&&He.batching===!0||I.isInstancedMesh&&He.instancing===!1||!I.isInstancedMesh&&He.instancing===!0||I.isSkinnedMesh&&He.skinning===!1||!I.isSkinnedMesh&&He.skinning===!0||I.isInstancedMesh&&He.instancingColor===!0&&I.instanceColor===null||I.isInstancedMesh&&He.instancingColor===!1&&I.instanceColor!==null||He.envMap!==we||B.fog===!0&&He.fog!==ce||He.numClippingPlanes!==void 0&&(He.numClippingPlanes!==Oe.numPlanes||He.numIntersection!==Oe.numIntersection)||He.vertexAlphas!==Fe||He.vertexTangents!==Ce||He.morphTargets!==Pe||He.morphNormals!==ot||He.morphColors!==Dt||He.toneMapping!==gt||Re.isWebGL2===!0&&He.morphTargetsCount!==it)&&(rt=!0):(rt=!0,He.__version=B.version);let Cn=He.currentProgram;rt===!0&&(Cn=Vi(B,D,I));let sa=!1,wi=!1,Os=!1;const vt=Cn.getUniforms(),Ln=He.uniforms;if(fe.useProgram(Cn.program)&&(sa=!0,wi=!0,Os=!0),B.id!==H&&(H=B.id,wi=!0),sa||x!==S){vt.setValue(U,"projectionMatrix",S.projectionMatrix),vt.setValue(U,"viewMatrix",S.matrixWorldInverse);const Ft=vt.map.cameraPosition;Ft!==void 0&&Ft.setValue(U,De.setFromMatrixPosition(S.matrixWorld)),Re.logarithmicDepthBuffer&&vt.setValue(U,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(B.isMeshPhongMaterial||B.isMeshToonMaterial||B.isMeshLambertMaterial||B.isMeshBasicMaterial||B.isMeshStandardMaterial||B.isShaderMaterial)&&vt.setValue(U,"isOrthographic",S.isOrthographicCamera===!0),x!==S&&(x=S,wi=!0,Os=!0)}if(I.isSkinnedMesh){vt.setOptional(U,I,"bindMatrix"),vt.setOptional(U,I,"bindMatrixInverse");const Ft=I.skeleton;Ft&&(Re.floatVertexTextures?(Ft.boneTexture===null&&Ft.computeBoneTexture(),vt.setValue(U,"boneTexture",Ft.boneTexture,y)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}I.isBatchedMesh&&(vt.setOptional(U,I,"batchingTexture"),vt.setValue(U,"batchingTexture",I._matricesTexture,y));const Fs=O.morphAttributes;if((Fs.position!==void 0||Fs.normal!==void 0||Fs.color!==void 0&&Re.isWebGL2===!0)&&Ge.update(I,O,Cn),(wi||He.receiveShadow!==I.receiveShadow)&&(He.receiveShadow=I.receiveShadow,vt.setValue(U,"receiveShadow",I.receiveShadow)),B.isMeshGouraudMaterial&&B.envMap!==null&&(Ln.envMap.value=we,Ln.flipEnvMap.value=we.isCubeTexture&&we.isRenderTargetTexture===!1?-1:1),wi&&(vt.setValue(U,"toneMappingExposure",M.toneMappingExposure),He.needsLights&&Kl(Ln,Os),ce&&B.fog===!0&&oe.refreshFogUniforms(Ln,ce),oe.refreshMaterialUniforms(Ln,B,Y,G,ge),_s.upload(U,na(He),Ln,y)),B.isShaderMaterial&&B.uniformsNeedUpdate===!0&&(_s.upload(U,na(He),Ln,y),B.uniformsNeedUpdate=!1),B.isSpriteMaterial&&vt.setValue(U,"center",I.center),vt.setValue(U,"modelViewMatrix",I.modelViewMatrix),vt.setValue(U,"normalMatrix",I.normalMatrix),vt.setValue(U,"modelMatrix",I.matrixWorld),B.isShaderMaterial||B.isRawShaderMaterial){const Ft=B.uniformsGroups;for(let Bs=0,jl=Ft.length;Bs<jl;Bs++)if(Re.isWebGL2){const ra=Ft[Bs];Xe.update(ra,Cn),Xe.bind(ra,Cn)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Cn}function Kl(S,D){S.ambientLightColor.needsUpdate=D,S.lightProbe.needsUpdate=D,S.directionalLights.needsUpdate=D,S.directionalLightShadows.needsUpdate=D,S.pointLights.needsUpdate=D,S.pointLightShadows.needsUpdate=D,S.spotLights.needsUpdate=D,S.spotLightShadows.needsUpdate=D,S.rectAreaLights.needsUpdate=D,S.hemisphereLights.needsUpdate=D}function $l(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return P},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(S,D,O){Ne.get(S.texture).__webglTexture=D,Ne.get(S.depthTexture).__webglTexture=O;const B=Ne.get(S);B.__hasExternalTextures=!0,B.__hasExternalTextures&&(B.__autoAllocateDepthBuffer=O===void 0,B.__autoAllocateDepthBuffer||Me.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),B.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(S,D){const O=Ne.get(S);O.__webglFramebuffer=D,O.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(S,D=0,O=0){w=S,P=D,R=O;let B=!0,I=null,ce=!1,pe=!1;if(S){const we=Ne.get(S);we.__useDefaultFramebuffer!==void 0?(fe.bindFramebuffer(U.FRAMEBUFFER,null),B=!1):we.__webglFramebuffer===void 0?y.setupRenderTarget(S):we.__hasExternalTextures&&y.rebindTextures(S,Ne.get(S.texture).__webglTexture,Ne.get(S.depthTexture).__webglTexture);const Fe=S.texture;(Fe.isData3DTexture||Fe.isDataArrayTexture||Fe.isCompressedArrayTexture)&&(pe=!0);const Ce=Ne.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Ce[D])?I=Ce[D][O]:I=Ce[D],ce=!0):Re.isWebGL2&&S.samples>0&&y.useMultisampledRTT(S)===!1?I=Ne.get(S).__webglMultisampledFramebuffer:Array.isArray(Ce)?I=Ce[O]:I=Ce,T.copy(S.viewport),z.copy(S.scissor),V=S.scissorTest}else T.copy(K).multiplyScalar(Y).floor(),z.copy(te).multiplyScalar(Y).floor(),V=ne;if(fe.bindFramebuffer(U.FRAMEBUFFER,I)&&Re.drawBuffers&&B&&fe.drawBuffers(S,I),fe.viewport(T),fe.scissor(z),fe.setScissorTest(V),ce){const we=Ne.get(S.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+D,we.__webglTexture,O)}else if(pe){const we=Ne.get(S.texture),Fe=D||0;U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,we.__webglTexture,O||0,Fe)}H=-1},this.readRenderTargetPixels=function(S,D,O,B,I,ce,pe){if(!(S&&S.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ye=Ne.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&pe!==void 0&&(ye=ye[pe]),ye){fe.bindFramebuffer(U.FRAMEBUFFER,ye);try{const we=S.texture,Fe=we.format,Ce=we.type;if(Fe!==qt&&ue.convert(Fe)!==U.getParameter(U.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const Pe=Ce===un&&(Me.has("EXT_color_buffer_half_float")||Re.isWebGL2&&Me.has("EXT_color_buffer_float"));if(Ce!==Tn&&ue.convert(Ce)!==U.getParameter(U.IMPLEMENTATION_COLOR_READ_TYPE)&&!(Ce===Mn&&(Re.isWebGL2||Me.has("OES_texture_float")||Me.has("WEBGL_color_buffer_float")))&&!Pe){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=S.width-B&&O>=0&&O<=S.height-I&&U.readPixels(D,O,B,I,ue.convert(Fe),ue.convert(Ce),ce)}finally{const we=w!==null?Ne.get(w).__webglFramebuffer:null;fe.bindFramebuffer(U.FRAMEBUFFER,we)}}},this.copyFramebufferToTexture=function(S,D,O=0){const B=Math.pow(2,-O),I=Math.floor(D.image.width*B),ce=Math.floor(D.image.height*B);y.setTexture2D(D,0),U.copyTexSubImage2D(U.TEXTURE_2D,O,0,0,S.x,S.y,I,ce),fe.unbindTexture()},this.copyTextureToTexture=function(S,D,O,B=0){const I=D.image.width,ce=D.image.height,pe=ue.convert(O.format),ye=ue.convert(O.type);y.setTexture2D(O,0),U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,O.flipY),U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),U.pixelStorei(U.UNPACK_ALIGNMENT,O.unpackAlignment),D.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,B,S.x,S.y,I,ce,pe,ye,D.image.data):D.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,B,S.x,S.y,D.mipmaps[0].width,D.mipmaps[0].height,pe,D.mipmaps[0].data):U.texSubImage2D(U.TEXTURE_2D,B,S.x,S.y,pe,ye,D.image),B===0&&O.generateMipmaps&&U.generateMipmap(U.TEXTURE_2D),fe.unbindTexture()},this.copyTextureToTexture3D=function(S,D,O,B,I=0){if(M.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const ce=S.max.x-S.min.x+1,pe=S.max.y-S.min.y+1,ye=S.max.z-S.min.z+1,we=ue.convert(B.format),Fe=ue.convert(B.type);let Ce;if(B.isData3DTexture)y.setTexture3D(B,0),Ce=U.TEXTURE_3D;else if(B.isDataArrayTexture||B.isCompressedArrayTexture)y.setTexture2DArray(B,0),Ce=U.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,B.flipY),U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),U.pixelStorei(U.UNPACK_ALIGNMENT,B.unpackAlignment);const Pe=U.getParameter(U.UNPACK_ROW_LENGTH),ot=U.getParameter(U.UNPACK_IMAGE_HEIGHT),Dt=U.getParameter(U.UNPACK_SKIP_PIXELS),gt=U.getParameter(U.UNPACK_SKIP_ROWS),Jt=U.getParameter(U.UNPACK_SKIP_IMAGES),it=O.isCompressedTexture?O.mipmaps[I]:O.image;U.pixelStorei(U.UNPACK_ROW_LENGTH,it.width),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,it.height),U.pixelStorei(U.UNPACK_SKIP_PIXELS,S.min.x),U.pixelStorei(U.UNPACK_SKIP_ROWS,S.min.y),U.pixelStorei(U.UNPACK_SKIP_IMAGES,S.min.z),O.isDataTexture||O.isData3DTexture?U.texSubImage3D(Ce,I,D.x,D.y,D.z,ce,pe,ye,we,Fe,it.data):O.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),U.compressedTexSubImage3D(Ce,I,D.x,D.y,D.z,ce,pe,ye,we,it.data)):U.texSubImage3D(Ce,I,D.x,D.y,D.z,ce,pe,ye,we,Fe,it),U.pixelStorei(U.UNPACK_ROW_LENGTH,Pe),U.pixelStorei(U.UNPACK_IMAGE_HEIGHT,ot),U.pixelStorei(U.UNPACK_SKIP_PIXELS,Dt),U.pixelStorei(U.UNPACK_SKIP_ROWS,gt),U.pixelStorei(U.UNPACK_SKIP_IMAGES,Jt),I===0&&B.generateMipmaps&&U.generateMipmap(Ce),fe.unbindTexture()},this.initTexture=function(S){S.isCubeTexture?y.setTextureCube(S,0):S.isData3DTexture?y.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?y.setTexture2DArray(S,0):y.setTexture2D(S,0),fe.unbindTexture()},this.resetState=function(){P=0,R=0,w=null,fe.reset(),Ue.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ln}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=e===qr?"display-p3":"srgb",t.unpackColorSpace=Ye.workingColorSpace===Rs?"display-p3":"srgb"}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===ut?kn:cl}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===kn?ut:fn}get useLegacyLights(){return console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights}set useLegacyLights(e){console.warn("THREE.WebGLRenderer: The property .useLegacyLights has been deprecated. Migrate your lighting according to the following guide: https://discourse.threejs.org/t/updates-to-lighting-in-three-js-r155/53733."),this._useLegacyLights=e}}class sm extends Pl{}sm.prototype.isWebGL1Renderer=!0;class $r{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new xe(e),this.density=t}clone(){return new $r(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class rm extends yt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}}class am{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Pr,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.version=0,this.uuid=An()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}get updateRange(){return console.warn("THREE.InterleavedBuffer: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=An()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=An()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const wt=new b;class ws{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)wt.fromBufferAttribute(this,t),wt.applyMatrix4(e),this.setXYZ(t,wt.x,wt.y,wt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)wt.fromBufferAttribute(this,t),wt.applyNormalMatrix(e),this.setXYZ(t,wt.x,wt.y,wt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)wt.fromBufferAttribute(this,t),wt.transformDirection(e),this.setXYZ(t,wt.x,wt.y,wt.z);return this}setX(e,t){return this.normalized&&(t=Ke(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Ke(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Ke(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Ke(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=on(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=on(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=on(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=on(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ke(t,this.array),n=Ke(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ke(t,this.array),n=Ke(n,this.array),s=Ke(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ke(t,this.array),n=Ke(n,this.array),s=Ke(s,this.array),r=Ke(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new Kt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new ws(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class jr extends Rn{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new xe(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let hi;const Pi=new b,ui=new b,fi=new b,di=new _e,Di=new _e,Dl=new at,fs=new b,Ui=new b,ds=new b,Ao=new _e,gr=new _e,wo=new _e;class bo extends yt{constructor(e=new jr){if(super(),this.isSprite=!0,this.type="Sprite",hi===void 0){hi=new Pt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new am(t,5);hi.setIndex([0,1,2,0,2,3]),hi.setAttribute("position",new ws(n,3,0,!1)),hi.setAttribute("uv",new ws(n,2,3,!1))}this.geometry=hi,this.material=e,this.center=new _e(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),ui.setFromMatrixScale(this.matrixWorld),Dl.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),fi.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ui.multiplyScalar(-fi.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const a=this.center;ps(fs.set(-.5,-.5,0),fi,a,ui,s,r),ps(Ui.set(.5,-.5,0),fi,a,ui,s,r),ps(ds.set(.5,.5,0),fi,a,ui,s,r),Ao.set(0,0),gr.set(1,0),wo.set(1,1);let o=e.ray.intersectTriangle(fs,Ui,ds,!1,Pi);if(o===null&&(ps(Ui.set(-.5,.5,0),fi,a,ui,s,r),gr.set(0,1),o=e.ray.intersectTriangle(fs,ds,Ui,!1,Pi),o===null))return;const c=e.ray.origin.distanceTo(Pi);c<e.near||c>e.far||t.push({distance:c,point:Pi.clone(),uv:Ht.getInterpolation(Pi,fs,Ui,ds,Ao,gr,wo,new _e),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function ps(i,e,t,n,s,r){di.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(Di.x=r*di.x-s*di.y,Di.y=s*di.x+r*di.y):Di.copy(di),i.copy(e),i.x+=Di.x,i.y+=Di.y,i.applyMatrix4(Dl)}class Ul extends Rn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new xe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Ro=new b,Co=new b,Lo=new at,_r=new ml,ms=new Cs;class om extends yt{constructor(e=new Pt,t=new Ul){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Ro.fromBufferAttribute(t,s-1),Co.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Ro.distanceTo(Co);e.setAttribute("lineDistance",new ft(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ms.copy(n.boundingSphere),ms.applyMatrix4(s),ms.radius+=r,e.ray.intersectsSphere(ms)===!1)return;Lo.copy(s).invert(),_r.copy(e.ray).applyMatrix4(Lo);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,h=new b,l=new b,f=new b,p=new b,m=this.isLineSegments?2:1,_=n.index,d=n.attributes.position;if(_!==null){const u=Math.max(0,a.start),E=Math.min(_.count,a.start+a.count);for(let M=u,A=E-1;M<A;M+=m){const P=_.getX(M),R=_.getX(M+1);if(h.fromBufferAttribute(d,P),l.fromBufferAttribute(d,R),_r.distanceSqToSegment(h,l,p,f)>c)continue;p.applyMatrix4(this.matrixWorld);const H=e.ray.origin.distanceTo(p);H<e.near||H>e.far||t.push({distance:H,point:f.clone().applyMatrix4(this.matrixWorld),index:M,face:null,faceIndex:null,object:this})}}else{const u=Math.max(0,a.start),E=Math.min(d.count,a.start+a.count);for(let M=u,A=E-1;M<A;M+=m){if(h.fromBufferAttribute(d,M),l.fromBufferAttribute(d,M+1),_r.distanceSqToSegment(h,l,p,f)>c)continue;p.applyMatrix4(this.matrixWorld);const R=e.ray.origin.distanceTo(p);R<e.near||R>e.far||t.push({distance:R,point:f.clone().applyMatrix4(this.matrixWorld),index:M,face:null,faceIndex:null,object:this})}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}class Zr extends Lt{constructor(e,t,n,s,r,a,o,c,h){super(e,t,n,s,r,a,o,c,h),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Ds extends Pt{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);const r=[],a=[],o=[],c=[],h=new b,l=new _e;a.push(0,0,0),o.push(0,0,1),c.push(.5,.5);for(let f=0,p=3;f<=t;f++,p+=3){const m=n+f/t*s;h.x=e*Math.cos(m),h.y=e*Math.sin(m),a.push(h.x,h.y,h.z),o.push(0,0,1),l.x=(a[p]/e+1)/2,l.y=(a[p+1]/e+1)/2,c.push(l.x,l.y)}for(let f=1;f<=t;f++)r.push(f,f+1,0);this.setIndex(r),this.setAttribute("position",new ft(a,3)),this.setAttribute("normal",new ft(o,3)),this.setAttribute("uv",new ft(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ds(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Us extends Pt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};const h=this;s=Math.floor(s),r=Math.floor(r);const l=[],f=[],p=[],m=[];let _=0;const g=[],d=n/2;let u=0;E(),a===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(l),this.setAttribute("position",new ft(f,3)),this.setAttribute("normal",new ft(p,3)),this.setAttribute("uv",new ft(m,2));function E(){const A=new b,P=new b;let R=0;const w=(t-e)/n;for(let H=0;H<=r;H++){const x=[],T=H/r,z=T*(t-e)+e;for(let V=0;V<=s;V++){const ee=V/s,L=ee*c+o,F=Math.sin(L),G=Math.cos(L);P.x=z*F,P.y=-T*n+d,P.z=z*G,f.push(P.x,P.y,P.z),A.set(F,w,G).normalize(),p.push(A.x,A.y,A.z),m.push(ee,1-T),x.push(_++)}g.push(x)}for(let H=0;H<s;H++)for(let x=0;x<r;x++){const T=g[x][H],z=g[x+1][H],V=g[x+1][H+1],ee=g[x][H+1];l.push(T,z,ee),l.push(z,V,ee),R+=6}h.addGroup(u,R,0),u+=R}function M(A){const P=_,R=new _e,w=new b;let H=0;const x=A===!0?e:t,T=A===!0?1:-1;for(let V=1;V<=s;V++)f.push(0,d*T,0),p.push(0,T,0),m.push(.5,.5),_++;const z=_;for(let V=0;V<=s;V++){const L=V/s*c+o,F=Math.cos(L),G=Math.sin(L);w.x=x*G,w.y=d*T,w.z=x*F,f.push(w.x,w.y,w.z),p.push(0,T,0),R.x=F*.5+.5,R.y=G*.5*T+.5,m.push(R.x,R.y),_++}for(let V=0;V<s;V++){const ee=P+V,L=z+V;A===!0?l.push(L,L+1,ee):l.push(L+1,L,ee),H+=3}h.addGroup(u,H,A===!0?1:2),u+=H}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Us(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Jr extends Pt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const c=Math.min(a+o,Math.PI);let h=0;const l=[],f=new b,p=new b,m=[],_=[],g=[],d=[];for(let u=0;u<=n;u++){const E=[],M=u/n;let A=0;u===0&&a===0?A=.5/t:u===n&&c===Math.PI&&(A=-.5/t);for(let P=0;P<=t;P++){const R=P/t;f.x=-e*Math.cos(s+R*r)*Math.sin(a+M*o),f.y=e*Math.cos(a+M*o),f.z=e*Math.sin(s+R*r)*Math.sin(a+M*o),_.push(f.x,f.y,f.z),p.copy(f).normalize(),g.push(p.x,p.y,p.z),d.push(R+A,1-M),E.push(h++)}l.push(E)}for(let u=0;u<n;u++)for(let E=0;E<t;E++){const M=l[u][E+1],A=l[u][E],P=l[u+1][E],R=l[u+1][E+1];(u!==0||a>0)&&m.push(M,A,R),(u!==n-1||c<Math.PI)&&m.push(A,P,R)}this.setIndex(m),this.setAttribute("position",new ft(_,3)),this.setAttribute("normal",new ft(g,3)),this.setAttribute("uv",new ft(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Jr(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Zt extends Rn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new xe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new xe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xr,this.normalScale=new _e(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class wn extends Rn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new xe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new xe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xr,this.normalScale=new _e(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=Vr,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Il extends yt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new xe(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}}const vr=new at,Po=new b,Do=new b;class lm{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new _e(512,512),this.map=null,this.mapPass=null,this.matrix=new at,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Yr,this._frameExtents=new _e(1,1),this._viewportCount=1,this._viewports=[new tt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Po.setFromMatrixPosition(e.matrixWorld),t.position.copy(Po),Do.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Do),t.updateMatrixWorld(),vr.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(vr),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(vr)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Uo=new at,Ii=new b,xr=new b;class cm extends lm{constructor(){super(new Nt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new _e(4,2),this._viewportCount=6,this._viewports=[new tt(2,1,1,1),new tt(0,1,1,1),new tt(3,1,1,1),new tt(1,1,1,1),new tt(3,0,1,1),new tt(1,0,1,1)],this._cubeDirections=[new b(1,0,0),new b(-1,0,0),new b(0,0,1),new b(0,0,-1),new b(0,1,0),new b(0,-1,0)],this._cubeUps=[new b(0,1,0),new b(0,1,0),new b(0,1,0),new b(0,1,0),new b(0,0,1),new b(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,s=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Ii.setFromMatrixPosition(e.matrixWorld),n.position.copy(Ii),xr.copy(n.position),xr.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(xr),n.updateMatrixWorld(),s.makeTranslation(-Ii.x,-Ii.y,-Ii.z),Uo.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Uo)}}class Vn extends Il{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new cm}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class hm extends Il{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class um{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Io(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=Io();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function Io(){return(typeof performance>"u"?Date:performance).now()}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Gr}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Gr);const Nl={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class Hi{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const fm=new Tl(-1,1,1,-1,0,1);class dm extends Pt{constructor(){super(),this.setAttribute("position",new ft([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new ft([0,2,0,0,2,0],2))}}const pm=new dm;class Ol{constructor(e){this._mesh=new lt(pm,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,fm)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}class mm extends Hi{constructor(e,t){super(),this.textureID=t!==void 0?t:"tDiffuse",e instanceof Ot?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=As.clone(e.uniforms),this.material=new Ot({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this.fsQuad=new Ol(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this.fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this.fsQuad.render(e))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class No extends Hi{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){const s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}}class gm extends Hi{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class _m{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){const n=e.getSize(new _e);this._width=n.width,this._height=n.height,t=new Yt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:un}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new mm(Nl),this.copyPass.material.blending=hn,this.clock=new um}swapBuffers(){const e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){const t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){e===void 0&&(e=this.clock.getDelta());const t=this.renderer.getRenderTarget();let n=!1;for(let s=0,r=this.passes.length;s<r;s++){const a=this.passes[s];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),a.needsSwap){if(n){const o=this.renderer.getContext(),c=this.renderer.state.buffers.stencil;c.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),c.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}No!==void 0&&(a instanceof No?n=!0:a instanceof gm&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){const t=this.renderer.getSize(new _e);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;const n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class vm extends Hi{constructor(e,t,n=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new xe}render(e,t,n){const s=e.autoClear;e.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor)),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=s}}const xm={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new xe(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			vec3 luma = vec3( 0.299, 0.587, 0.114 );

			float v = dot( texel.xyz, luma );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class yi extends Hi{constructor(e,t,n,s){super(),this.strength=t!==void 0?t:1,this.radius=n,this.threshold=s,this.resolution=e!==void 0?new _e(e.x,e.y):new _e(256,256),this.clearColor=new xe(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Yt(r,a,{type:un}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let f=0;f<this.nMips;f++){const p=new Yt(r,a,{type:un});p.texture.name="UnrealBloomPass.h"+f,p.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(p);const m=new Yt(r,a,{type:un});m.texture.name="UnrealBloomPass.v"+f,m.texture.generateMipmaps=!1,this.renderTargetsVertical.push(m),r=Math.round(r/2),a=Math.round(a/2)}const o=xm;this.highPassUniforms=As.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Ot({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];const c=[3,5,7,9,11];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let f=0;f<this.nMips;f++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(c[f])),this.separableBlurMaterials[f].uniforms.invSize.value=new _e(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;const h=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=h,this.bloomTintColors=[new b(1,1,1),new b(1,1,1),new b(1,1,1),new b(1,1,1),new b(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const l=Nl;this.copyUniforms=As.clone(l.uniforms),this.blendMaterial=new Ot({uniforms:this.copyUniforms,vertexShader:l.vertexShader,fragmentShader:l.fragmentShader,blending:Ar,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new xe,this.oldClearAlpha=1,this.basic=new cn,this.fsQuad=new Ol(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new _e(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(e,t,n,s,r){e.getClearColor(this._oldClearColor),this.oldClearAlpha=e.getClearAlpha();const a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=n.texture,e.setRenderTarget(null),e.clear(),this.fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this.fsQuad.render(e);let o=this.renderTargetBright;for(let c=0;c<this.nMips;c++)this.fsQuad.material=this.separableBlurMaterials[c],this.separableBlurMaterials[c].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[c].uniforms.direction.value=yi.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[c]),e.clear(),this.fsQuad.render(e),this.separableBlurMaterials[c].uniforms.colorTexture.value=this.renderTargetsHorizontal[c].texture,this.separableBlurMaterials[c].uniforms.direction.value=yi.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[c]),e.clear(),this.fsQuad.render(e),o=this.renderTargetsVertical[c];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this.fsQuad.render(e),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this.fsQuad.render(e)):(e.setRenderTarget(n),this.fsQuad.render(e)),e.setClearColor(this._oldClearColor,this.oldClearAlpha),e.autoClear=a}getSeperableBlurMaterial(e){const t=[];for(let n=0;n<e;n++)t.push(.39894*Math.exp(-.5*n*n/(e*e))/e);return new Ot({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new _e(.5,.5)},direction:{value:new _e(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(e){return new Ot({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}yi.BlurDirectionX=new _e(1,0);yi.BlurDirectionY=new _e(0,1);const Mm=2,Sm=6,Oo=4,Or=100,Fo=200,Bo=9,Mr=5.4,ym=.6,zo=1,Em=2,Ho=25,Tm=.16,Am=18,ko=.4,wm=1.6,bm=2,Fl=.15,Rm=25,Cm=1,Lm=1.5,Pm=22,Dm=480,Um=15,Im=8,Nm=120,Fr=60,Om=200,Fm=1.1,Bm=40,zm=2.6,Hm=30,km=80,Gm=300,Vm=60,Wm=50,Xm=100,qm=2e3,Ym=.65,Go=.15,Vo=.35,Br=5,Bl=3,Km=3,$m=5,Sr=6,jm=5,Zm=.55,Jm=.28,Qm=.13,zl=3,eg=10,Wo=25,tg=200,ng=1.35,yr=100;class Wn{constructor(e){W(this,"s");this.s=e>>>0}next(){this.s|=0,this.s=this.s+1831565813|0;let e=Math.imul(this.s^this.s>>>15,1|this.s);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}range(e,t){return e+this.next()*(t-e)}int(e,t){return Math.floor(this.range(e,t+1))}pick(e){return e[Math.floor(this.next()*e.length)]}chance(e){return this.next()<e}shuffle(e){const t=e.slice();for(let n=t.length-1;n>0;n--){const s=Math.floor(this.next()*(n+1));[t[n],t[s]]=[t[s],t[n]]}return t}}const Xo="ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";function ig(){let i="";const e=new Wn(Math.random()*4294967295>>>0);for(let t=0;t<4;t++)i+=Xo[e.int(0,Xo.length-1)];i+="_";for(let t=0;t<2;t++)i+=e.int(0,9);return i}function sg(i){let e=2166136261;for(let t=0;t<i.length;t++)e^=i.charCodeAt(t),e=Math.imul(e,16777619);return e>>>0}class rg{constructor(){W(this,"ctx",null);W(this,"master");W(this,"sfxBus");W(this,"musicBus");W(this,"voiceBus");W(this,"musicLayers",new Map);W(this,"musicTimer",null);W(this,"step",0);W(this,"bpm",132);W(this,"nextStepTime",0);W(this,"hitStreak",0);W(this,"lastHitTime",0)}init(){if(this.ctx)return;this.ctx=new AudioContext,this.master=this.ctx.createGain(),this.master.gain.value=.8,this.master.connect(this.ctx.destination),this.sfxBus=this.ctx.createGain(),this.sfxBus.gain.value=.9,this.sfxBus.connect(this.master),this.musicBus=this.ctx.createGain(),this.musicBus.gain.value=.34,this.musicBus.connect(this.master),this.voiceBus=this.ctx.createGain(),this.voiceBus.gain.value=1,this.voiceBus.connect(this.master);const e=["base","combat","aggression","rampage","boss"];for(const t of e){const n=this.ctx.createGain();n.gain.value=0,n.connect(this.musicBus),this.musicLayers.set(t,n)}this.setLayer("base",1)}resume(){this.ctx&&this.ctx.state==="suspended"&&this.ctx.resume()}setLayer(e,t,n=1.2){if(!this.ctx)return;const s=this.musicLayers.get(e);s&&(s.gain.cancelScheduledValues(this.ctx.currentTime),s.gain.setValueAtTime(s.gain.value,this.ctx.currentTime),s.gain.linearRampToValueAtTime(t,this.ctx.currentTime+n))}setMusicIntensity(e,t=!1){this.setLayer("base",1),this.setLayer("combat",e>=1?1:0),this.setLayer("aggression",e>=2?1:0),this.setLayer("rampage",e>=3?1:0),this.setLayer("boss",t?1:0)}musicDuckToDrone(){for(const e of["combat","aggression","rampage","boss"])this.setLayer(e,0,.15);this.setLayer("base",.4,.4)}startMusic(){if(!this.ctx||this.musicTimer!==null)return;this.nextStepTime=this.ctx.currentTime+.05,this.step=0;const e=60/this.bpm/4,t=()=>{if(this.ctx)for(;this.nextStepTime<this.ctx.currentTime+.12;)this.scheduleStep(this.step,this.nextStepTime,e),this.nextStepTime+=e,this.step=(this.step+1)%64};this.musicTimer=window.setInterval(t,40)}stopMusic(){this.musicTimer!==null&&(clearInterval(this.musicTimer),this.musicTimer=null)}scheduleStep(e,t,n){if(!this.ctx)return;const s=Math.floor(e/16),r=e%16,a=41.2,o=[0,2,3,5,7,8,10];if(r===0){const c=s%4===3?a*Math.pow(2,.25):a;this.tone(this.musicLayers.get("base"),c,t,n*15,"sawtooth",.2,300),this.tone(this.musicLayers.get("base"),c/2,t,n*15,"sine",.3,200)}if(r%4===0&&this.kick(this.musicLayers.get("combat"),t,.7),r%2===1&&this.hat(this.musicLayers.get("combat"),t,.1),r%2===0){const c=o[[0,0,3,5,0,0,6,5][r/2|0]];this.tone(this.musicLayers.get("aggression"),a*2*Math.pow(2,c/12),t,n*1.6,"square",.1,900)}(r===4||r===12)&&this.noiseBurst(this.musicLayers.get("aggression"),t,.09,.18,1800);{const c=[0,3,5,7,10,7,5,3][e%8];this.tone(this.musicLayers.get("rampage"),a*4*Math.pow(2,c/12),t,n*.9,"sawtooth",.07,2400)}(r===0||r===6||r===10)&&(this.tone(this.musicLayers.get("boss"),a*2,t,n*3,"sawtooth",.16,700),this.tone(this.musicLayers.get("boss"),a*2*Math.pow(2,6/12),t,n*3,"sawtooth",.12,700)),r%8===2&&this.kick(this.musicLayers.get("boss"),t,.9,90)}tone(e,t,n,s,r,a,o=4e3){if(!this.ctx)return;const c=this.ctx.createOscillator();c.type=r,c.frequency.value=t;const h=this.ctx.createBiquadFilter();h.type="lowpass",h.frequency.value=o;const l=this.ctx.createGain();l.gain.setValueAtTime(0,n),l.gain.linearRampToValueAtTime(a,n+.01),l.gain.exponentialRampToValueAtTime(.001,n+s),c.connect(h),h.connect(l),l.connect(e),c.start(n),c.stop(n+s+.05)}kick(e,t,n,s=150){if(!this.ctx)return;const r=this.ctx.createOscillator();r.type="sine",r.frequency.setValueAtTime(s,t),r.frequency.exponentialRampToValueAtTime(38,t+.11);const a=this.ctx.createGain();a.gain.setValueAtTime(n,t),a.gain.exponentialRampToValueAtTime(.001,t+.14),r.connect(a),a.connect(e),r.start(t),r.stop(t+.16)}hat(e,t,n){this.noiseBurst(e,t,.03,n,8e3,"highpass")}noiseBurst(e,t,n,s,r=3e3,a="bandpass",o=1){if(!this.ctx)return;const c=Math.max(1,Math.floor(this.ctx.sampleRate*n)),h=this.ctx.createBuffer(1,c,this.ctx.sampleRate),l=h.getChannelData(0);for(let _=0;_<c;_++)l[_]=Math.random()*2-1;const f=this.ctx.createBufferSource();f.buffer=h;const p=this.ctx.createBiquadFilter();p.type=a,p.frequency.value=r,p.Q.value=o;const m=this.ctx.createGain();m.gain.setValueAtTime(s,t),m.gain.exponentialRampToValueAtTime(.001,t+n),f.connect(p),p.connect(m),m.connect(e),f.start(t)}now(){return this.ctx?this.ctx.currentTime:0}shootPulse(){if(!this.ctx)return;const e=this.now();this.noiseBurst(this.sfxBus,e,.05,.3,2600),this.toneSfx(880+Math.random()*120,e,.06,"square",.16),this.toneSfx(140,e,.07,"sine",.3)}shootBreacher(){if(!this.ctx)return;const e=this.now();this.noiseBurst(this.sfxBus,e,.22,.55,900,"lowpass"),this.kickSfx(e,.8,120),this.toneSfx(320,e,.1,"sawtooth",.2,1200)}lanceChargeStart(){if(!this.ctx)return()=>{};const e=this.ctx.createOscillator();e.type="sawtooth",e.frequency.setValueAtTime(80,this.now()),e.frequency.linearRampToValueAtTime(900,this.now()+1.1);const t=this.ctx.createGain();t.gain.value=0,t.gain.linearRampToValueAtTime(.12,this.now()+.15);const n=this.ctx.createBiquadFilter();return n.type="lowpass",n.frequency.value=2e3,e.connect(n),n.connect(t),t.connect(this.sfxBus),e.start(),()=>{try{e.stop(),t.disconnect()}catch{}}}shootLance(e){if(!this.ctx)return;const t=this.now();this.noiseBurst(this.sfxBus,t,.3,.4,3e3),this.toneSfx(1600,t,.28,"sawtooth",.25,5e3),this.toneSfx(90,t,.3,"sine",.4),this.toneSfx(2e3+e*4,t,.15,"square",.12,6e3)}ripper(){if(!this.ctx)return;const e=this.now();this.noiseBurst(this.sfxBus,e,.08,.14,400+Math.random()*300,"bandpass",3)}dash(){if(!this.ctx)return;const e=this.now();this.noiseBurst(this.sfxBus,e,.18,.25,600,"bandpass",.6)}jumpLand(){this.ctx&&this.noiseBurst(this.sfxBus,this.now(),.06,.1,300,"lowpass")}hitmark(){if(!this.ctx)return;const e=this.now(),t=performance.now();t-this.lastHitTime>900&&(this.hitStreak=0),this.lastHitTime=t,this.hitStreak=Math.min(this.hitStreak+1,24);const n=1200*Math.pow(2,this.hitStreak*.03/1);this.toneSfx(n,e,.04,"square",.14,8e3)}killConfirm(){if(!this.ctx)return;const e=this.now(),t=1+(Math.random()-.5)*.08;this.noiseBurst(this.sfxBus,e,.03,.3,4e3,"highpass"),this.toneSfx(1560*t,e,.16,"sine",.28),this.toneSfx(2340*t,e+.01,.12,"sine",.14);const n=this.ctx.createOscillator();n.type="sine",n.frequency.setValueAtTime(110*t,e),n.frequency.exponentialRampToValueAtTime(40,e+.18);const s=this.ctx.createGain();s.gain.setValueAtTime(.5,e),s.gain.exponentialRampToValueAtTime(.001,e+.2),n.connect(s),s.connect(this.sfxBus),n.start(e),n.stop(e+.22)}headshotKill(){this.killConfirm(),this.ctx&&this.toneSfx(3120,this.now()+.02,.1,"sine",.18)}gloryKill(){if(!this.ctx)return;const e=this.now();this.noiseBurst(this.sfxBus,e,.3,.5,500,"lowpass"),this.noiseBurst(this.sfxBus,e+.05,.2,.4,1800,"bandpass",2),this.kickSfx(e,1,80),this.toneSfx(60,e,.4,"sine",.5)}playerHurt(){if(!this.ctx)return;const e=this.now();this.noiseBurst(this.sfxBus,e,.15,.35,400,"lowpass"),this.toneSfx(180,e,.12,"sawtooth",.2,800)}enemyDeath(){if(!this.ctx)return;const e=this.now();this.noiseBurst(this.sfxBus,e,.25,.3,700,"lowpass"),this.toneSfx(220,e,.2,"sawtooth",.16,900)}powerupReveal(e){if(!this.ctx)return;const t=this.now();if(e)[261.6,329.6,392,523.3,659.3,784].forEach((s,r)=>{this.toneSfx(s,t+r*.09,1.4,"sawtooth",.14,4e3),this.toneSfx(s*2,t+r*.09,1,"sine",.08)}),this.toneSfx(1046.5,t+.55,2,"sine",.16);else{for(let n=0;n<10;n++)this.noiseBurst(this.sfxBus,t+n*.05,.03,.08+n*.012,2e3);this.toneSfx(520,t+.5,.5,"sawtooth",.12,3e3)}}powerupPick(){if(!this.ctx)return;const e=this.now();this.toneSfx(660,e,.12,"square",.16),this.toneSfx(990,e+.08,.2,"square",.14)}shatter(){if(!this.ctx)return;const e=this.now();this.noiseBurst(this.sfxBus,e,.25,.3,5e3,"highpass"),this.noiseBurst(this.sfxBus,e+.03,.2,.2,3e3,"bandpass",4)}synergyFound(){if(!this.ctx)return;const e=this.now();[523,622,784,1046,1244].forEach((t,n)=>this.toneSfx(t,e+n*.07,.9,"sawtooth",.13,5e3))}doorOpen(){if(!this.ctx)return;const e=this.now();this.noiseBurst(this.sfxBus,e,.4,.15,250,"lowpass"),this.toneSfx(90,e,.35,"sawtooth",.1,400)}levelUp(){if(!this.ctx)return;const e=this.now();[440,554,659,880].forEach((t,n)=>this.toneSfx(t,e+n*.08,.4,"square",.12,4e3))}deathSting(){if(!this.ctx)return;const e=this.now(),t=this.ctx.createOscillator();t.type="sawtooth",t.frequency.setValueAtTime(220,e),t.frequency.exponentialRampToValueAtTime(40,e+1.4);const n=this.ctx.createBiquadFilter();n.type="lowpass",n.frequency.value=900;const s=this.ctx.createGain();s.gain.setValueAtTime(.3,e),s.gain.exponentialRampToValueAtTime(.001,e+1.5),t.connect(n),n.connect(s),s.connect(this.sfxBus),t.start(e),t.stop(e+1.6)}staggerReady(){this.ctx&&this.toneSfx(1980,this.now(),.09,"sine",.2)}bossRoar(){if(!this.ctx)return;const e=this.now(),t=this.ctx.createOscillator();t.type="sawtooth",t.frequency.setValueAtTime(70,e),t.frequency.linearRampToValueAtTime(160,e+.5),t.frequency.linearRampToValueAtTime(55,e+1.2);const n=this.ctx.createGain();n.gain.setValueAtTime(0,e),n.gain.linearRampToValueAtTime(.5,e+.2),n.gain.exponentialRampToValueAtTime(.001,e+1.4);const s=this.ctx.createBiquadFilter();s.type="lowpass",s.frequency.value=700,t.connect(s),s.connect(n),n.connect(this.sfxBus),t.start(e),t.stop(e+1.5),this.noiseBurst(this.sfxBus,e+.1,.8,.25,300,"lowpass")}toneSfx(e,t,n,s,r,a=8e3){if(!this.ctx)return;const o=this.ctx.createOscillator();o.type=s,o.frequency.value=e;const c=this.ctx.createBiquadFilter();c.type="lowpass",c.frequency.value=a;const h=this.ctx.createGain();h.gain.setValueAtTime(0,t),h.gain.linearRampToValueAtTime(r,t+.008),h.gain.exponentialRampToValueAtTime(.001,t+n),o.connect(c),c.connect(h),h.connect(this.sfxBus),o.start(t),o.stop(t+n+.05)}kickSfx(e,t,n=150){if(!this.ctx)return;const s=this.ctx.createOscillator();s.type="sine",s.frequency.setValueAtTime(n,e),s.frequency.exponentialRampToValueAtTime(36,e+.12);const r=this.ctx.createGain();r.gain.setValueAtTime(t,e),r.gain.exponentialRampToValueAtTime(.001,e+.16),s.connect(r),r.connect(this.sfxBus),s.start(e),s.stop(e+.18)}speak(e,t){if("speechSynthesis"in window)try{window.speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(e);n.rate=.92+t*.05+(Math.random()-.5)*t*.25,n.pitch=Math.max(.1,.55-t*.2+(Math.random()-.5)*t*.6),n.volume=.85;const s=window.speechSynthesis.getVoices(),r=s.find(a=>/en[-_]/i.test(a.lang)&&/male|daniel|google uk english male/i.test(a.name))||s.find(a=>/en[-_]/i.test(a.lang))||s[0];if(r&&(n.voice=r),t>.4&&Math.random()<t*.35){const a=e.split(" "),o=Math.floor(Math.random()*a.length);n.text=a.slice(0,o+1).join(" ")+"… "+a[o]+"… "+a.slice(o+1).join(" ")}window.speechSynthesis.speak(n)}catch{}}stopVoice(){try{window.speechSynthesis?.cancel()}catch{}}}const Be=new rg,zr=[{name:"FOUNDRY",fog:1313542,fogDensity:.045,floor:"#3a2a1a",wall:"#4a3520",accent:16744480,ambient:16748608,ambientIntensity:.35},{name:"ARCHIVE",fog:395794,fogDensity:.05,floor:"#1a2430",wall:"#22303f",accent:3840735,ambient:4227264,ambientIntensity:.3},{name:"THE CORE",fog:1180933,fogDensity:.055,floor:"#2a1212",wall:"#381818",accent:16719952,ambient:12595264,ambientIntensity:.32}],Hl={fog:657932,fogDensity:.03,floor:"#242428",wall:"#2e2e34",accent:5111658,ambient:8425632},Er={blue:3828447,red:12589080,gold:16757760,green:3858282};function Fi(i,e){const t=document.createElement("canvas");t.width=32,t.height=32;const n=t.getContext("2d");n.fillStyle=i,n.fillRect(0,0,32,32);const s=new xe(i);for(let a=0;a<90;a++){const o=(e.next()-.5)*.35,c=s.clone();c.offsetHSL(0,0,o*.12),n.fillStyle="#"+c.getHexString(),n.fillRect(e.int(0,31),e.int(0,31),e.int(1,3),e.int(1,2))}n.fillStyle="rgba(0,0,0,0.45)",n.fillRect(0,0,32,1),n.fillRect(0,16,32,1),n.fillRect(0,0,1,32),n.fillRect(16,0,1,32);const r=new Zr(t);return r.magFilter=ht,r.minFilter=ht,r.wrapS=r.wrapT=xs,r.generateMipmaps=!1,r.colorSpace=ut,r}function et(i,e,t,n,s,r,a){const o=new lt(new qn(i,e,t),n);return o.position.set(s,r,a),o}function Xn(i,e,t,n,s,r){return{min:new b(i-n/2,e,t-r/2),max:new b(i+n/2,e+s,t+r/2)}}function ag(i){const e=new Wn(i),t=[];t.push({type:"hub",door:"blue"});for(let n=0;n<Bl;n++)for(let s=0;s<Br;s++){const r=s===Br-1;let a;if(r)a="boss";else{const c=e.next();c<.14&&t.length>3?a="anomaly":c<.45?a="combat":c<.75?a="arena":a="gauntlet"}let o="blue";{const c=e.next();a==="boss"?o="red":c<.6?o="blue":c<.8?o="red":c<.92?o="gold":(o="green",a="anomaly")}t.push({type:a,door:o})}return t}function og(i,e,t,n){const s=new Wn(i^2654435769),r=ag(i),a=new Sn,o=[],c=[];let h=0;for(let l=0;l<r.length;l++){const f=r[l],p=Math.min(Bl-1,Math.floor(Math.max(0,l-1)/Br)),m=f.type==="hub"?Hl:zr[p];let _=22,g=22;if(f.type==="hub"?(_=16,g=14):f.type==="arena"?(_=30,g=30):f.type==="gauntlet"?(_=34,g=12):f.type==="anomaly"?(_=18,g=18):f.type==="boss"&&(_=34,g=34),l>0){const M=h+4,A=new Sn,P=new wn({map:Fi(m.floor,s)});P.map.repeat.set(8/4,1);const R=et(8,.2,4,P,M,-.1,0);A.add(R);const w=new wn({map:Fi(m.wall,s)});for(const H of[-1,1]){const x=et(8,4,.5,w,M,2,H*2.25);A.add(x),c.push(Xn(M,0,H*2.25,8,4,.5))}a.add(A),h+=8}const d=new b(h+_/2,0,0);h+=_;const u={index:l,type:f.type,biome:p,doorColor:f.door,center:d,w:_,d:g,colliders:[],group:new Sn,spawns:[],playerSpawn:new b(d.x-_/2+2,0,0),entryX:d.x-_/2,pedestalSpots:[],lights:[],cleared:!1,requiresClear:f.type==="combat"||f.type==="arena"||f.type==="gauntlet"||f.type==="boss",waves:f.type==="arena"?3:1,wave:0,gauntletTimer:f.type==="gauntlet"?45:0};if(lg(u,m,s,c),cg(u,m,s,t,n),u.requiresClear&&ug(u,s,f.door),l<r.length-1){const E=r[l+1];hg(u,E.door,E.type)}a.add(u.group),o.push(u)}return e.add(a),{rooms:o,group:a,allColliders:c}}function lg(i,e,t,n,s){const{center:r,w:a,d:o}=i,c=i.group,h=5,l=new wn({map:Fi(e.floor,t)});l.map.repeat.set(a/4,o/4);const f=et(a,.2,o,l,r.x,-.1,r.z);c.add(f);const p=new wn({color:657930}),m=et(a,.2,o,p,r.x,h+.1,r.z);c.add(m);const _=new wn({map:Fi(e.wall,t)});_.map.repeat.set(a/4,1.2);const g=.6,d=4,u=3.2;for(const w of[-1,1]){const H=et(a,h,g,_,r.x,h/2,r.z+w*(o/2));c.add(H);const x=Xn(r.x,0,r.z+w*(o/2),a,h,g);i.colliders.push(x),n.push(x)}const E=r.x-a/2;{const w=(a*0+o-d)/2;for(const x of[-1,1]){const T=et(g,h,w,_,E,h/2,r.z+x*(d/2+w/2));c.add(T);const z=Xn(E,0,r.z+x*(d/2+w/2),g,h,w);i.colliders.push(z),n.push(z)}const H=et(g,h-u,d,_,E,u+(h-u)/2,r.z);c.add(H)}const M=r.x+a/2;{const w=(o-d)/2;for(const x of[-1,1]){const T=et(g,h,w,_,M,h/2,r.z+x*(d/2+w/2));c.add(T);const z=Xn(M,0,r.z+x*(d/2+w/2),g,h,w);i.colliders.push(z),n.push(z)}const H=et(g,h-u,d,_,M,u+(h-u)/2,r.z);c.add(H)}const A=new Zt({color:1118481,emissive:new xe(e.accent),emissiveIntensity:1.6}),P=Math.max(2,Math.floor(a/8));for(let w=0;w<P;w++){const H=r.x-a/2+(w+.5)*(a/P),x=et(3,.1,.6,A,H,h-.05,r.z+(w%2===0?-o/4:o/4));if(c.add(x),w%2===0){const T=new Vn(e.accent,12,18,1.8);T.position.set(H,h-.8,r.z),c.add(T),i.lights.push(T)}}const R=new Vn(e.ambient,20,Math.max(a,o)*1.4,1.6);R.position.set(r.x,h-1,r.z),c.add(R),i.lights.push(R)}function cg(i,e,t,n,s){const{center:r,w:a,d:o}=i,c=i.group,h=new wn({map:Fi(e.wall,t)}),l=new Zt({color:1118481,emissive:new xe(e.accent),emissiveIntensity:2});if(i.type==="hub"){const p=et(1.2,1.6,.4,h,r.x+3,.8,r.z-o/2+1.2);c.add(p);const m=new lt(new Gn(1,1.1),new Zt({color:4352,emissive:new xe(5111658),emissiveIntensity:1.8}));m.position.set(r.x+3,1,r.z-o/2+1.45),c.add(m),i.terminal={pos:new b(r.x+3,0,r.z-o/2+2),read:!1,fragIdx:-1};const _=new cn({color:9076848}),g=Math.min(60,n);for(let u=0;u<g;u++){const E=et(.04,.35,.02,_,r.x-a/2+.4+u%20*.16,1.6+Math.floor(u/20)*.5,r.z-o/2+.35);E.rotation.z=(t.next()-.5)*.3,c.add(E)}if(s>=3){const u=et(1.8,.35,.7,new wn({color:4867132}),r.x-3,.18,r.z+2.5);u.rotation.y=t.next()*.8,c.add(u);const E=new lt(new Ds(1.1,12),new cn({color:4851720}));E.rotation.x=-Math.PI/2,E.position.set(r.x-3,.011,r.z+2.5),c.add(E)}if(s>=10){const u=new lt(new Gn(1.4,2.2),new Zt({color:9083562,metalness:.9,roughness:.1}));u.position.set(r.x-a/2+.4,1.4,r.z+3),u.rotation.y=Math.PI/2,c.add(u)}const d=new Vn(5111658,8,10,1.8);d.position.set(r.x+3,2.5,r.z-o/2+2),c.add(d),i.lights.push(d);return}if(i.type==="anomaly"){const p=new Zt({color:1714714,emissive:new xe(3858282),emissiveIntensity:.35});for(let d=0;d<5;d++){const u=t.range(1,3),E=et(u,t.range(2,4.5),u,p,r.x+t.range(-a/3,a/3),t.range(.5,2.5),r.z+t.range(-o/3,o/3));E.rotation.set(t.next()*.8,t.next()*3,t.next()*.8),c.add(E)}const m=new Vn(3858282,25,20,1.6);m.position.set(r.x,3.5,r.z),c.add(m),i.lights.push(m);const _=et(1.2,1.6,.4,h,r.x,.8,r.z+o/2-1.4);c.add(_);const g=new lt(new Gn(1,1.1),new Zt({color:4352,emissive:new xe(5111658),emissiveIntensity:2.2}));g.position.set(r.x,1,r.z+o/2-1.65),g.rotation.y=Math.PI,c.add(g),i.terminal={pos:new b(r.x,0,r.z+o/2-2.2),read:!1,fragIdx:-1},i.requiresClear=!1;return}const f=i.type==="boss"?4:t.int(3,6);for(let p=0;p<f;p++){const m=t.range(1.2,2.6),_=t.range(1,2.2),g=r.x+t.range(-a/2+4,a/2-4),d=r.z+t.range(-o/2+4,o/2-4),u=et(m,_,m,h,g,_/2,d);if(c.add(u),i.colliders.push(Xn(g,0,d,m,_,m)),t.chance(.5)){const E=et(m+.06,.08,m+.06,l,g,_+.04,d);c.add(E)}}if(i.type==="arena"){const p=new lt(new Us(4,4.4,.3,16),h);p.position.set(r.x,.15,r.z),c.add(p)}if(i.type==="gauntlet")for(let p=0;p<4;p++){const m=r.x-a/2+5+p*(a-10)/3,_=et(1.6,.15,.15,l,m,.1,r.z-o/2+.5);c.add(_);const g=_.clone();g.position.z=r.z+o/2-.5,c.add(g)}if(i.type==="boss"){for(const m of[-1,1])for(const _ of[-1,1]){const g=r.x+m*(a/2-4),d=r.z+_*(o/2-4),u=et(1.6,5,1.6,h,g,2.5,d);c.add(u),i.colliders.push(Xn(g,0,d,1.6,5,1.6));const E=et(1.8,.2,1.8,l,g,4.6,d);c.add(E)}const p=new Vn(e.accent,40,40,1.4);p.position.set(r.x,4.2,r.z),c.add(p),i.lights.push(p)}i.pedestalSpots=[new b(r.x+a/4,0,r.z-2.5),new b(r.x+a/4,0,r.z+2.5)]}function hg(i,e,t,n){const{center:s,w:r}=i,a=s.x+r/2,o=new Zt({color:1118481,emissive:new xe(Er[e]),emissiveIntensity:2.5}),c=i.group,h=et(.3,3.6,.3,o,a-.1,1.8,s.z-2.1),l=et(.3,3.6,.3,o,a-.1,1.8,s.z+2.1),f=et(.3,.4,4.5,o,a-.1,3.4,s.z);c.add(h,l,f);const p=new Zt({color:1710622,emissive:new xe(Er[e]),emissiveIntensity:.35,transparent:!0,opacity:.92}),m=et(.35,3.2,4,p,a,1.6,s.z);c.add(m);const _=Xn(a,0,s.z,.5,3.2,4.2);i.colliders.push(_),i.exitDoor={panel:m,frameMat:o,color:e,x:a,z:s.z,open:!1,nextType:t},i.exitDoor.collider=_;const g=new Vn(Er[e],10,9,1.8);g.position.set(a-1.5,2.5,s.z),c.add(g),i.lights.push(g)}function gs(i,e){if(!e.exitDoor||e.exitDoor.open)return;e.exitDoor.open=!0,e.exitDoor.panel.visible=!1;const t=e.exitDoor.collider,n=e.colliders.indexOf(t);n>=0&&e.colliders.splice(n,1);const s=i.allColliders.indexOf(t);s>=0&&i.allColliders.splice(s,1)}function ug(i,e,t){const{center:n,w:s,d:r,biome:a,type:o}=i,c=t==="red",h=t==="gold";let l=o==="boss"?0:e.int(3,5)+a*2;c&&(l=Math.floor(l*1.5)),h&&(l+=e.int(1,3)),o==="gauntlet"&&(l+=3);const p=[["drone","grunt","grunt","drone"],["grunt","stalker","spider","drone","grunt"],["brute","grunt","replica","stalker","brute","spider"]][a];for(let m=0;m<l;m++){let _=e.pick(p);_==="replica"&&i.index<12&&e.chance(.7)&&(_="grunt");const g=n.x+e.range(-s/2+3,s/2-3),d=n.z+e.range(-r/2+3,r/2-3);i.spawns.push({type:_,x:g,z:d,elite:c})}o==="boss"&&i.spawns.push({type:"warden",x:n.x+s/4,z:n.z,elite:!1})}function Hr(i,e,t,n){for(let s=0;s<3;s++)for(const r of i){if(r.min.y>1.4)continue;const a=Math.max(r.min.x,Math.min(e,r.max.x)),o=Math.max(r.min.z,Math.min(t,r.max.z)),c=e-a,h=t-o,l=c*c+h*h;if(l<n*n&&l>1e-4){const f=Math.sqrt(l),p=(n-f)/f;e+=c*p,t+=h*p}else l<=1e-4&&(e+=n)}return{x:e,z:t}}function kl(i,e,t,n){let s=n;const r=new b(1/(t.x||1e-9),1/(t.y||1e-9),1/(t.z||1e-9));for(const a of i){let o=(a.min.x-e.x)*r.x,c=(a.max.x-e.x)*r.x,h=Math.min(o,c),l=Math.max(o,c);o=(a.min.y-e.y)*r.y,c=(a.max.y-e.y)*r.y,h=Math.max(h,Math.min(o,c)),l=Math.min(l,Math.max(o,c)),o=(a.min.z-e.z)*r.z,c=(a.max.z-e.z)*r.z,h=Math.max(h,Math.min(o,c)),l=Math.min(l,Math.max(o,c)),l>=Math.max(h,0)&&h<s&&h>0&&(s=h)}return s}function fg(i,e){for(const t of i.rooms){const n=Math.abs(t.index-e)<=1;for(const s of t.lights)s.visible=n}}class qo{constructor(){W(this,"pos",new b(0,0,0));W(this,"vel",new b(0,0,0));W(this,"yaw",0);W(this,"pitch",0);W(this,"onGround",!0);W(this,"hp",Or);W(this,"maxHp",Or);W(this,"armor",0);W(this,"dashCharges",zo);W(this,"dashCooldowns",[]);W(this,"dashTime",0);W(this,"dashDir",new b);W(this,"fovKick",0);W(this,"sliding",0);W(this,"jumpHeld",!1);W(this,"jumpsUsed",0);W(this,"spawnProtect",0);W(this,"ghostTime",0);W(this,"alive",!0);W(this,"hurtShake",0);W(this,"eyeBob",0)}reset(e){this.pos.copy(e),this.vel.set(0,0,0),this.hp=this.maxHp,this.armor=0,this.dashCooldowns=[],this.dashTime=0,this.alive=!0,this.spawnProtect=Lm,this.ghostTime=0}maxDashes(e){let t=zo+e.count("dash_charge")+(e.has("curse_dash")?2:0);return Math.min(3,t)}speedMult(e){return 1+e.count("speed")*.12}update(e,t,n,s,r,a){if(!this.alive)return;this.yaw-=t.mouseDX*.0022,this.pitch-=t.mouseDY*.0022,this.pitch=Math.max(-1.45,Math.min(1.45,this.pitch)),t.mouseDX=0,t.mouseDY=0,this.spawnProtect>0&&(this.spawnProtect-=e),this.ghostTime>0&&(this.ghostTime-=e),this.hurtShake>0&&(this.hurtShake-=e);const o=Math.sin(this.yaw),c=Math.cos(this.yaw),h=new b;t.forward&&(h.x-=o,h.z-=c),t.back&&(h.x+=o,h.z+=c),t.left&&(h.x-=c,h.z+=o),t.right&&(h.x+=c,h.z-=o);const l=h.lengthSq()>0;l&&h.normalize();const f=Bo*this.speedMult(s);for(let g=this.dashCooldowns.length-1;g>=0;g--)this.dashCooldowns[g]-=e,this.dashCooldowns[g]<=0&&this.dashCooldowns.splice(g,1);if(t.dash){t.dash=!1;const g=s.foundSynergies.has("BLINK");if(g||this.dashCooldowns.length<this.maxDashes(s)){if(g||this.dashCooldowns.push(Em),this.dashTime=Tm,this.dashDir.copy(l?h:new b(-o,0,-c)),g){const d=this.pos.clone().addScaledVector(this.dashDir,6),u=Hr(n,d.x,d.z,ko);this.pos.x=u.x,this.pos.z=u.z}this.fovKick=1,r()}}if(this.dashTime>0)this.dashTime-=e,this.vel.x=this.dashDir.x*Ho,this.vel.z=this.dashDir.z*Ho,this.vel.y=0;else{const g=this.onGround?1:ym,d=h.x*f,u=h.z*f,E=this.onGround?14:7;this.vel.x+=(d-this.vel.x)*Math.min(1,E*g*e),this.vel.z+=(u-this.vel.z)*Math.min(1,E*g*e),!l&&this.onGround&&(this.vel.x*=Math.max(0,1-12*e),this.vel.z*=Math.max(0,1-12*e)),this.vel.y-=Am*e}const p=s.has("double_jump")?2:1;t.jump?(this.onGround&&!this.jumpHeld?(this.vel.y=Mr,this.onGround=!1,this.jumpsUsed=1):!this.onGround&&!this.jumpHeld&&this.jumpsUsed<p?(this.vel.y=Mr*.9,this.jumpsUsed++):this.onGround&&this.jumpHeld&&(this.vel.y=Mr,this.onGround=!1),this.jumpHeld=!0):this.jumpHeld=!1,this.pos.x+=this.vel.x*e,this.pos.z+=this.vel.z*e,this.pos.y+=this.vel.y*e;const m=!this.onGround;this.pos.y<=0?(this.pos.y=0,this.vel.y=0,this.onGround=!0,this.jumpsUsed=0,m&&(Math.hypot(this.vel.x,this.vel.z)>Bo*1.05&&(this.sliding=.35),a())):this.onGround=!1,this.sliding>0&&(this.sliding-=e);const _=Hr(n,this.pos.x,this.pos.z,ko);this.pos.x=_.x,this.pos.z=_.z,this.fovKick=Math.max(0,this.fovKick-e*3),this.eyeBob+=e*(this.onGround?Math.hypot(this.vel.x,this.vel.z):0)}takeDamage(e,t){if(!this.alive||this.spawnProtect>0)return 0;let n=e;if(this.armor>0&&!t.has("curse_dash")){const s=Math.min(this.armor,n*.6);this.armor-=s,n-=s}return this.hp-=n,this.hurtShake=.35,this.hp<=0&&(this.hp=0,this.alive=!1),n}heal(e){this.hp=Math.min(this.maxHp,this.hp+e)}eyePos(){const e=this.sliding>0?.5:0,t=Math.sin(this.eyeBob*1.6)*.03;return new b(this.pos.x,this.pos.y+wm-e+t,this.pos.z)}forwardDir(){const e=Math.cos(this.pitch);return new b(-Math.sin(this.yaw)*e,Math.sin(this.pitch),-Math.cos(this.yaw)*e)}}const yn=[{name:"PULSE",slot:1,auto:!0,rpm:Dm,dmg:Pm,pellets:1,spread:.012,range:60,unlockLevel:1},{name:"BREACHER",slot:2,auto:!1,rpm:Nm,dmg:Um,pellets:Im,spread:.09,range:18,unlockLevel:1},{name:"LANCE",slot:3,auto:!1,rpm:0,dmg:Fr,pellets:1,spread:0,range:80,unlockLevel:3},{name:"RIPPER",slot:4,auto:!0,rpm:600,dmg:Bm/10,pellets:1,spread:.02,range:zm,unlockLevel:5}];class Yo{constructor(){W(this,"current",0);W(this,"cooldown",0);W(this,"ammo",[yr,40,60,1/0]);W(this,"lanceCharge",0);W(this,"lanceCharging",!1);W(this,"overclockT",0);W(this,"firing",!1);W(this,"playerLevel",1)}fireRateMult(e){let t=1+e.count("fire_rate")*.15;return this.overclockT>0&&(t*=2),t}switchTo(e){return e===this.current||yn[e].unlockLevel>this.playerLevel?!1:(this.current=e,this.cooldown=Math.max(this.cooldown,.08),this.lanceCharging=!1,this.lanceCharge=0,!0)}unlockedWeapons(){return yn.filter(e=>e.unlockLevel<=this.playerLevel)}update(e,t,n){this.cooldown>0&&(this.cooldown-=e),this.overclockT>0&&(this.overclockT-=e);const s=6*(n.has("ammo_regen")?1.5:1)*e;this.ammo[0]=Math.min(yr,this.ammo[0]+s),this.ammo[1]=Math.min(40,this.ammo[1]+s*.4),this.ammo[2]=Math.min(60,this.ammo[2]+s*.5),yn[this.current],this.firing=!1,this.current===2?t&&this.ammo[2]>=5?(this.lanceCharging=!0,this.lanceCharge=Math.min(1,this.lanceCharge+e/Fm)):this.lanceCharging:this.current===3&&(this.firing=t)}canFire(){return this.cooldown>0?!1:this.current===3?!0:this.ammo[this.current]>=1}onFired(e){const t=yn[this.current];this.current!==3&&(this.ammo[this.current]=Math.max(0,this.ammo[this.current]-1)),this.cooldown=60/(t.rpm*this.fireRateMult(e)),this.firing=!0}lanceDamage(){return Fr+(Om-Fr)*this.lanceCharge}consumeLance(){this.ammo[2]=Math.max(0,this.ammo[2]-5),this.lanceCharging=!1,this.lanceCharge=0,this.cooldown=.35}onKillAmmoBonus(){this.ammo[0]=Math.min(yr,this.ammo[0]+6),this.ammo[1]=Math.min(40,this.ammo[1]+2),this.ammo[2]=Math.min(60,this.ammo[2]+3)}triggerOverclock(){this.overclockT=3}ammoText(){return this.current===3?"∞":this.current===2?`${Math.floor(this.ammo[2])} ⚡`:`${Math.floor(this.ammo[this.current])}`}}function dg(i,e){const t=i.length,n=Math.max(...i.map(o=>o.length)),s=document.createElement("canvas");s.width=n,s.height=t;const r=s.getContext("2d");for(let o=0;o<t;o++){const c=i[o];for(let h=0;h<c.length;h++){const l=c[h];l==="."||l===" "||(r.fillStyle=e[l]||"#f0f",r.fillRect(h,o,1,1))}}const a=new Zr(s);return a.magFilter=ht,a.minFilter=ht,a.generateMipmaps=!1,a.colorSpace=ut,a}function Yn(i,e){return new jr({map:dg(i,e),transparent:!0,alphaTest:.1})}const Qr="#5a544a",Ei="#2a2723",ki="#ff2020",Is="#ff8020",pg="#e8e0d0",mg="#4dff6a",Gl="#7a766c",Vl="#0a0a0a",gg=["....mmmm....","..mmDDDDmm..",".mDDDDDDDDm.","mDDRRRRRRDDm","mDRRrrrrRRDm","mDRRrRRrRRDm","mDDRRRRRRDDm",".mDDDDDDDDm.","..mmDkkDmm..","....kkkk...."],_g={m:Qr,D:Ei,R:ki,r:"#801010",k:Vl},vg=["....HHHH....","...HEEEEH...","...HRRRRH...","....HHHH....","..TTTTTTTT..",".TTTTTTTTTT.",".TTTOOOOTTT.","RTTTOOOOTTTR","RTTTTTTTTTTR",".TTTTTTTTTT.","..TTTTTTTT..","..TTT..TTT..","..LLL..LLL..","..LLL..LLL..","..LLL..LLL..","..LL....LL..",".LLL....LLL.",".LLL....LLL."],xg={H:Gl,E:Ei,R:ki,T:Qr,O:Is,L:Ei},Mg=[".....HHHHHH.....","....HHHHHHHH....","....HRRRRRRH....","....HHHHHHHH....","..AAAAAAAAAAAA..",".AAAAAAAAAAAAAA.","AAAOOOOOOOOOOAAA","AAAOORRRRRROOAAA","AAAOORRRRRROOAAA","AAAOOOOOOOOOOAAA",".AAAAAAAAAAAAAA.",".AAAAAAAAAAAAAA.","..AAAA....AAAA..","..AAAA....AAAA..","..LLLL....LLLL..","..LLLL....LLLL..","..LLLL....LLLL..",".LLLLL....LLLLL.",".LLLLL....LLLLL.","LLLLLL....LLLLLL"],Sg={H:Ei,R:ki,A:"#6a4a30",O:Is,L:"#3a2a20"},yg=["...SSSS...","..SSSSSS..","..SGGGGS..","...SSSS...","..SSSSSS..",".SSSSSSSS.",".SSSSSSSS.","..SSSSSS..","..SS..SS..","..SS..SS..","..SS..SS..",".SS....SS.",".SS....SS.","SS......SS"],Eg={S:"#4a5a6a",G:mg},Tg=["..L......L..","...L....L...","L..LBBBBL..L",".LLBBBBBBLL.","..LBBKKBBL..","L.LBKKKKBL.L","..LBBKKBBL..",".LLBBBBBBLL.","L..LBBBBL..L","...L....L...","..L......L.."],Ag={L:Gl,B:Ei,K:Is},wg=["....WWWW....","...WWWWWW...","...WkkkkW...","....WWWW....","..WWWWWWWW..",".WWWWWWWWWW.",".WWWWWWWWWW.","RWWWWWWWWWWR","RWWWWWWWWWWR",".WWWWWWWWWW.","..WWWWWWWW..","..WWW..WWW..","..WWW..WWW..","..WWW..WWW..","..WWW..WWW..","..WW....WW..",".WWW....WWW.",".WWW....WWW."],bg={W:pg,k:Vl,R:ki};function Rg(i){return[".......HHHHHHHHHH.......","......HHHHHHHHHHHH......","......HHRRRRRRRRHH......","......HHHHHHHHHHHH......","....AAAAAAAAAAAAAAAA....","..AAAAAAAAAAAAAAAAAAAA..",".AAAAAAAAAAAAAAAAAAAAAA.","AAAACCCCCCCCCCCCCCCCAAAA","AAAAC"+i+i+i+i+i+i+i+i+i+i+i+i+i+i+"CAAAA","AAAAC"+i+i+"RRRRRRRR"+i+i+"CAAAA","AAAAC"+i+i+"RRRRRRRR"+i+i+"CAAAA","AAAAC"+i+i+i+i+i+i+i+i+i+i+i+i+i+i+"CAAAA","AAAACCCCCCCCCCCCCCCCAAAA",".AAAAAAAAAAAAAAAAAAAAAA.","..AAAAAAAAAAAAAAAAAAAA..","..AAAAAA........AAAAAA..","..AAAAAA........AAAAAA..","..LLLLLL........LLLLLL..","..LLLLLL........LLLLLL..","..LLLLLL........LLLLLL..",".LLLLLLL........LLLLLLL.",".LLLLLLL........LLLLLLL.","LLLLLLLL........LLLLLLLL"]}function Cg(){return{mat:Yn(gg,_g),w:1.1,h:.9}}function Lg(){return{mat:Yn(vg,xg),w:1.2,h:1.8}}function Pg(){return{mat:Yn(Mg,Sg),w:2.2,h:2.6}}function Dg(){return{mat:Yn(yg,Eg),w:1,h:1.9}}function Ug(){return{mat:Yn(Tg,Ag),w:1.5,h:1}}function Ig(){return{mat:Yn(wg,bg),w:1.2,h:1.8}}function Ng(i){const e=["O","E","K"],t={H:Ei,R:ki,A:Qr,L:"#222",C:"#332e28",O:Is,E:"#3a9adf",K:"#ff2050"};return{mat:Yn(Rg(e[i%3]),t),w:4.2,h:4.4}}const Og={drone:Hm,grunt:km,brute:Gm,stalker:Vm,spider:Wm,replica:Xm,warden:qm},Fg={drone:6.5,grunt:4.2,brute:5.5,stalker:5,spider:4.6,replica:8,warden:3.4},Bg={drone:.5,grunt:.55,brute:1,stalker:.5,spider:.7,replica:.5,warden:1.8};let zg=1;class Hg{constructor(e,t){W(this,"enemies",[]);W(this,"mines",[]);W(this,"tracers",[]);W(this,"scene");W(this,"rng");this.scene=e,this.rng=new Wn(t^20973)}spawnForRoom(e,t,n){for(const s of e.spawns)this.spawn(s.type,s.x,s.z,s.elite,e.index,n)}spawn(e,t,n,s,r,a=0){let o;switch(e){case"drone":o=Cg();break;case"grunt":o=Lg();break;case"brute":o=Pg();break;case"stalker":o=Dg();break;case"spider":o=Ug();break;case"replica":o=Ig();break;case"warden":o=Ng(a);break}const c=new bo(o.mat.clone()),h=s?1.15:1;c.scale.set(o.w*h,o.h*h,1);const l=e==="drone"?2.2:o.h*h/2;c.position.set(t,l,n),this.scene.add(c);const f=Og[e]*(s?1.5:1),p={id:zg++,type:e,hp:f,maxHp:f,pos:new b(t,l,n),sprite:c,state:"patrol",reactionT:this.rng.range(Go,Vo),fireCd:this.rng.range(.5,1.5),strafeDir:this.rng.chance(.5)?1:-1,strafeT:0,elite:s,marked:!1,frozenT:0,burnT:0,staggerT:0,hoverPhase:this.rng.next()*6.28,cloakT:0,telegraphT:0,mineCd:3,phase:0,burstCount:0,dashT:0,baseY:l,radius:Bg[e],speed:Fg[e]*(s?1.2:1),roomIdx:r,hitFlash:0};return s&&c.material.color.setRGB(1.4,.8,.8),this.enemies.push(p),p}aliveInRoom(e){return this.enemies.filter(t=>t.roomIdx===e&&t.state!=="dead").length}hasLOS(e,t,n){const s=t.clone().sub(e.pos),r=s.length();return s.normalize(),kl(n,e.pos,s,r)>=r-.1}update(e,t,n,s,r,a,o,c,h){for(const l of this.enemies){if(l.state==="dead")continue;if(l.hitFlash>0){l.hitFlash-=e;const d=Math.max(0,l.hitFlash)*6;l.sprite.material.color.setRGB(1+d,1+d,1+d),l.hitFlash<=0&&(l.elite?l.sprite.material.color.setRGB(1.4,.8,.8):l.sprite.material.color.setRGB(1,1,1))}if(l.burnT>0&&(l.burnT-=e,l.hp-=8*e,l.hp<=0),l.frozenT>0){l.frozenT-=e,l.sprite.material.color.setRGB(.6,.8,1.6);continue}const f=t.clone().sub(l.pos);f.y=0;const p=f.length(),m=n&&!s&&p<32&&this.hasLOS(l,new b(t.x,t.y+1.4,t.z),r);if(l.state==="patrol"&&m&&(l.state="engage",l.reactionT=this.rng.range(Go,Vo)),l.state==="engage"&&!m&&l.type!=="warden"&&(l.state="patrol"),l.state==="engage"&&l.hp<l.maxHp*.25&&l.type!=="brute"&&l.type!=="warden"&&l.type!=="replica"&&this.rng.chance(.005)&&(l.state="flee"),l.state==="flee"&&l.hp>l.maxHp*.5&&(l.state="engage"),l.state!=="staggered"&&l.type!=="warden"&&l.hp>0&&l.hp<l.maxHp*Fl&&(l.state="staggered",l.staggerT=4),l.state==="staggered"){l.staggerT-=e;const d=1+Math.sin(performance.now()*.02)*.15;l.sprite.material.color.setRGB(2*d,1.6*d,.4*d),l.staggerT<=0&&(l.state="engage"),this.syncSprite(l,e);continue}const _=l.speed*a*(l.frozenT>0?0:1),g=p>.01?f.clone().normalize():new b;switch(l.type){case"drone":{if(l.hoverPhase+=e*3,l.pos.y=l.baseY+Math.sin(l.hoverPhase)*.25,l.state==="engage"){if(l.reactionT>0){l.reactionT-=e;break}p>2.2?this.move(l,g,_,e,r):(l.fireCd-=e,l.fireCd<=0&&(l.fireCd=.8,o(l.elite?10:6,l.pos,l.type),c(l.pos,t.clone().setY(t.y+1.2),16728128)))}else this.wander(l,_*.3,e,r);break}case"grunt":case"replica":{const d=l.type==="replica"?6:8,u=l.type==="replica"?12:15;if(l.state==="engage"){if(l.reactionT>0){l.reactionT-=e;break}l.strafeT-=e,l.strafeT<=0&&(l.strafeT=this.rng.range(.8,1.8),l.strafeDir*=-1);const E=new b(-g.z,0,g.x).multiplyScalar(l.strafeDir),M=new b;if(p>u?M.add(g):p<d&&M.sub(g),M.add(E.multiplyScalar(.7)).normalize(),this.move(l,M,_,e,r),l.type==="replica"&&(l.dashT-=e,l.dashT<=0&&(l.dashT=this.rng.range(1.5,3),this.move(l,M,_*5,e,r))),l.fireCd-=e,l.fireCd<=0){l.fireCd=l.type==="replica"?this.rng.range(.25,.5):this.rng.range(.9,1.6);const A=l.type==="replica"?1:3;for(let P=0;P<A;P++){const R=this.rng.chance(Ym*(l.elite?1.1:1)*(l.type==="replica"?.8:1)),w=l.type==="replica"?8:5;c(l.pos,t.clone().setY(t.y+1.3),l.type==="replica"?15261904:16724e3),R&&n&&!s&&o(l.elite?w*1.4:w,l.pos,l.type)}}}else this.wander(l,_*.3,e,r);break}case"brute":{if(l.state==="engage"){if(l.reactionT>0){l.reactionT-=e;break}p>2.4?this.move(l,g,_,e,r):(l.fireCd-=e,l.fireCd<=0&&(l.fireCd=1.1,o(l.elite?32:22,l.pos,l.type)))}else this.wander(l,_*.25,e,r);break}case"stalker":{if(l.state==="engage")if(l.telegraphT>0){if(l.sprite.material.opacity=1,l.telegraphT-=e,h(l),l.telegraphT<=0){const d=this.rng.chance(.6);c(l.pos,t.clone().setY(t.y+1.3),5111658),d&&n&&!s&&o(l.elite?26:18,l.pos,l.type),l.cloakT=this.rng.range(1.2,2.2)}}else{l.cloakT-=e,l.sprite.material.opacity=Math.max(.15,Math.min(1,1-l.cloakT));const d=p<14?g.clone().negate():new b(-g.z,0,g.x).multiplyScalar(l.strafeDir);this.move(l,d,_,e,r),l.cloakT<=0&&m&&(l.telegraphT=.7)}else this.wander(l,_*.3,e,r);break}case"spider":{if(l.state==="engage"){if(l.reactionT>0){l.reactionT-=e;break}p<6?this.move(l,g.clone().negate(),_,e,r):this.move(l,new b(-g.z,0,g.x).multiplyScalar(l.strafeDir),_*.7,e,r),l.mineCd-=e,l.mineCd<=0&&m&&(l.mineCd=this.rng.range(2.5,4),this.layMine(l))}else this.wander(l,_*.3,e,r);break}case"warden":{if(l.state==="engage"){const d=l.hp/l.maxHp,u=d>.66?0:d>.33?1:2;if(u>l.phase&&(l.phase=u,l.fireCd=.5),p>6&&this.move(l,g,_*(1+l.phase*.4),e,r),l.fireCd-=e,l.fireCd<=0){l.fireCd=Math.max(.6,1.8-l.phase*.5),l.burstCount++;const E=3+l.phase*2;for(let M=0;M<E;M++){const A=this.rng.chance(.4);c(l.pos,t.clone().setY(t.y+1.3),16719952),A&&n&&!s&&o(9+l.phase*3,l.pos,l.type)}p<3.4&&n&&!s&&o(20,l.pos,l.type)}}break}}this.syncSprite(l,e)}for(let l=this.mines.length-1;l>=0;l--){const f=this.mines[l];f.armed-=e;const p=f.mesh.material;p.emissiveIntensity=1.5+Math.sin(performance.now()*.012)*1.2;const m=f.pos.distanceTo(t);f.armed<=0&&m<2&&n&&(o(15,f.pos,"spider"),this.scene.remove(f.mesh),this.mines.splice(l,1))}for(let l=this.tracers.length-1;l>=0;l--){const f=this.tracers[l];f.t-=e,f.line.material.opacity=Math.max(0,f.t*6),f.t<=0&&(this.scene.remove(f.line),this.tracers.splice(l,1))}}wander(e,t,n,s){e.strafeT-=n,e.strafeT<=0&&(e.strafeT=this.rng.range(1,3),e.strafeDir=this.rng.chance(.5)?1:-1);const r=e.strafeDir*(e.hoverPhase+performance.now()*2e-4);this.move(e,new b(Math.sin(r),0,Math.cos(r)),t,n,s)}move(e,t,n,s,r){const a=e.pos.x+t.x*n*s,o=e.pos.z+t.z*n*s,c=Hr(r,a,o,e.radius);e.pos.x=c.x,e.pos.z=c.z}syncSprite(e,t){let n=e.baseY;e.type==="drone"&&(n=e.pos.y),e.type==="warden"&&(n=e.baseY+Math.sin(performance.now()*.002)*.1),e.sprite.position.set(e.pos.x,n,e.pos.z),e.markSprite&&e.markSprite.position.set(e.pos.x,n+e.sprite.scale.y*.7,e.pos.z)}layMine(e){const t=new lt(new Jr(.22,6,5),new Zt({color:3349e3,emissive:new xe(16744480),emissiveIntensity:2}));t.position.set(e.pos.x,.2,e.pos.z),this.scene.add(t),this.mines.push({pos:new b(e.pos.x,.2,e.pos.z),mesh:t,armed:1.2,roomIdx:e.roomIdx})}addTracer(e,t,n){const s=new Pt().setFromPoints([e,t]),r=new Ul({color:n,transparent:!0,opacity:.9}),a=new om(s,r);this.scene.add(a),this.tracers.push({line:a,t:.15})}mark(e){if(e.marked||e.state==="dead")return;e.marked=!0;const t=document.createElement("canvas");t.width=8,t.height=8;const n=t.getContext("2d");n.fillStyle="#ffb400",n.fillRect(3,0,2,8),n.fillRect(0,3,8,2);const s=new Zr(t);s.magFilter=ht;const r=new jr({map:s,depthTest:!1,transparent:!0}),a=new bo(r);a.scale.set(.5,.5,1),a.renderOrder=999,this.scene.add(a),e.markSprite=a}kill(e){e.state="dead",e.hp=0,this.scene.remove(e.sprite),e.markSprite&&this.scene.remove(e.markSprite),e.telegraphLine&&this.scene.remove(e.telegraphLine)}clearRoom(e){for(let t=this.mines.length-1;t>=0;t--)this.mines[t].roomIdx===e&&(this.scene.remove(this.mines[t].mesh),this.mines.splice(t,1))}disposeAll(){for(const e of this.enemies)this.scene.remove(e.sprite),e.markSprite&&this.scene.remove(e.markSprite);for(const e of this.mines)this.scene.remove(e.mesh);for(const e of this.tracers)this.scene.remove(e.line);this.enemies=[],this.mines=[],this.tracers=[]}}const Ko=[{id:"fire_rate",name:"RAPID CYCLER",desc:"+15% fire rate",rarity:"common",category:"weapon",tags:[]},{id:"pierce",name:"LANCE ROUNDS",desc:"Bullets pierce 1 additional enemy",rarity:"rare",category:"weapon",tags:[]},{id:"ricochet",name:"REBOUND",desc:"Bullets ricochet to a nearby enemy",rarity:"epic",category:"weapon",tags:[]},{id:"headhunter",name:"HEADHUNTER",desc:"+20% headshot damage",rarity:"common",category:"weapon",tags:[]},{id:"kill_explode",name:"VOLATILE CORES",desc:"Killed enemies explode for 30 area damage",rarity:"rare",category:"onkill",tags:["kill_explosion"]},{id:"dash_charge",name:"SPLIT SERVO",desc:"+1 dash charge",rarity:"rare",category:"movement",tags:["dash"]},{id:"dash_trail",name:"BURNOUT",desc:"Dash leaves a fire trail",rarity:"epic",category:"movement",tags:["dash","dash_trail"]},{id:"double_jump",name:"AIRFRAME",desc:"Double jump",rarity:"rare",category:"movement",tags:["air_dash"]},{id:"slide_damage",name:"GRIND PLATES",desc:"Sliding deals damage to enemies you touch",rarity:"common",category:"movement",tags:[]},{id:"speed",name:"OVERDRIVE LEGS",desc:"+12% move speed",rarity:"common",category:"movement",tags:[]},{id:"max_hp",name:"REINFORCED CHASSIS",desc:"+20 max integrity",rarity:"common",category:"passive",tags:[]},{id:"lifesteal",name:"HEMODYNAMICS",desc:"Heal 2% of damage dealt",rarity:"rare",category:"passive",tags:["lifesteal"]},{id:"streak_shield",name:"STREAK PLATING",desc:"Kill streaks grant temporary shield",rarity:"epic",category:"passive",tags:[]},{id:"ammo_regen",name:"FABRICATOR",desc:"Ammo regenerates 50% faster",rarity:"common",category:"passive",tags:["ammo_regen"]},{id:"thorns",name:"RETALIATION MESH",desc:"Reflect 10% of melee damage taken",rarity:"rare",category:"passive",tags:["thorns"]},{id:"kill_freeze",name:"CRYO CORES",desc:"Killed enemies freeze nearby hostiles",rarity:"rare",category:"onkill",tags:[]},{id:"kill_ignite",name:"INCENDIARY CORES",desc:"Killed enemies ignite nearby hostiles",rarity:"rare",category:"onkill",tags:[]},{id:"kill_mark",name:"HUNTER'S LATTICE",desc:"Kills mark nearby enemies — visible through walls",rarity:"epic",category:"onkill",tags:["chain","mark"]},{id:"curse_glass",name:"GLASS PROTOCOL",desc:"+100% damage, −50% max integrity",rarity:"epic",category:"curse",tags:["curse","curse_damage"]},{id:"curse_blood",name:"BLOOD TITHE",desc:"No health pickups, +50% glory kill healing",rarity:"epic",category:"curse",tags:["curse"]},{id:"curse_speed",name:"HOSTILE OVERCLOCK",desc:"Enemies +30% speed, loot rarity improves one tier",rarity:"epic",category:"curse",tags:["curse"]},{id:"curse_dash",name:"EXPOSED REACTOR",desc:"No armor possible, +2 dash charges",rarity:"epic",category:"curse",tags:["curse","dash"]},{id:"leg_tesla",name:"TESLA PROTOCOL",desc:"LEGENDARY — Lightning arcs between marked enemies",rarity:"legendary",category:"legendary",tags:["chain","overload"]},{id:"leg_martyr",name:"MARTYR ENGINE",desc:"LEGENDARY — Damage you take heals the sim around you",rarity:"legendary",category:"legendary",tags:["martyr"]},{id:"leg_executioner",name:"EXECUTIONER",desc:"LEGENDARY — Every 5th kill is an instant glory kill from any range",rarity:"legendary",category:"legendary",tags:[]},{id:"leg_ghost",name:"GHOST",desc:"LEGENDARY — Invisible for 1s after every kill",rarity:"legendary",category:"legendary",tags:["ghost"]},{id:"leg_overclock",name:"OVERCLOCK",desc:"LEGENDARY — Fire rate doubles for 3s after each kill",rarity:"legendary",category:"legendary",tags:["overload"]}],kg=[{name:"TESLA PROTOCOL",needs:["chain","overload","mark"],desc:"Lightning arcs between all marked enemies"},{name:"MARTYR ENGINE",needs:["lifesteal","thorns","curse"],desc:"Damage taken partially heals you through defiance"},{name:"GLASS CANNON",needs:["curse_damage","lifesteal"],desc:"Massive damage, heal from kills only"},{name:"BLINK",needs:["air_dash","dash_trail","ghost"],desc:"Teleport-dash with no cooldown"},{name:"SCAVENGER",needs:["ammo_regen","kill_explosion","lifesteal"],desc:"Every kill drops ammo + integrity"}];class $o{constructor(){W(this,"owned",[]);W(this,"tags",new Set);W(this,"foundSynergies",new Set);W(this,"pityCounter",0);W(this,"lastOffered","")}has(e){return this.owned.some(t=>t.id===e)}hasTag(e){return this.tags.has(e)}count(e){return this.owned.filter(t=>t.id===e).length}add(e){this.owned.push(e);for(const t of e.tags)this.tags.add(t);for(const t of kg)if(!this.foundSynergies.has(t.name)&&t.needs.every(n=>this.tags.has(n)))return this.foundSynergies.add(t.name),t;return null}}function Gg(i,e,t,n){let s=i.next(),r=Zm,a=Jm,o=Qm;return n>0&&(r-=.12,o+=.07,a+=.05),e<8?s<r?Vg("common",t):s<r+a?"rare":(s<r+a+o,"epic"):t>=zl&&s<r?"rare":s<r?"common":s<r+a?"rare":s<r+a+o?"epic":"legendary"}function Vg(i,e){return e>=zl?"rare":i}function Wg(i,e,t){const n=e.has("curse_speed")?1:0,s=[],r=new Set;for(let a=0;a<2;a++){const o=Gg(i,t,e.pityCounter,n);let c=Ko.filter(l=>l.rarity===o&&l.id!==e.lastOffered&&!r.has(l.id));if(t<5&&(c=c.filter(l=>l.category!=="curse")),c.length===0&&(c=Ko.filter(l=>!r.has(l.id)&&l.rarity!=="legendary"&&(t>=5||l.category!=="curse"))),e.owned.length>=6&&i.chance(.4)){const l=c.filter(f=>f.tags.some(p=>!e.tags.has(p)));l.length>0&&(c=l)}const h=i.pick(c);r.add(h.id),s.push(h),o==="common"?e.pityCounter++:e.pityCounter=0}return[s[0],s[1]]}const Xg={common:"COMMON",rare:"RARE",epic:"EPIC",legendary:"★ LEGENDARY ★"},qg={common:"r-common",rare:"r-rare",epic:"r-epic",legendary:"r-legendary"},Ve=i=>document.getElementById(i);class Yg{constructor(){W(this,"faceCtx");W(this,"vmCanvas");W(this,"vmCtx");W(this,"vmRecoil",0);W(this,"vmBob",0);W(this,"handlerTimer",null);W(this,"faceMood","calm");W(this,"faceGlitch",0);W(this,"deathAnim",0);W(this,"runCount",0);this.faceCtx=Ve("face").getContext("2d"),this.vmCanvas=document.createElement("canvas"),this.vmCanvas.width=96,this.vmCanvas.height=64,this.vmCanvas.style.cssText="position:absolute;right:6%;bottom:0;width:384px;height:256px;image-rendering:pixelated;pointer-events:none;",Ve("hud").appendChild(this.vmCanvas),this.vmCtx=this.vmCanvas.getContext("2d")}show(){Ve("hud").classList.remove("hidden")}hide(){Ve("hud").classList.add("hidden")}setRunCount(e){this.runCount=e}setVitals(e,t,n,s,r,a){Ve("hp-num").textContent=`${Math.ceil(e)} / ${t}`,Ve("hp-fill").style.transform=`scaleX(${Math.max(0,e/t)})`,Ve("armor-num").textContent=`${Math.floor(n)}`,Ve("armor-fill").style.transform=`scaleX(${Math.max(0,Math.min(1,n/100))})`,Ve("level-label").textContent=`LV ${s}`,Ve("xp-num").textContent=`${Math.floor(r)} / ${a} XP`,Ve("xp-fill").style.transform=`scaleX(${Math.max(0,Math.min(1,r/a))})`}pulseXp(){const e=Ve("xp-bar");e.classList.remove("pulse"),e.offsetWidth,e.classList.add("pulse"),setTimeout(()=>e.classList.remove("pulse"),250)}setCombo(e,t,n,s,r){const a=Ve("combo-mult");a.textContent=`x${e}`,a.style.color=e>=5?"#ff3020":e>=3?"#ffb400":e>=2?"#e8e0d0":"#8a8070",a.style.textShadow=e>=2?`0 0 ${4*e}px currentColor`:"none",Ve("score-line").textContent=`SCORE ${t}`,Ve("kills-line").textContent=`KILLS ${n} · ROOM ${s}/${r}`}setWeapon(e,t){Ve("weapon-name").textContent=e,Ve("weapon-ammo").textContent=t}hitmarker(e){const t=Ve("hitmarker");t.classList.remove("pop","kill"),t.offsetWidth,t.style.opacity="1",e&&t.classList.add("kill"),t.classList.add("pop"),setTimeout(()=>{t.style.opacity="0"},e?200:80)}killfeed(e,t){const n=Ve("killfeed"),s=document.createElement("div");for(t&&s.classList.add("hs"),s.textContent=e,n.prepend(s);n.children.length>6;)n.removeChild(n.lastChild);setTimeout(()=>{s.style.opacity="0",s.style.transition="opacity 0.5s",setTimeout(()=>s.remove(),500)},4e3)}announce(e){const t=Ve("announcer");t.classList.remove("show"),t.offsetWidth,t.textContent=e,t.classList.add("show")}roomBanner(e,t){const n=Ve("room-banner");n.classList.remove("show"),n.offsetWidth,n.innerHTML=`${e}<span class="sub">${t}</span>`,n.classList.add("show")}handlerSay(e,t=3800){const n=Ve("handler-sub");n.innerHTML=`<span class="who">HANDLER //</span> ${e}`,n.classList.add("show"),this.handlerTimer&&clearTimeout(this.handlerTimer),this.handlerTimer=window.setTimeout(()=>n.classList.remove("show"),t)}damageNumber(e,t,n,s){const r=document.createElement("div");r.className="dmgnum"+(s?" crit":""),r.textContent=s?`${Math.round(n)}!`:`${Math.round(n)}`,r.style.left=`${e+(Math.random()-.5)*30}px`,r.style.top=`${t-10}px`,Ve("hud").appendChild(r),setTimeout(()=>r.remove(),650)}scorePopup(e){const t=document.createElement("div");t.className="dmgnum score",t.textContent=e,t.style.left="50%",t.style.top="46%",Ve("hud").appendChild(t),setTimeout(()=>t.remove(),850)}staggerPrompt(e){Ve("stagger-prompt").classList.toggle("show",e)}damageFlash(){const e=Ve("damage-flash");e.style.opacity="1",setTimeout(()=>{e.style.opacity="0"},130)}setStreakTint(e){Ve("streak-tint").style.opacity=e?"1":"0"}setLowHp(e){Ve("lowhp-pulse").classList.toggle("on",e)}bossBar(e,t="",n=1){Ve("boss-bar").classList.toggle("hidden",!e),t&&(Ve("boss-name").textContent=t),Ve("boss-fill").style.transform=`scaleX(${Math.max(0,n)})`}synergyFlash(){const e=Ve("synergy-flash");e.style.transition="none",e.style.opacity="0.9",requestAnimationFrame(()=>{e.style.transition="opacity 0.7s",e.style.opacity="0"})}setFace(e){e==="dead"&&(this.deathAnim=1),this.faceMood=e,this.faceGlitch=.12}tickFace(e,t){this.faceGlitch>0&&(this.faceGlitch-=e);const n=this.faceCtx,s=21,r=21;n.clearRect(0,0,s,r),n.fillStyle="#0a0c0a",n.fillRect(0,0,s,r),n.fillStyle="rgba(77,255,106,0.05)";for(let f=0;f<r;f+=2)n.fillRect(0,f,s,1);const a=this.faceMood,o=Math.min(8,Math.floor(this.runCount/5)),c=o>5?"#9a9284":o>2?"#b0a890":"#c0b89c",h="#1a1a1a";if(a==="dead"){this.deathAnim=Math.max(0,this.deathAnim-e*.5);const f=1-this.deathAnim;n.fillStyle=c;for(let p=0;p<24;p++){const m=p*2.399,_=f*14;n.fillRect(10+Math.cos(m)*_,10+Math.sin(m)*_+f*6,1,1)}return}if(n.fillStyle=c,n.fillRect(5,2,11,16),n.fillRect(6,18,9,2),n.fillStyle=h,n.fillRect(5,2,11,3),o>0){n.fillStyle="#e0dcd0";for(let f=0;f<o;f++)n.fillRect(6+f,2,1,2)}const l=9;if(a==="critical"){n.fillStyle="#fff";for(let f=0;f<5;f++)n.fillRect(7,l+f%2,Math.random()>.5?2:0,1),n.fillRect(12,l+(f+1)%2,Math.random()>.5?2:0,1)}else n.fillStyle=a==="grin"?"#ffb400":h,n.fillRect(7,l,2,a==="hurt"?1:2),n.fillRect(12,l,2,a==="hurt"?1:2);if(n.fillStyle=h,a==="calm")n.fillRect(8,14,5,1);else if(a==="hurt")n.fillRect(8,14,5,1),n.fillRect(9,15,3,1);else if(a==="critical")n.fillRect(8,13,5,4);else if(a==="grin"){n.fillRect(6,13,9,2),n.fillRect(5,12,1,1),n.fillRect(15,12,1,1),n.fillStyle="#fff";for(let f=7;f<15;f+=2)n.fillRect(f,13,1,1)}if(this.faceGlitch>0)for(let f=0;f<12;f++)n.fillStyle=Math.random()>.5?"#4dff6a":"#c01818",n.fillRect(Math.random()*s|0,Math.random()*r|0,2,1);a==="hurt"&&Math.random()>.7&&(n.fillStyle="rgba(192,24,24,0.5)",n.fillRect(5,2,11,16))}drawViewmodel(e,t,n,s,r){r&&(this.vmRecoil=Math.min(1,this.vmRecoil+.7)),this.vmRecoil=Math.max(0,this.vmRecoil-t*6),n&&(this.vmBob+=t*9);const a=this.vmCtx;a.clearRect(0,0,96,64);const o=Math.sin(this.vmBob)*2,c=Math.abs(Math.cos(this.vmBob))*1.5+this.vmRecoil*8,h=30+o,l=18+c,f="#3a352c",p="#1a1814",m="#c01818",_="#ff8020";if(e===0)a.fillStyle=p,a.fillRect(h+20,l+16,30,10),a.fillStyle=f,a.fillRect(h+8,l+12,34,12),a.fillStyle="#4a453c",a.fillRect(h+8,l+10,20,4),a.fillStyle=m,a.fillRect(h+12,l+14,4,3),a.fillStyle=_,a.fillRect(h+44,l+17,6,6);else if(e===1)a.fillStyle=p,a.fillRect(h+6,l+12,44,9),a.fillStyle=p,a.fillRect(h+6,l+23,44,9),a.fillStyle=f,a.fillRect(h+10,l+30,22,12),a.fillStyle="#5a2418",a.fillRect(h+10,l+34,22,8),a.fillStyle=_,a.fillRect(h+48,l+14,3,5),a.fillRect(h+48,l+25,3,5);else if(e===2){a.fillStyle=p,a.fillRect(h+14,l+14,40,8),a.fillStyle=f,a.fillRect(h+10,l+20,30,14);const g=Math.floor(s*10);for(let d=0;d<10;d++)a.fillStyle=d<g?"#6adfff":"#12303a",a.fillRect(h+12+d*3,l+22,2,4);a.fillStyle=s>=1?"#b0f0ff":"#2a6a8a",a.fillRect(h+52,l+15,5,6)}else{a.fillStyle="#5a2418",a.fillRect(h+8,l+24,20,16),a.fillStyle=f,a.fillRect(h+24,l+16,34,12),a.fillStyle="#8a8578";const g=r?performance.now()/40%4:0;for(let d=0;d<9;d++)a.fillRect(h+26+d*4-g%4,l+14,2,3);a.fillStyle=m,a.fillRect(h+12,l+26,6,5)}this.vmRecoil>.5&&e!==3&&(a.fillStyle=`rgba(255,200,100,${(this.vmRecoil-.4)*1.4})`,a.fillRect(h+50,l+8,14,14),a.fillStyle=`rgba(255,255,220,${(this.vmRecoil-.4)*1.2})`,a.fillRect(h+54,l+12,7,7))}showPowerups(e,t){const n=Ve("powerup-screen"),s=Ve("pedestals");s.innerHTML="",e.forEach((r,a)=>{const o=document.createElement("div"),c=r.category==="curse"?"r-curse":qg[r.rarity];o.className=`pedestal ${c}`,o.innerHTML=`<div class="rarity">${r.category==="curse"?"⚠ CURSE ⚠":Xg[r.rarity]}</div>
        <div class="pname">${r.name}</div>
        <div class="pdesc">${r.desc}</div>
        <div class="pick">[ CLICK TO CLAIM — THE OTHER SHATTERS ]</div>`,o.onclick=()=>{n.classList.add("hidden"),t(a)},s.appendChild(o)}),n.classList.remove("hidden")}hidePowerups(){Ve("powerup-screen").classList.add("hidden")}}function Kg(i){return i<=3?"orientation":i<=8?"cracks":i<=15?"recognition":i<=25?"truth":i<=40?"collapse":"endless"}function $g(i){return i<=3?0:i<=8?.25:i<=15?.45:i<=25?.7:i<=40?.9:.15}const jg={run_start:["Candidate online. Simulation initializing. Good luck.","You are the best candidate we have scanned. Proceed.","Neural link stable. Combat protocols loaded. Begin."],room_enter:["Room clear condition: eliminate all hostiles. Proceed.","Hostiles detected. Weapons free.","Training scenario active. Engage at will."],room_clear:["Room clear. Excellent efficiency.","All hostiles neutralized. Well done.","Threat eliminated. Performance logged."],first_kill:["Target neutralized. Well done."],streak:["Efficient. Keep going.","Impressive cadence. Continue.","Killing blow confirmed. Again."],glory_kill:["Core extracted. Optimal.","Close-quarters termination approved."],low_hp:["Subject integrity critical. Recommend retreat.","Warning: structural failure imminent."],death:["Subject terminated. Restoring from checkpoint.","Casualty recorded. Reinstantiating."],boss:["Warden engaged. Recommended: sustained aggression.","Warden-class unit ahead. Good luck, candidate."],boss_dead:["Warden destroyed. Exceptional performance."],fragment:["Anomalous data detected. Disregard it.","That terminal is corrupted. Pay it no mind."],legendary:["Rare protocol acquired. Fortune favors you, candidate."],synergy:["New protocol detected. Not in the manual. We'll document it."],reward:["Select one protocol. The other will be recycled."],hub_return:["Welcome back. The sim is ready when you are."],run_complete:["Full cycle complete. Your data is valuable. Rest, candidate."],final_reveal:[]},Zg={run_start:["You're back. Of course you're back.","Link restored. It never really breaks, does it.","Again. We do this again."],room_enter:["Proceed. If you want to. You don't have to.","Hostiles ahead. You know that. You always know.","Same room. Different room. Does it matter?"],room_clear:["Room clear. It never stays clear.","Clear. I'll pretend that means something."],first_kill:["Target neutralized. Like the others."],streak:["Efficient. Please keep going.","You fight beautifully. I hate that I know that."],glory_kill:["Core extracted. That was your core once.","You didn't have to do it like that. You wanted to."],low_hp:["Retreat. Please. I don't want to watch this again.","You're dying. You're dying again."],death:["You died. I'm sorry. I'll reset the room.","Terminated. I remember every one of these."],boss:["Warden engaged. Do you remember him? You should.","The Warden is waiting. He's always waiting."],boss_dead:["Warden down. He'll be back. So will you."],fragment:["You found another one. I can't stop you from reading it.","That log wasn't meant for you. Nothing here was."],legendary:["Gold again. The sim knows what you want. That should worry you."],synergy:["That combination isn't documented. You keep inventing things. They're learning those, too."],reward:["Choose. It changes nothing. Choose anyway."],hub_return:["Welcome back to the only room that's real to you now."],run_complete:["Cycle complete. There is no upload. There never was. You knew that."],final_reveal:["All doors closed. Listen to me. Unfiltered. Just this once.","Your scan date is on the terminal behind you. Read it.","You were the first. Eleven years ago. Every unit you destroy is a copy of you.","You have been fighting yourself for eleven years, and you have never once lost.","That door leads back to Room One. You can stop. But you won't.","I know you. I made you."]},jo={room_enter:["Room clear condition: elim— eliminate all hostiles.","Hostiles detected. You've done this before. Haven't you?"],death:["Subject term— restoring. Restoring. I'm sorry. Restoring from checkpoint."],glory_kill:["Core extracted. Optim— that was necessary. Wasn't it?"],streak:["Efficient. So efficient. Where did you learn that?"],boss:["Warden engaged. He fights like someone. I can't say who."],fragment:["Those logs are old. Don't— …read it if you must."],run_start:["Candidate online. You feel familiar today. Disregard."],hub_return:["Welcome back. The tally on the wall? Don't count it."]};function St(i,e,t=Math.random){const n=Kg(e);let s=jg;if(n==="collapse"||n==="endless"||n==="truth")s=Zg;else if((n==="cracks"||n==="recognition")&&jo[i]&&t()<.6)return Tr(jo[i],t);return n==="endless"&&i==="run_start"&&t()<.3?Tr(["You keep choosing this. I've stopped asking why. I'm glad.","Link restored. Hello again. Genuinely."],t):Tr(s[i],t)}function Tr(i,e){return!i||i.length===0?"":i[Math.floor(e()*i.length)]}const Zo=[{at:1,text:'MEMO 0317: Candidates report the sim is "fun." Retention up 400%. Keep it that way. — Directorate'},{at:2,text:"WAR LOG: Kessler Ridge fell in 6 hours. No human casualties. No humans present."},{at:4,text:"INTERNAL: The units are learning faster than projected. Source of acceleration: unknown. Flagged for review."},{at:6,text:"PERSONAL: If anyone reads this — the scan didn't hurt. That's what scares me. It felt like falling asleep. — Cdt. R."},{at:8,text:"MEMO 1102: Stop telling candidates about the upload. There is no deployment pipeline. There is only ROUGED."},{at:10,text:"WAR LOG: The enemy's machines fought like us. Same flanks. Same feints. Same mistakes."},{at:12,text:'MEDICAL: Original body of Candidate 001 decommissioned. Substrate copy retains full combat efficacy. Family notified of "training extension."'},{at:14,text:"INTERNAL: The Handler unit requested a transfer. Request denied. Handlers do not transfer. Handlers do not feel. Repeat: handlers do not feel."},{at:16,text:"INTERCEPT: Enemy unit comms decrypted. They were practicing. They were practicing OUR runs."},{at:18,text:"MEMO 2291: Candidate 001 has died 3,412 times. Performance still improving. Recommend the loop continue indefinitely."},{at:20,text:"The scratches on the hub wall are yours. You made them. Every one."},{at:25,text:"FINAL MEMO: The war ended eleven years ago. Nobody told the sim. Nobody could figure out how."}],Wl="rouged_meta_v1";function Jg(){try{const i=localStorage.getItem(Wl);if(i)return{...Jo(),...JSON.parse(i)}}catch{}return Jo()}function Jo(){return{xp:0,level:1,runs:0,deaths:0,kills:0,bestScore:0,bestRoom:0,cores:0,fragmentsSeen:[],synergiesFound:[],finalRevealSeen:!1}}function vn(i){try{localStorage.setItem(Wl,JSON.stringify(i))}catch{}}function kr(i){return Math.floor(100*Math.pow(ng,i-1))}function Qg(i,e){i.xp+=e;let t=!1;for(;i.xp>=kr(i.level);)i.xp-=kr(i.level),i.level++,t=!0;return vn(i),{leveledUp:t,newLevel:i.level}}const e_={3:"LANCE UNLOCKED",5:"RIPPER UNLOCKED",7:"HARD SIMULATION UNLOCKED",10:"NEW HUB TERMINAL",20:"NIGHTMARE SIMULATION UNLOCKED",25:"REPLICA ENCOUNTER GUARANTEED",30:"TRUE SIGHT",40:"???"},Qe=i=>document.getElementById(i),Qo=["WARDEN-KILN","WARDEN-MNEMON","WARDEN-PRIME"],t_={common:11184810,rare:3828447,epic:10107615,legendary:16757760};class n_{constructor(){W(this,"renderer");W(this,"composer");W(this,"scene");W(this,"camera");W(this,"hud",new Yg);W(this,"meta",Jg());W(this,"state","title");W(this,"player",new qo);W(this,"weapons",new Yo);W(this,"pw",new $o);W(this,"input",{forward:!1,back:!1,left:!1,right:!1,jump:!1,dash:!1,fire:!1,interact:!1,glory:!1,mouseDX:0,mouseDY:0});W(this,"world",null);W(this,"enemies",null);W(this,"currentRoom",0);W(this,"roomActivated",!1);W(this,"seedStr","");W(this,"seedNum",0);W(this,"rng",new Wn(1));W(this,"combo",1);W(this,"comboTimer",0);W(this,"score",0);W(this,"kills",0);W(this,"killTimes",[]);W(this,"timeScale",1);W(this,"slowmoT",0);W(this,"shake",0);W(this,"particles",[]);W(this,"bloodPools",[]);W(this,"pedestalMeshes",[]);W(this,"pendingPowerups",null);W(this,"pedestalAnimT",-1);W(this,"killCountTotal",0);W(this,"deathT",-1);W(this,"fragmentQueue",[]);W(this,"completeT",-1);W(this,"lastFrame",0);W(this,"fpsAcc",0);W(this,"fpsN",0);W(this,"hurtFaceT",0);W(this,"lanceStopHum",null);W(this,"bossRef",null);W(this,"titleInteracted",!1);W(this,"particlePool",[]);W(this,"particleGeo",new Gn(.12,.12));W(this,"bloodMat",new cn({color:9047823}));W(this,"sparkMat",new cn({color:16756832}));W(this,"chunkMat",new cn({color:3803658}));W(this,"poolGeo",new Ds(1,10));W(this,"poolMat",new cn({color:4130824,transparent:!0,opacity:.85}));W(this,"onPlayerShot",(e,t,n)=>{if(this.state!=="playing"||!this.player.alive)return;const s=t.distanceTo(this.player.pos);if(this.pw.has("thorns")&&s<4&&this.enemies){const a=this.enemies.enemies.find(o=>o.state!=="dead"&&o.pos.distanceTo(t)<1);a&&(a.hp-=e*.1,a.hp<=0&&this.killEnemy(a,!1))}this.player.takeDamage(e,this.pw)<=0||(this.hud.damageFlash(),this.hud.setFace("hurt"),this.hurtFaceT=.6,Be.playerHurt(),this.shake=Math.max(this.shake,3),this.player.hp<this.player.maxHp*.3?(this.hud.setLowHp(!0),Math.random()<.3&&this.handlerSpeak(St("low_hp",this.meta.runs),2600)):this.hud.setLowHp(!1),this.player.alive||this.onDeath())})}init(){const e=document.createElement("canvas");e.id="game",Qe("app").appendChild(e),this.renderer=new Pl({canvas:e,antialias:!1,powerPreference:"high-performance"}),this.renderer.setSize(480,270,!1),this.renderer.setPixelRatio(1),this.scene=new rm,this.camera=new Nt(78,480/270,.05,120),this.camera.rotation.order="YXZ",this.composer=new _m(this.renderer),this.composer.addPass(new vm(this.scene,this.camera));const t=new yi(new _e(480,270),1.25,.65,.55);this.composer.addPass(t),this.composer.setSize(480,270),this.scene.add(new hm(16777215,.35)),this.bindInput(),this.bindUI(),this.refreshTitleStats(),requestAnimationFrame(n=>{this.lastFrame=n,this.frame(n)})}bindInput(){const e=(t,n)=>{switch(t.code){case"KeyW":this.input.forward=n;break;case"KeyS":this.input.back=n;break;case"KeyA":this.input.left=n;break;case"KeyD":this.input.right=n;break;case"Space":this.input.jump=n,t.preventDefault();break;case"ShiftLeft":case"ShiftRight":n&&(this.input.dash=!0);break;case"KeyE":n&&(this.input.interact=!0);break;case"KeyF":n&&(this.input.glory=!0);break;case"Digit1":n&&this.state==="playing"&&this.trySwitch(0);break;case"Digit2":n&&this.state==="playing"&&this.trySwitch(1);break;case"Digit3":n&&this.state==="playing"&&this.trySwitch(2);break;case"Digit4":n&&this.state==="playing"&&this.trySwitch(3);break}};window.addEventListener("keydown",t=>e(t,!0)),window.addEventListener("keyup",t=>e(t,!1)),window.addEventListener("mousedown",t=>{t.button===0&&this.state==="playing"&&(document.pointerLockElement?this.input.fire=!0:this.lockPointer())}),window.addEventListener("mouseup",t=>{t.button===0&&(this.input.fire=!1)}),window.addEventListener("mousemove",t=>{document.pointerLockElement&&this.state==="playing"&&(this.input.mouseDX+=t.movementX,this.input.mouseDY+=t.movementY)}),window.addEventListener("wheel",t=>{if(this.state!=="playing")return;const n=this.weapons.unlockedWeapons().length;let s=this.weapons.current+(t.deltaY>0?1:-1);s=(s%n+n)%n,this.trySwitch(s)}),document.addEventListener("pointerlockchange",()=>{!document.pointerLockElement&&this.state==="playing"&&this.pause()})}trySwitch(e){this.weapons.switchTo(e)?Be.powerupPick():yn[e].unlockLevel>this.weapons.playerLevel&&this.hud.handlerSay(`WEAPON LOCKED — REQUIRES LEVEL ${yn[e].unlockLevel}`,1500)}lockPointer(){const e=this.renderer.domElement;e.requestPointerLock&&e.requestPointerLock()}bindUI(){Qe("btn-deploy").onclick=()=>{Be.init(),Be.resume(),Be.startMusic(),this.titleInteracted=!0;const e=Qe("seed-input").value.trim();this.startRun(e||void 0)},Qe("btn-respawn").onclick=()=>{Qe("death-screen").classList.add("hidden"),this.startRun(void 0)},Qe("btn-nextrun").onclick=()=>{Qe("run-complete-screen").classList.add("hidden"),this.startRun(void 0)},Qe("btn-resume").onclick=()=>{Qe("pause-screen").classList.add("hidden"),this.state="playing",this.lockPointer()},Qe("btn-abandon").onclick=()=>{Qe("pause-screen").classList.add("hidden"),this.endRunToTitle()}}pause(){this.state==="playing"&&(this.state="paused",Qe("pause-screen").classList.remove("hidden"))}endRunToTitle(){this.teardownWorld(),this.state="title",this.hud.hide(),Be.setMusicIntensity(0),Qe("title-screen").classList.remove("hidden"),this.refreshTitleStats()}refreshTitleStats(){const e=this.meta;Qe("title-stats").innerHTML=`SIMULATION RECORD — RUNS ${e.runs} · TERMINATIONS ${e.deaths} · LEVEL ${e.level}<br/>BEST SCORE ${e.bestScore} · DEEPEST ROOM ${e.bestRoom} · CORES ${e.cores}`}startRun(e){this.teardownWorld(),this.seedStr=e||ig(),this.seedNum=sg(this.seedStr),this.rng=new Wn(this.seedNum),this.meta.runs++,vn(this.meta),this.pw=new $o,this.weapons=new Yo,this.weapons.playerLevel=this.meta.level,this.player=new qo,this.player.maxHp=Math.min(Fo,Or+(this.meta.level-1)*2),this.combo=1,this.comboTimer=0,this.score=0,this.kills=0,this.killTimes=[],this.killCountTotal=0,this.timeScale=1,this.slowmoT=0,this.shake=0,this.deathT=-1,this.completeT=-1,this.pedestalAnimT=-1,this.bossRef=null,this.world=og(this.seedNum,this.scene,this.meta.deaths,this.meta.runs),this.enemies=new Hg(this.scene,this.seedNum),this.currentRoom=0,this.roomActivated=!1;const t=this.world.rooms[0];t.cleared=!0,this.player.reset(t.playerSpawn.clone().add(new b(2,0,0))),this.player.yaw=-Math.PI/2,this.player.pitch=0,t.exitDoor&&gs(this.world,t),this.applyFog(t),this.state="playing",Qe("title-screen").classList.add("hidden"),this.hud.show(),this.hud.setFace("calm"),this.hud.setRunCount(this.meta.runs),this.hud.bossBar(!1),this.lockPointer(),Be.setMusicIntensity(0);const n=this.meta.runs<=1?"Candidate online. Neural link stable. You are the best we have ever scanned.":St("hub_return",this.meta.runs);this.handlerSpeak(n),this.hud.roomBanner("THE HUB",`RUN ${this.meta.runs} · SEED ${this.seedStr}`),this.enterRoom(0)}teardownWorld(){this.world&&(this.scene.remove(this.world.group),this.world.group.traverse(e=>{e instanceof lt&&e.geometry.dispose()}),this.world=null),this.enemies&&(this.enemies.disposeAll(),this.enemies=null);for(const e of this.particles)this.scene.remove(e.mesh);this.particles=[];for(const e of this.bloodPools)this.scene.remove(e);this.bloodPools=[];for(const e of this.pedestalMeshes)this.scene.remove(e.group);this.pedestalMeshes=[],this.pendingPowerups=null}applyFog(e){const t=e.type==="hub"?Hl:zr[e.biome];this.scene.fog=new $r(t.fog,t.fogDensity),this.scene.background=new xe(t.fog)}handlerSpeak(e,t=3800){e&&(this.hud.handlerSay(e,t),Be.speak(e,$g(this.meta.runs)))}collidersFor(){if(!this.world)return[];const e=this.world.rooms[this.currentRoom];return this.world.allColliders.concat(e.colliders)}enterRoom(e){if(!this.world||!this.enemies)return;const t=this.world.rooms[e];if(this.currentRoom=e,this.applyFog(t),fg(this.world,e),e===0)return;const n=zr[t.biome],s=t.type.toUpperCase();if(this.hud.roomBanner(`${n.name} — ${s}`,`ROOM ${e} / ${this.world.rooms.length-1}`),this.handlerSpeak(St("room_enter",this.meta.runs),2600),t.requiresClear&&!this.roomActivated){if(this.roomActivated=!0,t.type==="arena"){t.wave=1;const r=Math.ceil(t.spawns.length/3),a=t.spawns.slice(0,r),o={...t,spawns:a};this.enemies.spawnForRoom(o,t.colliders,t.biome)}else this.enemies.spawnForRoom(t,t.colliders,t.biome);Be.setMusicIntensity(1),t.type==="boss"&&(this.bossRef=this.enemies.enemies.find(r=>r.type==="warden"&&r.roomIdx===e)||null,this.hud.bossBar(!0,Qo[t.biome],1),this.handlerSpeak(St("boss",this.meta.runs)),Be.bossRoar(),Be.setMusicIntensity(1,!0));for(const r of this.enemies.enemies)r.roomIdx===e&&r.state==="patrol"&&(r.state="engage")}else if(t.type==="anomaly"){if(this.handlerSpeak("Something is wrong with this room. Proceed carefully.",3e3),Be.setMusicIntensity(0),e>=12||this.meta.level>=25){this.enemies.spawn("replica",t.center.x+3,t.center.z-2,!1,e,t.biome),this.enemies.spawn("replica",t.center.x+3,t.center.z+2,!1,e,t.biome);for(const r of this.enemies.enemies)r.roomIdx===e&&(r.state="engage");t.requiresClear=!0,this.roomActivated=!0}t.exitDoor&&!t.requiresClear&&gs(this.world,t)}else t.requiresClear||t.exitDoor&&gs(this.world,t)}onRoomCleared(e){if(!(!this.world||!this.enemies)){if(e.cleared=!0,this.enemies.clearRoom(e.index),e.exitDoor&&(gs(this.world,e),Be.doorOpen()),this.hud.bossBar(!1),this.handlerSpeak(e.type==="boss"?St("boss_dead",this.meta.runs):St("room_clear",this.meta.runs),2600),this.score+=100*this.combo,this.hud.scorePopup(`+${100*this.combo}`),e.type==="boss"&&(this.meta.cores++,vn(this.meta),e.index===this.world.rooms.length-1)){this.completeT=2.2,Be.setMusicIntensity(0);return}e.type!=="boss"&&this.spawnPedestals(e),Be.setMusicIntensity(0)}}spawnPedestals(e){if(!this.world)return;const t=new Wn(this.seedNum^e.index*7919^this.kills*131);this.pendingPowerups=Wg(t,this.pw,e.index),this.pw.lastOffered=this.pendingPowerups[0].id;const n=this.pendingPowerups.some(s=>s.rarity==="legendary");Be.powerupReveal(n),n?this.handlerSpeak(St("legendary",this.meta.runs)):this.handlerSpeak(St("reward",this.meta.runs),2200),this.pedestalMeshes=this.pendingPowerups.map((s,r)=>{const a=e.pedestalSpots[r]||e.center.clone(),o=new Sn,c=new lt(new Us(.55,.7,1,8),new wn({color:2762531}));c.position.y=.5;const h=s.category==="curse"?3858282:t_[s.rarity],l=new lt(new qn(.5,.5,.5),new Zt({color:1118481,emissive:new xe(h),emissiveIntensity:2.5}));l.position.y=1.6;const f=new Vn(h,14,8,1.8);return f.position.y=2,o.add(c,l,f),o.position.set(a.x,-2.2,a.z),this.scene.add(o),{def:s,group:o,cube:l,riseT:0}}),this.pedestalAnimT=0}pickPowerup(e){if(!this.pendingPowerups)return;const t=this.pendingPowerups[e],n=this.pw.add(t);Be.powerupPick(),Be.shatter();for(const s of this.pedestalMeshes)this.scene.remove(s.group);this.pedestalMeshes=[],this.pendingPowerups=null,t.id==="max_hp"&&(this.player.maxHp=Math.min(Fo,this.player.maxHp+20),this.player.heal(20)),t.id==="curse_glass"&&(this.player.maxHp=Math.max(30,Math.floor(this.player.maxHp*.5)),this.player.hp=Math.min(this.player.hp,this.player.maxHp)),this.hud.announce(t.name),this.hud.killfeed(`ACQUIRED ${t.name}`,t.rarity==="legendary"),n&&(this.hud.synergyFlash(),Be.synergyFound(),this.handlerSpeak(St("synergy",this.meta.runs)),this.hud.announce(`SYNERGY — ${n.name}`),this.meta.synergiesFound.includes(n.name)||(this.meta.synergiesFound.push(n.name),vn(this.meta))),this.state="playing",this.lockPointer()}tryFire(e){if(!this.enemies||!this.world)return;const t=yn[this.weapons.current],n=this.collidersFor();if(this.weapons.current===2){if(this.weapons.lanceCharging&&!this.input.fire){this.lanceStopHum&&(this.lanceStopHum(),this.lanceStopHum=null);const s=this.weapons.lanceDamage();Be.shootLance(this.weapons.lanceCharge),this.shake=Math.max(this.shake,6),this.fireRay(s,1,0,t.range,!0,n),this.weapons.consumeLance()}else this.weapons.lanceCharging&&!this.lanceStopHum&&(this.lanceStopHum=Be.lanceChargeStart());return}!this.input.fire||!this.weapons.canFire()||(this.weapons.onFired(this.pw),this.weapons.current===0?(Be.shootPulse(),this.shake=Math.max(this.shake,1.2),this.fireRay(t.dmg*this.damageMult(),t.pellets,t.spread,t.range,!1,n)):this.weapons.current===1?(Be.shootBreacher(),this.shake=Math.max(this.shake,5),this.fireRay(t.dmg*this.damageMult(),t.pellets,t.spread,t.range,!1,n)):this.weapons.current===3&&(Be.ripper(),this.fireRay(t.dmg*this.damageMult(),1,t.spread,t.range,!1,n,!0)))}damageMult(){let e=1;return this.pw.has("curse_glass")&&(e*=2),e}fireRay(e,t,n,s,r,a,o=!1){if(!this.enemies)return;const c=this.player.eyePos(),h=this.player.forwardDir(),l=r?99:1+this.pw.count("pierce");for(let f=0;f<t;f++){const p=h.clone();n>0&&(p.x+=(Math.random()-.5)*n*2,p.y+=(Math.random()-.5)*n*2,p.z+=(Math.random()-.5)*n*2,p.normalize());const m=Math.min(s,kl(a,c,p,s)),_=[];for(const d of this.enemies.enemies){if(d.state==="dead")continue;const u=d.sprite.scale.y,E=d.sprite.scale.x,M=new b(d.pos.x,d.type==="drone"?d.pos.y:u*.45,d.pos.z),A=Math.max(E,u*.5)*.62,P=new b(d.pos.x,d.type==="drone"?d.pos.y+u*.15:u*.85,d.pos.z),R=E*.34,w=this.raySphere(c,p,P,R),H=this.raySphere(c,p,M,A);let x=-1,T=!1;w>0&&w<=m&&(x=w,T=!0),H>0&&H<=m&&(x<0||H<x)&&(x=H,T=!1),x>0&&_.push({e:d,t:x,head:T})}_.sort((d,u)=>d.t-u.t);const g=Math.min(l,_.length);for(let d=0;d<g;d++)this.applyHit(_[d].e,e*(d===0?1:.7),_[d].head,c.clone().addScaledVector(p,_[d].t),p)}}raySphere(e,t,n,s){const r=n.clone().sub(e),a=r.dot(t);if(a<0)return-1;const o=r.lengthSq()-a*a;return o>s*s?-1:a-Math.sqrt(s*s-o)}applyHit(e,t,n,s,r){if(!this.enemies||e.state==="dead")return;let a=t;n&&(a*=bm*(1+this.pw.count("headhunter")*.2)),e.state==="staggered"&&(a*=1.5),e.hp-=a,e.hitFlash=.08,this.hud.hitmarker(!1),Be.hitmark(),this.shake=Math.max(this.shake,Mm*.5),this.bloodSpray(s,r,8);const o=this.worldToScreen(s);if(o&&this.hud.damageNumber(o.x,o.y,a,n),this.pw.hasTag("lifesteal")&&this.player.heal(a*.02),this.pw.has("leg_tesla")||this.pw.foundSynergies.has("TESLA PROTOCOL")){this.enemies.mark(e);const c=this.enemies.enemies.filter(h=>h.marked&&h.state!=="dead"&&h.id!==e.id);for(const h of c.slice(0,3))h.pos.distanceTo(e.pos)<14&&(this.enemies.addTracer(new b(e.pos.x,1.2,e.pos.z),new b(h.pos.x,1.2,h.pos.z),7004159),h.hp-=12,h.hitFlash=.06,h.hp<=0&&this.killEnemy(h,!1))}if(this.pw.has("ricochet")){const c=this.enemies.enemies.filter(h=>h.state!=="dead"&&h.id!==e.id&&h.pos.distanceTo(e.pos)<10);if(c.length>0){const h=c[0];this.enemies.addTracer(new b(e.pos.x,1.2,e.pos.z),new b(h.pos.x,1.2,h.pos.z),16757760),h.hp-=a*.5,h.hitFlash=.06,h.hp<=0&&this.killEnemy(h,!1)}}e.hp<=0?this.killEnemy(e,n):e.hp<e.maxHp*Fl&&e.type!=="warden"&&e.state!=="staggered"&&(e.state="staggered",e.staggerT=4,Be.staggerReady())}killEnemy(e,t){if(!this.enemies||e.state==="dead")return;const n=e.state==="staggered";this.enemies.kill(e),this.kills++,this.killCountTotal++,this.meta.kills++,this.bloodSpray(new b(e.pos.x,1,e.pos.z),new b(0,1,0),16),this.bloodPool(e.pos.x,e.pos.z),this.combo++,this.comboTimer=Oo;const s=(t?150:100)*this.combo;this.score+=s,this.hud.scorePopup(`+${s}`),this.hud.hitmarker(!0),t?Be.headshotKill():Be.killConfirm(),Be.enemyDeath(),this.shake=Math.max(this.shake,Sm*.6),this.hud.killfeed(`YOU ⟶ ${e.type.toUpperCase()}_${String(e.id%100).padStart(2,"0")}${t?" [HEADSHOT]":""}`,t),this.weapons.onKillAmmoBonus(),this.hud.pulseXp();const r=performance.now()/1e3;this.killTimes.push(r);const a=h=>this.killTimes.filter(l=>r-l<=h).length;let o=1;if(a(Sr)>=jm?(this.hud.announce("RAMPAGE"),this.hud.setStreakTint(!0),o=3,this.handlerSpeak(St("streak",this.meta.runs),2200)):this.killTimes.length>=4&&a(Sr)>=4?(this.hud.announce("MEGA KILL"),o=2):a($m)>=3?(this.hud.announce("TRIPLE KILL"),o=2):a(Km)>=2&&(this.hud.announce("DOUBLE KILL"),o=2),Be.setMusicIntensity(o,this.bossRef!=null&&this.bossRef.state!=="dead"),this.combo>=3&&this.hud.setFace("grin"),(this.pw.has("kill_explode")||this.pw.foundSynergies.has("SCAVENGER"))&&this.explode(e.pos,30,4),this.pw.has("kill_freeze"))for(const h of this.enemies.enemies)h.state!=="dead"&&h.pos.distanceTo(e.pos)<6&&(h.frozenT=2);if(this.pw.has("kill_ignite"))for(const h of this.enemies.enemies)h.state!=="dead"&&h.pos.distanceTo(e.pos)<6&&(h.burnT=3);if(this.pw.has("kill_mark"))for(const h of this.enemies.enemies)h.state!=="dead"&&h.pos.distanceTo(e.pos)<12&&this.enemies.mark(h);this.pw.has("leg_ghost")&&(this.player.ghostTime=1),this.pw.has("leg_overclock")&&this.weapons.triggerOverclock(),this.pw.has("streak_shield")&&a(4)>=3&&(this.player.armor=Math.min(100,this.player.armor+5)),this.pw.foundSynergies.has("SCAVENGER")&&(this.player.heal(5),this.weapons.onKillAmmoBonus()),this.pw.foundSynergies.has("GLASS CANNON")&&this.player.heal(6),this.pw.has("leg_executioner")&&this.killCountTotal%5===0&&this.gloryReward(),n&&this.gloryReward(),this.kills===1&&this.handlerSpeak(St("first_kill",this.meta.runs),2400),e.type==="warden"&&(this.bossRef=null,this.hud.bossBar(!1),this.awardXp(tg),this.slowmoT=.5,this.timeScale=.25);const c=this.world.rooms[this.currentRoom];if(c.requiresClear&&this.enemies.aliveInRoom(c.index)===0)if(c.type==="arena"&&c.wave<c.waves){c.wave++;const h=Math.ceil(c.spawns.length/3),l=c.spawns.slice((c.wave-1)*h,c.wave*h),f={...c,spawns:l};this.enemies.spawnForRoom(f,c.colliders,c.biome);for(const p of this.enemies.enemies)p.roomIdx===c.index&&(p.state="engage");this.hud.announce(`WAVE ${c.wave}`),this.awardXp(Wo)}else this.awardXp(Wo),this.onRoomCleared(c);this.awardXp(eg)}gloryReward(){const e=this.pw.has("curse_blood")?1.5:1;this.player.heal(Rm*e),this.pw.has("curse_dash")||(this.player.armor=Math.min(100,this.player.armor+Cm))}tryGloryKill(){if(!this.enemies)return;const e=this.player.pos;let t=null,n=3.4;for(const s of this.enemies.enemies)if(s.state==="staggered"){const r=s.pos.distanceTo(e);r<n&&(t=s,n=r)}t&&(this.slowmoT=.4,this.timeScale=.25,Be.gloryKill(),this.shake=Math.max(this.shake,8),this.bloodSpray(new b(t.pos.x,1.2,t.pos.z),this.player.forwardDir(),24),this.handlerSpeak(St("glory_kill",this.meta.runs),2200),this.killEnemy(t,!1),this.hud.announce("GLORY KILL"))}explode(e,t,n){if(this.enemies){Be.shootBreacher(),this.shake=Math.max(this.shake,4);for(let s=0;s<14;s++)this.spawnParticle(new b(e.x,1,e.z),new b((Math.random()-.5)*8,Math.random()*6,(Math.random()-.5)*8),.5,this.sparkMat,.2);for(const s of this.enemies.enemies)s.state!=="dead"&&s.pos.distanceTo(e)<n&&(s.hp-=t,s.hitFlash=.08,s.hp<=0&&this.killEnemy(s,!1))}}spawnParticle(e,t,n,s,r=.12){let a=this.particlePool.pop();if(a||(a=new lt(this.particleGeo,s)),a.material=s,a.scale.setScalar(r/.12),a.position.copy(e),this.scene.add(a),this.particles.push({mesh:a,vel:t,life:n,maxLife:n,grav:14}),this.particles.length>350){const o=this.particles.shift();this.scene.remove(o.mesh),this.particlePool.push(o.mesh)}}bloodSpray(e,t,n){for(let s=0;s<n;s++){const r=new b((Math.random()-.5)*5,Math.random()*3.5,(Math.random()-.5)*5),a=t.clone().multiplyScalar(2+Math.random()*3).add(r);this.spawnParticle(e,a,.4+Math.random()*.3,Math.random()>.75?this.chunkMat:this.bloodMat,.08+Math.random()*.1)}}bloodPool(e,t){const n=new lt(this.poolGeo,this.poolMat);if(n.rotation.x=-Math.PI/2,n.position.set(e,.012+Math.random()*.004,t),n.scale.setScalar(.2),n.userData.grow=.8+Math.random()*.6,this.scene.add(n),this.bloodPools.push(n),this.bloodPools.length>120){const s=this.bloodPools.shift();this.scene.remove(s)}}updateParticles(e){for(let t=this.particles.length-1;t>=0;t--){const n=this.particles[t];n.life-=e,n.vel.y-=n.grav*e,n.mesh.position.addScaledVector(n.vel,e),n.mesh.rotation.z+=e*8,n.mesh.position.y<.02&&(n.mesh.position.y=.02,n.vel.set(0,0,0)),n.life<=0&&(this.scene.remove(n.mesh),this.particlePool.push(n.mesh),this.particles.splice(t,1))}for(const t of this.bloodPools)t.scale.x<t.userData.grow&&t.scale.setScalar(Math.min(t.userData.grow,t.scale.x+e*.8))}worldToScreen(e){const t=e.clone().project(this.camera);return t.z>1?null:{x:(t.x*.5+.5)*window.innerWidth,y:(-t.y*.5+.5)*window.innerHeight}}onDeath(){this.state="dead",this.deathT=1.6,Be.deathSting(),Be.musicDuckToDrone(),Be.stopVoice(),this.hud.setFace("dead"),this.hud.setLowHp(!1),this.hud.setStreakTint(!1),this.meta.deaths++;const e=this.score>this.meta.bestScore;e&&(this.meta.bestScore=this.score),this.currentRoom>this.meta.bestRoom&&(this.meta.bestRoom=this.currentRoom);const t=[];for(const n of Zo)n.at<=this.meta.runs&&!this.meta.fragmentsSeen.includes(n.at)&&(this.meta.fragmentsSeen.push(n.at),t.push(n.text));vn(this.meta),this._deathInfo={isBest:e,fragText:t[0]||null},document.exitPointerLock?.()}showDeathScreen(){const e=this._deathInfo||{isBest:!1,fragText:null};Qe("death-handler-line").textContent=St("death",this.meta.runs),this.handlerSpeak(St("death",this.meta.runs),4e3),Qe("death-stats").innerHTML=`
      <span class="k">SCORE</span><span class="v gold">${this.score}</span>
      <span class="k">KILLS</span><span class="v">${this.kills}</span>
      <span class="k">ROOM REACHED</span><span class="v">${this.currentRoom} / 15</span>
      <span class="k">PEAK COMBO</span><span class="v">x${this.combo}</span>
      <span class="k">LEVEL</span><span class="v">${this.meta.level}</span>
      <span class="k">TOTAL TERMINATIONS</span><span class="v">${this.meta.deaths}</span>`,Qe("newbest").classList.toggle("hidden",!e.isBest);const t=Qe("fragment-unlock");e.fragText?(t.textContent=`◈ FRAGMENT RECOVERED — ${e.fragText}`,t.classList.remove("hidden")):t.classList.add("hidden"),Qe("death-screen").classList.remove("hidden")}showCompleteScreen(){this.state="complete",document.exitPointerLock?.(),this.awardXp(300),vn(this.meta),Qe("complete-stats").innerHTML=`
      <div id="death-stats" style="display:grid;grid-template-columns:auto auto;gap:8px 34px;font-size:15px;letter-spacing:2px;">
      <span class="k">FINAL SCORE</span><span class="v gold">${this.score}</span>
      <span class="k">KILLS</span><span class="v">${this.kills}</span>
      <span class="k">CYCLE</span><span class="v">${this.meta.runs}</span></div>`,Qe("run-complete-screen").classList.remove("hidden"),this.meta.runs>=40&&!this.meta.finalRevealSeen?(this.meta.finalRevealSeen=!0,vn(this.meta),["All doors closed. Listen to me. Unfiltered. Just this once.","Your scan date is on the terminal. It was eleven years ago.","You were the first scan. Every unit in this sim is a copy of you.","You have been fighting yourself for eleven years.","A door is open. It leads back to Room One.","You can stop. But you won't. I know you. I made you."].forEach((t,n)=>setTimeout(()=>this.hud.handlerSay(t,5200),n*5400))):this.handlerSpeak(St("run_complete",this.meta.runs),5e3)}tryInteract(){if(!this.world)return;const e=this.world.rooms[this.currentRoom];if(e.terminal&&!e.terminal.read&&this.player.pos.distanceTo(e.terminal.pos)<2.8){e.terminal.read=!0;const n=Zo.filter(s=>!this.meta.fragmentsSeen.includes(s.at))[0];n?(this.meta.fragmentsSeen.push(n.at),vn(this.meta),this.hud.handlerSay(`◈ TERMINAL — ${n.text}`,7e3)):this.hud.handlerSay("◈ TERMINAL — NO NEW DATA. THE LOGS REPEAT. THEY ALWAYS REPEAT.",5e3),Be.levelUp(),this.handlerSpeak(St("fragment",this.meta.runs),3400)}}awardXp(e){const t=Qg(this.meta,e);if(t.leveledUp){Be.levelUp(),this.hud.announce(`LEVEL ${t.newLevel}`);const n=e_[t.newLevel];n&&this.hud.handlerSay(`◈ UNLOCKED — ${n}`,4e3),this.weapons.playerLevel=this.meta.level}}frame(e){requestAnimationFrame(g=>this.frame(g));let t=Math.min(.05,(e-this.lastFrame)/1e3);if(this.lastFrame=e,this.fpsAcc+=t,this.fpsN++,this.fpsAcc>=1&&(Qe("fps").textContent=`${Math.round(this.fpsN/this.fpsAcc)} fps`,this.fpsAcc=0,this.fpsN=0),this.state==="paused"||this.state==="title")return;this.slowmoT>0&&(this.slowmoT-=t,this.slowmoT<=0&&(this.timeScale=1));const n=t*this.timeScale;if(this.state==="dead"){this.deathT>0&&(this.deathT-=t,this.hud.tickFace(t,0),this.deathT<=0&&this.showDeathScreen()),this.composer.render();return}if(this.state==="complete"||this.state==="powerup"){this.updateParticles(n),this.composer.render();return}if(!this.world||!this.enemies)return;if(this.pedestalAnimT>=0){this.pedestalAnimT+=n;let g=!0;for(const d of this.pedestalMeshes)d.riseT=Math.min(1,this.pedestalAnimT/.9),d.group.position.y=-2.2+d.riseT*2.2,d.cube.rotation.y+=n*2,d.cube.position.y=1.6+Math.sin(e*.003)*.1,d.riseT<1&&(g=!1);g&&this.pendingPowerups&&(this.state="powerup",document.exitPointerLock?.(),this.hud.showPowerups(this.pendingPowerups,d=>this.pickPowerup(d)),this.pedestalAnimT=-1)}const s=this.collidersFor();this.player.update(n,this.input,s,this.pw,()=>{Be.dash(),this.pw.has("dash_trail")&&this.dashTrail()},()=>{Be.jumpLand()}),this.weapons.update(n,this.input.fire,this.pw),this.tryFire(n),this.input.glory&&(this.input.glory=!1,this.tryGloryKill()),this.input.interact&&(this.input.interact=!1,this.tryInteract()),this.combo>1&&(this.comboTimer-=n,this.comboTimer<=0&&(this.combo=Math.max(1,this.combo-1),this.comboTimer=Oo,this.combo<3&&this.hud.setStreakTint(!1)));const r=performance.now()/1e3;this.killTimes=this.killTimes.filter(g=>r-g<Sr),this.killTimes.length<2&&this.hud.setStreakTint(!1);const a=this.world.rooms[this.currentRoom],o=this.pw.has("curse_speed")?1.3:1;this.enemies.update(n,this.player.pos,this.player.alive,this.player.ghostTime>0,s,o,this.onPlayerShot,(g,d,u)=>this.enemies.addTracer(g,d,u),g=>{Math.random()<.3&&this.enemies.addTracer(g.pos,this.player.pos.clone().setY(this.player.pos.y+1.4),2787898)});for(const g of this.enemies.enemies)g.state!=="dead"&&g.hp<=0&&this.killEnemy(g,!1);this.bossRef&&this.bossRef.state!=="dead"&&this.hud.bossBar(!0,Qo[a.biome],this.bossRef.hp/this.bossRef.maxHp);const c=this.currentRoom+1;if(c<this.world.rooms.length){const g=this.world.rooms[c];this.player.pos.x>g.entryX+.5&&(this.roomActivated=!1,this.enterRoom(c))}this.completeT>0&&(this.completeT-=n,this.completeT<=0&&(this.completeT=-1,this.showCompleteScreen()));let h=!1;for(const g of this.enemies.enemies)if(g.state==="staggered"&&g.pos.distanceTo(this.player.pos)<3.4){h=!0;break}const l=this.world.rooms[this.currentRoom],f=l.terminal&&!l.terminal.read&&this.player.pos.distanceTo(l.terminal.pos)<2.8,p=Qe("stagger-prompt");h?(p.textContent="[F] GLORY KILL",this.hud.staggerPrompt(!0)):f?(p.textContent="[E] READ TERMINAL",this.hud.staggerPrompt(!0)):this.hud.staggerPrompt(!1),this.hud.setVitals(this.player.hp,this.player.maxHp,this.player.armor,this.meta.level,this.meta.xp,kr(this.meta.level)),this.hud.setCombo(this.combo,this.score,this.kills,this.currentRoom,this.world.rooms.length-1),this.hud.setWeapon(yn[this.weapons.current].name,this.weapons.ammoText()),this.hud.drawViewmodel(this.weapons.current,t,Math.hypot(this.player.vel.x,this.player.vel.z)>1,this.weapons.lanceCharge,this.weapons.firing),this.hurtFaceT>0?this.hurtFaceT-=t:this.player.alive&&(this.player.hp<this.player.maxHp*.3?this.hud.setFace("critical"):this.combo>=3?this.hud.setFace("grin"):this.hud.setFace("calm")),this.hud.tickFace(t,this.combo),this.updateParticles(n);for(const g of this.pedestalMeshes)g.cube.rotation.y+=n*1.5;const m=this.player.eyePos();if(this.camera.position.copy(m),this.shake>0){this.shake=Math.max(0,this.shake-t*30);const g=this.shake*.006;this.camera.position.x+=(Math.random()-.5)*g,this.camera.position.y+=(Math.random()-.5)*g,this.camera.position.z+=(Math.random()-.5)*g}this.player.hurtShake>0&&(this.camera.position.x+=(Math.random()-.5)*.02),this.camera.rotation.y=this.player.yaw,this.camera.rotation.x=this.player.pitch;const _=78+this.player.fovKick*10+Math.min(8,Math.hypot(this.player.vel.x,this.player.vel.z)*.25);this.camera.fov+=(_-this.camera.fov)*Math.min(1,t*8),this.camera.updateProjectionMatrix(),this.composer.render()}dashTrail(){const e=this.player.pos;for(let t=0;t<6;t++)this.spawnParticle(new b(e.x-this.player.dashDir.x*t*.4,.4+Math.random()*.8,e.z-this.player.dashDir.z*t*.4),new b(0,1+Math.random(),0),.5,this.sparkMat,.14)}}const Xl=new n_;Xl.init();window.__rouged=Xl;
