// print.js - Handles printing of the monthly accomplishment report - narrative report
// Fixed: document info will not overlap the footer.

async function printReport() {
    const narrateSuccess = document.getElementById('narrate_success')?.value || '';
    const provideData = document.getElementById('provide_data')?.value || '';
    const identifyProblems = document.getElementById('identify_problems')?.value || '';
    const proposeSolutions = document.getElementById('propose_solutions')?.value || '';

    const createdByName = document.getElementById('created_by_name')?.textContent?.trim() || '';
    const dean = document.getElementById('dean')?.textContent?.trim() || '';
    const cesHead = document.getElementById('ces_head')?.textContent?.trim() || '';
    const vpAcad = document.getElementById('vp_acad')?.textContent?.trim() || '';
    const vpAdmin = document.getElementById('vp_admin')?.textContent?.trim() || '';
    const schoolPresident = document.getElementById('school_president')?.textContent?.trim() || '';

    const issueStatus = document.querySelector('input[name="issue_status"]')?.value || '';
    const revisionNumber = document.querySelector('input[name="revision_number"]')?.value || '';
    const dateEffective = document.querySelector('input[name="date_effective"]')?.value || '';
    const approvedBy = document.querySelector('input[name="approved_by"]')?.value || '';
    const documentType = document.querySelector('.document_type')?.textContent?.trim() || 'FM-DPM-SMCC-CES-05A';

    const originalTitle = document.title;
    document.title = 'Monthly_Accomplishment_Report_Narrative_Report';

    try {
        const iframe = createPrintIframe();
        const doc = iframe.contentDocument || iframe.contentWindow.document;

        const headerHTML = buildPrintHeaderHtml();
        const footerHTML = buildPrintFooterHtml();
        const bodyHTML = buildNarrativeBodyHtml({
            narrateSuccess,
            provideData,
            identifyProblems,
            proposeSolutions,
            createdByName,
            dean,
            cesHead,
            vpAcad,
            vpAdmin,
            schoolPresident,
            issueStatus,
            revisionNumber,
            dateEffective,
            approvedBy,
            documentType
        });

        doc.open();
        doc.write(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Monthly Accomplishment Report - Narrative Report</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <style>
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        @page {
            size: A4 portrait;
            margin: 12mm 10mm 24mm 10mm;
        }

        html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
            background: #fff !important;
            color: #000;
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            overflow: visible !important;
        }

        body {
            background: #fff !important;
        }

        #print-container {
            display: block !important;
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            outline: none !important;
            background: #fff !important;
        }

        .print-shell {
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            border-collapse: collapse !important;
            border-spacing: 0 !important;
            table-layout: fixed !important;
            border: none !important;
            outline: none !important;
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

        .print-shell > thead > tr,
        .print-shell > tbody > tr,
        .print-shell > tfoot > tr,
        .print-shell > thead > tr > td,
        .print-shell > tbody > tr > td,
        .print-shell > tfoot > tr > td {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            outline: none !important;
            vertical-align: top !important;
            background: #fff !important;
        }

        .print-header,
        .print-footer,
        .print-body {
            width: 100%;
            margin: 0 !important;
            background: #fff !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
        }

        .print-header {
            padding: 0 0 8px 0 !important;
        }

        .print-footer {
            padding: 8px 0 0 0 !important;
        }

        .print-body {
            padding: 0 0 28mm 0 !important;
            margin: 0 !important;
        }

        .print-content {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 0 20mm 0 !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            background: #fff !important;
            overflow: visible !important;
        }

        .report-container,
        .approvals-container,
        .document-info-wrap {
            width: 100% !important;
            max-width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            padding-left: 0 !important;
            padding-right: 0 !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            background: #fff !important;
        }

        .print-page-header {
            margin: 0 !important;
            padding: 0 !important;
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
        margin-right: 10px;
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
        .main-title {
            text-align: center;
            font-size: 18px;
            text-decoration: underline;
            margin: 15px 0 30px 0;
            text-transform: uppercase;
            font-weight: bold;
        }

        .report-list {
            list-style-type: upper-roman;
            padding-left: 36px;
            margin: 0;
        }

        .report-list li {
            margin-bottom: 24px;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        .label {
            display: block;
            font-weight: bold;
            margin-bottom: 6px;
            font-size: 14px;
        }

        .line-input {
            width: 100%;
            border: none !important;
            background: #fff !important;
            font-family: inherit;
            font-size: 14px;
            padding: 0;
            line-height: 1.6;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: anywhere;
            min-height: 60px;
        }

        .approvals-container {
            margin-top: 60px !important;
            page-break-inside: auto !important;
            break-inside: auto !important;
        }

        .approval-row {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            gap: 16px;
            margin-bottom: 20px;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        .signature-group {
            width: 35% !important;
        }

        .signature-line {
            border-bottom: 1.5px solid black !important;
            margin-bottom: 5px !important;
            min-height: 30px !important;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: anywhere;
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
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        .admin-block {
            text-align: center !important;
            margin-top: 26px;
            margin-bottom: 8px;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        .name-underlined {
            font-weight: bold;
            text-decoration: underline;
            text-transform: uppercase;
            font-size: 16px;
            display: inline-block;
            margin-bottom: 2px;
        }

        .document-info-wrap {
            margin-top: 40px !important;
            margin-bottom: 32mm !important;
            display: block !important;
            clear: both !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-before: auto !important;
        }

        .document-info {
            display: block !important;
            margin: 0 !important;
            width: 305px !important;
            max-width: 305px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        .doc-header {
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            font-size: 11px;
            border: 1px solid #bfbfbf !important;
            width: 100% !important;
            table-layout: fixed !important;
            margin: 0 !important;
        }

        .doc-header tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        .doc-header td {
            border: 1px solid #bfbfbf !important;
            padding: 6px 10px;
            vertical-align: middle;
        }

        .doc-header td.label {
            background-color: #002060 !important;
            color: white !important;
            font-weight: bold;
            padding: 6px 8px !important;
            text-align: left;
            white-space: nowrap;
            width: 95px !important;
            font-size: 11px;
            display: table-cell !important;
        }

        .doc-header td.colon {
            width: 12px !important;
            padding: 0 2px !important;
            text-align: center !important;
            font-weight: bold !important;
            background: #ffffff !important;
            color: #000 !important;
        }

        .doc-header td.value {
            padding: 6px 10px !important;
            width: auto !important;
            text-align: left;
            word-break: break-word;
            overflow-wrap: anywhere;
            background: #ffffff !important;
            color: #000 !important;
        }

        .print-footer-inner,
        footer {
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            background: #fff !important;
        }

        .footer-bottom {
            display: flex;
            align-items: flex-end;
            justify-content: flex-end;
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
        }

        .footer-logos {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            width: 100%;
            gap: 0;
            margin: 0 !important;
            padding: 0 !important;
        }

        .footer-logos img,
        .print-footer-logo {
            display: block;
            width: 100%;
            max-width: 100%;
            height: auto;
            max-height: 65px;
            margin: 0 auto !important;
            padding: 0 !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            object-fit: contain;
        }

        img {
            max-width: 100%;
            height: auto;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        @media print {
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
            }

            #print-container,
            .print-shell,
            .print-shell tbody,
            .print-shell tbody > tr,
            .print-body {
                height: auto !important;
                min-height: 0 !important;
            }
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
</style>
</head>
<body>
    <div id="print-container">
        <table class="print-shell" role="presentation" aria-hidden="true">
            <thead>
                <tr>
                    <td>
                        <div class="print-header">
                            ${headerHTML}
                        </div>
                    </td>
                </tr>
            </thead>

            <tfoot>
                <tr>
                    <td>
                        <div class="print-footer">
                            ${footerHTML}
                        </div>
                    </td>
                </tr>
            </tfoot>

            <tbody>
                <tr>
                    <td>
                        <div class="print-body">
                            <div class="print-content">
                                ${bodyHTML}
                            </div>
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

        await waitForImages(doc);
        await waitForFonts(doc);

        await nextFrame(iframe.contentWindow);
        await nextFrame(iframe.contentWindow);

        await runPrintAndCleanup(iframe);
    } catch (error) {
        console.error('Print failed:', error);
        alert('Printing failed. Please try again.');
    } finally {
        document.title = originalTitle;
    }
}

function buildNarrativeBodyHtml(data) {
    return `
        <div class="report-container">
            <h1 class="main-title">MONTHLY ACCOMPLISHMENT REPORT - NARRATIVE REPORT</h1>

            <ol class="report-list">
                <li>
                    <div class="label">Narrate Success</div>
                    <div class="line-input">${escapeHtml(data.narrateSuccess) || '_________________________'}</div>
                </li>
                <li>
                    <div class="label">Provide Data</div>
                    <div class="line-input">${escapeHtml(data.provideData) || '_________________________'}</div>
                </li>
                <li>
                    <div class="label">Identify Problems</div>
                    <div class="line-input">${escapeHtml(data.identifyProblems) || '_________________________'}</div>
                </li>
                <li>
                    <div class="label">Propose Solutions</div>
                    <div class="line-input">${escapeHtml(data.proposeSolutions) || '_________________________'}</div>
                </li>
            </ol>
        </div>

        <div class="approvals-container">
            <div class="approval-row">
                <div class="signature-group">
                    <div class="label">Prepared by:</div>
                    <div class="signature-line">${escapeHtml(data.createdByName)}</div>
                    <div class="title bold">CES Coordinator</div>
                </div>
            </div>

            <div class="label" style="margin-top: 20px;">Noted by:</div>
            <div class="approval-row">
                <div class="signature-group">
                    <div class="signature-line">${escapeHtml(data.dean)}</div>
                    <div class="title bold">Dean</div>
                </div>
                <div class="signature-group">
                    <div class="signature-line">${escapeHtml(data.cesHead)}</div>
                    <div class="title bold">CES Head</div>
                </div>
            </div>

            <div class="approval-centered" style="margin-top: 40px;">
                <div class="label left-align">Recommending Approval:</div>
                <div class="admin-block">
                    <div class="name-underlined">${escapeHtml(data.vpAcad)}</div>
                    <div class="title bold">Vice-President for Academic Affairs and Research</div>
                </div>
                <div class="admin-block">
                    <div class="name-underlined">${escapeHtml(data.vpAdmin)}</div>
                    <div class="title bold">Vice-President for Administrative Affairs</div>
                </div>
            </div>

            <div class="approval-centered">
                <div class="label left-align">Approved by:</div>
                <div class="admin-block">
                    <div class="name-underlined">${escapeHtml(data.schoolPresident)}</div>
                    <div class="title bold">School President</div>
                </div>
            </div>
        </div>

        <div class="document-info-wrap">
            <div class="document-info">
                <table class="doc-header">
                    <tr>
                        <td class="label">Form Code No.</td>
                        <td class="colon">:</td>
                        <td class="value">${escapeHtml(data.documentType)}</td>
                    </tr>
                    <tr>
                        <td class="label">Issue Status</td>
                        <td class="colon">:</td>
                        <td class="value">${escapeHtml(data.issueStatus)}</td>
                    </tr>
                    <tr>
                        <td class="label">Revision No.</td>
                        <td class="colon">:</td>
                        <td class="value">${escapeHtml(data.revisionNumber)}</td>
                    </tr>
                    <tr>
                        <td class="label">Date Effective</td>
                        <td class="colon">:</td>
                        <td class="value">${escapeHtml(data.dateEffective)}</td>
                    </tr>
                    <tr>
                        <td class="label">Approved By</td>
                        <td class="colon">:</td>
                        <td class="value">${escapeHtml(data.approvedBy)}</td>
                    </tr>
                </table>
            </div>
        </div>
    `;
}

function buildPrintHeaderHtml() {
    const leftLogo = document.querySelector('.logo-left')?.src ||
        '/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/smcclogo.png';

    const leftLogo2 = document.querySelector('.logo-left2')?.src ||
        '/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/Ceslogo.png';

    const rightLogos = Array.from(document.querySelectorAll('.logos-right img'))
        .map(img => img.src)
        .filter(Boolean);

    const officeTitle =
        document.querySelector('.office-title')?.textContent?.trim() ||
        'OFFICE OF THE COMMUNITY EXTENSION SERVICES';

    const collegeInfoNode = document.querySelector('.college-info');
    const collegeInfoHtml = collegeInfoNode
        ? collegeInfoNode.innerHTML
        : `
            <h1>Saint Michael College of Caraga</h1>
            <p>Brgy. 4, Nasipit, Agusan del Norte, Philippines</p>
            <p>District 8, Brgy. Triangulo, Nasipit, Agusan del Norte, Philippines</p>
            <p>Tel Nos. +63 085 343-3251 / +63 085 283-3113</p>
            <p><a href="http://www.smccnasipit.edu.ph">www.smccnasipit.edu.ph</a></p>
        `;

    const rightLogoHtml = rightLogos.length
        ? rightLogos.map(src => `<img src="${escapeHtml(src)}" alt="Logo">`).join('')
        : `<img src="/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/ISOlogo.png" alt="SOCOTEC Logo">`;

    return `
        <div class="print-page-header">
            <div class="header-content">
                <img src="${escapeHtml(leftLogo)}" alt="SMCC Logo" class="logo-left">
                <img src="${escapeHtml(leftLogo2)}" alt="CES Logo" class="logo-left2">
                <div class="college-info">${collegeInfoHtml}</div>
                <div class="logos-right">${rightLogoHtml}</div>
            </div>
            <div class="office-title">${escapeHtml(officeTitle)}</div>
            <div class="double-line"></div>
        </div>
    `;
}

function buildPrintFooterHtml() {
    const footerImg =
        document.querySelector('.footer-bottom img')?.src ||
        document.querySelector('.footer-logos img')?.src ||
        document.querySelector('footer img')?.src ||
        '';

    return `
        <div class="print-footer-inner">
            ${footerImg ? `<img src="${escapeHtml(footerImg)}" alt="Footer Logo" class="print-footer-logo">` : '&nbsp;'}
        </div>
    `;
}

function createPrintIframe() {
    const oldIframe = document.getElementById('print-iframe');
    if (oldIframe) oldIframe.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'print-iframe';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);
    return iframe;
}

function waitForImages(docOrRoot) {
    const root = docOrRoot.querySelectorAll ? docOrRoot : docOrRoot.documentElement;
    const images = Array.from(root.querySelectorAll('img'));

    if (!images.length) return Promise.resolve();

    return Promise.all(
        images.map(img => {
            if (img.complete && img.naturalWidth > 0) {
                return Promise.resolve();
            }

            return new Promise(resolve => {
                const done = () => {
                    img.removeEventListener('load', done);
                    img.removeEventListener('error', done);
                    resolve();
                };

                img.addEventListener('load', done, { once: true });
                img.addEventListener('error', done, { once: true });
                setTimeout(done, 3000);
            });
        })
    );
}

async function waitForFonts(doc) {
    try {
        if (doc.fonts && doc.fonts.ready) {
            await doc.fonts.ready;
        }
    } catch (_) {}
}

function nextFrame(win) {
    return new Promise(resolve => win.requestAnimationFrame(() => resolve()));
}

function runPrintAndCleanup(iframe) {
    return new Promise(resolve => {
        const win = iframe.contentWindow;
        let cleaned = false;

        const cleanup = () => {
            if (cleaned) return;
            cleaned = true;

            try {
                win.onafterprint = null;
            } catch (_) {}

            setTimeout(() => {
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }
                resolve();
            }, 150);
        };

        win.onafterprint = cleanup;
        setTimeout(cleanup, 5000);

        win.focus();
        win.print();
    });
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
