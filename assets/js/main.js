document.documentElement.classList.add('js');

// ---------- scroll-reveal ----------
var targets = document.querySelectorAll('.reveal, .benefit, .underline-word');
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, {threshold:0.2, rootMargin:'0px 0px -8% 0px'});
  targets.forEach(function(el){ io.observe(el); });
} else {
  targets.forEach(function(el){ el.classList.add('in'); });
}

// ---------- smooth-scroll for in-page anchors ----------
// Delegated on document (not bound per-link) so it still works on links that
// live inside the nav/footer partials, which aren't in the DOM until include.js
// injects them.
document.addEventListener('click', function(e){
  var link = e.target.closest('a[href^="#"]');
  if (!link) return;
  var id = link.getAttribute('href').slice(1);
  if (!id) return;
  var el = document.getElementById(id);
  if (el) {
    e.preventDefault();
    el.scrollIntoView({behavior:'smooth', block:'start'});
  }
});

// ---------- nav active-state ----------
// Runs once the nav/footer partials are actually in the DOM.
document.addEventListener('partials:loaded', function(){
  var page = document.body.getAttribute('data-page');
  if (!page) return;
  document.querySelectorAll('[data-page]').forEach(function(a){
    if (a.tagName === 'A' && a.getAttribute('data-page') === page) {
      a.classList.add('active');
    }
  });
});

// ---------- mobile hamburger menu ----------
document.addEventListener('partials:loaded', function(){
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  function closeMenu(){
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
  }
  function openMenu(){
    toggle.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');
  }

  toggle.addEventListener('click', function(){
    var isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) closeMenu(); else openMenu();
  });
  menu.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', closeMenu);
  });
  window.addEventListener('resize', function(){
    if (window.innerWidth >= 640) closeMenu();
  });
});

// ---------- hero device mockup auto-scroll ----------
// Measures the real screenshot's scaled height so the auto-scroll animation
// travels exactly to its bottom, not an arbitrary guess.
(function(){
  var img = document.getElementById('hero-device-img');
  if (!img) return;
  function setScrollDistance(){
    var screen = img.closest('.device-screen');
    var scaledHeight = img.naturalWidth ? (screen.clientWidth / img.naturalWidth) * img.naturalHeight : 0;
    var distance = Math.max(0, scaledHeight - screen.clientHeight);
    img.style.setProperty('--scroll-distance', distance + 'px');
  }
  if (img.complete) setScrollDistance();
  img.addEventListener('load', setScrollDistance);
  window.addEventListener('resize', setScrollDistance);
})();

