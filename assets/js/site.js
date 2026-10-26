/* Le Central — interactions du site de démonstration (CALYNEVO). Sans dépendance. */
(function () {
  var d = document, root = d.documentElement, EN = root.lang === 'en';
  var T = EN ? {
    open: 'Open now', until: 'until', closed: 'Closed', opens: 'opens', at: 'at', today: 'today', tomorrow: 'tomorrow',
    days: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], dshort: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
    months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    pick: 'Please choose an option.', name: 'Please enter your name.', phone: 'Please enter a valid phone number.', mail: 'Please enter a valid email address.',
    midi: 'Lunch', soir: 'Evening', people: 'people', person: 'person', light: 'Switch to light mode', dark: 'Switch to dark mode', mapt: 'Map of Le Central'
  } : {
    open: 'Ouvert', until: 'jusqu’à', closed: 'Fermé', opens: 'ouvre', at: 'à', today: 'aujourd’hui', tomorrow: 'demain',
    days: ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'], dshort: ['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'],
    months: ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'],
    pick: 'Merci de choisir une option.', name: 'Merci d’indiquer votre nom.', phone: 'Merci d’indiquer un numéro de téléphone valide.', mail: 'Merci d’indiquer une adresse e-mail valide.',
    midi: 'Midi', soir: 'Soir', people: 'personnes', person: 'personne', light: 'Passer en mode clair', dark: 'Passer en mode sombre', mapt: 'Plan d’accès au Central'
  };
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* horaires (Google Maps, oct. 2026) : 0 = dimanche */
  var HOURS = { 2: [10, 15], 3: [10, 15], 4: [10, 22.5], 5: [10, 23], 6: [9, 23] };
  function paris() {
    var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
    var wd = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(o.weekday);
    return { day: wd, h: (+o.hour % 24) + (+o.minute) / 60 };
  }
  function fmtH(h) { var hh = Math.floor(h), mm = Math.round((h - hh) * 60); return EN ? (hh + ':' + (mm < 10 ? '0' : '') + mm) : (hh + 'h' + (mm ? (mm < 10 ? '0' : '') + mm : '')); }

  /* thème */
  function setThemeLabel() {
    var light = root.getAttribute('data-theme') === 'light';
    $$('.js-theme').forEach(function (b) { b.setAttribute('aria-label', light ? T.dark : T.light); b.setAttribute('aria-pressed', light ? 'true' : 'false'); });
  }
  $$('.js-theme').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      function apply() { root.setAttribute('data-theme', next); store('lc-theme', next); setThemeLabel(); }
      if (!d.startViewTransition || reduce) { apply(); return; }
      /* changement de thème : cercle de lumière qui part du bouton */
      var r = b.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      var rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.classList.add('vt-theme');
      var t = d.startViewTransition(apply);
      t.ready.then(function () {
        root.animate({ clipPath: ['circle(0 at ' + x + 'px ' + y + 'px)', 'circle(' + rad + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' });
      });
      t.finished.then(function () { root.classList.remove('vt-theme'); });
    });
  });
  setThemeLabel();

  /* en-tête, retour en haut */
  var hdr = $('.hdr'), top = $('.totop');
  function onScroll() { var y = window.scrollY; if (hdr) hdr.classList.toggle('is-scrolled', y > 8); if (top) top.classList.toggle('is-on', y > 900); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* menu mobile */
  var mnav = $('.mnav'), burger = $('.burger');
  function closeNav() { if (!mnav) return; mnav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); d.body.style.overflow = ''; burger.focus(); }
  if (mnav && burger) {
    burger.addEventListener('click', function () { mnav.classList.add('is-open'); burger.setAttribute('aria-expanded', 'true'); d.body.style.overflow = 'hidden'; var f = $('a,button', mnav); if (f) f.focus(); });
    $('.mclose', mnav).addEventListener('click', closeNav);
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mnav.classList.contains('is-open')) closeNav(); });
  }

  /* rangées défilantes (mobile) : focus clavier seulement si elles défilent */
  function scrollFocus() {
    $$('.dishes,.quotes,.revs-g').forEach(function (el) {
      var sc = el.scrollWidth > el.clientWidth + 4;
      if (sc) { el.tabIndex = 0; el.setAttribute('role', 'region'); var h = el.closest('section'); var t = h && $('h2', h); el.setAttribute('aria-label', t ? t.textContent : 'Liste'); }
      else { el.removeAttribute('tabindex'); el.removeAttribute('role'); el.removeAttribute('aria-label'); }
    });
  }
  scrollFocus(); window.addEventListener('resize', scrollFocus);

  /* intro : clic ou touche pour passer */
  var intro = $('.intro');
  if (intro && root.classList.contains('intro-on')) {
    var skip = function () { root.classList.add('intro-skip'); };
    intro.addEventListener('click', skip); d.addEventListener('keydown', skip, { once: true });
    setTimeout(function () { intro.remove(); }, 2000);
  }

  /* titres : découpe en mots (animation à l'apparition) */
  if (!reduce) $$('.head h2,.mcat-h h2,h2.ttl').forEach(function (h) {
    if (h.querySelector('.big')) return;
    var host = h.closest('.head,.mcat-h') || h; host.classList.add('split');
    var w = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(part)); return; }
            var o = d.createElement('span'), i = d.createElement('span'); o.className = 'sw'; i.textContent = part; i.style.setProperty('--w', w++); o.appendChild(i); frag.appendChild(o);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !n.classList.contains('vh')) walk(n);
      });
    })(h);
  });

  /* souris : inclinaison 3D, boutons aimantés, lampe du héros */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('.dish,.mc,.mfeat,.rev,.tile,.fx').forEach(function (el) {
      el.classList.add('tilt');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.classList.add('is-tilt'); el.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg'); el.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg'); el.style.setProperty('--ty', '-4px');
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('is-tilt'); el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); el.style.removeProperty('--ty'); });
    });
    $$('.btn-gold').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .25).toFixed(1) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
    var hero = $('.hero'), lamp = $('.hero-lamp');
    if (hero && lamp) hero.addEventListener('pointermove', function (e) { var r = hero.getBoundingClientRect(); lamp.style.setProperty('--lx', (e.clientX - r.left) + 'px'); lamp.style.setProperty('--ly', (e.clientY - r.top) + 'px'); });
  }

  /* apparitions */
  var rv = $$('.rv,.rv-clip,.ftr-sign'), heads = $$('.head,.mcat-h,.ttl'), nums = $$('[data-count]');
  /* compteur : 0 -> valeur, en 1,4 s */
  function count(el) {
    var end = +el.getAttribute('data-count'), suf = el.getAttribute('data-suf') || '', t0 = null;
    if (reduce) return;
    function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(end * e) + suf; if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { var el = e.target; el.classList.add(el.matches('.head,.mcat-h,.ttl') ? 'is-drawn' : 'is-in'); if (el.hasAttribute('data-count')) count(el); io.unobserve(el); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    rv.concat(heads, nums).forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('is-in'); }); heads.forEach(function (el) { el.classList.add('is-drawn'); }); }

  /* statut ouvert / fermé + jour en cours */
  var now = paris();
  $$('[data-status]').forEach(function (el) {
    var t = HOURS[now.day], txt, open = false;
    if (t && now.h >= t[0] && now.h < t[1]) { open = true; txt = T.open + ' · ' + T.until + ' ' + fmtH(t[1]); }
    else {
      var k = 0, dd = now.day, nx;
      if (t && now.h < t[0]) { nx = { day: dd, h: t[0], rel: T.today }; }
      else { for (k = 1; k < 8; k++) { dd = (now.day + k) % 7; if (HOURS[dd]) { nx = { day: dd, h: HOURS[dd][0], rel: k === 1 ? T.tomorrow : T.days[dd] }; break; } } }
      txt = T.closed + ' · ' + T.opens + ' ' + nx.rel + ' ' + T.at + ' ' + fmtH(nx.h);
    }
    el.classList.add(open ? 'is-open' : 'is-closed');
    var s = el.querySelector('span'); if (s) s.textContent = txt;
  });
  $$('.hours tr[data-d]').forEach(function (tr) { if (+tr.getAttribute('data-d') === now.day) { tr.classList.add('today'); tr.setAttribute('aria-current', 'date'); } });

  /* MIDI | SOIR */
  var ms = $('.ms');
  if (ms) {
    var tabs = $$('[role="tab"]', ms);
    function setMode(m, focus) {
      ms.setAttribute('data-mode', m);
      tabs.forEach(function (b) {
        var on = b.getAttribute('data-m') === m; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1;
        var p = d.getElementById(b.getAttribute('aria-controls')); p.hidden = !on; if (on) { p.classList.remove('is-in'); void p.offsetWidth; p.classList.add('is-in'); }
        if (on && focus) b.focus();
      });
    }
    tabs.forEach(function (b, i) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-m')); store('lc-ms', b.getAttribute('data-m')); });
      b.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var n = tabs[(i + 1) % tabs.length]; setMode(n.getAttribute('data-m'), true); } });
    });
    var saved = store('lc-ms');
    setMode(saved === 'midi' || saved === 'soir' ? saved : (now.h >= 16 && now.day >= 4 && now.day <= 6 ? 'soir' : 'midi'));
  }

  /* onglets de la carte */
  var mt = $('.mtabs');
  if (mt && 'IntersectionObserver' in window) {
    var links = $$('a', mt), map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var cur;
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          var a = map[e.target.id]; if (!a || a === cur) return;
          if (cur) { cur.classList.remove('is-on'); cur.removeAttribute('aria-current'); }
          cur = a; a.classList.add('is-on'); a.setAttribute('aria-current', 'true');
          var ul = a.parentNode.parentNode; ul.scrollTo({ left: a.offsetLeft - 20, behavior: reduce ? 'auto' : 'smooth' });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('.mcat').forEach(function (s) { io2.observe(s); });
  }

  /* carte Google au clic */
  $$('.mapc button').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = d.createElement('iframe'); f.src = b.getAttribute('data-src'); f.title = T.mapt; f.loading = 'lazy'; f.referrerPolicy = 'no-referrer-when-downgrade';
      b.parentNode.appendChild(f); b.remove(); var c = b.parentNode && $('.mapc-c', b.parentNode); if (c) c.remove();
    });
  });

  /* galerie : rangées défilantes + visionneuse */
  $$('.grow-s').forEach(function (sec) {
    var row = $('.grow', sec), btns = $$('[data-row]', sec);
    function upd() { btns[0].disabled = row.scrollLeft < 8; btns[1].disabled = row.scrollLeft + row.clientWidth > row.scrollWidth - 8; }
    btns.forEach(function (b) { b.addEventListener('click', function () { row.scrollBy({ left: +b.getAttribute('data-row') * row.clientWidth * .85, behavior: reduce ? 'auto' : 'smooth' }); }); });
    row.addEventListener('scroll', upd, { passive: true }); upd();
    /* glisser à la souris */
    var down = false, sx = 0, sl = 0, moved = false;
    row.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = row.scrollLeft; });
    window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; row.classList.add('is-drag'); } if (moved) row.scrollLeft = sl - dx; });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; row.classList.remove('is-drag'); });
    row.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopImmediatePropagation(); moved = false; } }, true);
    row.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });
  var lb = $('.lb');
  if (lb) {
    var lbImg = $('img', lb), lbCap = $('p', lb), lbK = $('.lb-k', lb), list = [], set = [], idx = 0, opener;
    list = $$('[data-lb]');
    function show(i, dir) {
      if (!set.length) return; idx = (i + set.length) % set.length; var a = set[idx];
      lbImg.classList.remove('in-l', 'in-r'); void lbImg.offsetWidth; if (dir) lbImg.classList.add(dir > 0 ? 'in-r' : 'in-l');
      lbImg.src = a.getAttribute('href'); lbImg.alt = $('img', a).alt; lbCap.textContent = $('img', a).alt; lbK.textContent = (idx + 1) + ' / ' + set.length;
      lb.classList.toggle('is-cut', a.classList.contains('cut'));
    }
    list.forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); opener = a; set = list.filter(function (x) { return x.getAttribute('data-c') === a.getAttribute('data-c'); }); show(set.indexOf(a)); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); d.body.style.overflow = 'hidden'; $('.lb-x', lb).focus(); });
    });
    function closeLb() { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); d.body.style.overflow = ''; if (opener) opener.focus(); }
    $('.lb-x', lb).addEventListener('click', closeLb);
    $('.lb-p', lb).addEventListener('click', function () { show(idx - 1, -1); });
    $('.lb-n', lb).addEventListener('click', function () { show(idx + 1, 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    var tx = null;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 45) show(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); tx = null; });
    d.addEventListener('keydown', function (e) { if (!lb.classList.contains('is-open')) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowRight') show(idx + 1, 1); if (e.key === 'ArrowLeft') show(idx - 1, -1); });
  }

  /* validation commune */
  function check(fld, ok, msg) { fld.classList.toggle('is-bad', !ok); var e = $('.err', fld); if (e) e.textContent = ok ? '' : msg; var inp = $('input,select,textarea', fld); if (inp) inp.setAttribute('aria-invalid', ok ? 'false' : 'true'); return ok; }
  var rePhone = /^[+0-9 ().-]{8,20}$/, reMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* réservation (mode démonstration : rien n'est envoyé) */
  var bk = $('#book');
  if (bk) {
    var steps = $$('.step', bk), bar = $$('.bk-steps li'), si = 0;
    var days = $('.days', bk), times = $('#bk-times'), svc = $$('input[name="service"]', bk), gIn = $('#bk-g');
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var iso = function (x) { return x.getFullYear() + '-' + ('0' + (x.getMonth() + 1)).slice(-2) + '-' + ('0' + x.getDate()).slice(-2); };
    for (var i = 0; i < 28; i++) {
      var dt = new Date(today); dt.setDate(today.getDate() + i);
      var wd = dt.getDay(), lab = d.createElement('label'), inp = d.createElement('input'), sp = d.createElement('span');
      inp.type = 'radio'; inp.name = 'date'; inp.value = iso(dt); inp.setAttribute('data-wd', wd);
      inp.setAttribute('aria-label', T.days[wd] + ' ' + dt.getDate() + ' ' + T.months[dt.getMonth()] + (HOURS[wd] ? '' : ' (' + T.closed + ')'));
      if (!HOURS[wd]) { inp.disabled = true; lab.className = 'off'; }
      sp.innerHTML = '<small>' + (i === 0 ? T.today : T.dshort[wd]) + '</small><b>' + dt.getDate() + '</b><small>' + (HOURS[wd] ? T.months[dt.getMonth()] : T.closed) + '</small>' + (wd >= 4 && HOURS[wd] ? '<i aria-hidden="true"></i>' : '');
      lab.appendChild(inp); lab.appendChild(sp); days.appendChild(lab);
    }
    $$('.days-nav', bk).forEach(function (b) { b.addEventListener('click', function () { days.scrollBy({ left: +b.getAttribute('data-dir') * days.clientWidth * .8, behavior: reduce ? 'auto' : 'smooth' }); }); });
    function selDate() { return $('input[name="date"]:checked', bk); }
    function fmtDay(r) { var x = new Date(r.value + 'T12:00:00'); return T.days[x.getDay()] + ' ' + x.getDate() + ' ' + T.months[x.getMonth()]; }
    function buildTimes() {
      var r = selDate(), sv = $('input[name="service"]:checked', bk), wd = r ? +r.getAttribute('data-wd') : -1;
      var soirOk = wd >= 4 && wd <= 6;
      svc.forEach(function (x) { if (x.value === 'soir') { x.disabled = !soirOk; x.closest('label').classList.toggle('off', !soirOk); if (!soirOk && x.checked) { x.checked = false; sv = null; } } });
      if (!sv) return;
      times.innerHTML = '';
      var end = wd === 4 ? 21 : 21.5;
      var slots = sv.value === 'midi' ? [12, 12.25, 12.5, 12.75, 13, 13.25, 13.5, 13.75] : [19, 19.5, 20, 20.5, 21, 21.5].filter(function (h) { return h <= end; });
      var isToday = r && r.value === iso(today);
      slots.forEach(function (h, n) {
        var lab = d.createElement('label'), inp = d.createElement('input'), sp = d.createElement('span');
        inp.type = 'radio'; inp.name = 'time'; inp.value = fmtH(h); if (isToday && h <= now.h + .5) inp.disabled = true;
        sp.textContent = fmtH(h); sp.style.animationDelay = (n * 0.04) + 's'; lab.appendChild(inp); lab.appendChild(sp); times.appendChild(lab);
      });
    }
    function seats() {
      var n = Math.max(1, Math.min(8, +gIn.value || 1)), p = $('.seats', bk); gIn.value = n;
      if (p) { p.innerHTML = ''; for (var k = 0; k < n; k++) { var c = d.createElement('i'); c.style.animationDelay = (k * 0.05) + 's'; p.appendChild(c); } }
      $('#tk-g').textContent = n + ' ' + (n > 1 ? T.people : T.person);
    }
    $$('[data-g]', bk).forEach(function (b) { b.addEventListener('click', function () { gIn.value = (+gIn.value || 1) + +b.getAttribute('data-g'); seats(); }); });
    gIn.addEventListener('input', seats);
    function ticket() {
      var r = selDate(), sv = $('input[name="service"]:checked', bk), t = $('input[name="time"]:checked', bk);
      function put(id, v) { var el = $(id); if (el.textContent !== v) { el.textContent = v; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); } }
      put('#tk-d', r ? fmtDay(r) : '—'); put('#tk-s', sv ? T[sv.value] : '—'); put('#tk-t', t ? t.value : '—');
    }
    bk.addEventListener('change', function (e) { if (e.target.name === 'date' || e.target.name === 'service') buildTimes(); ticket(); });
    function valid(n) {
      var st = steps[n], ok = true;
      $$('[data-need]', st).forEach(function (f) {
        var t = f.getAttribute('data-need'), inp = $('input,select,textarea', f), v = inp ? inp.value.trim() : '';
        if (t === 'radio') ok = check(f, !!$('input:checked', f), T.pick) && ok;
        if (t === 'guests') ok = check(f, +v >= 1 && +v <= 8, T.pick) && ok;
        if (t === 'name') ok = check(f, v.length > 1, T.name) && ok;
        if (t === 'phone') ok = check(f, rePhone.test(v), T.phone) && ok;
        if (t === 'mail') ok = check(f, !v || reMail.test(v), T.mail) && ok;
      });
      if (!ok) { var bad = $('.is-bad input, .is-bad', st); if (bad) bad.focus && bad.focus(); }
      return ok;
    }
    function go(n) {
      var dir = n > si ? 'fwd' : 'back';
      steps[si].hidden = true; si = n; steps[si].hidden = false; steps[si].setAttribute('data-dir', dir);
      bar.forEach(function (b, j) { b.classList.toggle('is-done', j < si); b.classList.toggle('is-on', j === si); });
      var h = $('h2,legend', steps[si]); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      var top = bk.closest('.bk-main').getBoundingClientRect().top; if (top < 0) bk.closest('.bk-main').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
    $$('[data-next]', bk).forEach(function (b) { b.addEventListener('click', function () { if (valid(si)) go(si + 1); }); });
    $$('[data-prev]', bk).forEach(function (b) { b.addEventListener('click', function () { go(si - 1); }); });
    bk.addEventListener('submit', function (e) {
      e.preventDefault(); if (!valid(si)) return;
      var r = selDate(), g = +gIn.value;
      $('#rc-date').textContent = fmtDay(r);
      $('#rc-svc').textContent = T[$('input[name="service"]:checked', bk).value] + ' · ' + $('input[name="time"]:checked', bk).value;
      $('#rc-g').textContent = g + ' ' + (g > 1 ? T.people : T.person);
      $('#rc-n').textContent = $('#bk-name').value.trim();
      go(steps.length - 1); bar.forEach(function (b) { b.classList.add('is-done'); b.classList.remove('is-on'); });
      var tk = $('.tk'); if (tk) tk.classList.add('is-ok');
    });
    bar.forEach(function (b, j) { b.classList.toggle('is-on', j === 0); });
    seats();
  }

  /* demande de groupe (mode démonstration) */
  var gf = $('#grp');
  if (gf) {
    gf.addEventListener('submit', function (e) {
      e.preventDefault(); var ok = true;
      $$('[data-need]', gf).forEach(function (f) {
        var t = f.getAttribute('data-need'), inp = $('input,select,textarea', f), v = inp.value.trim();
        if (t === 'name') ok = check(f, v.length > 1, T.name) && ok;
        if (t === 'phone') ok = check(f, rePhone.test(v), T.phone) && ok;
        if (t === 'mail') ok = check(f, !v || reMail.test(v), T.mail) && ok;
        if (t === 'pick') ok = check(f, !!v, T.pick) && ok;
      });
      if (!ok) { var b = $('.is-bad input,.is-bad select', gf); if (b) b.focus(); return; }
      gf.hidden = true; var dn = $('#grp-done'); dn.hidden = false; dn.setAttribute('tabindex', '-1'); dn.focus();
    });
  }
})();
