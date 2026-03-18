document.addEventListener('DOMContentLoaded', function () {

    // ------------------------------------------
    // 1. SMART CONTEXT GATHERING
    // ------------------------------------------
    function getFormContext() {
        const title = document.getElementById('title_of_project')?.value || "";

        const description = Array.from(document.querySelectorAll('textarea'))
            .find(t => t.placeholder?.toLowerCase().includes("describe"))?.value || "";
        const objectives = Array.from(document.querySelectorAll('textarea'))
            .find(t => t.placeholder?.toLowerCase().includes("goals"))?.value || "";
        const justification = Array.from(document.querySelectorAll('textarea'))
            .find(t => t.placeholder?.toLowerCase().includes("necessary"))?.value || "";

        return `${title} ${description} ${objectives} ${justification}`.trim();
    }

    // ------------------------------------------
    // 2. RECOMMENDATION LOGIC (DUAL-MODE)
    // ------------------------------------------
    const recommendationButton = document.querySelector('.recommendation-btn');
    const recommendationContainer = document.getElementById('recommendation-container'); 
    const recommendationList = document.getElementById('recommendation-list');
    const aiSearchInput = document.getElementById('ai-input');

    recommendationButton.addEventListener('click', async function () {
        const aiInputValue = aiSearchInput.value.trim();
        const finalQuery = aiInputValue || getFormContext();

        recommendationButton.innerHTML = "<span>⏳ AI is Analyzing...</span>";
        recommendationButton.disabled = true;

        try {
            const response = await fetch("http://127.0.0.1:5000/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: finalQuery })
            });

            const data = await response.json();
            recommendationList.innerHTML = "";

            data.recommendations.forEach((rec, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="rec-title"><strong>${index + 1}. ${rec.project.title_of_project || 'Untitled Project'}</strong></div>
                    <div class="rec-description">${rec.project.description_of_project || 'No description provided.'}</div>
                `;

                li.addEventListener('click', () => {
                    const tableBody = document.querySelector('tbody');
                    tableBody.innerHTML = "";

                    // Populate project form fields
                    document.getElementById('title_of_project').value = rec.project.title_of_project || "";
                    document.getElementById('description_of_project').value = rec.project.description_of_project || "";
                    document.getElementById('general_objectives').value = rec.project.general_objectives || "";
                    document.getElementById('program_justification').value = rec.project.program_justification || "";
                    document.getElementById('beneficiaries').value = rec.project.beneficiaries || "";
                    document.getElementById('program_plan').value = rec.project.program_plan || "";

                    // Populate program table
                    if (rec.program && Array.isArray(rec.program)) {
                        rec.program.forEach(p => {
                            const row = document.createElement('tr');
                            const rowData = [
                                p.program || "",
                                p.milestones || "",
                                p.objectives || "",
                                p.strategies || "",
                                p.persons_agencies_involved || "",
                                p.resources_needed || "",
                                // Ensure budget is safe even if non-numeric
                                isNaN(parseFloat(p.budget)) ? "" : parseFloat(p.budget),
                                p.time_frame || ""
                            ];

                            rowData.forEach((val, i) => {
                                const td = document.createElement('td');
                                const input = (i === 7 || i === 6) ? document.createElement('input') : document.createElement('textarea');
                                input.value = val;
                                td.appendChild(input);
                                row.appendChild(td);
                            });
                            tableBody.appendChild(row);
                        });
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });

                recommendationList.appendChild(li);
            });

            recommendationContainer.scrollIntoView({ behavior: 'smooth' });

        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Could not connect to the AI server. Is it running?");
        } finally {
            recommendationButton.innerHTML = "💡 Get AI-Generated Recommendations";
            recommendationButton.disabled = false;
        }
    });

    // ------------------------------------------
    // 3. AUTO-SAVE (Every 5 seconds)
    // ------------------------------------------
    setInterval(() => {
        const formData = {};
        document.querySelectorAll('input, textarea').forEach((el, i) => {
            formData[el.id || `field_${i}`] = el.value;
        });
        localStorage.setItem('3ydp_draft', JSON.stringify(formData));
    }, 5000);

    // ------------------------------------------
    // 4. ADD NEW ROW LOGIC
    // ------------------------------------------
    const tableBody = document.querySelector('tbody');

    function addTableRow() {
        const newRow = document.createElement('tr');

        for (let i = 0; i < 8; i++) {
            const td = document.createElement('td');
            const input = (i === 7 || i === 6) ? document.createElement('input') : document.createElement('textarea');
            input.placeholder = (i === 7) ? "e.g. 2024-2027" : "...";
            td.appendChild(input);
            newRow.appendChild(td);
        }

        tableBody.appendChild(newRow);
    }

    const addRowBtn = document.querySelector('#add-row-btn');
    if (addRowBtn) {
        addRowBtn.addEventListener('click', e => {
            e.preventDefault();
            addTableRow();
        });
    }

});