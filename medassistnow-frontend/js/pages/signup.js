/**
 * User Signup/Register Page Script
 * Handle user registration
 */

document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.querySelector('form');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
});

async function handleSignup(e) {
  e.preventDefault();

  const firstName = document.getElementById('firstName')?.value.trim();
  const lastName = document.getElementById('lastName')?.value.trim();
  const email = document.getElementById('email')?.value.trim();
  const password = document.getElementById('password')?.value;
  const confirmPassword = document.getElementById('confirmPassword')?.value;
  
  const name = `${firstName} ${lastName}`.trim();

  console.log('Form data:', { firstName, lastName, name, email, password: '***' });

  // Validation
  if (!firstName || !lastName || !email || !password) {
    Utils.showToast('Please fill in all required fields', 'error');
    return;
  }

  if (!Utils.isValidEmail(email)) {
    Utils.showToast('Please enter a valid email', 'error');
    return;
  }

  if (password.length < 6) {
    Utils.showToast('Password must be at least 6 characters', 'error');
    return;
  }

  if (password !== confirmPassword) {
    Utils.showToast('Passwords do not match', 'error');
    return;
  }

  try {
    Utils.showLoading();

    await AuthService.register({
      name,
      email,
      password,
      role: 'user'
    });

    Utils.hideLoading();
    Utils.showToast('Registration successful! Please login.', 'success');
    
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  } catch (error) {
    Utils.hideLoading();
    Utils.showToast(error.message || 'Registration failed', 'error');
  }
}
