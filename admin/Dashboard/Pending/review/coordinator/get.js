function loadReportById(reportId) {
    document.body.style.cursor = 'wait';
    
    fetch(`get.php?id=${reportId}`)
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
    const fieldMappings = {
        // Database field => Form field name
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

    // Loop through each mapping and populate the form fields
    for (const [dbField, formField] of Object.entries(fieldMappings)) {
        // Look for both textarea and input elements
        const element = document.querySelector(`textarea[name="${formField}"], input[name="${formField}"]`);
        
        if (element && report[dbField] !== undefined && report[dbField] !== null) {
            element.value = report[dbField];
            
            // Trigger auto-expand for textareas
            if (element.tagName === 'TEXTAREA') {
                autoExpand(element);
            }
        }
    }
}

function autoExpand(element) {
    element.style.height = 'auto';
    element.style.height = (element.scrollHeight) + 'px';
}