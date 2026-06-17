// print.js - Evaluation Sheet Print
// Fixed: no right overlap + smaller document info + Program Relevance ratings visible

async function printReport() {
    const evaluationContainer = document.querySelector('.evaluation-container');
    const evaluationForm = document.getElementById('evaluationForm');

    if (!evaluationContainer || !evaluationForm) {
        console.error('Evaluation content not found');
        alert('Could not find evaluation content to print');
        return;
    }

    const oldIframe = document.getElementById('print-iframe');
    if (oldIframe) oldIframe.remove();

    const printClone = evaluationContainer.cloneNode(true);
    fixFormStatesForPrint(printClone);

    const footerElement = printClone.querySelector('footer');
    const formElement = printClone.querySelector('#evaluationForm');
    const reportTitle =
        printClone.querySelector('header h1')?.textContent?.trim() ||
        'EVALUATION SHEET FOR EXTENSION SERVICES';

    const headerHTML = buildPrintHeaderHtml();
    const footerHTML = footerElement ? footerElement.outerHTML : '';
    const formHTML = formElement
        ? `<h1 id="report_title">${escapeHtml(reportTitle)}</h1>${formElement.outerHTML}`
        : '';

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

    const doc = iframe.contentDocument || iframe.contentWindow.document;

    doc.open();
    doc.write(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Evaluation Sheet for Extension Services</title>

<style>
    * {
        box-sizing: border-box !important;
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
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: visible !important;
        background: #fff !important;
        font-family: Arial, sans-serif !important;
        font-size: 15px !important;
        line-height: 1.4 !important;
        color: #333 !important;
    }

    .print-container,
    .print-shell,
    .print-header,
    .print-footer,
    .print-body,
    .evaluation-container,
    #evaluationForm {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
        overflow: visible !important;
        background: #fff !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
    }

    .print-shell {
        border-collapse: collapse !important;
        border-spacing: 0 !important;
        table-layout: fixed !important;
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
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        vertical-align: top !important;
        overflow: hidden !important;
        background: #fff !important;
    }

    .print-header {
        padding-bottom: 8px !important;
        overflow: hidden !important;
    }

    .print-page-header {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
    }

    .print-footer {
        padding-top: 8px !important;
        overflow: hidden !important;
    }

    header,
    footer,
    .header-content,
    .footer-bottom,
    .footer-logos {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        overflow: hidden !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
    }
    .header-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        width: 100% !important;
        max-width: 100% !important;
        gap: 8px;
    }

    .logo-left {
        height: 86px !important;
        width: auto !important;
        max-width: 96px !important;
        display: block !important;
        flex: 0 0 auto !important;
        object-fit: contain !important;
    }

    .logo-left2 {
        height: 80px !important;
        width: auto !important;
        max-width: 90px !important;
        display: block !important;
        flex: 0 0 auto !important;
        object-fit: contain !important;
    }

    .logos-right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        flex: 0 0 auto !important;
        margin-right: 6px;
    }

    .logos-right img {
        height: 78px !important;
        width: auto !important;
        max-width: 92px !important;
        display: block !important;
        object-fit: contain !important;
    }

    .college-info {
        text-align: center;
        flex: 1 1 auto !important;
        min-width: 0 !important;
        padding: 0 8px;
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
    header h1,
    #report_title {
        display: block !important;
        text-align: center !important;
        font-size: 16px !important;
        text-decoration: underline !important;
        margin: 10px 0 15px 0 !important;
        color: #000 !important;
    }

    .header-info,
    .input-line,
    .checkbox-grid,
    .signature-section,
    .approvals-container {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        overflow: visible !important;
    }

    .header-info .input-line {
        display: flex !important;
        align-items: flex-end !important;
        flex-wrap: nowrap !important;
        margin-bottom: 8px !important;
        gap: 8px !important;
    }

    .header-info label {
        flex: 0 0 auto !important;
        font-weight: bold !important;
        white-space: nowrap !important;
    }

    .full-line,
    .sig-input {
        flex: 1 1 auto !important;
        min-width: 0 !important;
        max-width: 100% !important;
        border: none !important;
        border-bottom: 1px solid #000 !important;
        background: transparent !important;
        outline: none !important;
        box-shadow: none !important;
    }

    .checkbox-grid {
        display: flex !important;
        justify-content: space-between !important;
        gap: 10px !important;
        flex-wrap: nowrap !important;
        margin: 15px 0 !important;
    }

    .checkbox-grid .column {
        width: 50% !important;
        max-width: 50% !important;
        min-width: 0 !important;
    }

    .checkbox-grid label {
        display: block !important;
        margin-bottom: 5px !important;
        font-size: 14px !important;
        line-height: 1.3 !important;
    }

    table,
    .legend-table,
    .evaluation-table {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
        overflow-wrap: break-word !important;
        word-wrap: break-word !important;
    }

    .legend-table {
        margin-bottom: 15px !important;
    }

    .evaluation-table {
        margin-top: 15px !important;
    }

    th,
    td {
        max-width: 100% !important;
        overflow-wrap: break-word !important;
        word-wrap: break-word !important;
        word-break: normal !important;
        white-space: normal !important;
    }

    .legend-table th,
    .legend-table td,
    .evaluation-table th,
    .evaluation-table td {
        border: 1px solid #000 !important;
        padding: 6px !important;
        vertical-align: top !important;
        font-size: 13px !important;
    }

    .legend-table tr,
    .evaluation-table tr {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    .evaluation-table thead {
        display: table-header-group !important;
    }

    .evaluation-table .num-col,
    .legend-table td.score-cell {
        width: 35px !important;
        max-width: 35px !important;
        text-align: center !important;
        vertical-align: middle !important;
    }

    .radio-cell {
        width: 38px !important;
        max-width: 38px !important;
        text-align: center !important;
        vertical-align: middle !important;
    }

    input[type="radio"] {
        -webkit-appearance: radio !important;
        appearance: radio !important;
        display: inline-block !important;
        width: 14px !important;
        height: 14px !important;
        margin: 0 !important;
        transform: none !important;
        accent-color: #dc2626 !important;
    }

    input[type="radio"]:checked {
        accent-color: #dc2626 !important;
    }

    input[type="checkbox"] {
        accent-color: #dc2626 !important;
    }

    input,
    textarea,
    select {
        max-width: 100% !important;
        min-width: 0 !important;
        font-family: inherit !important;
        font-size: inherit !important;
    }

    .signature-section {
        margin-top: 35px !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    .sig-line {
        display: flex !important;
        align-items: center !important;
        flex-wrap: nowrap !important;
        margin-bottom: 10px !important;
        font-weight: bold !important;
    }

    .sig-input {
        width: auto !important;
        margin-left: 10px !important;
        padding: 4px 0 !important;
    }

    .approvals-container {
        margin-top: 35px !important;
        font-size: 14px !important;
        page-break-inside: auto !important;
        break-inside: auto !important;
    }

    .approval-row {
        display: flex !important;
        justify-content: space-between !important;
        gap: 40px !important;
        margin-bottom: 20px !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    .signature-group {
        width: 42% !important;
    }

    .label {
        font-weight: bold !important;
        margin-bottom: 30px !important;
        font-size: 14px !important;
    }

    .signature-line {
        border-bottom: 1.5px solid #000 !important;
        min-height: 20px !important;
        margin-bottom: 5px !important;
    }

    .title {
        font-size: 13px !important;
    }

    .bold {
        font-weight: bold !important;
    }

    .approval-centered {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    .left-align {
        width: 100% !important;
        text-align: left !important;
    }

    .admin-block {
        text-align: center !important;
        margin-top: 25px !important;
        margin-bottom: 10px !important;
    }

    .name-underlined {
        display: inline-block !important;
        font-size: 15px !important;
        font-weight: bold !important;
        text-decoration: underline !important;
        text-transform: uppercase !important;
        min-width: 220px !important;
    }

    .document-info {
        margin-top: 35px !important;
        width: 255px !important;
        max-width: 255px !important;
        min-width: 0 !important;
        margin-right: auto !important;
        margin-left: 0 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        overflow: hidden !important;
    }

    .doc-header {
        width: 255px !important;
        max-width: 255px !important;
        min-width: 0 !important;
        table-layout: fixed !important;
        border-collapse: collapse !important;
        font-size: 9px !important;
    }

    .doc-header td {
        border: 1px solid #000 !important;
        padding: 2px 4px !important;
        font-size: 9px !important;
        line-height: 1.1 !important;
        vertical-align: middle !important;
        overflow-wrap: break-word !important;
        word-break: normal !important;
    }

    .doc-header .label {
        background-color: #002060 !important;
        color: white !important;
        font-weight: bold !important;
        width: 82px !important;
        white-space: nowrap !important;
        text-align: left !important;
        font-size: 9px !important;
        margin: 0 !important;
        padding: 2px 4px !important;
    }

    .doc-header td:nth-child(2) {
        width: 10px !important;
        text-align: center !important;
        font-weight: bold !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
    }

    .doc-header td.value {
        width: 163px !important;
        text-align: left !important;
    }

    .doc-header td.value input,
    .doc-header td.value p,
    .doc-header input,
    .doc-header p {
        width: 100% !important;
        max-width: 100% !important;
        border: none !important;
        background: transparent !important;
        margin: 0 !important;
        padding: 0 !important;
        font-family: inherit !important;
        font-size: 9px !important;
        line-height: 1.1 !important;
        color: #000 !important;
        outline: none !important;
        box-shadow: none !important;
        text-align: left !important;
    }

    .footer-bottom,
    .footer-logos {
        display: flex !important;
        align-items: flex-end !important;
        justify-content: flex-end !important;
        width: 100% !important;
        max-width: 100% !important;
        overflow: hidden !important;
    }

    .footer-logos img {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
        max-height: 72px !important;
        object-fit: contain !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
    }

    img {
        max-width: 100% !important;
        height: auto !important;
        object-fit: contain !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    h1, h2, h3, h4, h5, h6, p {
        max-width: 100% !important;
        overflow-wrap: break-word !important;
        page-break-after: avoid !important;
        break-after: avoid-page !important;
        orphans: 3;
        widows: 3;
    }

    .category-row,
    .evaluation-table thead th {
        background-color: #f2f2f2 !important;
        font-weight: bold !important;
    }

    @media print {
        body {
            background: white !important;
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
    <div class="print-container">
        <table class="print-shell" role="presentation">
            <thead>
                <tr>
                    <td>
                        <div class="print-header">${headerHTML}</div>
                    </td>
                </tr>
            </thead>

            <tfoot>
                <tr>
                    <td>
                        <div class="print-footer">${footerHTML}</div>
                    </td>
                </tr>
            </tfoot>

            <tbody>
                <tr>
                    <td>
                        <div class="print-body">${formHTML}</div>
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

    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    const cleanup = () => {
        iframe.remove();
        iframe.contentWindow.removeEventListener('afterprint', cleanup);
    };

    iframe.contentWindow.addEventListener('afterprint', cleanup);

    setTimeout(() => {
        if (document.body.contains(iframe)) {
            iframe.remove();
        }
    }, 3000);
}

function fixFormStatesForPrint(cloneElement) {
    const radios = cloneElement.querySelectorAll('input[type="radio"]');

    radios.forEach((radio) => {
        if (radio.checked) {
            radio.setAttribute('checked', 'checked');
            radio.defaultChecked = true;
        } else {
            radio.removeAttribute('checked');
            radio.defaultChecked = false;
        }

        if (radio.name) {
            radio.setAttribute('name', radio.name);
        }
    });

    const checkboxes = cloneElement.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            checkbox.setAttribute('checked', 'checked');
            checkbox.defaultChecked = true;
        } else {
            checkbox.removeAttribute('checked');
            checkbox.defaultChecked = false;
        }
    });

    const inputs = cloneElement.querySelectorAll('input, textarea, select');

    inputs.forEach((input) => {
        const tag = input.tagName.toLowerCase();
        const type = (input.getAttribute('type') || '').toLowerCase();

        if (tag === 'textarea') {
            input.textContent = input.value || '';
            return;
        }

        if (tag === 'select') {
            [...input.options].forEach((option) => {
                if (option.selected) {
                    option.setAttribute('selected', 'selected');
                } else {
                    option.removeAttribute('selected');
                }
            });
            return;
        }

        if (
            type !== 'radio' &&
            type !== 'checkbox' &&
            type !== 'button' &&
            type !== 'submit' &&
            type !== 'reset' &&
            type !== 'file' &&
            type !== 'password'
        ) {
            input.setAttribute('value', input.value || '');
        }
    });
}

function buildPrintHeaderHtml() {
    const leftLogo =
        document.querySelector('.logo-left')?.src ||
        '/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/smcclogo.png';

    const leftLogo2 =
        document.querySelector('.logo-left2')?.src ||
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
            <a href="http://www.smccnasipit.edu.ph">www.smccnasipit.edu.ph</a>
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
            <h2 class="office-title">${escapeHtml(officeTitle)}</h2>
            <div class="double-line"></div>
        </div>
    `;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function waitForImages(doc) {
    const images = Array.from(doc.querySelectorAll('img'));

    if (!images.length) return Promise.resolve();

    return Promise.all(
        images.map((img) => {
            if (img.complete && img.naturalWidth > 0) {
                return Promise.resolve();
            }

            return new Promise((resolve) => {
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
    } catch (error) {
        console.warn('Font loading skipped:', error);
    }
}

function nextFrame(win) {
    return new Promise((resolve) => {
        win.requestAnimationFrame(() => resolve());
    });
}

window.printReport = printReport;
