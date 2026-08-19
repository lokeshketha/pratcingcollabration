/* ==========================================================================
   NexusAuth - Interactive Logic (JavaScript)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------------
  // 1. Theme Switcher (Dark / Light Mode)
  // ------------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;

  // Load saved theme from localStorage or default to 'dark'
  const savedTheme = localStorage.getItem('nexus_auth_theme') || 'dark';
  htmlElement.setAttribute('data-theme', savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('nexus_auth_theme', newTheme);
    
    showToast(`Switched to ${newTheme.toUpperCase()} theme`, 'success');
  });

  // ------------------------------------------------------------------------
  // 2. Tab Switcher (Sign In vs Create Account)
  // ------------------------------------------------------------------------
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const authTabsContainer = document.querySelector('.auth-tabs');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');

  function switchTab(tab) {
    if (tab === 'login') {
      tabLogin.classList.add('active');
      tabLogin.setAttribute('aria-selected', 'true');
      tabSignup.classList.remove('active');
      tabSignup.setAttribute('aria-selected', 'false');
      
      authTabsContainer.removeAttribute('data-active');
      
      signupForm.classList.remove('active-form');
      signupForm.classList.add('hidden-form');
      
      loginForm.classList.remove('hidden-form');
      loginForm.classList.add('active-form');
    } else {
      tabSignup.classList.add('active');
      tabSignup.setAttribute('aria-selected', 'true');
      tabLogin.classList.remove('active');
      tabLogin.setAttribute('aria-selected', 'false');
      
      authTabsContainer.setAttribute('data-active', 'signup');
      
      loginForm.classList.remove('active-form');
      loginForm.classList.add('hidden-form');
      
      signupForm.classList.remove('hidden-form');
      signupForm.classList.add('active-form');
    }
    clearFormErrors();
  }

  tabLogin.addEventListener('click', () => switchTab('login'));
  tabSignup.addEventListener('click', () => switchTab('signup'));

  // ------------------------------------------------------------------------
  // 3. Password Visibility Toggle
  // ------------------------------------------------------------------------
  const togglePasswordBtns = document.querySelectorAll('.toggle-password');

  togglePasswordBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      const eyeOpen = btn.querySelector('.eye-open');
      const eyeClosed = btn.querySelector('.eye-closed');

      if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.classList.add('hidden');
        eyeClosed.classList.remove('hidden');
      } else {
        input.type = 'password';
        eyeOpen.classList.remove('hidden');
        eyeClosed.classList.add('hidden');
      }
    });
  });

  // ------------------------------------------------------------------------
  // 4. Password Strength Indicator (Sign Up)
  // ------------------------------------------------------------------------
  const signupPasswordInput = document.getElementById('signup-password');
  const strengthFill = document.getElementById('strength-fill');
  const strengthText = document.getElementById('strength-text');

  if (signupPasswordInput) {
    signupPasswordInput.addEventListener('input', (e) => {
      const val = e.target.value;
      const strength = calculatePasswordStrength(val);

      strengthFill.style.width = `${strength.percent}%`;
      strengthFill.style.backgroundColor = strength.color;
      strengthText.textContent = strength.label;
      strengthText.style.color = strength.color;
    });
  }

  function calculatePasswordStrength(password) {
    if (!password) return { percent: 0, label: 'Password strength', color: 'var(--text-muted)' };

    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    if (/[^A-Za-z0-9]/.test(password)) score += 25;

    if (score <= 25) return { percent: 25, label: 'Weak password', color: 'var(--error-color)' };
    if (score <= 50) return { percent: 50, label: 'Fair password', color: 'var(--warning-color)' };
    if (score <= 75) return { percent: 75, label: 'Good password', color: '#3b82f6' };
    return { percent: 100, label: 'Strong password!', color: 'var(--success-color)' };
  }

  // ------------------------------------------------------------------------
  // 5. Validation Helpers & Error Reset
  // ------------------------------------------------------------------------
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function setFieldError(inputEl, errorEl, message) {
    const inputGroup = inputEl.closest('.input-group');
    inputGroup.classList.add('has-error');
    if (errorEl) errorEl.textContent = message;
  }

  function clearFieldError(inputEl) {
    const inputGroup = inputEl.closest('.input-group');
    if (inputGroup) {
      inputGroup.classList.remove('has-error');
    }
  }

  function clearFormErrors() {
    document.querySelectorAll('.input-group').forEach((group) => group.classList.remove('has-error'));
  }

  // Remove error on input focus/typing
  document.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => clearFieldError(input));
  });

  // ------------------------------------------------------------------------
  // 6. Form Submission Handlers
  // ------------------------------------------------------------------------
  
  // Login Form Submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormErrors();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const submitBtn = document.getElementById('login-submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');

    let isValid = true;

    if (!emailInput.value.trim() || !validateEmail(emailInput.value)) {
      setFieldError(emailInput, document.getElementById('login-email-error'), 'Please enter a valid email address.');
      isValid = false;
    }

    if (!passwordInput.value) {
      setFieldError(passwordInput, document.getElementById('login-password-error'), 'Password is required.');
      isValid = false;
    }

    if (!isValid) return;

    // Simulate API Request Loading
    submitBtn.disabled = true;
    btnText.textContent = 'Signing in...';
    btnSpinner.classList.remove('hidden');

    setTimeout(() => {
      submitBtn.disabled = false;
      btnText.textContent = 'Sign In';
      btnSpinner.classList.add('hidden');
      
      showToast(`Welcome back! Logged in as ${emailInput.value}`, 'success');
      loginForm.reset();
    }, 1500);
  });

  // Sign Up Form Submit
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFormErrors();

    const nameInput = document.getElementById('signup-name');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');
    const termsCheck = document.getElementById('terms-check');
    const submitBtn = document.getElementById('signup-submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');

    let isValid = true;

    if (!nameInput.value.trim()) {
      setFieldError(nameInput, document.getElementById('signup-name-error'), 'Please enter your full name.');
      isValid = false;
    }

    if (!emailInput.value.trim() || !validateEmail(emailInput.value)) {
      setFieldError(emailInput, document.getElementById('signup-email-error'), 'Please enter a valid email address.');
      isValid = false;
    }

    if (!passwordInput.value || passwordInput.value.length < 8) {
      setFieldError(passwordInput, document.getElementById('signup-password-error'), 'Password must be at least 8 characters.');
      isValid = false;
    }

    if (!termsCheck.checked) {
      showToast('Please agree to the Terms of Service to continue.', 'error');
      isValid = false;
    }

    if (!isValid) return;

    // Simulate API Request Loading
    submitBtn.disabled = true;
    btnText.textContent = 'Creating account...';
    btnSpinner.classList.remove('hidden');

    setTimeout(() => {
      submitBtn.disabled = false;
      btnText.textContent = 'Create Account';
      btnSpinner.classList.add('hidden');
      
      showToast(`Account created successfully for ${nameInput.value}!`, 'success');
      signupForm.reset();
      strengthFill.style.width = '0%';
      strengthText.textContent = 'Password strength';
      switchTab('login');
    }, 1500);
  });

  // Forgot Password Link
  document.getElementById('forgot-password-link').addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    if (email && validateEmail(email)) {
      showToast(`Password reset link sent to ${email}`, 'success');
    } else {
      showToast('Please type your registered email address first.', 'error');
      document.getElementById('login-email').focus();
    }
  });

  // Social Login Mock
  document.querySelectorAll('.social-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const provider = btn.textContent.trim();
      showToast(`Redirecting to ${provider} authentication...`, 'success');
    });
  });

  // ------------------------------------------------------------------------
  // 7. Toast Notification Utility
  // ------------------------------------------------------------------------
  function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? '✓' : '⚠️';
    toast.innerHTML = `<span style="font-weight:bold; font-size:1.1rem;">${icon}</span> <span>${message}</span>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
});
