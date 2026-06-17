/**
 * print.js - Program Monitoring Form
 * Fixed: right overlap, main font size, smaller document info, bigger footer.
 * Updated: Follow-up Required (Y/N) answers centered.
 */

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
    document.title = 'Program_Monitoring_Form';

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
<title>Program Monitoring Form</title>
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
    font-family: Arial, sans-serif !important;
    font-size: 12px !important;
    line-height: 1.35 !important;
    overflow-x: hidden !important;
}

#print-container,
.print-shell,
.print-header-shell,
.print-footer-shell,
.print-body,
.print-content,
.print-body-wrapper,
.form-container,
#main_content {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    background: #fff !important;
    overflow-x: hidden !important;
}

.print-shell {
    border-collapse: collapse !important;
    border-spacing: 0 !important;
    table-layout: fixed !important;
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
    overflow-x: hidden !important;
}

.print-header-shell {
    padding-bottom: 8px !important;
}

.print-footer-shell {
    padding-top: 12px !important;
}

.print-body {
    padding-bottom: 35px !important;
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

/* HEADER */
.print-page-header {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
}

.header-content {
    display: grid !important;
    grid-template-columns: 70px 70px minmax(0, 1fr) 130px !important;
    align-items: center !important;
    gap: 8px !important;
    width: 100% !important;
    max-width: 100% !important;
    margin-bottom: 10px !important;
    overflow: hidden !important;
}

.logo-left {
    height: 70px !important;
    width: auto !important;
    max-width: 70px !important;
    display: block !important;
    justify-self: center !important;
}

.logo-left2 {
    height: 66px !important;
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
    width: 150px !important;
    max-width: 150px !important;
    overflow: hidden !important;
    margin-right: 0 !important;
    position: relative !important;
    left: -32px !important;
}

.logos-right img {
    height: 66px !important;
    width: auto !important;
    max-width: 60px !important;
    display: block !important;
}

.college-info {
    text-align: center !important;
    width: 100% !important;
    min-width: 0 !important;
    padding: 0 4px !important;
    overflow: hidden !important;
}

.college-info h1 {
    font-family: "Times New Roman", Times, serif !important;
    color: #4f81bd !important;
    font-size: 22px !important;
    margin: 0 !important;
    font-weight: normal !important;
    line-height: 1.1 !important;
}

.college-info p {
    font-size: 10.5px !important;
    margin: 2px 0 !important;
    color: #333 !important;
    line-height: 1.25 !important;
}

.college-info a {
    font-size: 11px !important;
    color: #0000EE !important;
    text-decoration: underline !important;
    word-break: break-all !important;
}

.office-title {
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

/* MAIN CONTENT */
.form-container,
#main_content,
.print-body-wrapper {
    font-family: Arial, sans-serif !important;
    font-size: 12px !important;
    line-height: 1.35 !important;
}

h2 {
    text-align: center !important;
    margin: 0 0 25px 0 !important;
    text-transform: capitalize !important;
    font-size: 16px !important;
}

h3 {
    margin-top: 24px !important;
    margin-bottom: 10px !important;
    font-size: 13px !important;
}

.header-info {
    margin-bottom: 20px !important;
}

.input-group {
    display: grid !important;
    grid-template-columns: max-content minmax(0, 1fr) !important;
    column-gap: 10px !important;
    align-items: end !important;
    margin-bottom: 9px !important;
    width: 100% !important;
    max-width: 100% !important;
}

.input-group label {
    font-weight: bold !important;
    white-space: nowrap !important;
    font-size: 12px !important;
}

.input-group input,
.input-group .printable-field {
    border: none !important;
    border-bottom: 1px solid #000 !important;
    width: 100% !important;
    max-width: 100% !important;
    outline: none !important;
    background: transparent !important;
    color: #000 !important;
    padding: 2px 4px !important;
    min-height: 18px !important;
    font-size: 12px !important;
}

table {
    width: 100% !important;
    max-width: 100% !important;
    border-collapse: collapse !important;
    table-layout: fixed !important;
    margin-bottom: 20px !important;
}

th,
td {
    border: 1px solid #000 !important;
    padding: 6px 5px !important;
    font-size: 11.5px !important;
    vertical-align: top !important;
    color: #000 !important;
    line-height: 1.25 !important;
    overflow-wrap: anywhere !important;
    word-break: normal !important;
}

th {
    background-color: #fff !important;
    text-align: center !important;
    text-transform: uppercase !important;
    font-weight: bold !important;
}

.center-text {
    text-align: center !important;
}

tbody tr {
    height: auto !important;
    min-height: 30px !important;
}

tr {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

.checkbox-cell {
    text-align: center !important;
    vertical-align: middle !important;
}

/* FOLLOW-UP REQUIRED (Y/N) CENTER FIX */
.followUp {
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 auto !important;
    text-align: center !important;
    text-align-last: center !important;
    border: none !important;
    background: transparent !important;
    color: #000 !important;
    display: block !important;
    font-size: 11.5px !important;
    line-height: 1.25 !important;
}

td:has(.followUp) {
    text-align: center !important;
    vertical-align: middle !important;
}

.followup-printable,
td .followup-printable {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 100% !important;
    max-width: 100% !important;
    min-height: 18px !important;
    margin: 0 auto !important;
    padding: 0 !important;
    text-align: center !important;
    font-size: 11.5px !important;
    line-height: 1.25 !important;
}

table td:last-child,
table th:last-child {
    text-align: center !important;
    vertical-align: middle !important;
}

textarea {
    width: 100% !important;
    max-width: 100% !important;
    border: 1px solid #ccc !important;
    padding: 4px !important;
    font-family: Arial, sans-serif !important;
    font-size: 11.5px !important;
    resize: none !important;
    background: transparent !important;
    color: #000 !important;
}

.paper-lines,
#other_recommendations {
    width: 100% !important;
    border: none !important;
    outline: none !important;
    font-size: 11.5px !important;
    line-height: 30px !important;
    padding: 0 !important;
    background-attachment: local !important;
    background-image: linear-gradient(to bottom, transparent 29px, #000 29px) !important;
    background-size: 100% 30px !important;
    background-color: transparent !important;
    font-family: Arial, sans-serif !important;
    overflow: hidden !important;
    margin-top: 8px !important;
}

.footer-notes {
    margin-top: 20px !important;
}

#feedbackTable {
    width: 100% !important;
    border-collapse: collapse !important;
    font-family: Arial, sans-serif !important;
    table-layout: fixed !important;
}

#feedbackTable th,
#feedbackTable td {
    border: 1px solid #000 !important;
    padding: 7px !important;
}

.feedbackSummary,
.feedbackAction,
#otherIssues {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    border: none !important;
    padding: 6px !important;
    font-family: inherit !important;
    font-size: 11.5px !important;
    display: block !important;
    overflow: hidden !important;
    min-height: 38px !important;
    background: transparent !important;
}

