document.addEventListener("DOMContentLoaded", () => {
    const barangaySelect = document.getElementById("barangaySelect");
    const yearSelect = document.getElementById("yearSelect");
    
    // Set initial state - clear tables initially
    clearAllTables();

    // Check if both are selected before loading data
    function checkAndLoadData() {
        const selectedBarangay = barangaySelect.value;
        const selectedYear = yearSelect.value;
        
        // Only load data if both are selected and barangay is not 'select'
        if (selectedBarangay && selectedBarangay !== 'select' && selectedYear && selectedYear !== 'all') {
            loadBarangayData(selectedBarangay, selectedYear);
        } else {
            clearAllTables();
        }
    }

    // Reload data when barangay changes
    barangaySelect.addEventListener('change', function() {
        checkAndLoadData();
    });
    
    // Reload data when year changes
    yearSelect.addEventListener('change', function() {
        checkAndLoadData();
    });
});

function loadBarangayData(barangay, selectedYear) {
    // Show loading state
    showLoadingState();
    
    // Build URL with parameters
    let url = `./php/get.php?barangay=${encodeURIComponent(barangay)}`;
    
    // Only add year parameter if it's not 'all'
    if (selectedYear && selectedYear !== 'all') {
        url += `&year=${encodeURIComponent(selectedYear)}`;
    }
    
    console.log("Fetching URL:", url);
    
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Network response was not OK");
            return response.json();
        })
        .then(data => {
            console.log("Full response data:", data);
            
            if (data.error) {
                console.error("Server error:", data.error);
                showErrorMessage(data.error);
                return;
            }
            // ----------------- SUMMARY -----------------
            const totalPopulation = data.demographics?.[barangay]?.population ?? 0;
            const totalHousehold = data.demographics?.[barangay]?.households ?? 0;
            const totalRespondents = data.respondents?.[barangay] ?? 0;
            const responsePercent = totalPopulation ? ((totalRespondents / totalPopulation) * 100).toFixed(2) : "-";

            document.getElementById("totalPopulation").innerText = totalPopulation.toLocaleString();
            document.getElementById("totalHousehold").innerText = totalHousehold.toLocaleString();
            document.getElementById("totalRespondents").innerText = totalRespondents.toLocaleString();
            document.getElementById("responsePercent").innerText = responsePercent + "%";
            
            // Update barangay name display
            const barangaySelect = document.getElementById("barangaySelect");
            const selectedText = barangaySelect.options[barangaySelect.selectedIndex]?.text || barangay.toUpperCase();
            document.getElementById("barangayName").innerText = selectedText;

            // ----------------- RELIGION TABLE -----------------
            const religionTbody = document.getElementById("religionTable");
            religionTbody.innerHTML = "";
            if (data.religion && Array.isArray(data.religion) && data.religion.length > 0) {
                data.religion.forEach((r, index) => {
                    const percent = totalRespondents ? ((r.total / totalRespondents) * 100).toFixed(2) : "-";
                    religionTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(r.religion || "N/A")}</td>
                            <td>${r.total ?? 0}</td>
                            <td>${percent}%}%</td>
                             <td>${index + 1}</td>
                        </tr>
                    `;
                });
            } else {
                religionTbody.innerHTML = `<tr><td colspan="4">No religion data available</td></tr>`;
            }

            // ----------------- INCOME TABLE -----------------
            const incomeTbody = document.getElementById("incomeTable");
            if (incomeTbody) {
                incomeTbody.innerHTML = "";
                if (data.income && Array.isArray(data.income)) {
                    data.income.forEach((inc, index) => {
                        const percent = totalRespondents ? ((inc.total / totalRespondents) * 100).toFixed(2) : "-";
                        incomeTbody.innerHTML += `
                            <tr>
                                <td>${escapeHtml(inc.source || "N/A")}</td>
                                <td>${inc.total ?? 0}</td>
                                <td>${percent}%</td>
                                <td>${index + 1}</td>
                            </tr>
                        `;
                    });
                } else {
                    incomeTbody.innerHTML = `<tr><td colspan="4">No income data available</td></tr>`;
                }
            }

            // ----------------- MONTHLY INCOME TABLE -----------------
            const monthlyTbody = document.getElementById("monthlyIncomeTable");
            if (monthlyTbody && Array.isArray(data.monthlyIncome)) {
                monthlyTbody.innerHTML = "";
                data.monthlyIncome.forEach((item, index) => {
                    const percentValue = typeof item.percentage === 'number' ? item.percentage.toFixed(2) : item.percentage;
                    monthlyTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.label)}</td>
                            <td>${item.bana}</td>
                            <td>${item.asawa}</td>
                            <td>${item.total}</td>
                            <td>${percentValue}%</td>
                            <td>${index + 1}</td>
                        </tr>
                    `;
                });
            }

            // ----------------- EDUCATION TABLE -----------------
            const eduTbody = document.getElementById("educationTable");
            if (eduTbody && Array.isArray(data.education)) {
                eduTbody.innerHTML = "";
                data.education.forEach(item => {
                    eduTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.level)}</td>
                            <td>${item.total}</td>
                            <td>${item.percentage}%</td>
                            <td>${item.rank}</td>
                        </tr>
                    `;
                });
            }

            // ----------------- AGE TABLE -----------------
            const ageTbody = document.getElementById("ageTable");
            if (ageTbody && Array.isArray(data.age)) {
                ageTbody.innerHTML = "";
                // Sort by percentage descending and assign rank
                data.age.sort((a,b) => b.percentage - a.percentage)
                        .forEach((item, index) => {
                    ageTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.group)}</td>
                            <td>${item.total}</td>
                            <td>${item.percentage}%</td>
                            <td>${index + 1}</td>
                        </tr>
                    `;
                });
            }

            // ----------------- pwd -----------------
            const pwdTbody = document.getElementById("pwdTable");
            if (pwdTbody && Array.isArray(data.pwd)) {
                pwdTbody.innerHTML = "";
                data.pwd.forEach(item => {
                    pwdTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.pwd)}</td>
                            <td>${item.total}</td>
                            <td>${item.percentage}%</td>
                            <td>${item.rank}</td>
                        </tr>
                    `;
                });
            }

            // ----------------- HEALTH TABLE -----------------
            const concernTbody = document.getElementById("healthTable");
            if (concernTbody && Array.isArray(data.heal)) {
                concernTbody.innerHTML = "";
                data.heal.forEach(item => {
                    concernTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.heal)}</td>
                            <td>${item.total}</td>
                            <td>${item.wm}</td>
                            <td>${item.rank}</td>
                        </tr>
                    `;
                });
            }
            
            // ----------------- Toilet Type -----------------
            const toiletTbody = document.getElementById("toiletTable");
            if (toiletTbody && Array.isArray(data.toilet)) {
                toiletTbody.innerHTML = "";
                data.toilet.forEach(item => {
                    toiletTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.toilet)}</td>
                            <td>${item.total}</td>
                            <td>${item.percentage}%</td>
                            <td>${item.rank}</td>
                        </tr>
                    `;
                });
            }
            
            // ----------------- Waste Disposal -----------------
            const wasteTbody = document.getElementById("wasteTable");
            if (wasteTbody && Array.isArray(data.waste)) {
                wasteTbody.innerHTML = "";
                data.waste.forEach(item => {
                    wasteTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.waste)}</td>
                            <td>${item.total}</td>
                            <td>${item.percentage}%</td>
                            <td>${item.rank}</td>
                        </tr>
                    `;
                });
            }

            // ----------------- Main District Problem -----------------
            const urgentTbody = document.getElementById("urgentTable");
            if (urgentTbody && Array.isArray(data.problem)) {
                urgentTbody.innerHTML = "";
                data.problem.forEach(item => {
                    urgentTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.problem)}</td>
                            <td>${item.total}</td>
                            <td>${item.percentage}%</td>
                            <td>${item.rank}</td>
                        </tr>
                    `;
                });
            }

            // ----------------- Peace and order -----------------
            const peaceTbody = document.getElementById("peaceTable");
            if (peaceTbody && Array.isArray(data.peace)) {
                peaceTbody.innerHTML = "";
                data.peace.forEach(item => {
                    peaceTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.peace)}</td>
                            <td>${item.total}</td>
                            <td>${item.percentage}%</td>
                            <td>${item.rank}</td>
                        </tr>
                    `;
                });
            }

            // ----------------- Tanod Training -----------------
            const neccessityTrainingTbody = document.getElementById("neccessityTrainingTable");
            if (neccessityTrainingTbody && Array.isArray(data.necessity)) {
                neccessityTrainingTbody.innerHTML = "";
                data.necessity.forEach(item => {
                    neccessityTrainingTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.necessity)}</td>
                            <td>${item.total}</td>
                            <td>${item.percentage}%</td>
                            <td>${item.rank}</td>
                        </tr>
                    `;
                });
            }

            // ----------------- TRAINING TABLE -----------------
            const essentialTrainingbody = document.getElementById("essentialTrainingTable");
            if (essentialTrainingbody && Array.isArray(data.training_need)) {
                essentialTrainingbody.innerHTML = "";
                data.training_need.forEach(item => {
                    essentialTrainingbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.training)}</td>
                            <td>${item.responses ?? 0}</td>
                            <td>${item.average_rank ?? 0}</td>
                            <td>${item.rank ?? 0}</td>
                        </tr>
                    `;
                });
            }

            // ----------------- seminar TABLE -----------------
            const seminarbody = document.getElementById("seminarTable");
            if (seminarbody && Array.isArray(data.seminar_need)) {
                seminarbody.innerHTML = "";
                data.seminar_need.forEach(item => {
                    seminarbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.seminar)}</td>
                            <td>${item.responses ?? 0}</td>
                            <td>${item.average_rank ?? 0}</td>
                            <td>${item.rank ?? 0}</td>
                        </tr>
                    `;
                });
            }

            // ----------------- district table -----------------
            const trainingTbody = document.getElementById("trainingTable");
            if (trainingTbody && Array.isArray(data.dtr)) {
                trainingTbody.innerHTML = "";
                data.dtr.forEach(item => {
                    trainingTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.dtr)}</td>
                            <td>${item.total}</td>
                            <td>${item.percentage}%</td>
                            <td>${item.rank}</td>
                        </tr>
                    `;
                });
            }

            // ----------------- most desired religious activities -----------------
            const desireTbody = document.getElementById("mostDesiredTable");
            if (desireTbody && Array.isArray(data.religious_act)) {
                desireTbody.innerHTML = "";
                data.religious_act.forEach(item => {
                    desireTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.religious_act)}</td>
                            <td>${item.total}</td>
                            <td>${item.percentage}%</td>
                            <td>${item.rank}</td>
                        </tr>
                    `;
                });
            }

            // ----------------- spiritual life priorities -----------------
            const importantTbody = document.getElementById("spiritualLifeTable");
            if (importantTbody && Array.isArray(data.ira)) {
                importantTbody.innerHTML = "";
                data.ira.forEach(item => {
                    importantTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.ira)}</td>
                            <td>${item.total}</td>
                            <td>${item.percentage}%</td>
                            <td>${item.rank}</td>
                        </tr>
                    `;
                });
            }

            // ----------------- deepening spirituality -----------------
            const deepTbody = document.getElementById("deepeningSpiritualityTable");
            if (deepTbody && Array.isArray(data.growth)) {
                deepTbody.innerHTML = "";
                data.growth.forEach(item => {
                    deepTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.growth)}</td>
                            <td>${item.total}</td>
                            <td>${item.percentage}%</td>
                            <td>${item.rank}</td>
                        </tr>
                    `;
                });
            }

            // ----------------- participation frequency -----------------
            const participationTbody = document.getElementById("participationTable");
            if (participationTbody && Array.isArray(data.freq)) {
                participationTbody.innerHTML = "";
                data.freq.forEach(item => {
                    participationTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.freq)}</td>
                            <td>${item.total}</td>
                            <td>${item.percentage}%</td>
                            <td>${item.rank}</td>
                        </tr>
                    `;
                });
            }

            // ----------------- other barangay needs -----------------
            const barangayNeedsTbody = document.getElementById("otherBarangayNeedsTable");
            if (barangayNeedsTbody && Array.isArray(data.helps)) {
                barangayNeedsTbody.innerHTML = "";
                data.helps.forEach(item => {
                    barangayNeedsTbody.innerHTML += `
                        <tr>
                            <td>${escapeHtml(item.helps)}</td>
                            <td>${item.total}</td>
                            <td>${item.percentage}%</td>
                            <td>${item.rank}</td>
                        </tr>
                    `;
                });
            }
        })
        .catch(error => {
            console.error("Error loading data:", error);
            showErrorMessage("Failed to load data: " + error.message);
        });
}

