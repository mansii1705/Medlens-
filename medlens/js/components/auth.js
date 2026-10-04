// MEDLENS - AUTHENTICATION COMPONENT

import { createBrandLogoHtml } from './navbar.js';
import { sanitizePlainText } from '../data/mockData.js';

export function renderAuthPage(containerEl) {
  let isSignUpMode = false;
  let showPassword = false;

  function updateAuthRender() {
    containerEl.innerHTML = `
      <div class="auth-wrapper">
        <div class="auth-brand-side">
          ${createBrandLogoHtml()}

          <div class="auth-brand-content">
            <h2>Healthcare Made Clearer.</h2>
            <p>Sign in to access your personal medical reports, biomarker timelines, and longitudinal trends in one place.</p>
            
            <div class="auth-illustration-box">
              <svg width="220" height="200" viewBox="0 0 220 200" fill="none">
                <path d="M110 20 C150 20 180 50 180 90 C180 145 110 185 110 185 C110 185 40 145 40 90 C40 50 70 20 110 20 Z" fill="rgba(16, 185, 129, 0.2)" stroke="#10B981" stroke-width="3"/>
                <path d="M110 65 L110 125" stroke="#A7F3D0" stroke-width="8" stroke-linecap="round"/>
                <path d="M80 95 L140 95" stroke="#A7F3D0" stroke-width="8" stroke-linecap="round"/>
              </svg>
            </div>
          </div>

          <div style="font-size:0.85rem; color:var(--color-light-mint); opacity:0.8;">
            © 2026 MedLens Inc. • Clinical Grade Health Records
          </div>
        </div>

        <div class="auth-form-side">
          <div class="auth-card">
            <div class="auth-header">
              <h3>${isSignUpMode ? 'Create an Account' : 'Welcome Back'}</h3>
              <p>${isSignUpMode ? 'Start tracking your medical reports and timeline today' : 'Enter your credentials to access your health dashboard'}</p>
            </div>

            <div id="auth-error-banner" role="alert" style="display:none; background:#FFE4E6; border:1px solid #FECDD3; color:#BE123C; padding:0.75rem 1rem; border-radius:var(--radius-md); font-size:0.84rem; font-weight:600; margin-bottom:1rem;"></div>

            <form id="auth-form" novalidate>
              ${isSignUpMode ? `
                <div class="form-group">
                  <label class="form-label" for="auth-fullname">Full Name</label>
                  <div class="input-wrapper">
                    <input type="text" id="auth-fullname" class="form-input" placeholder="e.g. Anshika Sharma" required>
                  </div>
                  <span class="field-error" id="err-fullname" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
                </div>
              ` : ''}

              <div class="form-group">
                <label class="form-label" for="auth-email">Email Address</label>
                <div class="input-wrapper">
                  <input type="email" id="auth-email" class="form-input" placeholder="name@example.com" value="" required>
                </div>
                <span class="field-error" id="err-email" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
              </div>

              <div class="form-group">
                <label class="form-label" for="auth-password">Password</label>
                <div class="input-wrapper">
                  <input type="${showPassword ? 'text' : 'password'}" id="auth-password" class="form-input" placeholder="Enter your password" value="" required>
                  <span class="input-icon-right" id="toggle-pw-btn" title="Toggle password visibility">
                    <i data-lucide="${showPassword ? 'eye-off' : 'eye'}" style="width:18px;height:18px;"></i>
                  </span>
                </div>
                <span class="field-error" id="err-password" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
                
                ${isSignUpMode ? `
                  <div class="password-strength-bar">
                    <div class="password-strength-fill" id="pw-strength-fill"></div>
                  </div>
                ` : ''}
              </div>

              ${isSignUpMode ? `
                <div class="form-group">
                  <label class="form-label" for="auth-confirm-password">Confirm Password</label>
                  <div class="input-wrapper">
                    <input type="password" id="auth-confirm-password" class="form-input" placeholder="Re-enter your password" value="" required>
                  </div>
                  <span class="field-error" id="err-confirm-password" style="display:none;color:#F43F5E;font-size:0.75rem;margin-top:0.2rem;"></span>
                </div>
              ` : ''}

              <div class="form-options">
                <label class="checkbox-label">
                  <input type="checkbox" id="auth-terms" checked>
                  <span>${isSignUpMode ? 'I accept the Terms & Privacy Policy' : 'Remember my device'}</span>
                </label>
                ${!isSignUpMode ? `<a class="forgot-link" id="forgot-pw-link" style="cursor:pointer;">Forgot password?</a>` : ''}
              </div>
              <span class="field-error" id="err-terms" style="display:none;color:#F43F5E;font-size:0.75rem;margin-bottom:0.8rem;"></span>

              <button type="submit" class="btn btn-primary btn-full btn-lg" id="auth-submit-btn">
                <span id="btn-text">${isSignUpMode ? 'Create MedLens Account' : 'Sign In'}</span>
                <i data-lucide="arrow-right" style="width:18px;height:18px;"></i>
              </button>
            </form>

            <div class="auth-switch-text">
              ${isSignUpMode ? 'Already have an account?' : "Don't have an account?"}
              <span class="auth-switch-link" id="toggle-auth-mode">
                ${isSignUpMode ? 'Sign In' : 'Create Account'}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    const togglePwBtn = containerEl.querySelector('#toggle-pw-btn');
    if (togglePwBtn) {
      togglePwBtn.addEventListener('click', () => {
        showPassword = !showPassword;
        const pwInput = containerEl.querySelector('#auth-password');
        if (pwInput) {
          pwInput.type = showPassword ? 'text' : 'password';
        }
        togglePwBtn.innerHTML = `<i data-lucide="${showPassword ? 'eye-off' : 'eye'}" style="width:18px;height:18px;"></i>`;
        if (window.lucide) window.lucide.createIcons();
      });
    }

    const pwInput = containerEl.querySelector('#auth-password');
    const strengthFill = containerEl.querySelector('#pw-strength-fill');
    if (pwInput && strengthFill) {
      pwInput.addEventListener('input', () => {
        const val = pwInput.value;
        if (!val) {
          strengthFill.style.width = '0%';
        } else if (val.length < 6) {
          strengthFill.style.width = '33%';
          strengthFill.style.backgroundColor = '#F43F5E';
        } else if (val.length < 10) {
          strengthFill.style.width = '66%';
          strengthFill.style.backgroundColor = '#F59E0B';
        } else {
          strengthFill.style.width = '100%';
          strengthFill.style.backgroundColor = '#10B981';
        }
      });
    }

    const toggleModeLink = containerEl.querySelector('#toggle-auth-mode');
    if (toggleModeLink) {
      toggleModeLink.addEventListener('click', () => {
        isSignUpMode = !isSignUpMode;
        updateAuthRender();
      });
    }

    function clearAuthErrors() {
      const banner = containerEl.querySelector('#auth-error-banner');
      if (banner) {
        banner.style.display = 'none';
        banner.textContent = '';
      }
      containerEl.querySelectorAll('.field-error').forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
      });
    }

    function showFieldError(id, msg) {
      const el = containerEl.querySelector(id);
      if (el) {
        el.textContent = msg;
        el.style.display = 'block';
      }
      const banner = containerEl.querySelector('#auth-error-banner');
      if (banner && banner.style.display === 'none') {
        banner.textContent = msg;
        banner.style.display = 'block';
      }
    }

    const authForm = containerEl.querySelector('#auth-form');
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearAuthErrors();

        const emailInput = containerEl.querySelector('#auth-email');
        const passwordInput = containerEl.querySelector('#auth-password');
        const emailVal = emailInput ? emailInput.value.trim() : '';
        const pwVal = passwordInput ? passwordInput.value : '';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let hasError = false;
        let fullNameVal = '';

        if (isSignUpMode) {
          const fullnameInput = containerEl.querySelector('#auth-fullname');
          fullNameVal = fullnameInput ? sanitizePlainText(fullnameInput.value) : '';
          if (!fullNameVal || fullNameVal.length < 2) {
            showFieldError('#err-fullname', 'Please enter your full name (at least 2 characters).');
            hasError = true;
          }
        }

        if (!emailVal || !emailRegex.test(emailVal)) {
          showFieldError('#err-email', 'Please enter a valid email address.');
          hasError = true;
        }

        if (!pwVal || pwVal.length < 6) {
          showFieldError('#err-password', 'Invalid password. Password must be at least 6 characters.');
          hasError = true;
        }

        if (isSignUpMode) {
          const confirmInput = containerEl.querySelector('#auth-confirm-password');
          const confirmVal = confirmInput ? confirmInput.value : '';
          if (confirmVal !== pwVal) {
            showFieldError('#err-confirm-password', 'Passwords do not match.');
            hasError = true;
          }
          const termsCheckbox = containerEl.querySelector('#auth-terms');
          if (termsCheckbox && !termsCheckbox.checked) {
            showFieldError('#err-terms', 'Please accept the Terms & Privacy Policy to continue.');
            hasError = true;
          }
        } else if (!hasError && window.MedLensApp) {
          // B01 FIX: Validate Sign-In credentials against registered accounts
          const authCheck = window.MedLensApp.validateLoginCredentials(emailVal, pwVal);
          if (!authCheck.valid) {
            showFieldError(authCheck.field === 'email' ? '#err-email' : '#err-password', authCheck.message);
            hasError = true;
          }
        }

        if (hasError) {
          return;
        }

        const submitBtn = containerEl.querySelector('#auth-submit-btn');
        const btnText = containerEl.querySelector('#btn-text');
        if (submitBtn) submitBtn.disabled = true;
        if (btnText) btnText.innerText = isSignUpMode ? 'Creating Account...' : 'Signing In...';

        setTimeout(() => {
          if (window.MedLensApp) {
            if (isSignUpMode) {
              window.MedLensApp.loginSuccess({
                fullName: fullNameVal,
                email: emailVal,
                password: pwVal
              }, true);
            } else {
              window.MedLensApp.loginSuccess({
                email: emailVal,
                password: pwVal
              }, false);
            }
          }
        }, 250);
      });
    }
  }

  updateAuthRender();
}
