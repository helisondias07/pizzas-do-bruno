/* Bruno's Pizza — sons (Web Audio, 100% sintetizados: 0 bytes de áudio).
   Carregado só depois do 1º toque. app.js cria/destrava o AudioContext no gesto e chama window.__snd. */
(function(){'use strict';
var R=Math.random;
function noiseBuf(ac){var n=ac.sampleRate,b=ac.createBuffer(1,n,n),d=b.getChannelData(0);for(var i=0;i<n;i++)d[i]=R()*2-1;return b}
function env(g,t,a,peak,dec,sus){g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(Math.max(0.0001,sus||0.0001),t+a+dec)}
/* motor: cada som recebe (ac, saída, instante, opções) — o mesmo código roda ao vivo e offline (vídeo) */
function Engine(ac,out){this.ac=ac;this.out=out;this.nb=noiseBuf(ac)}
Engine.prototype.noise=function(t,dur,type,f,q,peak,a,detune){var ac=this.ac,s=ac.createBufferSource(),fl=ac.createBiquadFilter(),g=ac.createGain();
  s.buffer=this.nb;s.loop=true;fl.type=type;fl.frequency.setValueAtTime(f,t);fl.Q.value=q||0.7;s.connect(fl);fl.connect(g);g.connect(this.out);
  env(g,t,a||0.01,peak,dur);s.start(t,R()*0.8);s.stop(t+dur+a+0.05);return{f:fl,g:g}};
Engine.prototype.tone=function(t,f0,f1,dur,peak,type,a){var ac=this.ac,o=ac.createOscillator(),g=ac.createGain();o.type=type||'sine';
  o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+dur);o.connect(g);g.connect(this.out);env(g,t,a||0.004,peak,dur);o.start(t);o.stop(t+dur+0.1);return{o:o,g:g}};
var S={
  // massa abrindo: baque macio + sopro curto
  dough:function(e,t){e.tone(t,120,48,0.22,0.17);var n=e.noise(t,0.42,'lowpass',380,0.6,0.09,0.04);n.f.frequency.exponentialRampToValueAtTime(160,t+0.45)},
  // molho: espalhar molhado em espiral (ruído em banda com varredura + leve ondulação)
  sauce:function(e,t,o){var d=Math.min(1.3,(o&&o.dur||900)/1000),n=e.noise(t,d,'bandpass',500,2.2,0.6,0.12);var f=n.f.frequency;
    f.setValueAtTime(450,t);f.linearRampToValueAtTime(1200,t+d*0.45);f.linearRampToValueAtTime(650,t+d);
    var l=e.ac.createOscillator(),lg=e.ac.createGain();l.frequency.value=5.5;lg.gain.value=160;l.connect(lg);lg.connect(f);l.start(t);l.stop(t+d+0.1)},
  drizzle:function(e,t,o){var d=Math.min(1,(o&&o.dur||700)/1000),n=e.noise(t,d,'bandpass',900,3,0.3,0.1);n.f.frequency.linearRampToValueAtTime(1500,t+d)},
  // queijo: polvilhar (grãozinhos agudos, densidade caindo)
  cheese:function(e,t,o){var d=Math.min(1.2,(o&&o.dur||800)/1000),n=Math.round(34*d);for(var i=0;i<n;i++){var k=i/n,tt=t+d*Math.pow(k,1.3)+R()*0.02;
    e.noise(tt,0.012+R()*0.012,'highpass',2800+R()*2600,0.8,0.085*(1-k*0.6)*(0.6+R()*0.6),0.002)}},
  sprinkle:function(e,t,o){var d=(o&&o.dur||1200)/1000;for(var i=0;i<18;i++)e.noise(t+R()*d,0.01,'highpass',4200+R()*2500,0.8,0.035+R()*0.03,0.002)},
  // ingrediente pousando: toque curtinho, quente, com variação
  tap:function(e,t,o){var f=(o&&o.f||420)*(0.9+R()*0.22),v=(o&&o.v||1)*(0.7+R()*0.35);e.tone(t,f*1.6,f,0.07,0.16*v,'triangle',0.002);e.noise(t,0.025,'bandpass',f*3,1.5,0.06*v,0.001)},
  // borda recheada: abrir / rechear / fechar (squish macio)
  squish:function(e,t,o){var d=(o&&o.dur||0.5),n=e.noise(t,d,'lowpass',260,4,(o&&o.v||1)*0.13,0.06);var f=n.f.frequency;f.setValueAtTime(260,t);f.linearRampToValueAtTime(o&&o.up?950:600,t+d*0.6);f.linearRampToValueAtTime(300,t+d);
    e.tone(t,150,95,d,0.06*(o&&o.v||1),'sine',0.05)},
  crust:function(e,t){S.squish(e,t,{dur:0.7,v:0.8,up:1});S.squish(e,t+0.55,{dur:0.8,v:0.7});S.squish(e,t+1.35,{dur:0.75,v:0.85,up:1});S.tap(e,t+2.1,{f:300,v:0.8})},
  crustOff:function(e,t){S.squish(e,t+0.15,{dur:0.8,v:0.6});S.squish(e,t+0.8,{dur:0.7,v:0.5})},
  // tirar ingrediente: pop ao contrário (sobe e corta)
  remove:function(e,t){var ac=e.ac,o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(260,t);o.frequency.exponentialRampToValueAtTime(620,t+0.11);
    o.connect(g);g.connect(e.out);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.16,t+0.1);g.gain.linearRampToValueAtTime(0.0001,t+0.125);o.start(t);o.stop(t+0.2);
    e.noise(t+0.02,0.09,'bandpass',1400,2,0.03,0.07)},
  // adicionar ao pedido: pop agradável de duas notas
  add:function(e,t){e.tone(t,520,900,0.09,0.2,'sine',0.003);e.tone(t+0.085,784,0,0.22,0.12,'sine',0.004);e.tone(t+0.085,1568,0,0.12,0.025,'sine',0.004)},
  // pedir / abrir WhatsApp: ding suave (sino com parciais)
  ding:function(e,t){[[1046.5,0.13,1.3],[2093,0.035,0.7],[2637,0.02,0.5],[1568,0.05,1.0]].forEach(function(p,i){e.tone(t+(i===3?0.12:0),p[0],0,p[2],p[1],'sine',0.005)})}
};
/* lareira: loop de 8 s sem emenda — base de ruído grave + estalos (eventos de Poisson) */
function crackleBuf(ac){var sr=ac.sampleRate,L=sr*8,b=ac.createBuffer(1,L,sr),d=b.getChannelData(0),i,lp=0,lp2=0;
  for(i=0;i<L;i++){var w=R()*2-1;lp+=(w-lp)*0.02;lp2+=(lp-lp2)*0.05;d[i]=lp2*1.8}
  var t=0;while(t<L-sr*0.05){t+=Math.floor(sr*(0.03+(-Math.log(1-R()))*0.16));var big=R()<0.12,len=Math.floor(sr*(big?0.012:0.004)*(0.5+R())),amp=(big?0.55:0.22)*(0.4+R()*0.6),h=0;
    for(var j=0;j<len&&t+j<L;j++){var k=1-j/len,x=(R()*2-1);h=x-h*0.6;d[t+j]+=h*amp*k*k}
    if(big&&R()<0.5){var t2=t+Math.floor(sr*0.02*(1+R()));for(j=0;j<len*0.6&&t2+j<L;j++)d[t2+j]+=(R()*2-1)*amp*0.5*(1-j/(len*0.6))}}
  var X=Math.floor(sr*0.25);for(i=0;i<X;i++){var a=i/X;d[i]=d[i]*a+d[L-X+i]*(1-a)}            // emenda suave
  var c=ac.createBuffer(1,L-X,sr);c.getChannelData(0).set(d.subarray(0,L-X));return c}
