// Global variables for upload functionality
let currentUploadReportId = null;
let currentUploadTable = null;
let currentExistingFiles = [];
let pendingReuploadFileId = null;
let pendingReuploadFileName = null;
const MAX_FILES = 4;
const DEFAULT_REPORT_LIMIT = 5;
const showAllState = {
    admin: false,
    approved: false,
    rejected: false
};

const typeMap = {
    "report_cnacr": "CNACR",
    "report_coordinator_cnacr": "Community Needs Assessment Consolidated Report",
    "report_3ydp": "3 Year Development Plan",
    "report_pd_main": "Program Design",
    "report_mar_header": "Monthly Accomplishment Report",
    "report_program_monitoring_form": "Program Monitoring Form",
    "report_evaluation": "Evaluation Sheet for Extension Services",
    "report_cert_appearance": "Certificate of Appearance",
    "report_reflection_paper": "Monthly Accomplishment Report- Reflection Paper",
    "report_narrative": "Monthly Accomplishment Report- Narrative Report",
    "cnacr": "CNACR",
    "coordinator_cnacr": "Community Needs Assessment Consolidated Report",
    "3ydp": "3 Year Development Plan",
    "pd_main": "Program Design",
    "mar_header": "Monthly Accomplishment Report",
    "program_monitoring_form": "Program Monitoring Form",
    "evaluation_reports": "Evaluation Sheet for Extension Services",
    "cert_appearance": "Certificate of Appearance",
    "reflection_paper": "Monthly Accomplishment Report- Reflection Paper",
    "narrative_report": "Monthly Accomplishment Report- Narrative Report"
};

// Store all reports data from server
let allReportsData = [];

// Detect which page we're on (will be set after DOM is ready)
let isAdminPage = false;
let isCoordinatorPage = false;

// Debug function to check if elements exist
function debugElement(id) {
    const element = document.getElementById(id);
    return element;
}

function getTypeName(report) {
    return report?.type || typeMap[report?.source_table] || "N/A";
}

function getReportTime(report) {
    if (!report || !report.created_at) {
        return 0;
    }

    const dateMatch = String(report.created_at).match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}:\d{2}))?/);
    const normalizedDate = dateMatch
        ? `${dateMatch[1]}T${dateMatch[2] || "00:00:00"}`
        : String(report.created_at).replace(" ", "T");
    const parsedDate = new Date(normalizedDate);

    return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
}

function getReportDateOnly(report) {
    if (!report || !report.created_at) {
        return "";
    }

    return String(report.created_at).split(/[ T]/)[0];
}

function normalizeReportStatus(report) {
    const status = String(report?.status || "").trim().toLowerCase();
    return status === "approved" ? "approve" : status;
}

function normalizeReportRole(report) {
    return String(report?.role || "").trim().toLowerCase();
}

function isCoordinatorReport(report) {
    return normalizeReportRole(report) === "coordinator";
}

function isApprovedReport(report) {
    return isCoordinatorReport(report) && normalizeReportStatus(report) === "approve";
}

function isRejectedReport(report) {
    return isCoordinatorReport(report) && normalizeReportStatus(report) === "rejected";
}

function sortReportsByDate(reports) {
    return Array.isArray(reports)
        ? reports.slice().sort((first, second) => {
            const dateDifference = getReportTime(second) - getReportTime(first);
            if (dateDifference !== 0) return dateDifference;
            return Number(second.id || 0) - Number(first.id || 0);
        })
        : [];
}

function getSectionFilterValues(section) {
    const typeFilterIds = {
        admin: "adminFilterSelect",
        approved: "approvedFilterSelect",
        rejected: "rejectedFilterSelect"
    };

    return {
        type: document.getElementById(typeFilterIds[section])?.value || "All type",
        dateFrom: document.getElementById(`${section}DateFrom`)?.value || "",
        dateTo: document.getElementById(`${section}DateTo`)?.value || ""
    };
}

function sectionHasActiveFilter(section) {
    const { type, dateFrom, dateTo } = getSectionFilterValues(section);
    return type !== "All type" || dateFrom !== "" || dateTo !== "";
}

function filterReportsBySection(reports, section) {
    const { type, dateFrom, dateTo } = getSectionFilterValues(section);

    return reports
        .slice()
        .sort((first, second) => {
            const dateDifference = getReportTime(second) - getReportTime(first);
            if (dateDifference !== 0) return dateDifference;
            return Number(second.id || 0) - Number(first.id || 0);
        })
        .filter(report => {
            const reportDate = getReportDateOnly(report);
            const matchesType = type === "All type" || getTypeName(report) === type;
            const matchesFrom = !dateFrom || (reportDate && reportDate >= dateFrom);
            const matchesTo = !dateTo || (reportDate && reportDate <= dateTo);

            return matchesType && matchesFrom && matchesTo;
        });
}

function limitReportsForSection(reports, section) {
    if (!showAllState[section] && !sectionHasActiveFilter(section)) {
        return reports.slice(0, DEFAULT_REPORT_LIMIT);
    }

    return reports;
}

function updateShowAllButton(section) {
    const showAllButton = document.getElementById(`${section}ShowAllBtn`);

    if (showAllButton) {
        showAllButton.textContent = showAllState[section] ? "Show Latest" : "Show All";
    }
}

function renderAdminTable(data) {
    const adminTableBody = document.getElementById("adminTableBody");
    if (!adminTableBody) return;

    adminTableBody.innerHTML = "";

    if (!data || data.length === 0) {
        adminTableBody.innerHTML = `<tr><td colspan="6">No admin reports found.</td></tr>`;
        updateShowAllButton("admin");
        return;
    }

    data.forEach((report, index) => {
        const formattedDate = getReportDateOnly(report) || "N/A";
        const typeName = getTypeName(report);

        const rowHTML = `
        <tr data-index="${index}" data-id="${report.id}" data-source-table="${report.source_table}">
            <td class="report-type-cell">${typeName}</td>
            <td>${report.title || 'N/A'}</td>
            <td>${report.department || 'N/A'}</td>
            <td>${formattedDate}</td>
            <td class="actions">
                <i class="far fa-eye view-icon" data-id="${report.id}" data-source-table="${report.source_table}" style="cursor: pointer; margin-right: 10px;"></i>
                <i class="fas fa-upload upload-icon" data-id="${report.id}" data-table="${report.source_table}" style="cursor: pointer; margin-right: 10px; color: #2e7d32;"></i>
                <i class="fas fa-archive archive-icon" style="cursor: pointer; color: #f44336;"></i>
            </td>
        </tr>
        `;

        adminTableBody.innerHTML += rowHTML;
    });

    attachActionEvents(data);
    updateShowAllButton("admin");
}

