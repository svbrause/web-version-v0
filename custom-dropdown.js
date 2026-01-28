// Custom Dropdown Component
class CustomDropdown {
    constructor(selectElement) {
        this.select = selectElement;
        this.options = [];
        this.selectedIndex = -1;
        this.isOpen = false;
        this.createDropdown();
    }
    
    createDropdown() {
        // Create wrapper
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'custom-dropdown-wrapper';
        
        // Create button
        this.button = document.createElement('button');
        this.button.className = 'custom-dropdown-button';
        this.button.type = 'button';
        this.button.innerHTML = '<span class="custom-dropdown-text">Select Issue...</span><span class="custom-dropdown-arrow"><svg width="12" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>';
        
        // Create dropdown menu
        this.menu = document.createElement('div');
        this.menu.className = 'custom-dropdown-menu';
        this.menu.style.display = 'none';
        
        // Populate options from select element
        Array.from(this.select.options).forEach((option, index) => {
            if (index === 0) return; // Skip placeholder
            
            const optionElement = document.createElement('div');
            optionElement.className = 'custom-dropdown-option';
            optionElement.dataset.value = option.value;
            optionElement.dataset.index = index;
            
            // Check if issue has photos
            const hasPhotos = (typeof window.issueHasPhotos === 'function' && window.issueHasPhotos(option.value)) || 
                             (typeof issueHasPhotos === 'function' && issueHasPhotos(option.value)) || 
                             true;
            if (!hasPhotos) {
                optionElement.classList.add('locked-option');
                optionElement.innerHTML = `
                    <span class="option-text">${option.textContent}</span>
                    <span class="lock-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></span>
                    <span class="lock-label">Consultation Required</span>
                `;
            } else {
                optionElement.innerHTML = `<span class="option-text">${option.textContent}</span>`;
            }
            
            optionElement.addEventListener('click', () => {
                if (!hasPhotos) {
                    // Show consultation message
                    if (typeof window.showLockedIssueMessage === 'function') {
                        window.showLockedIssueMessage();
                    } else if (typeof showLockedIssueMessage === 'function') {
                        showLockedIssueMessage();
                    }
                    return;
                }
                this.selectOption(index);
            });
            
            this.menu.appendChild(optionElement);
            this.options.push(optionElement);
        });
        
        // Add event listeners
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        document.addEventListener('click', (e) => {
            if (!this.wrapper.contains(e.target)) {
                this.close();
            }
        });
        
        // Replace select with custom dropdown
        this.select.style.display = 'none';
        this.wrapper.appendChild(this.button);
        this.wrapper.appendChild(this.menu);
        this.select.parentNode.insertBefore(this.wrapper, this.select);
        this.wrapper.appendChild(this.select); // Keep select for form submission
        
        // Update button text when select changes externally
        this.select.addEventListener('change', () => {
            this.updateButton();
        });
        
        this.updateButton();
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.isOpen = true;
        this.menu.style.display = 'block';
        this.button.classList.add('open');
    }
    
    close() {
        this.isOpen = false;
        this.menu.style.display = 'none';
        this.button.classList.remove('open');
    }
    
    selectOption(index) {
        this.select.selectedIndex = index;
        this.select.dispatchEvent(new Event('change', { bubbles: true }));
        this.updateButton();
        this.close();
    }
    
    updateButton() {
        const selectedOption = this.select.options[this.select.selectedIndex];
        if (selectedOption && selectedOption.value) {
            this.button.querySelector('.custom-dropdown-text').textContent = selectedOption.textContent;
            this.button.classList.add('has-selection');
        } else {
            this.button.querySelector('.custom-dropdown-text').textContent = 'Select Issue...';
            this.button.classList.remove('has-selection');
        }
    }
}

// Initialize custom dropdowns
function initializeCustomDropdowns() {
    document.querySelectorAll('.issue-select').forEach(select => {
        // Remove existing custom dropdown if any
        const existingWrapper = select.parentElement?.querySelector('.custom-dropdown-wrapper');
        if (existingWrapper) {
            existingWrapper.remove();
        }
        
        // Also remove modern dropdown wrapper if it exists
        const modernWrapper = select.parentElement?.querySelector('.modern-dropdown-wrapper');
        if (modernWrapper) {
            modernWrapper.remove();
        }
        
        // Only create if select is not disabled and has options
        if (!select.disabled && select.options.length > 1) {
            try {
                new CustomDropdown(select);
            } catch (e) {
                console.error('Error creating custom dropdown:', e);
            }
        }
    });
}

// Make globally accessible
window.CustomDropdown = CustomDropdown;
window.initializeCustomDropdowns = initializeCustomDropdowns;
