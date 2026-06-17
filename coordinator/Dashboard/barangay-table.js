document.addEventListener("DOMContentLoaded", async () => {
    const isDebug = new URLSearchParams(window.location.search).has("debug");

    const logFetchError = (message) => {
        if (isDebug) {
            console.warn(message);
        }
    };

    const fetchJson = async (url, label) => {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                logFetchError(`${label} request failed (${response.status})`);
                return [];
            }

            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
                logFetchError(`${label} returned a non-JSON response`);
                return [];
            }

            return await response.json();
        } catch {
            logFetchError(`${label} could not be loaded`);
            return [];
        }
    };

    const [demoData, surveyData] = await Promise.all([
        fetchJson("get_barangays.php?action=demographics", "Demographics data"),
        fetchJson("get_barangays.php?action=survey", "Survey data")
    ]);

    if (!demoData.length) return;

    const combinedData = demoData.map((d) => {
        const surveyEntry = surveyData.find((s) => s.name.toUpperCase() === d.name.toUpperCase());
        const respondents = surveyEntry ? surveyEntry.respondents : 0;
        const percentage = d.population > 0
            ? ((respondents / d.population) * 100).toFixed(2)
            : 0;

        return {
            name: d.name.replace(/_/g, " ").toUpperCase(),
            population: d.population,
            respondents,
            percentage
        };
    });

    const chartElement = document.getElementById("barangayChart");
    if (!chartElement) return;

    const ctx = chartElement.getContext("2d");
    const labels = combinedData.map((b) => b.name);
    const respondentsData = combinedData.map((b) => b.respondents);
    const populationData = combinedData.map((b) => b.population);
    const percentageData = combinedData.map((b) => b.percentage);

    new Chart(ctx, {
        data: {
            labels,
            datasets: [
                {
                    type: "bar",
                    label: "Respondents",
                    data: respondentsData,
                    backgroundColor: "rgba(99, 192, 47, 0.7)",
                    borderColor: "rgba(65, 128, 30, 1)",
                    borderWidth: 1
                },
                {
                    type: "bar",
                    label: "Population",
                    data: populationData,
                    backgroundColor: "rgba(200, 230, 180, 0.5)",
                    borderColor: "rgba(65, 128, 30, 0.7)",
                    borderWidth: 1
                },
                {
                    type: "line",
                    label: "Percentage (%)",
                    data: percentageData,
                    yAxisID: "y1",
                    borderColor: "rgba(255, 159, 64, 1)",
                    backgroundColor: "rgba(255, 159, 64, 0.2)",
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true },
                tooltip: { mode: "index", intersect: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    position: "left",
                    title: {
                        display: true,
                        text: "Number of People"
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: "right",
                    grid: { drawOnChartArea: false },
                    title: {
                        display: true,
                        text: "Percentage (%)"
                    },
                    ticks: { callback: (val) => `${val}%` }
                },
                x: { ticks: { autoSkip: false } }
            }
        }
    });
});