function renderApprovedTable(data) {
    const tbody = document.getElementById("coordinatorapprovedTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No approved reports found.</td></tr>`;
        updateShowAllButton("approved");
        return;
    }

    data.forEach((report, index) => {
        const formattedDate = getReportDateOnly(report) || "N/A";
        const typeName = getTypeName(report);

        const rowHTML = `
        <tr data-index="${index}" data-id="${report.id}" data-source-table="${report.source_table}">
            <td class="report-type-cell">${typeName}</td>
            <td>${report.title || 'N/A'}</td>
            <td>${report.department || 'N/A'}</td>
            <td>${formattedDate}</td>
            <td class="actions">
                <i class="far fa-eye view-icon" data-id="${report.id}" data-source-table="${report.source_table}" style="cursor: pointer; margin-right: 10px;"></i>
                <i class="fas fa-archive archive-icon" style="cursor: pointer; color: #f44336;"></i>
            </td>
        </tr>
        `;

        tbody.innerHTML += rowHTML;
    });

    attachActionEvents(data);
    updateShowAllButton("approved");
}

function renderRejectedTable(data) {
    const tbody = document.getElementById("coordinatorrejectedTableBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No rejected reports found.</td></tr>`;
        updateShowAllButton("rejected");
        return;
    }

    data.forEach((report, index) => {
        const formattedDate = getReportDateOnly(report) || "N/A";
        const typeName = getTypeName(report);

        const rowHTML = `
        <tr data-index="${index}" data-id="${report.id}" data-source-table="${report.source_table}">
            <td class="report-type-cell">${typeName}</td>
            <td>${report.title || 'N/A'}</td>
            <td>${report.department || 'N/A'}</td>
            <td>${formattedDate}</td>
            <td class="actions">
                <i class="far fa-eye view-icon" data-id="${report.id}" data-source-table="${report.source_table}" style="cursor: pointer; margin-right: 10px;"></i>
                <i class="fas fa-archive archive-icon" style="cursor: pointer; color: #f44336;"></i>
            </td>
        </tr>
        `;

        tbody.innerHTML += rowHTML;
    });

    attachActionEvents(data);
    updateShowAllButton("rejected");
}

// Function to load reports from server
async function loadReports() {
    try {
        const response = await fetch("/SYSTEM_VERSION_!/admin/ReportManagement/php/get.php");
        const data = await response.json();
        
        // Store all data globally
        allReportsData = sortReportsByDate(data);
        
        // Render the tables with all data
        renderAllTables();
        
        // Populate filter dropdowns with unique report types
        populateFilterDropdowns();
        
        // Initialize filters
        initFilters();
        
    } catch (error) {
        showNotification("Error loading reports. Please refresh the page.", "error");
    }
}

// New function to render all tables
function renderAllTables() {
    // For admin page
    if (isAdminPage) {
        let adminReports = allReportsData.filter(report => {
            const role = report.role ? report.role.toLowerCase() : '';
            return role === 'admin';
        });
        adminReports = filterReportsBySection(adminReports, "admin");
        adminReports = limitReportsForSection(adminReports, "admin");
        renderAdminTable(adminReports);
    }
    
    // For coordinator page
    if (isCoordinatorPage) {
        let approvedReports = allReportsData.filter(isApprovedReport);
        approvedReports = filterReportsBySection(approvedReports, "approved");
        approvedReports = limitReportsForSection(approvedReports, "approved");
        renderApprovedTable(approvedReports);
        
        let rejectedReports = allReportsData.filter(isRejectedReport);
        rejectedReports = filterReportsBySection(rejectedReports, "rejected");
        rejectedReports = limitReportsForSection(rejectedReports, "rejected");
        renderRejectedTable(rejectedReports);
    }
}

// Populate filter dropdowns with unique report types
function populateFilterDropdowns() {
    if (!allReportsData || allReportsData.length === 0) return;
    
    // Helper function to get unique types for a specific role and status
    function getUniqueTypes(role, statusFilter = null) {
        const types = new Set();
        allReportsData.forEach(report => {
            const reportRole = normalizeReportRole(report);
            const reportStatus = normalizeReportStatus(report);
            const typeMap = {
                "cnacr": "CNACR",
                "coordinator_cnacr": "Community Needs Assessment Consolidated Report",
                "3ydp": "3 Year Development Plan",
                "pd_main": "Program Design",
                "mar_header": "Monthly Accomplishment Report",
                "program_monitoring_form": "Program Monitoring Form",
                "evaluation_reports": "Evaluation Sheet for Extension Services",
                "cert_appearance": "Certificate of Appearance",
                "reflection_paper": "Monthly Accomplishment Report- Reflection Paper",
                "narrative_report": "Monthly Accomplishment Report- Narrative Report"
            };
           const typeName = getTypeName(report);
            
            if (reportRole === role) {
                if (statusFilter === null || reportStatus === statusFilter) {
                    types.add(typeName);
                }
            }
        });
        return Array.from(types).sort();
    }
    
    // Populate admin filter (reports with role='admin')
    if (isAdminPage) {
        const adminFilter = document.getElementById('adminFilterSelect');
        if (adminFilter) {
            const adminTypes = getUniqueTypes('admin');
            
            const currentValue = adminFilter.value;
            adminFilter.innerHTML = '<option value="All type">All type</option>';
            adminTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                adminFilter.appendChild(option);
            });
            if (currentValue && adminTypes.includes(currentValue)) {
                adminFilter.value = currentValue;
            }
        }
    }
    
    // Populate coordinator filters (reports with role='coordinator')
    if (isCoordinatorPage) {
        // Approved reports
        const approvedFilter = document.getElementById('approvedFilterSelect');
        if (approvedFilter) {
            const approvedTypes = getUniqueTypes('coordinator', 'approve');
            
            const currentValue = approvedFilter.value;
            approvedFilter.innerHTML = '<option value="All type">All type</option>';
            approvedTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                approvedFilter.appendChild(option);
            });
            if (currentValue && approvedTypes.includes(currentValue)) {
                approvedFilter.value = currentValue;
            }
        }
        
        // Rejected reports
        const rejectedFilter = document.getElementById('rejectedFilterSelect');
        if (rejectedFilter) {
            const rejectedTypes = getUniqueTypes('coordinator', 'rejected');
            
            const currentValue = rejectedFilter.value;
            rejectedFilter.innerHTML = '<option value="All type">All type</option>';
            rejectedTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                rejectedFilter.appendChild(option);
            });
            if (currentValue && rejectedTypes.includes(currentValue)) {
                rejectedFilter.value = currentValue;
            }
        }
    }
}

