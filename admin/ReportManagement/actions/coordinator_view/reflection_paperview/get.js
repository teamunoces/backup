/**
 * get.js - Fetch and display reflection paper data
 */

const API_URL = 'get.php';

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

        console.log('Fetching from URL:', url);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        if (result.success && result.data && result.data.length > 0) {
            const report = result.data[0];

            console.log('Report found with ID:', report.id);

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
                feedback: report.feedback
            };

            populateForm(window.currentReportData);
            return result.data;
        } else {
            console.log('No data found or invalid response structure');
            console.log('Result:', result);
            return null;
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

function populateForm(data) {
    if (!data) {
        console.error('No data to populate form');
        return;
    }

    console.log('Populating form with data:', data);

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

        console.log('Button enabled - ready to update');
    }

    console.log('Form populated with report ID:', data.id);
}

// Auto-load on page ready
document.addEventListener('DOMContentLoaded', function () {
    const reportType = window.reportType || "Monthly Accomplishment Report- Reflection Paper";

    console.log('Loading reflection paper for:', reportType);

    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');

    if (reportId) {
        console.log('Loading specific report ID:', reportId);
        fetchReflectionData(reportId, null);
    } else {
        fetchReflectionData(null, reportType);
    }
});