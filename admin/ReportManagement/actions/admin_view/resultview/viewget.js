// ================= HELPER FUNCTIONS =================

/**
 * Converts JSON data into HTML table rows.
 * Dynamically handles both object-style data (Table 1) and array-style data (others).
 */
function generateTableRows(rowData) {
    if (!rowData) return "<tr><td colspan='10'>No data available</td></tr>";

    // If it's already a string (pre-formatted HTML), return it
    if (typeof rowData === 'string') {
        try {
            // Attempt to parse if it's a JSON string representing an array or object
            const parsed = JSON.parse(rowData);
            return generateTableRows(parsed); 
        } catch (e) {
            return rowData; 
        }
    }

    try {
        // CASE 1: Data is an Array (e.g., [["Item", "Value", "Rank"], ...])
        if (Array.isArray(rowData)) {
            return rowData.map(row => {
                if (Array.isArray(row)) {
                    const cells = row.map(cell => `<td>${cell ?? ''}</td>`).join('');
                    return `<tr>${cells}</tr>`;
                }
                return "";
            }).join('');
        }

        // CASE 2: Data is a single Object (Specifically for Table 1 / barangayProfileTable)
        if (typeof rowData === 'object') {
            return `<tr>
                <td>${rowData.location || 'N/A'}</td>
                <td>${rowData.totalPopulation || '0'}</td>
                <td>${rowData.totalHousehold || '0'}</td>
                <td>${rowData.totalRespondents || '0'}</td>
                <td>${rowData.percentage || '0%'}</td>
            </tr>`;
        }

    } catch (e) {
        console.error("Error formatting table rows:", e);
        return "<tr><td colspan='10'>Error rendering data</td></tr>";
    }
}

// Utility: Get current report ID from URL
function getReportId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || null;
}

// ================= MAIN LOGIC =================

async function loadReport() {
    const id = getReportId();
    if (!id) {
        console.warn("No report ID found in URL.");
        return;
    }

    try {
        const response = await fetch("viewget.php?id=" + id);
        const data = await response.json();

        if (!data || data.error) {
            console.error("Report data error:", data?.error);
            return;
        }

        // 1. Update Headers/Metadata
        const titleH2 = document.getElementById("titleH2");
        if (titleH2 && data.communityHeader) {
             // Extracting the Barangay name from the multi-line header string if possible
             const lines = data.communityHeader.split('\n');
             titleH2.innerText = lines[1] || data.communityHeader;
        }

        // 2. Update Textareas (Intro, Table descriptions, Conclusion)
        const contentFields = [
            "introText", "table_1_text", "table_2_text", "table_3_text", "table_4_text", "table_5_text",
            "table_6_text", "table_7_text", "table_8_text", "table_9_text", "table_10_text",
            "table_11_text", "table_12_text", "table_13_text", "table_14_text", "table_15_text",
            "table_16_text", "table_17_text", "table_18_text", "table_19_text", "table_20_text",
            "table_21_text", "conclusion_text"
        ];

        contentFields.forEach(fieldId => {
            const el = document.getElementById(fieldId);
            if (el) {
                el.innerText = data[fieldId] || ""; // use innerText instead of value
            }
        });

        // 3. Update Tables
        const tables = [
            "barangayProfileTable", "religionTable", "incomeTable", "monthlyIncomeTable",
            "educationTable", "ageTable", "pwdTable", "healthTable", "toiletTable",
            "wasteTable", "urgentTable", "peaceTable", "neccessityTrainingTable",
            "essentialTrainingTable", "seminarTable", "trainingTable", "mostDesiredTable",
            "spiritualLifeTable", "deepeningSpiritualityTable", "participationTable",
            "otherBarangayNeedsTable"
        ];

        tables.forEach(tableId => {
            const el = document.getElementById(tableId);
            if (el && data[tableId]) {
                el.innerHTML = generateTableRows(data[tableId]);
            }
        });

        // 4. Update Summary Spans in Table 1 (Extra precaution)
        // Your JSON for barangayProfileTable is an object, so we handle it specifically:
        let bProfile = data.barangayProfileTable;
        if (typeof bProfile === 'string') bProfile = JSON.parse(bProfile);
        
        if (bProfile && typeof bProfile === 'object') {
            if(document.getElementById("totalPopulation")) document.getElementById("totalPopulation").innerText = bProfile.totalPopulation;
            if(document.getElementById("totalHousehold")) document.getElementById("totalHousehold").innerText = bProfile.totalHousehold;
            if(document.getElementById("totalRespondents")) document.getElementById("totalRespondents").innerText = bProfile.totalRespondents;
            if(document.getElementById("responsePercent")) document.getElementById("responsePercent").innerText = bProfile.percentage;
        }

    } catch (error) {
        console.error("Critical Error in loadReport:", error);
    }
}

document.addEventListener('DOMContentLoaded', loadReport);