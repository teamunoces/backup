// get.js
// Fetches report data from get.php and displays it on the page.
// Console display removed.

document.addEventListener("DOMContentLoaded", function () {
    const reportType = window.reportType || "Certificate of Appearance";

    const urlParams = new URLSearchParams(window.location.search);
    const reportId = urlParams.get("id");

    let apiUrl = "get.php";

    if (reportId) {
        apiUrl += "?id=" + encodeURIComponent(reportId);
    } else if (reportType) {
        apiUrl += "?type=" + encodeURIComponent(reportType);
    } else {
        return;
    }

    fetch(apiUrl, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("HTTP error! status: " + response.status);
            }

            const contentType = response.headers.get("content-type");

            if (!contentType || !contentType.includes("application/json")) {
                return response.text().then(text => {
                    throw new Error("Server did not return JSON.");
                });
            }

            return response.json();
        })
        .then(data => {
            if (data.success && data.data && data.data.length > 0) {
                const report = data.data[0];
                populateFormFields(report);
            } else {
                const adminCommentField = document.getElementById("admincomment");

                if (adminCommentField) {
                    adminCommentField.value = "No report data found.";
                }
            }
        })
        .catch(error => {
            const adminCommentField = document.getElementById("admincomment");

            if (adminCommentField) {
                adminCommentField.value = "Error loading report: " + error.message;
            }
        });
});

function populateFormFields(report) {
    displayApprovalDocumentInfo(report);
    const fieldMappings = {
        participant: report.participant || "",
        cert_department: report.cert_department || "",
        activity_name: report.activity_name || "",
        location: report.location || "",
        date_held: report.date_held || "",
        month_held: report.month_held || "",
        year_held: report.year_held || "",
        location_two: report.location_two || "",
        monitored_by: report.monitored_by || "",
        verified_by: report.verified_by || ""
    };

    for (const [fieldId, value] of Object.entries(fieldMappings)) {
        setElementValue(fieldId, value);
    }

    setElementText("created_by_name", report.created_by_name || "");
    setElementText("dean", report.dean || "");
    setElementText("ces_head", formatNameWithSuffix(report.ces_head, report.ces_head_suffix));
    setElementText("vp_acad", formatNameWithSuffix(report.vp_acad, report.vp_acad_suffix));
    setElementText("vp_admin", formatNameWithSuffix(report.vp_admin, report.vp_admin_suffix));
    setElementText("school_president", formatNameWithSuffix(report.school_president, report.school_president_suffix));

    const adminCommentField = document.getElementById("admincomment");

    if (adminCommentField) {
        adminCommentField.value =
            report.admin_comment ||
            report.comment ||
            report.feedback ||
            "";
    }
}

function setElementValue(id, value) {
    const element = document.getElementById(id);

    if (!element) return;

    if (
        element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.tagName === "SELECT"
    ) {
        element.value = value || "";
    } else {
        element.textContent = value || "";
    }
}

function setElementText(id, value) {
    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = value || "";
}

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
