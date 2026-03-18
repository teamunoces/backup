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
        const response = await fetch(`/admin/Dashboard/Pending/review/programdesign/get.php?id=${reportId}`);
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
                        <td contenteditable="true">${escapeHtml(row.milestones || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.duration || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.objectives || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.persons_involved || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.school_resources || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.community_resources || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.collaborating_agencies || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.budget || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.means_of_verification || '')}</td>
                        <td contenteditable="true">${escapeHtml(row.remarks || '')}</td>
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
    
    // Collect table data
    const rows = document.querySelectorAll('.program-table tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 11) {
            formData.details.push({
                program: cells[0]?.innerText || '',
                milestones: cells[1]?.innerText || '',
                duration: cells[2]?.innerText || '',
                objectives: cells[3]?.innerText || '',
                persons_involved: cells[4]?.innerText || '',
                school_resources: cells[5]?.innerText || '',
                community_resources: cells[6]?.innerText || '',
                collaborating_agencies: cells[7]?.innerText || '',
                budget: cells[8]?.innerText || '',
                means_of_verification: cells[9]?.innerText || '',
                remarks: cells[10]?.innerText || ''
            });
        }
    });
    
    return formData;
}

// Update the re-submit button event listener
document.getElementById('resubmitBtn').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to re-submit this report? It will be sent back for review.')) {
        return;
    }
    
    try {
        const formData = collectFormData();
        
        const response = await fetch('/coordinator/ReportManagement/actions/feedback/pdview/get.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            alert('Report updated successfully and status set to Pending!');
            // Redirect to pending reports page or wherever appropriate
            window.location.href = '/coordinator/ReportManagement/ReportManagement.html'; // Adjust this URL as needed
        } else {
            alert('Failed to update report: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error updating report:', error);
        alert('Error updating report: ' + error.message);
    }
});

// ===== FIXED ADD/DELETE ROW FUNCTIONS =====
document.addEventListener("DOMContentLoaded", function() {
    // Load the report
    loadReport();
    
    // Get buttons
    const addRowBtn = document.querySelector(".add-row-btn");
    const deleteRowBtn = document.querySelector(".delete-row-btn");
    
    // Add Row Function
    if (addRowBtn) {
        addRowBtn.addEventListener("click", function() {
            const tableBody = document.querySelector('.program-table tbody');
            if (tableBody) {
                const newRow = document.createElement("tr");
                // Create 11 editable cells
                for (let i = 0; i < 11; i++) {
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

// Remove the old button declarations and event listeners at the bottom
// The old code at lines 85-112 should be replaced with the above