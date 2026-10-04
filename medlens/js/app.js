// MEDLENS - MAIN APPLICATION ROUTER & STATE ENGINE

import { renderLandingPage } from './components/landing.js';
import { renderAuthPage } from './components/auth.js';
import { renderOnboardingPage } from './components/onboarding.js';
import { renderDashboardHomePage } from './components/dashboardHome.js';
import { renderReportsPage } from './components/reports.js';
import { renderHistoryPage } from './components/history.js';
import { renderProfilePage } from './components/profile.js';
import { renderAnalysisPlaceholderPage } from './components/analysisPlaceholder.js';
import { renderModalContent } from './components/modals.js';
import { INITIAL_USER_STATE, INITIAL_USER_PROFILE, DEMO_REPORTS, escapeHtml, sanitizePlainText } from './data/mockData.js';

class MedLensAppEngine {
  constructor() {
    this.appContainer = document.getElementById('app');
    this.toastContainer = document.getElementById('toast-container');
    this.modalOverlay = document.getElementById('modal-container');
    this.lastFocusedElement = null;
    
    // Auth State
    const storedAuth = localStorage.getItem('medlens_auth');
    this.isAuthenticated = storedAuth === 'true';

    // User Details State (CRITICAL: PRESERVE EXISTING USER PROFILE!)
    const storedUser = localStorage.getItem('medlens_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && typeof parsed.fullName === 'string' && /<[^>]+>/.test(parsed.fullName)) {
          parsed.fullName = sanitizePlainText(parsed.fullName) || 'Patient';
          localStorage.setItem('medlens_user', JSON.stringify(parsed));
        }
        this.userDetails = parsed;
      } catch (e) {
        this.userDetails = { ...INITIAL_USER_PROFILE };
      }
    } else {
      this.userDetails = { ...INITIAL_USER_PROFILE };
    }

    // Register active user in per-user database if not already present
    const usersDb = this.getUsersDb();
    if (this.userDetails && this.userDetails.email) {
      const normEmail = this.normalizeEmail(this.userDetails.email);
      if (!usersDb[normEmail]) {
        const wasCompleted = localStorage.getItem('medlens_profile_completed') === 'true' || !!(this.userDetails.dob && this.userDetails.bloodGroup);
        usersDb[normEmail] = {
          ...this.userDetails,
          onboardingCompleted: wasCompleted
        };
        this.saveUsersDb(usersDb);
      } else if (usersDb[normEmail].fullName && /<[^>]+>/.test(usersDb[normEmail].fullName)) {
        usersDb[normEmail].fullName = sanitizePlainText(usersDb[normEmail].fullName) || 'Patient';
        this.saveUsersDb(usersDb);
      }
    }

    // Profile Completed State (User-Specific)
    this.profileCompleted = this.isUserOnboardingCompleted(this.userDetails ? this.userDetails.email : null);
    localStorage.setItem('medlens_profile_completed', this.profileCompleted ? 'true' : 'false');

    // Reports Array State
    const storedReports = localStorage.getItem('medlens_reports');
    this.reportsList = storedReports ? JSON.parse(storedReports) : INITIAL_USER_STATE.reports;

    // Analysis History State
    const storedHistory = localStorage.getItem('medlens_history');
    this.analysisHistory = storedHistory ? JSON.parse(storedHistory) : INITIAL_USER_STATE.analysisHistory;

    // Sync any uploaded reports in reportsList into analysisHistory if not already present (Requirement 7)
    if (Array.isArray(this.reportsList) && Array.isArray(this.analysisHistory)) {
      let reportsUpdated = false;
      this.reportsList.forEach(rep => {
        if (rep && !rep.demoTabKey && !rep.isUploaded) {
          if (rep.id === 'rep-101') { rep.demoTabKey = 'Blood Sugar'; reportsUpdated = true; }
          else if (rep.id === 'rep-102') { rep.demoTabKey = 'CBC'; reportsUpdated = true; }
          else if (rep.id === 'rep-103') { rep.demoTabKey = 'Liver'; reportsUpdated = true; }
          else if (rep.id === 'rep-104') { rep.demoTabKey = 'Kidney'; reportsUpdated = true; }
        }
      });
      if (reportsUpdated) {
        localStorage.setItem('medlens_reports', JSON.stringify(this.reportsList));
      }

      let historyUpdated = false;
      this.analysisHistory.forEach(his => {
        if (!his.demoTabKey) {
          if (his.id === 'his-201') { his.demoTabKey = 'CBC'; historyUpdated = true; }
          else if (his.id === 'his-202') { his.demoTabKey = 'Blood Sugar'; historyUpdated = true; }
          else if (his.id === 'his-203') { his.demoTabKey = 'Liver'; historyUpdated = true; }
        }
      });

      for (let i = this.reportsList.length - 1; i >= 0; i--) {
        const rep = this.reportsList[i];
        if (rep && rep.isUploaded) {
          const exists = this.analysisHistory.some(h =>
            (rep.id && h.reportId === rep.id) ||
            (rep.fileName && (h.fileName === rep.fileName || h.title === rep.fileName || h.name === rep.fileName || h.title === rep.name))
          );
          if (!exists) {
            this.analysisHistory.unshift({
              id: 'his-sync-' + (rep.id || Date.now() + '-' + i),
              reportId: rep.id,
              fileName: rep.fileName || rep.name || 'Uploaded_Report.pdf',
              title: rep.name || rep.fileName || 'Uploaded Report',
              name: rep.fileName || rep.name || 'Uploaded Report',
              reportType: rep.reportType || 'Uploaded Document (Unverified)',
              date: rep.uploadDate || rep.date || '',
              status: rep.status || 'Unable to Analyze',
              isUploaded: true,
              demoTabKey: null,
              summary: 'Report uploaded and stored in Report Locker. Analysis unavailable — no valid medical parameters found.'
            });
            historyUpdated = true;
          }
        }
      }
      if (historyUpdated) {
        localStorage.setItem('medlens_history', JSON.stringify(this.analysisHistory));
      }
    }

    // Active Route
    this.currentPage = 'landing';
  }

  normalizeEmail(email) {
    return (email || '').toLowerCase().trim();
  }

  getUsersDb() {
    const storedDb = localStorage.getItem('medlens_users_db');
    if (storedDb) {
      try {
        return JSON.parse(storedDb) || {};
      } catch (e) {
        return {};
      }
    }
    return {};
  }

  saveUsersDb(db) {
    try {
      localStorage.setItem('medlens_users_db', JSON.stringify(db));
    } catch (e) {
      console.error('Error saving usersDb', e);
    }
  }

  validateLoginCredentials(email, password) {
    const normEmail = this.normalizeEmail(email);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normEmail || !emailRegex.test(normEmail)) {
      return { valid: false, field: 'email', message: 'Please enter a valid email address.' };
    }

    if (!password || String(password).length < 6) {
      return { valid: false, field: 'password', message: 'Invalid email or password. Password must be at least 6 characters.' };
    }

    const usersDb = this.getUsersDb();
    const activeUserEmail = this.userDetails ? this.normalizeEmail(this.userDetails.email) : '';
    const matchedRecord = usersDb[normEmail] || (activeUserEmail === normEmail ? this.userDetails : null);

    if (!matchedRecord) {
      return {
        valid: false,
        field: 'email',
        message: 'Invalid email or password. No registered account found for this email.'
      };
    }

    if (matchedRecord.password && matchedRecord.password !== password) {
      return {
        valid: false,
        field: 'password',
        message: 'Invalid email or password. Please check your credentials.'
      };
    }

    return { valid: true };
  }

  isUserOnboardingCompleted(email) {
    const normEmail = this.normalizeEmail(email);
    if (normEmail) {
      const usersDb = this.getUsersDb();
      if (usersDb[normEmail] && typeof usersDb[normEmail].onboardingCompleted === 'boolean') {
        return usersDb[normEmail].onboardingCompleted;
      }
    }

    if (this.userDetails) {
      const activeNorm = this.normalizeEmail(this.userDetails.email);
      if (!normEmail || activeNorm === normEmail) {
        if (typeof this.userDetails.onboardingCompleted === 'boolean') {
          return this.userDetails.onboardingCompleted;
        }
        if (this.userDetails.dob && this.userDetails.bloodGroup) {
          return true;
        }
      }
    }

    return false;
  }

  init() {
    window.MedLensApp = this;

    window.addEventListener('hashchange', () => {
      this.handleRouteFromHash();
    });

    this.handleRouteFromHash();

    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) {
          this.closeModal();
        }
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  handleRouteFromHash() {
    const rawHash = window.location.hash.replace('#', '').replace('/', '');
    let route = 'landing';
    
    if (['auth', 'onboarding', 'dashboard', 'home', 'reports', 'history', 'profile', 'analysis'].includes(rawHash)) {
      route = rawHash === 'home' ? 'dashboard' : rawHash;
    } else if (['hero', 'features', 'how-it-works', 'interactive-demo', 'demo'].includes(rawHash)) {
      route = rawHash;
    } else {
      route = 'landing';
    }

    this.navigateTo(route);
  }

  navigateTo(page) {
    const protectedPages = ['onboarding', 'dashboard', 'home', 'reports', 'history', 'profile', 'analysis'];

    // 1. Protected Route Guard: Requires authentication
    if (protectedPages.includes(page) && !this.isAuthenticated) {
      this.showToast('Please sign in to access MedLens.');
      this.currentPage = 'auth';
      window.location.hash = 'auth';
      this.render();
      return;
    }

    // 2. User-Specific Onboarding Guard (for protected dashboard routes):
    const onboardingProtectedRoutes = ['dashboard', 'home', 'reports', 'history', 'profile', 'analysis'];
    if (this.isAuthenticated && !this.profileCompleted && onboardingProtectedRoutes.includes(page)) {
      this.currentPage = 'onboarding';
      window.location.hash = 'onboarding';
      this.render();
      return;
    }

    if (this.isAuthenticated && this.profileCompleted && page === 'onboarding') {
      this.currentPage = 'dashboard';
      window.location.hash = 'dashboard';
      this.render();
      return;
    }

    // 3. Auth Page
    if (page === 'auth') {
      this.currentPage = 'auth';
      window.location.hash = 'auth';
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 4. Intro Landing Page & Section Links
    if (['landing', 'hero', 'features', 'how-it-works', 'interactive-demo', 'demo'].includes(page)) {
      if (page === 'landing' && window.location.hash && window.location.hash !== '#landing') {
        window.location.hash = 'landing';
      }
      if (this.currentPage !== 'landing' || !this.appContainer.children || this.appContainer.children.length === 0) {
        this.currentPage = 'landing';
        this.render();
      }

      if (page === 'landing' || page === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const targetId = page === 'demo' ? 'interactive-demo' : page;
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
      return;
    }

    // 5. Standard Core Routes
    const canonicalPage = page === 'home' ? 'dashboard' : page;
    this.currentPage = canonicalPage;
    window.location.hash = canonicalPage;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loginSuccess(userPartial, isFirstTime = false) {
    const normEmail = this.normalizeEmail(userPartial ? userPartial.email : '');
    const usersDb = this.getUsersDb();

    if (!isFirstTime) {
      // B01 Guard: Do not allow unknown emails or invalid credentials to sign in or reuse another user's profile
      const activeUserEmail = this.userDetails ? this.normalizeEmail(this.userDetails.email) : '';
      const isKnownAccount = !!(normEmail && (usersDb[normEmail] || activeUserEmail === normEmail));
      if (!isKnownAccount) {
        this.showToast('Invalid email or password.');
        this.navigateTo('auth');
        return;
      }
    }

    this.isAuthenticated = true;
    localStorage.setItem('medlens_auth', 'true');

    if (isFirstTime) {
      if (this.userDetails && this.userDetails.email) {
        const prevEmail = this.normalizeEmail(this.userDetails.email);
        usersDb[prevEmail] = {
          ...this.userDetails,
          onboardingCompleted: this.isUserOnboardingCompleted(prevEmail)
        };
      }

      const safeName = sanitizePlainText(userPartial && userPartial.fullName) || 'New Patient';
      const newAccount = {
        fullName: safeName,
        email: (userPartial && userPartial.email) || '',
        dob: '',
        gender: 'Female',
        bloodGroup: 'O+',
        phone: '',
        allergies: '',
        emergencyContact: '',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
        ...userPartial,
        fullName: safeName,
        onboardingCompleted: false
      };

      if (normEmail) {
        usersDb[normEmail] = newAccount;
        this.saveUsersDb(usersDb);
      }

      this.userDetails = newAccount;
      localStorage.setItem('medlens_user', JSON.stringify(this.userDetails));

      this.profileCompleted = false;
      localStorage.setItem('medlens_profile_completed', 'false');

      this.showToast('Account created! Please complete your basic details.');
      this.navigateTo('onboarding');
      return;
    }

    // RETURNING USER LOGIN FLOW:
    if (normEmail && usersDb[normEmail]) {
      this.userDetails = { ...usersDb[normEmail] };
    } else if (normEmail && this.userDetails && this.normalizeEmail(this.userDetails.email) === normEmail) {
      this.userDetails = { ...this.userDetails };
    }

    localStorage.setItem('medlens_user', JSON.stringify(this.userDetails));

    const hasCompleted = this.isUserOnboardingCompleted(normEmail || (this.userDetails ? this.userDetails.email : ''));
    this.profileCompleted = hasCompleted;
    localStorage.setItem('medlens_profile_completed', hasCompleted ? 'true' : 'false');

    this.showToast('Authentication Successful');

    if (hasCompleted) {
      this.navigateTo('dashboard');
    } else {
      this.navigateTo('onboarding');
    }
  }

  completeOnboarding(basicDetailsData) {
    const sanitized = { ...basicDetailsData };
    ['fullName', 'dob', 'gender', 'email', 'bloodGroup', 'phone', 'allergies', 'emergencyContact'].forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitizePlainText(sanitized[key]);
      }
    });

    this.userDetails = {
      ...this.userDetails,
      ...sanitized,
      onboardingCompleted: true
    };
    localStorage.setItem('medlens_user', JSON.stringify(this.userDetails));

    const normEmail = this.normalizeEmail(this.userDetails.email);
    if (normEmail) {
      const usersDb = this.getUsersDb();
      usersDb[normEmail] = {
        ...(usersDb[normEmail] || {}),
        ...this.userDetails,
        onboardingCompleted: true
      };
      this.saveUsersDb(usersDb);
    }

    this.profileCompleted = true;
    localStorage.setItem('medlens_profile_completed', 'true');
    
    this.showToast('✓ Profile Setup Completed!');
    this.navigateTo('dashboard');
  }

  logout() {
    if (this.userDetails && this.userDetails.email) {
      const normEmail = this.normalizeEmail(this.userDetails.email);
      const usersDb = this.getUsersDb();
      usersDb[normEmail] = {
        ...this.userDetails,
        onboardingCompleted: this.profileCompleted === true || usersDb[normEmail]?.onboardingCompleted === true
      };
      this.saveUsersDb(usersDb);
    }

    this.isAuthenticated = false;
    localStorage.removeItem('medlens_auth');
    this.showToast('Logged out successfully.');
    this.navigateTo('auth');
  }

  getUserDetails() {
    return this.userDetails;
  }

  getUserProfile() {
    return this.userDetails;
  }

  updateUserProfile(newData) {
    const sanitized = { ...newData };
    ['fullName', 'dob', 'gender', 'email', 'bloodGroup', 'phone', 'allergies', 'emergencyContact'].forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitizePlainText(sanitized[key]);
      }
    });
    if (sanitized.fullName === '') {
      sanitized.fullName = 'Patient';
    }

    this.userDetails = {
      ...this.userDetails,
      ...sanitized
    };
    localStorage.setItem('medlens_user', JSON.stringify(this.userDetails));

    const normEmail = this.normalizeEmail(this.userDetails.email);
    if (normEmail) {
      const usersDb = this.getUsersDb();
      usersDb[normEmail] = {
        ...(usersDb[normEmail] || {}),
        ...this.userDetails
      };
      this.saveUsersDb(usersDb);
    }

    this.render();
  }

  getReportsList() {
    return this.reportsList;
  }

  addReportFile(reportObj) {
    if (!reportObj.id) {
      reportObj.id = 'rep-' + Date.now();
    }
    this.reportsList.unshift(reportObj);
    localStorage.setItem('medlens_reports', JSON.stringify(this.reportsList));

    const hasValidAnalysis = !!(reportObj.demoTabKey && DEMO_REPORTS[reportObj.demoTabKey] && !reportObj.isUploaded);
    const demoData = hasValidAnalysis ? DEMO_REPORTS[reportObj.demoTabKey] : null;
    const historyEntry = {
      id: 'his-' + Date.now(),
      reportId: reportObj.id,
      fileName: reportObj.fileName || reportObj.name || 'Uploaded_Report.pdf',
      title: reportObj.name || reportObj.fileName || 'Uploaded Report',
      name: reportObj.fileName || reportObj.name || 'Uploaded Report',
      reportType: reportObj.reportType || 'Uploaded Document (Unverified)',
      date: reportObj.uploadDate || reportObj.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: hasValidAnalysis ? 'Completed' : (reportObj.status || 'Unable to Analyze'),
      isUploaded: !hasValidAnalysis,
      demoTabKey: hasValidAnalysis ? reportObj.demoTabKey : null,
      summary: hasValidAnalysis
        ? (demoData.aiSummary && demoData.aiSummary.note ? demoData.aiSummary.note : 'Analysis completed. Biomarker parameters verified.')
        : 'Report uploaded and stored in Report Locker. Analysis unavailable — no valid medical parameters found.'
    };
    this.analysisHistory.unshift(historyEntry);
    localStorage.setItem('medlens_history', JSON.stringify(this.analysisHistory));
  }

  deleteReportFile(reportId) {
    this.reportsList = this.reportsList.filter(r => r.id !== reportId);
    localStorage.setItem('medlens_reports', JSON.stringify(this.reportsList));
  }

  getAnalysisHistory() {
    return this.analysisHistory;
  }

  openModal(modalType, payload = {}) {
    if (!this.modalOverlay) return;
    if (this.modalOverlay.classList.contains('hidden')) {
      this.lastFocusedElement = document.activeElement;
    }
    renderModalContent(modalType, payload);
    this.modalOverlay.classList.remove('hidden');
    this.modalOverlay.setAttribute('aria-hidden', 'false');
    this.modalOverlay.removeAttribute('inert');
    try {
      this.modalOverlay.inert = false;
    } catch (e) {}

    const firstFocusable = this.modalOverlay.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable && typeof firstFocusable.focus === 'function') {
      firstFocusable.focus();
    }
  }

  closeModal() {
    if (!this.modalOverlay || this.modalOverlay.classList.contains('hidden')) return;
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    this.modalOverlay.classList.add('hidden');
    this.modalOverlay.setAttribute('aria-hidden', 'true');
    this.modalOverlay.setAttribute('inert', '');
    try {
      this.modalOverlay.inert = true;
    } catch (e) {}

    const modalContent = document.getElementById('modal-content');
    if (modalContent) {
      modalContent.innerHTML = '';
    }

    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function' && document.contains(this.lastFocusedElement)) {
      try {
        this.lastFocusedElement.focus();
      } catch (e) {}
    }
    this.lastFocusedElement = null;
  }

  showToast(message) {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i data-lucide="check-circle" style="color:var(--color-light-mint);width:18px;height:18px;"></i>
      <span>${escapeHtml(message)}</span>
    `;
    this.toastContainer.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  render() {
    if (!this.appContainer) return;

    switch (this.currentPage) {
      case 'landing':
        renderLandingPage(this.appContainer);
        break;

      case 'auth':
        renderAuthPage(this.appContainer);
        break;

      case 'onboarding':
        renderOnboardingPage(this.appContainer);
        break;

      case 'dashboard':
      case 'home':
        renderDashboardHomePage(this.appContainer);
        break;

      case 'reports':
        renderReportsPage(this.appContainer);
        break;

      case 'history':
        renderHistoryPage(this.appContainer);
        break;

      case 'profile':
        renderProfilePage(this.appContainer);
        break;

      case 'analysis':
        renderAnalysisPlaceholderPage(this.appContainer);
        break;

      default:
        renderLandingPage(this.appContainer);
        break;
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new MedLensAppEngine();
  app.init();
});
