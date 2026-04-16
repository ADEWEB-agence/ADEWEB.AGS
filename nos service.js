
/* Particules lumineuses plus nombreuses et mouvement plus visible */
(function(){
  const container = document.getElementById('particles');
  if(!container) return;

  // adaptatif selon largeur
  const COUNT = Math.min(Math.max(Math.floor(window.innerWidth / 80), 12), 40); // 12..40
  const colors = [
    'rgba(110,231,183,0.98)',
    'rgba(99,102,241,0.95)',
    'rgba(249,115,22,0.95)',
    'rgba(59,130,246,0.9)',
    'rgba(236,72,153,0.9)'
  ];

  const parts = [];
  for(let i=0;i<COUNT;i++){
    const el = document.createElement('div');
    el.className = 'particle';
    const size = Math.random() * 18 + 6; // 6..24
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    const c = colors[Math.floor(Math.random()*colors.length)];
    el.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.98), ${c} 35%, transparent 75%)`;
    // position en % étendu un peu hors écran
    const left = Math.random() * 140 - 20;
    const top = Math.random() * 140 - 20;
    el.style.left = left + '%';
    el.style.top = top + '%';
    el.style.opacity = (Math.random()*0.6 + 0.15).toFixed(2);
    container.appendChild(el);
    parts.push({
      el, left, top, size,
      vx: (Math.random()-0.5)/20, // vitesse + rapide
      vy: (Math.random()-0.5)/20,
      sway: (Math.random()*0.6 + 0.4)
    });
  }

  let last = performance.now();
  function tick(now){
    const dt = Math.min(40, now - last);
    last = now;
    parts.forEach(p=>{
      p.left += p.vx * (dt/16) * p.sway;
      p.top += p.vy * (dt/16) * p.sway;
      // wrap
      if(p.left < -25) p.left = 125;
      if(p.left > 125) p.left = -25;
      if(p.top < -25) p.top = 125;
      if(p.top > 125) p.top = -25;
      // appliquer
      p.el.style.transform = `translate3d(${p.left}%, ${p.top}%, 0)`;
      const o = 0.15 + Math.abs(Math.sin((now/1800) + p.size)) * 0.8;
      p.el.style.opacity = Math.min(0.98, o).toFixed(2);
      // légère pulsation de taille
      const scale = 0.85 + Math.abs(Math.cos((now/1200) + p.size/10)) * 0.35;
      p.el.style.width = (p.size * scale) + 'px';
      p.el.style.height = (p.size * scale) + 'px';
    });
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // réduit les particules si prefers-reduced-motion
  const prm = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(prm && prm.matches){
    parts.forEach(p=> p.el.remove());
  }

  // resize simple (reload approach to recalc COUNT)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // simple : reload pour recalcul automatique (vous pouvez adapter)
      // comment out auto-reload in production if undesired
      // location.reload();
    }, 300);
  });
})();

/* Parallaxe souris plus prononcée mais contrôlée */
(function(){
  const els = document.querySelectorAll('.card, .logo, .hero, .floating-footer');
  if('ontouchstart' in window) return; // pas de parallaxe sur mobile
  let raf = null;
  function onMove(e){
    const cx = window.innerWidth/2;
    const cy = window.innerHeight/2;
    const dx = (e.clientX - cx)/cx;
    const dy = (e.clientY - cy)/cy;
    els.forEach((el,i)=>{
      const depth = 1 + ((i % 6) * 0.5); // variation
      const tx = dx * depth * 10; // plus sensible
      const ty = dy * depth * 6;
      // combine avec animation float-loop en conservant translateY oscillant:
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      el.style.transition = 'transform 120ms linear';
    });
    if(raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(()=>{});
  }
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseleave', () => {
    els.forEach(el => el.style.transform = '');
  });
})();