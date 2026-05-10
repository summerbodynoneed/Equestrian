/* ============================================================
   EQUESTRIAN WORLD TOUR — script.js
   Modules :
     1. Navigation fluide + état actif
     2. Scroll reveal (Intersection Observer)
     3. Cheval animé — position synchronisée sur la barre
     4. Formulaire de contact
     5. Parallaxe légère sur les blobs
   ============================================================ */

'use strict';

/* ────────────────────────────────────────────
   UTILITAIRE — attendre que le DOM soit prêt
   ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  initNav();
  initScrollReveal();
  initHorseProgress();
  initContactForm();
  initBlobParallax();

});


/* ────────────────────────────────────────────
   1. NAVIGATION — scroll fluide + lien actif
   ──────────────────────────────────────────── */
function initNav() {
  /* Scroll fluide sur les ancres */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* Mettre en surbrillance le lien nav de la section visible */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.style.color = link.getAttribute('href') === `#${id}`
            ? 'var(--cream)'
            : '';
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));

  /* Fond nav opaque après défilement */
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.style.background = 'rgba(14, 13, 23, 0.97)';
      nav.style.backdropFilter = 'blur(12px)';
    } else {
      nav.style.background = '';
      nav.style.backdropFilter = '';
    }
  }, { passive: true });
}


/* ────────────────────────────────────────────
   3. SCROLL REVEAL
   Anime les éléments .reveal au défilement
   ──────────────────────────────────────────── */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        /* Délai en cascade : chaque élément visible décalé de 80ms */
        setTimeout(
          () => entry.target.classList.add('visible'),
          i * 80
        );
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
}


/* ────────────────────────────────────────────
   4. CHEVAL — synchronisation avec la barre
   Le cheval se positionne exactement à la fin
   de la barre de progression.
   ──────────────────────────────────────────── */
function initHorseProgress() {
  const bar     = document.getElementById('progressFill');
  const wrapper = document.getElementById('horseWrapper');
  const track   = document.querySelector('.progress-bar-track');

  if (!bar || !wrapper || !track) return;

  /* Position initiale au chargement et à chaque resize */
  function syncHorse() {
    const trackRect  = track.getBoundingClientRect();
    const barWidth   = bar.offsetWidth;
    const trackLeft  = track.offsetLeft;

    /* Le cheval se centre sur la fin de la barre */
    const horseCenter = trackLeft + barWidth;
    wrapper.style.left = horseCenter + 'px';
  }

  syncHorse();
  window.addEventListener('resize', syncHorse, { passive: true });

  /* Animation d'entrée : la barre s'anime de 0% à sa valeur cible */
  const targetWidth = bar.style.width || '40%';
  bar.style.width = '0%';
  bar.style.transition = 'width 1.6s cubic-bezier(0.22, 1, 0.36, 1)';

  /* Déclencher l'animation quand la section est visible */
  const progressSection = document.getElementById('progress');
  if (!progressSection) return;

  const progressObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        /* Légère pause pour que la section soit bien visible */
        setTimeout(() => {
          bar.style.width = targetWidth;
          /* Resynchroniser le cheval à chaque frame pendant l'animation */
          const duration = 1600;
          const start = performance.now();
          (function animateHorse(now) {
            syncHorse();
            if (now - start < duration) requestAnimationFrame(animateHorse);
          })(performance.now());
        }, 300);
        progressObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  progressObserver.observe(progressSection);
}


/* ────────────────────────────────────────────
   5. FORMULAIRE DE CONTACT
   Validation légère + état de succès
   ──────────────────────────────────────────── */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  if (!form || !success) return;

  /* Validation champ par champ au blur */
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      /* Effacer l'erreur dès que l'utilisateur retape */
      field.style.borderColor = '';
    });
  });

  /* Soumission */
  form.addEventListener('submit', e => {
    e.preventDefault();

    /* Valider tous les champs */
    let valid = true;
    form.querySelectorAll('input, select, textarea').forEach(field => {
      if (!validateField(field)) valid = false;
    });

    if (!valid) return;

    /* Simuler un envoi (remplacer par fetch() vers votre backend) */
    const btn = form.querySelector('.btn');
    btn.textContent = 'Envoi en cours…';
    btn.disabled = true;

    setTimeout(() => {
      form.style.opacity = '0';
      form.style.transition = 'opacity 0.4s ease';
      setTimeout(() => {
        form.style.display = 'none';
        success.classList.add('show');
      }, 400);
    }, 800);
  });
}

/* Retourne true si le champ est valide */
function validateField(field) {
  const value = field.value.trim();
  let ok = true;

  if (field.required || field.type === 'email' || field.tagName === 'TEXTAREA') {
    if (!value) ok = false;
  }
  if (field.type === 'email' && value) {
    ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  field.style.borderColor = ok ? '' : 'rgba(230, 57, 70, 0.8)';
  field.style.background  = ok ? '' : 'rgba(192, 57, 43, 0.08)';
  return ok;
}


/* ────────────────────────────────────────────
   6. PARALLAXE LÉGÈRE SUR LES BLOBS
   Les blobs bougent légèrement avec la souris
   pour donner de la profondeur
   ──────────────────────────────────────────── */
function initBlobParallax() {
  const blobs = document.querySelectorAll('.blob');
  if (!blobs.length) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  document.addEventListener('mousemove', e => {
    /* Normaliser : -1 à +1 depuis le centre de l'écran */
    targetX = (e.clientX / window.innerWidth  - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  (function animBlobs() {
    /* Inertie douce */
    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;

    blobs.forEach((blob, i) => {
      /* Chaque blob bouge d'une amplitude différente */
      const depth = (i % 3 + 1) * 12;
      const tx = currentX * depth;
      const ty = currentY * depth;
      blob.style.transform = `translate(${tx}px, ${ty}px)`;
    });

    requestAnimationFrame(animBlobs);
  })();
}