// MEDLENS - NAVBAR, BRAND LOGO & SHARED DASHBOARD SHELL

import { escapeHtml, DEMO_REPORTS } from '../data/mockData.js';

export function createBrandLogoHtml() {
  return `
    <div class="brand-logo" onclick="window.MedLensApp.navigateTo('landing')">
      <div class="logo-icon">
        <i data-lucide="activity" style="width:20px;height:20px;"></i>
      </div>
      <span class="logo-text">
        <span class="med">Med</span><span class="lens">Lens</span>
      </span>
    </div>
  `;
}

export function renderDashboardSidebarHtml(activeNav = 'dashboard') {
  return `
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <aside class="dashboard-sidebar" id="dashboard-sidebar" aria-label="Main Desktop Navigation">
      <div class="sidebar-header">
        ${createBrandLogoHtml()}
        <button class="sidebar-close-btn" id="sidebar-close-btn" title="Close Menu" aria-label="Close Menu">
          <i data-lucide="x" style="width:20px;height:20px;"></i>
        </button>
      </div>

      <div class="sidebar-nav">
        <ul class="sidebar-menu">
          <li>
            <a class="sidebar-item ${activeNav === 'landing' ? 'active' : ''}" href="#landing" data-nav="landing" id="sidebar-home-btn" title="Landing Page">
              <i data-lucide="home" class="sidebar-icon"></i>
              <span>Landing Page</span>
            </a>
          </li>
          <li>
            <a class="sidebar-item ${activeNav === 'dashboard' ? 'active' : ''}" href="#dashboard" data-nav="dashboard">
              <i data-lucide="layout-dashboard" class="sidebar-icon"></i>
              <span>Home</span>
            </a>
          </li>
          <li>
            <a class="sidebar-item ${activeNav === 'reports' ? 'active' : ''}" href="#reports" data-nav="reports">
              <i data-lucide="folder" class="sidebar-icon"></i>
              <span>Reports</span>
            </a>
          </li>
          <li>
            <a class="sidebar-item ${activeNav === 'history' ? 'active' : ''}" href="#history" data-nav="history">
              <i data-lucide="clock" class="sidebar-icon"></i>
              <span>Health Timeline</span>
            </a>
          </li>
          <li>
            <a class="sidebar-item ${activeNav === 'trends' ? 'active' : ''}" href="#trends" data-nav="trends">
              <i data-lucide="trending-up" class="sidebar-icon"></i>
              <span>Health Trends</span>
            </a>
          </li>
          <li>
            <a class="sidebar-item ${activeNav === 'profile' ? 'active' : ''}" href="#profile" data-nav="profile">
              <i data-lucide="user" class="sidebar-icon"></i>
              <span>Profile</span>
            </a>
          </li>
          <li>
            <a class="sidebar-item ${activeNav === 'settings' ? 'active' : ''}" href="#settings" data-nav="settings">
              <i data-lucide="settings" class="sidebar-icon"></i>
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="sidebar-footer">
        <button class="sidebar-logout-btn" id="sidebar-logout-btn">
          <i data-lucide="log-out" class="sidebar-icon"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  `;
}