.printable-field {
    display: block !important;
    width: 100% !important;
    white-space: pre-wrap !important;
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
    border: none !important;
    background: transparent !important;
    color: inherit !important;
    font-size: inherit !important;
    line-height: inherit !important;
}

/* CHECKBOXES */
#recommendationsTable td:first-child {
    width: 115px !important;
    white-space: nowrap !important;
    text-align: left !important;
    vertical-align: middle !important;
    padding: 6px 8px !important;
}

#recommendationsTable td:first-child .printable-choice {
    display: inline-flex !important;
    align-items: center !important;
    gap: 5px !important;
    margin-right: 8px !important;
    vertical-align: middle !important;
}

#recommendationsTable td:first-child .choice-label {
    font-size: 11.5px !important;
    color: #000 !important;
    line-height: 1 !important;
}

.printable-box {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 13px !important;
    height: 13px !important;
    border: 1px solid #666 !important;
    border-radius: 2px !important;
    background: #fff !important;
    color: transparent !important;
    font-size: 10px !important;
    line-height: 1 !important;
    vertical-align: middle !important;
}

.printable-box.checked {
    background: #e1251b !important;
    border-color: #e1251b !important;
    color: #fff !important;
    font-weight: bold !important;
}

.printable-box.checked::before {
    content: "✓";
    transform: translateY(-0.5px);
}

/* APPROVALS */
.approvals-container,
.approvals {
    font-family: Arial, sans-serif !important;
    width: 100% !important;
    max-width: 100% !important;
    margin-top: 45px !important;
    color: #000 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    overflow: hidden !important;
}

.approval-section {
    width: 100% !important;
    max-width: 100% !important;
    margin-top: 34px !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    overflow: hidden !important;
}

.approval-section .label {
    font-size: 12px !important;
    font-weight: bold !important;
    margin-bottom: 48px !important;
    text-align: left !important;
}

.approval-section:first-child .label {
    margin-bottom: 5px !important;
}

.ces-head-block {
    width: 190px !important;
    max-width: 190px !important;
    text-align: left !important;
}

.ces-head-block .name,
.ces-head-block #ces_head {
    display: block !important;
    width: 190px !important;
    max-width: 190px !important;
    border-bottom: 1px solid #000 !important;
    font-size: 12px !important;
    font-weight: normal !important;
    text-transform: uppercase !important;
    min-height: 18px !important;
    line-height: 18px !important;
    text-align: left !important;
}

.ces-head-block .ces-head {
    display: block !important;
    font-size: 12px !important;
    font-weight: bold !important;
    text-align: left !important;
}

