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
                document.getElementById('admincomment').value = '';
            } else {
                alert('Failed to update: ' + data.message);
            }
        })
        .catch(err => console.error(err));
}

/* -----------------------
   BUTTON EVENTS
------------------------*/

document.getElementById('rejectReport')
.addEventListener('click', (e) => { 
    e.preventDefault(); 
    updateStatus('rejected'); 
});

document.getElementById('needFixes')
.addEventListener('click', (e) => { 
    e.preventDefault(); 
    updateStatus('need fix'); 
});

document.getElementById('approveReport')
.addEventListener('click', (e) => { 
    e.preventDefault(); 
    updateStatus('approve'); 
});