// Filter admin reports
function filterAdminReports() {
    
    if (!isAdminPage) {
        return;
    }
    
    const filterSelect = document.getElementById('adminFilterSelect');
    if (!filterSelect) {
        return;
    }
    
    // Filter only admin reports
    let adminReports = allReportsData.filter(report => {
        const role = report.role ? report.role.toLowerCase() : '';
        return role === 'admin';
    });
    showAllState.admin = false;
    adminReports = filterReportsBySection(adminReports, "admin");
    adminReports = limitReportsForSection(adminReports, "admin");
    
    renderAdminTable(adminReports);
}

// Filter approved reports
function filterApprovedReports() {
    
    if (!isCoordinatorPage) {
        return;
    }
    
    const filterSelect = document.getElementById('approvedFilterSelect');
    if (!filterSelect) {
        return;
    }
    
    // Filter only approved coordinator reports
    let approvedReports = allReportsData.filter(isApprovedReport);
    showAllState.approved = false;
    approvedReports = filterReportsBySection(approvedReports, "approved");
    approvedReports = limitReportsForSection(approvedReports, "approved");
    
    renderApprovedTable(approvedReports);
}

// Filter rejected reports
function filterRejectedReports() {
    
    if (!isCoordinatorPage) {
        return;
    }
    
    const filterSelect = document.getElementById('rejectedFilterSelect');
    if (!filterSelect) {
        return;
    }
    
    // Filter only rejected coordinator reports
    let rejectedReports = allReportsData.filter(isRejectedReport);
    showAllState.rejected = false;
    rejectedReports = filterReportsBySection(rejectedReports, "rejected");
    rejectedReports = limitReportsForSection(rejectedReports, "rejected");
    
    renderRejectedTable(rejectedReports);
}

function initFilters() {
    
    if (isAdminPage) {
        const adminFilter = document.getElementById('adminFilterSelect');
        if (adminFilter) {
            
            // Remove existing listener by cloning
            const newAdminFilter = adminFilter.cloneNode(true);
            adminFilter.parentNode.replaceChild(newAdminFilter, adminFilter);
            
            newAdminFilter.addEventListener('change', function() {
                filterAdminReports();
            });
        } else {
        }

        ["adminDateFrom", "adminDateTo"].forEach(id => {
            const dateFilter = document.getElementById(id);
            if (dateFilter && dateFilter.dataset.filterBound !== "true") {
                dateFilter.dataset.filterBound = "true";
                dateFilter.addEventListener("change", filterAdminReports);
            }
        });
    }
    
    if (isCoordinatorPage) {
        const approvedFilter = document.getElementById('approvedFilterSelect');
        if (approvedFilter) {
            const newApprovedFilter = approvedFilter.cloneNode(true);
            approvedFilter.parentNode.replaceChild(newApprovedFilter, approvedFilter);
            
            newApprovedFilter.addEventListener('change', function() {
                filterApprovedReports();
            });
        } else {
        }

        ["approvedDateFrom", "approvedDateTo"].forEach(id => {
            const dateFilter = document.getElementById(id);
            if (dateFilter && dateFilter.dataset.filterBound !== "true") {
                dateFilter.dataset.filterBound = "true";
                dateFilter.addEventListener("change", filterApprovedReports);
            }
        });
        
        const rejectedFilter = document.getElementById('rejectedFilterSelect');
        if (rejectedFilter) {
            const newRejectedFilter = rejectedFilter.cloneNode(true);
            rejectedFilter.parentNode.replaceChild(newRejectedFilter, rejectedFilter);
            
            newRejectedFilter.addEventListener('change', function() {
                filterRejectedReports();
            });
        } else {
        }

        ["rejectedDateFrom", "rejectedDateTo"].forEach(id => {
            const dateFilter = document.getElementById(id);
            if (dateFilter && dateFilter.dataset.filterBound !== "true") {
                dateFilter.dataset.filterBound = "true";
                dateFilter.addEventListener("change", filterRejectedReports);
            }
        });
    }
}