.signature-block {
    width: 330px !important;
    max-width: 330px !important;
    margin-left: auto !important;
    margin-right: auto !important;
    text-align: center !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

.signature-block .name {
    display: block !important;
    width: 100% !important;
    border-bottom: 1px solid #000 !important;
    font-size: 12px !important;
    font-weight: normal !important;
    text-transform: uppercase !important;
    text-align: center !important;
    min-height: 18px !important;
    line-height: 18px !important;
    margin-bottom: 3px !important;
}

.signature-block .title {
    display: block !important;
    font-size: 12px !important;
    font-weight: normal !important;
    text-align: center !important;
}

.approval-row,
.signature-group,
.approval-centered,
.admin-block,
.name-underlined {
    all: unset;
}

/* DOCUMENT INFO */
.document-info {
    margin-top: 30px !important;
    width: 215px !important;
    max-width: 215px !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    overflow: hidden !important;
}

.doc-header {
    width: 215px !important;
    max-width: 215px !important;
    margin-right: auto !important;
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
    background-color: #002060 !important;
    color: #fff !important;
    width: 78px !important;
    max-width: 78px !important;
    font-size: 9px !important;
    font-weight: bold !important;
    padding: 2px 3px !important;
    text-align: left !important;
    white-space: nowrap !important;
}

.doc-header td:nth-child(2) {
    width: 8px !important;
    max-width: 8px !important;
    padding: 0 !important;
    font-weight: bold !important;
    text-align: center !important;
}

.doc-header td.value {
    width: 129px !important;
    max-width: 129px !important;
    font-size: 9px !important;
    text-align: left !important;
    padding: 2px 4px !important;
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

/* FOOTER */
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
    outline: none !important;
    box-shadow: none !important;
    object-fit: contain !important;
}

img {
    max-width: 100% !important;
    height: auto;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

@media print {
    .no-print {
        display: none !important;
    }

    body {
        background-color: white !important;
        padding: 0 !important;
        overflow-x: hidden !important;
    }

    .form-container {
        box-shadow: none !important;
        width: 100% !important;
        max-width: 100% !important;
    }

    .paper-lines,
    #other_recommendations {
        background-image: linear-gradient(to bottom, transparent 29px, #000 29px) !important;
        background-size: 100% 30px !important;
        border: none !important;
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
    <table class="print-shell" role="presentation" aria-hidden="true">
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
    wrapper.appendChild(clonedMain);

    const approvalSource =
        document.querySelector('.approvals') ||
        document.querySelector('.approvals-container') ||
        document.querySelector('.approval-section')?.closest('section, div');

    if (approvalSource && !wrapper.querySelector('.approvals, .approvals-container')) {
        const approvalClone = approvalSource.cloneNode(true);
        removeNonPrintable(approvalClone);
        syncFormValues(approvalSource, approvalClone);
        wrapper.appendChild(approvalClone);
    }

    const documentInfoSource =
        document.querySelector('.document-info') ||
        document.querySelector('.doc-header')?.closest('.document-info, div');

    if (documentInfoSource && !wrapper.querySelector('.document-info')) {
        const docInfoClone = documentInfoSource.cloneNode(true);
        removeNonPrintable(docInfoClone);
        syncFormValues(documentInfoSource, docInfoClone);
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
        'PROGRAM MONITORING FORM';

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

function convertFormControlsToPrintable(root) {
    if (!root) return;

    const recommendationRows = root.querySelectorAll('#recommendationsTable tbody tr');

    recommendationRows.forEach(row => {
        const firstCell = row.querySelector('td:first-child');
        if (!firstCell) return;

        const yesInput = firstCell.querySelector('.recYes');
        const naInput = firstCell.querySelector('.recNa');

        if (yesInput || naInput) {
            const yesChecked = !!yesInput && yesInput.checked;
            const naChecked = !!naInput && naInput.checked;

            firstCell.innerHTML = `
                <span class="printable-choice">
                    <span class="printable-box ${yesChecked ? 'checked' : ''}"></span>
                    <span class="choice-label">yes</span>
                </span>
                <span class="printable-choice">
                    <span class="printable-box ${naChecked ? 'checked' : ''}"></span>
                    <span class="choice-label">N/A</span>
                </span>
            `;
        }
    });

    const fields = root.querySelectorAll('input, textarea, select');

    fields.forEach(field => {
        const tag = field.tagName.toLowerCase();

        if (tag === 'textarea') {
            const replacement = document.createElement('div');
            replacement.className = field.classList.contains('paper-lines')
                ? 'printable-field paper-lines'
                : 'printable-field';
            replacement.textContent = field.value || '';
            field.replaceWith(replacement);
            return;
        }

        if (tag === 'select') {
            const replacement = document.createElement('div');
            replacement.className = field.classList.contains('followUp')
                ? 'printable-field followup-printable'
                : 'printable-field';

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

            if (field.classList.contains('recYes') || field.classList.contains('recNa')) {
                return;
            }

            if (type === 'checkbox' || type === 'radio') {
                const replacement = document.createElement('span');
                replacement.className = `printable-box ${field.checked ? 'checked' : ''}`;
                field.replaceWith(replacement);
                return;
            }

            const replacement = document.createElement('div');
            replacement.className = field.classList.contains('followUp')
                ? 'printable-field followup-printable'
                : 'printable-field';

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
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.printReport = printReport;
