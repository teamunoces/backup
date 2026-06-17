/**
 * get.js - Fetch and display evaluation data
 */

const API_URL = 'get.php';

// Make currentReportData globally accessible
window.currentReportData = null;

async function fetchEvaluationData(reportId = null, reportType = null) {
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
                venue: report.venue || '',
                implementing_department: report.implementing_department || '',
                service_types: report.service_types || '',
                evaluated_by: report.evaluated_by || '',
                signature: report.signature || '',
                evaluation_date: report.evaluation_date || '',
                feedback: report.feedback || '',

                // Prepared by / Created by name
                created_by_name:
                    report.created_by_name ||
                    report.created_by ||
                    report.coordinator_name ||
                    '',

                ratings: {}
            };

            for (let i = 1; i <= 15; i++) {
                window.currentReportData.ratings[`q${i}`] =
                    report[`q${i}_rating`] || '';
            }

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

    // Fill Created By / Prepared By name
    const createdByName = document.getElementById('created_by_name');
    if (createdByName) {
        createdByName.textContent = data.created_by_name || '';
    } else {
        console.warn('created_by_name element not found');
    }

    // Fill venue
    const venueInput = document.getElementById('venue');
    if (venueInput) {
        venueInput.value = data.venue || '';
    }

    // Fill department
    const deptInput = document.getElementById('implementing_department');
    if (deptInput) {
        deptInput.value = data.implementing_department || '';
    }

    // Fill service types checkboxes
    if (data.service_types) {
        let serviceTypes = [];

        if (typeof data.service_types === 'string') {
            serviceTypes = data.service_types
                .split(',')
                .map(s => s.trim());
        } else if (Array.isArray(data.service_types)) {
            serviceTypes = data.service_types;
        }

        const checkboxes = document.querySelectorAll('input[name="service_types[]"]');

        checkboxes.forEach(cb => {
            cb.checked = serviceTypes.includes(cb.value);
        });
    }

    // Fill ratings
    if (data.ratings) {
        for (let i = 1; i <= 15; i++) {
            const rating = data.ratings[`q${i}`];

            if (rating !== null && rating !== undefined && rating !== '') {
                const radio = document.querySelector(
                    `input[name="q${i}"][value="${rating}"]`
                );

                if (radio) {
                    radio.checked = true;
                    console.log(`Set q${i} to ${rating}`);
                } else {
                    console.log(`Could not find radio for q${i} with value ${rating}`);
                }
            }
        }
    } else {
        console.log('No ratings data available');
    }

    // Fill signature section
    const evaluatedBy = document.querySelector('input[name="evaluated_by"]');
    if (evaluatedBy) {
        evaluatedBy.value = data.evaluated_by || '';
    }

    const signature = document.querySelector('input[name="signature"]');
    if (signature) {
        signature.value = data.signature || '';
    }

    const dateInput = document.querySelector('input[name="date"]');
    if (dateInput) {
        dateInput.value = data.evaluation_date || '';
    }

    // Display feedback
    const adminComment = document.getElementById('admincomment');
    if (adminComment) {
        adminComment.value = data.feedback || '';
    }

    // Enable and update the submit button
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
    const reportType =
        window.reportType || 'Evaluation Sheet for Extension Services';

    console.log('Loading evaluations for:', reportType);

    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get('id');

    if (reportId) {
        console.log('Loading specific report ID:', reportId);
        fetchEvaluationData(reportId, null);
    } else {
        fetchEvaluationData(null, reportType);
    }
});