/**
 * download.js - Handles PDF download functionality for Monthly Accomplishment Report
 * Generates a multi-page PDF with header and footer repeated on every page.
 * Automatically loads html2canvas and jsPDF if they are not already available.
 */

document.addEventListener('DOMContentLoaded', function () {
    const downloadBtn = document.getElementById('downloadPDF');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadAsPDF);
    }
});

let __pdfWorkspace = null;
let __pdfStyleEl = null;
let __pdfHiddenState = null;
let __pdfLibrariesPromise = null;

async function downloadAsPDF() {
    try {
        showLoadingIndicator('Loading PDF tools...');

        await ensurePdfLibraries();

        const html2canvasLib = window.html2canvas;
        const jsPDFCtor = getJsPDFConstructor();

        if (!html2canvasLib) {
            throw new Error('html2canvas failed to load.');
        }

        if (!jsPDFCtor) {
            throw new Error('jsPDF failed to load.');
        }

        showLoadingIndicator('Preparing PDF...');

        const mainContent = document.querySelector('#main_content');
        const reportContainer =
            document.querySelector('.report-container') ||
            mainContent?.closest('.report-container, .evaluation-container, .certificate-container, form, section, div') ||
            mainContent;

        if (!mainContent || !reportContainer) {
            throw new Error('Report container or #main_content not found.');
        }

        __pdfHiddenState = hideScreenOnlyElements();

        const pdf = new jsPDFCtor({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const pageWidthMm = pdf.internal.pageSize.getWidth();
        const pageHeightMm = pdf.internal.pageSize.getHeight();

        const marginTopMm = 8;
        const marginRightMm = 8;
        const marginBottomMm = 8;
        const marginLeftMm = 8;

        const printableWidthMm = pageWidthMm - marginLeftMm - marginRightMm;
        const printableHeightMm = pageHeightMm - marginTopMm - marginBottomMm;

        const renderWidthPx = 1200;
        const pxPerMm = renderWidthPx / printableWidthMm;
        const renderPageHeightPx = Math.round(printableHeightMm * pxPerMm);

        createPdfWorkspace(renderWidthPx);
        buildWorkspaceContent(mainContent);

        await waitForImages(__pdfWorkspace);
        await waitForFonts(document);

        const headerNode = __pdfWorkspace.querySelector('#pdf-header');
        const footerNode = __pdfWorkspace.querySelector('#pdf-footer');
        const bodyNode = __pdfWorkspace.querySelector('#pdf-body');

        if (!headerNode || !footerNode || !bodyNode) {
            throw new Error('Failed to build PDF header, body, or footer.');
        }

        showLoadingIndicator('Rendering PDF pages...');

        const canvasScale = 2;

        const headerCanvas = await html2canvasLib(headerNode, {
            scale: canvasScale,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
        });

        const footerCanvas = await html2canvasLib(footerNode, {
            scale: canvasScale,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
        });

        const headerHeightPx = Math.ceil(headerNode.getBoundingClientRect().height);
        const footerHeightPx = Math.ceil(footerNode.getBoundingClientRect().height);

        const usableBodyHeightPx = renderPageHeightPx - headerHeightPx - footerHeightPx;
        if (usableBodyHeightPx <= 0) {
            throw new Error('Header/footer are too large for the page.');
        }

        const bodyCanvas = await html2canvasLib(bodyNode, {
            scale: canvasScale,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: renderWidthPx,
            windowHeight: Math.max(bodyNode.scrollHeight, bodyNode.offsetHeight)
        });

        const headerHeightMm = headerHeightPx / pxPerMm;
        const footerHeightMm = footerHeightPx / pxPerMm;
        const bodySliceHeightMm = usableBodyHeightPx / pxPerMm;

        const bodyCanvasPageSlicePx = Math.floor(bodyCanvas.width * (bodySliceHeightMm / printableWidthMm));
        if (bodyCanvasPageSlicePx <= 0) {
            throw new Error('Failed to calculate body slice height.');
        }

        const headerImage = headerCanvas.toDataURL('image/jpeg', 1.0);
        const footerImage = footerCanvas.toDataURL('image/jpeg', 1.0);

        let sourceY = 0;
        let pageIndex = 0;

        while (sourceY < bodyCanvas.height) {
            const remainingHeight = bodyCanvas.height - sourceY;
            const currentSliceHeightPx = Math.min(bodyCanvasPageSlicePx, remainingHeight);

            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = bodyCanvas.width;
            sliceCanvas.height = currentSliceHeightPx;

            const ctx = sliceCanvas.getContext('2d');
            if (!ctx) {
                throw new Error('Unable to create PDF canvas context.');
            }

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

            ctx.drawImage(
                bodyCanvas,
                0,
                sourceY,
                bodyCanvas.width,
                currentSliceHeightPx,
                0,
                0,
                sliceCanvas.width,
                currentSliceHeightPx
            );

            const sliceImage = sliceCanvas.toDataURL('image/jpeg', 1.0);
            const sliceHeightMm = printableWidthMm * (currentSliceHeightPx / sliceCanvas.width);

            if (pageIndex > 0) {
                pdf.addPage();
            }

            pdf.addImage(
                headerImage,
                'JPEG',
                marginLeftMm,
                marginTopMm,
                printableWidthMm,
                headerHeightMm,
                undefined,
                'FAST'
            );

            pdf.addImage(
                sliceImage,
                'JPEG',
                marginLeftMm,
                marginTopMm + headerHeightMm,
                printableWidthMm,
                sliceHeightMm,
                undefined,
                'FAST'
            );

            pdf.addImage(
                footerImage,
                'JPEG',
                marginLeftMm,
                pageHeightMm - marginBottomMm - footerHeightMm,
                printableWidthMm,
                footerHeightMm,
                undefined,
                'FAST'
            );

            sourceY += currentSliceHeightPx;
            pageIndex += 1;
        }

        pdf.save(generateFileName());

        cleanupPdfWorkspace();
        restoreHiddenElements();
        hideLoadingIndicator();
    } catch (error) {
        console.error('PDF generation failed:', error);
        cleanupPdfWorkspace();
        restoreHiddenElements();
        hideLoadingIndicator();
        alert('Failed to generate PDF. Please try again.');
    }
}

async function ensurePdfLibraries() {
    if (window.html2canvas && getJsPDFConstructor()) {
        return;
    }

    if (!__pdfLibrariesPromise) {
        __pdfLibrariesPromise = (async () => {
            if (!window.html2canvas) {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
            }

            if (!getJsPDFConstructor()) {
                await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            }

            if (!window.html2canvas) {
                throw new Error('html2canvas is still unavailable after loading.');
            }

            if (!getJsPDFConstructor()) {
                throw new Error('jsPDF is still unavailable after loading.');
            }
        })().catch(error => {
            __pdfLibrariesPromise = null;
            throw error;
        });
    }

    return __pdfLibrariesPromise;
}

function getJsPDFConstructor() {
    if (window.jspdf && window.jspdf.jsPDF) {
        return window.jspdf.jsPDF;
    }

    if (window.jsPDF) {
        return window.jsPDF;
    }

    return null;
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-pdf-lib="${src}"], script[src="${src}"]`);

        if (existing) {
            if (existing.dataset.loaded === 'true') {
                resolve();
                return;
            }

            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${src}`)), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.defer = true;
        script.dataset.pdfLib = src;

        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve();
        };

        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

        document.head.appendChild(script);
    });
}

