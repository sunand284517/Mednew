/**
 * Auth Check - Proper JWT Validation with Backend
 * This replaces the localStorage-based auth checks
 * Uses JWT verification from backend as source of truth
 */

(async function() {
    const token = localStorage.getItem('token');
    
    // No token - redirect immediately
    if (!token) {
        // Check if we're already on a login page
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login.html')) {
            window.location.replace('login.html');
        }
        throw new Error('Not authenticated');
    }
    
    try {
        // Verify token with backend (JWT verification happens here)
        const response = await fetch(`${API_CONFIG.BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        // Token invalid or expired
        if (!response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('userCache');
            const currentPath = window.location.pathname;
            if (!currentPath.includes('login.html')) {
                window.location.replace('login.html');
            }
            throw new Error('Authentication failed');
        }
        
        const data = await response.json();
        
        // Backend validates JWT and returns user with role
        if (data.success && data.data && data.data.user) {
            const user = data.data.user;
            
            // Cache user data for display purposes
            localStorage.setItem('userCache', JSON.stringify(user));
            
            // Check role authorization (role comes from JWT decoded by backend)
            const requiredRole = document.body.getAttribute('data-required-role');
            if (requiredRole && user.role !== requiredRole) {
                alert(`Access denied. ${requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)} role required.`);
                localStorage.clear();
                const currentPath = window.location.pathname;
                if (!currentPath.includes('login.html')) {
                    window.location.replace('login.html');
                }
                throw new Error('Invalid role');
            }
            
            // Authentication successful - populate page with user data
            if (typeof onAuthSuccess === 'function') {
                onAuthSuccess(user);
            }
        } else {
            throw new Error('Invalid response');
        }
        
    } catch (error) {
        if (error.message !== 'Invalid role' && error.message !== 'Not authenticated' && error.message !== 'Authentication failed') {
            console.error('Auth check error:', error);
            localStorage.clear();
            window.location.replace('login.html');
        }
        throw error;
    }
})();
