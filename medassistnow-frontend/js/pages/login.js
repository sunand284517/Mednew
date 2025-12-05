/**
 * User Login Page Script
 * Handle user authentication
 */

document.addEventListener('DOMContentLoaded', async function () {
  console.log('Login page loaded');
  
  // Prevent redirect loop - check if we just came from a failed auth
  const justFailed = sessionStorage.getItem('authJustFailed');
  if (justFailed) {
    console.log('Cleared invalid session, ready for fresh login');
    sessionStorage.removeItem('authJustFailed');
    Auth.removeToken();
    localStorage.clear();
    return;
  }
  
  // Check if already logged in
  if (Auth.isAuthenticated()) {
    console.log('Token found, checking if valid...');
    try {
      const user = await Auth.fetchUser();
      console.log('User fetched successfully:', user);
      if (user && user.role) {
        console.log('Valid token found, redirecting to dashboard for role:', user.role);
        redirectToDashboard(user.role);
        return;
      }
    } catch (error) {
      console.error('Token invalid, clearing and showing login form');
      // Token invalid, let user login again
      Auth.removeToken();
      localStorage.clear();
    }
  } else {
    console.log('No token found, ready for login');
  }

  // Handle login form submission
  const loginForm = document.querySelector('form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;

  if (!email || !password) {
    Utils.showToast('Please fill in all fields', 'error');
    return;
  }

  try {
    Utils.showLoading();
    console.log('Attempting login with email:', email);

    const response = await AuthService.login({ email, password });
    console.log('Login response:', response);

    if (!response || !response.success) {
      throw new Error(response?.message || 'Invalid response from server');
    }

    // Ensure token is saved
    const token = Auth.getToken();
    if (!token) {
      throw new Error('Authentication token not received');
    }
    console.log('Token saved successfully');

    // Get user role from login response or fetch it
    let userRole = response.data?.user?.role;
    console.log('User role from login response:', userRole);

    // If role not in response, try to fetch user data
    if (!userRole) {
      console.log('No role in response, fetching user data...');
      const user = await Auth.fetchUser();
      console.log('Fetched user data:', user);
      userRole = user?.role;
    }

    if (!userRole) {
      throw new Error('Unable to determine user role');
    }

    // Store user role in session storage for dashboard access
    sessionStorage.setItem('userRole', userRole);
    
    Utils.hideLoading();
    Utils.showToast('Login successful! Redirecting...', 'success');

    // Redirect after a short delay to show success message
    setTimeout(() => {
      console.log('Redirecting to dashboard for role:', userRole);
      redirectToDashboard(userRole);
    }, 1500);

  } catch (error) {
    Utils.hideLoading();
    Utils.showToast(error.message || 'Login failed', 'error');
  }
}

function redirectToDashboard(role) {
  switch(role) {
    case 'admin':
      window.location.href = '../admin/dashboard.html';
      break;
    case 'pharmacy':
      window.location.href = '../pharmacy/dashboard.html';
      break;
    case 'delivery':
      window.location.href = '../delivery/dashboard.html';
      break;
    default:
      window.location.href = 'dashboard.html';
  }
}
