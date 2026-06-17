async function loadReport() {
    const params = new URLSearchParams(window.location.search);
    let reportId = params.get("id");

    if (!reportId) {
        const hiddenInput = document.getElementById('currentReportId');
        if (hiddenInput && hiddenInput.value) {
            reportId = hiddenInput.value;
        }
    }

    if (!reportId) {
        alert("No report ID found");
        return;
    }

    try {
        const response = await fetch(`/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/monthlyreport/get.php?id=${reportId}`);
        const data = await response.json();

        console.log("Fetched data:", data);

        if (data.success && data.main) {

            // ===== Fill top fields =====
            document.getElementById('department').value = data.main.department || '';
            document.getElementById('month').value = data.main.month || '';
            document.getElementById('title_act').value = data.main.title_act || '';
            document.getElementById('location').value = data.main.location || '';
            document.getElementById('benefeciaries').value = data.main.benefeciaries || '';
            document.getElementById('date_submitted').value = data.main.date_submitted || '';


            // ===== Populate Table =====
            const tableBody = document.querySelector('.main-table tbody');
            tableBody.innerHTML = '';

            data.details.forEach(row => {
                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td>${row.date_of_act || ''}</td>
                    <td>${row.activities_conducted || ''}</td>
                    <td>${row.objectives || ''}</td>
                    <td>${row.act_status || ''}</td>
                    <td>${row.issues_or_concerns || ''}</td>
                    <td>${row.financial_report || ''}</td>
                    <td>${row.recommendations || ''}</td>
                    <td>${row.plans_for_next_months || ''}</td>
                `;

                tableBody.appendChild(tr);
            });

        } else {
            console.warn("No data returned for this report ID.");
        }

    } catch (error) {
        console.error("Error loading data:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadReport);
