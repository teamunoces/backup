// update.js
// This script handles updating report data without a form tag
// For Certificate of Appearance - no ratings, no admin comment

document.addEventListener('DOMContentLoaded', function() {
    // Get report ID from URL or hidden field
    function getReportId() {
        const urlParams = new URLSearchParams(window.location.search);
        const idFromUrl = urlParams.get('id');
        
        if (idFromUrl) {
            return parseInt(idFromUrl);
        }
        
        const idField = document.getElementById('report_id');
        if (idField && idField.value) {
            return parseInt(idField.value);
        }
        
        if (window.reportId) {
            return parseInt(window.reportId);
        }
        
        return null;
    }

    // Collect all form data from input fields
    function collectFormData(reportId) {
        const formData = {
            id: reportId
        };

        // Map of field IDs to database field names (Certificate of Appearance only)
        const fieldMappings = {
            'participant': 'participant',
            'cert_department': 'cert_department',
            'activity_name': 'activity_name',
            'location': 'location',
            'date_held': 'date_held',
            'month_held': 'month_held',
            'year_held': 'year_held',
            'location_two': 'location_two',
            'monitored_by': 'monitored_by',
            'verified_by': 'verified_by'
            // 'admincomment' removed - not part of Certificate of Appearance
        };

        // Collect basic fields
        for (const [elementId, fieldName] of Object.entries(fieldMappings)) {
            const element = document.getElementById(elementId);
            if (element && element.value !== undefined) {
                formData[fieldName] = element.value;
            }
        }

        // Ratings removed - not part of Certificate of Appearance

        return formData;
    }

    // Show message to user
    function showMessage(message, type) {
        // Remove existing message
        const existingMessage = document.querySelector('.update-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `update-message update-message-${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 12px 20px;
            border-radius: 5px;
            font-size: 14px;
            font-weight: 500;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            ${type === 'success' ? 'background-color: #d4edda; color: #155724; border-left: 4px solid #28a745;' : 
              type === 'error' ? 'background-color: #f8d7da; color: #721c24; border-left: 4px solid #dc3545;' :
              'background-color: #d1ecf1; color: #0c5460; border-left: 4px solid #17a2b8;'}
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
    }

    // Handle update
    async function handleUpdate() {
        const reportId = getReportId();
        if (!reportId) {
            showMessage('Report ID not found. Cannot update report.', 'error');
            return;
        }

        const formData = collectFormData(reportId);
        
        // Get the submit button
        const submitBtn = document.querySelector('.submit-button');
        const originalButtonText = submitBtn ? submitBtn.innerHTML : 'Re-submit';
        
        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';
            submitBtn.innerHTML = '⏳ Updating...';
        }
        
        try {
            const response = await fetch('update.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text.substring(0, 200));
                throw new Error('Server returned an invalid response');
            }

            const data = await response.json();
            
            if (data.success) {
                showMessage('✓ Report updated successfully!', 'success');
                console.log('Update successful:', data);
                
                // Trigger any custom event for other scripts
                const event = new CustomEvent('reportUpdated', { detail: data });
                document.dispatchEvent(event);
            } else {
                throw new Error(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating report:', error);
            showMessage('✗ Error: ' + error.message, 'error');
        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.innerHTML = originalButtonText;
            }
        }
    }

    // Attach click event to the submit button
    const submitBtn = document.querySelector('.submit-button');
    if (submitBtn) {
        // Remove any existing listeners to avoid duplicates
        const newBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newBtn, submitBtn);
        
        // Add click event
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleUpdate();
        });
        console.log('Update handler attached to .submit-button');
    } else {
        console.error('Button with class "submit-button" not found');
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);