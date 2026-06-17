// download.js
document.getElementById('downloadPDF')?.addEventListener('click', function () {
    downloadCertificatePDF();
});

async function downloadCertificatePDF() {
    const downloadBtn = document.getElementById('downloadPDF');
    const originalText = downloadBtn ? downloadBtn.textContent : 'Download PDF';

    if (downloadBtn) {
        downloadBtn.textContent = 'Generating PDF...';
        downloadBtn.disabled = true;
    }

    let workspace = null;
    let runtimeStyle = null;

    try {
        await loadPdfDependencies();

        const certificateContainer = document.querySelector('.certificate-container');
        if (!certificateContainer) {
            throw new Error('Certificate container not found');
        }

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidthMm = 210;
        const pageHeightMm = 297;

        const marginTopMm = 10;
        const marginBottomMm = 10;
        const marginLeftMm = 10;
        const marginRightMm = 10;

        const contentWidthMm = pageWidthMm - marginLeftMm - marginRightMm;
        const contentHeightMm = pageHeightMm - marginTopMm - marginBottomMm;

        // Fixed render width prevents right-side overflow
        const renderWidthPx = 1000;
        const pxPerMm = renderWidthPx / contentWidthMm;
        const pageInnerHeightPx = Math.floor(contentHeightMm * pxPerMm);

        // Clone and sync values
        const sourceClone = certificateContainer.cloneNode(true);
        syncCertificateValues(certificateContainer, sourceClone);

        // Hidden workspace
        workspace = document.createElement('div');
        workspace.id = 'pdf-workspace';
        workspace.style.cssText = `
            position: fixed;
            left: -20000px;
            top: 0;
            width: ${renderWidthPx}px;
            background: #fff;
            z-index: -1;
            opacity: 0;
            pointer-events: none;
        `;
        document.body.appendChild(workspace);

        runtimeStyle = document.createElement('style');
        runtimeStyle.setAttribute('data-pdf-runtime', 'true');
        runtimeStyle.textContent = `
            #pdf-workspace, #pdf-workspace * {
                box-sizing: border-box;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            #pdf-workspace {
                font-family: Arial, sans-serif;
                color: #000;
                background: #fff;
            }

            #pdf-workspace .pdf-measure-page,
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

            #pdf-workspace .certificate-container {
                width: 100% !important;
                max-width: none !important;
                min-height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
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

            /* Force content to fit A4 width cleanly */
            #pdf-workspace .certificate-container > * {
                max-width: 100% !important;
            }

            #pdf-workspace .header-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
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
                max-width: 100%;
            }

            #pdf-workspace .college-info {
                text-align: center;
                flex: 1 1 auto;
                padding: 0 10px;
                min-width: 0;
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
                margin: 8px 0 4px 0;
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }

            #pdf-workspace .double-line {
                border-top: 4px double #4f81bd !important;
                margin-bottom: 18px;
            }

            #pdf-workspace h1,
            #pdf-workspace h2,
            #pdf-workspace h3,
            #pdf-workspace h4,
            #pdf-workspace h5,
            #pdf-workspace h6,
            #pdf-workspace p,
            #pdf-workspace section,
            #pdf-workspace table,
            #pdf-workspace .signatures,
            #pdf-workspace .signature-block,
            #pdf-workspace .approvals-container,
            #pdf-workspace .admin-block,
            #pdf-workspace .document-info {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
            }

            #pdf-workspace table {
                max-width: 100% !important;
            }

            #pdf-workspace img {
                max-width: 100%;
                height: auto;
            }

            #pdf-workspace .footer-bottom {
                display: flex !important;
                align-items: flex-end !important;
                justify-content: flex-end !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            #pdf-workspace .footer-logos {
                display: flex !important;
                align-items: center !important;
                justify-content: flex-end !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                gap: 0 !important;
            }

            #pdf-workspace .footer-logos img {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                object-fit: contain !important;
            }

            #pdf-workspace .doc-header td.label {
                background-color: #002060 !important;
                color: white !important;
            }
        `;
        document.head.appendChild(runtimeStyle);

        await waitForImages(sourceClone);

        // Extract header/footer/body from the cloned layout
        const headers = [...sourceClone.querySelectorAll('header')];
        const footer = sourceClone.querySelector('footer');

        const headerHTML = headers.map(h => h.outerHTML).join('');
        const footerHTML = footer ? footer.outerHTML : '';

        // Remove header/footer from the body clone so they do not duplicate
        headers.forEach(h => h.remove());
        if (footer) footer.remove();

        // Measure header/footer heights
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

        if (bodyAvailablePx <= 120) {
            throw new Error('Header/footer are too large for the page.');
        }

        // Render header/footer once
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
        const bodyHeightMm = bodyAvailablePx / pxPerMm;

        // Split body into PDF pages
        const pageSegments = buildPageSegments(sourceClone, bodyAvailablePx, workspace);

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

            if (i > 0) {
                pdf.addPage();
            }

            // Header
            pdf.addImage(
                headerImg,
                'JPEG',
                marginLeftMm,
                marginTopMm,
                contentWidthMm,
                headerHeightMm
            );

            // Body
            pdf.addImage(
                bodyImg,
                'JPEG',
                marginLeftMm,
                marginTopMm + headerHeightMm,
                contentWidthMm,
                bodyHeightMm
            );

            // Footer pinned to the bottom on every page
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

        const filename = `Certificate_of_Appearance_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`;
        pdf.save(filename);
    } catch (error) {
        console.error('PDF generation error:', error);
        alert('Error generating PDF. Please try again.');
    } finally {
        if (runtimeStyle && runtimeStyle.parentNode) {
            runtimeStyle.parentNode.removeChild(runtimeStyle);
        }

        if (workspace && workspace.parentNode) {
            workspace.parentNode.removeChild(workspace);
        }

        if (downloadBtn) {
            downloadBtn.textContent = originalText;
            downloadBtn.disabled = false;
        }
    }
}

function buildPageSegments(bodyRoot, bodyAvailablePx, workspace) {
    const children = [...bodyRoot.children];
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

function syncCertificateValues(source, clone) {
    const originalInputs = source.querySelectorAll('input[type="text"], input[type="date"], input:not([type]), textarea');
    const clonedInputs = clone.querySelectorAll('input[type="text"], input[type="date"], input:not([type]), textarea');

    originalInputs.forEach((original, index) => {
        const target = clonedInputs[index];
        if (!target) return;

        if (target.tagName.toLowerCase() === 'textarea') {
            target.value = original.value;
            target.textContent = original.value;
        } else {
            target.value = original.value;
            target.setAttribute('value', original.value || '');
        }
    });

    const contentSelectors = [
        '#created_by_name',
        '#dean',
        '#ces_head',
        '#vp_acad',
        '#vp_admin',
        '#school_president'
    ];

    contentSelectors.forEach((selector) => {
        const original = source.querySelector(selector);
        const target = clone.querySelector(selector);
        if (original && target) {
            target.textContent = original.textContent;
        }
    });
}

function waitForImages(root) {
    const images = [...root.querySelectorAll('img')];

    if (!images.length) {
        return Promise.resolve();
    }

    return Promise.all(
        images.map((img) => {
            if (img.complete) {
                return Promise.resolve();
            }

            return new Promise((resolve) => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
            });
        })
    );
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

window.downloadCertificatePDF = downloadCertificatePDF;