function showAllSectionReports(section) {
    const typeFilterIds = {
        admin: "adminFilterSelect",
        approved: "approvedFilterSelect",
        rejected: "rejectedFilterSelect"
    };
    const shouldShowAll = !showAllState[section];
    const typeFilter = document.getElementById(typeFilterIds[section]);
    const dateFromFilter = document.getElementById(`${section}DateFrom`);
    const dateToFilter = document.getElementById(`${section}DateTo`);

    if (typeFilter) typeFilter.value = "All type";
    if (dateFromFilter) dateFromFilter.value = "";
    if (dateToFilter) dateToFilter.value = "";

    showAllState[section] = shouldShowAll;
    renderAllTables();
}
function attachActionEvents(data) {
    
    // View icon events
    document.querySelectorAll(".view-icon").forEach((icon) => {
        icon.removeEventListener("click", icon._clickHandler);
        
        const clickHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const reportId = icon.getAttribute("data-id");
            const sourceTable = icon.getAttribute("data-source-table");
            const row = icon.closest("tr");
            
            // Use the full allReportsData to find the report, not the filtered data
            const report = allReportsData.find(r => r.id == reportId && r.source_table === sourceTable);
            
            if (!report) {
                showNotification("Report not found", "error");
                return;
            }
            
            // Check which table this is in
            const parentTbody = row.closest('tbody');
            
            // For rejected table on coordinator page - show feedback modal
            if (parentTbody && parentTbody.id === 'coordinatorrejectedTableBody' && isCoordinatorPage) {
                
                const typeMap = {
                    "cnacr": "CNACR",
                    "coordinator_cnacr": "Community Needs Assessment Consolidated Report",
                    "3ydp": "3 Year Development Plan",
                    "pd_main": "Program Design",
                    "mar_header": "Monthly Accomplishment Report",
                    "program_monitoring_form": "Program Monitoring Form",
                    "evaluation_reports": "Evaluation Sheet for Extension Services",
                    "cert_appearance": "Certificate of Appearance",
                    "reflection_paper": "Monthly Accomplishment Report- Reflection Paper",
                    "narrative_report": "Monthly Accomplishment Report- Narrative Report"

                };
                
                const reportWithDisplay = {
                    ...report,
                    displayType: getTypeName(report)
                };
                
                // Check if showFeedbackModal exists
                if (typeof window.showFeedbackModal === 'function') {
                    window.showFeedbackModal(reportId, sourceTable, reportWithDisplay);
                } else {
                    // Fallback: Show a simple alert with feedback
                    if (report.feedback) {
                        alert(`Feedback for rejected report:\n\n${report.feedback}`);
                    } else {
                        alert("No feedback available for this report.");
                    }
                }
            } 
            // For approved table on coordinator page - navigate to view
            else if (parentTbody && parentTbody.id === 'coordinatorapprovedTableBody' && isCoordinatorPage) {
                const viewPath = getViewPath(report, row);
                if (viewPath) {
                    window.location.href = `${viewPath}?id=${reportId}`;
                } else {
                    showNotification("View path not found", "error");
                }
            }
            // For admin page - navigate to view
            else if (isAdminPage) {
                const viewPath = getViewPath(report, row);
                if (viewPath) {
                    window.location.href = `${viewPath}?id=${reportId}`;
                } else {
                    showNotification("View path not found", "error");
                }
            }
        };
        
        icon._clickHandler = clickHandler;
        icon.addEventListener("click", clickHandler);
    });
    
    // Upload icon events (only on admin page)
    if (isAdminPage) {
        document.querySelectorAll("#adminTableBody .upload-icon").forEach((icon) => {
            icon.removeEventListener("click", icon._uploadHandler);
            
            const uploadHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const reportId = icon.getAttribute("data-id");
                const reportTable = icon.getAttribute("data-table");
                
                // Use allReportsData to find the report
                const report = allReportsData.find(r => r.id == reportId && r.source_table === reportTable);
                showUploadModal(reportId, reportTable, report);
            };
            
            icon._uploadHandler = uploadHandler;
            icon.addEventListener("click", uploadHandler);
        });
    }
    
    // Archive icon events
    document.querySelectorAll(".archive-icon").forEach((icon) => {
        icon.removeEventListener("click", icon._archiveHandler);
        
        const archiveHandler = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const row = icon.closest("tr");
            const reportId = row.getAttribute("data-id");
            const sourceTable = row.getAttribute("data-source-table");
            
            // Use allReportsData to find the report
            const report = allReportsData.find(r => r.id == reportId && r.source_table === sourceTable);
            
            if (!report) {
                showNotification("Report not found", "error");
                return;
            }
            
            if (!confirm("Are you sure you want to archive this report?")) return;
            
            try {
                const response = await fetch("/SYSTEM_VERSION_!/admin/ReportManagement/php/archive.php", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        id: report.id,
                        table: report.source_table
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    showNotification("Report archived successfully!", "success");
                    loadReports(); // Reload all reports after archive
                } else {
                    showNotification("Failed to archive report: " + (result.error || "Unknown error"), "error");
                }
            } catch (error) {
                showNotification("Error archiving report", "error");
            }
        };
        
        icon._archiveHandler = archiveHandler;
        icon.addEventListener("click", archiveHandler);
    });
}
function getViewPath(report, row) {
    const type = report.source_table.toLowerCase().trim();
    
    const viewMappings = {
        admin: {
            "report_cnacr": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/resultview/cnacrview.php",
            "report_coordinator_cnacr": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/coor_cnacrview/cnacrview.php",
            "report_3ydp": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/3ydpview/3ydpview.php",
            "report_pd_main": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/pdview/pdview.php",
            "report_mar_header": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/marview/marview.php",
            "report_program_monitoring_form": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/program_monitoring_formview/program_monitoring_formview.php",
            "report_evaluation": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/evaluation_sheetview/evaluation_sheetview.php",
            "report_cert_appearance": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/coaview/coaview.php",
            "report_reflection_paper": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/reflection_paperview/reflection_paperview.php",
            "report_narrative": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/narrative_reportview/narrative_reportview.php",
            "cnacr": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/resultview/cnacrview.php",
            "coordinator_cnacr": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/coor_cnacrview/cnacrview.php",
            "3ydp": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/3ydpview/3ydpview.php",
            "pd_main": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/pdview/pdview.php",
            "mar_header": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/marview/marview.php",
            "program_monitoring_form": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/program_monitoring_formview/program_monitoring_formview.php",
            "evaluation_reports": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/evaluation_sheetview/evaluation_sheetview.php",
            "cert_appearance": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/coaview/coaview.php",
            "reflection_paper": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/reflection_paperview/reflection_paperview.php",
            "narrative_report": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/admin_view/narrative_reportview/narrative_reportview.php",
            "default": null
        },
        coordinatorApproved: {
            "report_coordinator_cnacr": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/cnacrview/cnacrview.php",
            "report_3ydp": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/3ydpview/3ydpview.php",
            "report_pd_main": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/pdview/pdview.php",
            "report_mar_header": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/marview/marview.php",
            "report_program_monitoring_form": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/program_monitoring_formview/program_monitoring_formview.php",
            "report_evaluation": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/evaluation_sheetview/evaluation_sheetview.php",
            "report_cert_appearance": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/coaview/coaview.php",
            "report_reflection_paper": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/reflection_paperview/reflection_paperview.php",
            "report_narrative": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/narrative_reportview/narrative_reportview.php",
            "coordinator_cnacr": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/cnacrview/cnacrview.php",
            "3ydp": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/3ydpview/3ydpview.php",
            "pd_main": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/pdview/pdview.php",
            "mar_header": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/marview/marview.php",
            "program_monitoring_form": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/program_monitoring_formview/program_monitoring_formview.php",
            "evaluation_reports": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/evaluation_sheetview/evaluation_sheetview.php",
            "cert_appearance": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/coaview/coaview.php",
            "reflection_paper": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/reflection_paperview/reflection_paperview.php",
            "narrative_report": "/SYSTEM_VERSION_!/admin/ReportManagement/actions/coordinator_view/narrative_reportview/narrative_reportview.php",
            "default": null
        },
        coordinatorRejected: {
            "default": null
        }
    };
    
    let tableKey = 'admin';
    
    const parentTbody = row.closest('tbody');
    if (parentTbody) {
        if (parentTbody.id === 'coordinatorapprovedTableBody') {
            tableKey = 'coordinatorApproved';
        } 
        else if (parentTbody.id === 'coordinatorrejectedTableBody') {
            tableKey = 'coordinatorRejected';
        }
    }
    
    
    const mapping = viewMappings[tableKey];
    
    if (tableKey === 'coordinatorRejected') {
        return null;
    }
    
    const path = mapping[type] || mapping.default;
    return path;
}

