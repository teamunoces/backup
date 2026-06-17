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

        const renderWidthPx = 1000;
        const scale = 2;

        const pxPerMm = renderWidthPx / contentWidthMm;
        const pageInnerHeightPx = Math.floor(contentHeightMm * pxPerMm);

        const sourceClone = certificateContainer.cloneNode(true);
        syncCertificateValues(certificateContainer, sourceClone);

        workspace = document.createElement('div');
        workspace.id = 'pdf-workspace';
        workspace.style.cssText = `
            position: fixed;
            left: -20000px;
            top: 0;
            width: ${renderWidthPx}px;
            background: #ffffff;
            z-index: -1;
            opacity: 0;
            pointer-events: none;
        `;
        document.body.appendChild(workspace);

        runtimeStyle = document.createElement('style');
        runtimeStyle.setAttribute('data-pdf-runtime', 'true');
        runtimeStyle.textContent = `
            #pdf-workspace,
            #pdf-workspace * {
                box-sizing: border-box !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            #pdf-workspace {
                width: ${renderWidthPx}px !important;
                font-family: Arial, sans-serif !important;
                color: #000 !important;
                background: #fff !important;
            }

            #pdf-workspace .pdf-header,
            #pdf-workspace .pdf-footer,
            #pdf-workspace .pdf-body-full {
                width: ${renderWidthPx}px !important;
                max-width: ${renderWidthPx}px !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                overflow: visible !important;
            }

            #pdf-workspace .certificate-container {
                width: ${renderWidthPx}px !important;
                max-width: ${renderWidthPx}px !important;
                min-height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                overflow: visible !important;
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
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                margin-bottom: 12px !important;
                width: 100% !important;
                gap: 12px !important;
                flex-wrap: nowrap !important;
            }

            #pdf-workspace .logo-left {
                height: 90px !important;
                width: auto !important;
                flex: 0 0 auto !important;
            }
            #pdf-workspace .logo-left2 {
                height: 80px !important;
                width: auto !important;
                flex: 0 0 auto !important;
            }

            #pdf-workspace .logos-right {
                display: flex !important;
                gap: 20px !important;
                align-items: center !important;
                flex: 0 0 auto !important;
            }

            #pdf-workspace .logos-right img {
                height: 80px !important;
                width: auto !important;
                max-width: 100% !important;
            }

            #pdf-workspace .college-info {
                text-align: center !important;
                flex: 1 1 auto !important;
                padding: 0 10px !important;
                min-width: 0 !important;
            }

            #pdf-workspace .college-info h1 {
                font-family: "Times New Roman", Times, serif !important;
                color: #4f81bd !important;
                font-size: 26px !important;
                margin: 0 !important;
                font-weight: normal !important;
                line-height: 1.2 !important;
            }

            #pdf-workspace .college-info p {
                font-size: 11px !important;
                margin: 2px 0 !important;
                color: #333 !important;
                line-height: 1.3 !important;
            }

            #pdf-workspace .college-info a {
                font-size: 13px !important;
                color: #0000EE !important;
                text-decoration: underline !important;
                word-break: break-all !important;
            }

            #pdf-workspace .office-title {
                text-align: center !important;
                font-size: 18px !important;
                color: #595959 !important;
                font-weight: bold !important;
                margin: 8px 0 4px 0 !important;
                letter-spacing: 0.5px !important;
                text-transform: uppercase !important;
            }

            #pdf-workspace .double-line {
                border-top: 4px double #4f81bd !important;
                margin-bottom: 18px !important;
            }

            #pdf-workspace h1 {
                font-family: "Century Gothic", Arial, sans-serif !important;
                font-size: 25px !important;
                font-weight: bold !important;
                text-align: center !important;
                letter-spacing: 4px !important;
                margin: 15px 30px !important;
            }

            #pdf-workspace img {
                max-width: 100% !important;
                height: auto !important;
            }

            #pdf-workspace table {
                max-width: 100% !important;
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

            /* ===== DOCUMENT INFO TABLE FIX ===== */
            #pdf-workspace .document-info {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                width: 305px !important;
                max-width: 305px !important;
                margin-top: 50px !important;
                margin-left: 0 !important;
                margin-right: auto !important;
                clear: both !important;
                background: #fff !important;
                break-inside: avoid !important;
                page-break-inside: avoid !important;
            }

            #pdf-workspace .doc-header {
                display: table !important;
                visibility: visible !important;
                opacity: 1 !important;
                width: 305px !important;
                max-width: 305px !important;
                border-collapse: collapse !important;
                font-family: Arial, sans-serif !important;
                font-size: 11px !important;
                color: #000 !important;
                background: #fff !important;
                border: 1px solid #d1d1d1 !important;
                margin-left: 0 !important;
                margin-right: auto !important;
            }

            #pdf-workspace .doc-header tbody {
                display: table-row-group !important;
            }

            #pdf-workspace .doc-header tr {
                display: table-row !important;
            }

            #pdf-workspace .doc-header td {
                display: table-cell !important;
                border: 1px solid #d1d1d1 !important;
                padding: 4px 8px !important;
                vertical-align: middle !important;
                font-size: 11px !important;
                line-height: 1.2 !important;
            }

            #pdf-workspace .doc-header td.label {
                width: 100px !important;
                background-color: #002060 !important;
                color: #ffffff !important;
                font-weight: bold !important;
                text-align: left !important;
                white-space: nowrap !important;
            }

            #pdf-workspace .doc-header td:nth-child(2) {
                width: 10px !important;
                padding: 0 2px !important;
                text-align: center !important;
                font-weight: bold !important;
                color: #000 !important;
                background: #fff !important;
            }

            #pdf-workspace .doc-header td.value {
                width: 170px !important;
                min-width: 170px !important;
                text-align: left !important;
                color: #333 !important;
                background: #fff !important;
            }

            #pdf-workspace .doc-header td.value input,
            #pdf-workspace .doc-header td.value p {
                display: block !important;
                width: 100% !important;
                min-height: 12px !important;
                margin: 0 !important;
                padding: 0 !important;
                border: none !important;
                outline: none !important;
                background: transparent !important;
                box-shadow: none !important;
                font-family: Arial, sans-serif !important;
                font-size: 11px !important;
                color: #333 !important;
                line-height: 1.2 !important;
                appearance: none !important;
                -webkit-appearance: none !important;
            }
        `;
        document.head.appendChild(runtimeStyle);

        await waitForImages(sourceClone);

        const headers = [...sourceClone.querySelectorAll('header')];
        const footer = sourceClone.querySelector('footer');

        const headerHTML = headers.map(header => header.outerHTML).join('');
        const footerHTML = footer ? footer.outerHTML : '';

        headers.forEach(header => header.remove());
        if (footer) footer.remove();

        const pdfHeader = document.createElement('div');
        pdfHeader.className = 'pdf-header';
        pdfHeader.innerHTML = headerHTML;

        const pdfFooter = document.createElement('div');
        pdfFooter.className = 'pdf-footer';
        pdfFooter.innerHTML = footerHTML;

        const pdfBodyFull = document.createElement('div');
        pdfBodyFull.className = 'pdf-body-full';
        pdfBodyFull.appendChild(sourceClone);

        workspace.appendChild(pdfHeader);
        workspace.appendChild(pdfFooter);
        workspace.appendChild(pdfBodyFull);

        await waitForImages(workspace);
        await delay(300);

        const headerHeightPx = Math.ceil(pdfHeader.offsetHeight);
        const footerHeightPx = Math.ceil(pdfFooter.offsetHeight);
        const bodyAvailablePx = pageInnerHeightPx - headerHeightPx - footerHeightPx;

        if (bodyAvailablePx <= 120) {
            throw new Error('Header/footer are too large for the page.');
        }

        const headerCanvas = await html2canvas(pdfHeader, {
            scale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: renderWidthPx,
            height: pdfHeader.scrollHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: renderWidthPx
        });

        const footerCanvas = await html2canvas(pdfFooter, {
            scale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: renderWidthPx,
            height: pdfFooter.scrollHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: renderWidthPx
        });

        const bodyCanvas = await html2canvas(pdfBodyFull, {
            scale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: renderWidthPx,
            height: pdfBodyFull.scrollHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: renderWidthPx,
            windowHeight: pdfBodyFull.scrollHeight
        });

        const headerImg = headerCanvas.toDataURL('image/jpeg', 1.0);
        const footerImg = footerCanvas.toDataURL('image/jpeg', 1.0);

        const headerHeightMm = headerHeightPx / pxPerMm;
        const footerHeightMm = footerHeightPx / pxPerMm;

        const scaledBodyAvailablePx = Math.floor(bodyAvailablePx * scale);
        const totalBodyHeightPx = bodyCanvas.height;

        let sourceY = 0;
        let pageIndex = 0;

        while (sourceY < totalBodyHeightPx) {
            const sliceHeight = Math.min(
                scaledBodyAvailablePx,
                totalBodyHeightPx - sourceY
            );

            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = bodyCanvas.width;
            sliceCanvas.height = sliceHeight;

            const ctx = sliceCanvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

            ctx.drawImage(
                bodyCanvas,
                0,
                sourceY,
                bodyCanvas.width,
                sliceHeight,
                0,
                0,
                bodyCanvas.width,
                sliceHeight
            );

            const sliceImg = sliceCanvas.toDataURL('image/jpeg', 1.0);

            const actualSliceHeightPx = sliceHeight / scale;
            const actualSliceHeightMm = actualSliceHeightPx / pxPerMm;

            if (pageIndex > 0) {
                pdf.addPage();
            }

            pdf.addImage(
                headerImg,
                'JPEG',
                marginLeftMm,
                marginTopMm,
                contentWidthMm,
                headerHeightMm
            );

            pdf.addImage(
                sliceImg,
                'JPEG',
                marginLeftMm,
                marginTopMm + headerHeightMm,
                contentWidthMm,
                actualSliceHeightMm
            );

            pdf.addImage(
                footerImg,
                'JPEG',
                marginLeftMm,
                pageHeightMm - marginBottomMm - footerHeightMm,
                contentWidthMm,
                footerHeightMm
            );

            sourceY += scaledBodyAvailablePx;
            pageIndex++;
        }

        const filename = `Certificate_of_Appearance_${new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/:/g, '-')}.pdf`;

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

