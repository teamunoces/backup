document.addEventListener('DOMContentLoaded', () => {
    const editBtn = document.querySelector('.edit-btn');
    const saveBtn = document.querySelector('.save-btn');

    // Select all text inputs inside the form
    const inputs = document.querySelectorAll('.form-content input[type="text"]');

    // Ensure everything is disabled on load
    inputs.forEach(input => input.setAttribute('disabled', true));
    saveBtn.style.display = 'none';

    /* ===== LOAD PREVIOUS DATA ===== */
    fetch('Approval.php') // GET request to fetch saved data
        .then(res => res.json())
        .then(data => {
            inputs.forEach(input => {
                if (data[input.name] !== undefined) {
                    input.value = data[input.name];
                }
            });
        })
        .catch(err => console.error('Error fetching data:', err));

    /* ===== EDIT MODE ===== */
    editBtn.addEventListener('click', () => {
        inputs.forEach(input => input.removeAttribute('disabled'));

        saveBtn.style.display = 'inline-block';
        editBtn.style.display = 'none';
    });

   // ===== SAVE MODE =====
        saveBtn.addEventListener('click', () => {
            const data = {};
            
            // Select every text input in .form-content (nested included)
            const allInputs = document.querySelectorAll('.form-content input[type="text"]');

            allInputs.forEach(input => {
                data[input.name] = input.value;
                input.setAttribute('disabled', true); // Disable after saving
            });

            console.log("Data being sent:", data); // Check that document info is included

            fetch('Approval.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    alert('Changes saved successfully!');
                    saveBtn.style.display = 'none';
                    editBtn.style.display = 'inline-block';
                } else {
                    alert('Save failed: ' + result.message);
                }
            })
            .catch(error => {
                alert('Error saving data');
                console.error(error);
            });
        });
});
