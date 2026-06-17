// print.js - Program Design Form
// Repeats header/footer on every printed page and prevents overlap.

async function printReport() {
    const formContainer =
        document.querySelector('.form-container') ||
        document.querySelector('#main_content') ||
        document.querySelector('form');

    if (!formContainer) {
        alert('Unable to print: form content not found.');
        return;
    }

    const originalTitle = document.title;
    document.title = 'Program_Design_Form';

    try {
        const iframe = createPrintIframe();
        const doc = iframe.contentDocument || iframe.contentWindow.document;

        const headerHTML = buildPrintHeaderHtml();
        const footerHTML = buildPrintFooterHtml();
        const printableBody = buildPrintableBody(formContainer);

        doc.open();
        doc.write(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Program Design Form</title>
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
    margin: 12mm;
}

html,
body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    background: #fff !important;
    color: #000 !important;
    font-family: Calibri, Arial, sans-serif !important;
    font-size: 11pt !important;
    line-height: 1.4;
    overflow-x: hidden !important;
    overflow-y: visible !important;
}

#print-container {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    overflow: hidden !important;
}

.print-shell {
    width: 100% !important;
    max-width: 100% !important;
    border-collapse: collapse !important;
    border-spacing: 0 !important;
    table-layout: fixed !important;
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

.print-shell > thead > tr,
.print-shell > tbody > tr,
.print-shell > tfoot > tr,
.print-shell > thead > tr > td,
.print-shell > tbody > tr > td,
.print-shell > tfoot > tr > td {
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    vertical-align: top !important;
    background: #fff !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
}

.print-header-shell {
    padding: 0 0 8px 0 !important;
    background: #fff !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
}

.print-footer-shell {
    padding: 12px 0 0 0 !important;
    background: #fff !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
}

.print-body {
    padding: 0 0 35px 0 !important;
    margin: 0 !important;
    background: #fff !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
}

.print-content,
.print-body-wrapper,
.form-container,
#main_content {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    background: #fff !important;
    overflow: hidden !important;
}

.print-content *,
.print-body-wrapper *,
.form-container *,
#main_content * {
    max-width: 100% !important;
    overflow-wrap: break-word !important;
    word-break: normal !important;
}

.print-body-wrapper > *:first-child,
.form-container > *:first-child,
#main_content > *:first-child {
    margin-top: 0 !important;
    padding-top: 0 !important;
}

#sidebarFrame,
#headerFrame,
.buttons,
.admin-comment,
.no-print,
.print-hide,
[data-no-print="true"],
button,
script,
noscript,
.print-header,
.print-footer,
footer,
.footer-bottom,
.footer-logos {
    display: none !important;
}

/* Header */
.print-page-header {
    margin: 0 !important;
    padding: 0 !important;
    font-family: Arial, sans-serif !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
}

.header-content {
    display: grid !important;
    grid-template-columns: 70px 70px minmax(0, 1fr) 135px !important;
    align-items: center !important;
    margin-bottom: 10px !important;
    width: 100% !important;
    max-width: 100% !important;
    gap: 8px !important;
    overflow: hidden !important;
}

.logo-left,
.logo-left2 {
    height: 68px !important;
    width: auto !important;
    max-width: 70px !important;
    display: block !important;
    justify-self: center !important;
}

.logos-right {
    display: flex !important;
    gap: 8px !important;
    align-items: center !important;
    justify-content: flex-end !important;
    width: 155px !important;
    max-width: 155px !important;
    overflow: hidden !important;
    margin-right: 0 !important;
    position: relative !important;
    left: -32px !important;
}

.logos-right img {
    height: 68px !important;
    width: auto !important;
    max-width: 62px !important;
    display: block !important;
}

.college-info {
    text-align: center !important;
    justify-self: center !important;
    width: 100% !important;
    min-width: 0 !important;
    padding: 0 4px !important;
    overflow: hidden !important;
}

.college-info h1 {
    font-family: "Times New Roman", Times, serif !important;
    color: #4f81bd !important;
    font-size: 21px !important;
    margin: 0 !important;
    font-weight: normal !important;
    line-height: 1.1 !important;
    text-align: center !important;
}

.college-info p {
    font-family: Arial, sans-serif !important;
    font-size: 11px !important;
    margin: 2px 0 !important;
    color: #333 !important;
    line-height: 1.25 !important;
    text-align: center !important;
}