function syncCertificateValues(source, clone) {
    const originalFields = source.querySelectorAll('input, textarea, select');
    const clonedFields = clone.querySelectorAll('input, textarea, select');

    originalFields.forEach((original, index) => {
        const target = clonedFields[index];

        if (!target) return;

        const tag = target.tagName.toLowerCase();

        if (tag === 'textarea') {
            target.value = original.value || '';
            target.textContent = original.value || '';
        } else if (tag === 'select') {
            target.value = original.value || '';

            [...target.options].forEach(option => {
                option.selected = option.value === original.value;
            });
        } else if (target.type === 'checkbox' || target.type === 'radio') {
            target.checked = original.checked;

            if (original.checked) {
                target.setAttribute('checked', 'checked');
            } else {
                target.removeAttribute('checked');
            }
        } else {
            target.value = original.value || '';
            target.setAttribute('value', original.value || '');
        }
    });

    const textSelectors = [
        '#created_by_name',
        '#dean',
        '#ces_head',
        '#vp_acad',
        '#vp_admin',
        '#school_president',
        '.document_type'
    ];

    textSelectors.forEach(selector => {
        const originals = source.querySelectorAll(selector);
        const targets = clone.querySelectorAll(selector);

        originals.forEach((original, index) => {
            const target = targets[index];

            if (target) {
                target.textContent = original.textContent || '';
            }
        });
    });
}

function waitForImages(root) {
    const images = [...root.querySelectorAll('img')];

    if (!images.length) {
        return Promise.resolve();
    }

    return Promise.all(
        images.map(img => {
            if (img.complete && img.naturalWidth !== 0) {
                return Promise.resolve();
            }

            return new Promise(resolve => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
            });
        })
    );
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
            existing.addEventListener(
                'error',
                () => reject(new Error(`Failed to load: ${src}`)),
                { once: true }
            );
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