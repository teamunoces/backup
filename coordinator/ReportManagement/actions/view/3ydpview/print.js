async function printReport() {
    const contentBody = document.querySelector('.content-body');
    const reportForm = document.querySelector('form.report-form');

    if (!contentBody || !reportForm) {
        alert('Unable to print: report content not found.');
        return;
    }

    const printButton =
        document.querySelector('#print-button') ||
        document.querySelector('#downloadPDF') ||
        document.querySelector('[data-print-report]');

    const originalButtonText = printButton ? printButton.textContent : '';
    const originalButtonDisabled = printButton ? printButton.disabled : false;

    if (printButton) {
        printButton.textContent = 'Preparing print...';
        printButton.disabled = true;
    }

    try {
        const clonedContent = contentBody.cloneNode(true);

        syncFormValues(contentBody, clonedContent);
        fixProgramPlanTableHeader(clonedContent);
        removeNonPrintable(clonedContent);

        const iframe = createPrintIframe();
        const doc = iframe.contentDocument || iframe.contentWindow.document;

        const leftLogoSrc = document.querySelector('.logo-left')?.src || '';
        const left2LogoSrc = document.querySelector('.logo-left2')?.src || '';
        const rightLogoSrc = document.querySelector('.logos-right img')?.src || '';
        const footerLogoSrc =
            document.querySelector('.footer-bottom img')?.src ||
            '../../images/footerlogo.png';

        doc.open();
        doc.write(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Print Report</title>

<style>
    * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
    }

    @page {
        size: A4 portrait;
        margin: 12mm;
    }

    html,
    body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #000000 !important;
        font-family: Calibri, "Calibri (Body)", Arial, sans-serif !important;
        font-size: 20px;
        line-height: 1.4;
        overflow: visible !important;
    }


    .print-root,
    .print-main,
    .print-content {
        width: 100%;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        background: #ffffff !important;
    }

    table.print-layout {
        width: 100%;
        border-collapse: collapse;
        border-spacing: 0;
        table-layout: fixed;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
    }

    .print-layout thead {
        display: table-header-group;
    }

    .print-layout tfoot {
        display: table-footer-group;
    }

    .print-layout tbody {
        display: table-row-group;
    }

    .print-layout tr,
    .print-layout td,
    .print-layout th {
        border: none !important;
        padding: 0;
        vertical-align: top;
    }

    .print-header-wrap {
        padding: 0 0 12px 0;
        background: #ffffff !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
    }

    .print-footer-wrap {
        min-height: 14mm;
        padding: 8px 0 0 0;
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        background: #ffffff !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
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
    .print-footer-inner {
        display: flex;
        align-items: flex-end;
        justify-content: flex-end;
        width: 100%;
        min-height: 100%;
        padding-bottom: 4px;
    }

    .print-footer-logo {
        height: 38px;
        width: auto;
        display: block;
    }

    .print-content {
        max-width: 100%;
        overflow: visible !important;
    }

    .print-content,
    .print-content * {
        max-width: 100%;
        font-family: Calibri, "Calibri (Body)", Arial, sans-serif;
    }

    #headerFrame,
    #sidebarFrame,
    .buttons,
    .admin-comment,
    #admincomment,
    .no-print,
    .print-hide,
    [data-no-print="true"],
    button,
    script,
    noscript,
    .ai-search-bar,
    .recommendation-section,
    #recommendation-container,
    .form-actions,
    .add-row-btn,
    .delete-row-btn {
        display: none !important;
    }

    .print-content > footer,
    .print-content .footer-bottom {
        display: none !important;
    }

    header h1,
    #header h1 {
        text-align: center;
        text-transform: uppercase;
        font-family: Calibri, "Calibri (Body)", Arial, sans-serif !important;
        font-size: 16px;
        color: #000000 !important;
        margin: 10px 0 20px 0;
        border: none !important;
        padding: 0 !important;
        font-weight: bold;
    }

    .form-section {
        margin-bottom: 20px;
    }

    .input-group {
        margin-bottom: 12px;
    }

    .input-group label {
        display: block;
        font-weight: bold;
        margin-bottom: 4px;
        color: #000000 !important;
        font-size: 12px;
    }

    .printable-field {
        display: block;
        width: 100%;
        min-height: 18px;
        white-space: pre-wrap;
        word-break: break-word;
        overflow-wrap: anywhere;
        color: #000000 !important;
        font-size: 10px;
        line-height: 1.35;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        background: transparent !important;
    }

    .printable-paper-lines {
        width: 100%;
        border: none !important;
        outline: none !important;
        overflow: hidden;
        font-family: Calibri, "Calibri (Body)", Arial, sans-serif !important;
        font-size: 11px;
        line-height: 24px;
        background-image: linear-gradient(transparent 23px, #000 24px) !important;
        background-size: 100% 24px !important;
        background-attachment: local;
        display: block;
        padding: 0 2px;
        box-sizing: border-box;
        white-space: pre-wrap;
        word-break: break-word;
        overflow-wrap: anywhere;
        min-height: 48px;
        box-shadow: none !important;
    }

    .table-section {
        margin: 25px 0;
        width: 100%;
    }

    .table-wrapper {
        overflow-x: visible !important;
        background: #ffffff !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        margin-bottom: 20px;
        width: 100%;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        page-break-inside: auto;
        break-inside: auto;
        border: none;
        outline: none;
        box-shadow: none;
    }

    thead {
        display: table-header-group;
    }

    tfoot {
        display: table-footer-group;
    }

    tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    /* ================= PROGRAM PLAN TABLE ================= */
    #programPlanTable {
        width: 100% !important;
        border-collapse: collapse !important;
        table-layout: fixed !important;
        border: 1px solid #000000 !important;
        font-family: Calibri, "Calibri (Body)", Arial, sans-serif !important;
    }

    #programPlanTable thead th {
        border: 1px solid #000000 !important;
        background-color: #d9d9d9 !important;
        color: #000000 !important;
        font-family: Calibri, "Calibri (Body)", Arial, sans-serif !important;
        font-weight: bold;
        font-size: 11px;
        text-align: center;
        vertical-align: top;
        padding: 4px 3px;
        line-height: 1.35;
        text-transform: none !important;
        word-break: normal;
        overflow-wrap: break-word;
        white-space: normal;
    }

    #programPlanTable thead tr:first-child th {
        height: 28px;
    }

    #programPlanTable thead tr:nth-child(2) th {
        height: 145px;
        vertical-align: top;
        padding-top: 4px;
    }

    #programPlanTable td {
        border: 1px solid #000000 !important;
        vertical-align: top;
        padding: 0;
        font-family: Calibri, "Calibri (Body)", Arial, sans-serif !important;
        font-size: 11px;
        color: #000000 !important;
    }

    #programPlanTable td .printable-field,
    #programPlanTable td .printable-paper-lines {
        padding: 5px 4px !important;
        font-family: Calibri, "Calibri (Body)", Arial, sans-serif !important;
        font-size: 11px;
        line-height: 1.3;
        color: #000000 !important;
        width: 100%;
        min-height: 60px;
        display: block;
        box-sizing: border-box;
        margin: 0;
        background-color: transparent !important;
        background-image: none !important;
    }

    #programPlanTable th:nth-child(1),
    #programPlanTable td:nth-child(1) {
        width: 9%;
    }

    #programPlanTable th:nth-child(2),
    #programPlanTable td:nth-child(2) {
        width: 11%;
    }

    #programPlanTable th:nth-child(3),
    #programPlanTable td:nth-child(3) {
        width: 13%;
    }

    #programPlanTable th:nth-child(4),
    #programPlanTable td:nth-child(4) {
        width: 19%;
    }

    #programPlanTable th:nth-child(5),
    #programPlanTable td:nth-child(5) {
        width: 16%;
    }

    #programPlanTable th:nth-child(6),
    #programPlanTable td:nth-child(6) {
        width: 12%;
    }

    #programPlanTable th:nth-child(7),
    #programPlanTable td:nth-child(7) {
        width: 11%;
    }

    #programPlanTable th:nth-child(8),
    #programPlanTable td:nth-child(8) {
        width: 10%;
    }

    /* ---------------- APPROVALS ---------------- */
