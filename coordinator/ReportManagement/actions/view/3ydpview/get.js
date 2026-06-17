const isDebug = new URLSearchParams(window.location.search).has("debug");

const debugLog = (...args) => {
    if (isDebug) console.log(...args);
};

const debugWarn = (...args) => {
    if (isDebug) console.warn(...args);
};

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
        const data = await response.json();

        debugLog("Loaded report:", data);

        if (data.error) {
            alert("Error: " + data.error);
            return;
        }

        const project = data.project || {};
        const programs = data.programs || [];

        displayFeedback(project.feedback);

        setValue("title_of_project", project.title_of_project);
        setValue("description_of_project", project.description_of_project);
        setValue("general_objectives", project.general_objectives);
        setValue("program_justification", project.program_justification);
        setValue("beneficiaries", project.beneficiaries);
        setValue("program_plan_text", project.program_plan_text);

        // FIX: Display approval names from database
        setText("created_by_name", project.created_by_name);
        setText("dean", project.dean);

        // Optional: display these too if they exist in 3ydp table
        setText("ces_head", formatNameWithSuffix(project.ces_head, project.ces_head_suffix));
        setText("vp_acad", formatNameWithSuffix(project.vp_acad, project.vp_acad_suffix));
        setText("vp_admin", formatNameWithSuffix(project.vp_admin, project.vp_admin_suffix));
        setText("school_president", formatNameWithSuffix(project.school_president, project.school_president_suffix));

        // Optional document info fields
        setInputByName("issue_status", project.issue_status);
        setInputByName("revision_number", project.revision_number);
        setInputByName("date_effective", project.date_effective);
        setInputByName("approved_by", project.approved_by);

        const tableBody = document.querySelector("#programPlanTable tbody");
        if (!tableBody) return;

        tableBody.innerHTML = "";

        if (programs.length === 0) {
            addEmptyProgramRow(tableBody);
        } else {
            programs.forEach(program => {
                addProgramRow(tableBody, program);
            });
        }

    } catch (error) {
        debugWarn("Error loading report:", error);
        alert("Error loading report: " + error.message);
    }
}

function setValue(id, value) {
    const element = document.getElementById(id);
    if (!element) return;

    element.value = value || "";
    autoExpand(element);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (!element) return;

    element.textContent = value || "";
    element.style.textAlign = "left";
}

function formatNameWithSuffix(name, suffix) {
    const cleanName = String(name || "").trim();
    const cleanSuffix = String(suffix || "").trim();

    if (!cleanName) return cleanSuffix;
    if (!cleanSuffix) return cleanName;

    return `${cleanName}, ${cleanSuffix}`;
}

function setInputByName(name, value) {
    const element = document.querySelector(`[name="${name}"]`);
    if (!element) return;

    element.value = value || "";
}

function displayFeedback(feedback) {
    const adminComment = document.getElementById("admincomment");
    if (!adminComment) return;

    adminComment.value = feedback || "";
    autoExpand(adminComment);
    adminComment.readOnly = true;
    adminComment.classList.add("feedback-display");
}

function autoExpand(element) {
    if (!element) return;

    element.style.height = "auto";
    element.style.height = element.scrollHeight + "px";
}

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

function escapeHtml(text) {
    if (!text) return "";

    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", loadReport);
