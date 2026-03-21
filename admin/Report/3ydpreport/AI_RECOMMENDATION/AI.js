document.addEventListener('DOMContentLoaded', function () {
    
    // ------------------------------------------
    // 1. SMART CONTEXT GATHERING
    // ------------------------------------------
    function getFormContext() {
        const title = document.getElementById('title_of_project')?.value || "";
        const description = document.getElementById('description_of_project')?.value || "";
        const objectives = document.getElementById('general_objectives')?.value || "";
        const justification = document.getElementById('program_justification')?.value || "";
        const beneficiaries = document.getElementById('beneficiaries')?.value || "";
        
        return `${title} ${description} ${objectives} ${justification} ${beneficiaries}`.trim();
    }
    
    // ------------------------------------------
    // 2. RECOMMENDATION LOGIC
    // ------------------------------------------
    const recommendationButton = document.querySelector('.recommendation-btn');
    const recommendationContainer = document.getElementById('recommendation-container'); 
    const recommendationList = document.getElementById('recommendation-list');
    const aiSearchInput = document.getElementById('ai-input');
    
        recommendationButton.addEventListener('click', async function () {
            const aiInputValue = aiSearchInput.value.trim();
            const formContext = getFormContext();
            
            // 1. Prioritize Search Bar, then Form Fields, then a Default Keyword
            const finalQuery = aiInputValue || formContext || "general recommendations"; 

            // Remove the 'if (!finalQuery)' alert block entirely or change it to:
            // if (!finalQuery) { ... } is no longer needed because finalQuery will always have a value.

            recommendationButton.innerHTML = "<span>⏳ AI is Analyzing...</span>";
            recommendationButton.disabled = true;
            
            try {
                const response = await fetch("http://127.0.0.1:5000/recommend", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    // Sending the query (which is now never empty)
                    body: JSON.stringify({ text: finalQuery, user_id: "default" })
                });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            recommendationList.innerHTML = "";
            
            if (!data.recommendations || data.recommendations.length === 0) {
                recommendationList.innerHTML = "<li>No recommendations found. Try a different search query.</li>";
                return;
            }
            
            data.recommendations.forEach((rec, index) => {
                const li = document.createElement('li');
                li.className = 'recommendation-item';
                li.innerHTML = `
                    <div class="rec-title"><strong>${index + 1}. ${rec.project.title_of_project || 'Untitled Project'}</strong></div>
                    <div class="rec-description">${rec.project.description_of_project || 'No description provided.'}</div>
                    <small class="rec-hint">Click to apply this recommendation</small>
                `;
                
                li.addEventListener('click', () => {
                    // Populate project form fields
                    document.getElementById('title_of_project').value = rec.project.title_of_project || "";
                    document.getElementById('description_of_project').value = rec.project.description_of_project || "";
                    document.getElementById('general_objectives').value = rec.project.general_objectives || "";
                    document.getElementById('program_justification').value = rec.project.program_justification || "";
                    document.getElementById('beneficiaries').value = rec.project.beneficiaries || "";
                    document.getElementById('program_plan').value = rec.project.program_plan || "";
                    
                    // Populate program table
                    const tableBody = document.querySelector('#programPlanTable tbody');
                    tableBody.innerHTML = ""; // Clear existing rows
                    
                    if (rec.program && Array.isArray(rec.program) && rec.program.length > 0) {
                        rec.program.forEach(p => {
                            const row = document.createElement('tr');
                            const rowData = [
                                p.program || "",
                                p.objectives || "",
                                p.strategies || "",
                                p.persons_agencies_involved || "",
                                p.resources_needed || "",
                                p.budget !== undefined && p.budget !== null && !isNaN(parseFloat(p.budget)) ? parseFloat(p.budget) : "",
                                p.means_of_verification || "",
                                p.time_frame || ""
                            ];
                            
                            // Inside your rec.program.forEach loop
                               // Inside your rec.program.forEach loop...
                             // In the recommendation application section
                                rowData.forEach((val, i) => {
                                    const td = document.createElement('td');
                                    // Use textarea for ALL fields for consistency
                                    const input = document.createElement('textarea');
                                    
                                    input.value = val;
                                    input.classList.add('table-input');
                                    input.readOnly = false;
                                    
                                    // Set rows attribute for better appearance
                                    input.rows = 2;
                                    
                                    td.appendChild(input);
                                    row.appendChild(td);
                                });
                            tableBody.appendChild(row);
                        });
                    } else {
                        // Add at least one empty row
                        const emptyRow = document.createElement('tr');
                        for (let i = 0; i < 8; i++) {
                            const td = document.createElement('td');
                            const input = (i === 5 || i === 7) ? document.createElement('input') : document.createElement('textarea');
                            input.value = "";
                            td.appendChild(input);
                            emptyRow.appendChild(td);
                        }
                        tableBody.appendChild(emptyRow);
                    }
                    
                    window.scrollTo({ top: 0, behavior: 'smooth' });

                });
                
                recommendationList.appendChild(li);
            });
            
            recommendationContainer.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Could not connect to the AI server. Make sure it's running on port 5000.");
        } finally {
            recommendationButton.innerHTML = "💡 Get AI-Generated Recommendations";
            recommendationButton.disabled = false;
        }
    });
    
    // ------------------------------------------
    // 3. ADD NEW ROW LOGIC
    // ------------------------------------------
    const addRowBtn = document.querySelector('.add-row-btn');
    const tableBody = document.querySelector('#programPlanTable tbody');
    
        // Add new row logic
        if (addRowBtn) {
            addRowBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const newRow = document.createElement('tr');
                
                for (let i = 0; i < 8; i++) {
                    const td = document.createElement('td');
                    // Use textarea for ALL fields
                    const input = document.createElement('textarea');
                    input.rows = 2;
                    
                    if (i === 7) input.placeholder = "...";
                    if (i === 5) input.placeholder = "...";
                    else input.placeholder = "...";
                    
                    input.classList.add('table-input');
                    td.appendChild(input);
                    newRow.appendChild(td);
                }
                
                tableBody.appendChild(newRow);
            });
        }
    
    // Delete row button handler
    const deleteRowBtn = document.querySelector('.delete-row-btn');
    if (deleteRowBtn) {
        deleteRowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (tableBody.rows.length > 1) {
                tableBody.deleteRow(tableBody.rows.length - 1);
            } else {
                alert("At least one row must remain.");
            }
        });
    }
    
    // ------------------------------------------
    // 4. AUTO-SAVE (Every 30 seconds)
    // ------------------------------------------
    setInterval(() => {
        const formData = {};
        document.querySelectorAll('#programPlanTable textarea, #programPlanTable input').forEach((el, i) => {
            formData[`table_field_${i}`] = el.value;
        });
        
        const formFields = [
            'title_of_project', 'description_of_project', 'general_objectives',
            'program_justification', 'beneficiaries', 'program_plan'
        ];
        
        formFields.forEach(field => {
            const el = document.getElementById(field);
            if (el) formData[field] = el.value;
        });
        
        localStorage.setItem('3ydp_draft', JSON.stringify(formData));
        console.log("Draft saved");
    }, 30000);
    
    // Load draft on page load
    const savedDraft = localStorage.getItem('3ydp_draft');
    if (savedDraft) {
        const formData = JSON.parse(savedDraft);
        
        // Restore form fields
        Object.keys(formData).forEach(key => {
            if (key.startsWith('table_field_')) return;
            const el = document.getElementById(key);
            if (el) el.value = formData[key];
        });
    }
});