/* PizzaViz v3 — pizza ilustrada 100% vetorial (SVG) que se monta etapa por etapa.
   Sem dependências: SVG + Web Animations API + SMIL (morph do queijo).
   Etapas (~1–1,2 s cada): massa → molho em espiral (stroke-dash) → queijo derretendo (blob morph)
   → coberturas (grandes → médias → miúdas → ervas → fios) caindo com leve quique.
   Distribuição: "best-candidate" de Mitchell (blue-noise / Poisson-disc aproximado) para peças
   grandes e médias, com raio mínimo por tipo e sem sobreposição; espiral de Vogel (girassol) com
   jitter para miúdos (orégano, granulado, milho...). Semente determinística por sabor+metade.
   Sombras das peças são desenhadas no próprio sprite (sem filtros → sem repaint caro).
   Borda recheada: a borda "abre" (sulco), o catupiry é aplicado em volta e a massa "fecha". */
import { GRADS as SPRITE_GRADS, SPR as SPRITES } from './pizza-engine-sprites.js';
(function(){
'use strict';
var NS='http://www.w3.org/2000/svg',C=200,RIN=158,RCH=147; // RIN = área do molho; RCH = raio do queijo
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var STEP=1100; // ritmo calmo: ~1,1 s por etapa
function el(t,a,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function anim(node,kf,o){if(reduce||!node.animate){var l=kf[kf.length-1];for(var k in l)if(k!=='offset'&&k!=='easing')node.style[k]=l[k];return{finished:Promise.resolve(),cancel:function(){}}}return node.animate(kf,Object.assign({fill:'both'},o))}
var EASE='cubic-bezier(.45,0,.2,1)',SOFT='cubic-bezier(.22,1,.36,1)',DROP='cubic-bezier(.33,.66,.36,1)';
var GRADS=SPRITE_GRADS,SPR=SPRITES;
/* nº de variações de desenho por ingrediente (frango em tufos diferentes etc.) */
var VAR={};Object.keys(SPR).forEach(function(k){VAR[k]=Array.isArray(SPR[k])?SPR[k].length:1});

/* orégano: flocos secos irregulares (verde-oliva a pardo) */
var ORE=['M-2.3-.6L-.6-2.1 1.9-1.5 2.2.7.4 1.9-1.9 1.2Z','M-1.8-1.4L1.2-2 2.4.2.8 1.6-2.2.9Z','M-2-1L.2-1.8 1.6-.6 1.2 1.4-1.4 1.6Z','M-1.2-.8L1.4-1.2 1.8.6-.4 1Z'],ORC=['#3F5A22','#56692B','#6B6A2E','#4A6326','#7A7436'];
var CONF=['#D7282F','#F2B233','#3F7A2F','#3A7BD5','#E26AA0'];
var SAUCE={molho:'#C8402A',choco:'#5A2E1A',chocobranco:'#FFF6E4',nutella:'#6B3A1E',pistachecreme:'#B9C677'};
/* R0 = raio do sprite (unid. do símbolo 28×28); TR = raio exibido (px no viewBox 400); N = qtd. na pizza inteira */
var T={
calabresa:{R0:10.4,TR:16.5,N:17,rot:1},bacon:{R0:13,TR:17.5,N:13,rot:1},frango:{R0:13,TR:18,N:23,rot:1},catupiry:{R0:9.6,TR:14,N:11,rot:1},
ovo:{R0:9.6,TR:15,N:8,rot:1},tomate:{R0:8.4,TR:13,N:13,rot:1},cebola:{R0:9.8,TR:14.5,N:13,rot:1},pimentao:{R0:9.8,TR:14.5,N:11,rot:1},
lombo:{R0:10.8,TR:16.5,N:13,rot:1},abacaxi:{R0:9.2,TR:12.5,N:13,rot:1},geleia:{R0:6.6,TR:10,N:15,rot:1},champignon:{R0:9.8,TR:14,N:13,rot:1},
presunto:{R0:10.8,TR:16.5,N:12,rot:1},banana:{R0:9.3,TR:13.5,N:18},morango:{R0:9.8,TR:14.5,N:17,rot:1},goiabada:{R0:6,TR:11.5,N:16,rot:1},
parmesao:{R0:6.4,TR:9,N:34,rot:1},provolone:{R0:9.2,TR:14,N:10,rot:1},gorgonzola:{R0:5.8,TR:8.5,N:18,rot:1},azeitona:{R0:6.8,TR:9.2,N:13,rot:1},
manjericao:{R0:11,TR:12,N:9,rot:1,herb:1},azeite:{R0:6,TR:9,N:12,rot:1,herb:1},
alho:{R0:5,TR:6.8,N:30,fine:1,rot:1},milho:{R0:3.3,TR:4.8,N:46,fine:1,rot:1},confete:{R0:3.9,TR:5,N:52,fine:1},granulado:{R0:3.6,TR:5.8,N:120,fine:1,rot:1},
coco:{R0:4.2,TR:6,N:130,fine:1,rot:1},amendoim:{R0:4.8,TR:6.6,N:56,fine:1,rot:1},pistache:{R0:4.6,TR:6.4,N:58,fine:1,rot:1}
};
function cls(id){var t=T[id];return !t?9:t.herb?3:t.fine?2:t.TR>=11?0:1} // 0 grande, 1 média, 2 miúda, 3 erva

/* ---------- formas ---------- */
function spiral(maxR,turns){var d='',st=turns*48;for(var i=0;i<=st;i++){var th=i/48*2*Math.PI,r=3+(maxR-3)*i/st;d+=(i?'L':'M')+(C+r*Math.cos(th)).toFixed(1)+' '+(C+r*Math.sin(th)).toFixed(1)}return d}
function blob(R,seed,wob,n){var r=rng(seed),pts=[];n=n||12;for(var i=0;i<n;i++){var a=i/n*2*Math.PI,rr=R+(r()-.5)*wob;pts.push([C+rr*Math.cos(a),C+rr*Math.sin(a)])}
  var d='M'+pts[0][0].toFixed(1)+' '+pts[0][1].toFixed(1);for(var j=0;j<n;j++){var p0=pts[(j-1+n)%n],p1=pts[j],p2=pts[(j+1)%n],p3=pts[(j+2)%n];
  d+='C'+(p1[0]+(p2[0]-p0[0])/6).toFixed(1)+' '+(p1[1]+(p2[1]-p0[1])/6).toFixed(1)+' '+(p2[0]-(p3[0]-p1[0])/6).toFixed(1)+' '+(p2[1]-(p3[1]-p1[1])/6).toFixed(1)+' '+p2[0].toFixed(1)+' '+p2[1].toFixed(1)}return d+'Z'}
function waves(seed,gap,side){var r=rng(seed),out=[];for(var row=-120;row<=120;row+=gap){var d='',ph=r()*6,amp=4+r()*4,R=134,xs=Math.sqrt(Math.max(0,R*R-row*row));if(xs<24)continue;for(var x=-xs;x<=xs;x+=5){d+=(d?'L':'M')+(C+x).toFixed(1)+' '+(C+row+amp*Math.sin(x/12+ph)).toFixed(1)}out.push(d)}return out}

/* ---------- distribuição ---------- */
// região: 'W' disco inteiro; 'L'/'R' meia-pizza. Retorna true se (x,y) com raio tr cabe com margem.
function fits(sl,x,y,tr,edge){var dx=x-C,dy=y-C;if(Math.sqrt(dx*dx+dy*dy)+tr*edge>RCH-3)return false;if(sl==='L'&&dx>-(tr+4))return false;if(sl==='R'&&dx<tr+4)return false;return true}
// Mitchell best-candidate: cada peça nova vai para o maior "buraco" (cobertura uniforme, sem sobreposição)
function bestCandidate(sl,n,tr,placed,r,pad){var out=[],K=36;
  for(var i=0;i<n;i++){var best=null,bs=-1e9;
    for(var k=0;k<K;k++){var a=r()*Math.PI*2,rr=Math.sqrt(r())*(RCH-tr*.8),x=C+rr*Math.cos(a),y=C+rr*Math.sin(a);if(!fits(sl,x,y,tr,.8))continue;
      var sc=1e9;for(var j=0;j<placed.length;j++){var q=placed[j],dx=q[0]-x,dy=q[1]-y,d=Math.sqrt(dx*dx+dy*dy)-(q[2]+tr)*pad*(q[3]?.55:1);if(d<sc)sc=d}
      // (fits() já garante a margem até a borda e a linha do meio; sem termo de borda para a periferia também ficar cheia)
      if(sc>bs){bs=sc;best=[x,y]}}
    if(best){var p=[best[0],best[1],tr,0];placed.push(p);out.push(p)}}
  return out}
// Vogel (girassol) + jitter: miúdos espalhados por igual
function vogel(sl,n,tr,r){var out=[],N=sl==='W'?n:n*2,Rs=RCH-tr-4,sp=Rs*Math.sqrt(Math.PI/N),off=r()*6.28;
  for(var i=0;i<N;i++){var rr=Rs*Math.sqrt((i+.5)/N),th=i*2.399963+off,x=C+rr*Math.cos(th)+(r()-.5)*sp*.7,y=C+rr*Math.sin(th)+(r()-.5)*sp*.7;
    if(fits(sl,x,y,tr,1))out.push([x,y,tr,1])}return out}

function Viz(host){

  this.host=host;var s=this.svg=el('svg',{viewBox:'-10 -10 420 420',role:'img','aria-label':'Pizza ilustrada sendo montada'});
  var defs=el('defs',{},s);
  defs.innerHTML=GRADS+
    '<radialGradient id="pzCrust" cx="50%" cy="46%" r="54%"><stop offset="80%" stop-color="#EDC684"/><stop offset="90%" stop-color="#DDA458"/><stop offset="100%" stop-color="#B9773A"/></radialGradient>'+
    '<radialGradient id="pzRimHi" cx="40%" cy="30%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
    '<radialGradient id="pzBase" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#F8E7C2"/><stop offset="1" stop-color="#EBCB92"/></radialGradient>'+
    '<radialGradient id="pzCheese" cx="44%" cy="38%" r="62%"><stop offset="0" stop-color="#FFF6DA"/><stop offset=".65" stop-color="#FCE6AE"/><stop offset="1" stop-color="#F2CC7E"/></radialGradient>'+
    '<radialGradient id="pzGloss" cx="38%" cy="30%" r="60%"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".6" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
    '<radialGradient id="pzBrown" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#D08A3C" stop-opacity=".7"/><stop offset="1" stop-color="#D99A4E" stop-opacity="0"/></radialGradient>'+
    '<radialGradient id="pzFlap" gradientUnits="userSpaceOnUse" cx="200" cy="196" r="186"><stop offset=".84" stop-color="#F0CB88"/><stop offset=".92" stop-color="#E2AC62"/><stop offset="1" stop-color="#C2833F"/></radialGradient>'+
    '<radialGradient id="pzGroove" gradientUnits="userSpaceOnUse" cx="200" cy="200" r="180"><stop offset=".9" stop-color="#8A5426"/><stop offset="1" stop-color="#B0723A"/></radialGradient>'+
    '<filter id="pzSh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.4" stdDeviation="1.3" flood-color="#5A2E1A" flood-opacity=".3"/></filter>'+
    '<filter id="pzSoft"><feGaussianBlur stdDeviation="1.6"/></filter>'+
    '<clipPath id="pzW"><circle cx="200" cy="200" r="'+RIN+'"/></clipPath>'+
    '<clipPath id="pzL"><path d="M200 '+(C-RIN)+'A'+RIN+' '+RIN+' 0 0 0 200 '+(C+RIN)+'Z"/></clipPath>'+
    '<clipPath id="pzR"><path d="M200 '+(C-RIN)+'A'+RIN+' '+RIN+' 0 0 1 200 '+(C+RIN)+'Z"/></clipPath>';
  Object.keys(SPR).forEach(function(k){[].concat(SPR[k]).forEach(function(src,v){var g=el('symbol',{id:'t-'+k+(v?'-'+v:''),viewBox:'-14 -14 28 28',overflow:'visible'},defs);g.innerHTML=src})});
  el('ellipse',{cx:200,cy:214,rx:188,ry:180,fill:'rgba(90,58,36,.18)',filter:'url(#pzSoft)'},s);
  var dough=this.dough=el('g',{},s);this.dough.setAttribute('class','dough');
  el('path',{d:blob(184,3,5,24),fill:'url(#pzCrust)'},dough);
  var r=rng(7);for(var i=0;i<56;i++){var a=r()*Math.PI*2,rr=165+r()*16,sz=1.2+r()*4.4,x=(C+rr*Math.cos(a)).toFixed(1),y=(C+rr*Math.sin(a)).toFixed(1);
    el('ellipse',{cx:x,cy:y,rx:sz,ry:sz*(.55+r()*.4),transform:'rotate('+(a*57).toFixed(0)+' '+x+' '+y+')',fill:'#5A2E1A',opacity:(.14+r()*.36).toFixed(2)},dough)}
  for(var b=0;b<14;b++){var a2=r()*Math.PI*2,r2=170+r()*8,x2=(C+r2*Math.cos(a2)).toFixed(1),y2=(C+r2*Math.sin(a2)).toFixed(1);el('ellipse',{cx:x2,cy:y2,rx:5+r()*6,ry:2.4+r()*2,transform:'rotate('+(a2*57+90).toFixed(0)+' '+x2+' '+y2+')',fill:'#FFF3D6',opacity:.32},dough)}
  el('path',{d:blob(184,3,5,24),fill:'url(#pzRimHi)'},dough);
  el('circle',{cx:200,cy:200,r:RIN+1.5,fill:'url(#pzBase)'},dough);
  el('circle',{cx:200,cy:200,r:RIN+1.5,fill:'none',stroke:'#D29A55','stroke-width':3.2,opacity:.5},dough);
  this.layers=el('g',{},s);
  this.divider=el('line',{x1:200,y1:C-RIN+6,x2:200,y2:C+RIN-6,stroke:'#FFF6E6','stroke-width':2,'stroke-dasharray':'3 7','stroke-linecap':'round',opacity:0},s);
  this.buildBorda(s);
  this.steam=el('g',{opacity:0},s);
  [[160],[205],[245]].forEach(function(p){el('path',{d:'M'+p[0]+' 170c-12-16 12-24 0-40s12-24 0-40',fill:'none',stroke:'#fff','stroke-width':8,'stroke-linecap':'round',opacity:.85,filter:'url(#pzSoft)'},this.steam)},this);
  host.appendChild(s);
  this.state={mode:'inteira',a:null,b:null,borda:false};this.slots={};
  dough.style.transformOrigin='200px 200px';
  anim(dough,[{transform:'scale(.82) rotate(-25deg)',opacity:0},{transform:'none',opacity:1}],{duration:1100,easing:SOFT});
}
// sons: pizza.js só avisa (tipo, atraso em ms); app.js/sound.js decidem se tocam
var MUTE=false;
function sfx(t,d,o){if(MUTE)return;var f=window.__sfx;if(f)try{f(t,d||0,o)}catch(e){}}
function slotOf(st,which){return st.mode==='meio'?(which==='A'?'L':'R'):(which==='A'?'W':null)}
Viz.prototype.set=function(st){
  var o=this.state,n=Object.assign({},o,st),self=this,modeCh=o.mode!==n.mode;
  ['A','B'].forEach(function(w){var os=slotOf(o,w),ns=slotOf(n,w),of=o[w.toLowerCase()],nf=n[w.toLowerCase()];
    if(modeCh||(of&&of.nome)!==(nf&&nf.nome)){if(os&&self.slots[os])self.out(os);if(ns&&nf)self.into(ns,nf,n['rem'+w]||new Set(),(of||modeCh)?750:0)}});
  if(modeCh)anim(this.divider,[{opacity:o.mode==='meio'?.8:0},{opacity:n.mode==='meio'?.8:0}],{duration:700});
  if(n.borda!==o.borda){this.ring(n.borda);sfx(n.borda?'crust':'crustOff',0)}
  this.state=n;
};
Viz.prototype.toggle=function(which,id,on){var sl=slotOf(this.state,which),S=sl&&this.slots[sl];if(!S||!S.parts[id])return;var P=S.parts[id];
  if(on){P.g.style.display='';this.partIn(P,0)}else{this.partOut(P);sfx('remove',0)}};

/* ---------- borda recheada ---------- */
var RB=172,LB=2*Math.PI*RB;
Viz.prototype.buildBorda=function(s){
  var g=this.borda=el('g',{class:'borda'},s),rot='rotate(-90 200 200)';
  function ring(r,w,stroke,extra){var c=el('circle',Object.assign({cx:200,cy:200,r:r,fill:'none',stroke:stroke,'stroke-width':w,'stroke-linecap':'round',transform:rot},extra||{}),g);c.style.strokeDasharray=LB+' '+LB;c.style.strokeDashoffset=LB;return c}
  this.bGroove=ring(RB,10,'url(#pzGroove)');                         // a massa abre: sulco
  this.bLip=ring(RB+7,2.6,'#FBE2B0',{opacity:.9});                    // lábio externo levantando
  this.bCream=ring(RB,7.6,'#FFF8EA');                                 // catupiry sendo aplicado
  this.bCreamHi=ring(RB-1.4,2.2,'#FFFFFF',{opacity:.9});
  this.bFlap=ring(RB,22,'url(#pzFlap)');                               // a massa fecha por cima, mais fofinha
  this.bFlapHi=ring(RB-4,2.6,'#FFF1D2',{opacity:.55});
  var sp=this.bSpots=el('g',{opacity:0},g),r=rng(41);
  for(var i=0;i<46;i++){var a=r()*Math.PI*2,rr=164+r()*16,sz=1.1+r()*3.4,x=(C+rr*Math.cos(a)).toFixed(1),y=(C+rr*Math.sin(a)).toFixed(1);
    el('ellipse',{cx:x,cy:y,rx:sz,ry:sz*(.55+r()*.4),transform:'rotate('+(a*57).toFixed(0)+' '+x+' '+y+')',fill:'#5A2E1A',opacity:(.14+r()*.32).toFixed(2)},sp)}
  var pk=this.bPeek=el('g',{opacity:0},g);                             // pontinhas de catupiry aparecendo
  el('circle',{cx:200,cy:200,r:RB-10.4,fill:'none',stroke:'#FFF4DC','stroke-width':3.4,'stroke-dasharray':'14 26','stroke-linecap':'round',transform:'rotate(7 200 200)'},pk);
  for(var k=0;k<12;k++){var an=k/12*Math.PI*2+.13,cx=(C+(RB-9.6)*Math.cos(an)).toFixed(1),cy=(C+(RB-9.6)*Math.sin(an)).toFixed(1);
    el('ellipse',{cx:cx,cy:cy,rx:4.6,ry:2.3,transform:'rotate('+(an*57.3+90).toFixed(0)+' '+cx+' '+cy+')',fill:'#FFFBF2'},pk)}
  g.style.transformOrigin='200px 200px';this.bAnims=[];
};
Viz.prototype.ring=function(on){var self=this,A=this.bAnims;A.forEach(function(a){a.cancel&&a.cancel()});A.length=0;
  function dash(node,from,to,d,delay,ease){A.push(anim(node,[{strokeDashoffset:from},{strokeDashoffset:to}],{duration:d,delay:delay,easing:ease||EASE}))}
  function fade(node,from,to,d,delay){A.push(anim(node,[{opacity:from},{opacity:to}],{duration:d,delay:delay,easing:'ease'}))}
  if(reduce){[this.bGroove,this.bLip,this.bCream,this.bCreamHi].forEach(function(n){n.style.strokeDashoffset=LB});
    [this.bFlap,this.bFlapHi].forEach(function(n){n.style.strokeDashoffset=on?0:LB});this.bSpots.style.opacity=on?1:0;this.bPeek.style.opacity=on?1:0;return}
  if(on){ // abre (0–0,9s) → recheia (0,5–1,5s) → fecha (1,3–2,3s) → pintinhas e catupiry espiando (2,1–2,5s)
    dash(this.bGroove,LB,0,900,0);dash(this.bLip,LB,0,900,60);
    dash(this.bCream,LB,0,1000,500);dash(this.bCreamHi,LB,0,1000,560);
    dash(this.bFlap,LB,0,1000,1300,'cubic-bezier(.5,0,.25,1)');dash(this.bFlapHi,LB,0,1000,1380);
    fade(this.bLip,.9,0,500,1500);
    fade(this.bSpots,0,1,450,2050);fade(this.bPeek,0,1,500,2050);
    A.push(anim(this.borda,[{transform:'scale(1)'},{transform:'scale(1.018)',offset:.5},{transform:'scale(1)'}],{duration:700,delay:2050,easing:'ease-in-out'}));
  }else{ // reverso: fecha devagar a borda
    fade(this.bPeek,1,0,300,0);fade(this.bSpots,1,0,300,0);
    dash(this.bFlapHi,0,-LB,900,150);dash(this.bFlap,0,-LB,950,200,'cubic-bezier(.5,0,.25,1)');
    dash(this.bCreamHi,0,-LB,800,800);dash(this.bCream,0,-LB,850,820);
    dash(this.bGroove,0,-LB,800,1300);dash(this.bLip,LB,LB,1,0);
  }
};

/* ---------- partes (cada ingrediente é um grupo) ---------- */
Viz.prototype.out=function(sl){var S=this.slots[sl];delete this.slots[sl];if(!S)return;var g=S.g,self=this;
  if(S.snow){var sn=S.snow;anim(sn,[{opacity:1},{opacity:0}],{duration:400,easing:'ease'}).finished.then(function(){sn.remove()})}
  Object.keys(S.parts).forEach(function(k){self.partOut(S.parts[k],true)});
  anim(g,[{opacity:1},{opacity:0}],{duration:650,delay:350,easing:'ease'}).finished.then(function(){g.remove()})};
Viz.prototype.partOut=function(P,quick){var items=P.items;P.on=false;P.gen=(P.gen||0)+1;var gen=P.gen;
  if(items.length){var st=quick?4:Math.min(26,520/items.length);items.forEach(function(t,i){anim(t,[{transform:'none',opacity:1},{transform:'translateY(-20px) scale(.6)',opacity:0}],{duration:quick?420:720,delay:i*st,easing:'cubic-bezier(.5,0,.75,.3)'})})}
  else anim(P.g,[{opacity:1},{opacity:0}],{duration:quick?420:800,easing:'ease'});
  if(!quick)setTimeout(function(){if(P.gen===gen&&!P.on)P.g.style.display='none'},items.length?1400:850)};
Viz.prototype.partIn=function(P,delay){P.on=true;P.gen=(P.gen||0)+1;var g=P.g;anim(g,[{opacity:1},{opacity:1}],{duration:1});
  if(P.lines&&P.lines.length)sfx('drizzle',delay+(P.type==='lines'?0:STEP*1.15),{dur:STEP});
  (P.lines||[]).forEach(function(q,i){var L=q.getTotalLength();q.style.strokeDasharray=L;anim(q,[{strokeDashoffset:L},{strokeDashoffset:0}],{duration:STEP,delay:delay+(P.type==='lines'?0:STEP*1.15)+Math.floor(i/3)*120,easing:EASE})});
  if(P.type==='sauce'){sfx('sauce',delay,{dur:STEP*1.2});var L=P.len;P.main.style.strokeDasharray=L;anim(P.main,[{strokeDashoffset:L},{strokeDashoffset:0}],{duration:STEP*1.2,delay:delay,easing:EASE});
    anim(P.disc,[{opacity:0},{opacity:1}],{duration:STEP*.5,delay:delay+STEP*.85,easing:'ease'});
    P.extra.forEach(function(e,i){anim(e,[{opacity:0},{opacity:+e.getAttribute('data-o')}],{duration:800,delay:delay+STEP*.95+i*30,easing:'ease'})});return STEP*1.1}
  if(P.type==='cheese'){sfx('cheese',delay,{dur:STEP*1.15});var ch=P.main;if(reduce){ch.setAttribute('d',P.big);ch.setAttribute('opacity',1)}else{ch.setAttribute('d',P.small);ch.setAttribute('opacity',0);setTimeout(function(){ch.setAttribute('opacity',1);try{P.smil.beginElement()}catch(e){ch.setAttribute('d',P.big)}},delay)}
    P.extra.forEach(function(e,i){anim(e,[{opacity:0},{opacity:+e.getAttribute('data-o')}],{duration:800,delay:delay+STEP*.9+i*25,easing:'ease'})});return STEP*1.05}
  if(P.type==='lines')return STEP;
  var n=P.items.length,st=P.fine?Math.min(40,1000/Math.max(1,n)):Math.max(40,Math.min(70,1000/Math.max(1,n)));
  // toquinhos de pouso: no máx. 7 por ingrediente, com ≥110 ms entre eles (nada de metralhadora)
  var dur=P.fine?850:1000,land=delay+dur*.7,pid=P.g.getAttribute('data-part')||'',pf=300+(hash(pid)%6)*55;
  if(P.fine||n>40)sfx('sprinkle',land,{dur:Math.min(1400,n*st+200)});
  else{var lastT=-1e9,cnt=0;for(var i2=0;i2<n&&cnt<7;i2++){var tt=land+i2*st;if(tt-lastT>=110){sfx('tap',tt+(Math.random()*30-15),{f:pf,v:1-cnt*.08});lastT=tt;cnt++}}}
  P.items.forEach(function(t,i){anim(t,[{transform:'translateY(-64px) scale(1.18)',opacity:0},{transform:'translateY(2.5px) scale(.985)',opacity:1,offset:.7},{transform:'translateY(-.8px) scale(1.004)',offset:.86},{transform:'none',opacity:1}],{duration:P.fine?850:1000,delay:delay+i*st,easing:DROP})});
  return Math.max(STEP*.95,n*st+380)};
Viz.prototype.into=function(sl,f,removed,delay){
  var self=this,g=el('g',{'clip-path':'url(#pz'+sl+')'},this.layers),half=sl!=='W',seed=hash(f.nome+'|'+sl),S={g:g,parts:{},f:f};this.slots[sl]=S;
  var itens=(f.itens||[]).slice(),t=delay||0,R=RIN,placed=[],sweet=!!f.doce;if(sl!=='R')sfx('dough',t);
  var baseSauce=itens.filter(function(i){return SAUCE[i.id]})[0];
  var tops=itens.filter(function(i){return T[i.id]});
  tops.sort(function(a,b){return cls(a.id)-cls(b.id)||(T[b.id].TR-T[a.id].TR)}); // grandes primeiro, miúdos e ervas por último
  var order=[];if(baseSauce)order.push(baseSauce);itens.forEach(function(i){if(i.id==='queijo')order.push(i)});
  order=order.concat(tops.filter(function(i){return cls(i.id)<3}));
  itens.forEach(function(i){if(i.id==='oregano')order.push(i)});order=order.concat(tops.filter(function(i){return cls(i.id)===3}));
  itens.forEach(function(i){if(i.id==='barbecue'||(SAUCE[i.id]&&i!==baseSauce))order.push(i)});
  // abundância controlada: se as peças grandes/médias não couberem (≈60% da área), reduz proporcionalmente
  var area=Math.PI*RCH*RCH*(half?.5:1)*.6,dem=0;tops.forEach(function(i){var c=cls(i.id);if(c<2){var tt=T[i.id];dem+=Math.ceil(tt.N*(half?.5:1))*Math.PI*Math.pow(tt.TR*1.12,2)}});
  var fit=Math.min(1,area/Math.max(1,dem));
  order.forEach(function(it,idx){var pg=el('g',{'data-part':it.id},g),P={g:pg,items:[],extra:[],type:'tops',on:true};S.parts[it.id]=P;var ps=seed+idx*97;
    if(it===baseSauce){P.type='sauce';var col=it.id==='chocobranco'?'url(#gWch)':SAUCE[it.id];
      P.disc=el('circle',{cx:200,cy:200,r:RIN+2,fill:col,opacity:0},pg); // garante cobertura total até a borda
      P.main=el('path',{d:spiral(RIN-6,7),fill:'none',stroke:col,'stroke-width':30,'stroke-linecap':'round','stroke-linejoin':'round'},pg);P.len=P.main.getTotalLength();
      P.extra.push(el('circle',{cx:200,cy:200,r:RIN,fill:'url(#pzGloss)','data-o':1},pg));
      if(it.id==='molho'){var rs=rng(ps);for(var k=0;k<14;k++){var a=rs()*6.28,rr=Math.sqrt(rs())*146,ex=(C+rr*Math.cos(a)).toFixed(1),ey=(C+rr*Math.sin(a)).toFixed(1);P.extra.push(el('ellipse',{cx:ex,cy:ey,rx:4+rs()*7,ry:2+rs()*3,transform:'rotate('+(rs()*180|0)+' '+ex+' '+ey+')',fill:'#E2603F','data-o':.4},pg))}}
      if(it.id==='chocobranco'){creamRidges(pg,P,ps,sl);
        P.extra.push(el('circle',{cx:200,cy:200,r:RIN-1.5,fill:'none',stroke:'#B98A4E','stroke-width':3.4,opacity:.3,'data-o':.3},pg));
        P.extra.push(el('circle',{cx:200,cy:200,r:RIN-5,fill:'none',stroke:'#FFFFFF','stroke-width':1.6,'data-o':.7},pg));
        var cv=vogel(sl,half?5:9,12,rng(ps+1));cv.forEach(function(p,m){P.extra.push(el('use',{href:'#t-caramelo',width:58,height:58,x:-29,y:-29,transform:'translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+') rotate('+((m*47)%180)+')','data-o':1},pg))})}
      if(sweet&&!itens.some(function(i){return i.id==='nutella'&&i!==baseSauce})){var dc=(it.id==='choco'||it.id==='nutella')?'#9A6440':it.id==='chocobranco'?'#C98A3B':'#8A5530';drawLines(pg,P,dc,ps+3,it.id==='chocobranco'?2.6:3.2)}
    }else if(it.id==='queijo'){P.type='cheese';P.small=blob(36,ps,8,14);P.big=blob(RCH,ps+1,7,18);
      P.main=el('path',{d:P.small,fill:'url(#pzCheese)',opacity:0},pg);
      P.smil=el('animate',{attributeName:'d',from:P.small,to:P.big,dur:(STEP*1.15/1000)+'s',begin:'indefinite',fill:'freeze',calcMode:'spline',keyTimes:'0;1',keySplines:'.3 .7 .2 1'},P.main);
      var rb=rng(ps+3),cp=vogel(sl,half?8:16,14,rb);cp.forEach(function(p,q){var cx=p[0].toFixed(1),cy=p[1].toFixed(1);
        P.extra.push(q%3===0?el('circle',{cx:cx,cy:cy,r:9+rb()*7,fill:'url(#pzBrown)','data-o':1},pg):el('ellipse',{cx:cx,cy:cy,rx:6+rb()*7,ry:3+rb()*3,transform:'rotate('+(rb()*180|0)+' '+cx+' '+cy+')',fill:'#FFFCF0','data-o':.85},pg))});
      // bolhas: a mussarela derretida estufa e doura nas pontas
      vogel(sl,half?8:15,10,rng(ps+5)).forEach(function(p){var bx=(p[0]+(rb()-.5)*8).toFixed(1),by=(p[1]+(rb()-.5)*8).toFixed(1),br=(3+rb()*3.6).toFixed(1);
        P.extra.push(el('circle',{cx:bx,cy:by,r:br,fill:'#FFF5D6',stroke:'#D89A4A','stroke-width':1.3,'data-o':.85},pg));
        P.extra.push(el('circle',{cx:(+bx-br*.3).toFixed(1),cy:(+by-br*.35).toFixed(1),r:(br*.32).toFixed(1),fill:'#FFFFFF','data-o':.85},pg))});
    }else if(it.id==='barbecue'){P.type='lines';drawLines(pg,P,'#6B2E16',ps,3.8)}
    else if(SAUCE[it.id]){P.type='lines';drawLines(pg,P,SAUCE[it.id],ps,4.4)}
    else if(it.id==='oregano'){P.fine=true;var ro=rng(ps);vogel(sl,half?70:140,2.4,ro).forEach(function(p){var o0=el('g',{transform:'translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+')'},pg),dot=el('g',{},o0);
        el('path',{d:ORE[(ro()*ORE.length)|0],fill:ORC[(ro()*ORC.length)|0],transform:'rotate('+(ro()*360|0)+') scale('+(.8+ro()*.5).toFixed(2)+')'},dot);P.items.push(dot)})}
    else{var tt=T[it.id],c=cls(it.id),n=Math.ceil(tt.N*(half?.5:1)*(c<2?fit:1)),r6=rng(ps),W=28*tt.TR/tt.R0;P.fine=c===2;
      var pts=c===2?vogel(sl,n,tt.TR,r6):bestCandidate(sl,n,tt.TR,placed,r6,c===3?.45:1.04);
      pts.forEach(function(p,j){var og=el('g',{transform:'translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+')'},pg),inner=el('g',{},og),
          rot=el('g',{transform:'rotate('+(tt.rot?(r6()*360).toFixed(0):0)+') scale('+(.95+r6()*.1).toFixed(3)+')'},inner);
        var vv=VAR[it.id]||1,vk=vv>1?(j+(seed>>>3))%vv:0,u2=el('use',{href:'#t-'+it.id+(vk?'-'+vk:''),width:W.toFixed(1),height:W.toFixed(1),x:(-W/2).toFixed(1),y:(-W/2).toFixed(1)},rot);if(it.id==='confete')u2.setAttribute('fill',CONF[j%CONF.length]);P.items.push(inner)})}
    if(removed.has(it.id)&&!it.fixo){P.on=false;pg.style.display='none'}
    else{var d=self.partIn(P,t);t+=reduce?0:d}
  });
  if(itens.some(function(i){return i.id==='chocobranco'}))S.snow=this.snow(sl,seed,t);
};
// "nevada": raspas caem com leve balanço e pousam; flocos finos derretem ao tocar
Viz.prototype.snow=function(sl,seed,t0){sfx('sprinkle',t0+200,{dur:2000});var half=sl!=='W',g=el('g',{'class':'snow','pointer-events':'none'},this.svg),r=rng(seed+777);
  var pts=vogel(sl,half?22:44,8,r);
  pts.forEach(function(p,i){var o=el('g',{transform:'translate('+p[0].toFixed(1)+' '+p[1].toFixed(1)+') rotate('+(r()*180|0)+') scale('+(.85+r()*.5).toFixed(2)+')'},g),f=el('g',{},o);
    el('use',{href:'#t-raspa',width:30,height:30,x:-15,y:-15},f);
    var H=p[1]+40+r()*90,dx=(r()-.5)*28;
    anim(f,[{transform:'translate('+dx+'px,'+(-H)+'px) rotate('+(r()*160-80|0)+'deg)',opacity:0},{opacity:1,offset:.12},{transform:'translate('+(-dx*.5)+'px,'+(-H*.45)+'px) rotate('+(r()*60-30|0)+'deg)',offset:.55},{transform:'translate(0px,-2px)',offset:.9},{transform:'none',opacity:1}],
      {duration:1700+r()*900,delay:t0+i*28+r()*500,easing:'cubic-bezier(.3,.15,.45,1)'})});
  if(!reduce)for(var k=0;k<(half?14:28);k++){var x=200+(r()-.5)*(half?150:300),y=200+(r()-.5)*260;if(sl==='L'&&x>196)x=400-x;if(sl==='R'&&x<204)x=400-x;
    var c=el('circle',{cx:x.toFixed(1),cy:y.toFixed(1),r:(1+r()*1.6).toFixed(1),fill:'#FFFFFF',opacity:0},g),H2=y+60+r()*80;
    anim(c,[{transform:'translate(0px,'+(-H2)+'px)',opacity:0},{opacity:.95,offset:.2},{transform:'translate('+((r()-.5)*20)+'px,0px)',opacity:.9,offset:.85},{transform:'translate(0px,2px)',opacity:0}],{duration:1900+r()*800,delay:t0+150+k*55+r()*400,easing:'linear'})}
  return g};
// cristas de espátula: textura de camada grossa e cremosa
function creamRidges(pg,P,seed,sl){var r=rng(seed+11),rg=el('g',{},pg);
  for(var k=0;k<7;k++){var r0=24+k*19+r()*6,a0=r()*6.28,span=3.4+r()*2.2,ph=r()*6,d='';
    for(var s=0;s<=60;s++){var th=a0+span*s/60,rr=r0+3.2*Math.sin(5*th+ph)+1.6*Math.sin(11*th);d+=(s?'L':'M')+(C+rr*Math.cos(th)).toFixed(1)+' '+(C+rr*Math.sin(th)).toFixed(1)}
    P.extra.push(el('path',{d:d,fill:'none',stroke:'#E9D0A4','stroke-width':7,'stroke-linecap':'round',opacity:.38,'data-o':.38,transform:'translate(1.2 2.2)'},rg));
    P.extra.push(el('path',{d:d,fill:'none',stroke:'#FFFFFF','stroke-width':4.4,'stroke-linecap':'round',opacity:.85,'data-o':.85},rg))}}
function drawLines(pg,P,color,seed,w){P.lines=P.lines||[];var dg=el('g',{transform:'rotate(-28 200 200)'},pg);waves(seed,30).forEach(function(d){
  P.lines.push(el('path',{d:d,fill:'none',stroke:'rgba(40,20,10,.22)','stroke-width':w+1.6,'stroke-linecap':'round',transform:'translate(1.4 2)'},dg));
  P.lines.push(el('path',{d:d,fill:'none',stroke:color,'stroke-width':w,'stroke-linecap':'round','stroke-linejoin':'round'},dg));
  P.lines.push(el('path',{d:d,fill:'none',stroke:'rgba(255,255,255,.4)','stroke-width':1.1,'stroke-linecap':'round',transform:'translate(-.8 -1)'},dg))})}
Viz.prototype.bake=function(){if(reduce)return;var s=this.svg;s.style.transformOrigin='50% 50%';
  anim(s,[{transform:'none',filter:'none'},{transform:'scale(.94)',filter:'brightness(.85) sepia(.3)',offset:.35},{transform:'scale(1.02)',filter:'brightness(1.05) saturate(1.1)',offset:.75},{transform:'none',filter:'none'}],{duration:1800,easing:'ease-in-out'});
  this.steam.style.opacity=1;[].forEach.call(this.steam.children,function(p,i){p.style.transformBox='fill-box';anim(p,[{transform:'translateY(20px) scaleY(.6)',opacity:0},{opacity:.85,offset:.4},{transform:'translateY(-50px) scaleY(1.1)',opacity:0}],{duration:1900,delay:700+i*180,easing:'ease-out'})})};
/* ---------- miniaturas: a MESMA pizza no estado final, estática ----------
   Monta uma Viz fora da tela com animações desligadas, serializa o SVG e rasteriza
   uma vez num canvas pequeno (≈10 KB por sabor). Cache em memória por sabor/metade. */
var TH={},THQ=[],THbusy=false;
function thumbKey(st,px){return (st.a?st.a.nome:'')+'|'+(st.b?st.b.nome:'')+'|'+(st.borda?1:0)+'|'+px}
function thumbSVG(st){var R=reduce;reduce=true;MUTE=true;var host=document.createElement('div'),v;
  host.style.cssText='position:fixed;left:-10000px;top:0;width:120px;height:120px;overflow:hidden;pointer-events:none;visibility:hidden';host.setAttribute('aria-hidden','true');document.body.appendChild(host);
  try{v=new Viz(host);v.set({mode:st.b?'meio':'inteira',a:st.a,b:st.b||null,borda:!!st.borda,remA:new Set(),remB:new Set()})}finally{reduce=R;MUTE=false}
  [].forEach.call(v.svg.querySelectorAll('animate'),function(n){n.parentNode.removeChild(n)});
  // só leva para a miniatura os desenhos de ingrediente que essa pizza usa (SVG serializado bem menor)
  var used={};[].forEach.call(v.svg.querySelectorAll('use'),function(u){used[(u.getAttribute('href')||'').slice(1)]=1});[].forEach.call(v.svg.querySelectorAll('symbol'),function(sy){if(!used[sy.id])sy.parentNode.removeChild(sy)});v.steam.parentNode.removeChild(v.steam);
  v.svg.setAttribute('xmlns',NS);v.svg.setAttribute('width','420');v.svg.setAttribute('height','420');v.svg.removeAttribute('role');
  var s=new XMLSerializer().serializeToString(v.svg);host.parentNode.removeChild(host);return s}
function thumbRun(){if(THbusy||!THQ.length)return;THbusy=true;var job=THQ.shift(),k=job.k;
  var done=function(u){TH[k].url=u;TH[k].cbs.forEach(function(cb){try{cb(u)}catch(e){}});TH[k].cbs=[];THbusy=false;
    (window.requestIdleCallback||function(f){return setTimeout(f,16)})(thumbRun,{timeout:300})};
  var svg;try{svg=thumbSVG(job.st)}catch(e){THbusy=false;TH[k].cbs=[];setTimeout(thumbRun,0);return}
  var src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg),img=new Image(),px=job.px;
  img.onload=function(){try{var c=document.createElement('canvas');c.width=c.height=px;var x=c.getContext('2d');x.drawImage(img,0,0,px,px);
      if(c.toBlob)c.toBlob(function(b){done(b?URL.createObjectURL(b):src)},'image/webp',.86);else done(c.toDataURL())}catch(e){done(src)}};
  img.onerror=function(){done(src)};img.src=src}
/* Viz.thumb({a,b,borda}, px, cb): chama cb(url) quando pronta (na hora se já estiver no cache). */
Viz.thumb=function(st,px,cb,urgent){px=px||112;var k=thumbKey(st,px),e=TH[k];
  if(e&&e.url){cb&&cb(e.url);return e.url}
  if(!e){e=TH[k]={url:null,cbs:[]};var j={k:k,st:st,px:px};if(urgent)THQ.unshift(j);else THQ.push(j)}
  else if(urgent){for(var i=0;i<THQ.length;i++)if(THQ[i].k===k){THQ.unshift(THQ.splice(i,1)[0]);break}}
  if(cb)e.cbs.push(cb);thumbRun();return null};
Viz.T=T;
window.PizzaViz=Viz;
})();

/* módulo ES: o motor continua em window.PizzaViz (usado pelos testes) */
export const PizzaViz = window.PizzaViz;
export default PizzaViz;
