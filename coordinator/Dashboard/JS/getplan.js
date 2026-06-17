let developmentPlans = [];
let selectedProgramId = null;

const progressState = {
    notstarted: {
        label: "Not Started",
        button: "Not Started",
        color: "#ffffff",
        className: "notstarted"
    },
    complete: {
        label: "Completed",
        button: "Complete",
        color: "#4b982b",
        className: "complete"
    },
    progress: {
        label: "In Progress",
        button: "In Progress",
        color: "#d89b00",
        className: "progress"
    },
    stop: {
        label: "Delayed",
        button: "Delayed",
        color: "#c0162d",
        className: "stop"
    }
};

function onDashboardReady(callback, requiredSelector) {
    if (!requiredSelector || document.querySelector(requiredSelector)) {
        callback();
        return;
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

function normalizeProgress(value) {
    const status = String(value || "Not Started").toLowerCase().trim();

    if (["not started", "notstarted", "pending", ""].includes(status)) {
        return "notstarted";
    }

    if (["complete", "completed", "done", "finish", "finished"].includes(status)) {
        return "complete";
    }

    if (["delayed", "delay", "stop", "stopped", "did not complete", "not complete", "incomplete", "cancelled", "canceled"].includes(status)) {
        return "stop";
    }

    if (["in progress", "progress", "on progress", "ongoing"].includes(status)) {
        return "progress";
    }

    return "notstarted";
}

function getPlanStats(plan) {
    const programs = Array.isArray(plan.programs) ? plan.programs : [];
    const counts = {
        notstarted: 0,
        complete: 0,
        progress: 0,
        stop: 0
    };

    if (plan.dashboardStatus) {
        const status = normalizeProgress(plan.dashboardStatus);
        return {
            state: status,
            label: progressState[status].label
        };
    }

    programs.forEach(program => {
        counts[normalizeProgress(program.progress)] += 1;
    });

    if (programs.length === 0) {
        return {
            state: "notstarted",
            label: "Not Started"
        };
    }

    if (counts.stop > 0) {
        return { state: "stop", label: progressState.stop.label };
    }

    if (counts.progress > 0) {
        return { state: "progress", label: progressState.progress.label };
    }

    if (counts.complete > 0) {
        return { state: "complete", label: progressState.complete.label };
    }

    return { state: "notstarted", label: "Not Started" };
}

function populateYearFilter(years) {
    const yearFilter = document.getElementById("planYearFilter");
    if (!yearFilter) return;

    const currentValue = yearFilter.value || "all";
    const currentYear = new Date().getFullYear();
    const expandedYears = new Set((Array.isArray(years) ? years : []).map(String));

    for (let year = currentYear + 1; year >= currentYear - 5; year--) {
        expandedYears.add(String(year));
    }

    const yearOptions = Array.from(expandedYears)
        .filter(year => /^\d{4}$/.test(year))
        .sort((first, second) => Number(second) - Number(first));

    yearFilter.innerHTML = `<option value="all">All Years</option>`;

    yearOptions.forEach(year => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });

    if (currentValue === "all" || yearOptions.includes(currentValue)) {
        yearFilter.value = currentValue;
    }
}

async function loadDevelopmentPlans() {
    const yearFilter = document.getElementById("planYearFilter");
    const selectedYear = yearFilter?.value || "all";

    try {
        const response = await fetch(`/SYSTEM_VERSION_!/coordinator/Dashboard/PHP/getplan.php?year=${encodeURIComponent(selectedYear)}`);
        const payload = await response.json();

        if (!payload.success) {
            throw new Error(payload.message || "Unable to load development plans.");
        }

        developmentPlans = Array.isArray(payload.plans) ? payload.plans.slice(0, 1) : [];
        populateYearFilter(Array.isArray(payload.years) ? payload.years : []);

        const programs = developmentPlans[0]?.programs || [];
        if (!programs.some(program => String(program.id) === String(selectedProgramId))) {
            selectedProgramId = programs[0]?.id || null;
        }

        renderPlanTimeline();
        renderSelectedPlanPrograms();
    } catch (error) {
        const timeline = document.getElementById("planTimeline");
        const programList = document.getElementById("planProgramList");

        if (timeline) {
            timeline.innerHTML = `<div class="plan-empty-state">Unable to load development plans.</div>`;
        }

        if (programList) {
            programList.innerHTML = `<div class="plan-empty-state">${error.message}</div>`;
        }
    }
}

function renderPlanTimeline() {
    const timeline = document.getElementById("planTimeline");
    if (!timeline) return;

    if (developmentPlans.length === 0) {
        timeline.innerHTML = `<div class="plan-empty-state">No 3-Year Development Plans found.</div>`;
        return;
    }

    const latestPlan = developmentPlans[0];
    const programs = Array.isArray(latestPlan.programs) ? latestPlan.programs.slice(0, 3) : [];

    const planNodes = programs.map((program, index) => {
        const status = normalizeProgress(program.progress);
        const state = progressState[status];
        const isSelected = String(program.id) === String(selectedProgramId);
        const planNumber = index + 1;

        return `
            <button type="button" class="plan-node ${state.className} ${isSelected ? "active" : ""}" data-program-id="${program.id}">
                <span class="plan-circle" style="--plan-color:${state.color};">
                    <span class="plan-progress-label">${state.label}</span>
                </span>
                <span class="plan-pill">PLAN ${planNumber}</span>
            </button>
        `;
    });

    while (planNodes.length < 3) {
        const planNumber = planNodes.length + 1;
        planNodes.push(`
            <div class="plan-node empty">
                <span class="plan-circle empty-circle"></span>
                <span class="plan-pill">PLAN ${planNumber}</span>
            </div>
        `);
    }

    timeline.innerHTML = planNodes.join("");

    timeline.querySelectorAll(".plan-node[data-program-id]").forEach(node => {
        node.addEventListener("click", () => {
            selectedProgramId = node.dataset.programId;
            renderPlanTimeline();
            renderSelectedPlanPrograms();
        });
    });
}

function renderSelectedPlanPrograms() {
    const programList = document.getElementById("planProgramList");
    if (!programList) return;

    const selectedPlan = developmentPlans[0];

    if (!selectedPlan) {
        programList.innerHTML = renderEmptyPlanSlots();
        return;
    }

    const programs = Array.isArray(selectedPlan.programs) ? selectedPlan.programs.slice(0, 3) : [];

    programList.innerHTML = programs.map((program, index) => {
        const planNumber = index + 1;
        const status = normalizeProgress(program.progress);

        return `
            <div class="plan-program-group">
                <article class="plan-program-card" data-report-id="${selectedPlan.id}" data-program-id="${program.id}">
                    <div class="plan-program-badge">PLAN ${planNumber}</div>
                    <div class="plan-program-title">
                        <span>PROGRAM TITLE:</span>
                        <strong>${escapePlanHtml(program.program)}</strong>
                    </div>
                    <div class="plan-program-objective">
                        <span>OBJECTIVE:</span>
                        <p>${escapePlanHtml(program.objectives)}</p>
                    </div>
                    <div class="plan-program-actions">
                        ${renderProgressButton("complete", status)}
                        ${renderProgressButton("progress", status)}
                        ${renderProgressButton("stop", status)}
                    </div>
                </article>
            </div>
        `;
    }).join("");

    programList.innerHTML += renderEmptyPlanSlots(programs.length);

    programList.querySelectorAll(".program-status-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const card = button.closest(".plan-program-card");
            const programId = card?.dataset.programId;
            const program = selectedPlan?.programs?.find(item => String(item.id) === String(programId));

            if (program) {
                const nextProgress = progressState[button.dataset.status].label;
                const previousProgress = program.progress;

                button.disabled = true;
                program.progress = nextProgress;
                selectedProgramId = program.id;
                renderPlanTimeline();
                renderSelectedPlanPrograms();

                try {
                    await updateProgramProgress(program.id, nextProgress);
                } catch (error) {
                    program.progress = previousProgress;
                    renderPlanTimeline();
                    renderSelectedPlanPrograms();
                    alert(error.message || "Unable to update program progress.");
                }
            }
        });
    });
}

async function updateProgramProgress(programId, progress) {
    const response = await fetch("/SYSTEM_VERSION_!/coordinator/Dashboard/PHP/updateplanprogress.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            program_id: programId,
            progress
        })
    });

    const payload = await response.json();

    if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to update program progress.");
    }

    return payload;
}

function renderEmptyPlanSlots(startIndex = 0) {
    let html = "";

    for (let index = startIndex; index < 3; index++) {
        html += `
            <div class="plan-program-group empty">
                <div class="plan-empty-state">No approved 3-Year Development Plan found.</div>
            </div>
        `;
    }

    return html;
}

function renderProgressButton(status, activeStatus) {
    return `
        <button type="button" class="program-status-btn ${status} ${status === activeStatus ? "active" : ""}" data-status="${status}">
            ${progressState[status].button}
        </button>
    `;
}

function escapePlanHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

onDashboardReady(() => {
    const yearFilter = document.getElementById("planYearFilter");

    if (yearFilter) {
        yearFilter.addEventListener("change", () => {
            selectedProgramId = null;
            loadDevelopmentPlans();
        });
    }

    loadDevelopmentPlans();
}, "#planTimeline");
