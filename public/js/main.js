// ─── THEME ────────────────────────────────────────────────────────
(function () {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
})();

document.addEventListener('DOMContentLoaded', function () {

  // Footer year
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ─── THEME TOGGLE ──────────────────────────────────────────────
  const themeBtn = document.getElementById('theme-toggle');
  const iconSun  = document.getElementById('icon-sun');
  const iconMoon = document.getElementById('icon-moon');

  function updateThemeIcons() {
    const dark = document.documentElement.classList.contains('dark');
    if (iconSun)  iconSun.style.display  = dark ? 'none' : 'block';
    if (iconMoon) iconMoon.style.display = dark ? 'block' : 'none';
  }
  updateThemeIcons();

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      updateThemeIcons();
    });
  }

  // ─── MOBILE MENU ──────────────────────────────────────────────
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu   = document.getElementById('mobile-menu');
  const iconMenuEl   = document.getElementById('icon-menu');
  const iconCloseEl  = document.getElementById('icon-close');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', function () {
      const open = mobileMenu.classList.toggle('open');
      if (iconMenuEl)  iconMenuEl.style.display  = open ? 'none'  : 'block';
      if (iconCloseEl) iconCloseEl.style.display = open ? 'block' : 'none';
    });

    // Close on link click
    document.querySelectorAll('.mobile-link').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('open');
        if (iconMenuEl)  iconMenuEl.style.display  = 'block';
        if (iconCloseEl) iconCloseEl.style.display = 'none';
      });
    });
  }

  // ─── SOLUTION CARDS ───────────────────────────────────────────
  let activeSolution = null;

  document.querySelectorAll('.solution-card').forEach(function (card) {
    card.addEventListener('click', function () {
      const id = card.getAttribute('data-solution');

      if (activeSolution === id) {
        // Toggle off
        activeSolution = null;
        document.getElementById('solution-hint').style.display = 'block';
        document.querySelectorAll('.solution-detail').forEach(function (d) {
          d.classList.remove('open');
        });
        document.querySelectorAll('.solution-card').forEach(function (c) {
          c.style.borderColor = '';
        });
        return;
      }

      activeSolution = id;

      // Highlight active card
      document.querySelectorAll('.solution-card').forEach(function (c) {
        c.style.borderColor = c === card ? 'hsl(var(--foreground) / 0.3)' : '';
      });

      // Show correct panel
      document.getElementById('solution-hint').style.display = 'none';
      document.querySelectorAll('.solution-detail').forEach(function (d) {
        d.classList.remove('open');
      });
      const panel = document.getElementById('detail-' + id);
      if (panel) panel.classList.add('open');
    });
  });

  // ─── PRICING BILLING TOGGLE ───────────────────────────────────
  const monthlyBtn = document.getElementById('billing-monthly');
  const yearlyBtn  = document.getElementById('billing-yearly');

  const prices = {
    monthly: { starter: 149, plus: 299, pro: 599, suffix: '/md' },
    yearly:  { starter: 149 * 10, plus: 299 * 10, pro: 599 * 10, suffix: '/år' },
  };

  function setBilling(mode) {
    const p = prices[mode];
    document.querySelectorAll('.price-starter').forEach(el => el.textContent = p.starter.toLocaleString('da-DK'));
    document.querySelectorAll('.price-plus').forEach(el => el.textContent = p.plus.toLocaleString('da-DK'));
    document.querySelectorAll('.price-pro').forEach(el => el.textContent = p.pro.toLocaleString('da-DK'));
    document.querySelectorAll('.price-suffix').forEach(el => el.textContent = p.suffix);

    if (mode === 'monthly') {
      monthlyBtn.classList.add('bg-foreground', 'text-background');
      monthlyBtn.classList.remove('hover:bg-[hsl(var(--muted))]/30');
      yearlyBtn.classList.remove('bg-foreground', 'text-background');
      yearlyBtn.classList.add('hover:bg-[hsl(var(--muted))]/30');
    } else {
      yearlyBtn.classList.add('bg-foreground', 'text-background');
      yearlyBtn.classList.remove('hover:bg-[hsl(var(--muted))]/30');
      monthlyBtn.classList.remove('bg-foreground', 'text-background');
      monthlyBtn.classList.add('hover:bg-[hsl(var(--muted))]/30');
    }
  }

  if (monthlyBtn) monthlyBtn.addEventListener('click', () => setBilling('monthly'));
  if (yearlyBtn)  yearlyBtn.addEventListener('click',  () => setBilling('yearly'));

  // ─── SCROLL ANIMATIONS ────────────────────────────────────────
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '-60px' });

  document.querySelectorAll('.fade-up').forEach(function (el) {
    observer.observe(el);
  });

});
