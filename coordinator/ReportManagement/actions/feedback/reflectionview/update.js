/**
 * update.js - Handle updating reflection paper report
 */

const UPDATE_API_URL = 'update.php';

async function updateReflectionReport(formData) {
    try {
        // Validate required fields
        if (!formData.id) {
            throw new Error('Report ID is required for update');
        }
        
        if (!formData.beneficiary_name || formData.beneficiary_name.trim() === '') {
            throw new Error('Beneficiary name is required');
        }
        
        if (!formData.implementing_department || formData.implementing_department.trim() === '') {
            throw new Error('Implementing department is required');
        }
        
        console.log('Updating report with data:', formData);
        
        const response = await fetch(UPDATE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Update response:', result);
        
        if (result.success) {
            showUpdateMessage('Report updated successfully!', 'success');
            return result;
        } else {
            throw new Error(result.error || 'Update failed');
        }
        
    } catch (error) {
        console.error('Update error:', error);
        showUpdateMessage(error.message, 'error');
        return null;
    }
}

function collectFormData() {
    // Get report ID from global variable
    const reportId = window.currentReportData ? window.currentReportData.id : null;
    
    // Get beneficiary name
    const beneficiaryName = document.getElementById('beneficiary_name')?.value || '';
    
    // Get implementing department
    const implementingDepartment = document.getElementById('implementing_department')?.value || '';
    
    // Get selected extension services
    const extensionServices = [];
    const checkboxes = document.querySelectorAll('input[name="extension_services[]"]:checked');
    checkboxes.forEach(checkbox => {
        if (checkbox.value) {
            extensionServices.push(checkbox.value);
        }
    });
    
    // Get answers
    const answerOne = document.getElementById('answer_one')?.value || '';
    const answerTwo = document.getElementById('answer_two')?.value || '';
    const answerThree = document.getElementById('answer_three')?.value || '';
    
    // Get signature
    const beneficiarySignature = document.getElementById('beneficiary_signature')?.value || '';
    
    return {
        id: reportId,
        beneficiary_name: beneficiaryName,
        implementing_department: implementingDepartment,
        extension_services: extensionServices,
        answer_one: answerOne,
        answer_two: answerTwo,
        answer_three: answerThree,
        beneficiary_signature: beneficiarySignature
    };
}

function validateFormData(formData) {
    const errors = [];
    
    if (!formData.beneficiary_name || formData.beneficiary_name.trim() === '') {
        errors.push('Please enter the beneficiary name');
    }
    
    if (!formData.implementing_department || formData.implementing_department.trim() === '') {
        errors.push('Please enter the implementing department');
    }
    
    if (formData.extension_services.length === 0) {
        errors.push('Please select at least one extension service');
    }
    
    return errors;
}

async function handleUpdate() {
    // Check if report exists to update
    if (!window.currentReportData || !window.currentReportData.id) {
        showUpdateMessage('No existing report to update. Please submit a new report first.', 'warning');
        return false;
    }
    
    // Collect form data
    const formData = collectFormData();
    
    // Validate
    const errors = validateFormData(formData);
    if (errors.length > 0) {
        showUpdateMessage(errors.join(', '), 'error');
        return false;
    }
    
    // Show loading state on button
    const submitButton = document.querySelector('.submit-button');
    const originalText = submitButton ? submitButton.textContent : 'Update';
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Updating...';
    }
    
    // Update the report
    const result = await updateReflectionReport(formData);
    
    // Restore button
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
    
    if (result && result.success) {
        // Update the global data with new values
        window.currentReportData = {
            ...window.currentReportData,
            ...formData
        };
        return true;
    }
    
    return false;
}

function showUpdateMessage(message, type = 'info') {
    let messageDiv = document.getElementById('updateMessage');
    
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'updateMessage';
        messageDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-size: 14px;
            max-width: 350px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add animation styles
        if (!document.querySelector('#updateMessageStyles')) {
            const style = document.createElement('style');
            style.id = 'updateMessageStyles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(messageDiv);
    }
    
    // Set colors based on message type
    const colors = {
        success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724', icon: '✓' },
        error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24', icon: '✗' },
        warning: { bg: '#fff3cd', border: '#ffeeba', text: '#856404', icon: '⚠' },
        info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460', icon: 'ℹ' }
    };
    
    const color = colors[type] || colors.info;
    
    messageDiv.style.backgroundColor = color.bg;
    messageDiv.style.border = `1px solid ${color.border}`;
    messageDiv.style.color = color.text;
    messageDiv.innerHTML = `${color.icon} ${message}`;
    messageDiv.style.display = 'block';
    
    // Auto hide after 4 seconds
    setTimeout(() => {
        if (messageDiv) {
            messageDiv.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (messageDiv) {
                    messageDiv.style.display = 'none';
                    messageDiv.style.animation = '';
                }
            }, 300);
        }
    }, 4000);
}

// Hook into the existing submit button
document.addEventListener('DOMContentLoaded', function() {
    // Find the submit button and override its behavior
    const submitButton = document.querySelector('.submit-button');
    if (submitButton) {
        // Remove existing event listeners by cloning and replacing
        const newButton = submitButton.cloneNode(true);
        submitButton.parentNode.replaceChild(newButton, submitButton);
        
        // Add our update handler
        newButton.addEventListener('click', async function(e) {
            e.preventDefault();
            await handleUpdate();
        });
    }
});