// Show upload modal
function showUploadModal(reportId, reportTable, report = null) {
    
    const modal = document.getElementById("uploadModal");
    if (!modal) {
        alert("Error: Upload modal not found. Please check the HTML.");
        return;
    }
    
    modal.style.display = "block";
    
    const reportTitleSpan = document.getElementById("modalReportTitle");
    const fileCountSpan = document.getElementById("fileCount");
    
    // Debug: Check if elements exist
    
    // Type mapping for display
    const typeMap = {
        "cnacr": "CNACR",
        "coordinator_cnacr": "Community Needs Assessment Consolidated Report",
        "3ydp": "3 Year Development Plan",
        "pd_main": "Program Design",
        "mar_header": "Monthly Accomplishment Report",
        "program_monitoring_form": "Program Monitoring Form",
        "evaluation_reports": "Evaluation Sheet for Extension Services",
        "cert_appearance": "Certificate of Appearance",
        "reflection_paper": "Monthly Accomplishment Report- Reflection Paper",
        "narrative_report": "Monthly Accomplishment Report- Narrative Report"
        
    };
    
    const displayType = report ? getTypeName(report) : 'N/A';
    const displayTitle = report ? (report.title || 'N/A') : 'N/A';
    
    // Set report title with type
    if (reportTitleSpan) {
        reportTitleSpan.textContent = `${displayTitle} (${displayType})`;
    }
    
    // Initialize file count
    if (fileCountSpan) {
        fileCountSpan.textContent = `0/${MAX_FILES} files`;
        fileCountSpan.className = "file-count-ok";
    }
    
    // Clear file list
    const fileList = document.getElementById("fileList");
    if (fileList) {
        fileList.innerHTML = "<p class='loading'><i class='fas fa-spinner fa-spin'></i> Loading files...</p>";
    }
    
    // Reset file input
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.value = "";
        fileInput.disabled = false;
    }
    
    // Reset selected files list
    const selectedFilesList = document.getElementById("selectedFilesList");
    if (selectedFilesList) {
        selectedFilesList.innerHTML = "<p class='no-files'>No files selected</p>";
    }
    
    // Reset upload button
    const uploadBtn = document.querySelector(".upload-btn");
    if (uploadBtn) {
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Files';
        uploadBtn.onclick = uploadFiles;
        uploadBtn.style.display = "none";
        uploadBtn.disabled = false;
    }
    
    // Reset reupload mode
    clearReuploadMode();
    
    // Store current report info
    currentUploadReportId = reportId;
    currentUploadTable = reportTable;
    
    // Load existing files for this report
    loadReportFiles(reportId, reportTable);
}

// Close upload modal
function closeUploadModal() {
    const modal = document.getElementById("uploadModal");
    if (modal) {
        modal.style.display = "none";
    }
    currentUploadReportId = null;
    currentUploadTable = null;
    currentExistingFiles = [];
    
    // Clear reupload mode
    clearReuploadMode();
    
    // Clear the file input
    const fileInput = document.getElementById("fileInput");
    if (fileInput) fileInput.value = "";
    
    // Reset selected files list
    const selectedFilesList = document.getElementById("selectedFilesList");
    if (selectedFilesList) {
        selectedFilesList.innerHTML = "<p class='no-files'>No files selected</p>";
    }
    
    // Reset upload button
    const uploadBtn = document.querySelector(".upload-btn");
    if (uploadBtn) {
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Files';
        uploadBtn.onclick = uploadFiles;
        uploadBtn.style.display = "none";
        uploadBtn.disabled = false;
    }
}

