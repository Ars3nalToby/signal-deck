// Small shared helpers used across all Unwind sessions.
const Unwind = (() => {
  const MUTE_KEY = 'unwind-muted';

  function isMuted(){
    try{ return localStorage.getItem(MUTE_KEY) === '1'; }catch(e){ return false; }
  }
  function setMuted(v){
    try{ localStorage.setItem(MUTE_KEY, v ? '1' : '0'); }catch(e){}
  }

  function wireMuteButton(btn){
    if(!btn) return;
    const sync = () => {
      const m = isMuted();
      btn.textContent = m ? '🔇' : '🔊';
      btn.classList.toggle('is-muted', m);
      btn.setAttribute('aria-label', m ? 'Unmute sound' : 'Mute sound');
    };
    sync();
    btn.addEventListener('click', () => { setMuted(!isMuted()); sync(); });
  }

  function pop(el){
    if(!el) return;
    el.classList.remove('pop');
    // force reflow so the animation restarts even on rapid triggers
    void el.offsetWidth;
    el.classList.add('pop');
    setTimeout(() => el.classList.remove('pop'), 200);
  }

  function lerp(a,b,t){ return a + (b-a)*t; }
  function lerpAngle(a,b,t){
    let diff = ((b-a+Math.PI*3) % (Math.PI*2)) - Math.PI;
    return a + diff*t;
  }
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
  function easeOutCubic(t){ return 1 - Math.pow(1-t, 3); }

  // Fires a short burst of confetti-like rectangles across the given stage element.
  function confetti(stageEl, opts){
    opts = opts || {};
    const count = opts.count || 60;
    const colors = opts.colors || ['#6ee7d8','#b6a4f2','#f2b8a2','#7fe0a0','#f2a2b0'];
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.zIndex = '25';
    canvas.style.pointerEvents = 'none';
    stageEl.appendChild(canvas);
    const dpr = Math.min(window.devicePixelRatio||1, 2);
    const w = stageEl.clientWidth, h = stageEl.clientHeight;
    canvas.width = w*dpr; canvas.height = h*dpr;
    canvas.style.width = w+'px'; canvas.style.height = h+'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);

    const pieces = [];
    for(let i=0;i<count;i++){
      pieces.push({
        x: Math.random()*w, y: -20-Math.random()*h*0.4,
        vx: (Math.random()-0.5)*2.4,
        vy: 1.5+Math.random()*2.5,
        rot: Math.random()*Math.PI*2,
        vrot: (Math.random()-0.5)*0.25,
        size: 4+Math.random()*5,
        color: colors[Math.floor(Math.random()*colors.length)],
        life: 1
      });
    }
    let last = performance.now();
    function tick(now){
      const dt = Math.min((now-last)/16.67, 3); last = now;
      ctx.clearRect(0,0,w,h);
      let alive = false;
      for(const p of pieces){
        p.vy += 0.06*dt;
        p.x += p.vx*dt; p.y += p.vy*dt; p.rot += p.vrot*dt;
        if(p.y < h+30) alive = true;
        if(p.y > h*0.55) p.life -= 0.01*dt;
        ctx.save();
        ctx.globalAlpha = Math.max(p.life,0);
        ctx.translate(p.x,p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2,-p.size/3,p.size,p.size*0.66);
        ctx.restore();
      }
      if(alive){ requestAnimationFrame(tick); }
      else { canvas.remove(); }
    }
    requestAnimationFrame(tick);
  }

  return { isMuted, setMuted, wireMuteButton, pop, lerp, lerpAngle, clamp, easeOutCubic, confetti };
})();
