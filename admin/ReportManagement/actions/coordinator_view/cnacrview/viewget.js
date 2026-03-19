function loadReportById(reportId) {
    document.body.style.cursor = 'wait';
    
    fetch(`viewget.php?id=${reportId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                populateFormFields(data.report);
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error))
        .finally(() => document.body.style.cursor = 'default');
}

function populateFormFields(report) {
    // Field mappings for input/textarea elements
    const fieldMappings = {
        'department': 'department',
        'date_submitted': 'date',
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
        // Removed coordinator_name and coordinator_dean from here since they're not input elements
    };

    // Populate input/textarea elements
    for (const [dbField, formField] of Object.entries(fieldMappings)) {
        const element = document.querySelector(`textarea[name="${formField}"], input[name="${formField}"]`);
        if (element && report[dbField] !== undefined) {
            element.value = report[dbField];
            if (element.tagName === 'TEXTAREA') {
                autoExpand(element);
            }
        }
    }
    
    // Populate signature div elements (these use the database column names directly)
    const coordinatorNameDiv = document.getElementById('coordinator_name');
    if (coordinatorNameDiv && report.created_by_name !== undefined) {  // ← FIXED: use created_by_name
        coordinatorNameDiv.textContent = report.created_by_name;
    }

    const coordinatorDeanDiv = document.getElementById('coordinator_dean');
    if (coordinatorDeanDiv && report.dean !== undefined) {  // ← FIXED: use dean
        coordinatorDeanDiv.textContent = report.dean;
    }
    
    otherSignatures.forEach(sig => {
        const element = document.getElementById(sig.id);
        if (element && report[sig.field] !== undefined) {
            element.textContent = report[sig.field];
        }
    });
}

function autoExpand(element) {
    element.style.height = 'auto';
    element.style.height = (element.scrollHeight) + 'px';
}