.approvals-container {
    width: 100%;
    margin-top: 45px !important;
    font-family: Calibri, "Calibri (Body)", Arial, sans-serif !important;
    font-size: 12px;
    color: #000 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

.approvals-container .label {
    font-weight: bold;
    text-align: left;
    margin-bottom: 35px;
    font-size: 12px;
}

.approval-row {
    display: flex;
    justify-content: space-between;
    gap: 60px;
    width: 100%;
    margin-bottom: 25px;
}

.signature-group {
    flex: 1;
    text-align: left;
}

.approvals-container .signature-line {
    display: inline-block;
    width: 280px !important;
    min-height: 22px;
    border-bottom: 1px solid #000 !important;
    padding: 0 0 2px 0;
    margin-bottom: 3px;
    font-weight: normal;
    font-size: 12px;
    text-transform: none;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
}

.approvals-container .title {
    text-align: left;
    margin-top: 2px;
    font-size: 12px;
    font-weight: bold;
}

.approval-centered {
    width: 100%;
    margin-top: 40px;
    text-align: center;
}

.approval-centered .left-align {
    text-align: left;
    margin-bottom: 65px;
}

.admin-block {
    width: 420px;
    margin: 0 auto 45px auto;
    text-align: center;
}

.approvals-container .name-underlined {
    display: inline-block;
    min-width: 280px;
    border-bottom: 1px solid #000 !important;
    padding-bottom: 1px;
    text-align: center;
    font-weight: bold;
    font-size: 12px;
    line-height: 1.2;
    text-transform: uppercase;
}

.admin-block .title {
    text-align: center;
    margin-top: 3px;
    font-size: 12px;
    font-weight: bold;
}

/* created_by_name and dean = left */
#created_by_name,
#dean {
    text-align: left !important;
}