function makeAmb(ac,dest){var s=ac.createBufferSource(),hp=ac.createBiquadFilter(),lp=ac.createBiquadFilter(),g=ac.createGain();s.buffer=crackleBuf(ac);s.loop=true;
  hp.type='highpass';hp.frequency.value=70;lp.type='lowpass';lp.frequency.value=5200;s.connect(hp);hp.connect(lp);lp.connect(g);g.connect(dest);g.gain.value=0;return{src:s,g:g}}
var AMB_VOL=0.08;
/* ---------- ao vivo ---------- */
var ac=window.__bpAC,master,eng,amb=null,ambOn=false,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,last={};
function init(){if(!ac)return false;if(master)return true;master=ac.createGain();master.gain.value=0.8;
  var lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=7000;master.connect(lp);lp.connect(ac.destination);eng=new Engine(ac,master);return true}
function play(type,delayMs,o){if(!S[type]||!init())return;if(ac.state!=='running')ac.resume();
  var now=performance.now();if(reduce){if(last[type]&&now-last[type]<350)return;delayMs=0}     // movimento reduzido: 1 som por etapa, sem rajadas
  last[type]=now;S[type](eng,ac.currentTime+0.01+Math.max(0,delayMs||0)/1000,o||{})}
function setAmb(on){if(!init())return;if(on===ambOn)return;ambOn=on;if(window.__sfxLog)window.__sfxLog.push([performance.now(),'__amb',{on:on}]);
  if(on&&!amb){amb=makeAmb(ac,ac.destination);amb.src.start()}
  if(!amb)return;var g=amb.g.gain,t=ac.currentTime;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);g.linearRampToValueAtTime(on?AMB_VOL:0,t+(on?2.2:1.2))}
/* ---------- offline (vídeo de demonstração): events=[[ms,type,opts]], amb=[[ms,on]] ---------- */
function render(events,ambTL,durMs,sr){sr=sr||44100;var oc=new OfflineAudioContext(1,Math.ceil(durMs/1000*sr),sr),m=oc.createGain();m.gain.value=0.8;
  var lp=oc.createBiquadFilter();lp.type='lowpass';lp.frequency.value=7000;m.connect(lp);lp.connect(oc.destination);var e=new Engine(oc,m),ls={};
  events.forEach(function(ev){if(S[ev[1]])S[ev[1]](e,Math.max(0,ev[0]/1000),ev[2]||{})});
  if(ambTL&&ambTL.length){var a=makeAmb(oc,oc.destination),g=a.g.gain;a.src.start(0);var cur=0;g.setValueAtTime(0,0);
    ambTL.forEach(function(x){var t=x[0]/1000;g.setValueAtTime(cur,t);cur=x[1]?AMB_VOL:0;g.linearRampToValueAtTime(cur,t+(x[1]?2.2:1.2))})}
  return oc.startRendering().then(function(b){return b.getChannelData(0)})}
window.__snd={play:play,amb:setAmb,render:render,kinds:Object.keys(S),state:function(){return{amb:ambOn,ctx:ac&&ac.state}}};
if(window.__sndReady)window.__sndReady();
})();
