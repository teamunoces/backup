/**
 * download.js - PROGRAM DESIGN FORM
 * Generates a multi-page PDF with repeated header/footer on every page
 * and keeps the main content from overlapping them.
 */

document.addEventListener('DOMContentLoaded', function () {
    const downloadBtn = document.getElementById('downloadPDF');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadPDF);
    }
});

let __pdfWorkspace = null;
let __pdfStyleEl = null;
let __pdfLibrariesPromise = null;
let __pdfHiddenState = null;

async function downloadPDF() {
    const downloadBtn = document.getElementById('downloadPDF');
    const originalText = downloadBtn ? downloadBtn.textContent : 'Download PDF';

    try {
        if (downloadBtn) {
            downloadBtn.textContent = 'Generating PDF...';
            downloadBtn.disabled = true;
        }

        await ensurePdfLibraries();

        const html2canvasLib = window.html2canvas;
        const jsPDFCtor = getJsPDFConstructor();

        if (!html2canvasLib) {
            throw new Error('html2canvas is not available.');
        }
        if (!jsPDFCtor) {
            throw new Error('jsPDF is not available.');
        }

        const formContainer =
            document.querySelector('.form-container') ||
            document.querySelector('#main_content') ||
            document.querySelector('form');

        if (!formContainer) {
            throw new Error('Program Design Form container not found.');
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
        buildWorkspaceContent(formContainer);

        await waitForImages(__pdfWorkspace);
        await waitForFonts(document);

        const headerNode = __pdfWorkspace.querySelector('#pdf-header');
        const footerNode = __pdfWorkspace.querySelector('#pdf-footer');
        const bodyNode = __pdfWorkspace.querySelector('#pdf-body');

        if (!headerNode || !footerNode || !bodyNode) {
            throw new Error('Failed to build PDF layout.');
        }

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

        const bodyCanvasPageSlicePx = Math.floor(
            bodyCanvas.width * (bodySliceHeightMm / printableWidthMm)
        );

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
    } catch (error) {
        console.error('PDF generation failed:', error);
        cleanupPdfWorkspace();
        restoreHiddenElements();
        alert('Failed to generate PDF. Please try again.');
    } finally {
        if (downloadBtn) {
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }
    }
}

async function ensurePdfLibraries() {
    if (window.html2canvas && getJsPDFConstructor()) {
        return;
    }

    if (!__pdfLibrariesPromise) {
        __pdfLibrariesPromise = (async () => {
            if (!window.html2canvas) {
                await loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
            }

            if (!getJsPDFConstructor()) {
                await loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
            }

            if (!window.html2canvas) {
                throw new Error('html2canvas is not available.');
            }

            if (!getJsPDFConstructor()) {
                throw new Error('jsPDF is not available.');
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

function loadScriptOnce(src) {
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
            font-size: 11px;
            line-height: 1.35;
            color: #000;
            background: #fff;
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

        #pdf-workspace .pdf-body-wrapper,
        #pdf-workspace .form-container,
        #pdf-workspace #main_content,
        #pdf-workspace .approvals-container,
        #pdf-workspace .document-info {
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

        #pdf-workspace .pdf-body-wrapper > *:first-child,
        #pdf-workspace .pdf-body-wrapper > *:first-child *:first-child,
        #pdf-workspace .form-container > *:first-child,
        #pdf-workspace #main_content > *:first-child {
            margin-top: 0 !important;
            padding-top: 0 !important;
        }

        #pdf-workspace #sidebarFrame,
        #pdf-workspace #headerFrame,
        #pdf-workspace .buttons,
        #pdf-workspace .admin-comment,
        #pdf-workspace .no-print,
        #pdf-workspace .print-hide,
        #pdf-workspace [data-no-print="true"],
        #pdf-workspace button,
        #pdf-workspace script,
        #pdf-workspace noscript,
        #pdf-workspace .print-header,
        #pdf-workspace .print-footer,
        #pdf-workspace footer,
        #pdf-workspace .footer-bottom,
        #pdf-workspace .footer-logos {
            display: none !important;
        }

        #pdf-workspace .print-page-header {
            margin: 0 !important;
            padding: 0 !important;
        }

        #pdf-workspace .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            gap: 12px;
            flex-wrap: nowrap;
            margin: 0 0 10px 0 !important;
            padding: 0 !important;
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
            color: #333 !important;
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

        /* Title and top input fields */
        #pdf-workspace .form-type {
            text-align: center !important;
            font-family: "Times New Roman", Times, serif !important;
            font-size: 16px !important;
            font-weight: bold !important;
            letter-spacing: 2px !important;
            text-transform: uppercase !important;
            margin: 6px 0 24px 0 !important;
        }

        #pdf-workspace .input-fields {
            width: 100% !important;
            margin: 0 0 18px 0 !important;
            padding: 0 !important;
        }

        #pdf-workspace .input-row {
            display: flex !important;
            align-items: center !important;
            gap: 14px !important;
            margin-bottom: 14px !important;
        }

        #pdf-workspace .input-row label {
            width: 145px !important;
            min-width: 145px !important;
            font-weight: bold !important;
            font-size: 12px !important;
            text-align: left !important;
            margin: 0 !important;
        }

        #pdf-workspace .input-row .printable-field,
        #pdf-workspace .input-row input,
        #pdf-workspace .input-row textarea,
        #pdf-workspace .input-row select,
        #pdf-workspace .input-row .line-input {
            flex: 1 1 auto !important;
            width: auto !important;
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
        }

        #pdf-workspace .input-row .printable-field {
            white-space: pre-wrap !important;
            word-break: break-word !important;
            overflow-wrap: anywhere !important;
        }

        #pdf-workspace .input-fields .printable-field {
            border-bottom: 1px solid #bfbfbf !important;
            min-height: 24px !important;
            padding: 2px 10px 4px 10px !important;
        }

        #pdf-workspace .input-fields > div {
            display: flex !important;
            align-items: center !important;
            gap: 14px !important;
            margin-bottom: 14px !important;
        }

        #pdf-workspace .input-fields > div > label:first-child,
        #pdf-workspace .input-fields > div > .label:first-child {
            width: 145px !important;
            min-width: 145px !important;
            font-weight: bold !important;
            font-size: 12px !important;
            margin: 0 !important;
        }

        #pdf-workspace .input-fields > div > *:last-child {
            flex: 1 1 auto !important;
        }

        #pdf-workspace .input-fields > div > .printable-field,
        #pdf-workspace .input-fields > div > input,
        #pdf-workspace .input-fields > div > textarea,
        #pdf-workspace .input-fields > div > select {
            flex: 1 1 auto !important;
            border: none !important;
            border-bottom: 1px solid #bfbfbf !important;
            background: transparent !important;
            padding: 2px 10px 4px 10px !important;
            min-height: 24px !important;
        }

        /* Main form/table */
        #pdf-workspace .program-table,
        #pdf-workspace table {
            width: 100% !important;
            max-width: 100% !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
        }

        #pdf-workspace .program-table th {
            background-color: #d9d9d9 !important;
            color: #000 !important;
            border: 1px solid #000 !important;
            padding: 6px 4px !important;
            text-align: center;
            font-weight: bold;
            word-break: break-word;
            overflow-wrap: anywhere;
        }

        #pdf-workspace .program-table td,
        #pdf-workspace table td {
            border: 1px solid #000 !important;
            padding: 6px 4px !important;
            vertical-align: top;
            word-break: break-word;
            overflow-wrap: anywhere;
            white-space: normal !important;
        }

        #pdf-workspace .program-table td[contenteditable="true"],
        #pdf-workspace [contenteditable="true"] {
            background-color: #fff !important;
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

        /* Approvals */
        #pdf-workspace .approvals-container {
            margin-top: 30px !important;
            margin-bottom: 0 !important;
            width: 100% !important;
        }

        #pdf-workspace .approvals-container .label {
            font-weight: bold !important;
            margin-bottom: 6px !important;
        }

        #pdf-workspace .approval-row {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            margin-bottom: 14px !important;
        }

        #pdf-workspace .signature-group {
            width: 40% !important;
            text-align: center !important;
        }

        #pdf-workspace .signature-line {
            border-bottom: 1.5px solid #000 !important;
            height: 25px !important;
            margin: 0 auto 4px auto !important;
            width: 80% !important;
            min-height: 25px !important;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: anywhere;
        }

        #pdf-workspace .signature-group .title {
            font-size: 12px !important;
        }

        #pdf-workspace .approval-centered {
            text-align: center !important;
            margin-top: 10px !important;
        }

        #pdf-workspace .approval-centered:last-of-type {
            margin-top: 8px !important;
            margin-bottom: 0 !important;
        }

        #pdf-workspace .admin-block {
            margin-bottom: 8px !important;
        }

        #pdf-workspace .admin-block:last-child {
            margin-bottom: 4px !important;
        }

        #pdf-workspace .name-underlined {
            display: inline-block !important;
            font-weight: bold !important;
            text-decoration: underline !important;
            text-transform: uppercase !important;
            margin-bottom: 2px !important;
        }

        #pdf-workspace .left-align {
            text-align: left !important;
            width: 100% !important;
        }

        /* Document info */
        #pdf-workspace .document-info {
            margin-top: 4px !important;
            width: 100% !important;
            display: block !important;
            clear: both !important;
        }

        #pdf-workspace .doc-header {
            width: 305px !important;
            max-width: 305px !important;
            margin: 0 !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            font-family: Arial, sans-serif;
            font-size: 11px;
            border: 1px solid #d1d1d1 !important;
        }

        #pdf-workspace .doc-header td {
            border: 1px solid #d1d1d1 !important;
            padding: 0 !important;
            vertical-align: middle !important;
        }

        #pdf-workspace .doc-header td.label {
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

        #pdf-workspace .doc-header td.colon,
        #pdf-workspace .doc-header td:nth-child(2) {
            width: 14px !important;
            padding: 0 1px !important;
            text-align: center !important;
            font-weight: bold !important;
            background: #fff !important;
            color: #000 !important;
        }

        #pdf-workspace .doc-header td.value {
            padding: 6px 10px !important;
            min-width: 190px !important;
            text-align: left !important;
            background: #fff !important;
            color: #000 !important;
            white-space: nowrap !important;
        }

        #pdf-workspace .doc-header td.value input,
        #pdf-workspace .doc-header td.value p {
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

        /* Footer */
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
            max-height: 26px;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            object-fit: contain;
        }

        #pdf-workspace img {
            max-width: 100%;
            height: auto;
        }
    `;
    document.head.appendChild(__pdfStyleEl);
}

function buildWorkspaceContent(formContainer) {
    const header = document.createElement('div');
    header.id = 'pdf-header';
    header.className = 'pdf-header';
    header.innerHTML = buildPrintHeaderHtml();

    const footer = document.createElement('div');
    footer.id = 'pdf-footer';
    footer.className = 'pdf-footer';
    footer.innerHTML = buildPrintFooterHtml();

    const body = document.createElement('div');
    body.id = 'pdf-body';
    body.className = 'pdf-render-body';

    const bodyWrapper = document.createElement('div');
    bodyWrapper.className = 'pdf-body-wrapper';

    const clone = formContainer.cloneNode(true);
    removeNonPrintable(clone);

    [
        'header',
        '.header-content',
        '.office-title',
        '.double-line',
        'footer',
        '.footer-bottom',
        '.footer-logos'
    ].forEach(selector => {
        clone.querySelectorAll(selector).forEach(el => el.remove());
    });

    syncFormValues(formContainer, clone);
    convertFormControlsToPrintable(clone);
    bodyWrapper.appendChild(clone);

    const approvalSource =
        document.querySelector('.approvals-container') ||
        document.querySelector('.approval-row')?.closest('section, div');

    if (approvalSource && !bodyWrapper.querySelector('.approvals-container')) {
        const approvalClone = approvalSource.cloneNode(true);
        removeNonPrintable(approvalClone);
        syncFormValues(approvalSource, approvalClone);
        convertFormControlsToPrintable(approvalClone);
        bodyWrapper.appendChild(approvalClone);
    }

    const documentInfoSource =
        document.querySelector('.document-info') ||
        document.querySelector('.doc-header')?.closest('.document-info, div');

    if (documentInfoSource && !bodyWrapper.querySelector('.document-info')) {
        const docInfoClone = documentInfoSource.cloneNode(true);
        removeNonPrintable(docInfoClone);
        syncFormValues(documentInfoSource, docInfoClone);
        convertFormControlsToPrintable(docInfoClone);
        bodyWrapper.appendChild(docInfoClone);
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

function generateFileName() {
    const titleInput = document.getElementById('title_of_activity');
    const reportId = document.getElementById('currentReportId')?.value || '';
    const title = titleInput && titleInput.value
        ? titleInput.value.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')
        : (reportId || 'form');

    return `Program_Design_${title}.pdf`;
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
        formMarginTop: document.querySelector('.form-container')?.style.marginTop || '',
        bodyMarginLeft: document.body.style.marginLeft,
        bodyBackgroundColor: document.body.style.backgroundColor
    };

    targets.forEach(node => {
        node.style.display = 'none';
    });

    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
        formContainer.style.marginTop = '0';
    }

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

        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
            formContainer.style.marginTop = __pdfHiddenState.formMarginTop;
        }

        document.body.style.marginLeft = __pdfHiddenState.bodyMarginLeft;
        document.body.style.backgroundColor = __pdfHiddenState.bodyBackgroundColor;
    }

    __pdfHiddenState = null;
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

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.downloadPDF = downloadPDF;