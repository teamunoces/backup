// download.js
document.addEventListener('DOMContentLoaded', function () {
    const downloadBtn = document.getElementById('downloadPDF');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadPDF);
    }
});

async function downloadPDF() {
    const downloadBtn = document.getElementById('downloadPDF');
    if (!downloadBtn) return;

    const originalText = downloadBtn.textContent;
    downloadBtn.textContent = 'Generating PDF...';
    downloadBtn.disabled = true;

    let workspace = null;
    let runtimeStyle = null;

    try {
        await loadPdfDependencies();

        const sourceElement =
            document.querySelector('.report-container') ||
            document.querySelector('.certificate-container') ||
            document.getElementById('need_assessment_form')?.closest('.report-container') ||
            document.getElementById('need_assessment_form') ||
            document.body;

        if (!sourceElement) {
            throw new Error('Report container not found');
        }

        const titleInput =
            document.querySelector('textarea[name="title_of_program"]') ||
            document.querySelector('input[name="title_of_program"]');

        const reportId = document.getElementById('currentReportId')?.value || '';
        const fileName = titleInput && titleInput.value
            ? sanitizeFileName(`Community_Needs_Assessment_${titleInput.value}`)
            : sanitizeFileName(`Community_Needs_Assessment_${reportId || 'form'}`);

        const sourceClone = sourceElement.cloneNode(true);
        syncFormValues(sourceElement, sourceClone);

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'letter',
            compress: true
        });

        const pageWidthMm = 215.9;
        const pageHeightMm = 279.4;

        const marginTopMm = 12.7;
        const marginBottomMm = 12.7;
        const marginLeftMm = 12.7;
        const marginRightMm = 12.7;

        const contentWidthMm = pageWidthMm - marginLeftMm - marginRightMm;
        const contentHeightMm = pageHeightMm - marginTopMm - marginBottomMm;

        const renderWidthPx = 1000;
        const pxPerMm = renderWidthPx / contentWidthMm;
        const pageInnerHeightPx = Math.floor(contentHeightMm * pxPerMm);

        workspace = document.createElement('div');
        workspace.id = 'pdf-workspace';
        workspace.style.cssText = `
            position: fixed;
            left: -20000px;
            top: 0;
            width: ${renderWidthPx}px;
            min-width: ${renderWidthPx}px;
            max-width: ${renderWidthPx}px;
            background: #ffffff;
            z-index: -1;
            opacity: 0;
            pointer-events: none;
            overflow: hidden;
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
                font-family: Arial, sans-serif !important;
                color: #000 !important;
                background: #fff !important;
            }

            #pdf-workspace .pdf-measure-page,
            #pdf-workspace .pdf-body-render-root {
                width: ${renderWidthPx}px !important;
                min-width: ${renderWidthPx}px !important;
                max-width: ${renderWidthPx}px !important;
                background: #fff !important;
                overflow: visible !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            #pdf-workspace .pdf-header,
            #pdf-workspace .pdf-footer,
            #pdf-workspace .pdf-body-content {
                width: 100% !important;
                min-width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #fff !important;
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                overflow-x: hidden !important;
            }

            #pdf-workspace .pdf-footer {
                padding-top: 6px !important;
            }

            #pdf-workspace .report-container,
            #pdf-workspace .certificate-container,
            #pdf-workspace form,
            #pdf-workspace #need_assessment_form {
                display: block !important;
                width: 100% !important;
                min-width: 0 !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border: none !important;
                outline: none !important;
                border-radius: 0 !important;
                background: #fff !important;
                overflow-x: hidden !important;
            }

            #pdf-workspace .report-container > *,
            #pdf-workspace .certificate-container > *,
            #pdf-workspace form > *,
            #pdf-workspace #need_assessment_form > * {
                max-width: 100% !important;
            }

            #pdf-workspace header,
            #pdf-workspace footer,
            #pdf-workspace .header-content,
            #pdf-workspace .footer-bottom,
            #pdf-workspace .footer-logos {
                border: none !important;
                outline: none !important;
                box-shadow: none !important;
                max-width: 100% !important;
            }

            #pdf-workspace img {
                max-width: 100% !important;
                height: auto !important;
            }

            #pdf-workspace table {
                width: 100% !important;
                max-width: 100% !important;
                table-layout: fixed !important;
                border-collapse: collapse !important;
            }

            #pdf-workspace tr,
            #pdf-workspace td,
            #pdf-workspace th {
                word-break: break-word !important;
                overflow-wrap: anywhere !important;
            }

            #pdf-workspace input,
            #pdf-workspace textarea,
            #pdf-workspace select {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                color: #000 !important;
                opacity: 1 !important;
            }

            #pdf-workspace textarea {
                white-space: pre-wrap !important;
                word-break: break-word !important;
                overflow-wrap: anywhere !important;
            }

            #pdf-workspace .paper-lines {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                border: none !important;
                outline: none !important;
                resize: none !important;
                font-size: 16px !important;
                line-height: 30px !important;
                padding: 0 !important;
                background-attachment: local !important;
                background-image: linear-gradient(to bottom, transparent 29px, #000 29px) !important;
                background-size: 100% 30px !important;
                background-color: transparent !important;
                font-family: Arial, sans-serif !important;
                overflow: hidden !important;
                white-space: pre-wrap !important;
                word-break: break-word !important;
                overflow-wrap: anywhere !important;
            }

            .header-content {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                gap: 18px !important;
                flex-wrap: nowrap !important;
                width: 100% !important;
                margin-bottom: 10px !important;
            }

            .logo-left {
                width: 110px !important;
                height: auto !important;
                object-fit: contain !important;
                flex: 0 0 110px !important;
                display: block !important;
            }

            .logos-right {
                display: flex !important;
                align-items: center !important;
                justify-content: flex-end !important;
                flex: 0 0 120px !important;
                width: 120px !important;
            }

            .logos-right img {
                width: 110px !important;
                height: auto !important;
                object-fit: contain !important;
                display: block !important;
                max-width: none !important;
            }

            .college-info {
                flex: 1 1 auto !important;
                min-width: 0 !important;
                text-align: center !important;
                padding: 0 10px !important;
            }

            .college-info h1 {
                color: #4f81bd !important;
                font-size: 24px !important;
                font-family: "Times New Roman", Times, serif !important;
                margin: 0 !important;
            }

            .college-info p {
                font-size: 11px !important;
                margin: 2px 0 !important;
            }

            .office-title {
                text-align: center !important;
                font-size: 18px !important;
                color: #595959 !important;
                font-weight: bold !important;
                margin: 20px 0 5px 0 !important;
            }

            .double-line {
                border-top: 4px double #4f81bd !important;
                margin-bottom: 25px !important;
            }

            .header-grid {
                display: grid !important;
                grid-template-columns: 145px minmax(0, 1fr) 150px minmax(0, 1fr) !important;
                width: 100% !important;
                max-width: 100% !important;
                border: 1px solid #000 !important;
                margin-bottom: 30px !important;
            }

            .label-box {
                padding: 8px !important;
                font-weight: bold !important;
                font-size: 14px !important;
                border-right: 1px solid #000 !important;
                min-width: 0 !important;
                overflow-wrap: anywhere !important;
                word-break: break-word !important;
            }

            .bg-gray,
            .section-header {
                background-color: #b3b3b3 !important;
            }

            .section-header {
                border: 1px solid #000 !important;
                padding: 8px 15px !important;
                font-weight: bold !important;
                font-size: 14px !important;
                margin-top: 20px !important;
                display: flex !important;
                width: 100% !important;
                max-width: 100% !important;
            }

            .approvals-container {
                font-family: Arial, sans-serif !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 40px auto 0 auto !important;
                color: #000 !important;
            }

            .approval-row {
                display: flex !important;
                justify-content: space-between !important;
                flex-direction: row !important;
                gap: 24px !important;
                margin-bottom: 20px !important;
            }

            .signature-group {
                width: 35% !important;
                min-width: 0 !important;
            }

            .label {
                font-weight: bold !important;
                margin-bottom: 35px !important;
            }

            .signature-line {
                border-bottom: 1.5px solid black !important;
                margin-bottom: 5px !important;
                min-height: 25px !important;
                text-align: center !important;
                font-weight: bold !important;
                text-transform: uppercase !important;
            }

            .title {
                font-size: 14px !important;
            }

            .bold {
                font-weight: bold !important;
            }

            .left-align {
                text-align: left !important;
                width: 100% !important;
            }

            .approval-centered {
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
            }

            .admin-block {
                text-align: center !important;
                margin-top: 30px !important;
                margin-bottom: 10px !important;
            }

            .name-underlined {
                font-weight: bold !important;
                text-decoration: underline !important;
                text-transform: uppercase !important;
                font-size: 16px !important;
                display: inline-block !important;
                margin-bottom: 2px !important;
                min-width: 250px !important;
                max-width: 100% !important;
            }

            .document-info {
                margin-top: 50px !important;
                width: 30% !important;
                max-width: 100% !important;
            }

            .doc-header {
                border-collapse: collapse !important;
                font-family: Arial, sans-serif !important;
                font-size: 11px !important;
                border: 1px solid #d1d1d1 !important;
                width: auto !important;
                max-width: 100% !important;
                margin-right: auto !important;
            }

            .doc-header td.label {
                background-color: #002060 !important;
                color: white !important;
                font-weight: bold !important;
                padding: 4px 8px !important;
                border: 1px solid #d1d1d1 !important;
                white-space: nowrap !important;
                width: 100px !important;
            }

            .doc-header td.value {
                padding: 4px 10px !important;
                border: 1px solid #d1d1d1 !important;
            }

            footer {
                margin: 0 !important;
                width: 100% !important;
            }

            .footer-bottom {
                display: flex !important;
                align-items: flex-end !important;
                justify-content: flex-end !important;
                padding-bottom: 0 !important;
                width: 100% !important;
                margin: 0 !important;
            }

            .footer-logos {
                width: 100% !important;
                display: flex !important;
                justify-content: flex-end !important;
                align-items: flex-end !important;
            }

            .footer-logos img {
                width: 430px !important;
                max-width: 430px !important;
                height: auto !important;
                object-fit: contain !important;
                display: block !important;
            }

            #pdf-workspace header,
            #pdf-workspace footer,
            #pdf-workspace .section-header,
            #pdf-workspace .approval-row,
            #pdf-workspace .signature-group,
            #pdf-workspace .approval-centered,
            #pdf-workspace .approvals-container,
            #pdf-workspace .document-info,
            #pdf-workspace table,
            #pdf-workspace tr,
            #pdf-workspace td,
            #pdf-workspace th,
            #pdf-workspace img {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }

            thead {
                display: table-header-group !important;
            }
        `;
        document.head.appendChild(runtimeStyle);

        await waitForRenderReady(sourceClone);

        const headerElements = [...sourceClone.querySelectorAll('header')];
        const footerElement = sourceClone.querySelector('footer');

        const headerHTML = headerElements.map(el => el.outerHTML).join('');
        const footerHTML = footerElement ? footerElement.outerHTML : '';

        headerElements.forEach(el => el.remove());
        if (footerElement) footerElement.remove();

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

        await waitForRenderReady(measurePage);

        const headerHeightPx = headerHTML ? Math.ceil(measureHeader.getBoundingClientRect().height) : 0;
        const footerHeightPx = footerHTML ? Math.ceil(measureFooter.getBoundingClientRect().height) : 0;
        const bodyAvailablePx = pageInnerHeightPx - headerHeightPx - footerHeightPx;

        if (bodyAvailablePx <= 120) {
            throw new Error('Header/footer are too large for the page.');
        }

        let headerCanvas = null;
        let footerCanvas = null;

        if (headerHTML) {
            headerCanvas = await html2canvas(measureHeader, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                scrollX: 0,
                scrollY: 0,
                width: Math.ceil(measureHeader.scrollWidth || renderWidthPx),
                height: Math.ceil(measureHeader.scrollHeight || headerHeightPx || 1),
                windowWidth: renderWidthPx
            });
        }

        if (footerHTML) {
            footerCanvas = await html2canvas(measureFooter, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                scrollX: 0,
                scrollY: 0,
                width: Math.ceil(measureFooter.scrollWidth || renderWidthPx),
                height: Math.ceil(measureFooter.scrollHeight || footerHeightPx || 1),
                windowWidth: renderWidthPx
            });
        }

        const headerImg = headerCanvas ? headerCanvas.toDataURL('image/jpeg', 1.0) : null;
        const footerImg = footerCanvas ? footerCanvas.toDataURL('image/jpeg', 1.0) : null;

        const headerHeightMm = headerHeightPx / pxPerMm;
        const footerHeightMm = footerHeightPx / pxPerMm;

        const bodyRenderRoot = document.createElement('div');
        bodyRenderRoot.className = 'pdf-body-render-root';

        const bodyContent = document.createElement('div');
        bodyContent.className = 'pdf-body-content';
        bodyContent.style.paddingTop = '4px';
        bodyContent.style.paddingBottom = '4px';
        bodyContent.appendChild(sourceClone);

        bodyRenderRoot.appendChild(bodyContent);
        workspace.appendChild(bodyRenderRoot);

        await waitForRenderReady(bodyRenderRoot);

        const fullBodyCanvas = await html2canvas(bodyRenderRoot, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: 0,
            windowWidth: renderWidthPx,
            width: Math.ceil(bodyRenderRoot.scrollWidth || renderWidthPx),
            height: Math.ceil(bodyRenderRoot.scrollHeight)
        });

        const totalCanvasHeight = fullBodyCanvas.height;
        const totalCanvasWidth = fullBodyCanvas.width;
        const bodyScale = totalCanvasWidth / renderWidthPx;
        const pageSliceHeightCanvasPx = Math.max(1, Math.floor(bodyAvailablePx * bodyScale));

        let pageIndex = 0;
        for (let sy = 0; sy < totalCanvasHeight; sy += pageSliceHeightCanvasPx) {
            const sliceHeight = Math.min(pageSliceHeightCanvasPx, totalCanvasHeight - sy);

            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = totalCanvasWidth;
            pageCanvas.height = sliceHeight;

            const pageCtx = pageCanvas.getContext('2d');
            pageCtx.fillStyle = '#ffffff';
            pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            pageCtx.drawImage(
                fullBodyCanvas,
                0, sy, totalCanvasWidth, sliceHeight,
                0, 0, totalCanvasWidth, sliceHeight
            );

            const bodyImg = pageCanvas.toDataURL('image/jpeg', 1.0);
            const renderedSliceHeightMm = sliceHeight / bodyScale / pxPerMm;

            if (pageIndex > 0) {
                pdf.addPage();
            }

            if (headerImg && headerHeightMm > 0) {
                pdf.addImage(
                    headerImg,
                    'JPEG',
                    marginLeftMm,
                    marginTopMm,
                    contentWidthMm,
                    headerHeightMm
                );
            }

            pdf.addImage(
                bodyImg,
                'JPEG',
                marginLeftMm,
                marginTopMm + headerHeightMm,
                contentWidthMm,
                renderedSliceHeightMm
            );

            if (footerImg && footerHeightMm > 0) {
                pdf.addImage(
                    footerImg,
                    'JPEG',
                    marginLeftMm,
                    pageHeightMm - marginBottomMm - footerHeightMm,
                    contentWidthMm,
                    footerHeightMm
                );
            }

            pageIndex++;
        }

        pdf.save(`${fileName}.pdf`);
    } catch (error) {
        console.error('PDF generation failed:', error);
        alert(error?.message || 'Failed to generate PDF. Please try again.');
    } finally {
        if (runtimeStyle && runtimeStyle.parentNode) {
            runtimeStyle.remove();
        }
        if (workspace && workspace.parentNode) {
            workspace.parentNode.removeChild(workspace);
        }
        downloadBtn.textContent = originalText;
        downloadBtn.disabled = false;
    }
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
            target.checked = original.checked;
            if (original.checked) {
                target.setAttribute('checked', 'checked');
            } else {
                target.removeAttribute('checked');
            }
            return;
        }

        if (tag === 'textarea') {
            target.value = original.value;
            target.textContent = original.value;
            target.innerHTML = escapeHtml(original.value).replace(/\n/g, '&#10;');
            return;
        }

        if (tag === 'select') {
            [...target.options].forEach((opt, i) => {
                const selected = !!original.options[i]?.selected;
                opt.selected = selected;
                if (selected) {
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

async function waitForRenderReady(root) {
    await waitForImages(root);
    await waitForFonts();
    await nextFrame();
    await nextFrame();
}

function waitForFonts() {
    if (document.fonts && typeof document.fonts.ready?.then === 'function') {
        return document.fonts.ready.catch(() => undefined);
    }
    return Promise.resolve();
}

function nextFrame() {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
}

function waitForImages(root) {
    const images = [...root.querySelectorAll('img')];

    if (!images.length) return Promise.resolve();

    return Promise.all(images.map(img => {
        if (img.complete && img.naturalWidth !== 0) {
            if (typeof img.decode === 'function') {
                return img.decode().catch(() => undefined);
            }
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const done = () => resolve();
            img.addEventListener('load', done, { once: true });
            img.addEventListener('error', done, { once: true });
        });
    }));
}

function sanitizeFileName(name) {
    return String(name || 'document')
        .replace(/[<>:"/\\\\|?*]+/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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

        script.onerror = () => reject(new Error(`Failed to load: ${src}`));

        document.head.appendChild(script);
    });
}