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
    
    // Populate each field if the element exists
    for (const [fieldId, value] of Object.entries(fieldMappings)) {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = value;
        } else {
            console.warn(`Element with id "${fieldId}" not found`);
        }
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
        created_at: report.created_at
    });
    
  
}

