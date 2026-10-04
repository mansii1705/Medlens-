// MEDLENS - ONBOARDING / BASIC DETAILS (1-TIME ONLY)

import { createBrandLogoHtml } from './navbar.js';
import {
  escapeHtml,
  sanitizePlainText,
  getTodayIsoDate,
  toIsoDateValue,
  extractNumericDigits,
  bindDobPickerField,
  validateDobField,
  bindNumericOnlyField,
  validateNumericPhoneField
} from '../data/mockData.js';

export function renderOnboardingPage(containerEl) {
  const userDetails = window.MedLensApp.getUserDetails() || {};

  containerEl.innerHTML = `
    <div style="min-height:100vh; background:var(--color-bg); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2rem 1rem;">
      <div style="width:100%; max-width:480px; background:var(--color-white); border-radius:var(--radius-xl); border:1px solid var(--color-border); box-shadow:var(--shadow-xl); padding:2.25rem;">
        
        <div style="text-align:center; margin-bottom:1.75rem;">
          ${createBrandLogoHtml()}
          <div class="badge badge-mint" style="margin-top:1rem; margin-bottom:0.5rem;">Step 1 of 1 • Profile Setup</div>
          <h2 style="font-size:1.75rem; color:var(--color-dark-green); margin-bottom:0.4rem;">Complete Your Basic Details</h2>
          <p style="font-size:0.9rem; color:var(--color-text-secondary);">Help us personalize your MedLens health record.</p>
        </div>

        <form id="onboarding-form" novalidate>
          <div class="form-group">
            <label class="form-label" for="ob-fullname">Full Name *</label>
            <input type="text" id="ob-fullname" class="form-input" placeholder="e.g. Full Name" value="${escapeHtml(userDetails.fullName || '')}" required>
          </div>

          <div class="onboarding-grid-2">
            <div class="form-group">
              <label class="form-label" for="ob-dob">Date of Birth *</label>
              <input type="date" id="ob-dob" class="form-input" min="1900-01-01" max="${getTodayIsoDate()}" value="${escapeHtml(toIsoDateValue(userDetails.dob || ''))}" required>
              <span class="field-error" id="err-ob-dob" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
            </div>

            <div class="form-group">
              <label class="form-label" for="ob-gender">Gender *</label>
              <select id="ob-gender" class="form-input" required>
                <option value="Female" ${userDetails.gender === 'Female' ? 'selected' : ''}>Female</option>
                <option value="Male" ${userDetails.gender === 'Male' ? 'selected' : ''}>Male</option>
                <option value="Other" ${userDetails.gender === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
          </div>

          <div class="onboarding-grid-2">
            <div class="form-group">
              <label class="form-label" for="ob-email">Email Address *</label>
              <input type="email" id="ob-email" class="form-input" placeholder="name@example.com" value="${escapeHtml(userDetails.email || '')}" required>
            </div>

            <div class="form-group">
              <label class="form-label" for="ob-blood">Blood Group *</label>
              <select id="ob-blood" class="form-input" required>
                <option value="A+" ${userDetails.bloodGroup === 'A+' ? 'selected' : ''}>A+</option>
                <option value="A-" ${userDetails.bloodGroup === 'A-' ? 'selected' : ''}>A-</option>
                <option value="B+" ${userDetails.bloodGroup === 'B+' ? 'selected' : ''}>B+</option>
                <option value="B-" ${userDetails.bloodGroup === 'B-' ? 'selected' : ''}>B-</option>
                <option value="AB+" ${userDetails.bloodGroup === 'AB+' ? 'selected' : ''}>AB+</option>
                <option value="AB-" ${userDetails.bloodGroup === 'AB-' ? 'selected' : ''}>AB-</option>
                <option value="O+" ${userDetails.bloodGroup === 'O+' || !userDetails.bloodGroup ? 'selected' : ''}>O+</option>
                <option value="O-" ${userDetails.bloodGroup === 'O-' ? 'selected' : ''}>O-</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="ob-phone">Phone Number *</label>
            <input type="tel" id="ob-phone" class="form-input" inputmode="numeric" pattern="[0-9]{10,15}" maxlength="15" placeholder="e.g. 9876543210" value="${escapeHtml(extractNumericDigits(userDetails.phone || ''))}" required>
            <span class="field-error" id="err-ob-phone" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
          </div>

          <div class="form-group">
            <label class="form-label" for="ob-allergies">Known Allergies (Optional)</label>
            <input type="text" id="ob-allergies" class="form-input" placeholder="e.g. Penicillin, Dust, Peanuts" value="${escapeHtml(userDetails.allergies || '')}">
          </div>

          <div class="form-group">
            <label class="form-label" for="ob-emergency">Emergency Contact (Optional)</label>
            <input type="tel" id="ob-emergency" class="form-input" inputmode="numeric" pattern="[0-9]{10,15}" maxlength="15" placeholder="e.g. 9876500000" value="${escapeHtml(extractNumericDigits(userDetails.emergencyContact || ''))}">
            <span class="field-error" id="err-ob-emergency" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
          </div>

          <button type="submit" class="btn btn-primary btn-full btn-lg" style="margin-top:1rem;">
            <span>Continue →</span>
          </button>
        </form>

      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  const obDobInput = containerEl.querySelector('#ob-dob');
  const errObDob = containerEl.querySelector('#err-ob-dob');
  const obPhoneInput = containerEl.querySelector('#ob-phone');
  const errObPhone = containerEl.querySelector('#err-ob-phone');
  const obEmergencyInput = containerEl.querySelector('#ob-emergency');
  const errObEmergency = containerEl.querySelector('#err-ob-emergency');

  bindDobPickerField(obDobInput, errObDob);
  bindNumericOnlyField(obPhoneInput, errObPhone, 'Phone Number');
  bindNumericOnlyField(obEmergencyInput, errObEmergency, 'Emergency Contact');

  const form = containerEl.querySelector('#onboarding-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const isDobValid = validateDobField(obDobInput, errObDob, true);
      const isPhoneValid = validateNumericPhoneField(obPhoneInput, errObPhone, 'Phone Number', true);
      const isEmergencyValid = validateNumericPhoneField(obEmergencyInput, errObEmergency, 'Emergency Contact', false);

      if (!isDobValid || !isPhoneValid || !isEmergencyValid) {
        return;
      }

      const rawDobVal = sanitizePlainText(obDobInput.value);
      const dobVal = (userDetails.dob && toIsoDateValue(userDetails.dob) === rawDobVal) ? userDetails.dob : rawDobVal;

      const basicData = {
        fullName: sanitizePlainText(containerEl.querySelector('#ob-fullname').value) || 'Patient',
        dob: dobVal,
        gender: sanitizePlainText(containerEl.querySelector('#ob-gender').value),
        email: sanitizePlainText(containerEl.querySelector('#ob-email').value),
        bloodGroup: sanitizePlainText(containerEl.querySelector('#ob-blood').value),
        phone: sanitizePlainText(obPhoneInput.value),
        allergies: sanitizePlainText(containerEl.querySelector('#ob-allergies').value),
        emergencyContact: sanitizePlainText(obEmergencyInput.value),
        avatar: userDetails.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
      };
      window.MedLensApp.completeOnboarding(basicData);
    });
  }
}
