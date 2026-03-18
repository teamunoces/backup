document.addEventListener("DOMContentLoaded", () => {
    const submitBtn = document.querySelector(".submit-button");
    const addRowBtn = document.querySelector(".add-row-btn");
    const deleteRowBtn = document.querySelector(".delete-row-btn");
    const tableBody = document.querySelector(".program-table tbody");

    // ===== Add Row Function =====
    addRowBtn.addEventListener("click", () => {
        const newRow = document.createElement("tr");
        // Create 11 editable cells
        for (let i = 0; i < 11; i++) {
            const td = document.createElement("td");
            td.contentEditable = "true";
            newRow.appendChild(td);
        }
        tableBody.appendChild(newRow);
    });
           // ===== Delete Row Function =====
    deleteRowBtn.addEventListener("click", () => {
        const rows = tableBody.querySelectorAll("tr");

        if (rows.length > 1) {
            tableBody.removeChild(rows[rows.length - 1]); // remove last row
        } else {
            alert("No rows to delete.");
        }
    });

    // ===== Submit Form via AJAX =====
    submitBtn.addEventListener("click", (e) => {
        e.preventDefault();

        const formData = new FormData();

        // 1. Collect Main Fields from the top of the page
        formData.append('type', typeof reportType !== 'undefined' ? reportType : 'Program Design');
        formData.append('department', document.getElementById("department").value);
        formData.append('title_of_activity', document.getElementById("title_of_activity").value);
        formData.append('participants', document.getElementById("participants").value);
        formData.append('location', document.getElementById("location").value);
        formData.append('feedback', '');
        formData.append('status', 'pending');

        // 2. Collect Table Data
        tableBody.querySelectorAll("tr").forEach((row) => {
            const cells = row.querySelectorAll("td");
            if (cells.length === 11) {
                formData.append(`program[]`, cells[0].innerText.trim());
                formData.append(`milestones[]`, cells[1].innerText.trim());
                formData.append(`duration[]`, cells[2].innerText.trim());
                formData.append(`objectives[]`, cells[3].innerText.trim());
                formData.append(`persons_involved[]`, cells[4].innerText.trim());
                formData.append(`school_resources[]`, cells[5].innerText.trim());
                formData.append(`community_resources[]`, cells[6].innerText.trim());
                formData.append(`collaborating_agencies[]`, cells[7].innerText.trim());
                formData.append(`budget[]`, cells[8].innerText.trim());
                formData.append(`means_of_verification[]`, cells[9].innerText.trim());
                formData.append(`remarks[]`, cells[10].innerText.trim());
            }
        });

        // 3. Send to PHP
        fetch("post.php", {
            method: "POST",
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            if(data.toLowerCase().includes("successfully")) {
                location.reload(); // Clear form on success
            }
        })
        .catch(err => {
            console.error(err);
            alert("Error submitting report.");
        });
    });
});