function createPdfWorkspace(renderWidthPx) {
    cleanupPdfWorkspace();

    __pdfWorkspace = document.createElement('div');
    __pdfWorkspace.id = 'pdf-workspace';
    __pdfWorkspace.style.cssText = `
        position: fixed;
        left: -20000px;
        top: 0;
        width: ${renderWidthPx}px;
        background: white;
        z-index: -1;
        opacity: 0;
        pointer-events: none;
    `;
    document.body.appendChild(__pdfWorkspace);

    __pdfStyleEl = document.createElement('style');
    __pdfStyleEl.setAttribute('data-pdf-runtime', 'true');
    __pdfStyleEl.textContent = `
        #pdf-workspace, #pdf-workspace * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
        }

        #pdf-workspace {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
            background: #fff;
        }

        #pdf-workspace .pdf-measure-page,
        #pdf-workspace .pdf-render-page,
        #pdf-workspace .pdf-render-body-only {
            width: ${renderWidthPx}px;
            background: #fff;
            overflow: hidden;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
        }

        #pdf-workspace .pdf-header,
        #pdf-workspace .pdf-footer,
        #pdf-workspace .pdf-render-body {
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
        }

        #pdf-workspace .report-container,
        #pdf-workspace .evaluation-container,
        #pdf-workspace #main_content,
        #pdf-workspace .pdf-body-wrapper,
        #pdf-workspace .print-approval-section,
        #pdf-workspace .print-document-info-section {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            overflow: visible !important;
        }

        #pdf-workspace #main_content,
        #pdf-workspace #main_content > *:first-child,
        #pdf-workspace .pdf-body-wrapper > *:first-child,
        #pdf-workspace .pdf-body-wrapper > *:first-child *:first-child {
            margin-top: 0 !important;
            padding-top: 0 !important;
        }

        #pdf-workspace header,
        #pdf-workspace footer,
        #pdf-workspace .header-content,
        #pdf-workspace .footer-bottom,
        #pdf-workspace .footer-logos {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
        }

        #pdf-workspace #headerFrame,
        #pdf-workspace #sidebarFrame,
        #pdf-workspace .buttons,
        #pdf-workspace #downloadPDF,
        #pdf-workspace .admin-comment,
        #pdf-workspace .no-print,
        #pdf-workspace .print-hide,
        #pdf-workspace .action-buttons,
        #pdf-workspace .wrapper,
        #pdf-workspace [data-no-print="true"],
        #pdf-workspace button,
        #pdf-workspace script,
        #pdf-workspace noscript {
            display: none !important;
        }

        #pdf-workspace .print-page-header {
            width: 100%;
            margin: 0 !important;
            padding: 0 0 10px 0 !important;
            background: #fff !important;
        }

        #pdf-workspace .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
            width: 100%;
            gap: 12px;
            flex-wrap: nowrap;
        }

        #pdf-workspace .logo-left {
            height: 90px;
            width: auto;
            flex: 0 0 auto;
        }

        #pdf-workspace .logos-right {
            display: flex;
            gap: 20px;
            align-items: center;
            flex: 0 0 auto;
        }

        #pdf-workspace .logos-right img {
            height: 80px;
            width: auto;
        }

        #pdf-workspace .college-info {
            text-align: center;
            flex: 1 1 auto;
            padding: 0 10px;
        }

        #pdf-workspace .college-info h1 {
            font-family: "Times New Roman", Times, serif;
            color: #4f81bd !important;
            font-size: 26px;
            margin: 0;
            font-weight: normal;
            line-height: 1.2;
        }

        #pdf-workspace .college-info p {
            font-size: 11px;
            margin: 2px 0;
            color: #333;
            line-height: 1.3;
        }

        #pdf-workspace .college-info a {
            font-size: 13px;
            color: #0000EE !important;
            text-decoration: underline;
            word-break: break-all;
        }

        #pdf-workspace .office-title {
            text-align: center;
            font-size: 18px;
            color: #595959 !important;
            font-weight: bold;
            margin: 5px 0;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        #pdf-workspace .double-line {
            border-top: 4px double #4f81bd !important;
            margin-bottom: 15px;
        }

        #pdf-workspace .header-table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 0 0 12px 0 !important;
            table-layout: fixed !important;
        }

        #pdf-workspace .header-table td.label {
            width: 30% !important;
            padding: 6px !important;
            border: 1px solid #000 !important;
            font-weight: bold !important;
            background-color: #ffffff !important;
            word-break: break-word;
        }

        #pdf-workspace .header-table td.input_cell {
            width: 70% !important;
            padding: 6px !important;
            border: 1px solid #000 !important;
            word-break: break-word;
        }

        #pdf-workspace .main-table,
        #pdf-workspace table {
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            background: #fff;
        }

        #pdf-workspace .main-table th {
            background-color: #e0e0e0 !important;
            color: #333 !important;
            border: 1px solid #000 !important;
            padding: 6px 4px !important;
            text-align: center;
            font-weight: bold;
            font-size: 10px !important;
            word-break: break-word;
            overflow-wrap: anywhere;
        }

        #pdf-workspace .main-table td {
            border: 1px solid #000 !important;
            padding: 6px 4px !important;
            vertical-align: top;
            font-size: 10px !important;
            word-break: break-word;
            overflow-wrap: anywhere;
        }

        #pdf-workspace .main-table td,
        #pdf-workspace .main-table th,
        #pdf-workspace .header-table td,
        #pdf-workspace .document-info td,
        #pdf-workspace .doc-header td {
            word-break: break-word !important;
            overflow-wrap: anywhere !important;
            white-space: normal !important;
        }

        #pdf-workspace .print-approval-section {
            margin-top: 8px !important;
        }

        #pdf-workspace .approval-row {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            gap: 16px;
            margin: 0 0 14px 0 !important;
        }

        #pdf-workspace .signature-group {
            width: 35% !important;
        }

        #pdf-workspace .approval-centered {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            margin: 12px 0 0 0 !important;
        }

        #pdf-workspace .admin-block {
            text-align: center !important;
            margin: 12px 0 6px 0 !important;
        }

        #pdf-workspace .signature-line {
            border-bottom: 1.5px solid black !important;
            margin-bottom: 5px !important;
            min-height: 22px !important;
        }

        #pdf-workspace .name-underlined {
            text-decoration: underline !important;
        }

        #pdf-workspace .document-info {
            margin-top: 50px;
            width: 30%;
        }

        #pdf-workspace .doc-header {
            width: auto;
            margin-right: auto;
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            font-size: 11px;
        }

        #pdf-workspace .doc-header .label,
        #pdf-workspace .doc-header td.label {
            background-color: #002060 !important;
            color: white !important;
            width: 25%;
            font-size: 11px;
            font-weight: bold;
            padding: 4px 8px;
            text-align: left;
            white-space: nowrap;
            border: 1px solid #d1d1d1 !important;
        }

        #pdf-workspace .doc-header td.value {
            width: 70%;
            font-size: 11px;
            text-align: left;
            padding: 4px 10px;
            border: 1px solid #d1d1d1 !important;
        }

        #pdf-workspace .doc-header td.value input,
        #pdf-workspace .doc-header td.value p {
            border: none !important;
            background: transparent !important;
            font-family: inherit;
            font-size: inherit;
            color: #333;
            margin: 0;
            padding: 0;
            width: 100%;
        }

        #pdf-workspace .print-footer-inner,
        #pdf-workspace footer {
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            background: #fff !important;
        }

        #pdf-workspace .footer-bottom {
            display: flex;
            align-items: flex-end;
            justify-content: flex-end;
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
        }

        #pdf-workspace .footer-logos {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            width: 100%;
            gap: 0;
            margin: 0 !important;
            padding: 0 !important;
        }

        #pdf-workspace .footer-logos img,
        #pdf-workspace .print-footer-logo {
            display: block;
            width: 100%;
            max-width: 100%;
            height: auto;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            object-fit: contain;
        }

        #pdf-workspace .printable-field {
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

        #pdf-workspace .printable-checkbox {
            display: inline-block;
        }

        #pdf-workspace img {
            max-width: 100%;
            height: auto;
        }
    `;
    document.head.appendChild(__pdfStyleEl);
}

