// MEDLENS - SHARED MODALS

import {
  escapeHtml,
  sanitizePlainText,
  getTodayIsoDate,
  toIsoDateValue,
  extractNumericDigits,
  bindDobPickerField,
  validateDobField,
  bindNumericOnlyField,
  validateNumericPhoneField,
  MEDICAL_EXPLANATIONS
} from '../data/mockData.js';

export function renderModalContent(modalType, payload = {}) {
  const modalContent = document.getElementById('modal-content');
  if (!modalContent) return;

  let bodyHtml = '';

  switch (modalType) {
    case 'share-report':
      bodyHtml = `
        <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
          <i data-lucide="x"></i>
        </button>
        <div style="text-align:center; margin-bottom:1.5rem;">
          <div style="width:54px; height:54px; border-radius:50%; background:var(--color-very-light-mint); color:var(--color-emerald); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; border:1px solid var(--color-light-mint);">
            <i data-lucide="share-2" style="width:26px;height:26px;"></i>
          </div>
          <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.3rem;">Share Medical Report</h3>
          <p style="font-size:0.85rem; color:var(--color-text-secondary); word-break:break-word;">${escapeHtml(payload.fileName || payload.name || 'Report.pdf')}</p>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.85rem; margin-bottom:1.5rem;">
          <button class="btn btn-secondary btn-full" id="share-copy-link-btn" style="justify-content:flex-start; padding:0.9rem 1.25rem;">
            <i data-lucide="link" style="color:var(--color-emerald);"></i>
            <span>Copy Secure View Link</span>
          </button>

          <button class="btn btn-secondary btn-full" id="share-download-pdf-btn" style="justify-content:flex-start; padding:0.9rem 1.25rem;">
            <i data-lucide="download" style="color:var(--color-emerald);"></i>
            <span>Download Report Document</span>
          </button>

          <button class="btn btn-secondary btn-full" id="share-native-btn" style="justify-content:flex-start; padding:0.9rem 1.25rem;">
            <i data-lucide="send" style="color:var(--color-emerald);"></i>
            <span>Share via Email / Messaging</span>
          </button>
        </div>

        <div style="text-align:right;">
          <button class="btn btn-primary" onclick="window.MedLensApp.closeModal()">Done</button>
        </div>
      `;
      break;

    case 'report-unrecognized':
      bodyHtml = `
        <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
          <i data-lucide="x"></i>
        </button>
        <div style="text-align:center; margin-bottom:1.25rem;">
          <div style="width:58px; height:58px; border-radius:50%; background:#FEF3C7; color:#B45309; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; border:1px solid #FDE68A;">
            <i data-lucide="file-warning" style="width:28px;height:28px;"></i>
          </div>
          <div class="badge badge-review" style="margin-bottom:0.5rem;">Unable to Analyze Report</div>
          <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.35rem;">Unable to Analyze This Report</h3>
          <p style="font-size:0.86rem; color:var(--color-text-secondary); word-break:break-word;">File: <strong>${escapeHtml(payload.fileName || payload.name || 'Uploaded_Document.pdf')}</strong></p>
        </div>

        <div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:var(--radius-md); padding:1.1rem; margin-bottom:1.25rem; font-size:0.9rem; color:#92400E; line-height:1.55;">
          <strong>No valid medical parameters found.</strong><br>
          MedLens could not detect recognizable laboratory biomarkers, test values, or clinical reference ranges in this uploaded document. For patient safety, MedLens never displays sample or fabricated results for unrecognized files.
        </div>

        <div style="background:var(--color-pale-green); border:1px solid var(--color-light-mint); border-radius:var(--radius-md); padding:0.95rem 1rem; margin-bottom:1.5rem; font-size:0.84rem; color:var(--color-dark-green); line-height:1.5;">
          <strong>Supported Documents:</strong> Clear digital lab PDFs or high-resolution scans containing structured test tables (e.g., Complete Blood Count, Fasting Blood Glucose, Liver Function, or Renal Panel).
        </div>

        <div style="display:flex; justify-content:flex-end; gap:0.75rem; flex-wrap:wrap;">
          <button class="btn btn-secondary" onclick="window.MedLensApp.closeModal()">Close</button>
        </div>
      `;
      break;

    case 'report-details':
      bodyHtml = `
        <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
          <i data-lucide="x"></i>
        </button>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem; padding-right:2rem;">
          <div>
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.4rem;">
              <span class="badge badge-mint">Medical Report View</span>
              <span class="badge badge-review">Sample / Demo Data</span>
            </div>
            <h3 style="font-size:1.4rem; color:var(--color-dark-green);">${escapeHtml(payload.title || 'Laboratory Report')}</h3>
            <span style="font-size:0.85rem; color:var(--color-text-secondary);">Tested Date: ${escapeHtml(payload.date || '2026')}</span>
          </div>
          <span class="badge badge-normal">Sample Analyzed ✓</span>
        </div>

        <div id="report-explanation-section" style="background:var(--color-pale-green); border:1px solid var(--color-light-mint); border-radius:var(--radius-md); padding:1rem; margin-bottom:1.25rem; font-size:0.88rem; color:var(--color-dark-green); line-height:1.5;">
          <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.5rem;">
            <button type="button" class="explain-audio-btn" id="report-summary-audio-btn" title="Read explanation aloud" aria-label="Read explanation aloud" style="width:34px; height:34px; border-radius:50%; background:var(--color-very-light-mint); color:var(--color-dark-green); border:1.5px solid var(--color-emerald); display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s ease; box-shadow:var(--shadow-sm); flex-shrink:0; padding:0;">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:17px; height:17px; display:block;">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
              </svg>
            </button>
            <strong>View Explanation — AI Clinical Summary:</strong>
          </div>
          <div id="report-summary-readable-text">
            ${escapeHtml((payload.aiSummary && payload.aiSummary.note) || 'All primary parameters within healthy reference ranges.')}
          </div>
        </div>

        <div style="max-height:260px; overflow-y:auto; margin-bottom:1.5rem;">
          <table class="demo-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Result</th>
                <th>Status</th>
                <th>Standard Range</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${(payload.parameters || []).map((p, idx) => `
                <tr>
                  <td><strong>${escapeHtml(p.name)}</strong></td>
                  <td><strong>${escapeHtml(p.value)}</strong></td>
                  <td><span class="badge ${p.status === 'Normal' ? 'badge-normal' : 'badge-review'}">${escapeHtml(p.status)}</span></td>
                  <td style="color:var(--color-text-secondary);">${escapeHtml(p.range)}</td>
                  <td>
                    <button type="button" class="explain-btn modal-param-explain-btn" data-param-idx="${idx}">
                      <i data-lucide="help-circle" style="width:14px;height:14px;"></i>
                      View Explanation
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:0.75rem; flex-wrap:wrap;">
          <button class="btn btn-secondary" id="modal-report-share-btn">Share</button>
          <button class="btn btn-primary" onclick="window.MedLensApp.closeModal()">Close</button>
        </div>
      `;
      break;

    case 'upload-report':
      bodyHtml = `
        <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
          <i data-lucide="x"></i>
        </button>
        <div style="text-align:center; margin-bottom:1.5rem;">
          <div style="width:58px; height:58px; border-radius:50%; background:var(--color-very-light-mint); color:var(--color-emerald); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; border:1px solid var(--color-light-mint);">
            <i data-lucide="upload-cloud" style="width:30px;height:30px;"></i>
          </div>
          <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.3rem;">Upload Medical Report</h3>
          <p style="font-size:0.88rem; color:var(--color-text-secondary);">Select digital lab results or scanned paper reports</p>
        </div>

        <div style="border:2px dashed var(--color-emerald); border-radius:var(--radius-lg); padding:2rem 1.5rem; text-align:center; background:var(--color-pale-green); margin-bottom:1.5rem; cursor:pointer;" id="modal-upload-dropzone">
          <i data-lucide="file-text" style="width:36px;height:36px;color:var(--color-emerald);margin-bottom:0.5rem;"></i>
          <p style="font-weight:700; color:var(--color-dark-green); margin-bottom:0.25rem;">Choose File or Drag & Drop</p>
          <p style="font-size:0.8rem; color:var(--color-text-secondary);">PDF, JPG, JPEG, PNG up to 15MB</p>
          <input type="file" id="modal-file-input" accept=".pdf,.png,.jpg,.jpeg" style="display:none;">
          <button class="btn btn-primary btn-sm" style="margin-top:1rem;" onclick="document.getElementById('modal-file-input').click()">Browse Device</button>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
          <button class="btn btn-secondary" onclick="window.MedLensApp.closeModal()">Cancel</button>
        </div>
      `;
      break;

    case 'compare-reports':
      bodyHtml = `
        <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
          <i data-lucide="x"></i>
        </button>
        <div style="margin-bottom:1.5rem;">
          <div class="badge badge-mint" style="margin-bottom:0.4rem;">Comparative Diagnostics</div>
          <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.3rem;">Compare Medical Reports</h3>
          <p style="font-size:0.88rem; color:var(--color-text-secondary);">Review biomarker changes between your consecutive tests.</p>
        </div>

        <div class="onboarding-grid-2" style="margin-bottom:1.5rem;">
          <div style="padding:1rem; background:var(--color-pale-green); border:1px solid var(--color-light-mint); border-radius:var(--radius-md);">
            <strong>Test A (Baseline):</strong>
            <div style="font-size:0.82rem; color:var(--color-text-secondary); margin-top:0.25rem;">Complete Blood Count (18 Sep 2026)</div>
            <div style="font-size:0.85rem; color:var(--color-dark-green); margin-top:0.5rem;">Hemoglobin: <strong>13.2 g/dL</strong></div>
          </div>
          <div style="padding:1rem; background:var(--color-soft-mint); border:1px solid var(--color-light-mint); border-radius:var(--radius-md);">
            <strong>Test B (Comparison):</strong>
            <div style="font-size:0.82rem; color:var(--color-text-secondary); margin-top:0.25rem;">CBC Panel (15 Jul 2026)</div>
            <div style="font-size:0.85rem; color:var(--color-dark-green); margin-top:0.5rem;">Hemoglobin: <strong>13.0 g/dL</strong> (+0.2 g/dL)</div>
          </div>
        </div>

        <div style="text-align:right;">
          <button class="btn btn-primary" onclick="window.MedLensApp.closeModal()">Close Comparison</button>
        </div>
      `;
      break;

    case 'view-trends':
      bodyHtml = `
        <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
          <i data-lucide="x"></i>
        </button>
        <div style="margin-bottom:1.25rem;">
          <div class="badge badge-mint" style="margin-bottom:0.4rem;">Trend Analysis</div>
          <h3 style="font-size:1.4rem; color:var(--color-dark-green);">Fasting Blood Glucose Longitudinal Trend</h3>
          <p style="font-size:0.88rem; color:var(--color-text-secondary);">Historical progression over consecutive tests</p>
        </div>

        <div class="trend-chart-box" style="height:150px; margin-bottom:1.5rem;">
          <svg width="100%" height="100%" viewBox="0 0 500 120" preserveAspectRatio="none">
            <line x1="0" y1="30" x2="500" y2="30" stroke="#E2E8F0" stroke-dasharray="4"/>
            <line x1="0" y1="60" x2="500" y2="60" stroke="#E2E8F0" stroke-dasharray="4"/>
            <line x1="0" y1="90" x2="500" y2="90" stroke="#E2E8F0" stroke-dasharray="4"/>
            <path d="M0,95 L125,80 L250,65 L375,40 L500,25" fill="none" stroke="#10B981" stroke-width="3.5" stroke-linecap="round"/>
            <circle cx="0" cy="95" r="5" fill="#064E3B"/>
            <circle cx="125" cy="80" r="5" fill="#064E3B"/>
            <circle cx="250" cy="65" r="5" fill="#064E3B"/>
            <circle cx="375" cy="40" r="5.5" fill="#F59E0B"/>
            <circle cx="500" cy="25" r="6" fill="#F43F5E"/>
          </svg>
        </div>

        <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--color-text-secondary); margin-bottom:1.5rem; flex-wrap:wrap; gap:0.5rem;">
          <span>20 May (92 mg/dL)</span>
          <span>03 Jun (98 mg/dL)</span>
          <span>15 Jul (102 mg/dL)</span>
          <span>28 Aug (108 mg/dL)</span>
        </div>

        <div style="text-align:right;">
          <button class="btn btn-primary" onclick="window.MedLensApp.closeModal()">Close Trends</button>
        </div>
      `;
      break;

    case 'export-summary':
      bodyHtml = `
        <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
          <i data-lucide="x"></i>
        </button>
        <div style="text-align:center; margin-bottom:1.5rem;">
          <div style="width:58px; height:58px; border-radius:50%; background:var(--color-very-light-mint); color:var(--color-emerald); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem; border:1px solid var(--color-light-mint);">
            <i data-lucide="download" style="width:28px;height:28px;"></i>
          </div>
          <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.3rem;">Export Health Summary</h3>
          <p style="font-size:0.88rem; color:var(--color-text-secondary);">Download a consolidated physician-ready medical record.</p>
        </div>

        <div style="padding:1.25rem; background:var(--color-pale-green); border:1px solid var(--color-light-mint); border-radius:var(--radius-md); margin-bottom:1.5rem; font-size:0.88rem; line-height:1.5; color:var(--color-dark-green);">
          Includes all 12 verified lab parameters, longitudinal glucose tracking, timeline milestones, and clinical disclaimers for Dr. Consultation.
        </div>

        <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
          <button class="btn btn-secondary" onclick="window.MedLensApp.closeModal()">Cancel</button>
          <button class="btn btn-primary" onclick="window.MedLensApp.showToast('✓ Medical PDF Summary Generated & Downloaded!'); window.MedLensApp.closeModal();">Download PDF</button>
        </div>
      `;
      break;

    case 'analysis-on-hold':
      bodyHtml = `
        <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
          <i data-lucide="x"></i>
        </button>
        <div style="text-align:center; padding:1rem 0;">
          <i data-lucide="alert-circle" style="width:48px;height:48px;color:#F59E0B;margin-bottom:1rem;"></i>
          <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.5rem;">Detailed Analysis ON HOLD</h3>
          <p style="font-size:0.9rem; color:var(--color-text-secondary); line-height:1.5; margin-bottom:1.5rem;">
            The detailed medical interpretation engine is currently kept on hold pending clinical compliance protocols. Your document has been stored securely in your Report Locker.
          </p>
          <button class="btn btn-primary" onclick="window.MedLensApp.closeModal()">Understood</button>
        </div>
      `;
      break;

    case 'settings':
      bodyHtml = `
        <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
          <i data-lucide="x"></i>
        </button>
        <div style="margin-bottom:1.5rem;">
          <div class="badge badge-mint" style="margin-bottom:0.4rem;">Patient Settings</div>
          <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.3rem;">Preferences & Security</h3>
          <p style="font-size:0.88rem; color:var(--color-text-secondary);">Manage your MedLens patient profile, alerts, and report privacy.</p>
        </div>

        <div style="display:flex; flex-direction:column; gap:1rem; margin-bottom:1.5rem;">
          <div style="padding:1rem; background:var(--color-pale-mint); border:1px solid var(--color-light-mint); border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center; gap:0.75rem;">
            <div>
              <strong style="color:var(--color-dark-green); font-size:0.95rem;">Lab Report Notifications</strong>
              <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:0.2rem;">Receive alerts when new tests are verified or values flagged.</p>
            </div>
            <input type="checkbox" checked style="width:18px; height:18px; accent-color:var(--color-emerald); cursor:pointer;">
          </div>

          <div style="padding:1rem; background:var(--color-pale-mint); border:1px solid var(--color-light-mint); border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center; gap:0.75rem;">
            <div>
              <strong style="color:var(--color-dark-green); font-size:0.95rem;">Encrypted Cloud Locker</strong>
              <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:0.2rem;">End-to-end 256-bit AES encryption for all uploaded records.</p>
            </div>
            <span class="badge badge-normal">Active ✓</span>
          </div>

          <div style="padding:1rem; background:var(--color-pale-mint); border:1px solid var(--color-light-mint); border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center; gap:0.75rem;">
            <div>
              <strong style="color:var(--color-dark-green); font-size:0.95rem;">Health Profile & Basic Details</strong>
              <p style="font-size:0.8rem; color:var(--color-text-secondary); margin-top:0.2rem;">Update blood group, allergies, or emergency contact.</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.MedLensApp.closeModal(); window.MedLensApp.navigateTo('profile');">Edit</button>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
          <button class="btn btn-secondary" onclick="window.MedLensApp.closeModal()">Close</button>
          <button class="btn btn-primary" onclick="window.MedLensApp.showToast('✓ Settings Saved Successfully'); window.MedLensApp.closeModal();">Save Preferences</button>
        </div>
      `;
      break;

    case 'edit-profile':
      bodyHtml = `
        <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
          <i data-lucide="x"></i>
        </button>
        <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.5rem;">Edit Profile</h3>
        <p style="font-size:0.85rem; color:var(--color-text-secondary); margin-bottom:1.5rem;">Update your health account personal information.</p>

        <form id="edit-profile-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="edit-name">Full Name</label>
            <input type="text" id="edit-name" class="form-input" value="${escapeHtml(payload.fullName || '')}" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-email">Email Address</label>
            <input type="email" id="edit-email" class="form-input" value="${escapeHtml(payload.email || '')}" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-phone">Phone Number</label>
            <input type="tel" id="edit-phone" class="form-input" inputmode="numeric" pattern="[0-9]{10,15}" maxlength="15" placeholder="e.g. 9876543210" value="${escapeHtml(extractNumericDigits(payload.phone || ''))}" required>
            <span class="field-error" id="err-edit-phone" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
          </div>

          <div class="form-group">
            <label class="form-label" for="edit-emergency">Emergency Contact</label>
            <input type="tel" id="edit-emergency" class="form-input" inputmode="numeric" pattern="[0-9]{10,15}" maxlength="15" placeholder="e.g. 9876500000" value="${escapeHtml(extractNumericDigits(payload.emergencyContact || ''))}">
            <span class="field-error" id="err-edit-emergency" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
          </div>

          <div class="edit-profile-grid">
            <div class="form-group">
              <label class="form-label" for="edit-dob">Date of Birth</label>
              <input type="date" id="edit-dob" class="form-input" min="1900-01-01" max="${getTodayIsoDate()}" value="${escapeHtml(toIsoDateValue(payload.dob || ''))}" required>
              <span class="field-error" id="err-edit-dob" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
            </div>
            <div class="form-group">
              <label class="form-label" for="edit-gender">Gender</label>
              <select id="edit-gender" class="form-input">
                <option ${payload.gender === 'Female' ? 'selected' : ''}>Female</option>
                <option ${payload.gender === 'Male' ? 'selected' : ''}>Male</option>
                <option ${payload.gender === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="edit-blood">Blood Group</label>
              <select id="edit-blood" class="form-input">
                <option value="A+" ${payload.bloodGroup === 'A+' ? 'selected' : ''}>A+</option>
                <option value="A-" ${payload.bloodGroup === 'A-' ? 'selected' : ''}>A-</option>
                <option value="B+" ${payload.bloodGroup === 'B+' ? 'selected' : ''}>B+</option>
                <option value="B-" ${payload.bloodGroup === 'B-' ? 'selected' : ''}>B-</option>
                <option value="AB+" ${payload.bloodGroup === 'AB+' ? 'selected' : ''}>AB+</option>
                <option value="AB-" ${payload.bloodGroup === 'AB-' ? 'selected' : ''}>AB-</option>
                <option value="O+" ${payload.bloodGroup === 'O+' || !payload.bloodGroup ? 'selected' : ''}>O+</option>
                <option value="O-" ${payload.bloodGroup === 'O-' ? 'selected' : ''}>O-</option>
              </select>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:0.75rem; margin-top:1.5rem;">
            <button type="button" class="btn btn-secondary" onclick="window.MedLensApp.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      `;
      break;

    case 'feature-detail':
      bodyHtml = `
        <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
          <i data-lucide="x"></i>
        </button>
        <div class="badge badge-mint" style="margin-bottom:0.75rem;">MedLens Capability</div>
        <h3 style="font-size:1.5rem; color:var(--color-dark-green); margin-bottom:0.75rem;">${escapeHtml(payload.title || 'Feature Explanation')}</h3>
        
        <p style="font-size:0.98rem; color:var(--color-text-main); line-height:1.6; margin-bottom:1.5rem;">
          ${escapeHtml(payload.summary || 'MedLens provides comprehensive medical report interpretation and health timeline tracking.')}
        </p>

        <div style="background:var(--color-very-light-mint); border-left:4px solid var(--color-emerald); padding:1rem; border-radius:var(--radius-md); font-size:0.88rem; color:var(--color-dark-green); line-height:1.5;">
          <strong>Key Benefit:</strong> Reduces complexity, eliminates confusing medical jargon, and gives patients and doctors a shared baseline.
        </div>

        <div style="margin-top:1.75rem; text-align:right;">
          <button class="btn btn-primary" onclick="window.MedLensApp.closeModal()">Understood</button>
        </div>
      `;
      break;

    case 'parameter-explanation':
      bodyHtml = `
        <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
          <i data-lucide="x"></i>
        </button>
        <div class="view-explanation-topbar" style="display:flex; align-items:center; gap:0.65rem; margin-bottom:1rem; padding-right:2.5rem;">
          <button type="button" class="explain-audio-btn" id="explain-audio-btn" title="Read explanation aloud" aria-label="Read explanation aloud" style="width:38px; height:38px; border-radius:50%; background:var(--color-very-light-mint); color:var(--color-dark-green); border:1.5px solid var(--color-emerald); display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s ease; box-shadow:var(--shadow-sm); flex-shrink:0; padding:0;">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:19px; height:19px; display:block;">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
          </button>
          <span class="badge badge-mint" style="font-size:0.85rem; padding:0.35rem 0.75rem;">View Explanation • ${escapeHtml(payload.category || 'Biomarker')}</span>
        </div>
        <div id="explanation-readable-content">
          <h3 style="font-size:1.5rem; color:var(--color-dark-green); margin-bottom:0.5rem;">${escapeHtml(payload.title || 'Parameter Explanation')}</h3>
          <p style="font-size:0.85rem; color:var(--color-emerald); font-weight:700; margin-bottom:1rem;">Standard Reference: ${escapeHtml(payload.normalRange || 'Normal range varies')}</p>

          <p style="font-size:0.95rem; color:var(--color-text-main); line-height:1.6; margin-bottom:1rem;">
            ${escapeHtml(payload.summary || 'Detailed clinical biomarker explanation.')}
          </p>

          <div style="background:var(--color-pale-green); border-radius:var(--radius-md); padding:1rem; margin-bottom:1rem; border:1px solid var(--color-light-mint);">
            <strong style="color:var(--color-dark-green); font-size:0.9rem;">What it means:</strong>
            <p style="font-size:0.88rem; color:var(--color-text-secondary); margin-top:0.25rem;">${escapeHtml(payload.whatItMeans || 'Consult your healthcare provider for personalized clinical interpretation.')}</p>
          </div>

          <div style="background:var(--color-soft-mint); border-radius:var(--radius-md); padding:1rem; margin-bottom:1.5rem; border:1px solid var(--color-light-mint);">
            <strong style="color:var(--color-dark-green); font-size:0.9rem;">Lifestyle Support:</strong>
            <p style="font-size:0.88rem; color:var(--color-text-secondary); margin-top:0.25rem;">${escapeHtml(payload.lifestyleTip || 'Maintain balanced nutrition, regular hydration, and routine follow-up testing.')}</p>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:0.75rem; flex-wrap:wrap;">
          ${payload._returnReport ? `<button type="button" class="btn btn-secondary" id="back-to-report-btn">← Back to Report</button>` : ''}
          <button class="btn btn-primary" onclick="window.MedLensApp.closeModal()">Got it</button>
        </div>
      `;
      break;

    case 'notifications':
      bodyHtml = `
        <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
          <i data-lucide="x"></i>
        </button>
        <h3 style="font-size:1.3rem; color:var(--color-dark-green); margin-bottom:1rem;">Notifications</h3>
        
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          <div style="padding:0.85rem; background:var(--color-very-light-mint); border-radius:var(--radius-md); border-left:3px solid var(--color-emerald);">
            <strong style="font-size:0.88rem; color:var(--color-dark-green);">Report Locker Active</strong>
            <p style="font-size:0.8rem; color:var(--color-text-secondary);">Your medical reports are encrypted and stored in your Locker.</p>
          </div>
          <div style="padding:0.85rem; background:var(--color-pale-green); border-radius:var(--radius-md); border-left:3px solid var(--color-emerald);">
            <strong style="font-size:0.88rem; color:var(--color-dark-green);">Profile Synced</strong>
            <p style="font-size:0.8rem; color:var(--color-text-secondary);">Basic onboarding details saved for ${escapeHtml((window.MedLensApp && window.MedLensApp.getUserDetails()?.fullName) || 'Patient')}.</p>
          </div>
        </div>
      `;
      break;

    default:
      bodyHtml = `
        <button class="modal-close-btn" onclick="window.MedLensApp.closeModal()" aria-label="Close modal">
          <i data-lucide="x"></i>
        </button>
        <h3 style="font-size:1.4rem; color:var(--color-dark-green); margin-bottom:0.5rem;">${escapeHtml(payload.title || 'Notification')}</h3>
        <p style="font-size:0.9rem; color:var(--color-text-secondary); margin-bottom:1.5rem;">MedLens feature ready.</p>
        <div style="text-align:right;">
          <button class="btn btn-primary" onclick="window.MedLensApp.closeModal()">OK</button>
        </div>
      `;
      break;
  }

  modalContent.innerHTML = bodyHtml;
  if (window.lucide) window.lucide.createIcons();

  function bindSpeechToggle(btnEl, getSpeechTextFn) {
    if (!btnEl) return;
    btnEl.addEventListener('click', () => {
      if ('speechSynthesis' in window) {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          btnEl.style.background = 'var(--color-very-light-mint)';
          btnEl.style.color = 'var(--color-dark-green)';
          return;
        }
        const speechText = getSpeechTextFn();
        if (!speechText) return;
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.rate = 0.98;
        btnEl.style.background = 'var(--color-emerald)';
        btnEl.style.color = '#FFFFFF';
        utterance.onend = () => {
          btnEl.style.background = 'var(--color-very-light-mint)';
          btnEl.style.color = 'var(--color-dark-green)';
        };
        utterance.onerror = () => {
          btnEl.style.background = 'var(--color-very-light-mint)';
          btnEl.style.color = 'var(--color-dark-green)';
        };
        window.speechSynthesis.speak(utterance);
      } else if (window.MedLensApp) {
        window.MedLensApp.showToast('Audio playback is not supported in this browser.');
      }
    });
  }

  const explainAudioBtn = modalContent.querySelector('#explain-audio-btn');
  bindSpeechToggle(explainAudioBtn, () => {
    const readableContainer = modalContent.querySelector('#explanation-readable-content');
    return (readableContainer && readableContainer.innerText ? readableContainer.innerText.replace(/\s+/g, ' ').trim() : '') || [
      payload.title || 'Parameter Explanation',
      payload.normalRange ? `Standard reference range: ${payload.normalRange}.` : '',
      payload.summary || '',
      payload.whatItMeans ? `What it means: ${payload.whatItMeans}` : '',
      payload.lifestyleTip ? `Lifestyle support: ${payload.lifestyleTip}` : ''
    ].filter(Boolean).join(' ');
  });

  const reportSummaryAudioBtn = modalContent.querySelector('#report-summary-audio-btn');
  bindSpeechToggle(reportSummaryAudioBtn, () => {
    const summaryEl = modalContent.querySelector('#report-summary-readable-text');
    const summaryText = summaryEl ? summaryEl.innerText.trim() : ((payload.aiSummary && payload.aiSummary.note) || '');
    const paramLines = (payload.parameters || []).map(p => `${p.name}: ${p.value} (${p.status}, standard range ${p.range})`).join('. ');
    return [payload.title || 'Medical Report', summaryText, paramLines].filter(Boolean).join('. ');
  });

  const backToReportBtn = modalContent.querySelector('#back-to-report-btn');
  if (backToReportBtn && payload._returnReport) {
    backToReportBtn.addEventListener('click', () => {
      if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      window.MedLensApp.openModal('report-details', payload._returnReport);
    });
  }

  modalContent.querySelectorAll('.modal-param-explain-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-param-idx'), 10);
      const param = (payload.parameters || [])[idx];
      if (!param || !window.MedLensApp) return;
      const baseExplanation = (param.code && MEDICAL_EXPLANATIONS && MEDICAL_EXPLANATIONS[param.code]) || {
        title: `${param.name} (${param.value})`,
        category: payload.title || 'Clinical Biomarker',
        normalRange: param.range || 'Standard reference range',
        summary: `${param.name} was measured at ${param.value} (${param.status || 'Analyzed'}) against the reference range of ${param.range || 'normal limits'}.`,
        whatItMeans: param.status === 'Normal'
          ? `Your ${param.name} result of ${param.value} falls within the expected healthy reference range (${param.range}).`
          : `Your ${param.name} result of ${param.value} is outside the standard reference range (${param.range}) and is marked "${param.status}". Please review with your clinician.`,
        lifestyleTip: 'Maintain balanced nutrition, regular hydration, and routine follow-up testing as advised by your doctor.'
      };
      window.MedLensApp.openModal('parameter-explanation', {
        ...baseExplanation,
        _returnReport: payload
      });
    });
  });

  const modalReportShareBtn = modalContent.querySelector('#modal-report-share-btn');
  if (modalReportShareBtn) {
    modalReportShareBtn.addEventListener('click', () => {
      window.MedLensApp.openModal('share-report', payload);
    });
  }

  const editProfileForm = modalContent.querySelector('#edit-profile-form');
  if (editProfileForm) {
    const editDobInput = modalContent.querySelector('#edit-dob');
    const errEditDob = modalContent.querySelector('#err-edit-dob');
    const editPhoneInput = modalContent.querySelector('#edit-phone');
    const errEditPhone = modalContent.querySelector('#err-edit-phone');
    const editEmergencyInput = modalContent.querySelector('#edit-emergency');
    const errEditEmergency = modalContent.querySelector('#err-edit-emergency');

    bindDobPickerField(editDobInput, errEditDob);
    bindNumericOnlyField(editPhoneInput, errEditPhone, 'Phone Number');
    bindNumericOnlyField(editEmergencyInput, errEditEmergency, 'Emergency Contact');

    editProfileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const isDobValid = validateDobField(editDobInput, errEditDob, true);
      const isPhoneValid = validateNumericPhoneField(editPhoneInput, errEditPhone, 'Phone Number', true);
      const isEmergencyValid = validateNumericPhoneField(editEmergencyInput, errEditEmergency, 'Emergency Contact', false);

      if (!isDobValid || !isPhoneValid || !isEmergencyValid) {
        return;
      }

      const nameVal = sanitizePlainText(modalContent.querySelector('#edit-name').value) || 'Patient';
      const emailVal = sanitizePlainText(modalContent.querySelector('#edit-email').value);
      const phoneVal = sanitizePlainText(editPhoneInput.value);
      const rawDobVal = sanitizePlainText(editDobInput.value);
      const dobVal = (payload.dob && toIsoDateValue(payload.dob) === rawDobVal) ? payload.dob : rawDobVal;
      const genderVal = sanitizePlainText(modalContent.querySelector('#edit-gender').value);
      const bloodVal = sanitizePlainText(modalContent.querySelector('#edit-blood').value);
      const rawEmergencyVal = editEmergencyInput ? sanitizePlainText(editEmergencyInput.value) : '';
      const emergencyVal = (payload.emergencyContact && extractNumericDigits(payload.emergencyContact) === rawEmergencyVal && rawEmergencyVal !== '')
        ? rawEmergencyVal
        : rawEmergencyVal;

      window.MedLensApp.updateUserProfile({
        fullName: nameVal,
        email: emailVal,
        phone: phoneVal,
        dob: dobVal,
        gender: genderVal,
        bloodGroup: bloodVal,
        emergencyContact: emergencyVal || payload.emergencyContact || ''
      });

      window.MedLensApp.closeModal();
      window.MedLensApp.showToast('Profile updated successfully.');
    });
  }

  const copyBtn = modalContent.querySelector('#share-copy-link-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(window.location.href);
      window.MedLensApp.showToast('✓ Share link copied to clipboard!');
    });
  }

  const downloadBtn = modalContent.querySelector('#share-download-pdf-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      window.MedLensApp.showToast('✓ Document download started.');
      window.MedLensApp.closeModal();
    });
  }

  const modalFileInput = modalContent.querySelector('#modal-file-input');
  if (modalFileInput) {
    modalFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const safeFileName = sanitizePlainText(file.name) || 'Uploaded_Report.pdf';
        const uploadedEntry = {
          fileName: safeFileName,
          name: safeFileName.replace(/\.[^/.]+$/, ''),
          reportType: 'Uploaded Document (Unverified)',
          fileSize: file.size ? `${Math.max(0.1, (file.size / (1024 * 1024))).toFixed(1)} MB` : '1.2 MB',
          uploadDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          status: 'Unable to Analyze',
          badgeClass: 'badge-review',
          isUploaded: true,
          isSample: false,
          demoTabKey: null
        };
        window.MedLensApp.addReportFile(uploadedEntry);
        window.MedLensApp.render();
        window.MedLensApp.openModal('report-unrecognized', uploadedEntry);
      }
    });
  }
}