export function renderDashboardTopbarHtml(titleText, subtitleText, userProfile = {}) {
  const safeName = escapeHtml(userProfile.fullName || 'Anshika Sharma');
  const safeBlood = escapeHtml(userProfile.bloodGroup || 'O+');
  const safeAvatar = escapeHtml(userProfile.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250');
  return `
    <header class="dashboard-topbar">
      <div class="topbar-left">
        <button class="mobile-sidebar-toggle" id="mobile-sidebar-toggle" aria-label="Toggle Menu" title="Open Navigation Menu">
          <i data-lucide="menu" style="width:24px;height:24px;"></i>
        </button>
        <div class="topbar-breadcrumb">
          <span class="breadcrumb-active">${escapeHtml(titleText)}</span>
          <span class="breadcrumb-sub">${escapeHtml(subtitleText)}</span>
        </div>
      </div>

      <div class="topbar-right">
        <div class="icon-btn-badge" id="dash-home-icon-btn" title="Landing Page" aria-label="Open Landing Page" onclick="window.MedLensApp.navigateTo('landing')">
          <i data-lucide="home" style="width:18px;height:18px;"></i>
        </div>

        <div class="icon-btn-badge" id="dash-notifications-btn" title="Notifications">
          <i data-lucide="bell" style="width:18px;height:18px;"></i>
          <span class="notification-dot"></span>
        </div>

        <div class="user-profile-menu" id="dash-topbar-profile" onclick="window.MedLensApp.navigateTo('profile')">
          <img src="${safeAvatar}" alt="Avatar" class="avatar-img">
          <div class="user-info-text">
            <span class="user-info-name">${safeName}</span>
            <span class="user-info-role">Blood Group: ${safeBlood}</span>
          </div>
        </div>
      </div>
    </header>
  `;
}

export function bindDashboardShellEvents(containerEl) {
  const sidebar = containerEl.querySelector('#dashboard-sidebar');
  const overlay = containerEl.querySelector('#sidebar-overlay');
  const toggleBtn = containerEl.querySelector('#mobile-sidebar-toggle');
  const closeBtn = containerEl.querySelector('#sidebar-close-btn');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('active');
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  containerEl.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      closeSidebar();
      const navTarget = item.getAttribute('data-nav');
      if (navTarget === 'trends') {
        window.MedLensApp.openModal('view-trends');
      } else if (navTarget === 'settings') {
        window.MedLensApp.openModal('settings');
      } else if (navTarget) {
        window.MedLensApp.navigateTo(navTarget);
      }
    });
  });

  const logoutBtn = containerEl.querySelector('#sidebar-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      closeSidebar();
      window.MedLensApp.logout();
    });
  }

  const notifBtn = containerEl.querySelector('#dash-notifications-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => window.MedLensApp.openModal('notifications'));
  }
}

export function openReportViewerModal(rep) {
  if (!rep) return;
  const tabKey = rep.demoTabKey || (
    rep.id === 'rep-101' ? 'Blood Sugar' :
    rep.id === 'rep-102' ? 'CBC' :
    rep.id === 'rep-103' ? 'Liver' :
    rep.id === 'rep-104' ? 'Kidney' : null
  );
  if (rep.isUploaded || !tabKey || !DEMO_REPORTS[tabKey]) {
    window.MedLensApp.openModal('report-unrecognized', rep);
    return;
  }
  const demoData = {
    ...DEMO_REPORTS[tabKey],
    fileName: rep.fileName || rep.name,
    isSample: true
  };
  window.MedLensApp.openModal('report-details', demoData);
}

