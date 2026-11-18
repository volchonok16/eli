(() => {
  const note = document.createElement('div');
  note.className = 'preview-note';
  note.textContent = 'Дизайн-копия Eli · каталог на 29.10.2026 · заказы и оплата не подключены';
  document.body.append(note);
  document.addEventListener('pointermove',event=>{
    const button=event.target.closest('.atelier-filters button');if(!button)return;
    const box=button.getBoundingClientRect();button.style.setProperty('--gx',((event.clientX-box.left)/box.width*100)+'%');button.style.setProperty('--gy',((event.clientY-box.top)/box.height*100)+'%');
  },{passive:true});
  let previousPath=location.pathname;
  const enhance = () => {
    document.querySelector('section:has(img[src="/images/photos/snow-covered-premium-fir.png"])')?.classList.add('atelier-hero');
    if(location.pathname!==previousPath){
      previousPath=location.pathname;
      if(!location.hash)window.scrollTo({top:0,left:0,behavior:'instant'});
    }
    document.querySelectorAll('header nav a').forEach(link=>{
      const href=link.getAttribute('href');
      const active=href===(location.pathname.replace(/\/$/,'')||'/') || (href==='/catalog' && location.pathname.startsWith('/product/'));
      if(active)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');
    });
    if(location.pathname.startsWith('/product/')) document.querySelectorAll('p.max-w-lg').forEach(el=>el.classList.add('preview-product-summary'));
    document.querySelectorAll('div.w-12,div.w-14,div.w-16').forEach(el => {
      if (el.querySelector(':scope > svg') && !el.closest('.absolute')) el.classList.add('glass-service');
    });
    document.querySelectorAll('form').forEach(form => {
      if (form.querySelector('.preview-form-note')) return;
      const hint = document.createElement('p');hint.className='preview-form-note';
      hint.textContent='Режим просмотра дизайна. Форма не отправляет данные; настоящий аккаунт и платёжные данные не нужны.';
      form.prepend(hint);
    });
    if (location.pathname.replace(/\/$/,'') === '/login' && !document.querySelector('.demo-login')) {
      const form = document.querySelector('form');
      if (form) {
        const button = document.createElement('button');button.type='button';button.className='btn-outline demo-login';button.textContent='Посмотреть демо-кабинет';
        button.onclick=()=>{
          sessionStorage.setItem('token','design-preview');
          sessionStorage.setItem('user',JSON.stringify({id:'design-preview',name:'Гость',firstName:'Гость',lastName:'',email:'guest@example.com',phone:'',role:'CUSTOMER'}));
          location.href='/profile';
        };form.after(button);
      }
    }
  };
  let pending=false;
  new MutationObserver(()=>{if(!pending){pending=true;requestAnimationFrame(()=>{pending=false;enhance()})}}).observe(document.getElementById('root'),{childList:true,subtree:true});
  enhance();
})();
