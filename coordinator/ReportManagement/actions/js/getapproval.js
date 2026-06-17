const approvalDebug = new URLSearchParams(window.location.search).has('debug');
const approvalLog = (...args) => {
    if (approvalDebug) {
        console.log(...args);
    }
};
const approvalWarn = (...args) => {
    if (approvalDebug) {
        console.warn(...args);
    }
};

window.addEventListener('load', function() {
    approvalLog('Starting approval loader...');

    fetch('../../php/getapproval.php')
        .then(response => response.json())
        .then(data => {
            approvalLog('Raw approval data from server:', data);

            const userNameEl = document.getElementById('user_name');
            if (userNameEl) {
                userNameEl.textContent = data.user_name || 'No Name';
                approvalLog('Set user_name to:', userNameEl.textContent);
            } else {
                approvalWarn('user_name element not found');
            }

            const deanEl = document.getElementById('dean');
            if (deanEl) {
                deanEl.textContent = data.dean || 'No Dean';
                approvalLog('Set dean to:', deanEl.textContent);
            } else {
                approvalWarn('dean element not found');
            }

            const cesHeadEl = document.getElementById('ces_head');
            if (cesHeadEl && data.ces_head) {
                cesHeadEl.textContent = `${data.ces_head} ${data.ces_head_suffix || ''}`.trim();
            }

            const vpAcadEl = document.getElementById('vp_acad');
            if (vpAcadEl && data.vp_acad) {
                vpAcadEl.textContent = `${data.vp_acad} ${data.vp_acad_suffix || ''}`.trim();
            }

            const vpAdminEl = document.getElementById('vp_admin');
            if (vpAdminEl && data.vp_admin) {
                vpAdminEl.textContent = `${data.vp_admin} ${data.vp_admin_suffix || ''}`.trim();
            }

            const schoolPresEl = document.getElementById('school_president');
            if (schoolPresEl && data.school_president) {
                schoolPresEl.textContent = `${data.school_president} ${data.school_president_suffix || ''}`.trim();
            }

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
            approvalWarn('Approval data could not be loaded:', err);
        });
});

setTimeout(function() {
    approvalLog('Approval backup check...');
    const deanEl = document.getElementById('dean');
    if (deanEl && (!deanEl.textContent || deanEl.textContent === '')) {
        approvalLog('Dean still empty, setting fallback');
        deanEl.textContent = '______________________';
    }
}, 2000);
