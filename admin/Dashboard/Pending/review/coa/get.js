// get.js
// This script fetches report data from get.php and displays it on coaneedview.php

document.addEventListener('DOMContentLoaded', function() {
    // Get report type from the page (set by PHP)
    const reportType = window.reportType || "Certificate of Appearance";
    
    // Get URL parameters to check if a specific ID is requested
    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');
    
    // Determine which endpoint to call
    let apiUrl = 'get.php';
    if (reportId) {
        apiUrl += '?id=' + reportId;
    } else if (reportType) {
        apiUrl += '?type=' + encodeURIComponent(reportType);
    } else {
        console.error('No report ID or type specified');
        return;
    }
    
    console.log('Fetching from URL:', apiUrl);
    
    // Fetch the report data
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        }
    })
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.get('content-type'));
        
        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return response.text().then(text => {
                console.error('Non-JSON response:', text.substring(0, 200));
                throw new Error('Server did not return JSON. Response started with: ' + text.substring(0, 50));
            });
        }
        
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.success && data.data && data.data.length > 0) {
            // Display the most recent report (or specific one if ID was provided)
            const report = data.data[0];
            populateFormFields(report);
        } else {
            console.error('No data found:', data.message || 'Unknown error');
            // Optionally show a message in the admin comment area
            const adminCommentField = document.getElementById('admincomment');
            if (adminCommentField) {
                adminCommentField.value = 'No report data found. Please check if reports exist for this type.';
            }
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        // Display error in admin comment area
        const adminCommentField = document.getElementById('admincomment');
        if (adminCommentField) {
            adminCommentField.value = 'Error loading report: ' + error.message + '. Please check the console for details.';
        }
    });
});

/**
 * Populates the form fields in coaneedview.php with the report data
 * @param {Object} report - The report object from the API
 */
function populateFormFields(report) {
    // Map database fields to form input IDs
    const fieldMappings = {
        'participant': report.participant || '',
        'cert_department': report.cert_department || '',
        'activity_name': report.activity_name || '',
        'location': report.location || '',
        'date_held': report.date_held || '',
        'month_held': report.month_held || '',
        'year_held': report.year_held || '',
        'location_two': report.location_two || '',
        'monitored_by': report.monitored_by || '',
        'verified_by': report.verified_by || ''
    };
    
    // Populate input fields (these use .value)
    for (const [fieldId, value] of Object.entries(fieldMappings)) {
        const element = document.getElementById(fieldId);
        if (element && element.tagName === 'INPUT') {
            element.value = value;
        } else if (element) {
            // If it's not an input (like div/span), set textContent
            element.textContent = value;
        } else {
            console.warn(`Element with id "${fieldId}" not found`);
        }
    }
    
    // Populate created_by_name (this is a DIV in your HTML, so use textContent)
    const createdByNameElement = document.getElementById('created_by_name');
    if (createdByNameElement) {
        createdByNameElement.textContent = report.created_by_name || '';
        console.log('Created by name set to:', report.created_by_name);
    } else {
        console.warn('Element with id "created_by_name" not found');
    }
    
    // Populate dean (this is a DIV in your HTML, so use textContent)
    const deanElement = document.getElementById('dean');
    if (deanElement) {
        deanElement.textContent = report.dean || '';
        console.log('Dean set to:', report.dean);
    } else {
        console.warn('Element with id "dean" not found');
    }
    
    // Populate other approval fields if they exist in the report
    const cesHeadElement = document.getElementById('ces_head');
    if (cesHeadElement && report.ces_head) {
        cesHeadElement.textContent = report.ces_head;
    }
    
    const vpAcadElement = document.getElementById('vp_acad');
    if (vpAcadElement && report.vp_acad) {
        vpAcadElement.textContent = report.vp_acad;
    }
    
    const vpAdminElement = document.getElementById('vp_admin');
    if (vpAdminElement && report.vp_admin) {
        vpAdminElement.textContent = report.vp_admin;
    }
    
    const schoolPresidentElement = document.getElementById('school_president');
    if (schoolPresidentElement && report.school_president) {
        schoolPresidentElement.textContent = report.school_president;
    }
    
    // Populate admin comment if it exists
    const adminCommentField = document.getElementById('admincomment');
    if (adminCommentField) {
        let comment = report.admin_comment || report.comment || report.feedback || '';
        adminCommentField.value = comment;
        if (comment) {
            console.log('Admin comment loaded');
        }
    }
    
    // Display additional report info in console for debugging
    console.log('Report loaded successfully:', {
        id: report.id,
        type: report.type,
        status: report.status,
        archived: report.archived,
        created_by_name: report.created_by_name,
        created_at: report.created_at,
        dean: report.dean
    });
}