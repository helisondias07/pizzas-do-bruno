/* Markup de um card de reel — usado no build (Reels.astro) e no cliente (reels.client.js). */
export function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
export function capParts(r){var lines=String(r.caption||'').split('\n').map(function(l){return l.replace(/#[^\s#]+/g,'').trim()}).filter(Boolean),t=lines[0]||'Reel do Bruno';
    if(t.length>38)t=t.slice(0,36).replace(/\s+\S*$/,'')+'…';
    var k=lines[1]&&lines[1].length<=28?lines[1]:'';if(!k&&r.timestamp){var d=new Date(r.timestamp.replace(/([+-]\d\d)(\d\d)$/,'$1:$2'));if(!isNaN(d))k=d.toLocaleDateString('pt-BR',{day:'numeric',month:'short',timeZone:'America/Sao_Paulo'}).replace('.','')}
    return{t:t,k:k}}
export function pic(r){var m=/^img\/(.+)-540\.webp$/.exec(r.thumbnail_url||''),lq=r._lq?' data-lq style="background-image:url('+r._lq+')"':'';
    if(m){var b='img/'+m[1],sz='(min-width:980px) 270px, 64vw';return '<picture><source type="image/avif" srcset="'+b+'-360.avif 360w, '+b+'-540.avif 540w" sizes="'+sz+'"><img src="'+esc(r.thumbnail_url)+'" srcset="'+b+'-360.webp 360w, '+b+'-540.webp 540w" sizes="'+sz+'" alt="" width="540" height="960" loading="lazy" decoding="async"'+lq+'></picture>'}
    return '<img src="'+esc(r.thumbnail_url)+'" alt="" width="540" height="960" loading="lazy" decoding="async"'+lq+'>'}
export function card(r){var c=capParts(r),t=esc(c.t),pl=esc(r.permalink||'https://www.instagram.com/pizzasdobruno/reels/');
    return '<article class="reel" data-id="'+esc(r.id)+'"'+(r.media_url?' data-media="'+esc(r.media_url)+'"':'')+'>'+pic(r)+
      '<div class="who"><span><svg class="logo"><use href="#koala"/></svg></span>pizzasdobruno</div>'+
      '<a class="ig" href="'+pl+'" target="_blank" rel="noopener" aria-label="Abrir no Instagram: '+t+'"><svg aria-hidden="true"><use href="#ic-ig"/></svg><span class="vh">Ver no Instagram</span></a>'+
      '<div class="cap">'+(c.k?'<small>'+esc(c.k)+'</small>':'')+'<b>'+t+'</b></div>'+
      (r.media_url?'<button type="button" class="play" aria-label="Reproduzir: '+t+'" aria-pressed="false"></button>':'<a class="play" href="'+pl+'" target="_blank" rel="noopener" aria-label="Assistir no Instagram: '+t+'"></a>')+'</article>'}