// [Keep all your existing helper functions]
function showLoadingState() {
    const tables = ["religionTable","incomeTable","monthlyIncomeTable","educationTable","ageTable","pwdTable","healthTable","toiletTable","wasteTable","urgentTable","peaceTable","neccessityTrainingTable","essentialTrainingTable","seminarTable","trainingTable","mostDesiredTable","spiritualLifeTable","deepeningSpiritualityTable","participationTable","otherBarangayNeedsTable"];
    tables.forEach(id => {
        const tbody = document.getElementById(id);
        if(tbody) tbody.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;
    });
}

function showErrorMessage(message) {
    const tables = ["religionTable","incomeTable","monthlyIncomeTable","educationTable","ageTable","pwdTable","healthTable","toiletTable","wasteTable","urgentTable","peaceTable","neccessityTrainingTable","essentialTrainingTable","seminarTable","trainingTable","mostDesiredTable","spiritualLifeTable","deepeningSpiritualityTable","participationTable","otherBarangayNeedsTable"];
    tables.forEach(id => {
        const tbody = document.getElementById(id);
        if(tbody) tbody.innerHTML = `<tr><td colspan="5">Error: ${escapeHtml(message)}</td></tr>`;
    });
}

function clearAllTables() {
    const tables = ["religionTable","incomeTable","monthlyIncomeTable","educationTable","ageTable","pwdTable","healthTable","toiletTable","wasteTable","urgentTable","peaceTable","neccessityTrainingTable","essentialTrainingTable","seminarTable","trainingTable","mostDesiredTable","spiritualLifeTable","deepeningSpiritualityTable","participationTable","otherBarangayNeedsTable"];
    tables.forEach(id => {
        const tbody = document.getElementById(id);
        if(tbody) tbody.innerHTML = `<tr><td colspan="5">Please select a barangay</td></tr>`;
    });
    
    // Clear summary
    document.getElementById("totalPopulation").innerText = "-";
    document.getElementById("totalHousehold").innerText = "-";
    document.getElementById("totalRespondents").innerText = "-";
    document.getElementById("responsePercent").innerText = "-";
    document.getElementById("barangayName").innerText = "-";
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}