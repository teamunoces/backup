/**
 * update.js - Update evaluation data
 */

const UPDATE_API_URL = 'update.php';

async function updateEvaluationData(formData) {
    try {
        console.log('Sending update request for report ID:', formData.id);
        console.log('Form data being sent:', JSON.stringify(formData, null, 2));
        
        const response = await fetch(UPDATE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        console.log('Response status:', response.status);
        console.log('Response status text:', response.statusText);
        
        // Try to get the response text for debugging
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        // Try to parse as JSON
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse JSON. Response was:', responseText);
            throw new Error('Server returned invalid JSON. Response: ' + responseText.substring(0, 200));
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${result.message || response.statusText}`);
        }
        
        console.log('Update response:', result);
        return result;
        
    } catch (error) {
        console.error('Error updating data:', error);
        return {
            success: false,
            message: 'Error: ' + error.message
        };
    }
}

function collectFormData() {
    // Get all ratings
    const ratings = {};
    let missingRatings = [];
    
    for (let i = 1; i <= 15; i++) {
        const selectedRadio = document.querySelector(`input[name="q${i}"]:checked`);
        if (selectedRadio) {
            ratings[`q${i}`] = parseInt(selectedRadio.value);
        } else {
            ratings[`q${i}`] = null;
            missingRatings.push(i);
        }
    }
    
    if (missingRatings.length > 0) {
        console.log('Missing ratings for questions:', missingRatings);
    }
    
    // Get service types
    const serviceTypes = [];
    const serviceCheckboxes = document.querySelectorAll('input[name="service_types[]"]:checked');
    serviceCheckboxes.forEach(cb => {
        serviceTypes.push(cb.value);
    });
    
    // Get other form fields - FIXED: Using correct selectors
    const venue = document.getElementById('venue') ? document.getElementById('venue').value : '';
    const implementingDepartment = document.getElementById('implementing_department') ? document.getElementById('implementing_department').value : '';
    const evaluatedBy = document.querySelector('input[name="evaluated_by"]') ? document.querySelector('input[name="evaluated_by"]').value : '';
    const signature = document.querySelector('input[name="signature"]') ? document.querySelector('input[name="signature"]').value : '';
    const date = document.querySelector('input[name="date"]') ? document.querySelector('input[name="date"]').value : '';
    
    // Combine all data
    const formData = {
        ...ratings,
        service_types: serviceTypes,
        venue: venue,
        implementing_department: implementingDepartment,
        evaluated_by: evaluatedBy,
        signature: signature,
        date: date
    };
    
    // Add the report ID if available
    if (window.currentReportData && window.currentReportData.id) {
        formData.id = window.currentReportData.id;
        console.log('Updating report ID:', window.currentReportData.id);
    } else {
        console.log('No report ID found in window.currentReportData');
        console.log('window.currentReportData:', window.currentReportData);
        // Try to get from URL as fallback
        const urlParams = new URLSearchParams(window.location.search);
        const urlId = urlParams.get('id');
        if (urlId) {
            formData.id = parseInt(urlId);
            console.log('Using ID from URL:', urlId);
        }
    }
    
    return formData;
}

function validateForm(formData) {
    // Check if all ratings are filled
    for (let i = 1; i <= 15; i++) {
        if (!formData[`q${i}`] && formData[`q${i}`] !== 0) {
            alert(`Please answer question ${i}`);
            return false;
        }
    }
    
    // Check if at least one service type is selected
    if (!formData.service_types || formData.service_types.length === 0) {
        alert('Please select at least one service type');
        return false;
    }
    
    // Check if venue is filled
    if (!formData.venue || formData.venue.trim() === '') {
        alert('Please enter the venue');
        return false;
    }
    
    // Check if department is filled
    if (!formData.implementing_department || formData.implementing_department.trim() === '') {
        alert('Please enter the implementing department');
        return false;
    }
    
    // Check if evaluated by is filled
    if (!formData.evaluated_by || formData.evaluated_by.trim() === '') {
        alert('Please enter the evaluator name');
        return false;
    }
    
    // Check if signature is filled
    if (!formData.signature || formData.signature.trim() === '') {
        alert('Please enter the signature');
        return false;
    }
    
    // Check if date is filled
    if (!formData.date || formData.date.trim() === '') {
        alert('Please enter the evaluation date');
        return false;
    }
    
    return true;
}

function showMessage(message, isSuccess = true) {
    // Remove any existing message
    const existingMessage = document.querySelector('.update-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = 'update-message';
    messageDiv.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        ${isSuccess ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
    `;
    messageDiv.textContent = message;
    
    // Add animation style if not exists
    if (!document.querySelector('#messageStyles')) {
        const style = document.createElement('style');
        style.id = 'messageStyles';
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
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(messageDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageDiv && messageDiv.remove) {
            messageDiv.remove();
        }
    }, 5000);
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('evaluationForm');
    const submitButton = document.querySelector('.submit-button');
    
    if (submitButton) {
        // Initially disable the button until a report is loaded
        submitButton.disabled = true;
        submitButton.style.opacity = '0.6';
        submitButton.style.cursor = 'not-allowed';
        
        submitButton.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // Check if we have a report loaded
            if (!window.currentReportData || !window.currentReportData.id) {
                showMessage('No report loaded. Please wait for the report to load or refresh the page.', false);
                console.log('currentReportData:', window.currentReportData);
                return;
            }
            
            // Collect form data
            const formData = collectFormData();
            console.log('Collected form data:', formData);
            
            // Validate form data
            if (!validateForm(formData)) {
                return;
            }
            
            // Disable button to prevent double submission
            submitButton.disabled = true;
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Updating...';
            
            // Update data
            const result = await updateEvaluationData(formData);
            
            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            
            if (result.success) {
                showMessage('Report updated successfully!', true);
                // Refresh the displayed data
                if (window.fetchEvaluationData) {
                    // Refresh with the same report ID
                    window.fetchEvaluationData(window.currentReportData.id, null);
                }
            } else {
                showMessage('Update failed: ' + (result.message || 'Unknown error'), false);
            }
        });
        
        // Check if report is already loaded
        const checkReportLoaded = setInterval(() => {
            if (window.currentReportData && window.currentReportData.id) {
                submitButton.disabled = false;
                submitButton.style.opacity = '1';
                submitButton.style.cursor = 'pointer';
                console.log('Button enabled - report loaded with ID:', window.currentReportData.id);
                clearInterval(checkReportLoaded);
            } else {
                console.log('Waiting for report to load...');
            }
        }, 500);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkReportLoaded);
            if (!window.currentReportData || !window.currentReportData.id) {
                console.log('Report load timeout');
                submitButton.textContent = 'No Report Loaded';
                submitButton.style.opacity = '0.5';
            }
        }, 10000);
    }
});