// APPROVAL LOADER - WITH DEBUGGING
console.log('🚀 Starting approval loader...');

window.addEventListener('load', function() {
    console.log('📄 Window loaded, fetching data...');
    
    fetch('../../php/getapproval.php')
        .then(response => response.json())
        .then(data => {
            console.log('✅ RAW DATA FROM SERVER:', data);
            
            // Specifically log the values we care about
            console.log('👤 user_name from server:', data.user_name);
            console.log('👤 dean from server:', data.dean);
            
            // Set user_name
            const userNameEl = document.getElementById('user_name');
            if (userNameEl) {
                userNameEl.textContent = data.user_name || 'No Name';
                console.log('✓ Set user_name to:', userNameEl.textContent);
            } else {
                console.error('✗ user_name element not found');
            }
            
            // Set dean
            const deanEl = document.getElementById('dean');
            if (deanEl) {
                deanEl.textContent = data.dean || 'No Dean';
                console.log('✓ Set dean to:', deanEl.textContent);
            } else {
                console.error('✗ dean element not found');
            }
            
            // Set CES Head
            const cesHeadEl = document.getElementById('ces_head');
            if (cesHeadEl && data.ces_head) {
                cesHeadEl.textContent = data.ces_head + ' ' + (data.ces_head_suffix || '');
            }
            
            // Set VP Acad
            const vpAcadEl = document.getElementById('vp_acad');
            if (vpAcadEl && data.vp_acad) {
                vpAcadEl.textContent = data.vp_acad + ' ' + (data.vp_acad_suffix || '');
            }
            
            // Set VP Admin
            const vpAdminEl = document.getElementById('vp_admin');
            if (vpAdminEl && data.vp_admin) {
                vpAdminEl.textContent = data.vp_admin + ' ' + (data.vp_admin_suffix || '');
            }
            
            // Set School President
            const schoolPresEl = document.getElementById('school_president');
            if (schoolPresEl && data.school_president) {
                schoolPresEl.textContent = data.school_president + ' ' + (data.school_president_suffix || '');
            }
            
            // Set document info inputs
            const issueStatus = document.querySelector('input[name="issue_status"]');
            if (issueStatus) issueStatus.value = data.issue_status || '';
            
            const revisionNum = document.querySelector('input[name="revision_number"]');
            if (revisionNum) revisionNum.value = data.revision_number || '';
            
            const dateEffective = document.querySelector('input[name="date_effective"]');
            if (dateEffective) dateEffective.value = data.date_effective || '';
            
            const approvedBy = document.querySelector('input[name="approved_by"]');
            if (approvedBy) approvedBy.value = data.approved_by || '';
        })
        .catch(err => {
            console.error('❌ Error:', err);
        });
});

// Backup check after 2 seconds
setTimeout(function() {
    console.log('⏰ Backup check...');
    const deanEl = document.getElementById('dean');
    if (deanEl && (!deanEl.textContent || deanEl.textContent === '')) {
        console.log('⚠️ Dean still empty, setting fallback');
        deanEl.textContent = '______________________';
    }
}, 2000);