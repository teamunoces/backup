/**
 * get.js - Fetch and display narrative report data
 */

const API_URL = 'get.php';

// Make currentReportData globally accessible
window.currentReportData = null;

async function fetchNarrativeData(reportId = null, reportType = null) {
    try {
        let url = API_URL;
        const params = new URLSearchParams();
        
        if (reportId) {
            params.append('id', reportId);
        } else if (reportType) {
            params.append('type', reportType);
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        console.log('Fetching from URL:', url);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.success && result.data && result.data.length > 0) {
            // Get the first report
            const report = result.data[0];
            console.log('Report found with ID:', report.id);
            
            // Store report data globally
            window.currentReportData = {
                id: report.id,
                type: report.type,
                narrate_success: report.narrate_success,
                provide_data: report.provide_data,
                identify_problems: report.identify_problems,
                propose_solutions: report.propose_solutions,
                created_by_name: report.created_by_name,
                feedback: report.feedback,
                status: report.status,
                role: report.role,
                user_id: report.user_id,
                dean: report.dean,
                department: report.department,
                created_at: report.created_at,
                archived: report.archived
            };
            
            populateNarrativeForm(window.currentReportData);
            return result.data;
        } else {
            console.log('No data found or invalid response structure');
            console.log('Result:', result);
            return null;
        }
        
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

function populateNarrativeForm(data) {
    if (!data) {
        console.error('No data to populate form');
        return;
    }
    
    console.log('Populating narrative form with data:', data);
    
    // Fill narrate success
    const narrateSuccess = document.getElementById('narrate_success');
    if (narrateSuccess) {
        narrateSuccess.value = data.narrate_success || '';
        if (typeof autoExpand === 'function') {
            autoExpand(narrateSuccess);
        }
    }
    
    // Fill provide data
    const provideData = document.getElementById('provide_data');
    if (provideData) {
        provideData.value = data.provide_data || '';
        if (typeof autoExpand === 'function') {
            autoExpand(provideData);
        }
    }
    
    // Fill identify problems
    const identifyProblems = document.getElementById('identify_problems');
    if (identifyProblems) {
        identifyProblems.value = data.identify_problems || '';
        if (typeof autoExpand === 'function') {
            autoExpand(identifyProblems);
        }
    }
    
    // Fill propose solutions
    const proposeSolutions = document.getElementById('propose_solutions');
    if (proposeSolutions) {
        proposeSolutions.value = data.propose_solutions || '';
        if (typeof autoExpand === 'function') {
            autoExpand(proposeSolutions);
        }
    }
    
    // Display admin feedback in admincomment element
    const adminComment = document.getElementById('admincomment');
    if (adminComment) {
        adminComment.value = data.feedback || '';
        console.log('Feedback set in admincomment:', data.feedback);
    }
    
    // Display admin feedback if exists in container
    const feedbackContainer = document.getElementById('feedbackContainer');
    if (feedbackContainer && data.feedback) {
        feedbackContainer.innerHTML = `
            <div class="admin-feedback">
                <strong>Admin Feedback:</strong>
                <p>${escapeHtml(data.feedback)}</p>
                <small>Status: ${data.status}</small>
            </div>
        `;
        feedbackContainer.style.display = 'block';
    }
    
    // Enable and update the submit button
    const submitButton = document.querySelector('.submit-button');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Update Report';
        submitButton.style.opacity = '1';
        submitButton.style.cursor = 'pointer';
        console.log('Button enabled - ready to update');
    }
    
    console.log('Form populated with report ID:', data.id);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Function to get report by status
async function getReportsByStatus(status) {
    try {
        const response = await fetch(`${API_URL}?status=${encodeURIComponent(status)}`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error('Error fetching reports by status:', error);
        return [];
    }
}

// Function to get all reports for admin/dean view
async function getAllReports(limit = 50, offset = 0) {
    try {
        const response = await fetch(`${API_URL}?limit=${limit}&offset=${offset}`);
        const result = await response.json();
        
        if (result.success) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error('Error fetching all reports:', error);
        return [];
    }
}

// Auto-load on page ready
document.addEventListener('DOMContentLoaded', function() {
    // Get report type from URL parameter or default
    const urlParams = new URLSearchParams(window.location.search);
    const reportType = urlParams.get('type') || "Monthly Accomplishment Report- Narrative Report";
    const reportId = urlParams.get('id');
    
    console.log('Loading narrative report for:', reportType);
    
    if (reportId) {
        console.log('Loading specific report ID:', reportId);
        fetchNarrativeData(reportId, null);
    } else {
        fetchNarrativeData(null, reportType);
    }
});