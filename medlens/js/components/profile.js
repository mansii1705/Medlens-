// MEDLENS - USER PROFILE PAGE

import { renderDashboardSidebarHtml, renderDashboardTopbarHtml, bindDashboardShellEvents } from './navbar.js';
import { escapeHtml } from '../data/mockData.js';

export function renderProfilePage(containerEl) {
  const userDetails = window.MedLensApp.getUserDetails() || {};
  const safeFullName = escapeHtml(userDetails.fullName || 'Anshika Sharma');
  const safeEmail = escapeHtml(userDetails.email || 'anshika@example.com');
  const safePhone = escapeHtml(userDetails.phone || '+91 98765 43210');
  const safeDob = escapeHtml(userDetails.dob || '26 Oct 2001');
  const safeGender = escapeHtml(userDetails.gender || 'Female');
  const safeBlood = escapeHtml(userDetails.bloodGroup || 'O+');
  const safeAllergies = escapeHtml(userDetails.allergies || 'None reported');
  const safeEmergency = escapeHtml(userDetails.emergencyContact || 'Not specified');
  const safeAvatar = escapeHtml(userDetails.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250');

  containerEl.innerHTML = `
    <div class="dashboard-app-layout">
      ${renderDashboardSidebarHtml('profile')}

      <div class="dashboard-main-wrap">
        ${renderDashboardTopbarHtml('My Profile', 'Personal Health Identity & Preferences', userDetails)}

        <main class="dashboard-content-container" style="max-width:880px;">
          <div class="profile-card" style="margin-bottom:1.5rem;">
            <img src="${safeAvatar}" alt="Avatar" class="profile-avatar-large">
            
            <div class="profile-details-main" style="min-width:0; width:100%;">
              <span class="profile-welcome-tag">Personal Health Profile</span>
              <h2 style="word-break:break-word;">${safeFullName}</h2>
              
              <div class="profile-info-grid">
                <div><span style="color:var(--color-text-secondary);">Email:</span> <strong>${safeEmail}</strong></div>
                <div><span style="color:var(--color-text-secondary);">Phone:</span> <strong>${safePhone}</strong></div>
                <div><span style="color:var(--color-text-secondary);">Date of Birth:</span> <strong>${safeDob}</strong></div>
                <div><span style="color:var(--color-text-secondary);">Gender:</span> <strong>${safeGender}</strong></div>
                <div><span style="color:var(--color-text-secondary);">Blood Group:</span> <strong style="color:var(--color-emerald);">${safeBlood}</strong></div>
              </div>
            </div>

            <button class="btn btn-secondary btn-sm" id="profile-edit-btn">
              <i data-lucide="edit-3" style="width:14px;height:14px;"></i> Edit Profile
            </button>
          </div>

          <div class="dashboard-panel" style="margin-bottom:1.5rem;">
            <div class="panel-header">
              <h3 class="panel-title">Medical Overview & Health Info</h3>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.85rem; font-size:0.9rem;">
              <div style="word-break:break-word;">
                <strong style="color:var(--color-dark-green);">Known Allergies:</strong>
                <div style="color:var(--color-text-secondary); margin-top:0.2rem;">${safeAllergies}</div>
              </div>
              <div style="border-top:1px solid var(--color-border); padding-top:0.75rem; word-break:break-word;">
                <strong style="color:var(--color-dark-green);">Emergency Contact:</strong>
                <div style="color:var(--color-text-secondary); margin-top:0.2rem;">${safeEmergency}</div>
              </div>
            </div>
          </div>

          <button class="btn btn-secondary btn-full" id="profile-logout-btn" style="color:#BE123C; border-color:#FECDD3;">
            <i data-lucide="log-out" style="width:18px;height:18px;"></i>
            Logout of Account
          </button>
        </main>

        <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
          <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('dashboard')">
            <i data-lucide="home" style="width:20px;height:20px;"></i>
            <span>Home</span>
          </div>
          <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('reports')">
            <i data-lucide="folder" style="width:20px;height:20px;"></i>
            <span>Reports</span>
          </div>
          <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('history')">
            <i data-lucide="clock" style="width:20px;height:20px;"></i>
            <span>History</span>
          </div>
          <div class="bottom-nav-item active" onclick="window.MedLensApp.navigateTo('profile')">
            <i data-lucide="user" style="width:20px;height:20px;"></i>
            <span>Profile</span>
          </div>
        </nav>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
  bindDashboardShellEvents(containerEl);

  const editBtn = containerEl.querySelector('#profile-edit-btn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      window.MedLensApp.openModal('edit-profile', userDetails);
    });
  }

  const logoutBtn = containerEl.querySelector('#profile-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => window.MedLensApp.logout());
  }
}