// Handle file selection
function handleFileSelect(input) {
    
    const selectedFilesList = document.getElementById("selectedFilesList");
    if (!selectedFilesList) return;
    
    if (input.files && input.files.length > 0) {
        // Check if we're in reupload mode
        if (pendingReuploadFileId) {
            // Reupload mode - only allow one file
            if (input.files.length > 1) {
                showNotification("Please select only one file for replacement.", "warning");
                input.value = "";
                return;
            }
            
            const file = input.files[0];
            
            // Validate file type
            if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
                showNotification("Please select a PDF file.", "error");
                input.value = "";
                return;
            }
            
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showNotification("File size must be less than 10MB.", "error");
                input.value = "";
                return;
            }
            
            // Clear selected files list
            selectedFilesList.innerHTML = "";
            
            // Display selected file for reupload
            const fileItem = document.createElement("div");
            fileItem.className = "selected-file-item";
            fileItem.innerHTML = `
                <i class="fas fa-file-pdf"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                <span class="file-status">Ready to replace</span>
                <button type="button" class="remove-file-btn" onclick="clearReuploadMode()" title="Cancel replacement">
                    <i class="fas fa-times"></i>
                </button>
            `;
            selectedFilesList.appendChild(fileItem);
            
            // Make sure upload button is visible and configured for reupload
            const uploadBtn = document.querySelector(".upload-btn");
            if (uploadBtn) {
                uploadBtn.style.display = "inline-block";
                uploadBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Replace File';
                uploadBtn.onclick = function() { 
                    reuploadFile(pendingReuploadFileId, pendingReuploadFileName); 
                };
                uploadBtn.disabled = false;
            }
            
            return;
        }
        
        // Normal upload mode - clear previous selection
        selectedFilesList.innerHTML = "";
        
        // Check total files (existing + new)
        const totalFiles = currentExistingFiles.length + input.files.length;
        if (totalFiles > MAX_FILES) {
            showNotification(`You can only have up to ${MAX_FILES} files total. You already have ${currentExistingFiles.length} file(s).`, "warning");
            input.value = "";
            selectedFilesList.innerHTML = "<p class='no-files'>No files selected</p>";
            document.querySelector(".upload-btn").style.display = "none";
            return;
        }
        
        // Check each file
        let validFiles = true;
        for (let i = 0; i < input.files.length; i++) {
            const file = input.files[i];
            
            // Validate file type
            if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
                showNotification(`"${file.name}" is not a PDF file. Please select only PDF files.`, "error");
                input.value = "";
                validFiles = false;
                break;
            }
            
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showNotification(`"${file.name}" is larger than 10MB. Please select smaller files.`, "error");
                input.value = "";
                validFiles = false;
                break;
            }
        }
        
        if (!validFiles) {
            selectedFilesList.innerHTML = "<p class='no-files'>No files selected</p>";
            document.querySelector(".upload-btn").style.display = "none";
            return;
        }
        
        // Display all selected files
        for (let i = 0; i < input.files.length; i++) {
            const file = input.files[i];
            
            const fileItem = document.createElement("div");
            fileItem.className = "selected-file-item";
            fileItem.setAttribute("data-file-index", i);
            fileItem.innerHTML = `
                <i class="fas fa-file-pdf"></i>
                <span class="file-name">${escapeHtml(file.name)}</span>
                <span class="file-size">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                <span class="file-status">Pending</span>
                <button type="button" class="remove-file-btn" onclick="removeSelectedFile(${i})" title="Remove file">
                    <i class="fas fa-times"></i>
                </button>
            `;
            selectedFilesList.appendChild(fileItem);
        }
        
        // Show upload button
        const uploadBtn = document.querySelector(".upload-btn");
        if (uploadBtn) {
            uploadBtn.style.display = "inline-block";
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Files';
            uploadBtn.onclick = uploadFiles;
            uploadBtn.disabled = false;
        }
    } else {
        selectedFilesList.innerHTML = "<p class='no-files'>No files selected</p>";
        document.querySelector(".upload-btn").style.display = "none";
    }
}

// Remove selected file
function removeSelectedFile(index) {
    const fileInput = document.getElementById("fileInput");
    if (!fileInput) return;
    
    // Create new FileList without the removed file
    const dt = new DataTransfer();
    const files = fileInput.files;
    
    for (let i = 0; i < files.length; i++) {
        if (i !== index) {
            dt.items.add(files[i]);
        }
    }
    
    fileInput.files = dt.files;
    
    // Re-render the selected files list
    handleFileSelect(fileInput);
}

