// MEDLENS - REPORT LOCKER PAGE

import { renderDashboardSidebarHtml, renderDashboardTopbarHtml, bindDashboardShellEvents, openReportViewerModal } from './navbar.js';
import { escapeHtml } from '../data/mockData.js';

export function renderReportsPage(containerEl) {
  const userProfile = window.MedLensApp.getUserDetails() || {};
  let reportsList = window.MedLensApp.getReportsList() || [];
  let searchQuery = '';

  // Render outer layout ONCE so #report-search-input never loses focus while typing (B04)
  // and desktop users have the persistent left sidebar navigation (B06)
  containerEl.innerHTML = `
    <div class="dashboard-app-layout">
      ${renderDashboardSidebarHtml('reports')}

      <div class="dashboard-main-wrap">
        ${renderDashboardTopbarHtml('My Report Locker', 'Encrypted Medical Document Storage', userProfile)}

        <main class="dashboard-content-container" style="max-width:980px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem;">
            <div>
              <h2 style="font-size:1.6rem; color:var(--color-dark-green);">Report Locker</h2>
              <p id="reports-count-text" style="font-size:0.88rem; color:var(--color-text-secondary);">${reportsList.length} Secure Medical Documents Stored</p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.MedLensApp.navigateTo('dashboard')">
              <i data-lucide="plus" style="width:16px;height:16px;"></i>
              Upload New
            </button>
          </div>

          <div style="margin-bottom:1.25rem;">
            <div class="input-wrapper">
              <input type="text" id="report-search-input" name="locker-search-input" class="form-input" placeholder="Search reports by name or type..." value="" style="padding-left:2.5rem;" aria-label="Search reports by name or type">
              <i data-lucide="search" style="position:absolute; left:0.85rem; color:var(--color-text-secondary); width:18px; height:18px; pointer-events:none;"></i>
            </div>
          </div>

          <div id="reports-locker-list"></div>
        </main>

        <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
          <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('dashboard')">
            <i data-lucide="home" style="width:20px;height:20px;"></i>
            <span>Home</span>
          </div>
          <div class="bottom-nav-item active" onclick="window.MedLensApp.navigateTo('reports')">
            <i data-lucide="folder" style="width:20px;height:20px;"></i>
            <span>Reports</span>
          </div>
          <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('history')">
            <i data-lucide="clock" style="width:20px;height:20px;"></i>
            <span>History</span>
          </div>
          <div class="bottom-nav-item" onclick="window.MedLensApp.navigateTo('profile')">
            <i data-lucide="user" style="width:20px;height:20px;"></i>
            <span>Profile</span>
          </div>
        </nav>
      </div>
    </div>
  `;

  bindDashboardShellEvents(containerEl);

  const listContainer = containerEl.querySelector('#reports-locker-list');
  const countTextEl = containerEl.querySelector('#reports-count-text');
  const searchInput = containerEl.querySelector('#report-search-input');

  function updateLockerListOnly() {
    if (!listContainer) return;

    const filteredReports = reportsList.filter(rep =>
      (rep.fileName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rep.reportType && rep.reportType.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (countTextEl) {
      countTextEl.textContent = `${reportsList.length} Secure Medical Documents Stored`;
    }

    if (filteredReports.length === 0) {
      listContainer.innerHTML = `
        <div style="background:var(--color-white); border-radius:var(--radius-xl); padding:3rem 1.5rem; text-align:center; border:1px solid var(--color-border); box-shadow:var(--shadow-sm);">
          <i data-lucide="folder-open" style="width:48px;height:48px;color:var(--color-text-secondary);margin-bottom:1rem;"></i>
          <h3 style="color:var(--color-dark-green); margin-bottom:0.4rem;">No Reports Found</h3>
          <p style="font-size:0.88rem; color:var(--color-text-secondary); margin-bottom:1.5rem;">Try a different search term or upload a new medical report.</p>
          <button class="btn btn-primary" onclick="window.MedLensApp.navigateTo('dashboard')">Upload Report Now</button>
        </div>
      `;
    } else {
      listContainer.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:1rem;">
          ${filteredReports.map(rep => `
            <div class="locker-report-card animate-fade-in">
              
              <div class="locker-card-header">
                <div class="locker-card-info">
                  <div class="report-icon-box" style="width:46px; height:46px; background:var(--color-very-light-mint);">
                    <i data-lucide="file-text" style="width:24px;height:24px;color:var(--color-emerald);"></i>
                  </div>
                  <div class="locker-card-text">
                    <h4 class="locker-card-title">${escapeHtml(rep.fileName || rep.name)}</h4>
                    <span class="locker-card-meta">${escapeHtml(rep.reportType || 'Medical Report')} • ${escapeHtml(rep.fileSize || '2.1 MB')}</span>
                  </div>
                </div>
                <span class="badge ${escapeHtml(rep.badgeClass || 'badge-normal')}">${rep.isUploaded ? '⚠ ' : '✓ '}${escapeHtml(rep.status)}</span>
              </div>

              <div class="locker-card-footer">
                <span>Uploaded on ${escapeHtml(rep.uploadDate || rep.date)}</span>
                
                <div class="locker-card-actions">
                  <button class="btn btn-secondary btn-sm locker-view-btn" data-repid="${escapeHtml(rep.id)}">
                    <i data-lucide="eye" style="width:14px;height:14px;"></i> View
                  </button>
                  <button class="btn btn-secondary btn-sm locker-share-btn" data-repid="${escapeHtml(rep.id)}">
                    <i data-lucide="share-2" style="width:14px;height:14px;"></i> Share
                  </button>
                  <button class="btn btn-secondary btn-sm locker-delete-btn" data-repid="${escapeHtml(rep.id)}" style="color:#BE123C; border-color:#FECDD3;" aria-label="Delete report">
                    <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
                  </button>
                </div>
              </div>

            </div>
          `).join('')}
        </div>
      `;
    }

    if (window.lucide) window.lucide.createIcons();

    listContainer.querySelectorAll('.locker-view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const repId = e.currentTarget.getAttribute('data-repid');
        const rep = reportsList.find(r => r.id === repId) || reportsList[0];
        openReportViewerModal(rep);
      });
    });

    listContainer.querySelectorAll('.locker-share-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const repId = e.currentTarget.getAttribute('data-repid');
        const rep = reportsList.find(r => r.id === repId) || reportsList[0];
        window.MedLensApp.openModal('share-report', rep);
      });
    });

    listContainer.querySelectorAll('.locker-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const repId = e.currentTarget.getAttribute('data-repid');
        window.MedLensApp.deleteReportFile(repId);
        reportsList = window.MedLensApp.getReportsList() || [];
        window.MedLensApp.showToast('Report removed from Locker.');
        updateLockerListOnly();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      updateLockerListOnly();
    });
  }

  updateLockerListOnly();
}
