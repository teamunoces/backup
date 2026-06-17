/**
 * download.js - Program Monitoring Form
 * Generates a multi-page PDF with repeated header/footer on every page
 * and keeps the main content from overlapping them.
 */

document.addEventListener('DOMContentLoaded', function () {
    const downloadBtn = document.getElementById('downloadPDF');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function (e) {
            e.preventDefault();
            downloadPDF();
        });
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
            console.error('Program Monitoring Form container not found');
            throw new Error('Could not find form content to download');
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
        alert(error.message || 'Failed to generate PDF. Please try again.');
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
            line-height: 1.4;
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
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            background: #fff !important;
            overflow: visible !important;
            pointer-events: none !important;
            user-select: text !important;
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
            margin-bottom: 15px;
            width: 100%;
        }

        #pdf-workspace .logo-left {
            height: 90px;
            width: auto;
        }

        #pdf-workspace .logos-right {
            display: flex;
            gap: 20px;
            align-items: center;
        }

        #pdf-workspace .logos-right img {
            height: 80px;
            width: auto;
        }

        #pdf-workspace .college-info {
            text-align: center;
            flex-grow: 1;
            padding: 0 20px;
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
            line-height: 1.4;
        }

        #pdf-workspace .college-info a {
            font-size: 13px;
            color: #0000EE !important;
            text-decoration: underline;
        }

        #pdf-workspace .office-title {
            text-align: center;
            font-size: 18px;
            color: #595959 !important;
            font-weight: bold;
            margin: 20px 0 5px 0;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        #pdf-workspace .double-line {
            border-top: 4px double #4f81bd !important;
            margin-bottom: 25px;
        }

        #pdf-workspace .form-container {
            background: #fff !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
        }

        #pdf-workspace h2 {
            text-align: center;
            margin: 0 0 30px 0 !important;
            text-transform: capitalize;
            font-size: 16px !important;
        }

        #pdf-workspace h3 {
            margin-top: 30px;
            margin-bottom: 10px;
            font-size: 1.1em;
        }

        #pdf-workspace .header-info {
            margin-bottom: 20px;
        }

        #pdf-workspace .input-group {
            display: flex;
            margin-bottom: 8px;
            align-items: flex-end;
        }

        #pdf-workspace .input-group label {
            font-weight: bold;
            white-space: nowrap;
            margin-right: 10px;
        }

        #pdf-workspace .input-group input,
        #pdf-workspace .input-group .printable-field {
            border: none !important;
            border-bottom: 1px solid black !important;
            width: 100% !important;
            outline: none !important;
            background: transparent !important;
            color: #000 !important;
            padding: 2px 4px !important;
            min-height: 18px !important;
        }

        #pdf-workspace table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-bottom: 20px;
        }

        #pdf-workspace th,
        #pdf-workspace td {
            border: 1px solid black !important;
            padding: 8px !important;
            font-size: 0.9em !important;
            vertical-align: top !important;
            color: #000 !important;
        }

        #pdf-workspace th {
            background-color: #ffffff !important;
            text-align: center;
            text-transform: uppercase;
        }

        #pdf-workspace .center-text {
            text-align: center !important;
        }

        #pdf-workspace tbody tr {
            height: 30px;
        }

        #pdf-workspace .checkbox-cell {
            text-align: center !important;
            vertical-align: middle !important;
        }

        #pdf-workspace .followUp {
            width: 70px !important;
            padding: 4px !important;
            text-align: center !important;
            border: none !important;
            background: transparent !important;
            color: #000 !important;
        }

        #pdf-workspace textarea {
            width: 100% !important;
            border: 1px solid #ccc !important;
            padding: 4px !important;
            font-family: Arial, sans-serif !important;
            font-size: 0.9em !important;
            resize: none !important;
            background: transparent !important;
            color: #000 !important;
        }

        #pdf-workspace .paper-lines,
        #pdf-workspace #other_recommendations {
            width: 100% !important;
            border: none !important;
            outline: none !important;
            font-size: 0.9em !important;
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

        #pdf-workspace .footer-notes {
            margin-top: 20px;
        }

        #pdf-workspace #feedbackTable {
            width: 100% !important;
            border-collapse: collapse !important;
            font-family: Arial, sans-serif !important;
        }

        #pdf-workspace #feedbackTable th,
        #pdf-workspace #feedbackTable td {
            border: 1px solid #000 !important;
            padding: 10px !important;
        }

        #pdf-workspace .feedbackSummary,
        #pdf-workspace .feedbackAction {
            width: 100% !important;
            box-sizing: border-box !important;
            border: none !important;
            padding: 8px !important;
            font-family: inherit !important;
            font-size: 0.9em !important;
            display: block !important;
            overflow: hidden !important;
            min-height: 50px !important;
            background: transparent !important;
        }

        #pdf-workspace #otherIssues {
            width: 100% !important;
            box-sizing: border-box !important;
            border: none !important;
            padding: 8px !important;
            font-family: inherit !important;
            font-size: 13px !important;
            display: block !important;
            overflow: hidden !important;
            min-height: 38px !important;
            background: transparent !important;
        }

        #pdf-workspace .printable-field {
            display: block;
            width: 100%;
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

        #pdf-workspace #recommendationsTable td:first-child {
            width: 120px !important;
            white-space: nowrap !important;
            text-align: left !important;
            vertical-align: middle !important;
            padding: 8px 10px !important;
        }

        #pdf-workspace #recommendationsTable td:first-child .printable-choice {
            display: inline-flex !important;
            align-items: center !important;
            gap: 6px !important;
            margin-right: 10px !important;
            vertical-align: middle !important;
        }

        #pdf-workspace #recommendationsTable td:first-child .choice-label {
            font-size: 0.9em !important;
            color: #000 !important;
            line-height: 1 !important;
        }

        #pdf-workspace .printable-box {
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

        #pdf-workspace .printable-box.checked {
            background: #e1251b !important;
            border-color: #e1251b !important;
            color: #fff !important;
            font-weight: bold !important;
        }

        #pdf-workspace .printable-box.checked::before {
            content: "✓";
            transform: translateY(-0.5px);
        }

        #pdf-workspace #recommendationsTable td:last-child {
            vertical-align: middle !important;
            line-height: 1.35 !important;
        }

        #pdf-workspace .approvals-container {
            font-family: Arial, sans-serif;
            width: 100% !important;
            max-width: 900px !important;
            margin: 0 auto !important;
            color: #000;
        }

        #pdf-workspace .approval-row {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 20px !important;
        }

        #pdf-workspace .signature-group {
            width: 35% !important;
        }

        #pdf-workspace .label {
            font-weight: bold !important;
            margin-bottom: 35px !important;
        }

        #pdf-workspace .signature-line {
            border-bottom: 1.5px solid black !important;
            margin-bottom: 5px !important;
        }

        #pdf-workspace .title {
            font-size: 14px !important;
        }

        #pdf-workspace .bold {
            font-weight: bold !important;
        }

        #pdf-workspace .left-align {
            text-align: left !important;
            width: 100% !important;
        }

        #pdf-workspace .approval-centered {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
        }

        #pdf-workspace .admin-block {
            text-align: center !important;
            margin-top: 30px !important;
            margin-bottom: 10px !important;
        }

        #pdf-workspace .name-underlined {
            font-weight: bold !important;
            text-decoration: underline !important;
            text-transform: uppercase !important;
            font-size: 16px !important;
            display: inline-block !important;
            margin-bottom: 2px !important;
        }

        #pdf-workspace .document-info {
            margin-top: 50px !important;
            width: 30% !important;
        }

        #pdf-workspace .doc-header {
            width: auto !important;
            margin-right: auto !important;
            border-collapse: collapse !important;
            font-family: Arial, sans-serif !important;
            font-size: 11px !important;
            border: 1px solid #d1d1d1 !important;
        }

        #pdf-workspace .doc-header td {
            border: 1px solid #000 !important;
            padding: 5px 10px !important;
        }

        #pdf-workspace .doc-header td.label {
            background-color: #002060 !important;
            color: #fff !important;
            width: 100px !important;
            font-size: 11px !important;
            font-weight: bold !important;
            padding: 4px 8px !important;
            border: 1px solid #d1d1d1 !important;
            text-align: left !important;
            white-space: nowrap !important;
        }

        #pdf-workspace .doc-header td:nth-child(2) {
            width: 2% !important;
            padding: 0 1px !important;
            font-weight: bold !important;
            border-top: 1px solid #d1d1d1 !important;
            border-bottom: 1px solid #d1d1d1 !important;
            text-align: center !important;
        }

        #pdf-workspace .doc-header td.value {
            width: 70% !important;
            font-size: 11px !important;
            text-align: left !important;
            padding: 4px 10px !important;
            border: 1px solid #d1d1d1 !important;
            min-width: 120px !important;
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

    const firstHeader = clone.querySelector('header');
    if (firstHeader) firstHeader.remove();

    clone.querySelectorAll('footer, .footer-bottom, .footer-logos')
        .forEach(el => el.remove());

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
    const now = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    return `Program_Monitoring_Form_${now}.pdf`;
}

