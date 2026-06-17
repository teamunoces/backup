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

    const createdByName = document.getElementById('created_by_name')?.textContent || '';
    const dean = document.getElementById('dean')?.textContent || '';
    const cesHead = document.getElementById('ces_head')?.textContent || '';
    const vpAcad = document.getElementById('vp_acad')?.textContent || '';
    const vpAdmin = document.getElementById('vp_admin')?.textContent || '';
    const schoolPresident = document.getElementById('school_president')?.textContent || '';

    const issueStatus = document.querySelector('input[name="issue_status"]')?.value || '';
    const revisionNumber = document.querySelector('input[name="revision_number"]')?.value || '';
    const dateEffective = document.querySelector('input[name="date_effective"]')?.value || '';
    const approvedBy = document.querySelector('input[name="approved_by"]')?.value || '';

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';

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
                }

                html,
                body {
                    background: white;
                    font-family: Arial, sans-serif;
                    color: #000;
                }

                body {
                    margin: 0;
                    padding: 0;
                }

                .print-root {
                    width: 100%;
                    background: white;
                }

                .print-shell {
                    width: 100%;
                    border-collapse: collapse;
                    border-spacing: 0;
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
                    background: white;
                }

                .print-header,
                .print-footer,
                .print-body {
                    width: 100%;
                    background: white;
                    border: none !important;
                    outline: none !important;
                    box-shadow: none !important;
                }

                .print-header {
                    padding: 0.45in 0.55in 0.15in 0.55in;
                }

                .print-footer {
                    padding: 0.12in 0.55in 0.45in 0.55in;
                }

                .print-body {
                    padding: 0.1in 0.55in 0.1in 0.55in;
                }
    .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        width: 100%;
        gap: 12px;
    }

    .logo-left {
        height: 90px;
        width: auto;
        display: block;
        flex: 0 0 auto;
    }

    .logo-left2 {
        height: 80px;
        width: auto;
        display: block;
        flex: 0 0 auto;
    }

    .logos-right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 20px;
        flex: 0 0 auto;
    }

    .logos-right img {
        height: 80px;
        width: auto;
        display: block;
    }

    .college-info {
        text-align: center;
        flex-grow: 1;
        padding: 0 18px;
    }

    .college-info h1 {
        font-family: "Times New Roman", Times, serif !important;
        color: #4f81bd !important;
        font-size: 24px;
        margin: 0;
        font-weight: normal;
        line-height: 1.2;
    }

    .college-info p {
        font-size: 11px;
        margin: 1px 0;
        color: #333333 !important;
        line-height: 1.3;
    }

    .college-info a {
        font-size: 12px;
        color: #0000ee !important;
        text-decoration: underline;
    }

    .office-title {
        text-align: center;
        font-size: 16px;
        color: #595959 !important;
        font-weight: bold;
        margin: 12px 0 4px 0;
        letter-spacing: 0.3px;
        text-transform: uppercase;
    }

    .double-line {
        border-top: 4px double #4f81bd !important;
        margin-bottom: 0;
    }
                .certificate-title {
                    text-align: center;
                    font-family: "Century Gothic", Arial, sans-serif;
                    font-size: 11px;
                    font-weight: bold;
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
                    border-bottom: 1px solid black;
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
                    display: inline-block;
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

                .signatures {
                    margin-top: 50px;
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                    page-break-inside: avoid;
                    break-inside: avoid;
                }

                .signature-block {
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

                .approvals-container {
                    width: 100%;
                    max-width: 900px;
                    margin: 80px auto 0 auto;
                    color: #000;
                    page-break-inside: avoid;
                    break-inside: avoid;
                }

                .approval-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 30px;
                    margin-bottom: 20px;
                }

                .signature-group {
                    width: 35%;
                }

                .label {
                    font-weight: bold;
                    margin-bottom: 35px;
                }

                .signature-line {
                    border-bottom: 1.5px solid black;
                    margin-bottom: 5px;
                    min-height: 20px;
                }

                .title {
                    font-size: 14px;
                }

                .bold {
                    font-weight: bold;
                }

                .left-align {
                    text-align: left;
                    width: 100%;
                }

                .approval-centered {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .admin-block {
                    text-align: center;
                    margin-top: 30px;
                    margin-bottom: 10px;
                    page-break-inside: avoid;
                    break-inside: avoid;
                }

                .name-underlined {
                    font-weight: bold;
                    text-decoration: underline;
                    text-transform: uppercase;
                    font-size: 16px;
                    display: inline-block;
                    margin-bottom: 2px;
                }

/* ===== DOCUMENT INFO (PRINT - BORDER FIX) ===== */
.document-info {
    margin-top: 50px;
    width: 255px;
    max-width: 255px;
    page-break-inside: avoid;
    break-inside: avoid;
}

.doc-header {
    width: 255px;
    max-width: 255px;
    border-collapse: collapse;
    table-layout: fixed;
    font-family: Arial, sans-serif;
    font-size: 9px;
    margin-right: auto;
    background: #fff;
    border: 1px solid #808080 !important;
}

.doc-header tr,
.doc-header td {
    border: 1px solid #808080 !important;
}

.doc-header td {
    padding: 3px 6px;
    height: 20px;
    vertical-align: middle;
    line-height: 1.1;
}

/* BLUE LABEL COLUMN */
.doc-header td.label {
    background-color: #002060 !important;
    color: #fff !important;
    font-weight: bold;
    text-align: left;
    white-space: nowrap;
    width: 105px;
    padding-left: 6px;
}

/* COLON COLUMN */
.doc-header td:nth-child(2) {
    width: 10px;
    min-width: 10px;
    max-width: 10px;
    padding: 0;
    font-weight: bold;
    text-align: center;
    color: #000;
    background: #fff !important;
}

/* VALUE COLUMN */
.doc-header td.value {
    width: 140px;
    min-width: 140px;
    text-align: left !important;
    color: #000;
    background: #fff !important;
    padding-left: 6px;
    white-space: nowrap;
}

/* FORCE INNER TEXT LEFT */
.doc-header td.value *,
.doc-header td.value input,
.doc-header td.value p,
.doc-header td.value span {
    text-align: left !important;
    margin: 0;
    padding: 0;
    display: block;
}

/* REMOVE INPUT DEFAULT STYLE */
.doc-header td.value input {
    border: none !important;
    outline: none !important;
    background: transparent !important;
    width: 100%;
    font-family: inherit;
    font-size: inherit;
}

                footer {
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    border: none !important;
                }

                .footer-bottom {
                    display: flex;
                    align-items: flex-end;
                    justify-content: flex-end;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    border: none !important;
                }

                .footer-logos {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    border: none !important;
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
                        background: white !important;
                    }

                    .doc-header td.label {
                        background-color: #002060 !important;
                        color: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .college-info h1 {
                        color: #4f81bd !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .double-line {
                        border-top: 4px double #4f81bd !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
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

                    .approval-row,
                    .signature-block,
                    .admin-block,
                    .document-info,
                    .doc-header,
                    .signatures {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }

                    .approvals-container,
                    .approvals-container * {
                        font-weight: bold !important;
                    }

                    .approvals-container .signature-line,
                    .approvals-container .name-underlined {
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
                                            <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/smcclogo.png" alt="SMCC Logo" class="logo-left">
                                            <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/Ceslogo.png" alt="CES logo" class="logo-left2">

                                            <div class="college-info">
                                                <h1>Saint Michael College of Caraga</h1>
                                                <p>Brgy. 4, Nasipit, Agusan del Norte, Philippines</p>
                                                <p>District 8, Brgy. Triangulo, Nasipit, Agusan del Norte, Philippines</p>
                                                <p>Tel Nos. +63 085 343-3251 / +63 085 283-3113</p>
                                                <a href="http://www.smccnasipit.edu.ph">www.smccnasipit.edu.ph</a>
                                            </div>

                                            <div class="logos-right">
                                                <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/ISOlogo.png" alt="SOCOTEC Logo">
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
                                                <img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/footerlogo.png" alt="Org Logo">
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
                                            <span class="display-value med-value" style="display:block; width:100%;">${escapeHtml(activityName)}</span>
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
                                        <div class="signature-block">
                                            <p><strong>Monitored by:</strong></p>
                                            <div class="sig-line">
                                                <span class="display-value">${escapeHtml(monitoredBy)}</span>
                                                <span class="sub-label">Signature over printed name</span>
                                            </div>
                                        </div>

                                        <div class="signature-block">
                                            <p><strong>Verified by the Barangay Official/Community Head/Beneficiary:</strong></p>
                                            <div class="sig-line">
                                                <span class="display-value">${escapeHtml(verifiedBy)}</span>
                                                <span class="sub-label">Signature over printed name</span>
                                            </div>
                                        </div>
                                    </section>

                                    <section class="approvals-container">
                                        <div class="approval-row">
                                            <div class="signature-group">
                                                <div class="label">Prepared by:</div>
                                                <div class="signature-line">${escapeHtml(createdByName)}</div>
                                                <div class="title bold">CES Coordinator</div>
                                            </div>
                                        </div>

                                        <div class="label" style="margin-top: 20px;">Noted by:</div>

                                        <div class="approval-row">
                                            <div class="signature-group">
                                                <div class="signature-line">${escapeHtml(dean)}</div>
                                                <div class="title bold">Dean</div>
                                            </div>

                                            <div class="signature-group">
                                                <div class="signature-line">${escapeHtml(cesHead)}</div>
                                                <div class="title bold">CES Head</div>
                                            </div>
                                        </div>

                                        <div class="approval-centered" style="margin-top: 40px;">
                                            <div class="label left-align">Recommending Approval:</div>

                                            <div class="admin-block">
                                                <div class="name-underlined">${escapeHtml(vpAcad)}</div>
                                                <div class="title bold">Vice-President for Academic Affairs and Research</div>
                                            </div>

                                            <div class="admin-block">
                                                <div class="name-underlined">${escapeHtml(vpAdmin)}</div>
                                                <div class="title bold">Vice-President for Administrative Affairs</div>
                                            </div>
                                        </div>

                                        <div class="approval-centered">
                                            <div class="label left-align">Approved by:</div>

                                            <div class="admin-block">
                                                <div class="name-underlined">${escapeHtml(schoolPresident)}</div>
                                                <div class="title bold">School President</div>
                                            </div>
                                        </div>
                                    </section>

                                    <section class="document-info">
                                        <table class="doc-header">
                                            <tr>
                                                <td class="label">Form Code No.</td>
                                                <td>:</td>
                                                <td class="value">FM-DPM-SMCC-CES-07</td>
                                            </tr>
                                            <tr>
                                                <td class="label">Issue Status</td>
                                                <td>:</td>
                                                <td class="value">${escapeHtml(issueStatus)}</td>
                                            </tr>
                                            <tr>
                                                <td class="label">Revision No.</td>
                                                <td>:</td>
                                                <td class="value">${escapeHtml(revisionNumber)}</td>
                                            </tr>
                                            <tr>
                                                <td class="label">Date Effective</td>
                                                <td>:</td>
                                                <td class="value">${escapeHtml(dateEffective)}</td>
                                            </tr>
                                            <tr>
                                                <td class="label">Approved By</td>
                                                <td>:</td>
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

    let hasPrinted = false;

    const cleanup = () => {
        if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
        }
    };

    const runPrint = () => {
        if (hasPrinted) return;
        hasPrinted = true;

        setTimeout(() => {
            iframe.contentWindow.focus();

            iframe.contentWindow.addEventListener('afterprint', cleanup, { once: true });

            iframe.contentWindow.print();

            setTimeout(cleanup, 1500);
        }, 400);
    };

    iframe.onload = runPrint;

    if (doc.readyState === 'complete') {
        runPrint();
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
