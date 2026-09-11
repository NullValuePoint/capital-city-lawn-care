/* Capital City Lawn Care — interactions */
(function () {
  'use strict';

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');

  navToggle.addEventListener('click', function () {
    var open = mainNav.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  mainNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Quote calculator ---------- */
  var PRICES = {
    mowing:   { small: 40,  medium: 55,  large: 75,  per: '/visit', label: 'Mowing & Edging' },
    fert:     { small: 55,  medium: 70,  large: 95,  per: '/visit', label: 'Fertilization & Weed Control' },
    aeration: { small: 120, medium: 160, large: 220, per: 'one-time', label: 'Aeration & Overseeding' },
    cleanup:  { small: 140, medium: 190, large: 260, per: 'one-time', label: 'Seasonal Cleanup' },
    full:     { small: 70,  medium: 90,  large: 120, per: '/visit', label: 'Full Season Package' }
  };

  var FREQ_MULTIPLIER = {
    weekly: 0.9,     // loyalty discount baked in
    biweekly: 1.0,
    monthly: 1.18,   // taller grass, more work
    once: 1.25       // one-time visits cost more
  };

  var FREQ_LABEL = {
    weekly: 'weekly',
    biweekly: 'every two weeks',
    monthly: 'monthly',
    once: 'one-time'
  };

  var SIZE_LABEL = {
    small: 'Small lawn',
    medium: 'Medium lawn',
    large: 'Large lawn'
  };

  var calcService = document.getElementById('calcService');
  var calcSize = document.getElementById('calcSize');
  var calcFreq = document.getElementById('calcFreq');
  var calcPrice = document.getElementById('calcPrice');
  var calcPer = document.getElementById('calcPer');
  var calcNote = document.getElementById('calcNote');

  function isRecurring(service) {
    return service === 'mowing' || service === 'fert' || service === 'full';
  }

  function updateCalc() {
    var service = calcService.value;
    var size = calcSize.value;
    var freq = calcFreq.value;

    // One-time services ignore frequency selection
    var effectiveFreq = isRecurring(service) ? freq : 'once';

    var base = PRICES[service][size];
    var total = Math.round(base * FREQ_MULTIPLIER[effectiveFreq]);

    // Animate the number change
    calcPrice.textContent = '$' + total;
    calcPer.textContent = PRICES[service].per === 'one-time' ? ' one-time' : PRICES[service].per;

    var note = SIZE_LABEL[size] + ', ' + PRICES[service].label.toLowerCase() + ', ' +
      (isRecurring(service) ? FREQ_LABEL[freq] : 'one-time') + '.';
    calcNote.textContent = note.charAt(0).toUpperCase() + note.slice(1);
  }

  [calcService, calcSize, calcFreq].forEach(function (el) {
    el.addEventListener('change', updateCalc);
  });
  updateCalc();

  /* ---------- Testimonial carousel ---------- */
  var track = document.getElementById('carouselTrack');
  var slides = Array.prototype.slice.call(track.querySelectorAll('.testimonial'));
  var dotsWrap = document.getElementById('carouselDots');
  var prevBtn = document.getElementById('carouselPrev');
  var nextBtn = document.getElementById('carouselNext');
  var current = 0;
  var timer = null;

  slides.forEach(function (_, i) {
    var dot = document.createElement('button');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', 'Show review ' + (i + 1));
    dot.addEventListener('click', function () { goTo(i); restartAuto(); });
    dotsWrap.appendChild(dot);
  });
  var dots = Array.prototype.slice.call(dotsWrap.querySelectorAll('button'));

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach(function (s, idx) { s.classList.toggle('active', idx === current); });
    dots.forEach(function (d, idx) { d.classList.toggle('active', idx === current); });
  }

  function restartAuto() {
    if (timer) clearInterval(timer);
    timer = setInterval(function () { goTo(current + 1); }, 6000);
  }

  prevBtn.addEventListener('click', function () { goTo(current - 1); restartAuto(); });
  nextBtn.addEventListener('click', function () { goTo(current + 1); restartAuto(); });

  // Pause auto-advance while hovering the carousel
  document.getElementById('testimonialCarousel').addEventListener('mouseenter', function () {
    if (timer) clearInterval(timer);
  });
  document.getElementById('testimonialCarousel').addEventListener('mouseleave', restartAuto);

  goTo(0);
  restartAuto();

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');

      // Close all others (single-open accordion)
      document.querySelectorAll('.faq-item.open').forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.faq-answer').style.maxHeight = null;
        other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- Quote form validation ---------- */
  var form = document.getElementById('quoteForm');
  var success = document.getElementById('formSuccess');

  function setInvalid(input, errId, bad) {
    var field = input.closest('.form-field');
    field.classList.toggle('invalid', bad);
    input.setAttribute('aria-invalid', bad ? 'true' : 'false');
    return !bad;
  }

  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validPhone(v) { return v.replace(/\D/g, '').length >= 10; }

  ['fName', 'fPhone', 'fEmail', 'fAddress'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', function (e) {
      e.target.closest('.form-field').classList.remove('invalid');
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = document.getElementById('fName');
    var phone = document.getElementById('fPhone');
    var email = document.getElementById('fEmail');
    var address = document.getElementById('fAddress');

    var ok = true;
    ok = setInvalid(name, 'errName', name.value.trim().length < 2) && ok;
    ok = setInvalid(phone, 'errPhone', !validPhone(phone.value)) && ok;
    ok = setInvalid(email, 'errEmail', !validEmail(email.value.trim())) && ok;
    ok = setInvalid(address, 'errAddress', address.value.trim().length < 5) && ok;

    if (!ok) {
      var firstBad = form.querySelector('.form-field.invalid input');
      if (firstBad) firstBad.focus();
      return;
    }

    // Demo: simulate a successful submission
    success.classList.add('show');
    form.querySelector('button[type="submit"]').textContent = 'Request Sent ✓';
    form.querySelectorAll('input, select, textarea').forEach(function (el) { el.disabled = true; });
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.service-card, .step, .price-card, .calc-card, .areas-card');
  revealEls.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