function hideScreenOnlyElements() {
    const targets = [
        document.getElementById('sidebarFrame'),
        document.getElementById('headerFrame'),
        document.querySelector('.buttons'),
        document.querySelector('.admin-comment')
    ].filter(Boolean);

    const formContainer = document.querySelector('.form-container');

    __pdfHiddenState = {
        targets: targets.map(node => ({
            node,
            display: node.style.display
        })),
        formMarginTop: formContainer?.style.marginTop || '',
        formMarginLeft: formContainer?.style.marginLeft || '',
        formWidth: formContainer?.style.width || '',
        bodyMarginLeft: document.body.style.marginLeft,
        bodyBackgroundColor: document.body.style.backgroundColor
    };

    targets.forEach(node => {
        node.style.display = 'none';
    });

    if (formContainer) {
        formContainer.style.marginTop = '0';
        formContainer.style.marginLeft = '0';
        formContainer.style.width = '100%';
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
            formContainer.style.marginLeft = __pdfHiddenState.formMarginLeft;
            formContainer.style.width = __pdfHiddenState.formWidth;
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

            if (field.classList.contains('recYes') || field.classList.contains('recNa')) {
                return;
            }

            if (type === 'checkbox') {
                const replacement = document.createElement('span');
                replacement.className = `printable-box ${field.checked ? 'checked' : ''}`;
                field.replaceWith(replacement);
                return;
            }

            if (type === 'radio') {
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