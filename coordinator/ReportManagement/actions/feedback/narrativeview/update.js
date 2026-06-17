/**
 * update.js - Update narrative report data
 */

const UPDATE_API_URL = 'update.php';

async function updateNarrativeReport(reportId, updateData) {
    if (!reportId) {
        console.error('Report ID is required for update');
        return { success: false, message: 'Report ID is required' };
    }
    
    try {
        const postData = {
            report_id: reportId,
            ...updateData
        };
        
        console.log('Updating report:', postData);
        
        const response = await fetch(UPDATE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        
        const result = await response.json();
        console.log('Update response:', result);
        
        return result;
        
    } catch (error) {
        console.error('Error updating report:', error);
        return { success: false, message: 'Network error occurred' };
    }
}

async function updateReportContent(reportId, narrate_success, provide_data, identify_problems, propose_solutions) {
    return await updateNarrativeReport(reportId, {
        narrate_success: narrate_success,
        provide_data: provide_data,
        identify_problems: identify_problems,
        propose_solutions: propose_solutions
    });
}

// Auto-setup when page loads
document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.querySelector('.submit-button');
    
    if (submitButton) {
        // Remove existing event listeners by cloning
        const newButton = submitButton.cloneNode(true);
        submitButton.parentNode.replaceChild(newButton, submitButton);
        
        newButton.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // Check if we have an existing report to update
            if (window.currentReportData && window.currentReportData.id) {
                
                // Get form data
                const narrateSuccess = document.getElementById('narrate_success').value.trim();
                const provideData = document.getElementById('provide_data').value.trim();
                const identifyProblems = document.getElementById('identify_problems').value.trim();
                const proposeSolutions = document.getElementById('propose_solutions').value.trim();
                
                if (!narrateSuccess || !provideData || !identifyProblems || !proposeSolutions) {
                    alert('Please fill in all fields before updating.');
                    return;
                }
                
                newButton.disabled = true;
                newButton.textContent = 'Re-Submitting...';
                
                const result = await updateReportContent(
                    window.currentReportData.id,
                    narrateSuccess,
                    provideData,
                    identifyProblems,
                    proposeSolutions
                );
                
                if (result.success) {
                    alert('Report re-submitted successfully! Status set to pending.');
                    // Update the current report data
                    window.currentReportData.narrate_success = narrateSuccess;
                    window.currentReportData.provide_data = provideData;
                    window.currentReportData.identify_problems = identifyProblems;
                    window.currentReportData.propose_solutions = proposeSolutions;
                    window.currentReportData.status = 'pending';
                } else {
                    alert('Error: ' + result.message);
                }
                
                newButton.disabled = false;
                newButton.textContent = 'Re-Submit';
            }
        });
    }
});