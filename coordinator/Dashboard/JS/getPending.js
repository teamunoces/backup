let reportData = {
    pending: {}
};

const DEFAULT_REPORT_LIMIT = 5;
const showAllState = {
    pending: false
};

const isDebug = new URLSearchParams(window.location.search).has("debug");
const debugLog = (...args) => {
    if (isDebug) {
        console.log(...args);
    }
};
const debugWarn = (...args) => {
    if (isDebug) {
        console.warn(...args);
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

const reviewPages = {
    "community needs assessment consolidated report": "./review/cnacr/cnacrreview.php",
    "3-year development plan": "./review/3ydp/3ydpreview.php",
    "program design": "./review/programdesign/pdview.php",
    "departmental planned initiative report": "./review/dpir/dpirreview.php",
    "monthly accomplishment report": "./review/monthlyaccomplishment/monthlyaccomplishmentreview.php",
    "evaluation sheet for extension services": "./review/evaluation/evaluationreview.php",
    "Certificate of Appearance" : "./review/coa/coareview.php",
    "Monthly Accomplishment Report- Reflection Paper" : "./review/reflection/reflectionreview.php",
    "Monthly Accomplishment Report- Narrative Report" : "./review/narrative/narrativeview.php"



};

async function loadReports(status, tableBodyId) {
    try {
        debugLog(`Loading reports with status: ${status}`);
        
        const response = await fetch(`/SYSTEM_VERSION_!/coordinator/Dashboard/PHP/getPending.php?status=${encodeURIComponent(status)}`);
        const data = await response.json();
        
        debugLog("Raw response from server:", data);
        
        if (data.error) {
            debugWarn("Server Error:", data.error);
            alert("Server Error: " + data.error);
            return;
        }
        
        // Check debug info
        if (data._debug) {
            debugLog("Debug info:", data._debug);
            if (data._debug.total_records_found === 0) {
                debugWarn("No records found. Check debug info above.");
            }
        }
        
        // Check if there's a message
        if (data._message) {
            debugLog("Server message:", data._message);
        }
        
        reportData[status] = data;
        
        let combined = [];
        let tablesWithData = [];
        
        // Combine all reports from all tables
        Object.entries(data).forEach(([tableName, tableData]) => {
            // Skip debug and message keys
            if (tableName !== '_debug' && tableName !== '_message' && Array.isArray(tableData)) {
                debugLog(`Table ${tableName}: ${tableData.length} records`);
                if (tableData.length > 0) {
                    tablesWithData.push(tableName);
                    debugLog(`Sample record from ${tableName}:`, tableData[0]);
                }
                combined = combined.concat(tableData);
            }
        });
        
        debugLog(`Tables with data: ${tablesWithData.join(', ') || 'none'}`);
        debugLog(`Total combined records: ${combined.length}`);
        
        if (combined.length === 0) {
            debugLog("No reports to display. Check if:");
            debugLog("1. The user_id in session matches records in database");
            debugLog("2. The status filter is correct");
            debugLog("3. The table columns match the SELECT query");
        }
        
        renderDashboardReports(status, tableBodyId);
        
    } catch (error) {
        debugWarn("Connection Error:", error);
        alert("Error loading reports: " + error.message);
    }
}

function getCombinedReports(status) {
    const dataObj = reportData[status] || {};
    let combined = [];

    Object.entries(dataObj).forEach(([tableName, tableData]) => {
        if (tableName !== '_debug' && tableName !== '_message' && Array.isArray(tableData)) {
            combined = combined.concat(tableData);
        }
    });

    return combined;
}

function getReportTime(report) {
    if (!report || !report.date) {
        return 0;
    }

    const dateMatch = String(report.date).match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}:\d{2}))?/);
    const normalizedDate = dateMatch
        ? `${dateMatch[1]}T${dateMatch[2] || "00:00:00"}`
        : String(report.date).replace(' ', 'T');
    const parsedDate = new Date(normalizedDate);

    return Number.isNaN(parsedDate.getTime()) ? 0 : parsedDate.getTime();
}

