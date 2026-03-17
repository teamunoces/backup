(() => {
    // --- Get URL parameters properly ---

    const table = document.getElementById("programPlanTable");
    const addRowBtn = document.querySelector(".add-row-btn");
    const submitBtn = document.querySelector(".btn-submit");

    if(reportType === "3-year Development Plan"){
    console.log("This is the 3YDP report");
    }
    // --- Add new row dynamically ---
    addRowBtn.addEventListener("click", () => {
        const newRow = table.tBodies[0].rows[0].cloneNode(true);
        // Clear all input/textarea values
        newRow.querySelectorAll("textarea, input").forEach(cell => cell.value = "");
        table.tBodies[0].appendChild(newRow);
    });

    // --- Submit form ---
    submitBtn.addEventListener("click", function(e) {
        e.preventDefault();

        const data = {
            title_of_project: document.getElementById("title_of_project").value,
            description_of_project: document.getElementById("description_of_project").value,
            general_objectives: document.getElementById("general_objectives").value,
            program_justification: document.getElementById("program_justification").value,
            beneficiaries: document.getElementById("beneficiaries").value,
            program_plan_text: document.getElementById("program_plan").value,
            report_type: reportType,          // send the report type too
            programPlanTable: []
        };
        const rows = table.querySelectorAll("tbody tr");
        data.programPlanTable = Array.from(rows)
            .map(row => {
                const cells = row.querySelectorAll("textarea, input");
                return {
                    program: cells[0].value,
                    objectives: cells[1].value,
                    milestones: cells[2].value,
                    strategies: cells[3].value,
                    persons_agencies_involved: cells[4].value,
                    resources_needed: cells[5].value,
                    budget: cells[6].value,
                    time_frame: cells[7].value
                };
            })
            .filter(row => row.program.trim() !== ""); // remove empty rows

        // --- Send data via POST to PHP ---
        fetch("./php/post.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(response => {
            if (response.success) {
                alert(`✅ ${response.message}`);

                // Reset form
                document.querySelector("form").reset();

                // Keep only the first row and clear its values
                const tbody = table.tBodies[0];
                while (tbody.rows.length > 1) tbody.deleteRow(1);
                tbody.rows[0].querySelectorAll("textarea, input").forEach(cell => cell.value = "");

            } else {
                alert(`❌ Error: ${response.message}`);
            }
        })
        .catch(err => console.error("Fetch error:", err));
    });
})();


document.addEventListener("DOMContentLoaded", function() {
    const clearBtn = document.querySelector(".btn-clear");

    clearBtn.addEventListener("click", function() {
        // Clear all main textareas in the form
        document.querySelectorAll("form textarea").forEach(textarea => {
            textarea.value = "";
        });

        // Optional: reset table rows to a single empty row
        const tableBody = document.querySelector("#programPlanTable tbody");
        tableBody.innerHTML = `
            <tr>
                <td><textarea placeholder="..."></textarea></td>
                <td><textarea placeholder="..."></textarea></td>
                <td><textarea placeholder="..."></textarea></td>
                <td><textarea placeholder="..."></textarea></td>
                <td><textarea placeholder="..."></textarea></td>
                <td><textarea placeholder="..."></textarea></td>
                <td><textarea placeholder="..."></textarea></td>
                <td><textarea placeholder="..."></textarea></td>
            </tr>
        `;
    });
});
// Select all textareas in your table
const textareas = document.querySelectorAll('table td textarea');

textareas.forEach(textarea => {
    textarea.addEventListener('input', function() {
        // Reset height to shrink if text is deleted
        this.style.height = 'auto';
        
        // Set height based on scrollHeight (the actual content size)
        this.style.height = (this.scrollHeight) + 'px';
    });
});
