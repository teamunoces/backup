// print.js - Handles printing of Certificate of Appearance
function printReport() {
    const participant = document.getElementById('participant')?.value || '';
    const certDepartment = document.getElementById('cert_department')?.value || '';
    const activityName = document.getElementById('activity_name')?.value || '';
    const location = document.getElementById('location')?.value || '';
    const dateHeld = document.getElementById('date_held')?.value || '';
    const monthHeld = document.getElementById('month_held')?.value || '';
    const yearHeld = document.getElementById('year_held')?.value || '';
    const locationTwo = document.getElementById('location_two')?.value || '';
    const monitoredBy = document.getElementById('monitored_by')?.value || '';
    const verifiedBy = document.getElementById('verified_by')?.value || '';

    const cesHead = document.getElementById('ces_head')?.textContent || '';
    const vpAcad = document.getElementById('vp_acad')?.textContent || '';
    const vpAdmin = document.getElementById('vp_admin')?.textContent || '';
    const schoolPresident = document.getElementById('school_president')?.textContent || '';

    const issueStatus = document.querySelector('input[name="issue_status"]')?.value || '';
    const revisionNumber = document.querySelector('input[name="revision_number"]')?.value || '';
    const dateEffective = document.querySelector('input[name="date_effective"]')?.value || '';
    const approvedBy = document.querySelector('input[name="approved_by"]')?.value || '';

    const oldIframe = document.getElementById('print-iframe');
    if (oldIframe) oldIframe.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.left = '-9999px';
    iframe.style.top = '0';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    doc.open();
    doc.write(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Certificate of Appearance</title>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

html,
body {
    background: #fff;
    font-family: Arial, sans-serif;
    color: #000;
}

.print-root {
    width: 100%;
    background: #fff;
}

.print-shell {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    border: none !important;
}

.print-shell thead {
    display: table-header-group;
}

.print-shell tfoot {
    display: table-footer-group;
}

.print-shell tbody {
    display: table-row-group;
}

.print-shell,
.print-shell tr,
.print-shell td {
    border: none !important;
}

.print-shell td {
    padding: 0;
    vertical-align: top;
}

.page-box {
    width: 850px;
    max-width: 100%;
    margin: 0 auto;
    background: #fff;
}

.print-header {
    padding: 0.45in 0.55in 0.15in 0.55in;
}

.print-body {
    padding: 0.1in 0.55in 0.1in 0.55in;
}

.print-footer {
    padding: 0.12in 0.55in 0.45in 0.55in;
}

/* Header */
.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
    gap: 12px;
}

.logo-left {
    height: 90px;
    width: auto;
}

.logo-left2 {
    height: 80px;
    width: auto;
}

.logos-right img {
    height: 80px;
    width: auto;
}

.college-info {
    text-align: center;
    flex: 1;
    padding: 0 20px;
}

.college-info h1 {
    font-family: "Times New Roman", Times, serif;
    color: #4f81bd;
    font-size: 26px;
    font-weight: normal;
    line-height: 1.2;
}

.college-info p {
    font-size: 11px;
    margin: 2px 0;
    color: #333;
}

.college-info a {
    font-size: 13px;
    color: #0000EE;
    text-decoration: underline;
}

.office-title {
    text-align: center;
    font-size: 18px;
    color: #595959;
    font-weight: bold;
    margin: 20px 0 5px;
    text-transform: uppercase;
}

.double-line {
    border-top: 4px double #4f81bd;
    margin-bottom: 20px;
}

/* Main Content */
.certificate-title {
    text-align: center;
    font-size: 1.4rem;
    letter-spacing: 2px;
    margin-bottom: 38px;
    text-transform: uppercase;
}

.content p {
    margin: 20px 0;
    line-height: 2;
}

.line-wrap {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    vertical-align: middle;
}

.sub-label {
    font-size: 0.85rem;
    margin-top: 1px;
}

.sub-label-center {
    text-align: center;
    font-size: 0.85rem;
    width: 100%;
}

.location-group,
.date-group {
    margin: 20px 0;
    line-height: 2;
}

.display-value {
    border-bottom: 1px solid #000;
    display: inline-block;
    min-width: 100px;
    text-align: center;
    padding: 0 5px;
}

.long-value {
    min-width: 280px;
}

.full-value {
    width: 90%;
}

.short-value {
    min-width: 60px;
}

.month-value {
    min-width: 80px;
}

.location-value {
    min-width: 150px;
}

.med-value {
    min-width: 220px;
}

/* Signatures */
.signatures {
    margin-top: 50px;
    display: flex;
    flex-direction: column;
    gap: 40px;
    page-break-inside: avoid;
    break-inside: avoid;
}

.signature-block-main {
    page-break-inside: avoid;
    break-inside: avoid;
}

.sig-line {
    margin-top: 30px;
    width: 300px;
    max-width: 100%;
}

.sig-line .display-value {
    width: 100%;
}

/* Approvals */
.approvals-container,
.approvals {
    font-family: Arial, sans-serif !important;
    width: 100% !important;
    max-width: 100% !important;
    margin-top: 50px !important;
    color: #000 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    overflow: hidden !important;
}

.prepared-block {
    width: 100% !important;
    max-width: 100% !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

.prepared-block .label {
    font-size: 14px !important;
    font-weight: bold !important;
    margin-bottom: 5px !important;
    text-align: left !important;
}

.prepared-name {
    display: inline-block !important;
    min-width: 190px !important;
    max-width: 260px !important;
    border-bottom: 1px solid #000 !important;
    font-size: 14px !important;
    font-weight: bold !important;
    text-transform: uppercase !important;
    text-align: left !important;
    min-height: 20px !important;
    line-height: 20px !important;
    padding: 0 8px 1px 0 !important;
}

.prepared-name:empty::after {
    content: "\\00a0";
}

.prepared-title {
    display: block !important;
    font-size: 14px !important;
    font-weight: bold !important;
    text-align: left !important;
    margin-top: 2px !important;
}

.approval-section {
    width: 100% !important;
    max-width: 100% !important;
    margin-top: 38px !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    overflow: hidden !important;
}

.approval-section .label {
    font-size: 14px !important;
    font-weight: bold !important;
    margin-bottom: 60px !important;
    text-align: left !important;
}

.signature-block {
    width: auto !important;
    max-width: 380px !important;
    margin-left: auto !important;
    margin-right: auto !important;
    text-align: center !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

.signature-block .name,
.name-underlined {
    display: inline-block !important;
    width: auto !important;
    min-width: 280px !important;
    max-width: 360px !important;
    border-bottom: 1px solid #000 !important;
    font-size: 14px !important;
    font-weight: bold !important;
    text-transform: uppercase !important;
    text-align: center !important;
    min-height: 20px !important;
    line-height: 20px !important;
    margin-bottom: 3px !important;
    padding: 0 12px 1px 12px !important;
    text-decoration: none !important;
}

.signature-block .name:empty::after,
.name-underlined:empty::after {
    content: "\\00a0";
}

.signature-block .title {
    display: block !important;
    font-size: 14px !important;
    font-weight: bold !important;
    text-align: center !important;
    margin-top: 3px !important;
}

/* ================= DOCUMENT INFO - SMALLER VERSION ================= */
.document-info {
    margin-top: 25px !important;
    margin-bottom: 25px !important;
    width: 205px !important;
    max-width: 205px !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

.doc-header {
    width: 205px !important;
    max-width: 205px !important;
    border-collapse: collapse !important;
    font-family: Calibri, "Calibri (Body)", Arial, sans-serif !important;
    font-size: 9px !important;
    margin-left: 0 !important;
    margin-right: auto !important;
    table-layout: fixed !important;
}

.doc-header td {
    border: 1px solid #d1d1d1 !important;
    padding: 1px 3px !important;
    height: 15px !important;
    line-height: 1.05 !important;
    vertical-align: middle !important;
}

.doc-header td.label {
    background-color: #002060 !important;
    color: #ffffff !important;
    font-weight: bold !important;
    text-align: left;
    white-space: nowrap;
    width: 75px !important;
    max-width: 75px !important;
    font-size: 9px !important;
    line-height: 1.05 !important;
}

.doc-header td:nth-child(2) {
    width: 7px !important;
    min-width: 7px !important;
    max-width: 7px !important;
    padding: 0 !important;
    text-align: center;
    font-weight: bold;
    color: #000000 !important;
    background: #ffffff !important;
    font-size: 9px !important;
}

.doc-header td.value {
    width: 123px !important;
    max-width: 123px !important;
    color: #000000 !important;
    background: #ffffff !important;
    text-align: left;
    white-space: nowrap;
    font-size: 9px !important;
    overflow: hidden !important;
}

.doc-header td.value .printable-field,
.doc-header td.value input,
.doc-header td.value p {
    border: none !important;
    background: transparent !important;
    font-family: inherit;
    font-size: 9px !important;
    color: #000000 !important;
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: auto;
    line-height: 1.05 !important;
    box-shadow: none !important;
    outline: none !important;
}

/* keep document info small even with global print font */
.document-info,
.document-info * {
    font-size: 9px !important;
}

/* Footer */
footer,
.footer-bottom,
.footer-logos {
    width: 100%;
    margin: 0;
    padding: 0;
    border: none !important;
}

.footer-bottom {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
}

.footer-logos img {
    display: block;
    width: 100%;
    max-width: 100%;
    height: auto;
    border: none !important;
}

@page {
    size: auto;
    margin: 0;
}

@media print {
    html,
    body {
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
    }

    .print-shell thead {
        display: table-header-group;
    }

    .print-shell tfoot {
        display: table-footer-group;
    }

    .print-shell tbody {
        display: table-row-group;
    }

    .college-info h1,
    .double-line,
    .doc-header td.label {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .approvals-container,
    .prepared-block,
    .approval-section,
    .signature-block,
    .document-info,
    .doc-header,
    .signatures {
        page-break-inside: avoid;
        break-inside: avoid;
    }

    .approvals-container,
    .approvals-container *,
    .approvals,
    .approvals * {
        font-weight: bold !important;
    }

    .approvals-container .signature-line,
    .approvals-container .name-underlined,
    .approvals .signature-line,
    .approvals .name-underlined,
    .approvals .signature-block .name,
    .approvals #ces_head {
        display: inline-block !important;
        width: auto !important;
        min-width: 180px !important;
        max-width: 100% !important;
        padding: 0 12px 2px 12px !important;
        border-bottom: 1px solid #000 !important;
        text-decoration: none !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
    }
}
</style>
</head>

<body>
<div class="print-root">
<table class="print-shell" role="presentation">

<thead>
<tr>
<td>
<div class="page-box print-header">
<header>
    <div class="header-content">
        <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/smcclogo.png" class="logo-left" alt="SMCC Logo">
        <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/Ceslogo.png" class="logo-left2" alt="CES Logo">

        <div class="college-info">
            <h1>Saint Michael College of Caraga</h1>
            <p>Brgy. 4, Nasipit, Agusan del Norte, Philippines</p>
            <p>District 8, Brgy. Triangulo, Nasipit, Agusan del Norte, Philippines</p>
            <p>Tel Nos. +63 085 343-3251 / +63 085 283-3113</p>
            <a href="http://www.smccnasipit.edu.ph">www.smccnasipit.edu.ph</a>
        </div>

        <div class="logos-right">
            <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/ISOlogo.png" alt="ISO Logo">
        </div>
    </div>

    <h2 class="office-title">OFFICE OF THE COMMUNITY EXTENSION SERVICES</h2>
    <div class="double-line"></div>
</header>
</div>
</td>
</tr>
</thead>

<tfoot>
<tr>
<td>
<div class="page-box print-footer">
<footer>
    <div class="footer-bottom">
        <div class="footer-logos">
            <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/footerlogo.png" alt="Footer Logo">
        </div>
    </div>
</footer>
</div>
</td>
</tr>
</tfoot>

<tbody>
<tr>
<td>
<div class="page-box print-body">

<section>
    <h1 class="certificate-title">CERTIFICATE OF APPEARANCE</h1>
</section>

<section class="content">
    <p>
        This is to certify that
        <span class="line-wrap">
            <span class="display-value long-value">${escapeHtml(participant)}</span>
            <span class="sub-label">(Name)</span>
        </span>
        of
        <span class="line-wrap">
            <span class="display-value long-value">${escapeHtml(certDepartment)}</span>
            <span class="sub-label">(Department)</span>
        </span>,
    </p>

    <p>
        has visited and monitored the activity/project on
        <span class="display-value med-value" style="display:block; width:100%;">
            ${escapeHtml(activityName)}
        </span>
        <div class="sub-label-center">(title of the activity/project)</div>
    </p>

    <div class="location-group">
        held at <span class="display-value full-value">${escapeHtml(location)}</span>
    </div>

    <div class="date-group">
        Done this <span class="display-value short-value">${escapeHtml(dateHeld)}</span>
        day of <span class="display-value month-value">${escapeHtml(monthHeld)}</span>,
        <span class="display-value short-value">${escapeHtml(yearHeld)}</span>
        at <span class="display-value location-value">${escapeHtml(locationTwo)}</span>
    </div>
</section>

<section class="signatures">
    <div class="signature-block-main">
        <p><strong>Monitored by:</strong></p>
        <div class="sig-line">
            <span class="display-value">${escapeHtml(monitoredBy)}</span>
            <span class="sub-label">Signature over printed name</span>
        </div>
    </div>

    <div class="signature-block-main">
        <p><strong>Verified by the Barangay Official/Community Head/Beneficiary:</strong></p>
        <div class="sig-line">
            <span class="display-value">${escapeHtml(verifiedBy)}</span>
            <span class="sub-label">Signature over printed name</span>
        </div>
    </div>
</section>

<section class="approvals-container">
    <div class="prepared-block">
        <div class="label">Prepared by:</div>
        <div class="prepared-name">${escapeHtml(cesHead)}</div>
        <div class="prepared-title">CES Head</div>
    </div>

    <div class="approval-section recommending">
        <div class="label">Recommending Approval:</div>

        <div class="signature-block">
            <span class="name">${escapeHtml(vpAcad)}</span>
            <span class="title">Vice-President for Academic Affairs and Research</span>
        </div>

        <div class="signature-block" style="margin-top: 40px;">
            <span class="name">${escapeHtml(vpAdmin)}</span>
            <span class="title">Vice-President for Administrative Affairs</span>
        </div>
    </div>

    <div class="approval-section approved-section">
        <div class="label">Approved by:</div>

        <div class="signature-block">
            <span class="name">${escapeHtml(schoolPresident)}</span>
            <span class="title">School President</span>
        </div>
    </div>
</section>

<section class="document-info">
    <table class="doc-header">
        <tr>
            <td class="label">Form Code No.</td>
            <td class="colon">:</td>
            <td class="value">FM-DPM-SMCC-CES-04</td>
        </tr>
        <tr>
            <td class="label">Issue Status</td>
            <td class="colon">:</td>
            <td class="value">${escapeHtml(issueStatus)}</td>
        </tr>
        <tr>
            <td class="label">Revision No.</td>
            <td class="colon">:</td>
            <td class="value">${escapeHtml(revisionNumber)}</td>
        </tr>
        <tr>
            <td class="label">Date Effective</td>
            <td class="colon">:</td>
            <td class="value">${escapeHtml(dateEffective)}</td>
        </tr>
        <tr>
            <td class="label">Approved By</td>
            <td class="colon">:</td>
            <td class="value">${escapeHtml(approvedBy)}</td>
        </tr>
    </table>
</section>

</div>
</td>
</tr>
</tbody>

</table>
</div>
</body>
</html>
    `);

    doc.close();

    let printStarted = false;

    const cleanup = () => {
        if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
        }
    };

    const runPrint = () => {
        if (printStarted) return;
        printStarted = true;

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();

            iframe.contentWindow.addEventListener('afterprint', cleanup, { once: true });

            setTimeout(cleanup, 1200);
        }, 300);
    };

    const images = Array.from(doc.images);

    if (images.length === 0) {
        runPrint();
    } else {
        let loaded = 0;

        const imageDone = () => {
            loaded++;
            if (loaded >= images.length) {
                runPrint();
            }
        };

        images.forEach((img) => {
            if (img.complete) {
                imageDone();
            } else {
                img.addEventListener('load', imageDone, { once: true });
                img.addEventListener('error', imageDone, { once: true });
            }
        });

        setTimeout(runPrint, 1000);
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

window.printReport = printReport;
