/* ============================================
   Jiufu Packaging - Main JavaScript
   ============================================ */

// ============================================
// Language Management
// ============================================
const STORAGE_KEY_LANG = 'jiufu_lang';

function getLang() {
  const stored = localStorage.getItem(STORAGE_KEY_LANG);
  if (stored === 'en' || stored === 'zh') return stored;
  const browserLang = navigator.language || navigator.userLanguage;
  return browserLang.startsWith('zh') ? 'zh' : 'en';
}

function setLang(lang) {
  localStorage.setItem(STORAGE_KEY_LANG, lang);
  applyLang(lang);
  updateLangButtons(lang);
  updateHTMLLang(lang);
}

function applyLang(lang) {
  // Update all [data-i18n] elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (LANG[lang] && LANG[lang][key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = LANG[lang][key];
      } else {
        el.textContent = LANG[lang][key];
      }
    }
  });

  // Update all [data-i18n-attr] elements
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    const parts = el.dataset.i18nAttr.split(':');
    const attr = parts[0];
    const key = parts[1];
    if (LANG[lang] && LANG[lang][key]) {
      el.setAttribute(attr, LANG[lang][key]);
    }
  });

  // Update language visibility blocks — only target explicit data-lang-* containers
  document.querySelectorAll('[data-lang-block], [data-lang-inline], [data-lang-flex], [data-lang-grid]').forEach(el => {
    if (el.dataset.langBlock === lang || el.dataset.langInline === lang ||
        el.dataset.langFlex === lang || el.dataset.langGrid === lang) {
      const display = el.dataset.langBlock ? 'block' :
                      el.dataset.langInline ? 'inline' :
                      el.dataset.langFlex ? 'flex' :
                      el.dataset.langGrid ? 'grid' : '';
      el.style.display = display;
      el.classList.add('active');
    } else {
      el.style.display = 'none';
      el.classList.remove('active');
    }
  });

  // Dispatch event for other scripts
  document.dispatchEvent(new CustomEvent('langChange', { detail: { lang } }));
}

function updateLangButtons(lang) {
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

function updateHTMLLang(lang) {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = LANG[lang].site_title || document.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = LANG[lang].site_desc || metaDesc.content;
}

// ============================================
// Mobile Menu
// ============================================
function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
    }
  });
}

// ============================================
// Active Nav Link
// ============================================
function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ============================================
// FAQ Accordion
// ============================================
function initFAQ() {
  document.querySelectorAll('.faq-item .faq-q').forEach(q => {
    q.addEventListener('click', () => {
      q.parentElement.classList.toggle('open');
    });
  });
}

// ============================================
// Contact Form (Demo)
// ============================================
function initContactForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form || !success) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // In production, send to backend API
    form.style.display = 'none';
    success.classList.add('show');
  });
}

// ============================================
// Quote Form (Multi-step)
// ============================================
function initQuoteForm() {
  const sections = document.querySelectorAll('.quote-form .form-section');
  const prevBtn = document.getElementById('quotePrev');
  const nextBtn = document.getElementById('quoteNext');
  const submitBtn = document.getElementById('quoteSubmit');
  const form = document.getElementById('quoteForm');
  const success = document.getElementById('quoteSuccess');
  const dots = document.querySelectorAll('.quote-form .steps-indicator .dot');

  if (sections.length === 0) return;

  let currentStep = 0;

  function showStep(step) {
    sections.forEach((s, i) => s.classList.toggle('active', i === step));
    dots.forEach((d, i) => d.classList.toggle('active', i === step));
    if (prevBtn) prevBtn.style.visibility = step === 0 ? 'hidden' : 'visible';
    if (nextBtn) nextBtn.style.display = step === sections.length - 1 ? 'none' : 'inline-flex';
    if (submitBtn) submitBtn.style.display = step === sections.length - 1 ? 'inline-flex' : 'none';
    currentStep = step;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => {
    if (currentStep > 0) showStep(currentStep - 1);
  });

  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (currentStep < sections.length - 1) showStep(currentStep + 1);
  });

  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.style.display = 'none';
    if (success) success.classList.add('show');
  });

  showStep(0);
}

// ============================================
// Product Category Filter
// ============================================
function initProductFilter() {
  const filterBtns = document.querySelectorAll('.category-filter button');
  const cards = document.querySelectorAll('.product-card');

  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const category = btn.dataset.category;

      cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
          card.style.display = '';
          card.classList.add('animate');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ============================================
// Smooth Scroll Anchor Links
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ============================================
// Scroll Animation (fade in elements)
// ============================================
function initScrollAnimation() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.product-card, .feature-card, .blog-card, .process-step, .cert-item').forEach(el => {
    observer.observe(el);
  });
}

// ============================================
// Initialize Everything
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  const lang = getLang();
  applyLang(lang);
  updateLangButtons(lang);
  updateHTMLLang(lang);

  initMobileMenu();
  setActiveNav();
  initFAQ();
  initContactForm();
  initQuoteForm();
  initProductFilter();
  initSmoothScroll();
  initScrollAnimation();

  // Language switch buttons
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', () => {
      setLang(btn.dataset.lang);
    });
  });
});
