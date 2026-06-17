/**
 * print.js - PROGRAM DESIGN FORM
 * Repeats header/footer on every page and prevents overlap with the main content.
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
            margin: 12mm 10mm 12mm 10mm;
        }

        html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
            background: #fff !important;
            color: #000;
            font-family: Arial, sans-serif;
            font-size: 15px;
            line-height: 1.35;
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

        .print-header-shell,
        .print-footer-shell,
        .print-body {
            width: 100%;
            margin: 0 !important;
            background: #fff !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
        }

        .print-header-shell {
            padding: 0 0 8px 0 !important;
        }

        .print-footer-shell {
            padding: 8px 0 0 0 !important;
        }

        .print-body {
            padding: 0 !important;
            margin: 0 !important;
        }

        .print-content {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            background: #fff !important;
            overflow: visible !important;
        }

        .print-body-wrapper,
        .form-container,
        #main_content,
        .approvals-container,
        .document-info {
            width: 100% !important;
            max-width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            padding: 0 !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            background: #fff !important;
            overflow: visible !important;
        }

        .print-body-wrapper > *:first-child,
        .print-body-wrapper > *:first-child *:first-child,
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
        .form-type {
            text-align: center !important;
            font-family: "Times New Roman", Times, serif !important;
            font-size: 16px !important;
            font-weight: bold !important;
            letter-spacing: 2px !important;
            text-transform: uppercase !important;
            margin: 6px 0 24px 0 !important;
        }

        .input-fields {
            width: 100% !important;
            margin: 0 0 18px 0 !important;
            padding: 0 !important;
        }

        .input-row,
        .input-fields > div {
            display: flex !important;
            align-items: center !important;
            width: 100% !important;
            gap: 14px !important;
            margin-bottom: 14px !important;
        }

        .input-row label,
        .input-fields label,
        .input-fields > div > label:first-child,
        .input-fields > div > .label:first-child {
            width: 145px !important;
            min-width: 145px !important;
            max-width: 145px !important;
            font-weight: bold !important;
            font-size: 12px !important;
            text-align: left !important;
            margin: 0 !important;
        }

        .input-row .printable-field,
        .input-row input,
        .input-row textarea,
        .input-row select,
        .input-row .line-input,
        .input-fields input,
        .input-fields textarea,
        .input-fields select,
        .input-fields .printable-field,
        .input-fields .line-input {
            flex: 1 1 auto !important;
            width: 100% !important;
            min-width: 0 !important;
            display: block !important;
            border: none !important;
            border-bottom: 1px solid #bfbfbf !important;
            background: transparent !important;
            padding: 2px 10px 4px 10px !important;
            margin: 0 !important;
            font-size: 12px !important;
            line-height: 1.3 !important;
            min-height: 24px !important;
            box-shadow: none !important;
            outline: none !important;
            white-space: pre-wrap !important;
            word-break: break-word !important;
            overflow-wrap: anywhere !important;
        }

        .input-fields > div > *:last-child {
            flex: 1 1 auto !important;
            min-width: 0 !important;
        }

        /* ===== Main form/table - UPDATED FONT SIZE ===== */
        .program-table,
        table {
            width: 100% !important;
            max-width: 99.5% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
        }

        .program-table th {
            background-color: #d9d9d9 !important;
            color: #000 !important;
            border: 1px solid #000 !important;
            padding: 4px 3px !important;
            text-align: center !important;
            vertical-align: middle !important;
            font-weight: bold !important;

            font-size: 11px !important;
            line-height: 1.15 !important;

            word-break: normal !important;
            overflow-wrap: break-word !important;
            white-space: normal !important;
            hyphens: auto !important;
        }

        .program-table td {
            border: 1px solid #000 !important;
            padding: 4px 3px !important;
            vertical-align: top !important;

            font-size: 11px !important;
            line-height: 1.15 !important;

            word-break: break-word !important;
            overflow-wrap: anywhere !important;
            white-space: normal !important;
        }

        .program-table thead tr:first-child th {
            font-size: 11px !important;
            line-height: 1.15 !important;
        }

        .program-table thead tr:nth-child(2) th {
            font-size: 11px !important;
            line-height: 1.15 !important;
        }

        tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        thead {
            display: table-header-group;
        }

        tfoot {
            display: table-footer-group;
        }

        .program-table td[contenteditable="true"],
        [contenteditable="true"] {
            background-color: #fff !important;
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

        .printable-checkbox {
            display: inline-block;
        }

        .approvals-container {
            margin-top: 40px !important;
            margin-bottom: 10px !important;
            width: 95% !important;
            max-width: none !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            page-break-inside: auto !important;
            break-inside: auto !important;
        }

        .approvals-container .label {
            font-weight: bold !important;
            margin-bottom: 10px !important;
        }

        .approval-row {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            margin-bottom: 25px !important;
            width: 100% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        .signature-group {
            width: 35% !important;
            text-align: left !important;
        }

        .signature-line {
            border-bottom: 1.5px solid #000 !important;
            height: 25px !important;
            margin-bottom: 5px !important;
            width: 100% !important;
        }

        .signature-group .title {
            font-size: 12px !important;
        }

        .approval-centered {
            text-align: center !important;
            margin-top: 20px !important;
        }

        .admin-block {
            margin-top: 20px !important;
            margin-bottom: 10px !important;
        }

        .name-underlined {
            display: inline-block !important;
            font-weight: bold !important;
            text-decoration: underline !important;
            text-transform: uppercase !important;
            margin-bottom: 2px !important;
        }

        .left-align {
            text-align: left !important;
            width: 100% !important;
        }

        .document-info {
            margin-top: 4px !important;
            width: 100% !important;
            display: block !important;
            clear: both !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-before: auto !important;
        }

        .doc-header {
            width: 305px !important;
            max-width: 305px !important;
            margin: 0 !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            font-family: Arial, sans-serif;
            font-size: 11px;
            border: 1px solid #d1d1d1 !important;
        }

        .doc-header tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        .doc-header td {
            border: 1px solid #d1d1d1 !important;
            padding: 0 !important;
            vertical-align: middle !important;
        }

        .doc-header td.label {
            background-color: #002060 !important;
            color: #fff !important;
            font-weight: bold !important;
            text-align: left !important;
            white-space: nowrap !important;
            width: 100px !important;
            font-size: 11px !important;
            padding: 6px 8px !important;
            line-height: 1.2 !important;
        }

        .doc-header td.colon,
        .doc-header td:nth-child(2) {
            width: 14px !important;
            padding: 0 1px !important;
            text-align: center !important;
            font-weight: bold !important;
            background: #fff !important;
            color: #000 !important;
        }

        .doc-header td.value {
            padding: 6px 10px !important;
            min-width: 190px !important;
            text-align: left !important;
            background: #fff !important;
            color: #000 !important;
            white-space: nowrap !important;
        }

        .doc-header td.value input,
        .doc-header td.value p {
            border: none !important;
            background: transparent !important;
            font-family: inherit !important;
            font-size: inherit !important;
            color: #333 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            outline: none !important;
            box-shadow: none !important;
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
            max-height: 26px;
            margin: 0 !important;
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

    [
        'header',
        '.header-content',
        '.office-title',
        '.double-line',
        'footer',
        '.footer-bottom',
        '.footer-logos'
    ].forEach(selector => {
        clonedMain.querySelectorAll(selector).forEach(el => el.remove());
    });

    syncFormValues(formContainer, clonedMain);
    wrapper.appendChild(clonedMain);

    const approvalSource =
        document.querySelector('.approvals-container') ||
        document.querySelector('.approval-row')?.closest('section, div');

    if (approvalSource && !wrapper.querySelector('.approvals-container')) {
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
        'PROGRAM DESIGN FORM';

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
