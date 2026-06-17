/**
 * print.js - Monthly Accomplishment Report
 */

async function printReport() {
    const mainContent = document.querySelector('#main_content');

    if (!mainContent) {
        alert('Unable to print: report content not found.');
        return;
    }

    const originalTitle = document.title;
    document.title = 'Monthly_Accomplishment_Report';

    try {
        const printFrame = createPrintIframe();
        const printDoc = printFrame.contentDocument || printFrame.contentWindow.document;

        const headerHTML = buildPrintHeaderHtml();
        const footerHTML = buildPrintFooterHtml();
        const printableBody = buildPrintableBody(mainContent);

        printDoc.open();
        printDoc.write(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Monthly Accomplishment Report</title>

<style>
    * {
        box-sizing: border-box !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
    }

    @page {
        size: A4 portrait;
        margin: 10mm 8mm 10mm 8mm;
    }

    html,
    body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        background: #fff !important;
        color: #000 !important;
        font-family: "Calibri Light", Calibri, Arial, sans-serif !important;
        font-size: 9px !important;
        line-height: 1.25 !important;
        overflow: visible !important;
    }

    #print-container {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        background: #fff !important;
    }

    .print-shell {
        width: 100% !important;
        max-width: 100% !important;
        border-collapse: collapse !important;
        border-spacing: 0 !important;
        table-layout: fixed !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    .print-shell thead {
        display: table-header-group !important;
    }

    .print-shell tfoot {
        display: table-footer-group !important;
    }

    .print-shell tbody {
        display: table-row-group !important;
    }

    .print-shell tr,
    .print-shell td {
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        vertical-align: top !important;
    }

    .print-header {
        width: 100% !important;
        padding: 0 0 6px 0 !important;
        margin: 0 !important;
        background: #fff !important;
    }

    .print-body {
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
        overflow: visible !important;
        background: #fff !important;
    }

    .print-footer {
        width: 100% !important;
        padding: 6px 0 0 0 !important;
        margin: 0 !important;
        background: #fff !important;
    }

    .print-content,
    .print-body-wrapper,
    #main_content {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
        overflow: visible !important;
        background: #fff !important;
    }

    #headerFrame,
    #sidebarFrame,
    .buttons,
    #downloadPDF,
    .admin-comment,
    .no-print,
    .print-hide,
    .action-buttons,
    .wrapper,
    [data-no-print="true"],
    button,
    script,
    noscript {
        display: none !important;
    }

    .print-page-header {
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
    }

/* ===== HEADER FIX (NO OVERFLOW) ===== */
    .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        width: 100%;
        gap: 12px;
    }

    .left-logos {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 12px;
        flex: 0 0 auto;
        white-space: nowrap;
    }

    .logo-left {
        height: 90px !important;
        width: auto !important;
        display: block !important;
        flex: 0 0 auto !important;
    }

    .logo-left2 {
        height: 80px !important;
        width: auto !important;
        display: block !important;
        flex: 0 0 auto !important;
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
    .report-title {
        display: block !important;
        visibility: visible !important;
        text-align: center !important;
        font-family: "Century Gothic", Arial, sans-serif !important;
        font-size: 15px !important;
        font-weight: bold !important;
        letter-spacing: 1px !important;
        margin: 10px 0 14px 0 !important;
        padding: 0 !important;
        text-transform: uppercase !important;
        color: #000 !important;
        line-height: 1.2 !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
    }

    table {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        border-collapse: collapse !important;
        table-layout: fixed !important;
    }

    .header-table {
        width: 100% !important;
        max-width: 100% !important;
        border-collapse: collapse !important;
        table-layout: fixed !important;
        margin: 0 0 10px 0 !important;
    }

    .header-table td {
        border: 1px solid #000 !important;
        padding: 5px !important;
        font-size: 15px !important;
        word-break: break-word !important;
        overflow-wrap: anywhere !important;
        white-space: normal !important;
    }

    .header-table td.label {
        width: 30% !important;
        font-weight: bold !important;
    }

    .header-table td.input_cell {
        width: 70% !important;
    }

    .main-table {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        border-collapse: collapse !important;
        table-layout: fixed !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    .main-table th,
    .main-table td {
        border: 1px solid #000 !important;
        padding: 4px 3px !important;
        font-size: 15px !important;
        line-height: 1.2 !important;
        vertical-align: top !important;
        word-break: break-word !important;
        overflow-wrap: anywhere !important;
        white-space: normal !important;
        hyphens: auto !important;
    }

    .main-table th {
        background-color: #e0e0e0 !important;
        color: #000 !important;
        text-align: center !important;
        vertical-align: top !important;
        font-weight: bold !important;
    }

    tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    thead {
        display: table-header-group !important;
    }

    tfoot {
        display: table-footer-group !important;
    }

    .print-approval-section {
        margin-top: 18px !important;
        padding-top: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
        font-family: Arial, sans-serif !important;
        font-size: 14px !important;
        color: #000 !important;
    }

    .approvals-container {
        width: 100% !important;
        max-width: 100% !important;
        margin-top: 0 !important;
        padding: 0 !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
    }

    .approvals-container .label,
    .print-approval-section .label {
        font-weight: bold !important;
        text-align: left !important;
        font-size: 15px !important;
        margin-bottom: 35px !important;
        color: #000 !important;
    }

    .approval-row {
        display: flex !important;
        flex-direction: row !important;
        justify-content: space-between !important;
        align-items: flex-start !important;
        gap: 90px !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 0 22px 0 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    .signature-group {
        flex: 0 0 34% !important;
        max-width: 34% !important;
        min-width: 34% !important;
    }

    .approval-row .signature-group:nth-child(2) {
        margin-right: 8% !important;
    }

    .signature-line {
        border-bottom: 1.5px solid #000 !important;
        min-height: 18px !important;
        margin-bottom: 3px !important;
        padding-bottom: 1px !important;
        font-size: 14px !important;
        font-weight: normal !important;
        color: #000 !important;
    }

    .title {
        font-size: 13px !important;
        line-height: 1.2 !important;
        color: #000 !important;
    }

    .title.bold,
    .bold {
        font-weight: bold !important;
    }

    .approval-centered {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        width: 100% !important;
        margin: 36px 0 0 0 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    .approval-centered .label,
    .approval-centered .left-align {
        align-self: flex-start !important;
        width: 100% !important;
        margin-bottom: 45px !important;
        font-weight: bold !important;
        text-align: left !important;
        font-size: 15px !important;
    }

    .admin-block {
        width: 100% !important;
        text-align: center !important;
        margin: 0 0 30px 0 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    .name-underlined {
        display: inline-block !important;
        min-width: 230px !important;
        text-align: center !important;
        text-decoration: underline !important;
        font-size: 15px !important;
        font-weight: bold !important;
        line-height: 1.15 !important;
        color: #000 !important;
    }

    .admin-block .title {
        text-align: center !important;
        font-size: 13px !important;
        font-weight: bold !important;
        margin-top: 2px !important;
    }

    .print-document-info-section {
        margin-top: 12px !important;
        width: 100% !important;
        display: block !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        clear: both !important;
    }

    .document-info {
        width: 305px !important;
        max-width: 305px !important;
        margin: 0 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    .doc-header {
        width: 100% !important;
        border-collapse: collapse !important;
        table-layout: fixed !important;
        font-family: Arial, sans-serif !important;
        font-size: 11px !important;
    }

    .doc-header td.label {
        width: 40% !important;
        padding: 5px 8px !important;
        background-color: #002060 !important;
        color: #ffffff !important;
        font-weight: bold !important;
        border: 1px solid #000 !important;
        text-align: left !important;
        white-space: nowrap !important;
    }

    .doc-header td:nth-child(2) {
        width: 5% !important;
        text-align: center !important;
        font-weight: bold !important;
        border-top: 1px solid #000 !important;
        border-bottom: 1px solid #000 !important;
    }

    .doc-header td.value {
        width: 55% !important;
        padding: 5px 8px !important;
        border: 1px solid #000 !important;
        font-size: 11px !important;
    }

    .doc-header input {
        width: 100% !important;
        border: none !important;
        outline: none !important;
        background: transparent !important;
        font-size: 11px !important;
        font-family: inherit !important;
        padding: 0 !important;
    }

    .document_type {
        margin: 0 !important;
        font-size: 11px !important;
    }

    .printable-field {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        min-height: 1em !important;
        white-space: pre-wrap !important;
        word-break: break-word !important;
        overflow-wrap: anywhere !important;
        border: none !important;
        background: transparent !important;
        color: inherit !important;
        font-size: inherit !important;
        line-height: inherit !important;
    }

    .printable-checkbox {
        display: inline-block !important;
        color: red !important;
        font-weight: bold !important;
    }

    .print-footer-inner {
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
    }

    .print-footer-logo {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        object-fit: contain !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    img {
        max-width: 100% !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    @media print {
        html,
        body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
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
        <table class="print-shell" role="presentation">
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
                            <div class="print-content" id="printContent"></div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>
        `);

        printDoc.close();

        const printContent = printDoc.getElementById('printContent');
        printContent.appendChild(printableBody);

        convertFormControlsToPrintable(printContent);

        await waitForImages(printDoc);
        await waitForFonts(printDoc);

        forceTopSpacingReset(printDoc);

        await nextFrame(printFrame.contentWindow);
        await nextFrame(printFrame.contentWindow);

        await runPrintAndCleanup(printFrame);

    } catch (error) {
        console.error('Print failed:', error);
        alert('Printing failed. Please try again.');
    } finally {
        document.title = originalTitle;
    }
}

function buildPrintableBody(mainContent) {
    const wrapper = document.createElement('div');
    wrapper.className = 'print-body-wrapper';

    const clonedMainContent = mainContent.cloneNode(true);

    removeNonPrintable(clonedMainContent);
    syncFormValues(mainContent, clonedMainContent);

    clonedMainContent.querySelectorAll(
        [
            '.print-page-header',
            '.header-content',
            '.college-info',
            '.office-title',
            '.double-line',
            '.left-logos',
            '.logo-left',
            '.logo-left2',
            '.logos-right',
            '.page-header',
            '.header',
            '.report-header',
            '.school-header',
            '.document-header'
        ].join(',')
    ).forEach(el => el.remove());

    clonedMainContent.querySelectorAll('.report-title').forEach(el => el.remove());

    Array.from(clonedMainContent.querySelectorAll('h1')).forEach(h1 => {
        if ((h1.textContent || '').trim().toUpperCase() === 'MONTHLY ACCOMPLISHMENT REPORT') {
            h1.remove();
        }
    });

    const reportTitle = document.createElement('h1');
    reportTitle.className = 'report-title';
    reportTitle.textContent = 'MONTHLY ACCOMPLISHMENT REPORT';

    wrapper.appendChild(reportTitle);
    wrapper.appendChild(clonedMainContent);

    const approvalSource =
        document.querySelector('.approvals-container') ||
        document.querySelector('.approval-row')?.closest('section, div');

    if (approvalSource && !clonedMainContent.contains(approvalSource)) {
        const approvalClone = approvalSource.cloneNode(true);

        removeNonPrintable(approvalClone);
        syncFormValues(approvalSource, approvalClone);

        const approvalWrap = document.createElement('div');
        approvalWrap.className = 'print-approval-section';
        approvalWrap.appendChild(approvalClone);
        wrapper.appendChild(approvalWrap);
    }

    const documentInfoSource =
        document.querySelector('.document-info') ||
        document.querySelector('.doc-header')?.closest('.document-info, div');

    if (documentInfoSource && !clonedMainContent.contains(documentInfoSource)) {
        const documentInfoClone = documentInfoSource.cloneNode(true);

        removeNonPrintable(documentInfoClone);
        syncFormValues(documentInfoSource, documentInfoClone);

        const documentInfoWrap = document.createElement('div');
        documentInfoWrap.className = 'print-document-info-section';
        documentInfoWrap.appendChild(documentInfoClone);
        wrapper.appendChild(documentInfoWrap);
    }

    return wrapper;
}

function buildPrintHeaderHtml() {
    const leftLogo = document.querySelector('.logo-left')?.src || '';
    const leftLogo2 = document.querySelector('.logo-left2')?.src || '';

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
            <p><a href="https://www.smccnasipit.edu.ph">www.smccnasipit.edu.ph</a></p>
        `;

    return `
        <div class="print-page-header">
            <div class="header-content">

                <div class="left-logos">
                    ${
                        leftLogo
                            ? `<img src="${escapeHtml(leftLogo)}" alt="Logo" class="logo-left">`
                            : ''
                    }

                    ${
                        leftLogo2
                            ? `<img src="${escapeHtml(leftLogo2)}" alt="Logo" class="logo-left2">`
                            : ''
                    }
                </div>

                <div class="college-info">
                    ${collegeInfoHtml}
                </div>

                <div class="logos-right">
                    ${rightLogos.map(src => `<img src="${escapeHtml(src)}" alt="Logo">`).join('')}
                </div>

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
            ${
                footerImg
                    ? `<img src="${escapeHtml(footerImg)}" alt="Footer Logo" class="print-footer-logo">`
                    : ''
            }
        </div>
    `;
}

function createPrintIframe() {
    const oldFrame = document.getElementById('monthlyPrintFrame');

    if (oldFrame) {
        oldFrame.remove();
    }

    const iframe = document.createElement('iframe');

    iframe.id = 'monthlyPrintFrame';
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

function removeNonPrintable(root) {
    const selectors = [
        '#headerFrame',
        '#sidebarFrame',
        '.buttons',
        '#downloadPDF',
        '.admin-comment',
        '.no-print',
        '.print-hide',
        '.action-buttons',
        '.wrapper',
        '[data-no-print="true"]',
        'button',
        'script',
        'noscript'
    ];

    selectors.forEach(selector => {
        root.querySelectorAll(selector).forEach(el => el.remove());
    });
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

            Array.from(clonedField.options).forEach(opt => {
                opt.selected = opt.value === sourceField.value;
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

function convertFormControlsToPrintable(root) {
    if (!root) return;

    const fields = root.querySelectorAll('input, textarea, select');

    fields.forEach(field => {
        const tag = field.tagName.toLowerCase();
        const replacement = document.createElement('div');

        replacement.className = 'printable-field';

        if (tag === 'textarea') {
            replacement.textContent = field.value || '';
            field.replaceWith(replacement);
            return;
        }

        if (tag === 'select') {
            const selectedText = field.options[field.selectedIndex]
                ? field.options[field.selectedIndex].text
                : field.value || '';

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

            if (type === 'checkbox') {
                replacement.innerHTML = `<span class="printable-checkbox">${field.checked ? '&#10003;' : '&#9633;'}</span>`;
                field.replaceWith(replacement);
                return;
            }

            if (type === 'radio') {
                replacement.innerHTML = `<span class="printable-checkbox">${field.checked ? '&#9679;' : '&#9675;'}</span>`;
                field.replaceWith(replacement);
                return;
            }

            replacement.textContent = field.value || '';
            field.replaceWith(replacement);
        }
    });
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

function forceTopSpacingReset(doc) {
    const printContent = doc.getElementById('printContent');
    const bodyWrapper = doc.querySelector('.print-body-wrapper');
    const mainContent = doc.querySelector('#main_content');
    const firstBlock = doc.querySelector('#printContent > .print-body-wrapper > *:first-child');

    if (printContent) {
        printContent.style.marginTop = '0';
        printContent.style.paddingTop = '0';
    }

    if (bodyWrapper) {
        bodyWrapper.style.marginTop = '0';
        bodyWrapper.style.paddingTop = '0';
    }

    if (mainContent) {
        mainContent.style.marginTop = '0';
        mainContent.style.paddingTop = '0';
        mainContent.style.maxWidth = '100%';
        mainContent.style.width = '100%';
        mainContent.style.overflow = 'visible';
    }

    if (firstBlock) {
        firstBlock.style.marginTop = '0';
        firstBlock.style.paddingTop = '0';
    }
}

function nextFrame(win) {
    return new Promise(resolve => {
        win.requestAnimationFrame(() => resolve());
    });
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

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.printReport = printReport;
