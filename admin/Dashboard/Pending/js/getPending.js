let reportData = { 'pending': {}, 'need fix': {} };

const reviewPages = {
    "community needs assessment consolidated report": "./review/cnacr/coordinator/cnacr_coordinator.php",
    "3-year development plan": "./review/3ydp/3ydpreview.php",
    "program design": "./review/programdesign/pdview.php",
    "departmental planned initiative report": "./review/dpir/dpirreview.php",
    "monthly accomplishment report": "./review/monthlyreport/mar.php"
};

async function loadReports(status, tableBodyId) {
    try {
        const response = await fetch(`./php/getPending.php?status=${status}`);
        const rawText = await response.text();

        try {
            const data = JSON.parse(rawText);
            reportData[status] = data;

            let combined = [];
            for (let table in data) {
                if (Array.isArray(data[table])) combined = combined.concat(data[table]);
            }

            renderTable(combined, tableBodyId, status);

        } catch (e) {
            console.error("PHP Error:", rawText);
        }

    } catch (e) {
        console.error('Connection Error:', e);
    }
}

function renderTable(data, tableBodyId, status) {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return;

    if (!Array.isArray(data) || data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="no-reports">No reports found.</td></tr>`;
        return;
    }

    tableBody.innerHTML = data.map(report => `
        <tr>
            <td>${report.type || 'N/A'}</td>
            <td>${report.title || 'N/A'}</td>
            <td>${report.name || 'N/A'}</td>
            <td>${report.department || 'N/A'}</td>
            <td>${report.date || 'N/A'}</td>
            <td>
                <i class="fas fa-eye green-text" style="cursor:pointer" 
                onclick="viewReport('${report.id || ''}', '${report.type || ''}', '${status}')"></i>
            </td>
        </tr>
    `).join('');
}

function applyFilter(status, tableBodyId) {
    const filterId = status === 'pending' ? 'pendingTypeFilter' : 'needFixTypeFilter';
    const val = document.getElementById(filterId).value.toLowerCase();

    let combined = [];
    const dataObj = reportData[status] || {};
    for (let table in dataObj) {
        if (Array.isArray(dataObj[table])) combined = combined.concat(dataObj[table]);
    }

    const filtered = val === "all" ? combined :
        combined.filter(r => (r.type || '').toLowerCase() === val);

    renderTable(filtered, tableBodyId, status);
}

function viewReport(id, type, status) {
    const typeLower = (type || '').toLowerCase();

    if (status === 'need fix') {
        if (typeLower === '3-year development plan') {
            window.location.href = `./review/needfix/3ydpneedfix/needfix.html?id=${id}`;
            return;
        } 
        if (typeLower === 'community needs assessment consolidated report') {
            window.location.href = `./review/needfix/cnacrneedfix/needfix.html?id=${id}`;
            return;
        }
        if (typeLower === 'program design') {
            window.location.href = `./review/needfix/pdneedfix/needfix.html?id=${id}`;
            return;
        }
        if (typeLower === 'departmental planned initiative report') {
            window.location.href = `./review/needfix/dpirneedfix/needfix.html?id=${id}`;
            return;
        }
        
        if (typeLower === "monthly accomplishment report") {
            window.location.href = `./review/needfix/monthlyaccomplishmentneedfix/needfix.html?id=${id}`;
            return;
        }
    }

    const page = reviewPages[typeLower];
    if (page) {
        window.location.href = `${page}?id=${id}&status=${status}`;
    } else {
        alert("Review page not found");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadReports('pending', 'pendingTableBody');
    loadReports('need fix', 'needFixesTableBody');
});