/* ces_head = right */
#ces_head {
    text-align: right !important;
}

/* vp_acad, vp_admin, school_president = center */
#vp_acad,
#vp_admin,
#school_president {
    text-align: center !important;
}
    

    /* ================= DOCUMENT INFO (SMALLER VERSION) ================= */
.document-info {
    margin-top: 30px !important;
    width: 240px !important; /* reduced from 305px */
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

.doc-header {
    width: 240px !important;
    border-collapse: collapse !important;
    font-family: Calibri, "Calibri (Body)", Arial, sans-serif !important;
    font-size: 9px !important; /* smaller font */
    margin-left: 0 !important;
    margin-right: auto !important;
    table-layout: auto !important;
}

.doc-header td {
    border: 1px solid #d1d1d1 !important;
    padding: 2px 4px !important; /* tighter padding */
    height: 18px; /* reduced height */
}

.doc-header td.label {
    background-color: #002060 !important;
    color: #ffffff !important;
    font-weight: bold;
    text-align: left;
    white-space: nowrap;
    width: 80px !important;

    font-size: 11px !important;   /* 🔥 FIX: make it smaller */
    line-height: 1.1 !important; /* tighter text */
}

.doc-header td:nth-child(2) {
    width: 6px !important;
    min-width: 6px !important;
    max-width: 6px !important;
    padding: 0 !important;
    text-align: center;
    font-weight: bold;
    color: #000000 !important;
    background: #ffffff !important;
}

.doc-header td.value {
    width: 150px !important; /* reduced */
    color: #000000 !important;
    background: #ffffff !important;
    text-align: left;
    white-space: nowrap;
}

.doc-header td.value .printable-field,
.doc-header td.value input,
.doc-header td.value p {
    border: none !important;
    background: transparent !important;
    font-family: inherit;
    font-size: 9px !important; /* match smaller size */
    color: #000000 !important;
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: auto;
    line-height: 1.2;
    box-shadow: none !important;
    outline: none !important;
}

    .print-content,
.print-content *,
#programPlanTable,
#programPlanTable th,
#programPlanTable td,
#programPlanTable .printable-field,
#programPlanTable .printable-paper-lines,
.printable-field,
.printable-paper-lines,
.input-group label,
.approvals-container,
.approvals-container *,
.document-info,
.document-info * {
    font-size: 15px !important;
}

.approvals-container,
.approvals-container * {
    font-weight: bold !important;
}

.approvals-container .signature-line,
.approvals-container .name-underlined {
    display: inline-block;
    width: auto !important;
    min-width: 180px;
    max-width: 100%;
    padding: 0 12px 2px 12px;
    border-bottom: 1px solid #000 !important;
    text-decoration: none !important;
    white-space: normal;
    overflow-wrap: anywhere;
}

.approvals-container .signature-line {
    text-align: inherit;
    text-transform: uppercase;
}

.approvals-container .name-underlined {
    text-align: center;
}

.print-layout > tfoot > tr > td {
    vertical-align: bottom !important;
}
    @media print {
        html,
        body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
        }
    }