function getDateOnly(reportDate) {
    if (!reportDate) {
        return "";
    }

    return String(reportDate).split(/[ T]/)[0];
}

function getFilterValues() {
    return {
        type: (document.getElementById("pendingTypeFilter")?.value || "All").toLowerCase(),
        dateFrom: document.getElementById("pendingDateFrom")?.value || "",
        dateTo: document.getElementById("pendingDateTo")?.value || ""
    };
}

function filterReports(reports) {
    const { type, dateFrom, dateTo } = getFilterValues();

    return reports.filter(report => {
        const reportType = (report.type || "").toLowerCase();
        const reportDate = getDateOnly(report.date);
        const matchesType = type === "all" || reportType === type;
        const matchesFrom = !dateFrom || (reportDate && reportDate >= dateFrom);
        const matchesTo = !dateTo || (reportDate && reportDate <= dateTo);

        return matchesType && matchesFrom && matchesTo;
    });
}

function hasActiveFilter() {
    const { type, dateFrom, dateTo } = getFilterValues();
    return type !== "all" || dateFrom !== "" || dateTo !== "";
}

function renderDashboardReports(status, tableBodyId) {
    const reports = getCombinedReports(status)
        .sort((first, second) => getReportTime(second) - getReportTime(first));
    const filteredReports = filterReports(reports);
    const shouldLimit = !showAllState[status] && !hasActiveFilter();
    const visibleReports = shouldLimit
        ? filteredReports.slice(0, DEFAULT_REPORT_LIMIT)
        : filteredReports;

    renderTable(visibleReports, tableBodyId, status);
    updateShowAllButton(status);
}

function updateShowAllButton(status) {
    const showAllButton = document.getElementById(`${status}ShowAllBtn`);

    if (showAllButton) {
        showAllButton.textContent = showAllState[status] ? "Show Latest" : "Show All";
    }
}

function renderTable(data, tableBodyId, status) {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) {
        debugWarn(`Table body with id '${tableBodyId}' not found`);
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
        tableBody.innerHTML =
            `<tr>
                <td colspan="6" class="no-reports">No pending reports found.</td>
            </tr>`;
        return;
    }

    debugLog(`Rendering ${data.length} reports`);
    
    tableBody.innerHTML = data.map(report => {
        debugLog("Rendering report:", report);
        
        return `
        <tr>
            <td>${report.type || 'N/A'}</td>
            <td>${report.title || 'N/A'}</td>
            <td>${report.name || 'N/A'}</td>
            <td>${report.department || 'N/A'}</td>
            <td>${report.date || 'N/A'}</td>
            <td>${report.status || 'N/A'}</td>
          
        </tr>
    `}).join('');
}

function applyFilter(status, tableBodyId) {
    showAllState[status] = false;
    renderDashboardReports(status, tableBodyId);
}

function showAllReports(status, tableBodyId) {
    const typeFilter = document.getElementById("pendingTypeFilter");
    const dateFromFilter = document.getElementById("pendingDateFrom");
    const dateToFilter = document.getElementById("pendingDateTo");
    const shouldShowAll = !showAllState[status];

    if (typeFilter) {
        typeFilter.value = "All";
    }

    if (dateFromFilter) {
        dateFromFilter.value = "";
    }

    if (dateToFilter) {
        dateToFilter.value = "";
    }

    showAllState[status] = shouldShowAll;
    renderDashboardReports(status, tableBodyId);
}

function viewReport(reportId, reportType, status) {
    const typeKey = reportType.toLowerCase().trim();
    
    if (reviewPages.hasOwnProperty(typeKey)) {
        const baseUrl = reviewPages[typeKey];
        const url = `${baseUrl}?id=${encodeURIComponent(reportId)}&status=${encodeURIComponent(status)}&page=pending`;
        window.location.href = url;
    } else {
        debugWarn(`No review page found for report type: ${reportType}`);
        alert(`Review page not configured for report type: ${reportType}`);
    }
}

onDashboardReady(() => {
    debugLog("DOM loaded, loading reports...");
    loadReports("pending", "pendingTableBody");
}, "#pendingTableBody");
