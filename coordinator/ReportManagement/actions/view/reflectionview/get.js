/**
 * get.js - Fetch and display reflection paper data
 */

const API_URL = 'get.php';
const isDebug = new URLSearchParams(window.location.search).has('debug');
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

// Make currentReportData globally accessible
window.currentReportData = null;

async function fetchReflectionData(reportId = null, reportType = null) {
    try {
        let url = API_URL;
        const params = new URLSearchParams();

        if (reportId) {
            params.append('id', reportId);
        } else if (reportType) {
            params.append('type', reportType);
        }

        if (params.toString()) {
            url += '?' + params.toString();
        }

        debugLog('Fetching from URL:', url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        debugLog('API Response:', result);

        if (result.success && result.data && result.data.length > 0) {
            const report = result.data[0];

            debugLog('Report found with ID:', report.id);

            window.currentReportData = {
                id: report.id,
                type: report.type,
                beneficiary_name: report.beneficiary_name,
                implementing_department: report.implementing_department,
                extension_services: report.extension_services,
                answer_one: report.answer_one,
                answer_two: report.answer_two,
                answer_three: report.answer_three,
                beneficiary_signature: report.beneficiary_signature,
                created_by_name: report.created_by_name,
                feedback: report.feedback,
                dean: report.dean,
                ces_head: report.ces_head,
                ces_head_suffix: report.ces_head_suffix,
                vp_acad: report.vp_acad,
                vp_acad_suffix: report.vp_acad_suffix,
                vp_admin: report.vp_admin,
                vp_admin_suffix: report.vp_admin_suffix,
                school_president: report.school_president,
                school_president_suffix: report.school_president_suffix,
                issue_status: report.issue_status,
                revision_number: report.revision_number,
                date_effective: report.date_effective,
                approved_by: report.approved_by
            };

            populateForm(window.currentReportData);
            return result.data;
        } else {
            debugLog('No data found or invalid response structure');
            debugLog('Result:', result);
            return null;
        }

    } catch (error) {
        debugWarn('Error fetching data:', error);
        return null;
    }
}

function populateForm(data) {
    displayApprovalDocumentInfo(data);
    if (!data) {
        debugWarn('No data to populate form');
        return;
    }

    debugLog('Populating form with data:', data);

    // Fill beneficiary name
    const beneficiaryInput = document.getElementById('beneficiary_name');
    if (beneficiaryInput) {
        beneficiaryInput.value = data.beneficiary_name || '';
    }

    // Fill implementing department
    const deptInput = document.getElementById('implementing_department');
    if (deptInput) {
        deptInput.value = data.implementing_department || '';
    }

    // Fill extension services checkboxes
    const selectedServices = Array.isArray(data.extension_services)
        ? data.extension_services
        : [];

    const checkboxes = document.querySelectorAll('input[name="extension_services[]"]');
    checkboxes.forEach(cb => {
        cb.checked = selectedServices.includes(cb.value);
    });

    // Fill answer one
    const answerOne = document.getElementById('answer_one');
    if (answerOne) {
        answerOne.value = data.answer_one || '';

        if (typeof autoExpand === 'function') {
            autoExpand(answerOne);
        }
    }

    // Fill answer two
    const answerTwo = document.getElementById('answer_two');
    if (answerTwo) {
        answerTwo.value = data.answer_two || '';

        if (typeof autoExpand === 'function') {
            autoExpand(answerTwo);
        }
    }

    // Fill answer three
    const answerThree = document.getElementById('answer_three');
    if (answerThree) {
        answerThree.value = data.answer_three || '';

        if (typeof autoExpand === 'function') {
            autoExpand(answerThree);
        }
    }

    // Fill beneficiary signature
    const signatureInput = document.getElementById('beneficiary_signature');
    if (signatureInput) {
        signatureInput.value = data.beneficiary_signature || '';
    }

    // Fill Prepared by / Created by name
    const createdByName = document.getElementById('created_by_name');
    if (createdByName) {
        createdByName.textContent = data.created_by_name || '';
    }

    // Display admin feedback
    const adminComment = document.getElementById('admincomment');
    if (adminComment) {
        adminComment.value = data.feedback || '';
    }

    // Enable and update the submit button if it exists
    const submitButton = document.querySelector('.submit-button');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Re-submit';
        submitButton.style.opacity = '1';
        submitButton.style.cursor = 'pointer';

        debugLog('Button enabled - ready to update');
    }

    debugLog('Form populated with report ID:', data.id);
}

// Auto-load on page ready
document.addEventListener('DOMContentLoaded', function () {
    const reportType = window.reportType || "Monthly Accomplishment Report- Reflection Paper";

    debugLog('Loading reflection paper for:', reportType);

    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');

    if (reportId) {
        debugLog('Loading specific report ID:', reportId);
        fetchReflectionData(reportId, null);
    } else {
        fetchReflectionData(null, reportType);
    }
});


function formatNameWithSuffix(name, suffix) {
    const cleanName = String(name || '').trim();
    const cleanSuffix = String(suffix || '').trim();

    if (!cleanName) return cleanSuffix;
    if (!cleanSuffix) return cleanName;

    return `${cleanName}, ${cleanSuffix}`;
}

function setTextIfExists(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value || '';
}

function setInputByNameIfExists(name, value) {
    const element = document.querySelector(`[name="${name}"]`);
    if (element) element.value = value || '';
}

function displayApprovalDocumentInfo(report) {
    if (!report) return;

    setTextIfExists('dean', report.dean || '');
    setTextIfExists('ces_head', formatNameWithSuffix(report.ces_head, report.ces_head_suffix));
    setTextIfExists('vp_acad', formatNameWithSuffix(report.vp_acad, report.vp_acad_suffix));
    setTextIfExists('vp_admin', formatNameWithSuffix(report.vp_admin, report.vp_admin_suffix));
    setTextIfExists('school_president', formatNameWithSuffix(report.school_president, report.school_president_suffix));

    setInputByNameIfExists('issue_status', report.issue_status);
    setInputByNameIfExists('revision_number', report.revision_number);
    setInputByNameIfExists('date_effective', report.date_effective);
    setInputByNameIfExists('approved_by', report.approved_by);
}
