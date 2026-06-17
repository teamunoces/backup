// download.js - PDF download with repeated header/footer on every page
window.addEventListener('DOMContentLoaded', () => {
    const downloadBtn = document.getElementById('downloadPDF');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadAsPDF);
    }
});

async function downloadAsPDF() {
    const loadingMsg = createLoadingMessage();
    document.body.appendChild(loadingMsg);

    let workspace = null;
    let styleEl = null;

    try {
        await loadPdfDependencies();

        const evaluationContainer = document.querySelector('.evaluation-container');
        if (!evaluationContainer) {
            throw new Error('Evaluation container not found.');
        }

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // A4 size
        const pageWidthMm = 210;
        const pageHeightMm = 297;

        // PDF margins
        const marginTopMm = 10;
        const marginBottomMm = 10;
        const marginLeftMm = 8;
        const marginRightMm = 8;

        const contentWidthMm = pageWidthMm - marginLeftMm - marginRightMm;
        const contentHeightMm = pageHeightMm - marginTopMm - marginBottomMm;

        // Render width used for DOM measurement and html2canvas
        const renderWidthPx = 1000;
        const pxPerMm = renderWidthPx / contentWidthMm;
        const pageInnerHeightPx = Math.floor(contentHeightMm * pxPerMm);

        // Clone layout
        const sourceClone = evaluationContainer.cloneNode(true);
        fixFormStatesForPDF(sourceClone);

        // Extract header, form, and footer from the layout
        const headerElements = [...sourceClone.querySelectorAll('header')];
        const footerElement = sourceClone.querySelector('footer');
        const formElement = sourceClone.querySelector('#evaluationForm');

        if (!formElement) {
            throw new Error('Could not find #evaluationForm in the layout.');
        }

        const headerHTML = headerElements.map(header => header.outerHTML).join('');
        const footerHTML = footerElement ? footerElement.outerHTML : '';

        // Hidden workspace for measurement/rendering
        workspace = document.createElement('div');
        workspace.id = 'pdf-workspace';
        workspace.style.cssText = `
            position: fixed;
            left: -20000px;
            top: 0;
            width: ${renderWidthPx}px;
            background: white;
            z-index: -1;
            opacity: 0;
            pointer-events: none;
        `;
        document.body.appendChild(workspace);

        styleEl = document.createElement('style');
        styleEl.setAttribute('data-pdf-runtime', 'true');
        styleEl.textContent = `
            #pdf-workspace, #pdf-workspace * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
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

            #pdf-workspace .evaluation-container {
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
            }

            #pdf-workspace #evaluationForm {
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                pointer-events: none;
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

            #pdf-workspace header h1 {
                text-align: center;
                font-size: 18px;
                text-decoration: underline;
                margin: 15px 0 20px 0;
            }

            #pdf-workspace .header-info .input-line {
                display: flex;
                margin-bottom: 10px;
                align-items: flex-end;
                flex-wrap: wrap;
            }

            #pdf-workspace .header-info label {
                font-weight: bold;
                margin-right: 10px;
                white-space: nowrap;
            }

            #pdf-workspace .full-line {
                border: none !important;
                border-bottom: 1px solid #000 !important;
                flex-grow: 1;
                background: transparent !important;
                font-family: inherit;
                font-size: inherit;
                padding: 4px 0;
            }

            #pdf-workspace .checkbox-grid {
                display: flex;
                justify-content: space-between;
                margin: 20px 0;
                flex-wrap: wrap;
            }

            #pdf-workspace .checkbox-grid .column {
                width: 48%;
            }

            #pdf-workspace .checkbox-grid label {
                display: block;
                margin-bottom: 5px;
            }

            #pdf-workspace .legend-table,
            #pdf-workspace .evaluation-table,
            #pdf-workspace .doc-header {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
                background: #fff;
            }

            #pdf-workspace .legend-table th,
            #pdf-workspace .legend-table td,
            #pdf-workspace .evaluation-table th,
            #pdf-workspace .evaluation-table td,
            #pdf-workspace .doc-header th,
            #pdf-workspace .doc-header td {
                border: 1px solid #000 !important;
            }

            #pdf-workspace .legend-table td,
            #pdf-workspace .evaluation-table td,
            #pdf-workspace .doc-header td {
                padding: 8px;
                vertical-align: top;
            }

            #pdf-workspace .legend-table td.score-cell {
                width: 40px;
                text-align: center;
                font-weight: bold;
                vertical-align: middle;
            }

            #pdf-workspace .evaluation-table thead th {
                background-color: #f2f2f2 !important;
            }

            #pdf-workspace .evaluation-table .num-col {
                width: 40px;
                text-align: center;
            }

            #pdf-workspace .category-row {
                background-color: #e9e9e9 !important;
                font-weight: bold;
            }

            #pdf-workspace tr td em {
                font-size: 11px;
                display: block;
                margin-top: 2px;
            }

            #pdf-workspace .radio-cell {
                text-align: center;
                vertical-align: middle;
            }

            #pdf-workspace input[type="radio"] {
                -webkit-appearance: radio !important;
                appearance: radio !important;
                opacity: 1 !important;
                display: inline-block !important;
                transform: scale(1.1) !important;
                margin: 0 4px !important;
                width: 16px !important;
                height: 16px !important;
                accent-color: #dc2626 !important;
                color: #dc2626 !important;
            }

            #pdf-workspace input[type="checkbox"] {
                accent-color: #dc2626 !important;
            }

            #pdf-workspace .signature-section {
                margin-top: 40px;
            }

            #pdf-workspace .sig-line {
                margin-bottom: 10px;
                font-weight: bold;
                display: flex;
                align-items: center;
                flex-wrap: wrap;
            }

            #pdf-workspace .sig-input {
                border: none !important;
                border-bottom: 1px solid #000 !important;
                background: transparent !important;
                width: 280px;
                font-family: inherit;
                font-size: inherit;
                margin-left: 10px;
                padding: 4px 0;
            }

            #pdf-workspace .document-info {
                margin-top: 50px;
                width: 30%;
            }

            #pdf-workspace .doc-header {
                width: auto;
                margin-right: auto;
                font-family: Arial, sans-serif;
                font-size: 11px;
            }

            #pdf-workspace .doc-header .label {
                background-color: #002060 !important;
                color: white !important;
                width: 25%;
                font-size: 11px;
                font-weight: bold;
                padding: 4px 8px;
                text-align: left;
                white-space: nowrap;
            }

            #pdf-workspace .doc-header td.value {
                width: 70%;
                font-size: 11px;
                text-align: left;
                padding: 4px 10px;
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

            #pdf-workspace footer {
                width: 100%;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
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

            #pdf-workspace .footer-logos img {
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
        `;
        document.head.appendChild(styleEl);

        // Measure header and footer once
        const measurePage = document.createElement('div');
        measurePage.className = 'pdf-measure-page';

        const measureHeader = document.createElement('div');
        measureHeader.className = 'pdf-header';
        measureHeader.innerHTML = headerHTML;

        const measureFooter = document.createElement('div');
        measureFooter.className = 'pdf-footer';
        measureFooter.innerHTML = footerHTML;

        measurePage.appendChild(measureHeader);
        measurePage.appendChild(measureFooter);
        workspace.appendChild(measurePage);

        const headerHeightPx = Math.ceil(measureHeader.offsetHeight);
        const footerHeightPx = Math.ceil(measureFooter.offsetHeight);
        const bodyAvailablePx = pageInnerHeightPx - headerHeightPx - footerHeightPx;

        if (bodyAvailablePx <= 100) {
            throw new Error('Header/footer are too large for the page.');
        }

        // Render header/footer to images once
        const headerCanvas = await html2canvas(measureHeader, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            width: measureHeader.scrollWidth,
            height: measureHeader.scrollHeight,
            scrollX: 0,
            scrollY: 0
        });

        const footerCanvas = await html2canvas(measureFooter, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            width: measureFooter.scrollWidth,
            height: measureFooter.scrollHeight,
            scrollX: 0,
            scrollY: 0
        });

        const headerImg = headerCanvas.toDataURL('image/jpeg', 1.0);
        const footerImg = footerCanvas.toDataURL('image/jpeg', 1.0);

        const headerHeightMm = headerHeightPx / pxPerMm;
        const footerHeightMm = footerHeightPx / pxPerMm;

        // Build body segments only
        const pageSegments = buildPageSegments(formElement, bodyAvailablePx, workspace);

        // Render body page by page, then overlay header/footer once
        for (let i = 0; i < pageSegments.length; i++) {
            const bodyPage = document.createElement('div');
            bodyPage.className = 'pdf-render-body-only';
            bodyPage.style.height = `${bodyAvailablePx}px`;

            const bodyWrap = document.createElement('div');
            bodyWrap.className = 'pdf-render-body';

            pageSegments[i].forEach(node => {
                bodyWrap.appendChild(node.cloneNode(true));
            });

            bodyPage.appendChild(bodyWrap);
            workspace.appendChild(bodyPage);

            const bodyCanvas = await html2canvas(bodyPage, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                width: bodyPage.scrollWidth,
                height: bodyPage.scrollHeight,
                scrollX: 0,
                scrollY: 0
            });

            const bodyImg = bodyCanvas.toDataURL('image/jpeg', 1.0);
            const bodyHeightMm = bodyAvailablePx / pxPerMm;

            if (i > 0) {
                pdf.addPage();
            }

            // Body only
            pdf.addImage(
                bodyImg,
                'JPEG',
                marginLeftMm,
                marginTopMm + headerHeightMm,
                contentWidthMm,
                bodyHeightMm
            );

            // Fixed header at top
            pdf.addImage(
                headerImg,
                'JPEG',
                marginLeftMm,
                marginTopMm,
                contentWidthMm,
                headerHeightMm
            );

            // Fixed footer at bottom
            pdf.addImage(
                footerImg,
                'JPEG',
                marginLeftMm,
                pageHeightMm - marginBottomMm - footerHeightMm,
                contentWidthMm,
                footerHeightMm
            );

            workspace.removeChild(bodyPage);
        }

        const now = new Date();
        const dateStr = now.toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `Evaluation_Sheet_${dateStr}.pdf`;

        pdf.save(filename);
    } catch (error) {
        console.error('PDF Error:', error);
        alert('Failed to generate PDF. Please check the console for details.');
    } finally {
        if (workspace && workspace.parentNode) {
            workspace.parentNode.removeChild(workspace);
        }
        if (styleEl && styleEl.parentNode) {
            styleEl.parentNode.removeChild(styleEl);
        }
        if (loadingMsg.parentNode) {
            loadingMsg.parentNode.removeChild(loadingMsg);
        }
    }
}