export function renderNavbar(containerEl) {
  containerEl.innerHTML = `
    <nav class="navbar" id="main-navbar">
      <div class="container">
        <div class="navbar-container">
          ${createBrandLogoHtml()}
          
          <ul class="nav-links">
            <li><a class="nav-link active" data-scroll="hero">Landing Page</a></li>
            <li><a class="nav-link" data-scroll="features">Features</a></li>
            <li><a class="nav-link" data-scroll="how-it-works">How It Works</a></li>
            <li><a class="nav-link" data-scroll="interactive-demo">Interactive Demo</a></li>
          </ul>

          <div class="nav-actions">
            <button class="btn btn-secondary btn-sm" id="nav-signin-btn">Sign In</button>
            <button class="btn btn-primary btn-sm" id="nav-getstarted-btn">Get Started</button>
          </div>

          <button class="mobile-toggle" id="mobile-toggle-btn" aria-label="Toggle navigation">
            <i data-lucide="menu"></i>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Navigation Drawer -->
    <div class="drawer-overlay" id="drawer-overlay"></div>
    <div class="mobile-drawer" id="mobile-drawer">
      <div class="mobile-drawer-header">
        ${createBrandLogoHtml()}
        <button id="drawer-close-btn" style="color:var(--color-text-secondary); padding:0.4rem;" aria-label="Close menu">
          <i data-lucide="x"></i>
        </button>
      </div>
      <ul class="mobile-drawer-links">
        <li><a class="nav-link drawer-link active" data-scroll="hero">Landing Page</a></li>
        <li><a class="nav-link drawer-link" data-scroll="features">Features</a></li>
        <li><a class="nav-link drawer-link" data-scroll="how-it-works">How It Works</a></li>
        <li><a class="nav-link drawer-link" data-scroll="interactive-demo">Interactive Demo</a></li>
      </ul>
      <div style="margin-top:auto; display:flex; flex-direction:column; gap:0.75rem;">
        <button class="btn btn-secondary btn-full" id="drawer-signin-btn">Sign In</button>
        <button class="btn btn-primary btn-full" id="drawer-getstarted-btn">Get Started</button>
      </div>
    </div>
  `;

  const navSignIn = containerEl.querySelector('#nav-signin-btn');
  const navGetStarted = containerEl.querySelector('#nav-getstarted-btn');
  const drawerSignIn = containerEl.querySelector('#drawer-signin-btn');
  const drawerGetStarted = containerEl.querySelector('#drawer-getstarted-btn');

  const goToAuth = () => {
    closeMobileDrawer();
    window.MedLensApp.navigateTo('auth');
  };

  if (navSignIn) navSignIn.addEventListener('click', goToAuth);
  if (navGetStarted) navGetStarted.addEventListener('click', goToAuth);
  if (drawerSignIn) drawerSignIn.addEventListener('click', goToAuth);
  if (drawerGetStarted) drawerGetStarted.addEventListener('click', goToAuth);

  const mobileToggle = containerEl.querySelector('#mobile-toggle-btn');
  const drawerClose = containerEl.querySelector('#drawer-close-btn');
  const drawerOverlay = containerEl.querySelector('#drawer-overlay');
  const mobileDrawer = containerEl.querySelector('#mobile-drawer');

  function openMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('active');
  }

  function closeMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (drawerOverlay) drawerOverlay.classList.remove('active');
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openMobileDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeMobileDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeMobileDrawer);

  function scrollToTarget(targetId) {
    closeMobileDrawer();
    if (window.MedLensApp.currentPage !== 'landing') {
      window.MedLensApp.navigateTo('landing');
      setTimeout(() => performScroll(targetId), 150);
    } else {
      performScroll(targetId);
    }
  }

  function performScroll(targetId) {
    if (targetId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const targetEl = document.getElementById(targetId) || document.getElementById('demo');
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  containerEl.querySelectorAll('[data-scroll]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = e.currentTarget.getAttribute('data-scroll');
      scrollToTarget(targetId);

      containerEl.querySelectorAll('[data-scroll]').forEach(l => l.classList.remove('active'));
      containerEl.querySelectorAll(`[data-scroll="${targetId}"]`).forEach(l => l.classList.add('active'));
    });
  });

  const scrollElevationHandler = () => {
    const navbar = document.getElementById('main-navbar');
    if (navbar) {
      if (window.scrollY > 15) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  };
  window.removeEventListener('scroll', scrollElevationHandler);
  window.addEventListener('scroll', scrollElevationHandler);

  const sectionsToObserve = ['hero', 'features', 'how-it-works', 'interactive-demo'];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        containerEl.querySelectorAll('[data-scroll]').forEach(l => l.classList.remove('active'));
        containerEl.querySelectorAll(`[data-scroll="${id}"]`).forEach(l => l.classList.add('active'));
      }
    });
  }, {
    root: null,
    rootMargin: '-80px 0px -50% 0px',
    threshold: 0.15
  });

  setTimeout(() => {
    sectionsToObserve.forEach(secId => {
      const secEl = document.getElementById(secId) || document.getElementById('demo');
      if (secEl) observer.observe(secEl);
    });
  }, 300);

  if (window.lucide) window.lucide.createIcons();
}