function buildWorkspaceContent(mainContent) {
    const header = document.createElement('div');
    header.id = 'pdf-header';
    header.className = 'pdf-header pdf-render-page';
    header.innerHTML = buildPrintHeaderHtml();

    const footer = document.createElement('div');
    footer.id = 'pdf-footer';
    footer.className = 'pdf-footer pdf-render-page';
    footer.innerHTML = buildPrintFooterHtml();

    const body = document.createElement('div');
    body.id = 'pdf-body';
    body.className = 'pdf-render-body pdf-render-body-only';

    const bodyWrapper = document.createElement('div');
    bodyWrapper.className = 'pdf-body-wrapper';

    const mainClone = mainContent.cloneNode(true);
    removeNonPrintable(mainClone);
    syncFormValues(mainContent, mainClone);
    convertFormControlsToPrintable(mainClone);
    bodyWrapper.appendChild(mainClone);

    const approvalSource =
        document.querySelector('.approvals-container') ||
        document.querySelector('.approval-row')?.closest('section, div');

    if (approvalSource) {
        const approvalClone = approvalSource.cloneNode(true);
        removeNonPrintable(approvalClone);
        syncFormValues(approvalSource, approvalClone);
        convertFormControlsToPrintable(approvalClone);

        const approvalWrap = document.createElement('div');
        approvalWrap.className = 'print-approval-section';
        approvalWrap.appendChild(approvalClone);
        bodyWrapper.appendChild(approvalWrap);
    }

    const documentInfoSource =
        document.querySelector('.document-info') ||
        document.querySelector('.doc-header')?.closest('.document-info, div');

    if (documentInfoSource) {
        const docInfoClone = documentInfoSource.cloneNode(true);
        removeNonPrintable(docInfoClone);
        syncFormValues(documentInfoSource, docInfoClone);
        convertFormControlsToPrintable(docInfoClone);

        const docInfoWrap = document.createElement('div');
        docInfoWrap.className = 'print-document-info-section';
        docInfoWrap.appendChild(docInfoClone);
        bodyWrapper.appendChild(docInfoWrap);
    }

    body.appendChild(bodyWrapper);

    __pdfWorkspace.appendChild(header);
    __pdfWorkspace.appendChild(body);
    __pdfWorkspace.appendChild(footer);
}

