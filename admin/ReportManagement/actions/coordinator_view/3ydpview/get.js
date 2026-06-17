async function loadReport() {
    const params = new URLSearchParams(window.location.search);
    let reportId = params.get("id");

    if (!reportId) {
        const hiddenInput = document.getElementById("currentReportId");
        if (hiddenInput && hiddenInput.value) {
            reportId = hiddenInput.value;
        }
    }

    if (!reportId) {
        alert("No report ID found");
        return;
    }

    try {
        const response = await fetch(`./get.php?id=${encodeURIComponent(reportId)}`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        console.log("Loaded report:", data);

        if (data.error) {
            alert("Error: " + data.error);
            return;
        }

        const project = data.project || {};
        const programs = data.programs || [];

        console.log("created_by_name from DB:", project.created_by_name);
        console.log("dean from DB:", project.dean);

        /* Admin feedback/comment */
        displayFeedback(project.feedback || "");

        /* Approval names - DATABASE ONLY */
        setTextContent("created_by_name", project.created_by_name || "");
        setTextContent("dean", project.dean || "");

        /* Top form fields */
        setTextareaValue("title_of_project", project.title_of_project || "");
        setTextareaValue("description_of_project", project.description_of_project || "");
        setTextareaValue("general_objectives", project.general_objectives || "");
        setTextareaValue("program_justification", project.program_justification || "");
        setTextareaValue("beneficiaries", project.beneficiaries || "");
        setTextareaValue("program_plan_text", project.program_plan_text || "");

        /* Document information */
        setInputValueByName("issue_status", project.issue_status || "");
        setInputValueByName("revision_number", project.revision_number || "");
        setInputValueByName("date_effective", project.date_effective || "");
        setInputValueByName("approved_by", project.approved_by || "");

        /* Program table */
        const tableBody = document.querySelector("#programPlanTable tbody");

        if (!tableBody) {
            console.warn("Program table body not found.");
            return;
        }

        tableBody.innerHTML = "";

        if (!programs.length) {
            addEmptyProgramRow(tableBody);
        } else {
            programs.forEach(program => {
                addProgramRow(tableBody, program);
            });
        }

    } catch (error) {
        console.error("Error loading report:", error);
        alert("Error loading report: " + error.message);
    }
}

/* =========================
   DISPLAY HELPERS
========================= */

function setTextContent(id, value) {
    const element = document.getElementById(id);

    if (!element) {
        console.warn(`Element with id "${id}" not found.`);
        return;
    }

    element.textContent = value || "";
}

function setTextareaValue(id, value) {
    const element = document.getElementById(id);

    if (!element) {
        console.warn(`Textarea with id "${id}" not found.`);
        return;
    }

    element.value = value || "";
    autoExpand(element);
}

function setInputValueByName(name, value) {
    const element = document.querySelector(`[name="${name}"]`);

    if (!element) {
        console.warn(`Input with name "${name}" not found.`);
        return;
    }

    element.value = value || "";
}

/* =========================
   ADMIN FEEDBACK
========================= */

function displayFeedback(feedback) {
    const adminComment = document.getElementById("admincomment");

    if (!adminComment) return;

    adminComment.value = feedback || "";
    autoExpand(adminComment);
    adminComment.readOnly = true;
    adminComment.classList.add("feedback-display");
}

/* =========================
   AUTO EXPAND TEXTAREA
========================= */

function autoExpand(element) {
    if (!element) return;

    element.style.height = "auto";
    element.style.height = element.scrollHeight + "px";
}

/* =========================
   PROGRAM TABLE
========================= */

function addProgramRow(tableBody, programData = {}) {
    const row = document.createElement("tr");

    row.innerHTML = `
        <td><textarea class="program-field" rows="5">${escapeHtml(programData.program || "")}</textarea></td>
        <td><textarea class="objectives-field" rows="5">${escapeHtml(programData.objectives || "")}</textarea></td>
        <td><textarea class="strategies-field" rows="5">${escapeHtml(programData.strategies || "")}</textarea></td>
        <td><textarea class="persons-field" rows="5">${escapeHtml(programData.persons_agencies_involved || "")}</textarea></td>
        <td><textarea class="resources-field" rows="5">${escapeHtml(programData.resources_needed || "")}</textarea></td>
        <td><textarea class="budget-field" rows="5">${escapeHtml(programData.budget || "")}</textarea></td>
        <td><textarea class="means-field" rows="5">${escapeHtml(programData.means_of_verification || "")}</textarea></td>
        <td><textarea class="timeframe-field" rows="5">${escapeHtml(programData.time_frame || "")}</textarea></td>
    `;

    tableBody.appendChild(row);

    row.querySelectorAll("textarea").forEach(textarea => {
        autoExpand(textarea);

        textarea.addEventListener("input", function () {
            autoExpand(this);
        });
    });
}

function addEmptyProgramRow(tableBody) {
    addProgramRow(tableBody, {});
}

/* =========================
   SECURITY: ESCAPE HTML
========================= */

function escapeHtml(text) {
    if (!text) return "";

    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", loadReport);