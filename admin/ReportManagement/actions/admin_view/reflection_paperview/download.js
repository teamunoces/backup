/**
 * download.js - MONTHLY ACCOMPLISHMENT REPORT - REFLECTION PAPER
 * Generates a multi-page PDF with repeated header/footer on every page
 * and keeps the main content from overlapping them.
 */

document.addEventListener('DOMContentLoaded', function () {
    const downloadBtn = document.getElementById('downloadPDF');
    if (downloadBtn) {
        const newBtn = downloadBtn.cloneNode(true);
        downloadBtn.parentNode.replaceChild(newBtn, downloadBtn);
        newBtn.addEventListener('click', function (e) {
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
    const originalText = downloadBtn ? downloadBtn.innerHTML : 'Download PDF';

    try {
        if (downloadBtn) {
            downloadBtn.innerHTML = '⏳ Generating PDF...';
            downloadBtn.disabled = true;
            downloadBtn.style.opacity = '0.7';
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
        buildWorkspaceContent();

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
        console.error('PDF Error:', error);
        cleanupPdfWorkspace();
        restoreHiddenElements();
        alert('Error generating PDF: ' + error.message);
    } finally {
        if (downloadBtn) {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
            downloadBtn.style.opacity = '1';
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
                throw new Error('Failed to load html2canvas library');
            }

            if (!getJsPDFConstructor()) {
                throw new Error('Failed to load jsPDF library');
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

        #pdf-workspace .report-container,
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
            flex: 1;
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
            margin: 20px 0 5px;
            text-transform: uppercase;
        }

        #pdf-workspace .double-line {
            border-top: 4px double #4f81bd !important;
            margin-bottom: 25px;
        }

        #pdf-workspace .main-title {
            text-align: center;
            font-size: 18px;
            text-decoration: underline;
            margin-bottom: 25px;
            text-transform: uppercase;
        }

        #pdf-workspace .input-group {
            display: flex;
            margin-bottom: 10px;
            align-items: baseline;
        }

        #pdf-workspace .input-group label {
            white-space: nowrap;
            font-weight: bold;
            width: 180px;
        }

        #pdf-workspace .print-line {
            flex: 1;
            border: none !important;
            border-bottom: 1px solid black !important;
            font-family: inherit;
            font-size: 14px;
            padding: 5px;
            background: transparent !important;
            min-height: 28px;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: anywhere;
        }

        #pdf-workspace .instruction {
            margin: 15px 0;
            font-size: 14px;
        }

        #pdf-workspace .translation {
            text-decoration: underline;
        }

        #pdf-workspace .checkbox-grid {
            display: flex;
            gap: 40px;
            margin: 20px 0;
        }

        #pdf-workspace .column {
            flex: 1;
        }

        #pdf-workspace .check-item {
            margin-bottom: 8px;
        }

        #pdf-workspace .check-item label {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        #pdf-workspace .printable-box {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 14px !important;
            height: 14px !important;
            border: 1px solid #8a8a8a !important;
            border-radius: 2px !important;
            background: #fff !important;
            color: transparent !important;
            font-size: 11px !important;
            line-height: 1 !important;
            vertical-align: middle !important;
            flex: 0 0 14px;
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

        #pdf-workspace .questions-section {
            margin: 30px 0 20px;
        }

        #pdf-workspace .questions-section h3 {
            text-decoration: underline;
            margin-bottom: 15px;
            font-size: 16px;
        }

        #pdf-workspace .question {
            margin-bottom: 15px;
            font-size: 14px;
        }

        #pdf-workspace .italic-trans {
            font-style: italic;
            margin-top: 3px;
        }

        #pdf-workspace .answer-section {
            margin: 20px 0;
        }

        #pdf-workspace .answer-section p strong {
            font-size: 14px;
        }

        #pdf-workspace .answer-block {
            display: flex;
            margin-bottom: 20px;
            align-items: flex-start;
        }

        #pdf-workspace .answer-number {
            font-weight: bold;
            margin-right: 10px;
            width: 25px;
            font-size: 14px;
            padding-top: 1px;
        }

        #pdf-workspace .paper-answer-block {
            align-items: flex-start !important;
            margin-bottom: 14px !important;
        }

        #pdf-workspace .paper-answer {
            flex: 1;
        }

        #pdf-workspace .paper-line-row {
            min-height: 28px;
            line-height: 28px;
            border-bottom: 1px solid #777;
            position: relative;
        }

        #pdf-workspace .paper-line-text {
            display: inline-block;
            padding: 0 2px;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: anywhere;
            font-size: 14px;
        }

        #pdf-workspace .signature-wrapper {
            margin-top: 80px;
            display: flex;
            justify-content: flex-end;
        }

        #pdf-workspace .signature-block {
            text-align: center;
            width: 300px;
        }

        #pdf-workspace .signature-line {
            border-bottom: 1px solid black;
            padding: 5px;
            margin-bottom: 5px;
            min-height: 30px;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: anywhere;
        }

        #pdf-workspace .signature-label {
            margin-top: 8px;
            font-size: 13px;
        }

        #pdf-workspace .document-info {
            margin-top: 50px !important;
            width: 32% !important;
        }

        #pdf-workspace .doc-header {
            border-collapse: collapse;
            font-family: Arial, sans-serif;
            font-size: 11px;
            border: 1px solid #d1d1d1;
            width: auto;
            margin-right: auto;
        }

        #pdf-workspace .doc-header td {
            border: 1px solid #d1d1d1;
            padding: 5px 10px;
        }

        #pdf-workspace .doc-header td.label {
            background-color: #002060 !important;
            color: white !important;
            font-weight: bold;
            padding: 4px 8px;
            text-align: left;
            white-space: nowrap;
            width: 100px;
        }

        #pdf-workspace .doc-header td:nth-child(2) {
            width: 2%;
            padding: 0 1px;
            font-weight: bold;
            border-top: 1px solid #d1d1d1;
            border-bottom: 1px solid #d1d1d1;
            text-align: center;
        }

        #pdf-workspace .doc-header td.value {
            padding: 4px 10px;
            min-width: 120px;
            text-align: left;
        }

        #pdf-workspace .doc-header td.value .printable-field {
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

