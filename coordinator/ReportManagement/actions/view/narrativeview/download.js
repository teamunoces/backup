/**
 * download.js - Handle PDF download of narrative report
 * Repeats header and footer on every PDF page without overlapping the main content.
 */

document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('downloadPDF');
    if (btn) {
        btn.addEventListener('click', downloadPDF);
    }
});

let __pdfWorkspace = null;
let __pdfStyleEl = null;
let __pdfLibrariesPromise = null;
let __pdfHiddenState = null;

async function downloadPDF() {
    const button = document.getElementById('downloadPDF');
    const originalText = button ? button.textContent : 'Download PDF';

    try {
        if (button) {
            button.textContent = 'Generating PDF...';
            button.disabled = true;
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

        const mainContent =
            document.querySelector('.report-container') ||
            document.querySelector('#main_content') ||
            document.body;

        if (!mainContent) {
            throw new Error('Narrative report container not found.');
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

        const fileName = `Monthly_Accomplishment_Report_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`;
        pdf.save(fileName);

        cleanupPdfWorkspace();
        restoreHiddenElements();
    } catch (error) {
        console.error('PDF Error:', error);
        cleanupPdfWorkspace();
        restoreHiddenElements();
        alert('Could not generate PDF. Check console.\n\nError: ' + error.message);
    } finally {
        if (button) {
            button.textContent = originalText;
            button.disabled = false;
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
            font-size: 12px;
            line-height: 1.4;
            color: #333;
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
        #pdf-workspace .approvals-container,
        #pdf-workspace .document-info-wrap,
        #pdf-workspace .document-info {
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

        #pdf-workspace .main-title {
            text-align: center;
            font-size: 18px;
            text-decoration: underline;
            margin: 15px 0 30px 0;
            text-transform: uppercase;
            font-weight: bold;
        }

        #pdf-workspace .report-list {
            list-style-type: upper-roman;
            padding-left: 36px;
            margin: 0;
        }

        #pdf-workspace .report-list li {
            margin-bottom: 24px;
        }

        #pdf-workspace .report-list .label,
        #pdf-workspace .approvals-container .label {
            display: block;
            font-weight: bold;
            margin-bottom: 6px;
            font-size: 14px;
        }

        #pdf-workspace .line-input {
            width: 100%;
            border: none !important;
            background: #fff !important;
            font-family: inherit;
            font-size: 14px;
            padding: 0;
            line-height: 1.6;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: anywhere;
            min-height: 60px;
        }

        #pdf-workspace .approvals-container {
            margin-top: 60px !important;
        }

        #pdf-workspace .approval-row {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            gap: 16px;
            margin-bottom: 20px;
        }

        #pdf-workspace .signature-group {
            width: 35% !important;
        }

        #pdf-workspace .signature-line {
            border-bottom: 1.5px solid black !important;
            margin-bottom: 5px !important;
            min-height: 30px !important;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: anywhere;
        }

        #pdf-workspace .title {
            font-size: 14px;
        }

        #pdf-workspace .bold {
            font-weight: bold;
        }

        #pdf-workspace .left-align {
            text-align: left;
            width: 100%;
        }

        #pdf-workspace .approval-centered {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
        }

        #pdf-workspace .admin-block {
            text-align: center !important;
            margin-top: 26px;
            margin-bottom: 8px;
        }

        #pdf-workspace .name-underlined {
            font-weight: bold;
            text-decoration: underline;
            text-transform: uppercase;
            font-size: 16px;
            display: inline-block;
            margin-bottom: 2px;
        }

        #pdf-workspace .document-info-wrap {
            margin-top: 40px !important;
            display: block !important;
            clear: both !important;
        }

        #pdf-workspace .document-info {
            display: block !important;
            margin: 0 !important;
            width: 305px !important;
            max-width: 305px !important;
        }

        #pdf-workspace .doc-header {
            width: 100% !important;
            margin: 0 !important;
            border-collapse: collapse;
            table-layout: fixed;
            font-family: Arial, sans-serif;
            font-size: 11px;
            border: 1px solid #d1d1d1;
        }

        #pdf-workspace .doc-header td {
            border: 1px solid #d1d1d1;
            padding: 0;
            vertical-align: middle;
        }

        #pdf-workspace .doc-header td.label {
            background-color: #002060;
            color: #fff;
            font-weight: bold;
            text-align: left;
            white-space: nowrap;
            width: 100px;
            font-size: 11px;
            padding: 6px 8px;
            line-height: 1.2;
            display: table-cell !important;
        }

        #pdf-workspace .doc-header td.colon,
        #pdf-workspace .doc-header td:nth-child(2) {
            width: 14px;
            padding: 0 1px;
            font-weight: bold;
            text-align: center;
            vertical-align: middle;
            background: #fff;
            color: #000;
        }

        #pdf-workspace .doc-header td.value {
            padding: 6px 10px;
            min-width: 190px;
            text-align: left;
            vertical-align: middle;
            background: #fff;
            color: #000;
            white-space: nowrap;
        }

        #pdf-workspace .doc-header td.value input,
        #pdf-workspace .doc-header td.value p {
            border: none;
            background: transparent;
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
    body.innerHTML = buildNarrativeBodyHtml({
        narrateSuccess: document.getElementById('narrate_success')?.value || '',
        provideData: document.getElementById('provide_data')?.value || '',
        identifyProblems: document.getElementById('identify_problems')?.value || '',
        proposeSolutions: document.getElementById('propose_solutions')?.value || '',
        createdByName: document.getElementById('created_by_name')?.textContent?.trim() || '',
        dean: document.getElementById('dean')?.textContent?.trim() || '',
        cesHead: document.getElementById('ces_head')?.textContent?.trim() || '',
        vpAcad: document.getElementById('vp_acad')?.textContent?.trim() || '',
        vpAdmin: document.getElementById('vp_admin')?.textContent?.trim() || '',
        schoolPresident: document.getElementById('school_president')?.textContent?.trim() || '',
        issueStatus: document.querySelector('input[name="issue_status"]')?.value || '',
        revisionNumber: document.querySelector('input[name="revision_number"]')?.value || '',
        dateEffective: document.querySelector('input[name="date_effective"]')?.value || '',
        approvedBy: document.querySelector('input[name="approved_by"]')?.value || '',
        documentType: document.querySelector('.document_type')?.textContent?.trim() || 'FM-DPM-SMCC-CES-05A'
    });

    __pdfWorkspace.appendChild(header);
    __pdfWorkspace.appendChild(body);
    __pdfWorkspace.appendChild(footer);
}

