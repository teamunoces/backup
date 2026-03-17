// Store reports separately for each section
let approvedReports = [];
let needFixReports = [];
let rejectedReports = [];

async function loadReports() {
    try {
        
        const response = await fetch("/coordinator/ReportManagement/php/get.php");
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            displayNoReportsMessage();
            return;
        }

        const typeNameMap = {
            "coordinator_cnacr": "Community Needs Assessment Consolidated Report",
            "3ydp": "3 Year Development Plan",
            "pd_main": "Program Design",
            "dpir": "Departmental Planned Initiative Report",
            "mar_header": "Monthly Accomplishment Report"
        };

        // Clear previous data
        approvedReports = [];
        needFixReports = [];
        rejectedReports = [];

        // Categorize reports by status
        data.forEach((report, index) => {
            const status = (report.status || "").toLowerCase().trim();
            const reportWithMeta = {
                ...report,
                displayType: typeNameMap[report.source_table] || report.source_table,
                index: index
            };

            if (status === "approve") {
                approvedReports.push(reportWithMeta);
            } else if (status === "need fix") {
                needFixReports.push(reportWithMeta);
            } else if (status === "rejected") {
                rejectedReports.push(reportWithMeta);
            }
        });

        // Initialize filter event listeners
        initFilterListeners();

        // Render all tables with current filter values
        renderApprovedTable();
        renderNeedFixTable();
        renderRejectedTable();

    } catch (error) {
        console.error("Error loading reports:", error);
    }
}

// Display no reports message in all tables
function displayNoReportsMessage() {
    const approvedTable = document.getElementById("approvedTableBody");
    const needfixTable = document.getElementById("needfixTableBody");
    const rejectedTable = document.getElementById("rejectedTableBody");
    
    const noDataRow = `<tr><td colspan="5" style="text-align:center;">No reports found.</td></tr>`;
    approvedTable.innerHTML = noDataRow;
    needfixTable.innerHTML = noDataRow;
    rejectedTable.innerHTML = noDataRow;
}

// Render Approved table with its own filter
function renderApprovedTable() {
    const tableBody = document.getElementById("approvedTableBody");
    const filterSelect = document.querySelector('.section-green .filter-row select');
    const selectedType = filterSelect ? filterSelect.value : 'All type';
    
    tableBody.innerHTML = "";
    
    // Filter reports based on selected type
    let filteredReports = approvedReports;
    if (selectedType !== 'All type') {
        filteredReports = approvedReports.filter(report => report.displayType === selectedType);
    }
    
    if (filteredReports.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No approved reports found.</td></tr>`;
        return;
    }
    
    // Build HTML for filtered reports
    let html = "";
    filteredReports.forEach(report => {
        const formattedDate = report.created_at?.split(" ")[0] || "N/A";
        
        html += `
            <tr data-report-id="${report.id}" data-table="${report.source_table}">
                <td>${report.displayType}</td>
                <td>${report.title || 'N/A'}</td>
                <td>${report.department || 'N/A'}</td>
                <td>${formattedDate}</td>
                <td class="actions">
                    <i class="far fa-eye view-icon" data-id="${report.id}" data-table="${report.source_table}"></i>
                    <i class="fas fa-archive archive-icon" data-id="${report.id}" data-table="${report.source_table}"></i>
                </td>
            </tr>`;
    });
    
    tableBody.innerHTML = html;
    
    // Attach events only to this section's icons
    attachSectionEvents(tableBody);
}

// Render Need Fix table with its own filter
function renderNeedFixTable() {
    const tableBody = document.getElementById("needfixTableBody");
    const filterSelect = document.querySelector('.section-Orange .filter-row select');
    const selectedType = filterSelect ? filterSelect.value : 'All type';
    
    tableBody.innerHTML = "";
    
    // Filter reports based on selected type
    let filteredReports = needFixReports;
    if (selectedType !== 'All type') {
        filteredReports = needFixReports.filter(report => report.displayType === selectedType);
    }
    
    if (filteredReports.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No reports needing fix found.</td></tr>`;
        return;
    }
    
    // Build HTML for filtered reports
    let html = "";
    filteredReports.forEach(report => {
        const formattedDate = report.created_at?.split(" ")[0] || "N/A";
        
        html += `
            <tr data-report-id="${report.id}" data-table="${report.source_table}">
                <td>${report.displayType}</td>
                <td>${report.title || 'N/A'}</td>
                <td>${report.department || 'N/A'}</td>
                <td>${formattedDate}</td>
                <td class="actions">
                    <i class="far fa-eye view-icon" data-id="${report.id}" data-table="${report.source_table}"></i>
                    <i class="fas fa-archive archive-icon" data-id="${report.id}" data-table="${report.source_table}"></i>
                </td>
            </tr>`;
    });
    
    tableBody.innerHTML = html;
    
    // Attach events only to this section's icons
    attachSectionEvents(tableBody);
}