function buildWorkspaceContent() {
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
    body.appendChild(buildPrintableBody());

    __pdfWorkspace.appendChild(header);
    __pdfWorkspace.appendChild(body);
    __pdfWorkspace.appendChild(footer);
}

function buildPrintableBody() {
    const beneficiaryName = document.getElementById('beneficiary_name')?.value || '';
    const implementingDept = document.getElementById('implementing_department')?.value || '';
    const answerOne = document.getElementById('answer_one')?.value || '';
    const answerTwo = document.getElementById('answer_two')?.value || '';
    const answerThree = document.getElementById('answer_three')?.value || '';
    const beneficiarySignature = document.getElementById('beneficiary_signature')?.value || '';

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const checkboxValues = [];
    checkboxes.forEach((cb) => {
        checkboxValues.push(cb.checked);
    });

    const issueStatus = document.querySelector('input[name="issue_status"]')?.value || '';
    const revisionNumber = document.querySelector('input[name="revision_number"]')?.value || '';
    const dateEffective = document.querySelector('input[name="date_effective"]')?.value || '';
    const approvedBy = document.querySelector('input[name="approved_by"]')?.value || '';

    const wrapper = document.createElement('div');
    wrapper.className = 'report-container';

    wrapper.innerHTML = `
        <h1 class="main-title">MONTHLY ACCOMPLISHMENT REPORT - REFLECTION PAPER</h1>

        <div class="input-group">
            <label>Name of the Beneficiary:</label>
            <div class="print-line">${escapeHtml(beneficiaryName)}</div>
        </div>
        <div class="input-group">
            <label>Implementing Department:</label>
            <div class="print-line">${escapeHtml(implementingDept)}</div>
        </div>

        <p class="instruction">
            Kindly put a check (/) mark on the type of extension service extended
            <span class="translation">(Palihog ibutang ang tsek (/) sa klase sa serbisyo sa komunidad nga gihatag)</span>:
        </p>

        <div class="checkbox-grid">
            <div class="column">
                <div class="check-item"><label><span class="printable-box ${checkboxValues[0] ? 'checked' : ''}"></span> Reading Literacy and Numeracy Program</label></div>
                <div class="check-item"><label><span class="printable-box ${checkboxValues[1] ? 'checked' : ''}"></span> Sustainable Livelihood Program</label></div>
                <div class="check-item"><label><span class="printable-box ${checkboxValues[2] ? 'checked' : ''}"></span> Feeding Program</label></div>
                <div class="check-item"><label><span class="printable-box ${checkboxValues[3] ? 'checked' : ''}"></span> Recollection/Retreat</label></div>
                <div class="check-item"><label><span class="printable-box ${checkboxValues[4] ? 'checked' : ''}"></span> Lecture/Seminar</label></div>
            </div>
            <div class="column">
                <div class="check-item"><label><span class="printable-box ${checkboxValues[5] ? 'checked' : ''}"></span> Training and Workshop</label></div>
                <div class="check-item"><label><span class="printable-box ${checkboxValues[6] ? 'checked' : ''}"></span> Coastal Clean-Up drive</label></div>
                <div class="check-item"><label><span class="printable-box ${checkboxValues[7] ? 'checked' : ''}"></span> Tree Planting Program</label></div>
                <div class="check-item"><label><span class="printable-box ${checkboxValues[8] ? 'checked' : ''}"></span> Gardening Program</label></div>
                <div class="check-item"><label><span class="printable-box ${checkboxValues[9] ? 'checked' : ''}"></span> Community Clean-up Drive</label></div>
                <div class="check-item"><label><span class="printable-box ${checkboxValues[10] ? 'checked' : ''}"></span> Health/Crime Prevention/Environmental Awareness</label></div>
            </div>
        </div>

        <div class="questions-section">
            <h3>Guide Questions:</h3>
            <div class="question">
                <p>1. How did the program influence your sense of social responsibility?</p>
                <p class="italic-trans">Giunsa sa programa pagpalambo sa imong pagbati sa sosyal nga responsibilidad?</p>
            </div>
            <div class="question">
                <p>2. What values did you develop or strengthen through participation?</p>
                <p class="italic-trans">Unsang mga kinaiya ang imong napalambo o napalig-on pinaagi sa pag-apil sa programa?</p>
            </div>
            <div class="question">
                <p>3. How will you apply what you learned from the program in your daily life or real-life situations?</p>
                <p class="italic-trans">Giunsa nimo pag-aplikar ang imong nahibal-an gikan sa programa sa imong adlaw-adlaw nga kinabuhi o sa tinuod nga kahimtang?</p>
            </div>
        </div>

        <div class="answer-section">
            <p><strong>Answer:</strong></p>

            <div class="answer-block paper-answer-block">
                <div class="answer-number">1.</div>
                <div class="paper-answer">${buildPaperAnswer(answerOne, 5)}</div>
            </div>

            <div class="answer-block paper-answer-block">
                <div class="answer-number">2.</div>
                <div class="paper-answer">${buildPaperAnswer(answerTwo, 5)}</div>
            </div>

            <div class="answer-block paper-answer-block">
                <div class="answer-number">3.</div>
                <div class="paper-answer">${buildPaperAnswer(answerThree, 5)}</div>
            </div>
        </div>

        <div class="signature-wrapper">
            <div class="signature-block">
                <div class="signature-line">${escapeHtml(beneficiarySignature)}</div>
                <div class="signature-label">Signature of the Beneficiary</div>
            </div>
        </div>

        <div class="document-info">
            <table class="doc-header">
                <tr>
                    <td class="label">Form Code No.</td>
                    <td>:</td>
                    <td class="value">FM-DPM-SMCC-CES-05B</td>
                </tr>
                <tr>
                    <td class="label">Issue Status</td>
                    <td>:</td>
                    <td class="value"><div class="printable-field">${escapeHtml(issueStatus)}</div></td>
                </tr>
                <tr>
                    <td class="label">Revision No.</td>
                    <td>:</td>
                    <td class="value"><div class="printable-field">${escapeHtml(revisionNumber)}</div></td>
                </tr>
                <tr>
                    <td class="label">Date Effective</td>
                    <td>:</td>
                    <td class="value"><div class="printable-field">${escapeHtml(dateEffective)}</div></td>
                </tr>
                <tr>
                    <td class="label">Approved By</td>
                    <td>:</td>
                    <td class="value"><div class="printable-field">${escapeHtml(approvedBy)}</div></td>
                </tr>
            </table>
        </div>
    `;

    return wrapper;
}

