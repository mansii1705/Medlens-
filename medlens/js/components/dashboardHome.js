// MEDLENS - EXPANDED DASHBOARD / HOME PAGE COMPONENT

import { renderDashboardSidebarHtml, renderDashboardTopbarHtml, bindDashboardShellEvents, openReportViewerModal } from './navbar.js';
import { escapeHtml, sanitizePlainText } from '../data/mockData.js';

export function renderDashboardHomePage(containerEl) {
  const userProfile = window.MedLensApp.getUserDetails() || {};
  const reportsList = window.MedLensApp.getReportsList() || [];
  const analysisHistory = window.MedLensApp.getAnalysisHistory() || [];
  const safeFullName = escapeHtml(userProfile.fullName || 'Anshika Sharma');
  const safeFirstName = escapeHtml(((userProfile.fullName || 'Anshika').trim().split(/\s+/)[0]) || 'Anshika');
  const safeEmail = escapeHtml(userProfile.email || 'anshika@example.com');
  const safeDob = escapeHtml(userProfile.dob || '26 Oct 2001');
  const safeGender = escapeHtml(userProfile.gender || 'Female');
  const safeBlood = escapeHtml(userProfile.bloodGroup || 'O+');
  const safeAvatar = escapeHtml(userProfile.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250');

  containerEl.innerHTML = `
    <div class="dashboard-app-layout">
      
      <!-- Subtle Continuous Moving Background Elements -->
      <div class="dashboard-bg-animated" aria-hidden="true">
        <div class="dash-bg-blob blob-dash-1"></div>
        <div class="dash-bg-blob blob-dash-2"></div>
        <div class="dash-bg-blob blob-dash-3"></div>
        <span class="dash-plus-symbol plus-1">+</span>
        <span class="dash-plus-symbol plus-2">+</span>
        <span class="dash-plus-symbol plus-3">+</span>
        <span class="dash-plus-symbol plus-4">+</span>
        <span class="dash-floating-circle circ-1"></span>
        <span class="dash-floating-circle circ-2"></span>
        <span class="dash-floating-circle circ-3"></span>
      </div>

      ${renderDashboardSidebarHtml('dashboard')}

      <!-- Main Dashboard Workspace -->
      <div class="dashboard-main-wrap">
        
        ${renderDashboardTopbarHtml('Home', 'Personal Health Overview', userProfile)}

        <!-- Main Dashboard Workspace -->
        <main class="dashboard-content-container">
        
        <!-- 1. PRIMARY HERO ACTION: LARGE DIRECT UPLOAD CARD -->
        <div class="upload-card-hero animate-fade-in" id="dashboard-dropzone" style="margin-bottom:1.5rem;">
          <div class="upload-icon-circle">
            <i data-lucide="file-up" class="icon-upload-moving" style="width:34px;height:34px;"></i>
          </div>

          <h3 style="font-size:1.55rem; color:var(--color-dark-green); margin-bottom:0.35rem;">Upload Medical Report</h3>
          <p style="font-size:0.92rem; color:var(--color-text-secondary); margin-bottom:1.4rem; line-height:1.5;">
            Add a new medical report and keep your health records organized.<br>
            <span style="font-size:0.82rem; color:var(--color-emerald); font-weight:600;">Supports PDF, JPG, JPEG, PNG files up to 15MB</span>
          </p>

          <input type="file" id="dashboard-file-input" accept=".pdf,.png,.jpg,.jpeg" style="display:none;">
          <button class="btn btn-primary btn-lg btn-full upload-action-btn" id="dashboard-upload-btn" style="max-width:340px; margin:0 auto; font-size:1.05rem;">
            <i data-lucide="plus" style="width:20px;height:20px;"></i>
            + Upload Report
          </button>

          <div style="margin-top:0.85rem; font-size:0.82rem; color:var(--color-text-secondary);">
            or drag & drop your report file here
          </div>

          <div id="dashboard-upload-progress" style="display:none; margin-top:1.5rem; text-align:left; background:var(--color-white); padding:1.1rem; border-radius:var(--radius-md); border:1px solid var(--color-border); box-shadow:var(--shadow-sm);">
            <div style="display:flex; justify-content:space-between; font-size:0.88rem; font-weight:700; color:var(--color-dark-green); margin-bottom:0.45rem; gap:0.5rem; flex-wrap:wrap;">
              <span id="dash-upload-filename" style="word-break:break-word;">Medical_Report.pdf</span>
              <span id="dash-upload-percent" style="color:var(--color-emerald);">25%</span>
            </div>
            <div class="param-bar-bg" style="height:8px;">
              <div class="param-bar-fill fill-emerald" id="dash-upload-bar" style="width:25%;"></div>
            </div>
            <div style="font-size:0.78rem; color:var(--color-text-secondary); margin-top:0.4rem;">
              Validating document structure & storing in your Locker...
            </div>
          </div>
        </div>

        <!-- 2. PRESERVED PROFILE HEADER CARD -->
        <div class="profile-card animate-fade-in card-float-gentle" style="margin-bottom:1.5rem;">
          <img src="${safeAvatar}" alt="Profile Avatar" class="profile-avatar-large">
          
          <div class="profile-details-main" style="min-width:0;">
            <div class="profile-welcome-tag">HOME • Welcome back, ${safeFirstName} 👋</div>
            <h2 style="word-break:break-word;">${safeFullName}</h2>
            
            <div class="profile-meta-grid">
              <div class="profile-meta-item" style="min-width:0; word-break:break-word;">
                <span>Email Address:</span>
                <strong>${safeEmail}</strong>
              </div>
              <div class="profile-meta-item" style="min-width:0; word-break:break-word;">
                <span>Date of Birth:</span>
                <strong>${safeDob}</strong>
              </div>
              <div class="profile-meta-item" style="min-width:0; word-break:break-word;">
                <span>Gender:</span>
                <strong>${safeGender}</strong>
              </div>
              <div class="profile-meta-item" style="min-width:0; word-break:break-word;">
                <span>Blood Group:</span>
                <strong style="color:var(--color-emerald);">${safeBlood}</strong>
              </div>
            </div>
          </div>

          <button class="btn btn-secondary btn-sm" id="dash-edit-profile-btn">
            <i data-lucide="edit-3" style="width:14px;height:14px;"></i>
            Edit Profile
          </button>
        </div>

        <!-- 3. PRESERVED 4 HEALTH OVERVIEW STAT CARDS -->
        <div class="stats-grid">
          <div class="stat-card" onclick="window.MedLensApp.navigateTo('reports')">
            <div class="stat-icon-wrapper" style="background:var(--color-very-light-mint); color:var(--color-emerald); border:1px solid var(--color-light-mint);">
              <i data-lucide="file-text" class="icon-file-floating" style="width:24px;height:24px;"></i>
            </div>
            <div>
              <div class="stat-val">${reportsList.length || 12}</div>
              <div class="stat-label">Total Reports</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper" style="background:var(--color-very-light-mint); color:#047857; border:1px solid var(--color-light-mint);">
              <i data-lucide="check-circle-2" class="icon-heart-pulsing" style="width:24px;height:24px;"></i>
            </div>
            <div>
              <div class="stat-val">8</div>
              <div class="stat-label">Normal Parameters</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon-wrapper" style="background:#FEF3C7; color:#B45309; border:1px solid #FDE68A;">
              <i data-lucide="alert-triangle" class="icon-heart-pulsing" style="width:24px;height:24px;"></i>
            </div>
            <div>
              <div class="stat-val">4</div>
              <div class="stat-label">Needs Review</div>
            </div>
          </div>

          <div class="stat-card" onclick="window.MedLensApp.navigateTo('history')">
            <div class="stat-icon-wrapper" style="background:#EEF2FF; color:#4F46E5; border:1px solid #C7D2FE;">
              <i data-lucide="calendar" class="icon-file-floating" style="width:24px;height:24px;"></i>
            </div>
            <div>
              <div class="stat-val">15</div>
              <div class="stat-label">Timeline Events</div>
            </div>
          </div>
        </div>

        <!-- 4. SPLIT GRID: RECENT REPORTS & REPORT LOCKER PREVIEW -->
        <div class="dashboard-grid">
          <div class="dashboard-panel">
            <div class="panel-header">
              <div>
                <h3 class="panel-title">Recent Reports</h3>
                <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:0.15rem;">Latest medical test documents</p>
              </div>
              <span class="panel-link" onclick="window.MedLensApp.navigateTo('reports')">View Locker →</span>
            </div>

            <div class="reports-list">
              ${reportsList.slice(0, 4).map(rep => `
                <div class="report-row-card">
                  <div class="report-row-info">
                    <div class="report-icon-box">
                      <i data-lucide="file-spreadsheet"></i>
                    </div>
                    <div style="min-width:0; flex:1;">
                      <div class="report-title">${escapeHtml(rep.fileName || rep.name)}</div>
                      <div class="report-date">${escapeHtml(rep.reportType || 'Blood Report')} • ${escapeHtml(rep.uploadDate || rep.date)}</div>
                    </div>
                  </div>
                  <div class="report-row-actions">
                    <button class="btn btn-secondary btn-sm dash-view-btn" data-repid="${escapeHtml(rep.id)}">
                      <i data-lucide="eye" style="width:14px;height:14px;"></i> View
                    </button>
                    <button class="btn btn-secondary btn-sm dash-share-btn" data-repid="${escapeHtml(rep.id)}">
                      <i data-lucide="share-2" style="width:14px;height:14px;"></i> Share
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="dashboard-panel">
            <div class="panel-header">
              <div>
                <h3 class="panel-title">Your Report Locker</h3>
                <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:0.15rem;">Keep all your medical reports organized in one place.</p>
              </div>
              <span class="panel-link" onclick="window.MedLensApp.navigateTo('reports')">View All Reports →</span>
            </div>

            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              ${reportsList.slice(0, 3).map(rep => `
                <div class="locker-preview-row">
                  <div class="locker-preview-info">
                    <i data-lucide="folder" style="color:var(--color-emerald); width:18px; height:18px; flex-shrink:0;"></i>
                    <div style="min-width:0; flex:1;">
                      <div style="font-size:0.9rem; font-weight:700; color:var(--color-dark-green); word-break:break-word;">${escapeHtml(rep.fileName || rep.name)}</div>
                      <span style="font-size:0.78rem; color:var(--color-text-secondary);">${escapeHtml(rep.uploadDate || rep.date)}</span>
                    </div>
                  </div>
                  <span class="badge ${escapeHtml(rep.badgeClass || 'badge-normal')}">${rep.isUploaded ? '⚠ ' : '✓ '}${escapeHtml(rep.status)}</span>
                </div>
              `).join('')}
            </div>

            <button class="btn btn-secondary btn-full btn-sm" style="margin-top:1.25rem;" onclick="window.MedLensApp.navigateTo('reports')">
              View All Reports in Locker (${reportsList.length} Files) →
            </button>
          </div>
        </div>

        <!-- 5. SPLIT GRID: ANALYSIS HISTORY PREVIEW & HEALTH TIMELINE -->
        <div class="dashboard-grid">
          <div class="dashboard-panel">
            <div class="panel-header">
              <div>
                <h3 class="panel-title">Analysis History</h3>
                <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:0.15rem;">Previous report analysis entries.</p>
              </div>
              <span class="panel-link" onclick="window.MedLensApp.navigateTo('history')">View Analysis History →</span>
            </div>

            <div class="timeline-vertical">
              ${analysisHistory.map(his => `
                <div class="timeline-event-item" onclick="window.MedLensApp.navigateTo('history')">
                  <div class="timeline-date">${escapeHtml(his.date)} • <span class="badge badge-mint">${escapeHtml(his.status)}</span></div>
                  <div class="timeline-event-title">${escapeHtml(his.title || his.name)}</div>
                  <p style="font-size:0.82rem; color:var(--color-text-secondary); margin-top:0.2rem;">${escapeHtml(his.summary)}</p>
                </div>
              `).join('')}
            </div>

            <button class="btn btn-secondary btn-full btn-sm" style="margin-top:1.25rem;" onclick="window.MedLensApp.navigateTo('history')">
              View Analysis History →
            </button>
          </div>

          <div class="dashboard-panel">
            <div class="panel-header">
              <div>
                <h3 class="panel-title">Health Timeline (Preview)</h3>
                <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:0.15rem;">Chronological milestones & test records</p>
              </div>
              <span class="panel-link" onclick="window.MedLensApp.navigateTo('history')">View Full Timeline →</span>
            </div>

            <div class="timeline-vertical">
              <div class="timeline-event-item">
                <div class="timeline-date">18 Sep 2026</div>
                <div class="timeline-event-title">Complete Blood Count (CBC) Uploaded</div>
              </div>
              <div class="timeline-event-item">
                <div class="timeline-date">28 Aug 2026</div>
                <div class="timeline-event-title">Blood Glucose Flagged for Mild Review (108 mg/dL)</div>
              </div>
              <div class="timeline-event-item">
                <div class="timeline-date">15 Jul 2026</div>
                <div class="timeline-event-title">Routine Semi-Annual Checkup Completed</div>
              </div>
              <div class="timeline-event-item">
                <div class="timeline-date">03 Jun 2026</div>
                <div class="timeline-event-title">Liver Function Panel (LFT) All Normal</div>
              </div>
            </div>

            <div style="margin-top:1rem; padding:0.75rem 1rem; background:var(--color-pale-green); border:1px solid var(--color-light-mint); border-radius:var(--radius-md); font-size:0.8rem; color:var(--color-dark-green); display:flex; align-items:center; gap:0.5rem;">
              <i data-lucide="info" style="width:16px; height:16px; flex-shrink:0; color:var(--color-emerald);"></i>
              <span>Detailed AI Medical Interpretation is currently ON HOLD pending clinical updates.</span>
            </div>
          </div>
        </div>

        <!-- 6. PRESERVED HEALTH INSIGHTS & DYNAMIC SVG GLUCOSE TREND CHART -->
        <div class="trend-card">
          <div class="panel-header">
            <div>
              <h3 class="panel-title">Health Insights & Trends</h3>
              <p style="font-size:0.82rem; color:var(--color-text-secondary); margin-top:0.15rem;">Longitudinal parameter tracking</p>
            </div>
            <span class="panel-link" id="dash-view-trends-btn">View Trends Modal →</span>
          </div>

          <p style="font-size:0.92rem; color:var(--color-text-main); margin-bottom:0.5rem; line-height:1.5;">
            "Your fasting glucose values have slightly increased over your last 3 test reports (92 → 98 → 108 mg/dL). Continued dietary monitoring recommended."
          </p>

          <div class="trend-chart-box">
            <svg width="100%" height="100%" viewBox="0 0 500 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradMaster" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#10B981" stop-opacity="0.32"/>
                  <stop offset="100%" stop-color="#10B981" stop-opacity="0.0"/>
                </linearGradient>
              </defs>
              <line x1="0" y1="25" x2="500" y2="25" stroke="#E2E8F0" stroke-dasharray="4"/>
              <line x1="0" y1="50" x2="500" y2="50" stroke="#E2E8F0" stroke-dasharray="4"/>
              <line x1="0" y1="75" x2="500" y2="75" stroke="#E2E8F0" stroke-dasharray="4"/>

              <path d="M0,80 L125,70 L250,55 L375,35 L500,20 L500,100 L0,100 Z" fill="url(#chartGradMaster)"/>
              <path d="M0,80 L125,70 L250,55 L375,35 L500,20" fill="none" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>

              <circle cx="0" cy="80" r="4.5" fill="#064E3B"/>
              <circle cx="125" cy="70" r="4.5" fill="#064E3B"/>
              <circle cx="250" cy="55" r="4.5" fill="#064E3B"/>
              <circle cx="375" cy="35" r="5" fill="#F59E0B"/>
              <circle cx="500" cy="20" r="5.5" fill="#F43F5E"/>
            </svg>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--color-text-secondary); margin-top:0.35rem; flex-wrap:wrap; gap:0.4rem;">
            <span>20 May 2026 (92 mg/dL)</span>
            <span>03 Jun 2026 (98 mg/dL)</span>
            <span>15 Jul 2026 (102 mg/dL)</span>
            <span>28 Aug 2026 (108 mg/dL)</span>
          </div>
        </div>

        <!-- 7. PRESERVED QUICK ACTIONS GRID -->
        <div class="dashboard-panel" style="margin-bottom:1.5rem;">
          <div class="panel-header">
            <h3 class="panel-title">Quick Actions</h3>
          </div>

          <div class="quick-actions-grid">
            <div class="action-card" id="act-upload-modal">
              <div class="action-icon"><i data-lucide="upload-cloud"></i></div>
              <div>
                <h5>Upload Report</h5>
                <p>Upload a new medical report</p>
              </div>
            </div>

            <div class="action-card" id="act-compare-modal">
              <div class="action-icon"><i data-lucide="git-compare"></i></div>
              <div>
                <h5>Compare Reports</h5>
                <p>Compare two reports side-by-side</p>
              </div>
            </div>

            <div class="action-card" id="act-trends-modal">
              <div class="action-icon"><i data-lucide="line-chart"></i></div>
              <div>
                <h5>View Trends</h5>
                <p>Analyze health trends over time</p>
              </div>
            </div>

            <div class="action-card" id="act-export-modal">
              <div class="action-icon"><i data-lucide="download"></i></div>
              <div>
                <h5>Export Summary</h5>
                <p>Download your medical summary</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 8. PRESERVED MEDICAL SAFETY DISCLAIMER -->
        <div class="demo-disclaimer" style="margin-bottom:1.5rem;">
          <i data-lucide="shield-alert" style="width:18px;height:18px;flex-shrink:0;"></i>
          <span><strong>Medical Safety Notice:</strong> MedLens provides informational insights and does not replace professional medical advice. Always consult a certified physician for medical diagnosis and prescriptions.</span>
        </div>
      </main>

      <!-- Mobile-Friendly Bottom Navigation Bar -->
      <nav class="mobile-bottom-nav" aria-label="Mobile Navigation">
        <div class="bottom-nav-item active" onclick="window.MedLensApp.navigateTo('dashboard')">
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

  const fileInput = containerEl.querySelector('#dashboard-file-input');
  const uploadBtn = containerEl.querySelector('#dashboard-upload-btn');
  const dropzone = containerEl.querySelector('#dashboard-dropzone');
  const progressBox = containerEl.querySelector('#dashboard-upload-progress');
  const filenameEl = containerEl.querySelector('#dash-upload-filename');
  const percentEl = containerEl.querySelector('#dash-upload-percent');
  const fillEl = containerEl.querySelector('#dash-upload-bar');

  function startUploadProcess(fileObjOrName) {
    if (!progressBox) return;
    const rawName = typeof fileObjOrName === 'string' ? fileObjOrName : (fileObjOrName.name || 'Uploaded_Report.pdf');
    const safeFileName = sanitizePlainText(rawName) || 'Uploaded_Report.pdf';
    const fileSizeStr = (fileObjOrName && fileObjOrName.size)
      ? `${Math.max(0.1, (fileObjOrName.size / (1024 * 1024))).toFixed(1)} MB`
      : '1.4 MB';

    progressBox.style.display = 'block';
    filenameEl.textContent = safeFileName;
    fillEl.style.width = '25%';
    percentEl.textContent = '25%';

    setTimeout(() => {
      fillEl.style.width = '75%';
      percentEl.textContent = '75%';
    }, 250);

    setTimeout(() => {
      fillEl.style.width = '100%';
      percentEl.textContent = '100%';
      
      const uploadedEntry = {
        fileName: safeFileName,
        name: safeFileName.replace(/\.[^/.]+$/, ''),
        reportType: 'Uploaded Document (Unverified)',
        fileSize: fileSizeStr,
        uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Unable to Analyze',
        badgeClass: 'badge-review',
        isUploaded: true,
        isSample: false,
        demoTabKey: null
      };

      window.MedLensApp.addReportFile(uploadedEntry);
      renderDashboardHomePage(containerEl);
      window.MedLensApp.openModal('report-unrecognized', uploadedEntry);
    }, 550);
  }

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        startUploadProcess(e.target.files[0]);
      }
    });
  }

  if (dropzone) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-emerald-hover)';
      dropzone.style.background = 'var(--color-very-light-mint)';
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.style.borderColor = 'var(--color-emerald)';
      dropzone.style.background = 'linear-gradient(180deg, var(--color-white) 0%, var(--color-pale-green) 100%)';
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = 'var(--color-emerald)';
      dropzone.style.background = 'linear-gradient(180deg, var(--color-white) 0%, var(--color-pale-green) 100%)';
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        startUploadProcess(e.dataTransfer.files[0]);
      }
    });
  }

  containerEl.querySelectorAll('.dash-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const repId = e.currentTarget.getAttribute('data-repid');
      const rep = reportsList.find(r => r.id === repId) || reportsList[0];
      openReportViewerModal(rep);
    });
  });

  containerEl.querySelectorAll('.dash-share-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const repId = e.currentTarget.getAttribute('data-repid');
      const rep = reportsList.find(r => r.id === repId) || reportsList[0];
      window.MedLensApp.openModal('share-report', rep);
    });
  });

  const editProfileBtn = containerEl.querySelector('#dash-edit-profile-btn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      window.MedLensApp.openModal('edit-profile', userProfile);
    });
  }

  const trendsBtn = containerEl.querySelector('#dash-view-trends-btn');
  if (trendsBtn) {
    trendsBtn.addEventListener('click', () => window.MedLensApp.openModal('view-trends'));
  }

  const actUpload = containerEl.querySelector('#act-upload-modal');
  const actCompare = containerEl.querySelector('#act-compare-modal');
  const actTrends = containerEl.querySelector('#act-trends-modal');
  const actExport = containerEl.querySelector('#act-export-modal');

  if (actUpload) actUpload.addEventListener('click', () => window.MedLensApp.openModal('upload-report'));
  if (actCompare) actCompare.addEventListener('click', () => window.MedLensApp.openModal('compare-reports'));
  if (actTrends) actTrends.addEventListener('click', () => window.MedLensApp.openModal('view-trends'));
  if (actExport) actExport.addEventListener('click', () => window.MedLensApp.openModal('export-summary'));
}
