/**
 * print.js - MONTHLY ACCOMPLISHMENT REPORT - REFLECTION PAPER
 * Repeats header/footer on every printed page and prevents overlap.
 * Includes approvals section.
 */

async function printReport() {
    const originalTitle = document.title;
    document.title = 'Monthly_Accomplishment_Report_Reflection_Paper';

    try {
        const iframe = createPrintIframe();
        const doc = iframe.contentDocument || iframe.contentWindow.document;

        const headerHTML = buildPrintHeaderHtml();
        const footerHTML = buildPrintFooterHtml();
        const printableBody = buildPrintableBody();

        doc.open();
        doc.write(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Monthly Accomplishment Report</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
    * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
    }

    @page {
        size: A4 portrait;
        margin: 12mm 10mm 12mm 10mm;
    }

    html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100%;
        background: #fff !important;
        color: #000;
        font-family: Arial, sans-serif;
        font-size: 15px;
        line-height: 1.4;
        overflow: visible !important;
    }

    #print-container {
        width: 100%;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
    }

    .print-shell {
        width: 100%;
        margin: 0 !important;
        padding: 0 !important;
        border-collapse: collapse !important;
        border-spacing: 0 !important;
        table-layout: fixed !important;
        border: none !important;
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

    .print-shell td {
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        vertical-align: top !important;
        background: #fff !important;
    }

    .print-header-shell {
        padding-bottom: 8px !important;
    }

    .print-footer-shell {
        padding-top: 8px !important;
    }

    .print-content {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        overflow: visible !important;
    }

    #sidebarFrame,
    #headerFrame,
    .buttons,
    .admin-comment,
    .no-print,
    .print-hide,
    [data-no-print="true"],
    button,
    script,
    noscript,
    footer,
    .footer-bottom,
    .footer-logos {
        display: none !important;
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
    }
    .main-title {
        text-align: center;
        font-size: 18px;
        text-decoration: underline;
        margin-bottom: 25px;
        text-transform: uppercase;
    }

    .input-group {
        display: flex;
        margin-bottom: 10px;
        align-items: baseline;
    }

    .input-group label {
        white-space: nowrap;
        font-weight: bold;
        width: 180px;
    }

    .print-line {
        flex: 1;
        border-bottom: 1px solid black !important;
        font-size: 14px;
        padding: 5px;
        min-height: 28px;
        white-space: pre-wrap;
        word-break: break-word;
        overflow-wrap: anywhere;
    }

    .instruction {
        margin: 15px 0;
        font-size: 14px;
    }

    .translation {
        text-decoration: underline;
    }

    .checkbox-grid {
        display: flex;
        gap: 40px;
        margin: 20px 0;
    }

    .column {
        flex: 1;
    }

    .check-item {
        margin-bottom: 8px;
    }

    .check-item label {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .printable-box {
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
        flex: 0 0 14px;
    }

    .printable-box.checked {
        background: #e1251b !important;
        border-color: #e1251b !important;
        color: #fff !important;
        font-weight: bold !important;
    }

    .printable-box.checked::before {
        content: "✓";
    }

    .questions-section {
        margin: 30px 0 20px;
    }

    .questions-section h3 {
        text-decoration: underline;
        margin-bottom: 15px;
        font-size: 16px;
    }

    .question {
        margin-bottom: 15px;
        font-size: 14px;
    }

    .italic-trans {
        font-style: italic;
        margin-top: 3px;
    }

    .answer-section {
        margin: 20px 0;
    }

    .answer-block {
        display: flex;
        margin-bottom: 14px;
        align-items: flex-start;
    }

    .answer-number {
        font-weight: bold;
        margin-right: 10px;
        width: 25px;
        font-size: 14px;
        padding-top: 1px;
    }

    .paper-answer {
        flex: 1;
    }

    .paper-line-row {
        min-height: 28px;
        line-height: 28px;
        border-bottom: 1px solid #777;
    }

    .paper-line-text {
        display: inline-block;
        padding: 0 2px;
        white-space: pre-wrap;
        word-break: break-word;
        overflow-wrap: anywhere;
        font-size: 14px;
    }

    .signature-wrapper {
        margin-top: 80px;
        display: flex;
        justify-content: flex-end;
        page-break-inside: avoid;
        break-inside: avoid;
    }

    .signature-block {
        text-align: center;
        width: 300px;
    }

    .signature-line {
        border-bottom: 1px solid black;
        padding: 5px;
        margin-bottom: 5px;
        min-height: 30px;
        white-space: pre-wrap;
        word-break: break-word;
        overflow-wrap: anywhere;
    }

    .signature-label {
        margin-top: 8px;
        font-size: 13px;
    }

/* APPROVAL SECTION */
.approvals-container {
    width: 100%;
    margin-top: 45px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    page-break-inside: avoid;
    break-inside: avoid;
}

.approvals-container .label {
    font-weight: bold;
    text-align: left;
    margin-bottom: 35px;
    font-size: 14px;
}

.approval-row {
    display: flex;
    justify-content: space-between;
    gap: 255px;
    width: 100%;
    margin-bottom: 25px;
}

.signature-group {
    flex: 1;
    text-align: left;
}

.approvals-container .signature-line {
    display: inline-block;      /* IMPORTANT */
    width: 280px;               /* adjust this if needed */
    border-bottom: 1px solid #000;
    padding-bottom: 2px;
    text-align: left;
    font-weight: normal;
    font-size: 14px;
}

.approvals-container .title {
    text-align: left;
    margin-top: 2px;
    font-size: 12px;
    font-weight: bold;
}

.approval-centered {
    width: 100%;
    margin-top: 40px;
    text-align: center;
}

.approval-centered .left-align {
    text-align: left;
    margin-bottom: 65px;
}

.admin-block {
    width: 420px;
    margin: 0 auto 45px auto;
    text-align: center;
}

.approvals-container .name-underlined {
    display: inline-block;
    min-width: 280px;
    border-bottom: 1px solid #000;
    padding-bottom: 1px;
    text-align: center;
    font-weight: bold;
    font-size: 14px;
    line-height: 1.2;
}

.admin-block .title {
    text-align: center;
    margin-top: 3px;
    font-size: 12px;
    font-weight: bold;
}
.document-info {
    margin-top: 50px !important;
    width: 305px !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
}

.doc-header {
    width: 305px !important;
    border-collapse: collapse !important;
    font-family: Arial, sans-serif;
    font-size: 11px;
    margin-left: 0 !important;
    margin-right: auto !important;
}

.doc-header td {
    border: 1px solid #d1d1d1 !important;
    padding: 4px 6px !important;
    height: 24px;
}

.doc-header td.label {
    background-color: #002060 !important;
    color: #ffffff !important;
    font-weight: bold;
    text-align: left;
    white-space: nowrap;
    width: 105px !important;
}

.doc-header td:nth-child(2) {
    width: 8px !important;
    min-width: 8px !important;
    max-width: 8px !important;
    padding: 0 !important;
    text-align: center;
    font-weight: bold;
    color: #000 !important;
    background: #fff !important;
}

.doc-header td.value {
    width: 190px !important;
    color: #000 !important;
    background: #fff !important;
    text-align: left;
    white-space: nowrap;
}

    .print-footer-logo {
        display: block;
        width: 100%;
        max-width: 100%;
        height: auto;
        max-height: 26px;
        object-fit: contain;
    }

    img {
        max-width: 100%;
        height: auto;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    @media print {
        body {
            padding: 0 !important;
            margin: 0 !important;
        }

        .doc-header td.label {
            background-color: #002060 !important;
            color: white !important;
        }
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
</style>
</head>
<body>
<div id="print-container">
    <table class="print-shell" role="presentation">
        <thead>
            <tr>
                <td>
                    <div class="print-header-shell">
                        ${headerHTML}
                    </div>
                </td>
            </tr>
        </thead>

        <tfoot>
            <tr>
                <td>
                    <div class="print-footer-shell">
                        ${footerHTML}
                    </div>
                </td>
            </tr>
        </tfoot>

        <tbody>
            <tr>
                <td>
                    <div class="print-body">
                        <div class="print-content" id="printContent"></div>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>
</body>
</html>
        `);
        doc.close();

        const printContent = doc.getElementById('printContent');
        printContent.appendChild(printableBody);

        await waitForImages(doc);
        await waitForFonts(doc);

        await nextFrame(iframe.contentWindow);
        await nextFrame(iframe.contentWindow);

        await runPrintAndCleanup(iframe);
    } catch (error) {
        console.error('Print failed:', error);
        alert('Printing failed. Please try again.');
    } finally {
        document.title = originalTitle;
    }
}

function buildPrintableBody() {
    const beneficiaryName = document.getElementById('beneficiary_name')?.value || '';
    const implementingDept = document.getElementById('implementing_department')?.value || '';
    const answerOne = document.getElementById('answer_one')?.value || '';
    const answerTwo = document.getElementById('answer_two')?.value || '';
    const answerThree = document.getElementById('answer_three')?.value || '';
    const beneficiarySignature = document.getElementById('beneficiary_signature')?.value || '';

    const createdByName = document.getElementById('created_by_name')?.textContent?.trim() || '';
    const dean = document.getElementById('dean')?.textContent?.trim() || '';
    const cesHead = document.getElementById('ces_head')?.textContent?.trim() || '';
    const vpAcad = document.getElementById('vp_acad')?.textContent?.trim() || '';
    const vpAdmin = document.getElementById('vp_admin')?.textContent?.trim() || '';
    const schoolPresident = document.getElementById('school_president')?.textContent?.trim() || '';

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

            <div class="answer-block">
                <div class="answer-number">1.</div>
                <div class="paper-answer">${buildPaperAnswer(answerOne, 5)}</div>
            </div>

            <div class="answer-block">
                <div class="answer-number">2.</div>
                <div class="paper-answer">${buildPaperAnswer(answerTwo, 5)}</div>
            </div>

            <div class="answer-block">
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

        <section class="approvals-container">
            <div class="approval-row">
                <div class="signature-group">
                    <div class="label">Prepared by:</div>
                    <div class="signature-line">${escapeHtml(createdByName)}</div>
                    <div class="title bold">CES Coordinator</div>
                </div>
            </div>

            <div class="label" style="margin-top: 20px;">Noted by:</div>

            <div class="approval-row">
                <div class="signature-group">
                    <div class="signature-line">${escapeHtml(dean)}</div>
                    <div class="title bold">Dean</div>
                </div>

                <div class="signature-group">
                    <div class="signature-line">${escapeHtml(cesHead)}</div>
                    <div class="title bold">CES Head</div>
                </div>
            </div>

            <div class="approval-centered">
                <div class="label left-align">Recommending Approval:</div>

                <div class="admin-block">
                    <div class="name-underlined">${escapeHtml(vpAcad)}</div>
                    <div class="title bold">Vice-President for Academic Affairs and Research</div>
                </div>

                <div class="admin-block">
                    <div class="name-underlined">${escapeHtml(vpAdmin)}</div>
                    <div class="title bold">Vice-President for Administrative Affairs</div>
                </div>
            </div>

            <div class="approval-centered">
                <div class="label left-align">Approved by:</div>

                <div class="admin-block">
                    <div class="name-underlined">${escapeHtml(schoolPresident)}</div>
                    <div class="title bold">School President</div>
                </div>
            </div>
        </section>

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
                    <td class="value">${escapeHtml(issueStatus)}</td>
                </tr>

                <tr>
                    <td class="label">Revision No.</td>
                    <td>:</td>
                    <td class="value">${escapeHtml(revisionNumber)}</td>
                </tr>

                <tr>
                    <td class="label">Date Effective</td>
                    <td>:</td>
                    <td class="value">${escapeHtml(dateEffective)}</td>
                </tr>

                <tr>
                    <td class="label">Approved By</td>
                    <td>:</td>
                    <td class="value">${escapeHtml(approvedBy)}</td>
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

    const left2Logo =
        document.querySelector('.logo-left2')?.src ||
        '/SYSTEM_VERSION_!/coordinator/ReportManagement/actions/images/Ceslogo.png';

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
                <img src="${escapeHtml(left2Logo)}" alt="CES logo" class="logo-left2">
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

function createPrintIframe() {
    const iframe = document.createElement('iframe');

    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';

    document.body.appendChild(iframe);

    return iframe;
}

function waitForImages(docOrRoot) {
    const root = docOrRoot.querySelectorAll ? docOrRoot : docOrRoot.documentElement;
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

                setTimeout(done, 3000);
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
}

function nextFrame(win) {
    return new Promise(resolve => win.requestAnimationFrame(() => resolve()));
}

function runPrintAndCleanup(iframe) {
    return new Promise(resolve => {
        const win = iframe.contentWindow;
        let cleaned = false;

        const cleanup = () => {
            if (cleaned) return;
            cleaned = true;

            try {
                win.onafterprint = null;
            } catch (_) {}

            setTimeout(() => {
                if (iframe.parentNode) {
                    iframe.parentNode.removeChild(iframe);
                }

                resolve();
            }, 150);
        };

        win.onafterprint = cleanup;
        setTimeout(cleanup, 5000);

        win.focus();
        win.print();
    });
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

window.printReport = printReport;
