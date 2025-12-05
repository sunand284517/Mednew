// Profile Page - Dynamic Profile Management
class ProfileManager {
    constructor() {
        this.user = Auth.getUser();
        this.init();
    }

    init() {
        if (!this.user) {
            window.location.href = 'login.html';
            return;
        }

        this.loadProfileData();
        this.setupEventListeners();
    }

    loadProfileData() {
        // Load data based on user role
        switch(this.user.role) {
            case 'user':
                this.loadPatientProfile();
                break;
            case 'pharmacy':
                this.loadPharmacyProfile();
                break;
            case 'delivery':
                this.loadDeliveryProfile();
                break;
            case 'admin':
                this.loadAdminProfile();
                break;
        }
    }

    loadPatientProfile() {
        // Update profile header
        this.updateElement('profileName', this.user.name || `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim());
        this.updateElement('profileEmail', this.user.email);
        
        // Update initials
        const initials = this.getInitials(this.user.name || this.user.firstName);
        this.updateElement('profileInitials', initials);

        // Update form fields
        this.updateInputValue('firstName', this.user.firstName || this.user.name?.split(' ')[0]);
        this.updateInputValue('lastName', this.user.lastName || this.user.name?.split(' ')[1]);
        this.updateInputValue('emailField', this.user.email);
        this.updateInputValue('phoneField', this.user.phone || this.user.phoneNumber);
        this.updateInputValue('dobField', this.user.dateOfBirth || this.user.dob);

        // Update member since
        if (this.user.createdAt) {
            const date = new Date(this.user.createdAt);
            const formatted = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            this.updateElement('memberSince', `<i class="fas fa-calendar"></i> ${formatted}`);
        }
    }

    loadPharmacyProfile() {
        const name = this.user.pharmacyName || this.user.name;
        const initials = this.getInitials(name);

        // Update profile sidebar
        const profileInitials = document.querySelector('.section-card div[style*="width: 120px"]');
        const profileName = document.querySelector('.section-card h3');
        const headerInitials = document.getElementById('pharmacyInitials');

        if (profileName) profileName.textContent = name;
        if (profileInitials) profileInitials.textContent = initials;
        if (headerInitials) headerInitials.textContent = initials;

        // Update member since
        this.updateMemberSince();

        // Update form fields dynamically
        this.updateFormFieldsByLabel({
            'Pharmacy Name': this.user.pharmacyName || this.user.name,
            'License Number': this.user.licenseNumber || this.user.license,
            'Phone Number': this.user.phone || this.user.phoneNumber || this.user.contactNumber,
            'Email': this.user.email,
            'Address': this.user.address
        });
    }

    loadDeliveryProfile() {
        const fullName = this.user.name || `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim();
        const initials = this.getInitials(fullName);

        // Update profile sidebar
        const profileInitials = document.querySelector('.section-card div[style*="width: 120px"]');
        const profileName = document.querySelector('.section-card h3');
        const headerInitials = document.getElementById('deliveryInitials');

        if (profileName) profileName.textContent = fullName || 'Partner';
        if (profileInitials) profileInitials.textContent = initials;
        if (headerInitials) headerInitials.textContent = initials;

        // Update vehicle number in sidebar
        const vehicleNumber = document.querySelector('.section-card .fa-motorcycle')?.parentElement?.querySelector('span');
        if (vehicleNumber && this.user.vehicleNumber) {
            vehicleNumber.textContent = this.user.vehicleNumber;
        }

        // Update member since
        this.updateMemberSince();

        // Update form fields
        this.updateFormFieldsByLabel({
            'First Name': this.user.firstName || this.user.name?.split(' ')[0],
            'Last Name': this.user.lastName || this.user.name?.split(' ')[1],
            'Phone Number': this.user.phone || this.user.phoneNumber || this.user.contactNumber,
            'Email': this.user.email,
            'Address': this.user.address,
            'Vehicle Number': this.user.vehicleNumber,
            'License Number': this.user.licenseNumber || this.user.drivingLicense
        });

        // Update vehicle type select
        if (this.user.vehicleType) {
            const vehicleSelect = Array.from(document.querySelectorAll('select.form-input'))
                .find(select => select.previousElementSibling?.textContent.includes('Vehicle Type'));
            if (vehicleSelect) vehicleSelect.value = this.user.vehicleType;
        }
    }

    loadAdminProfile() {
        // Admin profile implementation if needed
        console.log('Admin profile loaded');
    }

    getInitials(name) {
        if (!name) return 'U';
        return name.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            if (content) {
                element.innerHTML = content;
            }
        }
    }

    updateInputValue(id, value) {
        const input = document.getElementById(id);
        if (input && value) {
            input.value = value;
        }
    }

    updateFormFieldsByLabel(fieldMap) {
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            const label = input.previousElementSibling?.textContent?.trim();
            if (label && fieldMap[label]) {
                input.value = fieldMap[label] || '';
            }
        });
    }

    updateMemberSince() {
        const memberSince = document.querySelector('.section-card p[style*="color: #64748b"]');
        if (memberSince && this.user.createdAt) {
            const date = new Date(this.user.createdAt);
            const formatted = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            memberSince.textContent = `Member since ${formatted}`;
        }
    }

    setupEventListeners() {
        // Edit button handlers
        const editButtons = document.querySelectorAll('.btn-primary:not([type="submit"])');
        editButtons.forEach(btn => {
            if (btn.textContent.includes('Edit')) {
                btn.addEventListener('click', () => this.enableEdit());
            }
        });

        // Save button handlers
        const saveForms = document.querySelectorAll('form');
        saveForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile(form);
            });
        });

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to logout?')) {
                    Auth.logout();
                    window.location.href = 'login.html';
                }
            });
        }
    }

    enableEdit() {
        const inputs = document.querySelectorAll('.form-input[readonly]');
        inputs.forEach(input => {
            if (!input.previousElementSibling?.textContent.includes('License') &&
                !input.previousElementSibling?.textContent.includes('Account')) {
                input.removeAttribute('readonly');
                input.style.borderColor = 'var(--primary-color)';
            }
        });
        Utils.showToast('Edit mode enabled. Make your changes and click Save.', 'info');
    }

    async saveProfile(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
            Utils.showToast('Saving profile...', 'info');

            // Simulate API call (replace with actual API endpoint)
            const response = await Api.put(`/api/${this.user.role}/profile`, data);

            if (response.success) {
                // Update local storage
                const updatedUser = { ...this.user, ...data };
                Auth.saveUser(updatedUser);
                
                Utils.showToast('Profile updated successfully!', 'success');
                
                // Make fields readonly again
                const inputs = form.querySelectorAll('.form-input');
                inputs.forEach(input => {
                    if (!input.previousElementSibling?.textContent.includes('License')) {
                        input.setAttribute('readonly', true);
                        input.style.borderColor = '';
                    }
                });
            } else {
                Utils.showToast(response.message || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            Utils.showToast('An error occurred while updating profile', 'error');
        }
    }
}

// Initialize profile manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});
