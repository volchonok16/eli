(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let filterHost, filterObserver, filterResize;
  function installLens() {
    const host = document.querySelector('.atelier-filters>div>div:first-child');
    if (host === filterHost) return;
    filterObserver?.disconnect(); filterResize?.disconnect(); filterHost = host;
    if (!host) return;
    host.classList.add('liquid-tabs');
    const update = () => {
      const selected=host.querySelector('button.bg-primary'); if(!selected)return;
      host.style.setProperty('--lens-x',selected.offsetLeft+'px');
      host.style.setProperty('--lens-y',selected.offsetTop+'px');
      host.style.setProperty('--lens-w',selected.offsetWidth+'px');
      host.style.setProperty('--lens-h',selected.offsetHeight+'px');
      host.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button===selected)));
    };
    update();
    filterObserver=new MutationObserver(update);filterObserver.observe(host,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});
    filterResize=new ResizeObserver(update);filterResize.observe(host);
  }
  document.addEventListener('DOMContentLoaded',()=>{
    new MutationObserver(installLens).observe(document.getElementById('root'),{childList:true,subtree:true});installLens();
  });
  const escape = value => String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  window.__mountEliStory = (host,slides) => {
    const mobile=matchMedia('(max-width:767px)');
    host.id="collection";
    host.innerHTML=`<div class="story-stage"><div class="story-atmosphere" aria-hidden="true"></div><div class="story-ruler" aria-hidden="true"><span>ЗИМНЯЯ КОЛЛЕКЦИЯ</span><i></i><span>ELI</span></div><div class="story-track" role="region" aria-label="Деревья коллекции" tabindex="0">${slides.map((slide,index)=>`<article class="story-slide" aria-label="${index+1} из ${slides.length}"><div class="story-photo"><img src="${escape(slide.image)}" alt="${escape(slide.title)}" loading="lazy">${slide.image.endsWith('.svg')?'<small>Иллюстрация · фото товара не добавлено</small>':''}</div><div class="story-copy"><p class="story-index">0${index+1} / ИЗБРАННОЕ</p><h3>${escape(slide.title)}</h3><p class="story-kind">${escape(slide.subtitle)}</p><div class="story-facts">${slide.stats.map(stat=>`<span>${escape(stat)}</span>`).join('')}</div><a class="btn-primary" href="/product/${encodeURIComponent(slide.id)}">Рассмотреть дерево <span aria-hidden="true">↗</span></a></div></article>`).join('')}</div><nav class="story-dock" aria-label="Выбрать дерево"><button class="story-prev" aria-label="Предыдущее дерево">←</button><div class="story-dots">${slides.map((slide,index)=>`<button data-slide="${index}" aria-label="${escape(slide.title)}" aria-pressed="${index===0}"><span>0${index+1}</span></button>`).join('')}</div><button class="story-next" aria-label="Следующее дерево">→</button></nav></div>`;
    const track=host.querySelector('.story-track'),stage=host.querySelector('.story-stage'),dots=[...host.querySelectorAll('[data-slide]')];
    let active=-1,frame=0;
    function setActive(index){
      index=Math.max(0,Math.min(slides.length-1,index));if(index===active)return;active=index;
      dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===index)));
      host.querySelector('.story-prev').disabled=index===0;host.querySelector('.story-next').disabled=index===slides.length-1;
      host.querySelectorAll('.story-slide').forEach((slide,i)=>{slide.inert=i!==index;});
      host.querySelector('.story-dots').style.setProperty('--active',index);
    }
    function render(){
      frame=0;if(mobile.matches||reduce.matches){stage.style.setProperty("--journey",track.scrollLeft/Math.max(1,track.clientWidth*(slides.length-1)));setActive(Math.round(track.scrollLeft/track.clientWidth));return;}
      const rect=host.getBoundingClientRect(),travel=Math.max(1,host.offsetHeight-stage.offsetHeight);
      const progress=Math.max(0,Math.min(1,(74-rect.top)/travel));
      stage.style.setProperty("--journey",progress);
      track.scrollLeft=progress*(slides.length-1)*track.clientWidth;
      setActive(Math.round(progress*(slides.length-1)));
    }
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(render)};
    function go(index){
      index=Math.max(0,Math.min(slides.length-1,index));
      if(mobile.matches||reduce.matches)track.scrollTo({left:index*track.clientWidth,behavior:reduce.matches?'instant':'smooth'});
      else window.scrollTo({top:window.scrollY+host.getBoundingClientRect().top-74+(host.offsetHeight-stage.offsetHeight)*index/Math.max(1,slides.length-1),behavior:reduce.matches?'instant':'smooth'});
    }
    dots.forEach((dot,index)=>dot.addEventListener('click',()=>go(index)));
    host.querySelector('.story-prev').onclick=()=>go(active-1);host.querySelector('.story-next').onclick=()=>go(active+1);
    track.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();go(active+(event.key==='ArrowRight'?1:-1));}});
    window.addEventListener('scroll',schedule,{passive:true});track.addEventListener('scroll',schedule,{passive:true});
    const resize=new ResizeObserver(schedule);resize.observe(host);resize.observe(track);mobile.addEventListener('change',schedule);render();
    return ()=>{window.removeEventListener('scroll',schedule);resize.disconnect();mobile.removeEventListener('change',schedule);cancelAnimationFrame(frame);host.replaceChildren();};
  };
})();
