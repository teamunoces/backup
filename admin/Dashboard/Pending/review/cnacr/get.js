// ================= HELPER FUNCTIONS =================

/**
 * Converts JSON data into HTML table rows.
 * Handles: Single objects, Arrays of objects, Arrays of arrays
 */
function generateTableRows(rowData) {
    if (!rowData) return "<tr><td colspan='10'>No data available</td></tr>";

    if (typeof rowData === 'string') {
        try {
            const parsed = JSON.parse(rowData);
            return generateTableRows(parsed);
        } catch (e) {
            return `<tr><td colspan='10'>${rowData}</td></tr>`;
        }
    }

    try {
        if (Array.isArray(rowData)) {
            return rowData.map(row => {
                if (Array.isArray(row)) {
                    return `<tr>${row.map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`;
                } else if (typeof row === 'object') {
                    return `<tr>${Object.values(row).map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`;
                }
                return '';
            }).join('');
        }

        if (typeof rowData === 'object') {
            return `<tr>${Object.values(rowData).map(cell => `<td>${cell ?? ''}</td>`).join('')}</tr>`;
        }
    } catch (e) {
        console.error("Error formatting table rows:", e);
        return "<tr><td colspan='10'>Error rendering data</td></tr>";
    }
}

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
        const response = await fetch(`/admin/Dashboard/Pending/review/cnacr/get.php?id=${id}`);
        const text = await response.text();
        
        if (!text) throw new Error("Server returned empty response");

        const data = JSON.parse(text);
        console.log("Parsed Data:", data); // Debugging line

        // --- 1. Update Header ---
        const titleH2 = document.getElementById("titleH2");
        if (titleH2 && data.communityHeader) {
            const lines = data.communityHeader.split('\n');
            titleH2.innerText = lines[1] || data.communityHeader;
        }

        // --- 2. Update Textareas ---
        const contentFields = [
            "introText", "table_1_text", "table_2_text", "table_3_text", "table_4_text", "table_5_text",
            "table_6_text", "table_7_text", "table_8_text", "table_9_text", "table_10_text",
            "table_11_text", "table_12_text", "table_13_text", "table_14_text", "table_15_text",
            "table_16_text", "table_17_text", "table_18_text", "table_19_text", "table_20_text",
            "table_21_text", "conclusion_text"
        ];
        contentFields.forEach(fieldId => {
            const el = document.getElementById(fieldId);
            if (el) el.value = data[fieldId] || "";
        });

        // --- 3. Update Tables ---
        const tables = [
            "barangayProfileTable", "religionTable", "incomeTable", "monthlyIncomeTable",
            "educationTable", "ageTable", "pwdTable", "healthTable", "toiletTable",
            "wasteTable", "urgentTable", "peaceTable", "neccessityTrainingTable",
            "essentialTrainingTable", "seminarTable", "trainingTable", "mostDesiredTable",
            "spiritualLifeTable", "deepeningSpiritualityTable", "participationTable",
            "otherBarangayNeedsTable", "demographicTotalsTable"
        ];

        tables.forEach(tableId => {
            const el = document.getElementById(tableId);
            if (el && data[tableId]) {
                el.innerHTML = generateTableRows(data[tableId]);
            }
        });

        // --- 4. Update Summary Spans (Fix for "Loading..." issue) ---
        const summaryFields = [
            {
                dataKey: 'barangayProfileTable',
                mapping: {
                    totalPopulation: 'totalPopulation',
                    totalHousehold: 'totalHousehold',
                    totalRespondents: 'totalRespondents',
                    percentage: 'responsePercent'
                }
            },
            {
                dataKey: 'demographic_totals',
                mapping: {
                    population: 'totalPopulation',
                    households: 'totalHousehold'
                }
            }
        ];

        summaryFields.forEach(({ dataKey, mapping }) => {
            let rawValue = data[dataKey];
            if (!rawValue) return;

            let obj = null;

            // 1. Parse if string
            if (typeof rawValue === 'string') {
                try {
                    obj = JSON.parse(rawValue);
                } catch (e) {
                    console.warn(`Failed to parse ${dataKey}`, e);
                }
            } else {
                obj = rawValue;
            }

            // 2. Extract first object if it's an array
            if (Array.isArray(obj) && obj.length > 0) {
                obj = obj[0];
            }

            // 3. Update the specific SPAN/TD elements
            if (obj && typeof obj === 'object') {
                for (const [jsonKey, htmlId] of Object.entries(mapping)) {
                    const el = document.getElementById(htmlId);
                    if (el && obj[jsonKey] !== undefined && obj[jsonKey] !== null) {
                        el.innerText = obj[jsonKey];
                    }
                }
            }
        });

    } catch (error) {
        console.error("Critical Error in loadReport:", error);
    }
}

document.addEventListener('DOMContentLoaded', loadReport);  