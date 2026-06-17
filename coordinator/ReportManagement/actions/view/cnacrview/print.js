// print.js - COMMUNITY NEEDS ASSESSMENT CONSOLIDATED REPORT
function printReport() {
    const reportContainer = document.querySelector('.report-container');

    if (!reportContainer) {
        console.error('Report container not found');
        alert('Could not find report content to print.');
        return;
    }

    const printClone = reportContainer.cloneNode(true);
    syncFormValues(reportContainer, printClone);
    convertTextareasForPrint(printClone);

    const headerElements = [...printClone.querySelectorAll('header')];
    const footerElement = printClone.querySelector('footer');

    const headerHTML = headerElements.map(el => el.outerHTML).join('');
    const footerHTML = footerElement ? footerElement.outerHTML : '';

    headerElements.forEach(el => el.remove());
    if (footerElement) footerElement.remove();

    const printContainer = document.createElement('div');
    printContainer.id = 'print-container';

    printContainer.innerHTML = `
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
                            ${printClone.innerHTML}
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    `;

    const styleElement = document.createElement('style');
    styleElement.setAttribute('data-print-runtime', 'true');
    styleElement.textContent = `
        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        @media print {
            @page {
                margin: 12mm 12mm 20mm 12mm;
                size: auto;
            }

            html, body {
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                outline: none !important;
                background: white !important;
                font-family: Arial, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #333;
            }

            body > *:not(#print-container):not(style[data-print-runtime]) {
                display: none !important;
            }

            #print-container {
                display: block !important;
                width: 100%;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                outline: none !important;
                background: white !important;
            }

            #sidebarFrame,
            #headerFrame,
            .buttons,
            .admin-comment,
            .action-buttons,
            .wrapper,
            .no-print,
            .print-hide,
            [data-no-print="true"] {
                display: none !important;
            }

            .print-shell {
                width: 100%;
                margin: 0 !important;
                padding: 0 !important;
                border-collapse: collapse;
                border-spacing: 0;
                table-layout: fixed;
                border: none !important;
                outline: none !important;
                background: white !important;
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
                vertical-align: top;
                background: white !important;
            }

            .print-header,
            .print-footer,
            .print-body {
                width: 100%;
                margin: 0 !important;
                background: white !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
            }

            .print-header {
                padding: 0 0 10px 0 !important;
            }

            .print-footer {
                padding: 6mm 0 0 0 !important;
                height: auto !important;
            }

            .print-body {
                padding: 0 0 18mm 0 !important;
            }

            .report-container {
                max-width: none !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                background: white !important;
                border-radius: 0 !important;
            }

            header,
            footer,
            .print-header,
            .print-footer,
            .header-content,
            .footer-bottom,
            .footer-logos {
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
    }            header h1 {
                text-align: center;
                font-size: 18px;
                text-decoration: underline;
                margin: 15px 0 20px 0;
            }

            .header-grid {
                display: grid !important;
                grid-template-columns: 145px 1fr 150px 1fr !important;
                border: 1px solid #000 !important;
                margin-bottom: 30px !important;
            }

            .bg-gray {
                background-color: #b3b3b3 !important;
            }

            .section-header {
                background-color: #b3b3b3 !important;
                border: 1px solid #000 !important;
                margin-top: 20px !important;
            }

            .paper-lines,
            textarea.paper-lines,
            .print-textarea-block.paper-lines {
                background-image: linear-gradient(to bottom, transparent 29px, #000 29px) !important;
                background-size: 100% 30px !important;
                background-attachment: local !important;
            }

            .approval-row {
                display: flex !important;
                flex-direction: row !important;
                justify-content: space-between !important;
                gap: 24px !important;
                margin-bottom: 20px !important;
            }

            .signature-group {
                width: 35% !important;
            }

            .signature-line {
                border-bottom: 1.5px solid black !important;
                margin-bottom: 5px !important;
            }

            .name-underlined {
                text-decoration: underline !important;
            }

            .approvals-container {
                margin-bottom: 14mm !important;
            }

            .document-info {
                width: 34% !important;
                max-width: 34% !important;
                margin: 35px 0 25mm 0 !important;
                padding: 0 !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
                page-break-before: auto !important;
                display: block !important;
            }

            .doc-header {
                width: 100% !important;
                border-collapse: collapse !important;
                table-layout: fixed !important;
                font-family: Arial, sans-serif !important;
                font-size: 10px !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }

            .doc-header td {
                border: 1px solid #000 !important;
                padding: 3px 5px !important;
                line-height: 1.2 !important;
                vertical-align: middle !important;
            }

            .doc-header td.label {
                width: 42% !important;
                background-color: #002060 !important;
                color: white !important;
                font-weight: bold !important;
                text-align: left !important;
                white-space: nowrap !important;
            }

            .doc-header td:nth-child(2) {
                width: 5% !important;
                text-align: center !important;
                font-weight: bold !important;
            }

            .doc-header td.value {
                width: 53% !important;
                text-align: left !important;
                white-space: normal !important;
                overflow-wrap: break-word !important;
            }

            .doc-header input,
            .doc-header p {
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                background: transparent !important;
                font-size: 10px !important;
                line-height: 1.2 !important;
                text-align: left !important;
            }

            .approvals-container,
            .document-info,
            .section-header,
            .approval-row,
            .signature-group,
            .approval-centered,
            .header-grid {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }

            table, tr, td, th {
                page-break-inside: avoid;
                break-inside: avoid;
            }

            textarea,
            .paper-lines,
            .print-body textarea,
            .print-body .paper-lines,
            .print-textarea-block {
                height: auto !important;
                min-height: 120px !important;
                overflow: visible !important;
                resize: none !important;
                display: block !important;
                white-space: pre-wrap !important;
                word-break: break-word !important;
                overflow-wrap: anywhere !important;
                padding: 0 !important;
                border: none !important;
                outline: none !important;
                background-color: transparent !important;
                box-shadow: none !important;
            }

            .print-textarea-block {
                width: 100% !important;
            }

            img {
                max-width: 100%;
                height: auto;
                page-break-inside: avoid;
                break-inside: avoid;
            }

            footer {
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }

            .footer-bottom {
                display: flex;
                align-items: flex-end;
                justify-content: flex-end;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            .footer-logos {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                width: 100% !important;
                gap: 0;
                margin: 0 !important;
                padding: 0 !important;
            }

            .footer-logos img {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                object-fit: contain !important;
            }

            h1, h2, h3, h4, h5, h6, p {
                page-break-after: avoid;
                break-after: avoid-page;
                orphans: 3;
                widows: 3;
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
    `;

    document.head.appendChild(styleElement);
    document.body.appendChild(printContainer);

    const cleanup = () => {
        if (printContainer.parentNode) {
            printContainer.parentNode.removeChild(printContainer);
        }

        if (styleElement.parentNode) {
            styleElement.parentNode.removeChild(styleElement);
        }

        window.removeEventListener('afterprint', cleanup);
    };

    const waitForImages = () => {
        const images = [...printContainer.querySelectorAll('img')];

        if (!images.length) {
            window.addEventListener('afterprint', cleanup, { once: true });
            window.print();
            setTimeout(cleanup, 1500);
            return;
        }

        let done = 0;

        const finish = () => {
            done += 1;

            if (done >= images.length) {
                window.addEventListener('afterprint', cleanup, { once: true });
                window.print();
                setTimeout(cleanup, 1500);
            }
        };

        images.forEach((img) => {
            if (img.complete) {
                finish();
            } else {
                img.addEventListener('load', finish, { once: true });
                img.addEventListener('error', finish, { once: true });
            }
        });
    };

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            waitForImages();
        });
    });
}

