document.getElementById('downloadPdf').addEventListener('click', async function () {
    const source = document.querySelector('.container');
    if (!source) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'pdf-export-wrapper';

    wrapper.innerHTML = `
        <header class="pdf-report-header">
            <div class="header-content">
                <img src="${new URL('../../Report/images/smcclogo.png', window.location.href).href}" alt="SMCC Logo" class="logo-left">
                <img src="${new URL('../../Report/images/Ceslogo.png', window.location.href).href}" alt="CES logo" class="logo-left2">
                <div class="college-info">
                    <h1>Saint Michael College of Caraga</h1>
                    <p>Brgy. 4, Nasipit, Agusan del Norte, Philippines</p>
                    <p>District 8, Brgy. Triangulo, Nasipit, Agusan del Norte, Philippines</p>
                    <p>Tel Nos. +63 085 343-3251 / +63 085 283-3113</p>
                    <a href="http://www.smccnasipit.edu.ph">www.smccnasipit.edu.ph</a>
                </div>
                <div class="logos-right">
                    <img src="${new URL('../../Report/images/ISOlogo.png', window.location.href).href}" alt="SOCOTEC Logo">
                </div>
            </div>
            <h2 class="office-title">OFFICE OF THE COMMUNITY EXTENSION SERVICES</h2>
            <div class="double-line"></div>
        </header>
    `;

    const clone = source.cloneNode(true);
    wrapper.appendChild(clone);

    const style = document.createElement('style');
    style.id = 'pdf-export-styles';
    style.textContent = `
        .pdf-export-wrapper {
            width: 250mm;
            margin: 0 auto;
            box-sizing: border-box;
            background: #ffffff;
            color: #000000;
            font-family: "Segoe UI", Arial, sans-serif;
            overflow: visible;
        }

        .pdf-export-wrapper .container {
            width: 100%;
            max-width: none;
            margin: 0;
            padding: 0;
            box-shadow: none;
            background: #ffffff;
            overflow: visible;
        }

        .pdf-export-wrapper table {
            width: 100%;
            max-width: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            page-break-inside: auto;
        }

        .pdf-export-wrapper th,
        .pdf-export-wrapper td {
            overflow-wrap: anywhere;
            word-break: break-word;
            white-space: normal;
        }

        .pdf-export-wrapper tr {
            page-break-inside: avoid;
        }

        .pdf-export-wrapper .table-card,
        .pdf-export-wrapper .table-container,
        .pdf-export-wrapper .table-box {
            width: 100%;
            max-width: 100%;
            overflow: visible;
        }

        .pdf-report-header {
            margin: 0 0 25px 0;
            padding: 0;
            background: #ffffff;
            color: #000000;
            page-break-inside: avoid;
        }

        .pdf-report-header .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 15px;
            width: 100%;
        }

        .pdf-report-header .logo-left {
            height: 90px;
            width: auto;
        }

        .pdf-report-header .logo-left2 {
            height: 80px;
            width: auto;
        }

        .pdf-report-header .logos-right {
            display: flex;
            gap: 20px;
            align-items: center;
            flex: 0 0 auto;
            max-width: 120px;
            overflow: hidden;
        }

        .pdf-report-header .logos-right img {
            height: 80px;
            max-width: 120px;
            object-fit: contain;
            width: auto;
        }

        .pdf-report-header .college-info {
            text-align: center;
            flex-grow: 1;
            padding: 0 20px;
        }

        .pdf-report-header .college-info h1 {
            font-family: "Times New Roman", Times, serif;
            color: #4f81bd;
            font-size: 26px;
            margin: 0;
            font-weight: normal;
            line-height: 1.2;
        }

        .pdf-report-header .college-info p {
            font-size: 11px;
            margin: 2px 0;
            color: #333333;
            line-height: 1.4;
        }

        .pdf-report-header .college-info a {
            font-size: 13px;
            color: #0000EE;
            text-decoration: underline;
        }

        .pdf-report-header .office-title {
            text-align: center;
            font-size: 18px;
            color: #595959;
            font-weight: bold;
            margin: 20px 0 5px 0;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        .pdf-report-header .double-line {
            border-top: 4px double #4f81bd;
            margin-bottom: 25px;
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(wrapper);

    const images = Array.from(wrapper.querySelectorAll('img'));
    await Promise.all(images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
        });
    }));

    const opt = {
        margin: [10, 10, 10, 10],
        filename: 'Barangay_Consolidated_Result.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: 0
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.pdf-report-header'] }
    };

    try {
        await html2pdf().set(opt).from(wrapper).save();
    } finally {
        wrapper.remove();
        style.remove();
    }
});