function buildPageSegments(formElement, bodyAvailablePx, workspace) {
    const children = [...formElement.children];
    const pages = [];
    let currentPageNodes = [];
    let currentHeight = 0;

    const measureHost = document.createElement('div');
    measureHost.className = 'pdf-render-body';
    workspace.appendChild(measureHost);

    const measureNodeHeight = (node) => {
        measureHost.innerHTML = '';
        measureHost.appendChild(node.cloneNode(true));
        return Math.ceil(measureHost.offsetHeight);
    };

    const pushCurrentPage = () => {
        if (currentPageNodes.length) {
            pages.push(currentPageNodes);
            currentPageNodes = [];
            currentHeight = 0;
        }
    };

    const addNode = (node, nodeHeight) => {
        currentPageNodes.push(node.cloneNode(true));
        currentHeight += nodeHeight;
    };

    for (const child of children) {
        const isEvaluationTable = child.matches('table.evaluation-table');

        if (isEvaluationTable) {
            const tableChunks = splitEvaluationTable(child, bodyAvailablePx, workspace);

            for (const chunk of tableChunks) {
                const chunkHeight = measureNodeHeight(chunk);

                if (currentHeight > 0 && currentHeight + chunkHeight > bodyAvailablePx) {
                    pushCurrentPage();
                }

                addNode(chunk, chunkHeight);
            }

            continue;
        }

        const nodeHeight = measureNodeHeight(child);

        if (currentHeight > 0 && currentHeight + nodeHeight > bodyAvailablePx) {
            pushCurrentPage();
        }

        addNode(child, nodeHeight);
    }

    if (currentPageNodes.length) {
        pages.push(currentPageNodes);
    }

    if (!pages.length) {
        pages.push([]);
    }

    if (measureHost.parentNode) {
        measureHost.parentNode.removeChild(measureHost);
    }

    return pages;
}

