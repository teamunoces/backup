// Function to submit the report
function submitReport() {
    // Get data from window.userData (passed from PHP)
    const reportType = window.userData.reportType;
    
    console.log('Report Type:', reportType);

    // Get current date for date_submitted (when report is made)
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Get form data from the page
    const formData = {
        type: reportType,
        date_submitted: formattedDate,
        assessment_date: document.querySelector('[name="assessment_date"]')?.value || '',
        participant_name: document.querySelector('[name="participant_name"]')?.value || '',
        location: document.querySelector('[name="location"]')?.value || '',
        family_profile: document.querySelector('[name="family_profile"]')?.value || '',
        communtiy_concern: document.querySelector('[name="communtiy_concern"]')?.value || '',
        identified_needs: document.querySelector('[name="identified_needs"]')?.value || '',
        prevailing_needs: document.querySelector('[name="prevailing_needs"]')?.value || '',
        title_of_program: document.querySelector('[name="title_of_program"]')?.value || '',
        objectives: document.querySelector('[name="objectives"]')?.value || '',
        beneficiaries: document.querySelector('[name="beneficiaries"]')?.value || '',
        resources_needed: document.querySelector('[name="resources_needed"]')?.value || '',
    };

    console.log('Sending data:', formData);

    // Send to database via AJAX
    fetch('post.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response:', data);
      if (data.success) {
            alert('Submitted successfully!');
            
            // Clear all textareas manually
            document.querySelectorAll('textarea').forEach(textarea => {
                textarea.value = '';
            });
            
            // Clear any input fields
            document.querySelectorAll('input[type="text"]').forEach(input => {
                input.value = '';
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to submit report: ' + error.message);
    });
}