.college-info a {
    font-family: Arial, sans-serif !important;
    font-size: 12px !important;
    color: #0000EE !important;
    text-decoration: underline !important;
    word-break: break-all !important;
}

.office-title {
    font-family: Arial, sans-serif !important;
    text-align: center !important;
    font-size: 16px !important;
    color: #595959 !important;
    font-weight: bold !important;
    margin: 12px 0 5px 0 !important;
    letter-spacing: 0.5px !important;
    text-transform: uppercase !important;
}

.double-line {
    border-top: 4px double #4f81bd !important;
    margin-bottom: 18px !important;
}

/* Form title */
.form-type {
    font-family: "Courier New", Courier, monospace !important;
    text-align: center !important;
    margin: 0 0 30px 0 !important;
    font-size: 13pt !important;
    font-weight: bold !important;
    letter-spacing: 2px !important;
    text-transform: uppercase !important;
}

h1,
h2 {
    font-family: Calibri, Arial, sans-serif !important;
    text-align: center;
    margin: 0 0 25px 0 !important;
    font-size: 12pt !important;
    text-transform: uppercase;
}

h3 {
    font-family: Calibri, Arial, sans-serif !important;
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 11pt !important;
}

/* Input fields */
.input-fields,
.header-info {
    width: 100% !important;
    max-width: 100% !important;
    margin-top: 0 !important;
    margin-bottom: 48px !important;
    font-family: Calibri, Arial, sans-serif !important;
    font-size: 12pt !important;
}

.input-fields .field,
.input-group {
    display: grid !important;
    grid-template-columns: 145px minmax(0, 1fr) !important;
    align-items: center !important;
    column-gap: 8px !important;
    margin-bottom: 14px !important;
    font-family: Calibri, Arial, sans-serif !important;
    font-size: 12pt !important;
    width: 100% !important;
    max-width: 100% !important;
}

.input-fields .field label,
.input-group label {
    font-family: Calibri, Arial, sans-serif !important;
    font-weight: bold !important;
    font-size: 12pt !important;
    color: #000 !important;
    white-space: nowrap !important;
    text-align: left !important;
}

.input-fields .field input,
.input-fields .field textarea,
.input-fields .field select,
.input-fields .field .printable-field,
.input-group input,
.input-group textarea,
.input-group select,
.input-group .printable-field {
    font-family: Calibri, Arial, sans-serif !important;
    font-size: 12pt !important;
    width: 100% !important;
    max-width: 100% !important;
    min-height: 24px !important;
    border: none !important;
    border-bottom: 1px solid #cfcfcf !important;
    padding: 2px 6px 4px 6px !important;
    background: transparent !important;
    color: #000 !important;
    text-align: left !important;
    line-height: 1.2 !important;
}

/* Table form */
.table_form,
.program-table {
    font-family: Calibri, Arial, sans-serif !important;
    font-size: 10pt !important;
    width: 100% !important;
    max-width: 100% !important;
    border-collapse: collapse !important;
    table-layout: fixed !important;
    margin-top: 0 !important;
    margin-bottom: 20px !important;
    color: #000 !important;
    overflow: hidden !important;
}

.table_form {
    display: block !important;
    overflow: hidden !important;
}

.table_form table,
.program-table {
    width: 100% !important;
    max-width: 100% !important;
    table-layout: fixed !important;
}

.table_form th,
.table_form td,
.program-table th,
.program-table td {
    font-family: Calibri, Arial, sans-serif !important;
    font-size: 9.5pt !important;
    border: 1px solid #9e9e9e !important;
    padding: 5px 4px !important;
    font-weight: normal !important;
    text-align: center !important;
    vertical-align: top !important;
    color: #000 !important;
    word-break: normal !important;
    overflow-wrap: anywhere !important;
    line-height: 1.2 !important;
}

.table_form th,
.program-table th {
    background-color: #d9d9d9 !important;
    font-weight: normal !important;
    vertical-align: middle !important;
}

.table_form td,
.program-table td {
    background-color: #fff !important;
    min-height: 28px !important;
}

.table_form tr,
.program-table tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

.table_form td[contenteditable="true"],
.program-table td[contenteditable="true"] {
    background-color: #fff !important;
    outline: none !important;
}

