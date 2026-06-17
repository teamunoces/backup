async function loadReport() {
    const params = new URLSearchParams(window.location.search);
  
    let reportId = params.get("id");

    if (!reportId) {
        const hiddenInput = document.getElementById('currentReportId');
        if (hiddenInput && hiddenInput.value) {
            reportId = hiddenInput.value;
        }
    }

    if (!reportId) {
        alert("No report ID found");
        return;
    }

    try {
        const response = await fetch(`/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/programdesign/get.php?id=${reportId}`);
        const data = await response.json();

        console.log("Fetched data:", data);

        if (data.success && data.main) {
            // Fill top input fields
            document.getElementById('admincomment').value = data.main.feedback || '';
            document.getElementById('department').value = data.main.department || '';
            document.getElementById('title_of_activity').value = data.main.title_of_activity || '';
            document.getElementById('participants').value = data.main.participants || '';
            document.getElementById('location').value = data.main.location || '';

            // Populate table
            const tableBody = document.querySelector('.program-table tbody');
            tableBody.innerHTML = ''; // clear existing rows

            if (data.details && data.details.length > 0) {
                data.details.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td contenteditable="true">${escapeHtml(row.program || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.objectives || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.program_content_and_activities || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.service_delivery || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.partnerships_and_stakeholders || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.facilitators_and_trainers || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.program_start_and_end_dates || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.frequency_of_activities || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.community_resources || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.school_resources || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.risk_management_and_contingency_plans || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.sustainability_and_follow_up || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.promotion_and_awareness || '')}</td>
                    `;
                    tableBody.appendChild(tr);
                });
            } else {
                // Add one empty row if no details
                addEmptyRow();
            }
        } else {
            console.warn("No data returned for this report ID.");
            addEmptyRow();
        }
    } catch (error) {
        console.error("Error loading data:", error);
        addEmptyRow();
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper function to add an empty row
function addEmptyRow() {
    const tableBody = document.querySelector('.program-table tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
        <td contenteditable="true"></td>
    `;
    tableBody.appendChild(tr);
}

// Function to collect all form data
function collectFormData() {
    const params = new URLSearchParams(window.location.search);
    let reportId = params.get("id") || document.getElementById('currentReportId')?.value;
    
    if (!reportId) {
        throw new Error("No report ID found");
    }
    
    // Collect main fields
    const formData = {
        id: reportId,
        department: document.getElementById('department')?.value || '',
        title_of_activity: document.getElementById('title_of_activity')?.value || '',
        participants: document.getElementById('participants')?.value || '',
        location: document.getElementById('location')?.value || '',
        feedback: document.getElementById('admincomment')?.value || '',
        details: []
    };
    
    // Collect table data - UPDATED for 13 columns
    const rows = document.querySelectorAll('.program-table tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 13) {
            formData.details.push({
                program: cells[0]?.innerText || '',
                objectives: cells[1]?.innerText || '',
                program_content_and_activities: cells[2]?.innerText || '',
                service_delivery: cells[3]?.innerText || '',
                partnerships_and_stakeholders: cells[4]?.innerText || '',
                facilitators_and_trainers: cells[5]?.innerText || '',
                program_start_and_end_dates: cells[6]?.innerText || '',
                frequency_of_activities: cells[7]?.innerText || '',
                community_resources: cells[8]?.innerText || '',
                school_resources: cells[9]?.innerText || '',
                risk_management_and_contingency_plans: cells[10]?.innerText || '',
                sustainability_and_follow_up: cells[11]?.innerText || '',
                promotion_and_awareness: cells[12]?.innerText || ''
            });
        }
    });
    
    return formData;
}

// Update the re-submit button event listener to use update.php
document.getElementById('resubmitBtn').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to re-submit this report? It will be sent back for review.')) {
        return;
    }
    
    // Disable the button to prevent double submission
    const submitBtn = document.getElementById('resubmitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const formData = collectFormData();
        
        // Validate that at least one detail row has data
        const hasValidData = formData.details.some(row => {
            return Object.values(row).some(value => value && value.trim() !== '');
        });
        
        if (!hasValidData) {
            alert('Please add at least one row with program details before submitting.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }
        
        // Validate required main fields
        const requiredFields = ['department', 'title_of_activity', 'participants', 'location'];
        const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
        
        if (missingFields.length > 0) {
            alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }
        
        const response = await fetch('/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/feedback/pdview/update.php', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();

        if (result.success) {
            alert(result.message || 'Report updated successfully and status set to Pending!');
            
            // Optional: Show success message with details
            if (result.data) {
                console.log('Submission details:', result.data);
            }
            
            // Redirect to pending reports page or dashboard
            window.location.href = '/SYSTEM_VERSION_!/coordinator/Report/Reports.html';
        } else {
            alert('Failed to update report: ' + (result.message || 'Unknown error'));
            console.error('Error details:', result.error_details);
        }
    } catch (error) {
        console.error('Error updating report:', error);
        alert('Error updating report: ' + error.message);
    } finally {
        // Re-enable the button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Add a function to auto-save as draft (optional)
let autoSaveTimeout;
function autoSaveDraft() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(async () => {
        try {
            const formData = collectFormData();
            // You can add a draft endpoint here if needed
            console.log('Auto-saving draft...', formData);
        } catch (error) {
            console.log('Auto-save failed:', error);
        }
    }, 30000); // Auto-save every 30 seconds of inactivity
}

// Add event listeners for auto-save
document.addEventListener('DOMContentLoaded', () => {
    // Listen for input changes
    const inputs = document.querySelectorAll('input, textarea, [contenteditable="true"]');
    inputs.forEach(input => {
        input.addEventListener('input', autoSaveDraft);
        input.addEventListener('keyup', autoSaveDraft);
    });
});

// Add validation before submission
function validateFormData(formData) {
    const errors = [];
    
    // Validate main fields
    if (!formData.department || formData.department.trim() === '') {
        errors.push('Department is required');
    }
    if (!formData.title_of_activity || formData.title_of_activity.trim() === '') {
        errors.push('Title of Activity is required');
    }
    if (!formData.participants || formData.participants.trim() === '') {
        errors.push('Participants is required');
    }
    if (!formData.location || formData.location.trim() === '') {
        errors.push('Location is required');
    }
    
    // Validate details
    if (!formData.details || formData.details.length === 0) {
        errors.push('At least one program detail row is required');
    }
    
    return errors;
}

// Enhance collectFormData to include validation
const originalCollectFormData = collectFormData;
window.collectFormData = function() {
    try {
        const data = originalCollectFormData();
        const errors = validateFormData(data);
        
        if (errors.length > 0) {
            console.warn('Form validation warnings:', errors);
        }
        
        return data;
    } catch (error) {
        console.error('Error collecting form data:', error);
        throw error;
    }
};

// ===== FIXED ADD/DELETE ROW FUNCTIONS FOR 13 COLUMNS =====
document.addEventListener("DOMContentLoaded", function() {
    // Load the report
    loadReport();
    
    // Get buttons
    const addRowBtn = document.querySelector(".add-row-btn");
    const deleteRowBtn = document.querySelector(".delete-row-btn");
    
    // Add Row Function - UPDATED for 13 columns
    if (addRowBtn) {
        addRowBtn.addEventListener("click", function() {
            const tableBody = document.querySelector('.program-table tbody');
            if (tableBody) {
                const newRow = document.createElement("tr");
                // Create 13 editable cells (matching table columns)
                for (let i = 0; i < 13; i++) {
                    const td = document.createElement("td");
                    td.contentEditable = "true";
                    newRow.appendChild(td);
                }
                tableBody.appendChild(newRow);
            } else {
                console.error("Table body not found");
            }
        });
    }
    
    // Delete Row Function
    if (deleteRowBtn) {
        deleteRowBtn.addEventListener("click", function() {
            const tableBody = document.querySelector('.program-table tbody');
            if (tableBody) {
                const rows = tableBody.querySelectorAll("tr");
                
                if (rows.length > 1) {
                    tableBody.removeChild(rows[rows.length - 1]); // remove last row
                } else {
                    alert("At least one row must remain.");
                }
            } else {
                console.error("Table body not found");
            }
        });
    }
});