/* ================================================================
   NEXTLEVEL FITNESS – main.js
   Handles: mobile nav, sticky header, stat counter animation,
            scroll reveal, enquiry form validation
   ================================================================ */

'use strict';

// ---- MOBILE NAV ----
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.toggle('is-open');
    mobileNav.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileNav.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close on nav link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('is-open');
      mobileNav.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });
}

// ---- STICKY HEADER ----
const header = document.getElementById('header');
if (header) {
  const THRESHOLD = 60;
  const update = () => {
    header.style.background = window.scrollY > THRESHOLD
      ? 'rgba(13,13,13,0.97)'
      : 'rgba(13,13,13,0.9)';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ---- STAT COUNTER ANIMATION ----
const animateCounts = () => {
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
};

// Trigger counter once stats section is visible
const statsSection = document.querySelector('.stats');
if (statsSection) {
  let counted = false;
  const statsObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !counted) {
      counted = true;
      animateCounts();
      statsObserver.disconnect();
    }
  }, { threshold: 0.4 });
  statsObserver.observe(statsSection);
}

// ---- SCROLL REVEAL ----
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// Apply reveal class dynamically to key elements
const revealSelectors = [
  '.section-headline',
  '.section-eyebrow',
  '.about__text',
  '.about__location',
  '.feature-card',
  '.program-card',
  '.contact__text',
  '.contact__details',
  '.contact__form-wrap',
];
revealSelectors.forEach(sel => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${i * 0.07}s`;
    revealObserver.observe(el);
  });
});

// ---- ENQUIRY FORM ----
const form = document.getElementById('enquiryForm');
const successMsg = document.getElementById('formSuccess');

if (form) {
  const nameInput  = form.querySelector('#name');
  const phoneInput = form.querySelector('#phone');
  const nameError  = document.getElementById('nameError');
  const phoneError = document.getElementById('phoneError');

  const validate = () => {
    let ok = true;

    // Name
    if (!nameInput.value.trim()) {
      nameError.textContent = 'Please enter your name.';
      nameInput.classList.add('is-error');
      ok = false;
    } else {
      nameError.textContent = '';
      nameInput.classList.remove('is-error');
    }

    // Phone – 10+ digits
    const digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length < 10) {
      phoneError.textContent = 'Please enter a valid 10-digit phone number.';
      phoneInput.classList.add('is-error');
      ok = false;
    } else {
      phoneError.textContent = '';
      phoneInput.classList.remove('is-error');
    }

    return ok;
  };

  // Live validation feedback
  [nameInput, phoneInput].forEach(input => {
    input.addEventListener('input', validate);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Compose a WhatsApp message with form data
    const name    = nameInput.value.trim();
    const phone   = phoneInput.value.trim();
    const program = form.querySelector('#program').value;
    const message = form.querySelector('#message').value.trim();

    const programLabel = form.querySelector('#program').selectedOptions[0].text;
    const wa = `Hi, I'm ${name} (${phone}). I'm interested in: ${program ? programLabel : 'General Membership'}${message ? '. ' + message : ''}`;

    // Show success state
    const submitBtn = form.querySelector('.form-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    // Simulate a brief delay then show success + redirect to WA
    setTimeout(() => {
      if (successMsg) {
        successMsg.hidden = false;
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      submitBtn.style.display = 'none';
      form.querySelector('.form-note').style.display = 'none';
      // Open WhatsApp
      window.open(
        `https://wa.me/918125092295?text=${encodeURIComponent(wa)}`,
        '_blank',
        'noopener,noreferrer'
      );
    }, 600);
  });
}

// ---- TRAINER CAROUSEL ----
const trainerTrack = document.getElementById('trainerTrack');
const trainerPrev  = document.getElementById('trainerPrev');
const trainerNext  = document.getElementById('trainerNext');
const trainerDots  = document.getElementById('trainerDots');

if (trainerTrack) {
  const slides = Array.from(trainerTrack.querySelectorAll('.trainer-slide'));
  let current = 0;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'trainer-dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', `Go to trainer ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    trainerDots.appendChild(dot);
  });

  const dots = Array.from(trainerDots.querySelectorAll('.trainer-dot'));

  const goTo = (index) => {
    current = index;
    trainerTrack.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    trainerPrev.disabled = current === 0;
    trainerNext.disabled = current === slides.length - 1;
  };

  trainerPrev.addEventListener('click', () => goTo(current - 1));
  trainerNext.addEventListener('click', () => goTo(current + 1));

  // Swipe support on mobile
  let touchStartX = 0;
  trainerTrack.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  trainerTrack.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? Math.min(current + 1, slides.length - 1) : Math.max(current - 1, 0));
  });

  goTo(0); // init
}

// ---- SMOOTH SCROLL for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '68', 10);
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