function splitEvaluationTable(table, bodyAvailablePx, workspace) {
    const chunks = [];
    const allRows = [...table.querySelectorAll('tbody > tr')];
    const thead = table.querySelector('thead');
    const tableClass = table.className;
    const tableId = table.id || '';

    const measureHost = document.createElement('div');
    measureHost.className = 'pdf-render-body';
    workspace.appendChild(measureHost);

    const createTableSkeleton = () => {
        const t = document.createElement('table');
        t.className = tableClass;
        t.id = tableId;

        if (thead) {
            t.appendChild(thead.cloneNode(true));
        }

        t.appendChild(document.createElement('tbody'));
        return t;
    };

    const measureTable = (tableNode) => {
        measureHost.innerHTML = '';
        measureHost.appendChild(tableNode.cloneNode(true));
        return Math.ceil(measureHost.offsetHeight);
    };

    let currentTable = createTableSkeleton();
    let currentTbody = currentTable.querySelector('tbody');
    let lastCategoryRow = null;

    const finalizeCurrentTable = () => {
        if (currentTbody.children.length > 0) {
            chunks.push(currentTable.cloneNode(true));
        }
        currentTable = createTableSkeleton();
        currentTbody = currentTable.querySelector('tbody');
    };

    for (const row of allRows) {
        const rowClone = row.cloneNode(true);
        const isCategoryRow = rowClone.classList.contains('category-row');

        if (isCategoryRow) {
            lastCategoryRow = rowClone.cloneNode(true);
        }

        if (!isCategoryRow && lastCategoryRow && currentTbody.children.length === 0) {
            currentTbody.appendChild(lastCategoryRow.cloneNode(true));
        }

        currentTbody.appendChild(rowClone);

        let height = measureTable(currentTable);

        if (height <= bodyAvailablePx) {
            continue;
        }

        currentTbody.removeChild(rowClone);

        const onlyCategoryLeft =
            currentTbody.children.length === 1 &&
            currentTbody.children[0].classList.contains('category-row');

        if (onlyCategoryLeft) {
            currentTbody.innerHTML = '';
        }

        if (currentTbody.children.length > 0) {
            finalizeCurrentTable();
        }

        if (!isCategoryRow && lastCategoryRow) {
            currentTbody.appendChild(lastCategoryRow.cloneNode(true));
        }

        currentTbody.appendChild(rowClone);
        height = measureTable(currentTable);

        if (height > bodyAvailablePx) {
            finalizeCurrentTable();
        }
    }

    if (currentTbody.children.length > 0) {
        chunks.push(currentTable.cloneNode(true));
    }

    if (!chunks.length) {
        chunks.push(table.cloneNode(true));
    }

    if (measureHost.parentNode) {
        measureHost.parentNode.removeChild(measureHost);
    }

    return chunks;
}

