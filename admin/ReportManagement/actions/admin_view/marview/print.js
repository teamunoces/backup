/**
 * print.js - Monthly Accomplishment Report / Program Design compatible
 * Repeats header/footer on every printed page and prevents overlap.
 */

async function printReport() {
    const mainContent =
        document.querySelector('#main_content') ||
        document.querySelector('.form-container') ||
        document.querySelector('form');

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
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Monthly_Accomplishment_Report</title>

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
    font-family: "Calibri Light", Calibri, Arial, sans-serif !important;
    font-size: 11pt !important;
    line-height: 1.35;
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
    margin: 0 !important;
    padding: 0 !important;
    border-collapse: collapse !important;
    border-spacing: 0 !important;
    table-layout: fixed !important;
    border: none !important;
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
    vertical-align: top !important;
    background: #fff !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
}

.print-header {
    padding: 0 0 8px 0 !important;
    margin: 0 !important;
    background: #fff !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
}

.print-footer {
    padding: 8px 0 0 0 !important;
    margin: 0 !important;
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
#main_content,
.form-container {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
    background: #fff !important;
    overflow: hidden !important;
    font-family: "Calibri Light", Calibri, Arial, sans-serif !important;
    font-size: 11pt !important;
}

#printContent,
#printContent > .print-body-wrapper,
#printContent > .print-body-wrapper > #main_content,
#main_content,
#main_content > *:first-child,
.print-body-wrapper > *:first-child {
    margin-top: 0 !important;
    padding-top: 0 !important;
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

/* prevent right overlap globally */
.print-content *,
#main_content *,
.form-container * {
    max-width: 100% !important;
    word-break: normal !important;
    overflow-wrap: break-word !important;
}

/* ===== PRINT HEADER ===== */
.print-page-header {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
}

.header-content {
    display: grid !important;
    grid-template-columns: 64px 64px minmax(0, 1fr) 90px !important;
    align-items: center !important;
    width: 100% !important;
    max-width: 100% !important;
    gap: 8px !important;
    margin: 0 0 4px 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
}

.logo-left,
.logo-left2 {
    height: 60px !important;
    width: auto !important;
    max-width: 64px !important;
    display: block !important;
    justify-self: center !important;
}

.logos-right {
    display: flex !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 6px !important;
    width: 110px !important;
    max-width: 110px !important;
    overflow: hidden !important;
    margin-right: 0 !important;
    position: relative !important;
    left: -32px !important;
}

.logos-right img {
    height: 50px !important;
    width: auto !important;
    max-width: 48px !important;
    display: block !important;
}

.college-info {
    text-align: center !important;
    justify-self: center !important;
    align-self: center !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    padding: 0 6px !important;
    overflow: hidden !important;
}

.college-info h1 {
    margin: 0 !important;
    font-family: "Times New Roman", Times, serif !important;
    font-size: 20px !important;
    line-height: 1.05 !important;
    font-weight: normal !important;
    color: #4f81bd !important;
    white-space: normal !important;
    text-align: center !important;
}

.college-info p {
    margin: 1px 0 !important;
    font-size: 11px !important;
    line-height: 1.1 !important;
    color: #333 !important;
    text-align: center !important;
}

.college-info a {
    font-size: 11px !important;
    color: #0000EE !important;
    text-decoration: underline !important;
    word-break: break-all !important;
}

.office-title {
    text-align: center !important;
    font-size: 15px !important;
    font-weight: bold !important;
    color: #595959 !important;
    margin: 2px 0 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.2px !important;
}

.double-line {
    border-top: 3px double #4f81bd !important;
    margin: 0 0 8px 0 !important;
}

/* ===== TITLE ===== */
#main_content h1,
.print-body-wrapper h1,
.print-content h1 {
    font-family: "Century Gothic", Arial, sans-serif !important;
    font-size: 13pt !important;
    font-weight: normal !important;
    text-align: center !important;
    text-transform: uppercase !important;
    color: #000 !important;
    margin: 0 0 12px 0 !important;
}

.form-type {
    font-family: "Courier New", Courier, monospace !important;
    text-align: center !important;
    margin: 0 0 30px 0 !important;
    font-size: 13pt !important;
    font-weight: bold !important;
    letter-spacing: 2px !important;
    text-transform: uppercase !important;
    color: #000 !important;
}

/* ===== MAIN CONTENT FONT ===== */
#main_content,
#main_content *,
.print-body-wrapper,
.print-body-wrapper *,
.print-content,
.print-content * {
    font-family: "Calibri Light", Calibri, Arial, sans-serif !important;
    font-size: 11pt !important;
}

#main_content h1,
.print-body-wrapper h1,
.print-content h1 {
    font-family: "Century Gothic", Arial, sans-serif !important;
    font-size: 13pt !important;
}

/* ===== INPUT FIELDS ===== */
.input-fields,
.header-info {
    width: 100% !important;
    max-width: 100% !important;
    margin-top: 0 !important;
    margin-bottom: 48px !important;
    font-family: "Calibri Light", Calibri, Arial, sans-serif !important;
    font-size: 11pt !important;
}

.input-fields .field,
.input-group {
    display: grid !important;
    grid-template-columns: 140px minmax(0, 1fr) !important;
    align-items: center !important;
    column-gap: 8px !important;
    margin-bottom: 14px !important;
    font-family: "Calibri Light", Calibri, Arial, sans-serif !important;
    font-size: 11pt !important;
    width: 100% !important;
    max-width: 100% !important;
}

.input-fields .field label,
.input-group label {
    font-family: "Calibri Light", Calibri, Arial, sans-serif !important;
    font-weight: normal !important;
    font-size: 11pt !important;
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
    font-family: "Calibri Light", Calibri, Arial, sans-serif !important;
    font-size: 11pt !important;
    width: 100% !important;
    max-width: 100% !important;
    min-height: 20px !important;
    border: none !important;
    border-bottom: 1px solid #cfcfcf !important;
    padding: 2px 6px 3px 6px !important;
    background: transparent !important;
    color: #000 !important;
    text-align: left !important;
    line-height: 1.2 !important;
}

/* ===== TABLE FORM ===== */
.table_form,
.program-table {
    font-family: "Calibri Light", Calibri, Arial, sans-serif !important;
    font-size: 10.5pt !important;
    width: 100% !important;
    max-width: 100% !important;
    border-collapse: collapse !important;
    table-layout: fixed !important;
    margin-top: 0 !important;
    margin-bottom: 20px !important;
    color: #000 !important;
}

.table_form {
    display: block !important;
    overflow: hidden !important;
    width: 100% !important;
    max-width: 100% !important;
}

.table_form table,
.program-table {
    width: 100% !important;
    max-width: 100% !important;
}

.table_form th,
.table_form td,
.program-table th,
.program-table td {
    font-family: "Calibri Light", Calibri, Arial, sans-serif !important;
    font-size: 10.5pt !important;
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

/* ===== GENERAL TABLES ===== */
.header-table,
.main-table,
table {
    width: 100% !important;
    max-width: 100% !important;
    border-collapse: collapse !important;
    table-layout: fixed !important;
}

.header-table {
    margin: 0 0 12px 0 !important;
}

.header-table td.label {
    width: 30% !important;
    padding: 6px !important;
    border: 1px solid #000 !important;
    font-weight: normal !important;
    background-color: #fff !important;
}

.header-table td.input_cell {
    width: 70% !important;
    padding: 6px !important;
    border: 1px solid #000 !important;
}

.main-table {
    margin-top: 0 !important;
}

.main-table th {
    background-color: #e0e0e0 !important;
    color: #333 !important;
    border: 1px solid #000 !important;
    padding: 6px 4px !important;
    text-align: center;
    font-weight: normal !important;
    font-size: 10.5pt !important;
    word-break: break-word;
    overflow-wrap: anywhere;
}

.main-table td {
    border: 1px solid #000 !important;
    padding: 6px 4px !important;
    vertical-align: top;
    font-size: 10.5pt !important;
    word-break: break-word;
    overflow-wrap: anywhere;
}

tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

/* ===== APPROVAL SECTION ===== */
.print-approval-section {
    margin-top: 0 !important;
    padding-top: 0 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

.approvals-container,
.approval-section,
.prepared-block,
.signature-block {
    font-family: "Calibri Light", Calibri, Arial, sans-serif !important;
    font-size: 11pt !important;
    color: #000 !important;
}

.approvals-container {
    width: 100% !important;
    max-width: 100% !important;
    margin-top: 70px !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    overflow: hidden !important;
}

.prepared-block {
    width: auto !important;
    max-width: 230px !important;
    margin-bottom: 38px !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

.approvals-container .label,
.approval-section .label,
.prepared-name,
.prepared-title,
.signature-block .name,
.signature-block .title {
    font-family: "Calibri Light", Calibri, Arial, sans-serif !important;
    font-size: 11pt !important;
    color: #000 !important;
}

.approvals-container .label,
.approval-section .label {
    font-weight: bold !important;
    margin-bottom: 2px !important;
    text-align: left !important;
}

.prepared-name {
    display: inline-block !important;
    width: auto !important;
    min-width: 165px !important;
    max-width: 220px !important;
    border-bottom: 1px solid #000 !important;
    text-transform: uppercase !important;
    min-height: 21px !important;
    line-height: 21px !important;
    text-align: left !important;
    padding: 0 8px 1px 0 !important;
}

.prepared-title {
    font-weight: bold !important;
    text-align: left !important;
}

.approval-section {
    width: 100% !important;
    max-width: 100% !important;
    margin-top: 38px !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    overflow: hidden !important;
}

.approval-section.recommending .label {
    margin-bottom: 65px !important;
}

.approval-section.approved-section {
    margin-top: 15px !important;
}

.approval-section.approved-section .label {
    margin-bottom: 65px !important;
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

.name,
.signature-block .name {
    display: inline-block !important;
    width: auto !important;
    min-width: 260px !important;
    max-width: 350px !important;
    border-bottom: 1px solid #000 !important;
    text-transform: uppercase !important;
    text-align: center !important;
    min-height: 21px !important;
    line-height: 21px !important;
    padding: 0 12px 1px 12px !important;
    font-weight: bold !important;
    text-decoration: none !important;
}

.signature-block .name:empty::after,
.name:empty::after {
    content: "\\00a0";
}

.signature-block .title {
    display: block !important;
    text-align: center !important;
    margin-top: 3px !important;
    font-weight: bold !important;
}

/* ===== DOCUMENT INFO - SMALLER ===== */
.print-document-info-section {
    margin-top: 8px !important;
    margin-bottom: 25px !important;
    width: 100% !important;
    max-width: 100% !important;
    display: block !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    clear: both !important;
    overflow: hidden !important;
}

.document-info {
    width: 215px !important;
    max-width: 215px !important;
    margin: 0 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

.doc-header {
    width: 215px !important;
    max-width: 215px !important;
    border-collapse: collapse !important;
    table-layout: fixed !important;
    font-family: Arial, sans-serif !important;
    font-size: 9px !important;
    border: none !important;
}

.doc-header td {
    border: 1px solid #d1d1d1 !important;
    padding: 2px 3px !important;
    height: 15px !important;
    line-height: 1.05 !important;
    vertical-align: middle !important;
}

.doc-header td.label {
    width: 78px !important;
    max-width: 78px !important;
    padding: 2px 3px !important;
    background-color: #002060 !important;
    color: white !important;
    font-weight: bold !important;
    border: 1px solid #d1d1d1 !important;
    text-align: left !important;
    white-space: nowrap !important;
    font-size: 9px !important;
}

.doc-header td:nth-child(2) {
    width: 8px !important;
    max-width: 8px !important;
    padding: 0 !important;
    font-weight: bold !important;
    text-align: center !important;
    border-top: 1px solid #d1d1d1 !important;
    border-bottom: 1px solid #d1d1d1 !important;
    font-size: 9px !important;
}

.doc-header td.value {
    width: 129px !important;
    max-width: 129px !important;
    padding: 2px 4px !important;
    border: 1px solid #d1d1d1 !important;
    font-size: 9px !important;
    white-space: nowrap !important;
    overflow: hidden !important;
}

.doc-header td.value input,
.doc-header td.value p,
.doc-header td.value .printable-field {
    border: none !important;
    background: transparent !important;
    font-family: inherit !important;
    font-size: 9px !important;
    color: #000 !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    line-height: 1.05 !important;
    min-height: auto !important;
}

/* keep document info small */
.document-info,
.document-info * {
    font-size: 9px !important;
}

/* ===== FOOTER ===== */
.print-footer-inner {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    width: 100%;
    min-height: 24px;
    margin: 0 !important;
    padding: 0 !important;
}

.print-footer-logo {
    display: block;
    width: 100%;
    max-width: 100%;
    height: auto;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    object-fit: contain;
    page-break-inside: avoid;
    break-inside: avoid;
}

img,
footer,
.document-info {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

input,
textarea,
select {
    border: none !important;
    background: transparent !important;
    color: inherit !important;
    font-family: inherit !important;
    font-size: inherit !important;
}

.printable-field {
    display: block;
    width: 100%;
    min-height: 1em;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: anywhere;
    border: none !important;
    background: transparent !important;
    color: inherit;
    font-size: inherit;
    line-height: inherit;
}

.table_form .printable-field,
.program-table .printable-field {
    text-align: center !important;
}

.printable-checkbox {
    display: inline-block;
}

@media print {
    html,
    body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        overflow-x: hidden !important;
    }
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
        convertEditableCellsToPrintable(printContent);

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

    clonedMainContent.querySelectorAll(
        'header, .print-page-header, .header-content, .office-title, .double-line, footer, .footer-bottom, .footer-logos'
    ).forEach(el => el.remove());

    removeNonPrintable(clonedMainContent);
    syncFormValues(mainContent, clonedMainContent);
    syncEditableCells(mainContent, clonedMainContent);
    wrapper.appendChild(clonedMainContent);

    const approvalSource =
        document.querySelector('.approvals-container') ||
        document.querySelector('.approvals') ||
        document.querySelector('.approval-row')?.closest('section, div');

    if (approvalSource && !wrapper.querySelector('.approvals-container, .approvals')) {
        const approvalClone = approvalSource.cloneNode(true);

        removeNonPrintable(approvalClone);
        syncFormValues(approvalSource, approvalClone);
        syncEditableCells(approvalSource, approvalClone);

        const approvalWrap = document.createElement('div');
        approvalWrap.className = 'print-approval-section';
        approvalWrap.appendChild(approvalClone);
        wrapper.appendChild(approvalWrap);
    }

    const documentInfoSource =
        document.querySelector('.document-info') ||
        document.querySelector('.doc-header')?.closest('.document-info, div');

    if (documentInfoSource && !wrapper.querySelector('.document-info')) {
        const documentInfoClone = documentInfoSource.cloneNode(true);

        removeNonPrintable(documentInfoClone);
        syncFormValues(documentInfoSource, documentInfoClone);
        syncEditableCells(documentInfoSource, documentInfoClone);

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
        'Monthly Accomplishment Report';

    const collegeInfoNode = document.querySelector('.college-info');

    const collegeInfoHtml = collegeInfoNode
        ? collegeInfoNode.innerHTML
        : `
            <h1>SAINT MICHAEL COLLEGE OF CARAGA</h1>
            <p>Brgy. 4, Nasipit, Agusan del Norte, Philippines</p>
            <p>District 8, Brgy. Triangulo, Nasipit, Agusan del Norte, Philippines</p>
            <p>Tel Nos. +63 085 343-3251 / +63 085 283-3113</p>
            <p><a href="https://www.smccnasipit.edu.ph">www.smccnasipit.edu.ph</a></p>
        `;

    return `
        <div class="print-page-header">
            <div class="header-content">
                ${leftLogo ? `<img src="${escapeHtml(leftLogo)}" alt="Logo" class="logo-left">` : '<div class="logo-left-placeholder"></div>'}
                ${leftLogo2 ? `<img src="${escapeHtml(leftLogo2)}" alt="Logo" class="logo-left2">` : '<div class="logo-left2-placeholder"></div>'}
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
            ${footerImg ? `<img src="${escapeHtml(footerImg)}" alt="Footer Logo" class="print-footer-logo">` : ''}
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
    }

    if (firstBlock) {
        firstBlock.style.marginTop = '0';
        firstBlock.style.paddingTop = '0';
    }
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
