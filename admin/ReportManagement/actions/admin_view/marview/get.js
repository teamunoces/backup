// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    loadReportData();
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
                populateHeaderData(data.header);
                populateTableData(data.details);
            }
            // Silently fail without showing error messages
        })
        .catch(error => {
            // Silently fail without showing error messages
            console.log(); // Empty console log to avoid ESLint errors
        });
}

// Function to populate header fields with correct column mappings
function populateHeaderData(headerData) {
    try {
        displayApprovalDocumentInfo(headerData);

        // Map database fields to form fields based on your actual column names
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

        // Also populate type if you have a field for it
        const typeElement = document.getElementById('report_type');
        if (typeElement && headerData.type) {
            typeElement.value = headerData.type;
        }
    } catch (error) {
        // Silently fail
    }
}

function formatNameWithSuffix(name, suffix) {
    const cleanName = String(name || '').trim();
    const cleanSuffix = String(suffix || '').trim();

    if (!cleanName) return cleanSuffix;
    if (!cleanSuffix) return cleanName;
    return `${cleanName}, ${cleanSuffix}`;
}

function setTextIfExists(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value || '';
    }
}

function setInputByNameIfExists(name, value) {
    const element = document.querySelector(`input[name="${name}"]`);
    if (element) {
        element.value = value || '';
    }
}

function displayApprovalDocumentInfo(report) {
    if (!report) return;

    setTextIfExists('dean', report.dean || '');
    setTextIfExists('ces_head', formatNameWithSuffix(report.ces_head, report.ces_head_suffix));
    setTextIfExists('vp_acad', formatNameWithSuffix(report.vp_acad, report.vp_acad_suffix));
    setTextIfExists('vp_admin', formatNameWithSuffix(report.vp_admin, report.vp_admin_suffix));
    setTextIfExists('school_president', formatNameWithSuffix(report.school_president, report.school_president_suffix));
    setInputByNameIfExists('issue_status', report.issue_status);
    setInputByNameIfExists('revision_number', report.revision_number);
    setInputByNameIfExists('date_effective', report.date_effective);
    setInputByNameIfExists('approved_by', report.approved_by);
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
                const tr = document.createElement('tr');
                tr.setAttribute('data-row-id', row.id || index);
                
                // Map database columns to table cells based on your actual column names
                const cellValues = [
                    row.date_of_act || '',                    // Date column
                    row.activities_conducted || '',           // Activities Conducted
                    row.objectives || '',                      // Objectives
                    row.act_status || '',                      // Status (act_status)
                    row.issues_or_concerns || '',              // Issues or Concerns
                    row.financial_report || '',                // Financial Report
                    row.recommendations || '',                 // Recommendations
                    row.plans_for_next_months || ''            // Plans for Next Months
                ];
                
                cellValues.forEach(cellValue => {
                    const td = document.createElement('td');
                    td.contentEditable = 'true';
                    td.textContent = cellValue;
                    tr.appendChild(td);
                });
                
                tbody.appendChild(tr);
            });
        } else {
            addEmptyRow(tbody);
        }
    } catch (error) {
        // Silently fail
    }
}

// Function to add an empty row
function addEmptyRow(tbody) {
    const tr = document.createElement('tr');
    for (let i = 0; i < 8; i++) {
        const td = document.createElement('td');
        td.contentEditable = 'true';
        td.textContent = '';
        tr.appendChild(td);
    }
    tbody.appendChild(tr);
}

// Function to add a new row (can be called from a button)
function addNewRow() {
    const tbody = document.querySelector('.main-table tbody');
    if (tbody) {
        const tr = document.createElement('tr');
        
        for (let i = 0; i < 8; i++) {
            const td = document.createElement('td');
            td.contentEditable = 'true';
            td.textContent = '';
            tr.appendChild(td);
        }
        
        tbody.appendChild(tr);
    }
}
