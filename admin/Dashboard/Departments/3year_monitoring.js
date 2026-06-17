const departmentSelect = document.getElementById("departmentSelect");
const coordinatorSelect = document.getElementById("coordinatorSelect");
const planDashboard = document.getElementById("planDashboard");
const emptyState = document.getElementById("planEmptyState");
const planDetails = document.getElementById("planDetails");
const toggleButtons = document.querySelectorAll(".plan-toggle");

let selectedPlans = [];
let activePlan = "plan1";

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function setEmptyState(message) {
    selectedPlans = [];
    planDashboard.hidden = true;
    emptyState.hidden = false;
    emptyState.textContent = message;
}

async function fetchJson(url) {
    const response = await fetch(url);
    const payload = await response.json();

    if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to load data.");
    }

    return payload;
}

departmentSelect.addEventListener("change", async () => {
    const selectedDepartment = departmentSelect.value;

    coordinatorSelect.innerHTML = '<option value="">Select Coordinator</option>';
    coordinatorSelect.disabled = true;
    setEmptyState("Select a department and coordinator to view the status overview and plan details.");

    if (!selectedDepartment) {
        return;
    }

    coordinatorSelect.innerHTML = '<option value="">Loading coordinators...</option>';

    try {
        const payload = await fetchJson(`get_coordinators.php?department=${encodeURIComponent(selectedDepartment)}`);
        coordinatorSelect.innerHTML = '<option value="">Select Coordinator</option>';

        if (!Array.isArray(payload.coordinators) || payload.coordinators.length === 0) {
            coordinatorSelect.innerHTML = '<option value="">No coordinator with approved 3YDP found</option>';
            return;
        }

        payload.coordinators.forEach((coordinator) => {
            const option = document.createElement("option");
            option.value = coordinator.id;
            option.textContent = coordinator.name;
            option.dataset.name = coordinator.name;
            coordinatorSelect.appendChild(option);
        });

        coordinatorSelect.disabled = false;
    } catch (error) {
        coordinatorSelect.innerHTML = '<option value="">Unable to load coordinators</option>';
        setEmptyState(error.message || "Unable to load coordinators.");
    }
});

coordinatorSelect.addEventListener("change", async () => {
    const selectedDepartment = departmentSelect.value;
    const selectedCoordinatorId = coordinatorSelect.value;

    if (!selectedDepartment || !selectedCoordinatorId) {
        setEmptyState("Select a department and coordinator to view the status overview and plan details.");
        return;
    }

    emptyState.hidden = false;
    emptyState.textContent = "Loading development plan data...";
    planDashboard.hidden = true;

    try {
        const payload = await fetchJson(
            `get_development_plan.php?department=${encodeURIComponent(selectedDepartment)}&coordinator_id=${encodeURIComponent(selectedCoordinatorId)}`
        );

        const latestPlan = Array.isArray(payload.plans) ? payload.plans[0] : null;
        const programs = Array.isArray(latestPlan?.programs) ? latestPlan.programs.slice(0, 3) : [];

        if (!latestPlan || programs.length === 0) {
            setEmptyState("No approved 3-Year Development Plan found for this coordinator.");
            return;
        }

        selectedPlans = programs.map((program, index) => {
            const status = normalizePlanProgress(program.progress || program.program_status);

            return {
                id: `plan${index + 1}`,
                label: `PLAN ${index + 1}`,
                status,
                percent: getPlanPercent(status),
                title: program.program || "Untitled Program",
                objective: program.objectives || "No objective provided.",
                progress: program.progress || program.program_status || "Not Started"
            };
        });

        activePlan = "plan1";
        updateDashboard();
    } catch (error) {
        setEmptyState(error.message || "Unable to load development plan data.");
    }
});

toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
        activePlan = button.dataset.plan;
        renderPlanDetails();
        toggleButtons.forEach((item) => item.classList.toggle("active", item.dataset.plan === activePlan));
    });
});

function updateDashboard() {
    emptyState.hidden = true;
    emptyState.textContent = "Select a department and coordinator to view the status overview and plan details.";
    planDashboard.hidden = false;

    for (let index = 1; index <= 3; index++) {
        const planId = `plan${index}`;
        const plan = selectedPlans.find((item) => item.id === planId);
        const percentLabel = document.getElementById(`${planId}Percent`);
        const ring = document.querySelector(`[data-plan-card="${planId}"]`);
        const statusLabel = ring?.querySelector(".progress-value span");

        if (!percentLabel || !ring || !statusLabel) {
            continue;
        }

        ring.classList.remove("completed", "incomplete", "progress", "upcoming");

        if (!plan) {
            percentLabel.textContent = "0%";
            statusLabel.textContent = "NOT STARTED";
            ring.style.setProperty("--progress", "0%");
            ring.classList.add("upcoming");
            continue;
        }

        percentLabel.textContent = `${plan.percent}%`;
        statusLabel.textContent = getPlanStatusLabel(plan.status);
        ring.style.setProperty("--progress", `${plan.percent}%`);
        ring.classList.add(getRingClass(plan.status));
    }

    toggleButtons.forEach((button) => button.classList.toggle("active", button.dataset.plan === activePlan));
    renderPlanDetails();
}

function normalizePlanProgress(value) {
    const status = String(value || "Not Started").toLowerCase().trim();

    if (["complete", "completed", "done", "finish", "finished"].includes(status)) {
        return "completed";
    }

    if (["delayed", "delay", "stop", "stopped", "did not complete", "not complete", "incomplete", "cancelled", "canceled"].includes(status)) {
        return "incomplete";
    }

    if (["in progress", "progress", "on progress", "ongoing"].includes(status)) {
        return "progress";
    }

    return "upcoming";
}

function getPlanPercent(status) {
    const percentages = {
        completed: 100,
        incomplete: 100,
        progress: 50,
        upcoming: 0
    };

    return percentages[status] ?? 0;
}

function getPlanStatusLabel(status) {
    const labels = {
        completed: "COMPLETED",
        incomplete: "DELAYED",
        progress: "IN PROGRESS",
        upcoming: "NOT STARTED"
    };

    return labels[status] ?? "NOT STARTED";
}

function getRingClass(status) {
    if (status === "completed") return "completed";
    if (status === "incomplete") return "incomplete";
    if (status === "progress") return "progress";
    return "upcoming";
}

function renderPlanDetails() {
    const plan = selectedPlans.find((item) => item.id === activePlan);

    if (!plan) {
        planDetails.innerHTML = '<div class="monitor-empty-state">No approved 3-Year Development Plan found for this slot.</div>';
        return;
    }

    planDetails.innerHTML = `
        <article class="plan-detail-card ${escapeHtml(plan.status)}">
            <div class="plan-pill">${escapeHtml(plan.label)}</div>
            <div class="program-title">
                <span>PROGRAM TITLE:</span>
                <strong>${escapeHtml(plan.title)}</strong>
            </div>
            <div class="objective-box">
                <span>OBJECTIVE:</span>
                <p>${escapeHtml(plan.objective)}</p>
            </div>
        </article>
    `;
}
