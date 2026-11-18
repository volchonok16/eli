(() => {
  const selector='.crystal-panel,.crystal-form,.product-thumbnail,.crystal-quantity,.card:not(.animate-pulse),.atelier-step,.glass-service,.story-photo,.story-dock,.atelier-filters,.btn-primary,.btn-outline,.catalog-details,header,div.border.border-surface-muted:not(:has(img)),label.card';
  const controls='.crystal-panel,.crystal-form,.crystal-quantity,.btn-primary,.btn-outline,.catalog-details,.glass-service,.card:not(.animate-pulse),.atelier-step,.story-photo,.story-dock';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const transparent=matchMedia('(prefers-reduced-transparency: reduce)');
  const ns='http://www.w3.org/2000/svg',cache=new Map(),observed=new Set();
  let defs,frame=0,scanFrame=0;
  function node(name,attrs){const el=document.createElementNS(ns,name);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,v);return el;}
  // A normal map bends only the rim; the flat central area leaves content undistorted.
  function lens(width,height,radius){
    const ratio=Math.min(1,256/width,512/height),w=Math.max(32,Math.round(width*ratio)),h=Math.max(16,Math.round(height*ratio));
    const r=Math.min(radius*w/width,h/2,w/2),rim=Math.max(4,Math.min(12,h*.25));
    const key=[w,h,Math.round(r)].join('-');if(cache.has(key))return cache.get(key);
    if(cache.size>=64)return null;
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d');if(!ctx)return null;const pixels=ctx.createImageData(w,h);
    const sdf=(x,y)=>{const qx=Math.abs(x)-(w/2-r),qy=Math.abs(y)-(h/2-r);return Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-r;};
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const px=x-w/2,py=y-h/2,depth=-sdf(px,py),offset=(y*w+x)*4;
      let nx=0,ny=0,amount=0;
      if(depth>=0&&depth<rim){nx=sdf(px+1,py)-sdf(px-1,py);ny=sdf(px,py+1)-sdf(px,py-1);const length=Math.hypot(nx,ny)||1;nx/=length;ny/=length;amount=Math.sin(Math.PI*depth/rim)*88;}
      pixels.data[offset]=128+nx*amount;pixels.data[offset+1]=128+ny*amount;pixels.data[offset+2]=128;pixels.data[offset+3]=255;
    }
    ctx.putImageData(pixels,0,0);const id='eli-crystal-'+cache.size;
    const filter=node('filter',{id,x:'0%',y:'0%',width:'100%',height:'100%','color-interpolation-filters':'sRGB'});
    filter.append(node('feImage',{href:canvas.toDataURL(),x:'0',y:'0',width:'100%',height:'100%',preserveAspectRatio:'none',result:'rim'}));
    filter.append(node('feDisplacementMap',{in:'SourceGraphic',in2:'rim',scale:'32',xChannelSelector:'R',yChannelSelector:'G'}));
    defs.append(filter);cache.set(key,id);return id;
  }
  const resize=new ResizeObserver(entries=>{
    if(transparent.matches)return;
    for(const {target} of entries){
      if(!target.isConnected){resize.unobserve(target);observed.delete(target);continue;}
      const {width,height}=target.getBoundingClientRect();if(width<20||height<16||height>900)continue;
      const radius=parseFloat(getComputedStyle(target).borderTopLeftRadius);
      const id=lens(width,height,Number.isFinite(radius)?radius:14);
      if(id)target.style.setProperty('--crystal-refraction',`url("#${id}") blur(.35px) saturate(1.2)`);
    }
  });
  function scan(){
    scanFrame=0;
    const page=location.pathname.split('/').filter(Boolean)[0]||'home';
    document.body.dataset.eliPage=page;
    document.querySelectorAll('form').forEach(el=>{
      if(page==='checkout')el.querySelectorAll('section').forEach(section=>section.classList.add('crystal-panel','checkout-section'));
      else if(!el.closest('.card'))el.classList.add('crystal-form');
    });
    document.querySelectorAll('.cart-item button[aria-label]').forEach(el=>el.classList.add('crystal-quantity'));
    document.querySelectorAll(selector).forEach(el=>{
      if(el.classList.contains('crystal-surface'))return;
      el.classList.add('crystal-surface');
      if(getComputedStyle(el).position==='static')el.classList.add('crystal-relative');
    });
    // SVG backdrop refraction is currently enabled only on Chromium; other engines keep the blur fallback.
    if(/Chrome|Chromium|Edg\//.test(navigator.userAgent)&&!transparent.matches){
      for(const el of observed)if(!el.isConnected){resize.unobserve(el);observed.delete(el);}
      document.querySelectorAll(controls).forEach(el=>{if(!observed.has(el)){el.classList.add('crystal-optics');observed.add(el);resize.observe(el);}});
    }
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const svg=node('svg',{'aria-hidden':'true',width:'0',height:'0',focusable:'false'});svg.style.cssText='position:absolute;pointer-events:none';defs=node('defs',{});svg.append(defs);document.body.append(svg);
    new MutationObserver(()=>{if(!scanFrame)scanFrame=requestAnimationFrame(scan);}).observe(document.getElementById('root'),{childList:true,subtree:true});scan();
  });
  document.addEventListener('pointermove',event=>{
    if(reduced.matches||event.pointerType==='touch'||frame)return;
    const target=event.target.closest('.crystal-surface');if(!target)return;
    const {clientX,clientY}=event;frame=requestAnimationFrame(()=>{frame=0;const box=target.getBoundingClientRect();target.style.setProperty('--light-x',((clientX-box.left)/box.width*100)+'%');target.style.setProperty('--light-y',((clientY-box.top)/box.height*100)+'%');});
  },{passive:true});
})();
