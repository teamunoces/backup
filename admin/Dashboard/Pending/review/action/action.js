function updateStatus(status) {
    const fileIdEl = document.getElementById('currentReportId');
    const feedbackEl = document.getElementById('admincomment');
    const reportTypeEl = document.getElementById('currentReportType');

    if (!fileIdEl || !feedbackEl || !reportTypeEl) {
        alert("Required elements not found on page.");
        return;
    }

    const fileId = fileIdEl.value;
    const feedback = feedbackEl.value.trim();
    const reportType = reportTypeEl.value;

    if (feedback === "") {
        alert("Please enter admin feedback before updating the status.");
        return;
    }

    fetch('/admin/Dashboard/Pending/review/action/action.php', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            id: fileId, 
            type: reportType, 
            status: status, 
            feedback: feedback 
        })
    })
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
    })
    .then(data => {
        if (data.success) {
            alert(`Status updated to "${status}" successfully!`);
            // Clear the feedback field
            document.getElementById('admincomment').value = '';
            // Redirect to the pending page
            window.location.href = '/admin/Dashboard/Pending/pending.html'; // Adjust this path as needed
        } else {
            alert('Failed to update: ' + data.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert('An error occurred while updating the status.');
    });
}

/* -----------------------
   BUTTON EVENTS
------------------------*/

document.addEventListener('DOMContentLoaded', function() {
    const rejectBtn = document.getElementById('rejectReport');
    const needFixesBtn = document.getElementById('needFixes');
    const approveBtn = document.getElementById('approveReport');

    if (rejectBtn) {
        rejectBtn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            updateStatus('rejected'); 
        });
    }

    if (needFixesBtn) {
        needFixesBtn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            updateStatus('need fix'); 
        });
    }

    if (approveBtn) {
        approveBtn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            updateStatus('approve'); 
        });
    }
});