// Global variables
let months = [];
let departments = [];
let documents = [];
let docKeys = [];
let submissionData = {};
let currentFilter = "CCIS";

// Fetch data from PHP backend
async function fetchSubmissionData() {
    try {
        const response = await fetch('complete_monitoring.php');
        const data = await response.json();
        
           
        if (data.error) {
            console.error(data.error);
            return;
        }
        
        // Assign fetched data to global variables
        months = data.months;
        departments = data.departments;
        documents = data.documents;
        docKeys = data.docKeys;
        submissionData = data.submissionData;
        
        // Set default filter to first department
        if (departments.length > 0) {
            currentFilter = departments[0];
        }
        
        // Initialize UI
        createButtonBar();
        renderTable();
        
    } catch (error) {
        console.error('Error fetching submission data:', error);
    }
}

function showError(message) {
    const tableWrapper = document.getElementById('tableWrapper');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'color: red; padding: 20px; text-align: center; background: #ffebee; border-radius: 4px; margin: 20px;';
    errorDiv.textContent = message;
    tableWrapper.parentNode.insertBefore(errorDiv, tableWrapper);
    
    // Remove error after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
}

function renderTable() {
    const thead = document.getElementById("tableHeader");
    const tbody = document.getElementById("tableBody");

    if (!submissionData[currentFilter]) {
        console.error(`No data found for department: ${currentFilter}`);
        return;
    }

    let headerHtml = `<tr><th>Document / Report</th>`;
    headerHtml += `<th colspan="12" class="dept-header">${currentFilter}</th>`;
    headerHtml += `</tr>`;

    // Empty header row for month labels
    headerHtml += `<tr><th></th>`;

    months.forEach(month => {
        headerHtml += `<th class="month-header">${month}</th>`;
    });

    headerHtml += `</tr>`;
    thead.innerHTML = headerHtml;

    let bodyHtml = "";
    documents.forEach((doc, i) => {
        const key = docKeys[i];
        const data = submissionData[currentFilter][key];

        if (!data) {
            console.warn(`No data for document: ${doc} in department: ${currentFilter}`);
            return;
        }

        bodyHtml += `<tr><td class="doc-name">${doc}</td>`;
        data.forEach(val => {
            bodyHtml += val === 1
                ? `<td class="submitted-cell"><span class="status-submitted">✓ Submitted</span></td>`
                : `<td class="not-submitted-cell">—</td>`;
        });
        bodyHtml += `</tr>`;
    });

    tbody.innerHTML = bodyHtml;

    document.getElementById("filterInfo").innerHTML = 
        `Showing: <strong>${currentFilter}</strong> | Year: <strong>${new Date().getFullYear()}</strong>`;

    updateButtonStates();
}

function updateButtonStates() {
    document.querySelectorAll('.dept-btn').forEach(btn => {
        btn.classList.toggle(
            'active',
            btn.getAttribute('data-dept') === currentFilter
        );
    });
}

function filterByDepartment(dept) {
    currentFilter = dept;
    renderTable();
}

// Create button bar
function createButtonBar() {
    const container = document.createElement('div');
    container.className = 'dept-filter-row';

    const label = document.createElement('span');
    label.className = 'filter-label';
    label.textContent = 'FILTER:';
    container.appendChild(label);

    departments.forEach(dept => {
        const btn = document.createElement('button');
        btn.className = 'dept-btn';
        btn.setAttribute('data-dept', dept);
        btn.textContent = dept;

        btn.addEventListener('click', () => filterByDepartment(dept));
        container.appendChild(btn);
    });

    const tableWrapper = document.getElementById('tableWrapper');
    const existing = document.querySelector('.dept-filter-row');
    if (existing) existing.remove();

    tableWrapper.parentNode.insertBefore(container, tableWrapper);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    fetchSubmissionData();
});