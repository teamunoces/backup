async function load3YDP(id) {
    try {
        // Fetch main 3ydp record
        const resPrimary = await fetch(`get.php?id=${id}&table=3ydp`);
        const dataPrimary = await resPrimary.json();

       // Inside the if (!dataPrimary.error) block of get.js
        if (dataPrimary && !dataPrimary.error) {
            document.getElementById('title_of_project').value = dataPrimary.title_of_project || '';
            document.getElementById('description_of_project').value = dataPrimary.description_of_project || '';
            document.getElementById('general_objectives').value = dataPrimary.general_objectives || '';
            document.getElementById('program_justification').value = dataPrimary.program_justification || '';
            document.getElementById('beneficiaries').value = dataPrimary.beneficiaries || '';
            document.getElementById('program_plan_text').value = dataPrimary.program_plan_text || '';
            
            // Add this line to load the feedback
            // Note: Change 'feedback' to match the exact column name in your MySQL table
            document.getElementById('admincomment').value = dataPrimary.feedback || dataPrimary.admin_comment || '';
        }

        // Fetch all 3ydp_programs rows
        const resPrograms = await fetch(`get.php?id=${id}&table=3ydp_programs`);
        
        // Safety check for empty or malformed responses
        const textData = await resPrograms.text();
        if (!textData) {
            console.warn("No program data returned from server.");
            return;
        }
        
        const dataPrograms = JSON.parse(textData);

        if (Array.isArray(dataPrograms)) {
            const tbody = document.querySelector('#programPlanTable tbody');
            tbody.innerHTML = '';

            dataPrograms.forEach(prog => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><textarea rows="5">${prog.program || ''}</textarea></td>
                    <td><textarea rows="5">${prog.milestones || ''}</textarea></td>
                    <td><textarea rows="5">${prog.objectives || ''}</textarea></td>
                    <td><textarea rows="5">${prog.strategies || ''}</textarea></td>
                    <td><textarea rows="5">${prog.persons_agencies_involved || ''}</textarea></td>
                    <td><textarea rows="5">${prog.resources_needed || ''}</textarea></td>
                    <td><textarea rows="5">${prog.budget || ''}</textarea></td>
                    <td><textarea rows="5">${prog.time_frame || ''}</textarea></td>
                `;
                tbody.appendChild(row);
            });
        }

    } catch (err) {
        console.error('Error loading 3YDP data:', err);
    }
}

// Logic to determine which ID to load
const urlParams = new URLSearchParams(window.location.search);
const reportId = urlParams.get('id');

if (reportId) {
    load3YDP(reportId);
} else {
    // Fallback for testing if no ID in URL
    console.log("No ID in URL, attempting to load ID 5");
    load3YDP(5);
}