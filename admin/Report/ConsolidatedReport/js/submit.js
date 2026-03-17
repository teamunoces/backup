

async function submitBarangayReport() {
  const urlParams = new URLSearchParams(window.location.search);
  const reportType = urlParams.get('type') || "Consolidated Report";
  const textAreas = document.querySelectorAll('.intro-textarea');
    
    const table1Data = {
    location: "BRGY. CAMAGONG DISTRICT 1 TO DISTRICT 10",
    // Adding ?. prevents the "null" crash
    totalPopulation: document.getElementById('totalPopulation')?.innerText || "0",
    totalHousehold: document.getElementById('totalHousehold')?.innerText || "0",
    totalRespondents: document.getElementById('totalRespondents')?.innerText || "0",
    percentage: document.getElementById('responsePercent')?.innerText || "0%"
};

    const reportData = {
        // Headers & Text blocks
        type: reportType,
        communityHeader: document.getElementById('communityHeader').innerText,
        title: document.getElementById('titleH1').innerText,
        barangayProfileTable: JSON.stringify(table1Data),
        introText: textAreas[0]?.value || '',
        table_1_text: textAreas[1]?.value || '',
        table_2_text: textAreas[2]?.value || '',
        table_3_text: textAreas[3]?.value || '',
        table_4_text: textAreas[4]?.value || '',
        table_5_text: textAreas[5]?.value || '',
        table_6_text: textAreas[6]?.value || '',
        table_7_text: textAreas[7]?.value || '',
        table_8_text: textAreas[8]?.value || '',
        table_9_text: textAreas[9]?.value || '',
        table_10_text: textAreas[10]?.value || '',
        table_11_text: textAreas[11]?.value || '',
        table_12_text: textAreas[12]?.value || '',
        table_13_text: textAreas[13]?.value || '',
        table_14_text: textAreas[14]?.value || '',
        table_15_text: textAreas[15]?.value || '',
        table_16_text: textAreas[16]?.value || '',
        table_17_text: textAreas[17]?.value || '',
        table_18_text: textAreas[18]?.value || '',
        table_19_text: textAreas[19]?.value || '',
        table_20_text: textAreas[20]?.value || '',
        table_21_text: textAreas[21]?.value || '',
        conclusion_text: textAreas[22]?.value || '',

        // Tables (Converting the rows into JSON strings to fit in TEXT columns)
        
        religionTable: JSON.stringify(getTableData('religionTable')),
        incomeTable: JSON.stringify(getTableData('incomeTable')),
        monthlyIncomeTable: JSON.stringify(getTableData('monthlyIncomeTable')),
        educationTable: JSON.stringify(getTableData('educationTable')),
        ageTable: JSON.stringify(getTableData('ageTable')),
        pwdTable: JSON.stringify(getTableData('pwdTable')),
        healthTable: JSON.stringify(getTableData('healthTable')),
        toiletTable: JSON.stringify(getTableData('toiletTable')),
        wasteTable: JSON.stringify(getTableData('wasteTable')),
        urgentTable: JSON.stringify(getTableData('urgentTable')),
        peaceTable: JSON.stringify(getTableData('peaceTable')),
        neccessityTrainingTable: JSON.stringify(getTableData('neccessityTrainingTable')),
        essentialTrainingTable: JSON.stringify(getTableData('essentialTrainingTable')),
        seminarTable: JSON.stringify(getTableData('seminarTable')),
        trainingTable: JSON.stringify(getTableData('trainingTable')),
        mostDesiredTable: JSON.stringify(getTableData('mostDesiredTable')),
        spiritualLifeTable: JSON.stringify(getTableData('spiritualLifeTable')),
        deepeningSpiritualityTable: JSON.stringify(getTableData('deepeningSpiritualityTable')),
        participationTable: JSON.stringify(getTableData('participationTable')),
        otherBarangayNeedsTable: JSON.stringify(getTableData('otherBarangayNeedsTable'))
    };

    try {
        const response = await fetch('./php/submit.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportData)
        });

        const result = await response.json();
        alert(result.message);
    } catch (error) {
        console.error("Error! Make sure submit.php exists in the same folder.");
    }
}

// Helper function to extract table rows
function getTableData(tableId) {
    const rows = Array.from(document.querySelectorAll(`#${tableId} tr`));
    return rows.map(row => Array.from(row.cells).map(cell => cell.innerText));
}

document.getElementById('submitReport').addEventListener('click', submitBarangayReport);