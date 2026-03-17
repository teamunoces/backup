document.addEventListener("DOMContentLoaded", () => {
    const barangaySelect = document.getElementById("barangaySelect");
    loadBarangayData(barangaySelect.value);

    // Reload data whenever the user picks a different barangay
    barangaySelect.addEventListener('change', function() {
        loadBarangayData(this.value);
    });
});

function loadBarangayData(barangay) {
    fetch(`./php/get.php?barangay=${barangay}`) // pass barangay to PHP
        .then(response => {
            if (!response.ok) throw new Error("Network response was not OK");
            return response.json();
        })
        .then(data => {

            console.log("Database Data:", data);

            // ----------------- SUMMARY -----------------
            const totalPopulation = data.demographics?.[barangay]?.population ?? 0;
            const totalHousehold = data.demographics?.[barangay]?.households ?? 0;
            const totalRespondents = data.respondents?.[barangay] ?? 0;
            const responsePercent = totalPopulation ? ((totalRespondents / totalPopulation) * 100).toFixed(2) : "-";

            document.getElementById("totalPopulation").innerText = totalPopulation;
            document.getElementById("totalHousehold").innerText = totalHousehold;
            document.getElementById("totalRespondents").innerText = totalRespondents;
            document.getElementById("responsePercent").innerText = responsePercent + "%";

            // ----------------- RELIGION TABLE -----------------
            const religionTbody = document.getElementById("religionTable");
            religionTbody.innerHTML = "";
            if (data.religion && Array.isArray(data.religion) && data.religion.length > 0) {
                data.religion.forEach((r, index) => {
                    const percent = totalRespondents ? ((r.total / totalRespondents) * 100).toFixed(2) : "-";
                    religionTbody.innerHTML += `
                        <tr>
                            <td>${r.religion || "N/A"}</td>
                            <td>${r.total ?? 0}</td>
                            <td>${percent}%</td>
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
                                <td>${inc.source || "N/A"}</td>
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
                    monthlyTbody.innerHTML += `
                        <tr>
                            <td>${item.label}</td>
                            <td>${item.bana}</td>
                            <td>${item.asawa}</td>
                            <td>${item.total}</td>
                            <td>${item.percentage}%</td>
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
                            <td>${item.level}</td>
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
                            <td>${item.group}</td>
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
                            <td>${item.pwd}</td>
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
                            <td>${item.heal}</td>
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
                            <td>${item.toilet}</td>
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
                            <td>${item.waste}</td>
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
                            <td>${item.problem}</td>
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
                            <td>${item.peace}</td>
                            <td>${item.total}</td>
                            <td>${item.percentage}%</td>
                            <td>${item.rank}</td>
                        </tr>
                    `;
                });
            }

            // -----------------  Tanod Training -----------------
            const neccessityTrainingTbody = document.getElementById("neccessityTrainingTable");
            if (neccessityTrainingTbody && Array.isArray(data.necessity)) {
                neccessityTrainingTbody.innerHTML = "";
                data.necessity.forEach(item => {
                    neccessityTrainingTbody.innerHTML += `
                        <tr>
                            <td>${item.necessity}</td>
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
                                <td>${item.training}</td>
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
                                <td>${item.seminar}</td>
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
                                    <td>${item.dtr}</td>
                                    <td>${item.total}</td>
                                    <td>${item.percentage}%</td>
                                    <td>${item.rank}</td>
                                </tr>
                            `;
                        });
                    }

                      // ----------------- district table -----------------
                    const desireTbody = document.getElementById("mostDesiredTable");
                    if (desireTbody && Array.isArray(data.religious_act)) {
                        desireTbody.innerHTML = "";
                        data.religious_act.forEach(item => {
                            desireTbody.innerHTML += `
                                <tr>
                                    <td>${item.religious_act}</td>
                                    <td>${item.total}</td>
                                    <td>${item.percentage}%</td>
                                    <td>${item.rank}</td>
                                </tr>
                            `;
                        });
                    }

                    // ----------------- important religious activity table -----------------
                    const importantTbody = document.getElementById("spiritualLifeTable");
                    if (importantTbody && Array.isArray(data.ira)) {
                        importantTbody.innerHTML = "";
                        data.ira.forEach(item => {
                            importantTbody.innerHTML += `
                                <tr>
                                    <td>${item.ira}</td>
                                    <td>${item.total}</td>
                                    <td>${item.percentage}%</td>
                                    <td>${item.rank}</td>
                                </tr>
                            `;
                        });
                    }

                     // ----------------- important religious activity table -----------------
                    const deepTbody = document.getElementById("deepeningSpiritualityTable");
                    if (deepTbody && Array.isArray(data.growth)) {
                        deepTbody.innerHTML = "";
                        data.growth.forEach(item => {
                            deepTbody.innerHTML += `
                                <tr>
                                    <td>${item.growth}</td>
                                    <td>${item.total}</td>
                                    <td>${item.percentage}%</td>
                                    <td>${item.rank}</td>
                                </tr>
                            `;
                        });
                    }
                    
                     // ----------------- important religious activity table -----------------
                    const participationTbody = document.getElementById("participationTable");
                    if (participationTbody && Array.isArray(data.freq)) {
                        participationTbody.innerHTML = "";
                        data.freq.forEach(item => {
                            participationTbody.innerHTML += `
                                <tr>
                                    <td>${item.freq}</td>
                                    <td>${item.total}</td>
                                    <td>${item.percentage}%</td>
                                    <td>${item.rank}</td>
                                </tr>
                            `;
                        });
                    }


                       // ----------------- important religious activity table -----------------
                    const barangayNeedsTbody = document.getElementById("otherBarangayNeedsTable");
                    if (barangayNeedsTbody && Array.isArray(data.helps)) {
                        barangayNeedsTbody.innerHTML = "";
                        data.helps.forEach(item => {
                            barangayNeedsTbody.innerHTML += `
                                <tr>
                                    <td>${item.helps}</td>
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
            const tables = ["religionTable","incomeTable","monthlyIncomeTable","educationTable","ageTable","pwdTable","healthTable","toiletTable"];
            tables.forEach(id => {
                const tbody = document.getElementById(id);
                if(tbody) tbody.innerHTML = `<tr><td colspan="5">Error loading data</td></tr>`;
            });
        });
}