function cleanupPdfWorkspace() {
    if (__pdfStyleEl) {
        __pdfStyleEl.remove();
        __pdfStyleEl = null;
    }

    if (__pdfWorkspace) {
        __pdfWorkspace.remove();
        __pdfWorkspace = null;
    }
}

function buildPrintHeaderHtml() {
    const leftLogo = document.querySelector('.logo-left')?.src || '';
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
                ${leftLogo ? `<img src="${escapeHtml(leftLogo)}" alt="Logo" class="logo-left">` : '<div></div>'}
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
    const footerImg = document.querySelector('.footer-bottom img')?.src || '';
    return `
        <div class="print-footer-inner">
            ${footerImg ? `<img src="${escapeHtml(footerImg)}" alt="Footer Logo" class="print-footer-logo">` : ''}
        </div>
    `;
}

function hideScreenOnlyElements() {
    const targets = [
        document.getElementById('sidebarFrame'),
        document.getElementById('headerFrame'),
        document.querySelector('.buttons'),
        document.querySelector('.admin-comment')
    ].filter(Boolean);

    __pdfHiddenState = {
        targets: targets.map(node => ({
            node,
            display: node.style.display
        })),
        bodyMarginLeft: document.body.style.marginLeft,
        bodyBackgroundColor: document.body.style.backgroundColor
    };

    targets.forEach(node => {
        node.style.display = 'none';
    });

    document.body.style.marginLeft = '0';
    document.body.style.backgroundColor = 'white';

    return __pdfHiddenState;
}