</style>
</head>

<body>
    <div class="print-root">
        <table class="print-layout" role="presentation">
            <thead>
                <tr>
                    <td>
                        <div class="print-header-wrap">
                            <div class="header-content">
                                ${leftLogoSrc ? `<img src="${escapeHtml(leftLogoSrc)}" alt="SMCC Logo" class="logo-left">` : ''}
                                ${left2LogoSrc ? `<img src="${escapeHtml(left2LogoSrc)}" alt="CES Logo" class="logo-left2">` : ''}

                                <div class="college-info">
                                    <h1>Saint Michael College of Caraga</h1>
                                    <p>Brgy. 4, Nasipit, Agusan del Norte, Philippines</p>
                                    <p>District 8, Brgy. Triangulo, Nasipit, Agusan del Norte, Philippines</p>
                                    <p>Tel Nos. +63 085 343-3251 / +63 085 283-3113</p>
                                    <a href="http://www.smccnasipit.edu.ph">www.smccnasipit.edu.ph</a>
                                </div>

                                <div class="logos-right">
                                    ${rightLogoSrc ? `<img src="${escapeHtml(rightLogoSrc)}" alt="SOCOTEC Logo">` : ''}
                                </div>
                            </div>

                            <h2 class="office-title">OFFICE OF THE COMMUNITY EXTENSION SERVICES</h2>
                            <div class="double-line"></div>
                        </div>
                    </td>
                </tr>
            </thead>

            <tfoot>
                <tr>
                    <td>
                        <div class="print-footer-wrap">
                            <div class="print-footer-inner">
                                ${footerLogoSrc ? `<img src="${escapeHtml(footerLogoSrc)}" alt="Org Logo" class="print-footer-logo">` : ''}
                            </div>
                        </div>
                    </td>
                </tr>
            </tfoot>

            <tbody>
                <tr>
                    <td>
                        <main class="print-main">
                            <div class="print-content" id="printContent"></div>
                        </main>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>
        `);

        doc.close();

        const printContent = doc.getElementById('printContent');
        printContent.appendChild(clonedContent);

        convertFormControlsToPrintable(printContent);

        await waitForImages(doc);
        await nextFrame(iframe.contentWindow);
        await nextFrame(iframe.contentWindow);

        await printIframeAndCleanup(iframe, printButton, {
            originalButtonText,
            originalButtonDisabled
        });

    } catch (error) {
        console.error('Print error:', error);
        alert('Printing failed. Please try again.');

        if (printButton) {
            printButton.textContent = originalButtonText;
            printButton.disabled = originalButtonDisabled;
        }
    }
}

function fixProgramPlanTableHeader(root) {
    const table = root.querySelector('#programPlanTable');
    if (!table) return;

    let thead = table.querySelector('thead');

    if (!thead) {
        thead = document.createElement('thead');
        table.insertBefore(thead, table.firstChild);
    }

    thead.innerHTML = `
        <tr>
            <th rowspan="2">Program</th>
            <th rowspan="2">Objectives</th>
            <th rowspan="2">Strategies and<br>Action Plans</th>
            <th colspan="3">Resources Needed</th>
            <th rowspan="2">Means of<br>Verification</th>
            <th rowspan="2">Time<br>Frame</th>
        </tr>

        <tr>
            <th>
                Resources from the<br>
                School (Human<br>
                Resources,<br>
                Collaborating Agencies<br>
                and Equipment)
            </th>

            <th>
                Resources from the<br>
                Community<br>
                (Human Resources,<br>
                Collaborating<br>
                Agencies and<br>
                Equipment)
            </th>

            <th>
                Budget and<br>
                funding
            </th>
        </tr>
    `;
}

function createPrintIframe() {
    const iframe = document.createElement('iframe');

    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';

    iframe.setAttribute('aria-hidden', 'true');

    document.body.appendChild(iframe);

    return iframe;
}

function syncFormValues(sourceRoot, clonedRoot) {
    const sourceFields = sourceRoot.querySelectorAll('input, textarea, select');
    const clonedFields = clonedRoot.querySelectorAll('input, textarea, select');

    sourceFields.forEach((sourceField, index) => {
        const clonedField = clonedFields[index];

        if (!clonedField) return;

        const tag = sourceField.tagName.toLowerCase();

        if (tag === 'textarea') {
            clonedField.value = sourceField.value;
            clonedField.textContent = sourceField.value;
            return;
        }

        if (tag === 'select') {
            clonedField.value = sourceField.value;

            Array.from(clonedField.options).forEach(option => {
                option.selected = option.value === sourceField.value;
            });

            return;
        }

        if (tag === 'input') {
            const type = (sourceField.type || '').toLowerCase();

            if (type === 'checkbox' || type === 'radio') {
                clonedField.checked = sourceField.checked;

                if (sourceField.checked) {
                    clonedField.setAttribute('checked', 'checked');
                } else {
                    clonedField.removeAttribute('checked');
                }
            } else {
                clonedField.value = sourceField.value;
                clonedField.setAttribute('value', sourceField.value);
            }
        }
    });
}

function removeNonPrintable(root) {
    const selectors = [
        '#headerFrame',
        '#sidebarFrame',
        '.buttons',
        '.admin-comment',
        '#admincomment',
        '.no-print',
        '.print-hide',
        '[data-no-print="true"]',
        'button',
        'script',
        'noscript',
        '.ai-search-bar',
        '.recommendation-section',
        '#recommendation-container',
        '.form-actions',
        '.add-row-btn',
        '.delete-row-btn'
    ];

    selectors.forEach(selector => {
        root.querySelectorAll(selector).forEach(element => {
            element.remove();
        });
    });
}

function removeInternalReportTitleBlock(root) {
    const internalHeader = root.querySelector('#header');

    if (internalHeader) {
        internalHeader.remove();
    }
}

function convertFormControlsToPrintable(root) {
    if (!root) return;

    const fields = root.querySelectorAll('input, textarea, select');

    fields.forEach(field => {
        const tag = field.tagName.toLowerCase();
        const replacement = document.createElement('div');

        const hasPaperLines =
            field.classList.contains('paper-lines') ||
            field.closest('.paper-lines') !== null;

        if (tag === 'textarea') {
            replacement.className = hasPaperLines ? 'printable-paper-lines' : 'printable-field';
            replacement.textContent = field.value || '';
            field.replaceWith(replacement);
            return;
        }

        if (tag === 'select') {
            replacement.className = 'printable-field';

            const selectedText =
                field.options[field.selectedIndex]
                    ? field.options[field.selectedIndex].text
                    : (field.value || '');

            replacement.textContent = selectedText;
            field.replaceWith(replacement);
            return;
        }

        if (tag === 'input') {
            const type = (field.type || 'text').toLowerCase();

            if (['hidden', 'button', 'submit', 'reset', 'file'].includes(type)) {
                field.remove();
                return;
            }

            replacement.className = 'printable-field';

            if (type === 'checkbox') {
                replacement.textContent = field.checked ? '✓ Checked' : '□ Unchecked';
                field.replaceWith(replacement);
                return;
            }

            if (type === 'radio') {
                replacement.textContent = field.checked ? '◉ Selected' : '○';
                field.replaceWith(replacement);
                return;
            }

            replacement.textContent = field.value || '';
            field.replaceWith(replacement);
        }
    });
}

function waitForImages(doc) {
    const images = Array.from(doc.images || []);

    if (!images.length) return Promise.resolve();

    return Promise.all(
        images.map(image => {
            if (image.complete && image.naturalWidth > 0) {
                return Promise.resolve();
            }

            return new Promise(resolve => {
                const done = () => {
                    image.removeEventListener('load', done);
                    image.removeEventListener('error', done);
                    resolve();
                };

                image.addEventListener('load', done, { once: true });
                image.addEventListener('error', done, { once: true });

                setTimeout(done, 3000);
            });
        })
    );
}

function nextFrame(win) {
    return new Promise(resolve => {
        win.requestAnimationFrame(() => resolve());
    });
}

function printIframeAndCleanup(iframe, printButton, state) {
    return new Promise(resolve => {
        const win = iframe.contentWindow;
        let cleaned = false;

        const cleanup = () => {
            if (cleaned) return;

            cleaned = true;

            try {
                win.onafterprint = null;
            } catch (error) {}

            setTimeout(() => {
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }

                if (printButton) {
                    printButton.textContent = state.originalButtonText;
                    printButton.disabled = state.originalButtonDisabled;
                }

                resolve();
            }, 200);
        };

        win.onafterprint = cleanup;
        setTimeout(cleanup, 5000);

        win.focus();
        win.print();
    });
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.printReport = printReport;