function fixFormStatesForPDF(cloneElement) {
    const radios = cloneElement.querySelectorAll('input[type="radio"]');
    radios.forEach((radio) => {
        if (radio.checked) {
            radio.setAttribute('checked', 'checked');
        } else {
            radio.removeAttribute('checked');
        }

        if (radio.name) {
            radio.setAttribute('name', radio.name);
        }

        radio.style.accentColor = '#dc2626';
        radio.style.color = '#dc2626';
    });

    const checkboxes = cloneElement.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
            checkbox.setAttribute('checked', 'checked');
        } else {
            checkbox.removeAttribute('checked');
        }

        checkbox.style.accentColor = '#dc2626';
        checkbox.style.color = '#dc2626';
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

async function loadPdfDependencies() {
    if (window.html2canvas && window.jspdf?.jsPDF) {
        return;
    }

    if (!window.html2canvas) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    }

    if (!window.jspdf?.jsPDF) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    }

    if (!window.html2canvas || !window.jspdf?.jsPDF) {
        throw new Error('Failed to load PDF dependencies.');
    }
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);

        if (existing) {
            if (existing.dataset.loaded === 'true') {
                resolve();
                return;
            }

            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error(`Failed to load: ${src}`)), { once: true });
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.crossOrigin = 'anonymous';

        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve();
        };

        script.onerror = () => {
            reject(new Error(`Failed to load: ${src}`));
        };

        document.head.appendChild(script);
    });
}

function createLoadingMessage() {
    const loadingMsg = document.createElement('div');
    loadingMsg.innerHTML = '<b>Generating PDF...</b>';
    loadingMsg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 20px;
        border-radius: 8px;
        z-index: 10000;
        text-align: center;
        font-family: Arial, sans-serif;
    `;
    return loadingMsg;
}

window.downloadAsPDF = downloadAsPDF;