function restoreHiddenElements() {
    if (__pdfHiddenState) {
        __pdfHiddenState.targets.forEach(item => {
            if (item.node) {
                item.node.style.display = item.display;
            }
        });

        document.body.style.marginLeft = __pdfHiddenState.bodyMarginLeft;
        document.body.style.backgroundColor = __pdfHiddenState.bodyBackgroundColor;
    }

    __pdfHiddenState = null;
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

function waitForImages(root) {
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
                setTimeout(done, 4000);
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

    await new Promise(resolve => requestAnimationFrame(() => resolve()));
    await new Promise(resolve => requestAnimationFrame(() => resolve()));
}

function generateFileName() {
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 10);
    const month = document.getElementById('month')?.value || 'Month';
    const department = document.getElementById('department')?.value || 'Department';

    const cleanMonth = String(month).replace(/[^a-zA-Z0-9]/g, '_');
    const cleanDept = String(department).replace(/[^a-zA-Z0-9]/g, '_');

    return `MAR_${cleanDept}_${cleanMonth}_${formattedDate}.pdf`;
}

function showLoadingIndicator(message = 'Generating PDF...') {
    let overlay = document.getElementById('pdf-loading-overlay');

    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'pdf-loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;

        const loader = document.createElement('div');
        loader.id = 'pdf-loading-text';
        loader.style.cssText = `
            background: white;
            padding: 20px 40px;
            border-radius: 8px;
            font-family: Arial, sans-serif;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            color: #002060;
            border-left: 4px solid #002060;
        `;

        overlay.appendChild(loader);
        document.body.appendChild(overlay);
    }

    const loaderText = document.getElementById('pdf-loading-text');
    if (loaderText) {
        loaderText.textContent = message;
    }
}

function hideLoadingIndicator() {
    const overlay = document.getElementById('pdf-loading-overlay');
    if (overlay) {
        overlay.remove();
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.downloadAsPDF = downloadAsPDF;