// Upload files
async function uploadFiles() {
    
    const fileInput = document.getElementById("fileInput");
    if (!fileInput) {
        showNotification("File input not found", "error");
        return;
    }
    
    const files = fileInput.files;
    
    if (files.length === 0) {
        showNotification("Please select files to upload.", "warning");
        return;
    }
    
    if (!currentUploadReportId || !currentUploadTable) {
        showNotification("Report information missing.", "error");
        return;
    }
    
    // Check if we'll exceed the maximum
    if (currentExistingFiles.length + files.length > MAX_FILES) {
        showNotification(`Cannot upload ${files.length} file(s). You can only have ${MAX_FILES} files total.`, "warning");
        return;
    }
    
    // Disable upload button and show progress
    const uploadBtn = document.querySelector(".upload-btn");
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    
    let successCount = 0;
    let failCount = 0;
    let failedFiles = [];
    
    // Upload files one by one
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("report_id", currentUploadReportId);
        formData.append("report_table", currentUploadTable);
        
        try {
            // Update status
            uploadBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading ${i+1}/${files.length}...`;
            
            const fileItems = document.querySelectorAll(".selected-file-item");
            if (fileItems[i]) {
                fileItems[i].querySelector(".file-status").innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
            }
            
            const response = await fetch("/SYSTEM_VERSION_!/admin/ReportManagement/php/upload.php", {
                method: "POST",
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                successCount++;
                if (fileItems[i]) {
                    fileItems[i].className = "selected-file-item success";
                    fileItems[i].querySelector(".file-status").innerHTML = '<i class="fas fa-check-circle"></i> Uploaded';
                }
            } else {
                failCount++;
                failedFiles.push(file.name);
                if (fileItems[i]) {
                    fileItems[i].className = "selected-file-item error";
                    fileItems[i].querySelector(".file-status").innerHTML = `<i class="fas fa-exclamation-circle"></i> Failed: ${result.error || 'Error'}`;
                }
            }
        } catch (error) {
            failCount++;
            failedFiles.push(file.name);
            const fileItems = document.querySelectorAll(".selected-file-item");
            if (fileItems[i]) {
                fileItems[i].className = "selected-file-item error";
                fileItems[i].querySelector(".file-status").innerHTML = '<i class="fas fa-exclamation-circle"></i> Upload failed';
            }
        }
    }
    
    // Show summary
    if (successCount > 0) {
        showNotification(`${successCount} out of ${files.length} file(s) uploaded successfully!`, "success");
        // Refresh file list
        await loadReportFiles(currentUploadReportId, currentUploadTable);
        // Clear file input and selected files list
        fileInput.value = "";
        document.getElementById("selectedFilesList").innerHTML = "<p class='no-files'>No files selected</p>";
    } else {
        showNotification("All files failed to upload. Please try again.", "error");
    }
    
    // Re-enable upload button
    uploadBtn.disabled = false;
    uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Files';
    uploadBtn.style.display = failCount > 0 && successCount === 0 ? "inline-block" : "none";
}

// Reupload file (replace existing)
async function reuploadFile(fileId, oldFileName) {
    
    const fileInput = document.getElementById("fileInput");
    if (!fileInput) {
        showNotification("File input not found", "error");
        return;
    }
    
    // Check if a file is selected
    if (fileInput.files.length === 0) {
        showNotification("Please select a file to replace the current one.", "warning");
        return;
    }
    
    if (fileInput.files.length > 1) {
        showNotification("Please select only one file for replacement.", "warning");
        return;
    }
    
    const file = fileInput.files[0];
    
    // Validate file type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
        showNotification("Please select a PDF file.", "error");
        fileInput.value = "";
        return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showNotification("File size must be less than 10MB.", "error");
        fileInput.value = "";
        return;
    }
    
    if (!confirm(`Replace "${oldFileName}" with "${file.name}"? This action cannot be undone.`)) {
        return;
    }
    
    // Disable upload button and show loading state
    const uploadBtn = document.querySelector(".upload-btn");
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Replacing...';
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("report_id", currentUploadReportId);
    formData.append("report_table", currentUploadTable);
    formData.append("existing_file_id", fileId);
    formData.append("replace", "true");
    
    try {
        const response = await fetch("/SYSTEM_VERSION_!/admin/ReportManagement/php/upload.php", {
            method: "POST",
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`File replaced successfully!\nNew file: ${file.name}`, "success");
            
            // Clear reupload mode
            clearReuploadMode();
            
            // Refresh file list
            await loadReportFiles(currentUploadReportId, currentUploadTable);
            
            // Clear file input and selected files list
            fileInput.value = "";
            const selectedFilesList = document.getElementById("selectedFilesList");
            if (selectedFilesList) {
                selectedFilesList.innerHTML = "<p class='no-files'>No files selected</p>";
            }
            
            // Reset upload button
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Files';
            uploadBtn.onclick = uploadFiles;
            uploadBtn.style.display = "none";
            
        } else {
            showNotification("Replacement failed: " + (result.error || "Unknown error"), "error");
        }
    } catch (error) {
        showNotification("Error replacing file. Please try again.", "error");
    } finally {
        uploadBtn.disabled = false;
    }
}

// Clear reupload mode
function clearReuploadMode() {
    
    // Reset pending reupload variables
    pendingReuploadFileId = null;
    pendingReuploadFileName = null;
    
    // Remove highlight from all file items
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('reupload-target');
    });
    
    // Clear selected files list if it contains reupload mode message
    const selectedFilesList = document.getElementById("selectedFilesList");
    if (selectedFilesList && selectedFilesList.innerHTML.includes('Reupload mode')) {
        selectedFilesList.innerHTML = "<p class='no-files'>No files selected</p>";
    }
    
    // Reset file input
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.value = "";
        fileInput.disabled = false;
    }
    
    // Reset upload button
    const uploadBtn = document.querySelector(".upload-btn");
    if (uploadBtn) {
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Selected Files';
        uploadBtn.onclick = uploadFiles;
        uploadBtn.style.display = "none";
        uploadBtn.disabled = false;
    }
    
    // Remove reupload mode message from file list if exists
    const reuploadMessage = document.querySelector('.reupload-active-message');
    if (reuploadMessage) {
        reuploadMessage.remove();
    }
}

// Load report files
async function loadReportFiles(reportId, reportTable) {
    
    const fileListDiv = document.getElementById("fileList");
    if (!fileListDiv) return;
    
    fileListDiv.innerHTML = "<p class='loading'><i class='fas fa-spinner fa-spin'></i> Loading files...</p>";
    
    try {
        const url = `/SYSTEM_VERSION_!/admin/ReportManagement/php/get_report_files.php?report_id=${reportId}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            currentExistingFiles = result.files || [];
            updateFileCount();
            
            if (currentExistingFiles.length > 0) {
                let html = "<div class='files-grid'>";
                
                currentExistingFiles.forEach(file => {
                    // Format date
                    let uploadDate = 'Unknown date';
                    if (file.uploaded_at) {
                        try {
                            uploadDate = new Date(file.uploaded_at).toLocaleString();
                        } catch (e) {
                        }
                    }
                    
                    // Format file size
                    let fileSize = '';
                    if (file.file_size) {
                        fileSize = ` (${(file.file_size / 1024 / 1024).toFixed(2)} MB)`;
                    }
                    
                    // Build file path for viewing
                    const viewPath = file.file_path;
                    
                    html += `
                        <div class="file-item" id="file-${file.id}">
                            <i class="fas fa-file-pdf"></i>
                            <div class="file-details">
                                <a href="${escapeHtml(viewPath)}" target="_blank" class="file-name">${escapeHtml(file.file_name)}${fileSize}</a>
                                <span class="file-date">Uploaded: ${escapeHtml(uploadDate)}</span>
                            </div>
                            <button onclick="prepareReupload(${file.id}, '${escapeHtml(file.file_name).replace(/'/g, "\\'")}')" class="reupload-btn" title="Replace this file">
                                <i class="fas fa-sync-alt"></i> Replace
                            </button>
                        </div>
                    `;
                });
                html += "</div>";
                
                // Show remaining slots
                const remaining = MAX_FILES - currentExistingFiles.length;
                if (remaining > 0) {
                    html += `<p class='remaining-slots'><i class='fas fa-info-circle'></i> You can upload ${remaining} more file(s). Maximum ${MAX_FILES} files total.</p>`;
                    // Enable file input
                    const fileInput = document.getElementById("fileInput");
                    if (fileInput) fileInput.disabled = false;
                } else {
                    html += `<p class='max-files-reached'><i class='fas fa-exclamation-triangle'></i> Maximum files (${MAX_FILES}) reached. Replace existing files to update them.</p>`;
                    // Disable file input if max reached
                    const fileInput = document.getElementById("fileInput");
                    if (fileInput) fileInput.disabled = true;
                }
                
                fileListDiv.innerHTML = html;
            } else {
                fileListDiv.innerHTML = `
                    <p class='no-files'>No files uploaded yet.</p>
                    <p class='remaining-slots'><i class='fas fa-info-circle'></i> You can upload up to ${MAX_FILES} PDF files.</p>
                `;
                // Enable file input
                const fileInput = document.getElementById("fileInput");
                if (fileInput) fileInput.disabled = false;
            }
        } else {
            fileListDiv.innerHTML = `<p class='error'>Error: ${escapeHtml(result.error || 'Failed to load files')}</p>`;
        }
    } catch (error) {
        fileListDiv.innerHTML = "<p class='error'>Error loading files. Please try again.</p>";
    }
}

