// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    loadReportData();
    
    // Attach event listener to re-submit button
    const resubmitBtn = document.getElementById('resubmitBtn');
    if (resubmitBtn) {
        resubmitBtn.addEventListener('click', handleResubmit);
    }
});

function loadReportData() {
    // Try URL first
    const params = new URLSearchParams(window.location.search);
    let reportId = params.get("id");

    // Fallback to hidden input if URL doesn't have ?id=
    if (!reportId) {
        const hiddenInput = document.getElementById('currentReportId');
        if (hiddenInput && hiddenInput.value) {
            reportId = hiddenInput.value;
        }
    }

    if (!reportId) {
        // Silently return without showing any message
        return;
    }

    // Fetch data from get.php
    fetch(`get.php?mar_id=${encodeURIComponent(reportId)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Display feedback in admin comment section (DISPLAY ONLY)
                displayFeedback(data.header.feedback);
                populateHeaderData(data.header);
                populateTableData(data.details);
            }
        })
        .catch(error => {
            console.log('Error loading report:', error);
        });
}

// Display feedback in admin comment (DISPLAY ONLY)
function displayFeedback(feedback) {
    const adminComment = document.getElementById('admincomment');
    if (adminComment) {
        adminComment.value = feedback || '';
        // Make it read-only to indicate it's for display only
        adminComment.readOnly = true;
        // Optional: add a class to style it differently
        adminComment.classList.add('feedback-display');
    }
}

// Function to populate header fields with correct column mappings
function populateHeaderData(headerData) {
    try {
        // Map database fields to form fields
        const fieldMappings = {
            'department': headerData.department,
            'month': headerData.month,
            'title_act': headerData.title_act,
            'location': headerData.location,
            'benefeciaries': headerData.benefeciaries,
            'date_submitted': headerData.date_submitted
        };

        // Populate each field if it exists
        for (const [fieldId, value] of Object.entries(fieldMappings)) {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = value || '';
            }
        }
    } catch (error) {
        console.log('Error populating header:', error);
    }
}

// Function to populate table data with correct column mappings
function populateTableData(detailsData) {
    try {
        const tbody = document.querySelector('.main-table tbody');
        if (!tbody) {
            return;
        }
        
        tbody.innerHTML = ''; // Clear existing rows
        
        if (detailsData && detailsData.length > 0) {
            detailsData.forEach((row, index) => {
                addTableRow(tbody, row);
            });
        } else {
            addEmptyRow(tbody);
        }
    } catch (error) {
        console.log('Error populating table:', error);
    }
}

// Add a table row with data
function addTableRow(tbody, rowData = {}) {
    const tr = document.createElement('tr');
    
    // Map database columns to table cells
    const cellValues = [
        rowData.date_of_act || '',                    // Date column
        rowData.activities_conducted || '',           // Activities Conducted
        rowData.objectives || '',                      // Objectives
        rowData.act_status || '',                      // Status
        rowData.issues_or_concerns || '',              // Issues or Concerns
        rowData.financial_report || '',                // Financial Report
        rowData.recommendations || '',                 // Recommendations
        rowData.plans_for_next_months || ''            // Plans for Next Months
    ];
    
    cellValues.forEach(cellValue => {
        const td = document.createElement('td');
        td.contentEditable = 'true';
        td.textContent = cellValue;
        tr.appendChild(td);
    });
    
    tbody.appendChild(tr);
}

// Function to add an empty row
function addEmptyRow(tbody) {
    addTableRow(tbody, {});
}

// Collect all form data for update (EXCLUDING admincomment)
function collectFormData() {
    const params = new URLSearchParams(window.location.search);
    let reportId = params.get("id") || document.getElementById('currentReportId')?.value;
    
    if (!reportId) {
        throw new Error("No report ID found");
    }
    
    // Collect header fields (EXCLUDING feedback)
    const formData = {
        id: reportId,
        department: document.getElementById('department')?.value || '',
        month: document.getElementById('month')?.value || '',
        title_act: document.getElementById('title_act')?.value || '',
        location: document.getElementById('location')?.value || '',
        benefeciaries: document.getElementById('benefeciaries')?.value || '',
        date_submitted: document.getElementById('date_submitted')?.value || '',
        details: []
    };
    
    // Collect table data
    const tbody = document.querySelector('.main-table tbody');
    if (tbody) {
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 8) {
                const detail = {
                    date_of_act: cells[0]?.textContent || '',
                    activities_conducted: cells[1]?.textContent || '',
                    objectives: cells[2]?.textContent || '',
                    act_status: cells[3]?.textContent || '',
                    issues_or_concerns: cells[4]?.textContent || '',
                    financial_report: cells[5]?.textContent || '',
                    recommendations: cells[6]?.textContent || '',
                    plans_for_next_months: cells[7]?.textContent || ''
                };
                
                // Only add if at least one field has data
                if (Object.values(detail).some(value => value.trim() !== '')) {
                    formData.details.push(detail);
                }
            }
        });
    }
    
    console.log('Collected form data (feedback excluded):', formData);
    return formData;
}

// Handle re-submit button click
async function handleResubmit() {
    if (!confirm('Are you sure you want to re-submit this report? It will be sent back for review with your updates.')) {
        return;
    }
    
    try {
        const formData = collectFormData();
        console.log('Submitting data (feedback excluded):', formData);
        
        // Try multiple paths to find update.php
        const paths = [
            'update.php',
            './update.php',
            '/coordinator/ReportManagement/actions/feedback/marview/update.php'
        ];
        
        let response = null;
        let lastError = null;
        
        for (const path of paths) {
            try {
                console.log('Trying path:', path);
                response = await fetch(path, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    console.log('Success with path:', path);
                    break;
                }
            } catch (e) {
                lastError = e;
                console.log('Path failed:', path, e.message);
            }
        }
        
        if (!response) {
            throw new Error('Could not connect to server. Tried multiple paths. Last error: ' + (lastError ? lastError.message : 'Unknown'));
        }

        const responseText = await response.text();
        console.log('Raw response:', responseText);
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse JSON. Response was:', responseText);
            throw new Error('Server returned invalid JSON. Check PHP errors.');
        }

        if (result.success) {
            alert('Report updated successfully and status set to Pending!');
            // Redirect to pending reports page
            window.location.href = '/coordinator/ReportManagement/ReportManagement.html';
        } else {
            alert('Failed to update report: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating report:', error);
        alert('Error updating report: ' + error.message);
    }
}

// Function to add a new row (can be called from a button)
function addNewRow() {
    const tbody = document.querySelector('.main-table tbody');
    if (tbody) {
        addEmptyRow(tbody);
    }
}