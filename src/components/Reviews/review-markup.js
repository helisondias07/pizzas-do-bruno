/* Markup de uma avaliação — usado no build (Reviews.astro) e no cliente (reviews.client.js). */
export function reviewHTML(r){return '<figure class="rev"><div class="rev-top"><span class="av">'+r.user[0].toUpperCase()+'</span><b>@'+r.user+'</b><span class="ex">EXEMPLO</span></div><blockquote>“'+r.txt+'”</blockquote><figcaption><span class="stars" aria-label="5 estrelas">★★★★★</span><span>'+r.sabor+'</span></figcaption></figure>'}
export function reviewDotHTML(_,i){return '<button aria-label="Avaliação '+(i+1)+'"></button>'}
