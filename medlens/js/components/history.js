// MEDLENS - ANALYSIS HISTORY PAGE

import { renderDashboardSidebarHtml, renderDashboardTopbarHtml, bindDashboardShellEvents } from './navbar.js';
import { escapeHtml, DEMO_REPORTS } from '../data/mockData.js';

export function renderHistoryPage(containerEl) {
  const userProfile = window.MedLensApp.getUserDetails() || {};
  const historyList = window.MedLensApp.getAnalysisHistory() || [];

  containerEl.innerHTML = `
    <div class="dashboard-app-layout">
      ${renderDashboardSidebarHtml('history')}

      <div class="dashboard-main-wrap">
        ${renderDashboardTopbarHtml('Analysis History', 'Longitudinal Medical Interpretation Timeline', userProfile)}

        <main class="dashboard-content-container" style="max-width:980px;">
          <div style="margin-bottom:1.25rem;">
            <h2 style="font-size:1.6rem; color:var(--color-dark-green);">Analysis History</h2>
            <p style="font-size:0.88rem; color:var(--color-text-secondary);">Historical medical interpretation records and status</p>
          </div>

          <div style="display:flex; flex-direction:column; gap:1rem;">
            ${historyList.map(item => {
              const isUnavail = item.isUploaded || item.status === 'Unable to Analyze' || item.status === 'Analysis Unavailable';
              return `
              <div style="background:var(--color-white); border-radius:var(--radius-lg); border:1px solid var(--color-border); padding:1.35rem; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; gap:0.75rem;" class="animate-fade-in">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
                  <div>
                    <h4 style="font-size:1.1rem; color:var(--color-dark-green); margin-bottom:0.2rem; word-break:break-word;">${escapeHtml(item.title || item.name || item.fileName)}</h4>
                    <div style="font-size:0.82rem; font-weight:600; color:var(--color-emerald);">${escapeHtml(item.reportType ? `${item.reportType} • ${item.date}` : item.date)}</div>
                  </div>
                  <span class="badge ${isUnavail ? 'badge-review' : 'badge-mint'}">Status: ${escapeHtml(item.status)}</span>
                </div>
                
                <p style="font-size:0.9rem; color:var(--color-text-main); line-height:1.5;">"${escapeHtml(item.summary)}"</p>

                <div style="border-top:1px solid var(--color-border); padding-top:0.75rem; display:flex; justify-content:flex-end;">
                  <button class="btn btn-secondary btn-sm history-view-btn" data-hisid="${escapeHtml(item.id)}">
                    <i data-lucide="eye" style="width:14px;height:14px;"></i> View Analysis
                  </button>
                </div>
              </div>
            `}).join('')}
          </div>
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
          <div class="bottom-nav-item active" onclick="window.MedLensApp.navigateTo('history')">
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

  if (window.lucide) window.lucide.createIcons();
  bindDashboardShellEvents(containerEl);

  containerEl.querySelectorAll('.history-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const hisId = e.currentTarget.getAttribute('data-hisid');
      const item = historyList.find(h => h.id === hisId) || historyList[0];
      if (!item) return;

      const tabKey = item.demoTabKey || (item.id === 'his-201' ? 'CBC' : item.id === 'his-202' ? 'Blood Sugar' : item.id === 'his-203' ? 'Liver' : null);
      const isUnavail = item.isUploaded || item.status === 'Unable to Analyze' || item.status === 'Analysis Unavailable';

      if (!isUnavail && tabKey && DEMO_REPORTS[tabKey]) {
        const demoData = {
          ...DEMO_REPORTS[tabKey],
          fileName: item.fileName || item.title || item.name,
          date: item.date || DEMO_REPORTS[tabKey].date,
          isSample: true
        };
        window.MedLensApp.openModal('report-details', demoData);
      } else {
        window.MedLensApp.openModal('report-unrecognized', {
          fileName: item.fileName || item.title || item.name || 'Uploaded_Report.pdf',
          name: item.title || item.name || 'Uploaded Report',
          reportType: item.reportType || 'Uploaded Document (Unverified)',
          uploadDate: item.date || '',
          date: item.date || '',
          status: item.status || 'Unable to Analyze'
        });
      }
    });
  });
}
