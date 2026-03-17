let reportData = {
    pending: {}
};

const reviewPages = {
    "community needs assessment consolidated report": "./review/cnacr/cnacrreview.php",
    "3-year development plan": "./review/3ydp/3ydpreview.php",
    "program design": "./review/programdesign/pdview.php",
    "departmental planned initiative report": "./review/dpir/dpirreview.php",
    "monthly accomplishment report": "./review/monthlyaccomplishment/monthlyaccomplishmentreview.php"
};

async function loadReports(status, tableBodyId) {
    try {
        console.log(`Loading reports with status: ${status}`);
        
        const response = await fetch(`./PHP/getPending.php?status=${encodeURIComponent(status)}`);
        const data = await response.json();
        
        console.log("Raw response from server:", data);
        
        if (data.error) {
            console.error("Server Error:", data.error);
            alert("Server Error: " + data.error);
            return;
        }
        
        // Check debug info
        if (data._debug) {
            console.log("Debug info:", data._debug);
            if (data._debug.total_records_found === 0) {
                console.warn("No records found. Check debug info above.");
            }
        }
        
        // Check if there's a message
        if (data._message) {
            console.log("Server message:", data._message);
        }
        
        reportData[status] = data;
        
        let combined = [];
        let tablesWithData = [];
        
        // Combine all reports from all tables
        Object.entries(data).forEach(([tableName, tableData]) => {
            // Skip debug and message keys
            if (tableName !== '_debug' && tableName !== '_message' && Array.isArray(tableData)) {
                console.log(`Table ${tableName}: ${tableData.length} records`);
                if (tableData.length > 0) {
                    tablesWithData.push(tableName);
                    // Log the first record to see its structure
                    console.log(`Sample record from ${tableName}:`, tableData[0]);
                }
                combined = combined.concat(tableData);
            }
        });
        
        console.log(`Tables with data: ${tablesWithData.join(', ') || 'none'}`);
        console.log(`Total combined records: ${combined.length}`);
        
        if (combined.length === 0) {
            console.log("No reports to display. Check if:");
            console.log("1. The user_id in session matches records in database");
            console.log("2. The status filter is correct");
            console.log("3. The table columns match the SELECT query");
        }
        
        renderTable(combined, tableBodyId, status);
        
    } catch (error) {
        console.error("Connection Error:", error);
        alert("Error loading reports: " + error.message);
    }
}

function renderTable(data, tableBodyId, status) {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) {
        console.error(`Table body with id '${tableBodyId}' not found`);
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
        tableBody.innerHTML =
            `<tr>
                <td colspan="7" class="no-reports">No pending reports found for user ID: ${data._debug?.user_id_from_session || 'unknown'}</td>
            </tr>`;
        return;
    }

    console.log(`Rendering ${data.length} reports`);
    
    tableBody.innerHTML = data.map(report => {
        // Debug each report
        console.log("Rendering report:", report);
        
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
    const filterId = "pendingTypeFilter";
    
    const selected = document
        .getElementById(filterId)
        .value
        .toLowerCase();

    let combined = [];

    const dataObj = reportData[status] || {};

    for (let table in dataObj) {
        if (table !== '_debug' && table !== '_message' && Array.isArray(dataObj[table])) {
            combined = combined.concat(dataObj[table]);
        }
    }

    const filtered =
        selected === "all"
            ? combined
            : combined.filter(r =>
                (r.type || "").toLowerCase() === selected
            );

    renderTable(filtered, tableBodyId, status);
}

function viewReport(reportId, reportType, status) {
    const typeKey = reportType.toLowerCase().trim();
    
    if (reviewPages.hasOwnProperty(typeKey)) {
        const baseUrl = reviewPages[typeKey];
        const url = `${baseUrl}?id=${encodeURIComponent(reportId)}&status=${encodeURIComponent(status)}&page=pending`;
        window.location.href = url;
    } else {
        console.error(`No review page found for report type: ${reportType}`);
        alert(`Review page not configured for report type: ${reportType}`);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, loading reports...");
    loadReports("pending", "pendingTableBody");
});
