document.getElementById('year').textContent = new Date().getFullYear();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- typing effect ---------- */
const roles = ['Software Engineer', 'UI/UX Designer', 'AI Enthusiast', 'Problem Solver'];
const typedEl = document.getElementById('typedRole');

function typeLoop(){
  let roleIndex = 0, charIndex = 0, deleting = false;
  function tick(){
    const current = roles[roleIndex];
    if(!deleting){
      charIndex++;
      typedEl.textContent = current.slice(0, charIndex);
      if(charIndex === current.length){ deleting = true; setTimeout(tick, 1400); return; }
    } else {
      charIndex--;
      typedEl.textContent = current.slice(0, charIndex);
      if(charIndex === 0){ deleting = false; roleIndex = (roleIndex + 1) % roles.length; }
    }
    setTimeout(tick, deleting ? 45 : 75);
  }
  tick();
}
if(reducedMotion){ typedEl.textContent = roles[0]; } else { typeLoop(); }

/* ---------- progress bar ---------- */
const progressBar = document.getElementById('progressBar');
function updateProgress(){
  const scrolled = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${max > 0 ? scrolled / max : 0})`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

/* ---------- reveal on scroll ---------- */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

/* ---------- scrollspy nav ---------- */
const navLinks = document.querySelectorAll('#navList a');
const sections = document.querySelectorAll('main .section');
const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = entry.target.getAttribute('id');
    const link = document.querySelector(`#navList a[href="#${id}"]`);
    if(!link) return;
    if(entry.isIntersecting){
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
sections.forEach(sec => spyObserver.observe(sec));

/* ---------- mobile nav ---------- */
const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');
navToggle.addEventListener('click', () => {
  const isOpen = navList.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});
navList.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navList.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ---------- flip card ---------- */
const flipCard = document.getElementById('flipCard');
if(flipCard){
  flipCard.addEventListener('click', () => flipCard.classList.toggle('flipped'));
}

/* ---------- count-up stats ---------- */
const statNums = document.querySelectorAll('.stat-num');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    if(reducedMotion){
      el.textContent = target.toFixed(decimals);
      statObserver.unobserve(el);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    function frame(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if(progress < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(frame);
    statObserver.unobserve(el);
  });
}, { threshold: 0.4 });
statNums.forEach(el => statObserver.observe(el));

/* ---------- tilt effect on project cards ---------- */
if(!reducedMotion){
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${y * -6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ---------- copy to clipboard ---------- */
const toast = document.getElementById('toast');
let toastTimer;
document.querySelectorAll('.contact-card').forEach(item => {
  item.addEventListener('click', async () => {
    const value = item.getAttribute('data-copy');
    try{
      await navigator.clipboard.writeText(value);
      showToast(`Copied: ${value}`);
    } catch(err){
      showToast('Copy failed — select the text manually');
    }
  });
});
function showToast(message){
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ---------- cursor glow ---------- */
if(!reducedMotion){
  const cursorGlow = document.getElementById('cursorGlow');
  window.addEventListener('mousemove', (e) => {
    cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    cursorGlow.classList.add('active');
  });
  document.addEventListener('mouseleave', () => cursorGlow.classList.remove('active'));
}

/* ---------- particle constellation (hero) ---------- */
(function initParticles(){
  const canvas = document.getElementById('particles');
  const hero = document.querySelector('.hero');
  const ctx = canvas.getContext('2d');
  let w, h, particles, mouse = { x: null, y: null };

  function resize(){
    w = canvas.width = hero.clientWidth;
    h = canvas.height = hero.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = reducedMotion ? 0 : Math.min(70, Math.floor((w * h) / 14000));
  particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 1.6 + 0.6
  }));

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  function step(){
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if(p.x < 0 || p.x > w) p.vx *= -1;
      if(p.y < 0 || p.y > h) p.vy *= -1;

      if(mouse.x !== null){
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < 120){
          const force = (120 - dist) / 120;
          p.x += (dx / dist) * force * 1.2;
          p.y += (dy / dist) * force * 1.2;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(240, 171, 252, 0.7)';
      ctx.fill();
    });

    for(let i = 0; i < particles.length; i++){
      for(let j = i + 1; j < particles.length; j++){
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < 110){
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(167, 139, 250, ${0.18 * (1 - dist / 110)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    if(!reducedMotion) requestAnimationFrame(step);
  }

  if(COUNT > 0) step();
})();