.table_form input,
.table_form textarea,
.table_form select,
.table_form .printable-field,
.program-table input,
.program-table textarea,
.program-table select,
.program-table .printable-field {
    width: 100% !important;
    max-width: 100% !important;
    min-height: 16px !important;
    padding: 0 !important;
    border: none !important;
    background: transparent !important;
    font-family: Calibri, Arial, sans-serif !important;
    font-size: 9.5pt !important;
    text-align: center !important;
    line-height: 1.2 !important;
    white-space: pre-wrap !important;
    word-break: normal !important;
    overflow-wrap: anywhere !important;
}

/* General table reset */
table {
    border-collapse: collapse !important;
    max-width: 100% !important;
}

th,
td {
    color: #000 !important;
}

input,
textarea,
select {
    border: none !important;
    background: transparent !important;
    color: #000 !important;
    font-family: inherit !important;
    font-size: inherit !important;
}

.printable-field {
    display: block;
    width: 100%;
    max-width: 100%;
    min-height: 16px;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
    border: none !important;
    background: transparent !important;
    color: #000 !important;
}

/* Checkboxes */
.printable-box {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 13px !important;
    height: 13px !important;
    border: 1px solid #000 !important;
    background: #fff !important;
    color: transparent !important;
    font-size: 10px !important;
    line-height: 1 !important;
    vertical-align: middle !important;
}

.printable-box.checked {
    background: #fff !important;
    color: #000 !important;
    font-weight: bold !important;
}

.printable-box.checked::before {
    content: "✓";
}

/* ===== APPROVALS ===== */
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

.approval-section:first-child .label {
    margin-bottom: 5px !important;
}

.ces-head-block {
    width: auto !important;
    max-width: 240px !important;
    text-align: left !important;
}

.ces-head-block .name,
.ces-head-block #ces_head {
    display: inline-block !important;
    width: auto !important;
    min-width: 170px !important;
    max-width: 230px !important;
    border-bottom: 1px solid #000 !important;
    font-size: 14px !important;
    font-weight: normal !important;
    text-transform: uppercase !important;
    min-height: 20px !important;
    line-height: 20px !important;
    text-align: left !important;
    padding: 0 8px 1px 0 !important;
}

