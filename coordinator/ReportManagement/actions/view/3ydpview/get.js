async function loadReport() {

    // Try URL first
    const params = new URLSearchParams(window.location.search);
    let reportId = params.get("id");

    // Fallback to hidden input if URL doesn't have ?id=
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
        const response = await fetch(`./get.php?id=${reportId}`);
        const data = await response.json();

        console.log("Loaded report:", data);

        const project = data.project;
        const programs = data.programs;

        /* Fill top form fields */
        document.getElementById("title_of_project").value = project.title_of_project || "";
        document.getElementById("description_of_project").value = project.description_of_project || "";
        document.getElementById("general_objectives").value = project.general_objectives || "";
        document.getElementById("program_justification").value = project.program_justification || "";
        document.getElementById("beneficiaries").value = project.beneficiaries || "";
        document.getElementById("program_plan_text").value = project.program_plan_text || "";

        /* Fill program table */
        const tableBody = document.querySelector("#programPlanTable tbody");
        if (!tableBody) return;
        tableBody.innerHTML = "";

        if (!programs || programs.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center">No program data found</td>
                </tr>
            `;
            return;
        }

        programs.forEach(p => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><textarea rows="5">${p.program || ""}</textarea></td>
                <td><textarea rows="5">${p.objectives || ""}</textarea></td>
                <td><textarea rows="5">${p.strategies || ""}</textarea></td>
                <td><textarea rows="5">${p.persons_agencies_involved || ""}</textarea></td>
                <td><textarea rows="5">${p.resources_needed || ""}</textarea></td>
                <td><textarea rows="5">${p.budget || ""}</textarea></td>
                <td><textarea rows="5">${p.means_of_verification || ""}</textarea></td>
                <td><textarea rows="5">${p.time_frame || ""}</textarea></td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error loading report:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadReport);