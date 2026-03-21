async function loadReport() {
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
        alert("No report ID found");
        return;
    }

    try {
        const response = await fetch(`./get.php?id=${reportId}`);
        const data = await response.json();

        console.log("Loaded report:", data);

        if (data.error) {
            alert("Error: " + data.error);
            return;
        }

        const project = data.project;
        const programs = data.programs;

        // Display feedback in admin comment section (DISPLAY ONLY - NOT FOR UPDATE)
        displayFeedback(project.feedback);

        /* Fill top form fields */
        document.getElementById("title_of_project").value = project.title_of_project || "";
        autoExpand(document.getElementById("title_of_project"));
        
        document.getElementById("description_of_project").value = project.description_of_project || "";
        autoExpand(document.getElementById("description_of_project"));
        
        document.getElementById("general_objectives").value = project.general_objectives || "";
        autoExpand(document.getElementById("general_objectives"));
        
        document.getElementById("program_justification").value = project.program_justification || "";
        autoExpand(document.getElementById("program_justification"));
        
        document.getElementById("beneficiaries").value = project.beneficiaries || "";
        autoExpand(document.getElementById("beneficiaries"));
        
        document.getElementById("program_plan_text").value = project.program_plan_text || "";
        autoExpand(document.getElementById("program_plan_text"));

        /* Fill program table */
        const tableBody = document.querySelector("#programPlanTable tbody");
        if (!tableBody) return;
        tableBody.innerHTML = "";

        if (!programs || programs.length === 0) {
            // Add one empty row if no programs
            addEmptyProgramRow(tableBody);
        } else {
            programs.forEach(p => {
                addProgramRow(tableBody, p);
            });
        }

    } catch (error) {
        console.error("Error loading report:", error);
        alert("Error loading report: " + error.message);
    }
}

// Display feedback in admin comment (DISPLAY ONLY)
function displayFeedback(feedback) {
    const adminComment = document.getElementById('admincomment');
    if (adminComment) {
        adminComment.value = feedback || '';
        autoExpand(adminComment);
        // Make it read-only to indicate it's for display only
        adminComment.readOnly = true;
        // Optional: add a class to style it differently
        adminComment.classList.add('feedback-display');
    }
}

// Auto-expand textareas
function autoExpand(element) {
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = (element.scrollHeight) + 'px';
}

// Add a program row to the table
function addProgramRow(tableBody, programData = {}) {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><textarea class="program-field" rows="5" placeholder="Enter program...">${escapeHtml(programData.program || '')}</textarea></td>
        <td><textarea class="objectives-field" rows="5" placeholder="Enter objectives...">${escapeHtml(programData.objectives || '')}</textarea></td>
        <td><textarea class="strategies-field" rows="5" placeholder="Enter strategies...">${escapeHtml(programData.strategies || '')}</textarea></td>
        <td><textarea class="persons-field" rows="5" placeholder="Enter persons/agencies...">${escapeHtml(programData.persons_agencies_involved || '')}</textarea></td>
        <td><textarea class="resources-field" rows="5" placeholder="Enter resources needed...">${escapeHtml(programData.resources_needed || '')}</textarea></td>
        <td><textarea class="budget-field" rows="5" placeholder="Enter budget...">${escapeHtml(programData.budget || '')}</textarea></td>
        <td><textarea class="means-field" rows="5" placeholder="Enter means of verification...">${escapeHtml(programData.means_of_verification || '')}</textarea></td>
        <td><textarea class="timeframe-field" rows="5" placeholder="Enter time frame...">${escapeHtml(programData.time_frame || '')}</textarea></td>
    `;
    tableBody.appendChild(row);
    
    // Auto-expand all textareas in the new row
    row.querySelectorAll('textarea').forEach(textarea => {
        autoExpand(textarea);
        textarea.addEventListener('input', function() { autoExpand(this); });
    });
}

// Add an empty program row
function addEmptyProgramRow(tableBody) {
    addProgramRow(tableBody, {});
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== ADD/DELETE ROW FUNCTIONS =====
function addTableRow() {
    const tableBody = document.querySelector("#programPlanTable tbody");
    if (tableBody) {
        addEmptyProgramRow(tableBody);
    } else {
        console.error("Table body not found");
    }
}

function deleteTableRow() {
    const tableBody = document.querySelector("#programPlanTable tbody");
    if (!tableBody) {
        console.error("Table body not found");
        return;
    }
    
    const rows = tableBody.querySelectorAll("tr");
    
    if (rows.length > 1) {
        tableBody.removeChild(rows[rows.length - 1]); // remove last row
    } else {
        alert("At least one row must remain.");
    }
}

// Collect all form data for update (EXCLUDING admincomment)
function collectFormData() {
    const params = new URLSearchParams(window.location.search);
    let reportId = params.get("id") || document.getElementById('currentReportId')?.value;
    
    if (!reportId) {
        throw new Error("No report ID found");
    }
    
    // Collect main fields (EXCLUDING feedback/admincomment)
    const formData = {
        id: reportId,
        // DO NOT include feedback field here - it's for display only
        title_of_project: document.getElementById('title_of_project')?.value || '',
        description_of_project: document.getElementById('description_of_project')?.value || '',
        general_objectives: document.getElementById('general_objectives')?.value || '',
        program_justification: document.getElementById('program_justification')?.value || '',
        beneficiaries: document.getElementById('beneficiaries')?.value || '',
        program_plan_text: document.getElementById('program_plan_text')?.value || '',
        programs: []
    };
    
    // Collect program data from table
    const tableBody = document.querySelector("#programPlanTable tbody");
    if (tableBody) {
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            const program = {
                program: row.querySelector('.program-field')?.value || '',
                objectives: row.querySelector('.objectives-field')?.value || '',
                strategies: row.querySelector('.strategies-field')?.value || '',
                persons_agencies_involved: row.querySelector('.persons-field')?.value || '',
                resources_needed: row.querySelector('.resources-field')?.value || '',
                budget: row.querySelector('.budget-field')?.value || '',
                means_of_verification: row.querySelector('.means-field')?.value || '',
                time_frame: row.querySelector('.timeframe-field')?.value || ''
            };
            
            // Only add if at least one field has data
            if (Object.values(program).some(value => value.trim() !== '')) {
                formData.programs.push(program);
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
        
        // Try multiple paths
        const paths = [
            'update.php',
            './update.php',
            '/coordinator/ReportManagement/actions/feedback/3ydp/update.php'
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

// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
    loadReport();
    
    // Attach event listener to re-submit button
    const resubmitBtn = document.getElementById('resubmitBtn');
    if (resubmitBtn) {
        resubmitBtn.addEventListener('click', handleResubmit);
    }
    
    // Add auto-expand to all textareas
    document.querySelectorAll('textarea').forEach(textarea => {
        // Skip the admincomment textarea if you don't want it auto-expanding
        if (textarea.id !== 'admincomment') {
            autoExpand(textarea);
            textarea.addEventListener('input', function() { autoExpand(this); });
        }
    });
});