// print.js - Evaluation Sheet Print
// Fixed: no right overlap + bigger right-side logos + report title included
// Fixed: clicking print will not resize/change the main evaluation-container

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

    const headerElements = [...printClone.querySelectorAll('header')];
    const footerElement = printClone.querySelector('footer');
    const formElement = printClone.querySelector('#evaluationForm');
    const reportTitleElement = printClone.querySelector('#report_title');

    const headerHTML = headerElements.map(header => header.outerHTML).join('');
    const footerHTML = footerElement ? footerElement.outerHTML : '';
    const reportTitleHTML = reportTitleElement ? reportTitleElement.outerHTML : '';
    const formHTML = formElement ? reportTitleHTML + formElement.outerHTML : reportTitleHTML;

    const iframe = document.createElement('iframe');
    iframe.id = 'print-iframe';
    iframe.setAttribute('aria-hidden', 'true');

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
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        gap: 5px !important;
        flex-wrap: nowrap !important;
        margin: 0 0 8px 0 !important;
        padding: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        overflow: hidden !important;
    }

    .logo-left,
    .logo-left2 {
        height: 78px !important;
        width: auto !important;
        max-width: 14% !important;
        flex: 0 0 auto !important;
        object-fit: contain !important;
    }

    .logos-right {
        display: flex !important;
        align-items: center !important;
        justify-content: flex-end !important;
        gap: 4px !important;
        flex: 0 0 23% !important;
        width: 23% !important;
        max-width: 23% !important;
        min-width: 0 !important;
        overflow: hidden !important;
        margin-right: 12px !important;
    }

    .logos-right img {
        height: 82px !important;
        width: auto !important;
        max-width: 48% !important;
        object-fit: contain !important;
        display: block !important;
        flex: 0 1 auto !important;
    }

    .college-info {
        flex: 1 1 auto !important;
        min-width: 0 !important;
        max-width: 49% !important;
        text-align: center !important;
        padding: 0 3px !important;
        overflow: hidden !important;
        overflow-wrap: break-word !important;
        word-break: normal !important;
    }

    .college-info h1 {
        font-family: "Times New Roman", Times, serif !important;
        color: #4f81bd !important;
        font-size: 21px !important;
        margin: 0 !important;
        font-weight: normal !important;
        line-height: 1.1 !important;
        text-decoration: none !important;
    }

    .college-info p {
        font-size: 9.5px !important;
        margin: 1px 0 !important;
        line-height: 1.2 !important;
    }

    .college-info a {
        font-size: 9.5px !important;
        word-break: break-word !important;
    }

    .office-title {
        text-align: center !important;
        font-size: 16px !important;
        color: #595959 !important;
        font-weight: bold !important;
        margin: 4px 0 !important;
        text-transform: uppercase !important;
    }

    .double-line {
        border-top: 4px double #4f81bd !important;
        margin-bottom: 10px !important;
    }

    header h1,
    #report_title {
        display: block !important;
        text-align: center !important;
        font-size: 18px !important;
        text-decoration: underline !important;
        margin: 10px 0 20px 0 !important;
        color: #000 !important;
        font-weight: bold !important;
        line-height: 1.25 !important;
    }

    .header-info,
    .input-line,
    .checkbox-grid,
    .signature-section,
    .approvals-container,
    .document-info {
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
        if (iframe && iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
        }

        try {
            iframe.contentWindow.removeEventListener('afterprint', cleanup);
        } catch (error) {
            console.warn('Print cleanup skipped:', error);
        }
    };

    iframe.contentWindow.addEventListener('afterprint', cleanup);

    setTimeout(() => {
        cleanup();
    }, 1000);
}

function fixFormStatesForPrint(cloneElement) {
    const rows = cloneElement.querySelectorAll('.evaluation-table tbody tr');

    rows.forEach((row) => {
        const categoryCell = row.querySelector('.category-row td, td[colspan="5"]');
        const categoryText = categoryCell ? categoryCell.textContent.trim() : '';

        if (categoryText === 'Program Relevance') {
            let currentRow = row.nextElementSibling;

            while (currentRow && !currentRow.classList.contains('category-row')) {
                const radios = currentRow.querySelectorAll('input[type="radio"]');

                radios.forEach((radio) => {
                    radio.checked = false;
                    radio.removeAttribute('checked');
                });

                currentRow = currentRow.nextElementSibling;
            }
        }
    });

    const radios = cloneElement.querySelectorAll('input[type="radio"]');

    radios.forEach((radio) => {
        const row = radio.closest('tr');
        const isProgramRelevance = row && row.dataset.removeProgramRelevanceCheck === 'true';

        if (isProgramRelevance) {
            radio.checked = false;
            radio.removeAttribute('checked');
            return;
        }

        if (radio.checked) {
            radio.setAttribute('checked', 'checked');
        } else {
            radio.removeAttribute('checked');
        }

        if (radio.name) {
            radio.setAttribute('name', radio.name);
        }
    });

    removeProgramRelevanceChecks(cloneElement);

    const checkboxes = cloneElement.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            checkbox.setAttribute('checked', 'checked');
        } else {
            checkbox.removeAttribute('checked');
        }
    });

    const inputs = cloneElement.querySelectorAll('input, textarea, select');

    inputs.forEach((input) => {
        const tag = input.tagName.toLowerCase();

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

        const type = (input.getAttribute('type') || '').toLowerCase();

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

function removeProgramRelevanceChecks(cloneElement) {
    const categoryRows = cloneElement.querySelectorAll('.evaluation-table tbody tr.category-row');

    categoryRows.forEach((categoryRow) => {
        const text = categoryRow.textContent.trim();

        if (text !== 'Program Relevance') return;

        let row = categoryRow.nextElementSibling;

        while (row && !row.classList.contains('category-row')) {
            const radios = row.querySelectorAll('input[type="radio"]');

            radios.forEach((radio) => {
                radio.checked = false;
                radio.removeAttribute('checked');
                radio.defaultChecked = false;
            });

            row = row.nextElementSibling;
        }
    });
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
