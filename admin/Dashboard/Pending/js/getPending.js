let reportData = { 'pending': {}, 'need fix': {} };
const allowedStatuses = new Set(['pending', 'need fix']);

const reviewPages = {
    "community needs assessment consolidated report": "/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/coordinator/cnacr_coordinator.php",
    "3-year development plan": "/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/3ydp/3ydpreview.php",
    "program design": "/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/programdesign/pdview.php",
    "departmental planned initiative report": "/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/dpir/dpirreview.php",
    "monthly accomplishment report": "/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/monthlyreport/mar.php",
    "program monitoring form": "/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/monitoring/monitoringreview.php",
    "evaluation sheet for extension services": "/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/evaluation/evaluationreview.php",
    "certificate of appearance" : "/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/coa/coareview.php",
    "monthly accomplishment report- reflection paper" : "/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/reflection/reflectionreview.php",
    "monthly accomplishment report- narrative report" : "/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/narrative/narrativeview.php"

};

async function loadReports(status, tableBodyId) {
    status = normalizeStatus(status);
    if (!status) return;

    try {
        const response = await fetch(`/SYSTEM_VERSION_!/admin/Dashboard/Pending/php/getPending.php?status=${encodeURIComponent(status)}`);
        const rawText = await response.text();

        try {
            const data = JSON.parse(rawText);
            reportData[status] = data;

            let combined = [];
            for (let table in data) {
                if (Array.isArray(data[table])) combined = combined.concat(data[table]);
            }

            renderTable(sortReportsByDate(combined), tableBodyId, status);

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

    data = Array.isArray(data)
        ? data.filter(report => {
            const hasType = String(report.type || '').trim() !== '';
            const hasDepartment = String(report.department || '').trim() !== '';
            return hasType
                && hasDepartment
                && normalizeStatus(report.status || status) === status;
        })
        : [];

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
                <i class="fas fa-eye ${status === 'need fix' ? 'red-text' : 'green-text'}" style="cursor:pointer" 
                onclick="viewReport('${report.id || ''}', '${report.type || ''}', '${status}')"></i>
            </td>
        </tr>
    `).join('');
}

function applyFilter(status, tableBodyId) {
    status = normalizeStatus(status);
    if (!status) return;

    const typeFilterId = status === 'pending' ? 'pendingTypeFilter' : 'needFixTypeFilter';
    const departmentFilterId = status === 'pending' ? 'pendingDepartmentFilter' : 'needFixDepartmentFilter';
    const selectedType = normalizeFilterValue(document.getElementById(typeFilterId).value);
    const selectedDepartment = normalizeFilterValue(document.getElementById(departmentFilterId).value);

    let combined = [];
    const dataObj = reportData[status] || {};
    for (let table in dataObj) {
        if (Array.isArray(dataObj[table])) combined = combined.concat(dataObj[table]);
    }

    const filtered = combined.filter(report => {
        const matchesType = selectedType === 'all'
            || normalizeFilterValue(report.type) === selectedType;
        const matchesDepartment = selectedDepartment === 'all'
            || normalizeFilterValue(report.department) === selectedDepartment;

        return matchesType && matchesDepartment;
    });

    renderTable(sortReportsByDate(filtered), tableBodyId, status);
}

function clearFilters(status, tableBodyId) {
    status = normalizeStatus(status);
    if (!status) return;

    const typeFilterId = status === 'pending' ? 'pendingTypeFilter' : 'needFixTypeFilter';
    const departmentFilterId = status === 'pending' ? 'pendingDepartmentFilter' : 'needFixDepartmentFilter';

    document.getElementById(typeFilterId).value = 'All';
    document.getElementById(departmentFilterId).value = 'All';
    applyFilter(status, tableBodyId);
}

function normalizeFilterValue(value) {
    return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function sortReportsByDate(reports) {
    if (!Array.isArray(reports)) return [];

    return [...reports].sort((a, b) => {
        const dateA = parseReportDate(a.date);
        const dateB = parseReportDate(b.date);

        if (dateA !== dateB) return dateB - dateA;
        return Number(b.id || 0) - Number(a.id || 0);
    });
}

function parseReportDate(value) {
    const timestamp = Date.parse(String(value || '').replace(' ', 'T'));
    return Number.isNaN(timestamp) ? 0 : timestamp;
}

function viewReport(id, type, status) {
    status = normalizeStatus(status);
    if (!status) return;

    const typeLower = (type || '').toLowerCase();

    if (status === 'need fix') {
        if (typeLower === '3-year development plan') {
            window.location.href = `/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/needfix/3ydpneedfix/3ydpneedfix.html?id=${id}`;
            return;
        } 
        if (typeLower === 'community needs assessment consolidated report') {
            window.location.href = `/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/needfix/cnacrneedfix/cnacrview.php?id=${id}`;
            return;
        }
        if (typeLower === 'program design') {
            window.location.href = `/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/needfix/pdneedfix/pdneedfix.html?id=${id}`;
            return;
        }
        if (typeLower === 'departmental planned initiative report') {
            window.location.href = `/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/needfix/dpirneedfix/needfix.html?id=${id}`;
            return;
        }
        
        if (typeLower === "monthly accomplishment report") {
            window.location.href = `/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/needfix/marneedfix/marneedfix.php?id=${id}`;
            return;
        }
        if (typeLower === "program monitoring form") {
            window.location.href = `/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/needfix/monitoringneedfix/pmfneedview.php?id=${id}`;
            return;
        }
        if (typeLower === "evaluation sheet for extension services") {
            window.location.href = `/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/needfix/evaluationneedfix/evaluationneedfix.php?id=${id}`;
            return;
        }
        if (typeLower === "certificate of appearance".toLowerCase()) {
            window.location.href = `/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/needfix/coaneedfix/coaneedfix.php?id=${id}`;
            return;
        }   
        if (typeLower === "monthly accomplishment report- reflection paper".toLowerCase()) {
            window.location.href = `/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/needfix/reflectionneedfix/reflectionneedfix.php?id=${id}`;
            return;
        }
        if (typeLower === "monthly accomplishment report- narrative report".toLowerCase()) {
            window.location.href = `/SYSTEM_VERSION_!/admin/Dashboard/Pending/review/needfix/narrativeneedfix/narrativeneedfix.php?id=${id}`;
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

function normalizeStatus(status) {
    const normalized = String(status || '').trim().toLowerCase();
    return allowedStatuses.has(normalized) ? normalized : '';
}

document.addEventListener('DOMContentLoaded', () => {
    loadReports('pending', 'pendingTableBody');
    loadReports('need fix', 'needFixesTableBody');
});