function syncFormValues(source, clone) {
    const sourceInputs = source.querySelectorAll('input, textarea, select');
    const cloneInputs = clone.querySelectorAll('input, textarea, select');

    sourceInputs.forEach((original, index) => {
        const target = cloneInputs[index];
        if (!target) return;

        const tag = target.tagName.toLowerCase();
        const type = (target.getAttribute('type') || '').toLowerCase();

        if (type === 'checkbox' || type === 'radio') {
            if (original.checked) {
                target.setAttribute('checked', 'checked');
                target.checked = true;
            } else {
                target.removeAttribute('checked');
                target.checked = false;
            }
            return;
        }

        if (tag === 'textarea') {
            target.value = original.value;
            target.textContent = original.value;
            target.style.height = 'auto';
            target.style.minHeight = Math.max(original.scrollHeight, 120) + 'px';
            return;
        }

        if (tag === 'select') {
            [...target.options].forEach((opt, i) => {
                opt.selected = original.options[i]?.selected || false;

                if (opt.selected) {
                    opt.setAttribute('selected', 'selected');
                } else {
                    opt.removeAttribute('selected');
                }
            });
            return;
        }

        target.value = original.value;
        target.setAttribute('value', original.value || '');
    });
}

function convertTextareasForPrint(root) {
    const textareas = root.querySelectorAll('textarea');

    textareas.forEach((textarea) => {
        const div = document.createElement('div');

        div.className = textarea.classList.contains('paper-lines')
            ? 'paper-lines print-textarea-block'
            : 'print-textarea-block';

        div.textContent = textarea.value || textarea.textContent || '';
        div.style.minHeight = Math.max(textarea.scrollHeight || 120, 120) + 'px';
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordBreak = 'break-word';
        div.style.overflowWrap = 'anywhere';

        textarea.replaceWith(div);
    });
}

window.printReport = printReport;