function buildPaperAnswer(text, rows = 5) {
    const lines = splitTextIntoLines(text || '', 85, rows);

    return lines.map(line => `
        <div class="paper-line-row">
            <span class="paper-line-text">${escapeHtml(line)}</span>
        </div>
    `).join('');
}

function splitTextIntoLines(text, maxChars = 85, minRows = 5) {
    const cleaned = String(text || '').replace(/\r/g, '');
    const paragraphs = cleaned.split('\n');
    const lines = [];

    paragraphs.forEach(paragraph => {
        const words = paragraph.split(/\s+/).filter(Boolean);

        if (!words.length) {
            lines.push('');
            return;
        }

        let current = '';
        words.forEach(word => {
            const test = current ? `${current} ${word}` : word;
            if (test.length <= maxChars) {
                current = test;
            } else {
                if (current) lines.push(current);
                current = word;
            }
        });

        if (current) lines.push(current);
    });

    while (lines.length < minRows) {
        lines.push('');
    }

    return lines;
}

function buildPrintHeaderHtml() {
    const leftLogo =
        document.querySelector('.logo-left')?.src ||
        '/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/smcclogo.png';

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
                <div class="college-info">${collegeInfoHtml}</div>
                <div class="logos-right">${rightLogoHtml}</div>
            </div>
            <h2 class="office-title">${escapeHtml(officeTitle)}</h2>
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
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return `Monthly_Accomplishment_Report_${dateStr}.pdf`;
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

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

window.downloadPDF = downloadPDF;