function buildNarrativeBodyHtml(data) {
    return `
        <div class="report-container">
            <h1 class="main-title">MONTHLY ACCOMPLISHMENT REPORT - NARRATIVE REPORT</h1>

            <ol class="report-list">
                <li>
                    <div class="label">Narrate Success</div>
                    <div class="line-input">${escapeHtml(data.narrateSuccess) || '_________________________'}</div>
                </li>
                <li>
                    <div class="label">Provide Data</div>
                    <div class="line-input">${escapeHtml(data.provideData) || '_________________________'}</div>
                </li>
                <li>
                    <div class="label">Identify Problems</div>
                    <div class="line-input">${escapeHtml(data.identifyProblems) || '_________________________'}</div>
                </li>
                <li>
                    <div class="label">Propose Solutions</div>
                    <div class="line-input">${escapeHtml(data.proposeSolutions) || '_________________________'}</div>
                </li>
            </ol>
        </div>

        <div class="approvals-container">
            <div class="approval-row">
                <div class="signature-group">
                    <div class="label">Prepared by:</div>
                    <div class="signature-line">${escapeHtml(data.createdByName)}</div>
                    <div class="title bold">CES Coordinator</div>
                </div>
            </div>

            <div class="label" style="margin-top: 20px;">Noted by:</div>
            <div class="approval-row">
                <div class="signature-group">
                    <div class="signature-line">${escapeHtml(data.dean)}</div>
                    <div class="title bold">Dean</div>
                </div>
                <div class="signature-group">
                    <div class="signature-line">${escapeHtml(data.cesHead)}</div>
                    <div class="title bold">CES Head</div>
                </div>
            </div>

            <div class="approval-centered" style="margin-top: 40px;">
                <div class="label left-align">Recommending Approval:</div>
                <div class="admin-block">
                    <div class="name-underlined">${escapeHtml(data.vpAcad)}</div>
                    <div class="title bold">Vice-President for Academic Affairs and Research</div>
                </div>
                <div class="admin-block">
                    <div class="name-underlined">${escapeHtml(data.vpAdmin)}</div>
                    <div class="title bold">Vice-President for Administrative Affairs</div>
                </div>
            </div>

            <div class="approval-centered">
                <div class="label left-align">Approved by:</div>
                <div class="admin-block">
                    <div class="name-underlined">${escapeHtml(data.schoolPresident)}</div>
                    <div class="title bold">School President</div>
                </div>
            </div>
        </div>

        <div class="document-info-wrap">
            <div class="document-info">
                <table class="doc-header">
                    <tr>
                        <td class="label">Form Code No.</td>
                        <td class="colon">:</td>
                        <td class="value">${escapeHtml(data.documentType)}</td>
                    </tr>
                    <tr>
                        <td class="label">Issue Status</td>
                        <td class="colon">:</td>
                        <td class="value">${escapeHtml(data.issueStatus)}</td>
                    </tr>
                    <tr>
                        <td class="label">Revision No.</td>
                        <td class="colon">:</td>
                        <td class="value">${escapeHtml(data.revisionNumber)}</td>
                    </tr>
                    <tr>
                        <td class="label">Date Effective</td>
                        <td class="colon">:</td>
                        <td class="value">${escapeHtml(data.dateEffective)}</td>
                    </tr>
                    <tr>
                        <td class="label">Approved By</td>
                        <td class="colon">:</td>
                        <td class="value">${escapeHtml(data.approvedBy)}</td>
                    </tr>
                </table>
            </div>
        </div>
    `;
}

function buildPrintHeaderHtml() {
    const leftLogo = document.querySelector('.logo-left')?.src ||
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
            <p><a href="http://www.smccnasipit.edu.ph">www.smccnasipit.edu.ph</a></p>
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
    if (!value) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.downloadPDF = downloadPDF;