// Update file count display
function updateFileCount() {
    const fileCount = document.getElementById("fileCount");
    if (fileCount) {
        const remaining = MAX_FILES - currentExistingFiles.length;
        fileCount.textContent = `${currentExistingFiles.length}/${MAX_FILES} files`;
        fileCount.className = remaining > 0 ? "file-count-ok" : "file-count-full";
    }
}

// Prepare for reupload
function prepareReupload(fileId, fileName) {
    
    // Clear any existing reupload mode first
    clearReuploadMode();
    
    // Set pending reupload variables
    pendingReuploadFileId = fileId;
    pendingReuploadFileName = fileName;
    
    // Highlight the file to be replaced
    const fileElement = document.getElementById(`file-${fileId}`);
    if (fileElement) {
        fileElement.classList.add('reupload-target');
        fileElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    
    // Show reupload mode message in selected files list
    const selectedFilesList = document.getElementById("selectedFilesList");
    if (selectedFilesList) {
        selectedFilesList.innerHTML = `<div class='reupload-mode'>
            <i class='fas fa-info-circle'></i> 
            <strong>Reupload mode active:</strong> Select a PDF file to replace "${escapeHtml(fileName)}"
            <br><small style="color: #666;">Maximum file size: 10MB</small>
            <button type="button" class="cancel-reupload-btn" onclick="clearReuploadMode()" style="margin-left: 10px; padding: 2px 8px; background: #ff9800; color: white; border: none; border-radius: 3px; cursor: pointer;">
                Cancel
            </button>
        </div>`;
    }
    
    // Update upload button for reupload mode
    const uploadBtn = document.querySelector(".upload-btn");
    if (uploadBtn) {
        uploadBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Replace File';
        uploadBtn.onclick = function() { 
            reuploadFile(pendingReuploadFileId, pendingReuploadFileName); 
        };
        uploadBtn.style.display = "inline-block";
        uploadBtn.disabled = false;
    }
    
    // Enable and focus file input
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.value = "";
        fileInput.disabled = false;
        fileInput.focus();
    }
    
    // Add a message in the file list area
    const fileListDiv = document.getElementById("fileList");
    if (fileListDiv) {
        // Remove existing message if any
        const existingMessage = fileListDiv.querySelector('.reupload-active-message');
        if (existingMessage) existingMessage.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'reupload-active-message';
        messageDiv.style.cssText = 'background: #fff3e0; padding: 10px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #ff9800;';
        messageDiv.innerHTML = '<i class="fas fa-sync-alt"></i> Ready to replace file. Select a new PDF and click "Replace File".';
        fileListDiv.insertBefore(messageDiv, fileListDiv.firstChild);
    }
    
    showNotification(`Ready to replace "${fileName}". Select a new PDF file.`, "info");
}

// Show notification
function showNotification(message, type = "info") {
    
    // Check if notification container exists, create if not
    let container = document.getElementById("notification-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "notification-container";
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(container);
    }
    
    // Create notification
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'};
        color: white;
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
        min-width: 300px;
    `;
    
    // Add icon
    const icon = document.createElement("i");
    icon.className = `fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}`;
    notification.appendChild(icon);
    
    // Add message
    const text = document.createElement("span");
    text.textContent = message;
    notification.appendChild(text);
    
    // Add close button
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: auto;
        padding: 0 5px;
    `;
    closeBtn.onclick = () => notification.remove();
    notification.appendChild(closeBtn);
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = "slideOut 0.3s ease";
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add CSS animations and styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        overflow-y: auto;
    }
    
    .modal-content {
        background-color: #fff;
        margin: 50px auto;
        padding: 0;
        width: 90%;
        max-width: 800px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }
    
    .modal-header {
        padding: 20px;
        background-color: #2e7d32;
        color: white;
        border-radius: 8px 8px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
    }
    
    .modal-header .close {
        color: white;
        font-size: 28px;
        font-weight: bold;
        cursor: pointer;
    }
    
    .modal-header .close:hover {
        color: #ffeb3b;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .file-item {
        display: flex;
        align-items: center;
        padding: 10px;
        margin: 5px 0;
        background: #f5f5f5;
        border-radius: 4px;
        transition: all 0.3s ease;
    }
    
    .file-item.reupload-target {
        background-color: #fff3e0;
        border-left: 4px solid #ff9800;
    }
    
    .reupload-btn {
        background: #ff9800;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        margin-left: auto;
        transition: background 0.3s ease;
    }
    
    .reupload-btn:hover {
        background: #f57c00;
    }
    
    .reupload-mode {
        background: #fff3e0;
        padding: 12px;
        border-radius: 5px;
        border-left: 4px solid #ff9800;
        margin: 10px 0;
    }
    
    .remove-file-btn {
        background: #f44336;
        color: white;
        border: none;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 12px;
        cursor: pointer;
        margin-left: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    
    .remove-file-btn:hover {
        background: #d32f2f;
    }
    
    .selected-file-item {
        display: flex;
        align-items: center;
        padding: 8px;
        margin: 5px 0;
        background: #e3f2fd;
        border-radius: 4px;
    }
    
    .selected-file-item.success {
        background: #c8e6c9;
    }
    
    .selected-file-item.error {
        background: #ffcdd2;
    }
    
    .file-status {
        margin-left: 10px;
        font-size: 12px;
    }
    
    .upload-btn {
        background: #2e7d32;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 10px;
    }
    
    .upload-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
    
    // Detect page type after DOM is ready
    isAdminPage = !!document.getElementById("adminTableBody");
    isCoordinatorPage = !!document.getElementById("coordinatorapprovedTableBody") || !!document.getElementById("coordinatorrejectedTableBody");
    
    
    // Check if modal exists
    debugElement("uploadModal");
    debugElement("fileInput");
    debugElement("fileList");
    
    // Load reports
    loadReports();
    
    // Add file input change event listener
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.addEventListener("change", function() {
            handleFileSelect(this);
        });
    }
});

// Make functions available globally
window.closeUploadModal = closeUploadModal;
window.handleFileSelect = handleFileSelect;
window.prepareReupload = prepareReupload;
window.reuploadFile = reuploadFile;
window.removeSelectedFile = removeSelectedFile;
window.showNotification = showNotification;
window.clearReuploadMode = clearReuploadMode;
window.showAllSectionReports = showAllSectionReports;