// Render Rejected table with its own filter
function renderRejectedTable() {
    const tableBody = document.getElementById("rejectedTableBody");
    const filterSelect = document.querySelector('.section-red .filter-row select');
    const selectedType = filterSelect ? filterSelect.value : 'All type';
    
    tableBody.innerHTML = "";
    
    // Filter reports based on selected type
    let filteredReports = rejectedReports;
    if (selectedType !== 'All type') {
        filteredReports = rejectedReports.filter(report => report.displayType === selectedType);
    }
    
    if (filteredReports.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No rejected reports found.</td></tr>`;
        return;
    }
    
    // Build HTML for filtered reports
    let html = "";
    filteredReports.forEach(report => {
        const formattedDate = report.created_at?.split(" ")[0] || "N/A";
        
        html += `
            <tr data-report-id="${report.id}" data-table="${report.source_table}">
                <td>${report.displayType}</td>
                <td>${report.title || 'N/A'}</td>
                <td>${report.department || 'N/A'}</td>
                <td>${formattedDate}</td>
                <td class="actions">
                    <i class="far fa-eye view-icon" data-id="${report.id}" data-table="${report.source_table}"></i>
                    <i class="fas fa-archive archive-icon" data-id="${report.id}" data-table="${report.source_table}"></i>
                </td>
            </tr>`;
    });
    
    tableBody.innerHTML = html;
    
    // Attach events only to this section's icons
    attachSectionEvents(tableBody);
}

// Attach events to icons within a specific section
function attachSectionEvents(container) {
    // Archive icon events
    container.querySelectorAll(".archive-icon").forEach((icon) => {
        icon.addEventListener("click", async (e) => {
            e.stopPropagation();
            const reportId = icon.getAttribute("data-id");
            const reportTable = icon.getAttribute("data-table");

            if (!confirm("Archive this report?")) return;

            try {
                const response = await fetch("/coordinator/ReportManagement/php/archive.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: reportId, table: reportTable })
                });
                const result = await response.json();

                if (result.success) {
                    alert("Report archived successfully.");
                    loadReports(); // Reload all reports
                } else {
                    alert("Archive failed.");
                }

            } catch (error) {
                console.error("Archive error:", error);
            }
        });
    });

    // View icon events
    container.querySelectorAll(".view-icon").forEach((icon) => {
        icon.addEventListener("click", (e) => {
            e.stopPropagation();
            const reportId = icon.getAttribute("data-id");
            const reportTable = icon.getAttribute("data-table");

            // Find the report in the appropriate array
            let report = null;
            
            if (container.id === "approvedTableBody") {
                report = approvedReports.find(r => r.id == reportId && r.source_table === reportTable);
            } else if (container.id === "needfixTableBody") {
                report = needFixReports.find(r => r.id == reportId && r.source_table === reportTable);
            } else if (container.id === "rejectedTableBody") {
                report = rejectedReports.find(r => r.id == reportId && r.source_table === reportTable);
            }
            
            if (!report) return;

            const status = (report.status || "").toLowerCase().trim();

            if (status === "rejected") {
                // Show modern banner instead of alert
                const banner = document.getElementById("rejectedBanner");
                banner.classList.remove("hidden");
                banner.classList.add("show");

                // Hide banner after 3 seconds
                setTimeout(() => {
                    banner.classList.remove("show");
                    banner.classList.add("hidden");
                }, 3000);

                return; // Stop further execution
            }

            let viewMap;

            if (status === "approve") {
                // DIFFERENT PATHS for approved
                viewMap = {
                    "coordinator_cnacr": "./actions/view/cnacrview/cnacrview.php",
                    "3ydp": "./actions/view/3ydpview/view.php",
                    "pd_main": "./actions/view/pdview/view.php",
                    "mar_header": "./actions/view/marview/marview.php",
                    "dpir": "./actions/view/dpirview/view.php"
                };
            } else {
                // NORMAL VIEW (need fix)
                viewMap = {
                    "coordinator_cnacr": "./actions/feedback/cnacrview/cnacrview.php",
                    "3ydp": "./actions/feedback/3ydpview/view.php",
                    "pd_main": "./actions/feedback/pdview/view.php",
                    "mar_header": "./actions/feedback/marview/marview.php",
                    "dpir": "./actions/fix/dpirfix/view.php"
                };
            }

            const viewPath = viewMap[report.source_table];
            if (viewPath) {
                window.location.href = `${viewPath}?id=${reportId}`;
            } else {
                console.error("No view path defined for table: " + report.source_table);
            }
        });
    });
}

// Initialize filter event listeners for each section independently
function initFilterListeners() {
    // Approved section filter
    const approvedFilter = document.querySelector('.section-green .filter-row select');
    if (approvedFilter) {
        approvedFilter.addEventListener('change', function() {
            renderApprovedTable();
        });
    }
    
    // Need Fix section filter
    const needFixFilter = document.querySelector('.section-Orange .filter-row select');
    if (needFixFilter) {
        needFixFilter.addEventListener('change', function() {
            renderNeedFixTable();
        });
    }
    
    // Rejected section filter
    const rejectedFilter = document.querySelector('.section-red .filter-row select');
    if (rejectedFilter) {
        rejectedFilter.addEventListener('change', function() {
            renderRejectedTable();
        });
    }
}

// Reset filter for a specific section
function resetSectionFilter(section) {
    if (section === 'approved') {
        document.querySelector('.section-green .filter-row select').value = 'All type';
        renderApprovedTable();
    } else if (section === 'needfix') {
        document.querySelector('.section-Orange .filter-row select').value = 'All type';
        renderNeedFixTable();
    } else if (section === 'rejected') {
        document.querySelector('.section-red .filter-row select').value = 'All type';
        renderRejectedTable();
    }
}

// Reset all filters
function resetAllFilters() {
    document.querySelectorAll('.filter-row select').forEach(select => {
        select.value = 'All type';
    });
    renderApprovedTable();
    renderNeedFixTable();
    renderRejectedTable();
}

document.addEventListener("DOMContentLoaded", loadReports);