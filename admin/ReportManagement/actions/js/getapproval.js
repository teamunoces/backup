// Fetch latest approvals and document info once
fetch('../../php/getapproval.php')
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        // --- Approvals ---
        document.getElementById('ces_head').textContent =
            `${data.ces_head || ''} ${data.ces_head_suffix || ''}`.trim();

        document.getElementById('vp_acad').textContent =
            `${data.vp_acad || ''} ${data.vp_acad_suffix || ''}`.trim();

        document.getElementById('vp_admin').textContent =
            `${data.vp_admin || ''} ${data.vp_admin_suffix || ''}`.trim();

        document.getElementById('school_president').textContent =
            `${data.school_president || ''} ${data.school_president_suffix || ''}`.trim();

        // --- Document Info ---
        document.querySelector('input[name="issue_status"]').value    = data.issue_status || '';
        document.querySelector('input[name="revision_number"]').value = data.revision_number || '';
        document.querySelector('input[name="date_effective"]').value  = data.date_effective || '';
        document.querySelector('input[name="approved_by"]').value     = data.approved_by || '';
    })
    .catch(err => console.error('Failed to fetch approvals & document info:', err));