.ces-head-block .ces-head {
    display: block !important;
    font-size: 14px !important;
    font-weight: bold !important;
    text-align: left !important;
    margin-top: 2px !important;
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

.approval-row,
.signature-group,
.approval-centered,
.admin-block {
    all: unset;
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
.print-footer-inner,
footer {
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    background: #fff !important;
}

.print-footer-logo {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: 65px !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    object-fit: contain !important;
}

img {
    max-width: 100%;
    height: auto;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

@media print {
    .no-print {
        display: none !important;
    }

    body {
        background: #fff !important;
        padding: 0 !important;
        overflow-x: hidden !important;
    }

    .form-container {
        box-shadow: none !important;
        width: 100% !important;
        max-width: 100% !important;
    }

    #print-container,
    .print-shell,
    .print-shell tbody,
    .print-shell tbody > tr,
    .print-body {
        height: auto !important;
        min-height: 0 !important;
    }

    .approvals-container,
    .approvals,
    .approval-section,
    .signature-block,
    .ces-head-block,
    .document-info,
    .doc-header {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
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
<div id="print-container">
    <table class="print-shell" role="presentation">
        <thead>
            <tr>
                <td>
                    <div class="print-header-shell">
                        ${headerHTML}
                    </div>
                </td>
            </tr>
        </thead>

        <tfoot>
            <tr>
                <td>
                    <div class="print-footer-shell">
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

        doc.close();

        const printContent = doc.getElementById('printContent');
        printContent.appendChild(printableBody);

        convertFormControlsToPrintable(printContent);
        convertEditableCellsToPrintable(printContent);

        await waitForImages(doc);
        await waitForFonts(doc);

        forceTopSpacingReset(doc);

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

function buildPrintableBody(formContainer) {
    const wrapper = document.createElement('div');
    wrapper.className = 'print-body-wrapper';

    const clonedMain = formContainer.cloneNode(true);

    removeNonPrintable(clonedMain);

    const firstHeader = clonedMain.querySelector('header');
    if (firstHeader) firstHeader.remove();

    clonedMain.querySelectorAll('footer, .footer-bottom, .footer-logos')
        .forEach(el => el.remove());

    syncFormValues(formContainer, clonedMain);
    syncEditableCells(formContainer, clonedMain);

    wrapper.appendChild(clonedMain);

    const approvalSource =
        document.querySelector('.approvals') ||
        document.querySelector('.approvals-container') ||
        document.querySelector('.approval-section')?.closest('section, div');

    if (approvalSource && !wrapper.querySelector('.approvals, .approvals-container')) {
        const approvalClone = approvalSource.cloneNode(true);
        removeNonPrintable(approvalClone);
        syncFormValues(approvalSource, approvalClone);
        syncEditableCells(approvalSource, approvalClone);
        wrapper.appendChild(approvalClone);
    }

    const documentInfoSource =
        document.querySelector('.document-info') ||
        document.querySelector('.doc-header')?.closest('.document-info, div');

    if (documentInfoSource && !wrapper.querySelector('.document-info')) {
        const docInfoClone = documentInfoSource.cloneNode(true);
        removeNonPrintable(docInfoClone);
        syncFormValues(documentInfoSource, docInfoClone);
        syncEditableCells(documentInfoSource, docInfoClone);
        wrapper.appendChild(docInfoClone);
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
                ${leftLogo ? `<img src="${escapeHtml(leftLogo)}" alt="Logo" class="logo-left">` : '<div></div>'}
                ${leftLogo2 ? `<img src="${escapeHtml(leftLogo2)}" alt="Logo" class="logo-left2">` : '<div></div>'}
                <div class="college-info">${collegeInfoHtml}</div>
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
            ${footerImg ? `<img src="${escapeHtml(footerImg)}" alt="Footer Logo" class="print-footer-logo">` : '&nbsp;'}
        </div>
    `;
}

function createPrintIframe() {
    const iframe = document.createElement('iframe');
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
        '#sidebarFrame',
        '#headerFrame',
        '.buttons',
        '.admin-comment',
        '.no-print',
        '.print-hide',
        '[data-no-print="true"]',
        'button',
        'script',
        'noscript',
        '.print-header',
        '.print-footer'
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

function syncEditableCells(sourceRoot, clonedRoot) {
    const sourceCells = sourceRoot.querySelectorAll('[contenteditable="true"]');
    const clonedCells = clonedRoot.querySelectorAll('[contenteditable="true"]');

    sourceCells.forEach((sourceCell, index) => {
        const clonedCell = clonedCells[index];
        if (!clonedCell) return;

        clonedCell.innerHTML = sourceCell.innerHTML;
        clonedCell.textContent = sourceCell.textContent;
    });
}

function convertEditableCellsToPrintable(root) {
    if (!root) return;

    root.querySelectorAll('[contenteditable="true"]').forEach(cell => {
        cell.removeAttribute('contenteditable');
        cell.style.outline = 'none';
        cell.style.background = '#fff';
    });
}

function convertFormControlsToPrintable(root) {
    if (!root) return;

    const fields = root.querySelectorAll('input, textarea, select');

    fields.forEach(field => {
        const tag = field.tagName.toLowerCase();

        if (tag === 'textarea') {
            const replacement = document.createElement('div');
            replacement.className = 'printable-field';
            replacement.textContent = field.value || '';
            field.replaceWith(replacement);
            return;
        }

        if (tag === 'select') {
            const replacement = document.createElement('div');
            replacement.className = 'printable-field';

            const selectedText = field.options[field.selectedIndex]
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

            if (type === 'checkbox' || type === 'radio') {
                const replacement = document.createElement('span');
                replacement.className = `printable-box ${field.checked ? 'checked' : ''}`;
                field.replaceWith(replacement);
                return;
            }

            const replacement = document.createElement('div');
            replacement.className = 'printable-field';
            replacement.textContent = field.value || '';
            field.replaceWith(replacement);
        }
    });
}

function forceTopSpacingReset(doc) {
    const printContent = doc.getElementById('printContent');
    const bodyWrapper = doc.querySelector('.print-body-wrapper');
    const firstBlock = doc.querySelector('#printContent > .print-body-wrapper > *:first-child');

    if (printContent) {
        printContent.style.marginTop = '0';
        printContent.style.paddingTop = '0';
    }

    if (bodyWrapper) {
        bodyWrapper.style.marginTop = '0';
        bodyWrapper.style.paddingTop = '0';
    }

    if (firstBlock) {
        firstBlock.style.marginTop = '0';
        firstBlock.style.paddingTop = '0';
    }
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

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.printReport = printReport;
