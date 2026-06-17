// Load report data when page loads
function loadReportById(reportId) {
    document.body.style.cursor = 'wait';
    
    fetch(`./viewget.php?id=${reportId}`)
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

function populateFormFields(report) {
    displayApprovalDocumentInfo(report);
    // existing mappings...
    const fieldMappings = {
        'department': 'department',
        'date': 'date',
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

    // ===== EXISTING LOOP =====
    for (const [dbField, formField] of Object.entries(fieldMappings)) {
        if (formField === 'date') {
            const element = document.getElementById('date_submitted');
            if (element && report[dbField] != null) {
                element.value = report[dbField];
            }
        } else {
            const element = document.querySelector(`textarea[name="${formField}"], input[name="${formField}"]`);
            if (element && report[dbField] != null) {
                element.value = report[dbField];
                if (element.tagName === 'TEXTAREA') autoExpand(element);
            }
        }
    }

    // ===== NEW PART (IMPORTANT) =====

    // Created by (CES Coordinator)
    const createdBy = document.getElementById('created_by_name');
    if (createdBy && report.created_by_name != null) {
        createdBy.textContent = report.created_by_name;
    }

    // Dean
    const dean = document.getElementById('dean');
    if (dean && report.dean != null) {
        dean.textContent = report.dean;
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

function formatNameWithSuffix(name, suffix) {
    const cleanName = String(name || '').trim();
    const cleanSuffix = String(suffix || '').trim();

    if (!cleanName) return cleanSuffix;
    if (!cleanSuffix) return cleanName;

    return `${cleanName}, ${cleanSuffix}`;
}

function setTextIfExists(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value || '';
}

function setInputByNameIfExists(name, value) {
    const element = document.querySelector(`[name="${name}"]`);
    if (element) element.value = value || '';
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