// ---------- scroll progress bar + background-photo parallax + nav scroll-shadow ----------
// One shared rAF-throttled scroll handler drives all three so a fast scroll
// only ever triggers a single reflow-free pass, not three separate listeners.
(function(){
  var progressEl = document.getElementById('scroll-progress');
  var parallaxImgs = Array.prototype.slice.call(document.querySelectorAll('.bg-photo img'));
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var navEl = null;
  document.addEventListener('partials:loaded', function(){ navEl = document.querySelector('.nav'); update(); });

  var ticking = false;
  function update(){
    ticking = false;
    var scrollY = window.scrollY;

    if (progressEl) {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;
      progressEl.style.transform = 'scaleX(' + pct + ')';
    }

    if (navEl) {
      navEl.classList.toggle('is-scrolled', scrollY > 24);
    }

    if (!reduceMotion && parallaxImgs.length) {
      var vh = window.innerHeight;
      parallaxImgs.forEach(function(img){
        var section = img.closest('section');
        if (!section) return;
        var rect = section.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var offset = Math.max(-40, Math.min(40, (vh / 2 - center) * 0.12));
        img.style.setProperty('--parallax-y', offset + 'px');
      });
    }
  }
  function onScroll(){
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  update();
})();

// ---------- portfolio: stacked deck (click/drag to cycle), scroll-linked ----------
(function(){
  var carousel = document.querySelector('.portfolio-carousel');
  if (!carousel) return;
  var deck = document.getElementById('portfolio-deck');
  var cards = Array.prototype.slice.call(deck.querySelectorAll('.portfolio-card'));
  var total = cards.length;
  var dotsWrap = document.getElementById('portfolio-dots');
  var prevBtn = carousel.querySelector('.portfolio-nav.prev');
  var nextBtn = carousel.querySelector('.portfolio-nav.next');
  var current = 0;
  var maxVisibleDepth = total - 1;

  cards.forEach(function(_, i){
    var dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', function(){ goTo(i); });
    dotsWrap.appendChild(dot);
  });
  var dots = dotsWrap.querySelectorAll('button');

  var navListWrap = document.getElementById('portfolio-nav-list');
  cards.forEach(function(card, i){
    var item = document.createElement('button');
    item.type = 'button';
    item.className = 'portfolio-nav-item';
    var num = document.createElement('span');
    num.className = 'pni-num';
    num.textContent = String(i + 1).padStart(2, '0');
    var name = document.createElement('span');
    name.className = 'pni-name';
    name.textContent = card.querySelector('h3').textContent;
    item.appendChild(num);
    item.appendChild(name);
    item.addEventListener('click', function(){ goTo(i); });
    navListWrap.appendChild(item);
  });
  var navItems = navListWrap.querySelectorAll('.portfolio-nav-item');

  function depthOf(i){ return (i - current + total) % total; }

  function layout(dragX){
    cards.forEach(function(card, i){
      var depth = depthOf(i);
      var tx = -depth * 16;
      var ty = depth * 9;
      var rot = -depth * 2.2;
      var scale = 1 - depth * 0.045;
      if (depth === 0 && dragX) tx += dragX;
      card.style.transform = 'translate(' + tx + 'px,' + ty + 'px) rotate(' + rot + 'deg) scale(' + scale + ')';
      card.style.zIndex = String(100 - depth);
      card.style.opacity = depth <= maxVisibleDepth ? String(1 - depth * 0.08) : '0';
      card.style.pointerEvents = depth === 0 ? 'auto' : 'none';
    });
    dots.forEach(function(d, di){ d.classList.toggle('active', di === current); });
    navItems.forEach(function(item, di){ item.classList.toggle('active', di === current); });
  }

  function goTo(i){
    current = (i + total) % total;
    layout();
  }

  prevBtn.addEventListener('click', function(){ goTo(current - 1); });
  nextBtn.addEventListener('click', function(){ goTo(current + 1); });
  window.addEventListener('resize', function(){ layout(); });

  // drag the front card to cycle the deck (mouse + touch, unified via Pointer Events)
  var dragging = false, startX = 0, dx = 0, movedFar = false;
  deck.addEventListener('pointerdown', function(e){
    if (e.target.closest('a')) return; // let link clicks navigate normally, no drag capture
    var card = cards[current];
    dragging = true; startX = e.clientX; dx = 0; movedFar = false;
    if (card.setPointerCapture) { try { card.setPointerCapture(e.pointerId); } catch(err) {} }
    card.style.transition = 'none';
  });
  deck.addEventListener('pointermove', function(e){
    if (!dragging) return;
    dx = e.clientX - startX;
    if (Math.abs(dx) > 6) movedFar = true;
    layout(dx);
  });
  function endDrag(){
    if (!dragging) return;
    dragging = false;
    var card = cards[current];
    card.style.transition = '';
    if (Math.abs(dx) > 60) {
      goTo(current + (dx < 0 ? 1 : -1));
    } else {
      layout();
    }
    dx = 0;
  }
  deck.addEventListener('pointerup', endDrag);
  deck.addEventListener('pointerleave', endDrag);
  // a drag shouldn't also fire the "View Site" link click underneath it
  deck.addEventListener('click', function(e){ if (movedFar) { e.preventDefault(); e.stopPropagation(); } }, true);

  layout();

  // Scroll-linked reveal (every width): pin the deck+list in place while the
  // taller .portfolio-scroller wrapper scrolls past, and map scroll progress
  // through that wrapper directly to the front card index.
  var scroller = document.getElementById('portfolio-scroller');
  if (scroller) {
    scroller.style.setProperty('--pf-steps', String(total - 1));
    var onScrollReveal = function(){
      if (dragging) return;
      var rect = scroller.getBoundingClientRect();
      var scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      var progress = Math.max(0, Math.min(1, -rect.top / scrollable));
      var idx = Math.round(progress * (total - 1));
      if (idx !== current) goTo(idx);
    };
    window.addEventListener('scroll', onScrollReveal, {passive:true});
    window.addEventListener('resize', onScrollReveal);
    onScrollReveal();
  }
})();
