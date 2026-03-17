// Load report data when page loads
function loadReportById(reportId) {
    document.body.style.cursor = 'wait';
    
    fetch(`viewget.php?id=${reportId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                populateFormFields(data.report);
                // Display feedback in admin comment section
                displayFeedback(data.report.feedback);
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error))
        .finally(() => document.body.style.cursor = 'default');
}

// Display feedback in the admin comment textarea
function displayFeedback(feedback) {
    const adminComment = document.getElementById('admincomment');
    if (adminComment) {
        adminComment.value = feedback || '';
        autoExpand(adminComment);
    }
}

// Populate form fields with report data
function populateFormFields(report) {
    // Map database columns to form fields
    const fieldMappings = {
        'department': 'department',
        'date': 'date', // Note: your input has id="date_submitted" but name="date"
        'date_conduct': 'date_conduct',
        'participants': 'participants',
        'location': 'location',
        'family_profile': 'family_profile',
        'community_concern': 'community_concern',
        'other_identified_needs': 'other_identified_needs',
        'kabayani_ng_panginoon': 'kabayani_ng_panginoon',
        'kabayani_ng_kalikasan': 'kabayani_ng_kalikasan',
        'kabayani_ng_buhay': 'kabayani_ng_buhay',
        'kabayani_ng_turismo': 'kabayani_ng_turismo',
        'kabayani_ng_kultura': 'kabayani_ng_kultura',
        'title_of_program': 'title_of_program',
        'objectives': 'objectives',
        'beneficiaries': 'beneficiaries',
        'from_school': 'from_school',
        'from_community': 'from_community'
    };

    for (const [dbField, formField] of Object.entries(fieldMappings)) {
        // Handle special case for date field
        if (formField === 'date') {
            const element = document.getElementById('date_submitted');
            if (element && report[dbField] !== undefined && report[dbField] !== null) {
                element.value = report[dbField];
            }
        } else {
            const element = document.querySelector(`textarea[name="${formField}"], input[name="${formField}"]`);
            if (element && report[dbField] !== undefined && report[dbField] !== null) {
                element.value = report[dbField];
                if (element.tagName === 'TEXTAREA') {
                    autoExpand(element);
                }
            }
        }
    }
}

// Auto-expand textareas
function autoExpand(element) {
    element.style.height = 'auto';
    element.style.height = (element.scrollHeight) + 'px';
}

// Collect all form data for update
function collectFormData() {
    const params = new URLSearchParams(window.location.search);
    let reportId = params.get("id");
    
    if (!reportId) {
        throw new Error("No report ID found");
    }
    
    // Map form fields to database columns
    const fieldMappings = {
        'department': 'department',
        'date_submitted': 'date_submitted', // for date_submitted input
        'date_conduct': 'date_conduct',
        'participants': 'participants',
        'location': 'location',
        'family_profile': 'family_profile',
        'community_concern': 'community_concern',
        'other_identified_needs': 'other_identified_needs',
        'kabayani_ng_panginoon': 'kabayani_ng_panginoon',
        'kabayani_ng_kalikasan': 'kabayani_ng_kalikasan',
        'kabayani_ng_buhay': 'kabayani_ng_buhay',
        'kabayani_ng_turismo': 'kabayani_ng_turismo',
        'kabayani_ng_kultura': 'kabayani_ng_kultura',
        'title_of_program': 'title_of_program',
        'objectives': 'objectives',
        'beneficiaries': 'beneficiaries',
        'from_school': 'from_school',
        'from_community': 'from_community'
    };
    
    const formData = {
        id: reportId,
        feedback: document.getElementById('admincomment')?.value || ''
    };
    
    // Collect department (input field)
    const deptElement = document.getElementById('department');
    if (deptElement) {
        formData['department'] = deptElement.value || '';
    }
    
    // Collect date (input field with id="date_submitted")
    const dateElement = document.getElementById('date_submitted');
    if (dateElement) {
        formData['date'] = dateElement.value || '';
    }
    
    // Collect all textarea fields
    for (const [formField, dbField] of Object.entries(fieldMappings)) {
        // Skip department and date as they're already collected
        if (formField === 'department' || formField === 'date') continue;
        
        const element = document.querySelector(`textarea[name="${formField}"]`);
        if (element) {
            formData[dbField] = element.value || '';
        }
    }
    
    return formData;
}

// Handle re-submit button click
async function handleResubmit() {
    if (!confirm('Are you sure you want to re-submit this report? It will be sent back for review with your updates.')) {
        return;
    }
    
    try {
        const formData = collectFormData();
        console.log('Submitting data:', formData); // For debugging
        
        const response = await fetch('/coordinator/ReportManagement/actions/feedback/cnacrview/update.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            alert('Report updated successfully and status set to Pending!');
            // Redirect to pending reports page - adjust this URL as needed
            window.location.href = '/coordinator/ReportManagement/ReportManagement.html';
        } else {
            alert('Failed to update report: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating report:', error);
        alert('Error updating report: ' + error.message);
    }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
    // Get report ID from URL
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get("id");

    if (reportId) {
        loadReportById(reportId);
    } else {
        console.error("No report ID in URL");
    }
    
    // Attach event listener to re-submit button
    const resubmitBtn = document.getElementById('resubmitBtn');
    if (resubmitBtn) {
        resubmitBtn.addEventListener('click', handleResubmit);
    }
});