document.addEventListener('DOMContentLoaded', function () {
    
    // ------------------------------------------
    // 1. RECOMMENDATION LOGIC
    // ------------------------------------------
    const recommendationButton = document.querySelector('.recommendation-btn');
    const recommendationContainer = document.getElementById('recommendation-container'); 
    const recommendationList = document.getElementById('recommendation-list');
    const aiSearchInput = document.getElementById('ai-input');
    const AI_SERVER_URL = "http://127.0.0.1:5000";
    const STOPWORDS = new Set([
        "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "into",
        "is", "of", "on", "or", "the", "to", "with", "program", "project", "month",
        "week", "campaign", "initiative", "activity", "activities", "plan", "plans",
        "community", "barangay", "youth", "volunteer", "volunteers", "residents",
        "promote", "increase", "enhance", "develop", "conduct", "organize", "organized",
        "engage", "practices", "seminar", "seminars", "workshop", "workshops",
        "awareness", "action", "drive"
    ]);
    const TOKEN_NORMALIZATIONS = {
        clean: "cleanup",
        cleaning: "cleanup",
        cleanups: "cleanup",
        litter: "cleanup",
        littering: "cleanup",
        eco: "environment",
        ecological: "environment",
        ecosystem: "environment",
        ecosystems: "environment",
        environmental: "environment",
        conservation: "environment",
        protect: "environment",
        protection: "environment",
        preserve: "environment",
        preservation: "environment",
        rehabilitation: "environment",
        sustainable: "sustainability",
        marine: "coastal",
        beach: "coastal",
        mangrove: "coastal",
        fisherfolk: "coastal",
        trees: "tree",
        planting: "plant",
        planted: "plant",
        arts: "art",
        artistic: "art",
        creative: "art",
        creativity: "art",
        culture: "art",
        cultural: "art",
        multimedia: "media",
        digital: "media"
    };
    const TOPIC_CATEGORIES = {
        environment: new Set(["environment", "coastal", "cleanup", "tree", "plant", "sustainability", "climate", "pollution", "waste"]),
        health: new Set(["health", "medical", "nutrition", "fitness", "recreation"]),
        food: new Set(["food", "nutrition"]),
        education: new Set(["education", "literacy", "technology", "ict", "coding", "stem"]),
        arts_media: new Set(["art", "media", "journalism", "film", "photo", "photography", "video", "design", "music", "dance", "theater"]),
        disaster: new Set(["disaster", "relief"]),
        social: new Set(["senior", "elderly", "pwd"]),
        livelihood: new Set(["financial", "entrepreneurship"])
    };

    function topicTokens(text) {
        const tokens = new Set();
        String(text || "").toLowerCase().replace(/-/g, " ").match(/[a-z0-9]+/g)?.forEach(token => {
            if (token.length < 3 || STOPWORDS.has(token)) return;
            tokens.add(TOKEN_NORMALIZATIONS[token] || token);
        });
        return tokens;
    }

    function topicCategories(tokens) {
        const categories = new Set();
        Object.entries(TOPIC_CATEGORIES).forEach(([category, categoryTokens]) => {
            for (const token of tokens) {
                if (categoryTokens.has(token)) {
                    categories.add(category);
                    break;
                }
            }
        });
        return categories;
    }

    function intersectionSize(a, b) {
        let count = 0;
        a.forEach(value => {
            if (b.has(value)) count++;
        });
        return count;
    }

    function programText(program) {
        return [
            program.program,
            program.objectives,
            program.strategies,
            program.persons_agencies_involved,
            program.resources_needed,
            program.means_of_verification,
            program.time_frame
        ].filter(Boolean).join(" ");
    }

    function filterAccuratePrograms(projectTitle, programs) {
        const titleTokens = topicTokens(projectTitle);
        const titleCategories = topicCategories(titleTokens);

        if (!Array.isArray(programs) || titleTokens.size === 0) return [];

        return programs
            .map((program, originalIndex) => {
                const nameTokens = topicTokens(program.program || "");
                const rowTokens = topicTokens(programText(program));
                const rowCategories = topicCategories(new Set([...nameTokens, ...rowTokens]));
                const nameOverlap = intersectionSize(titleTokens, nameTokens);
                const rowOverlap = intersectionSize(titleTokens, rowTokens);

                if (titleCategories.size > 0 && intersectionSize(titleCategories, rowCategories) === 0) return null;

                return {
                    program,
                    originalIndex,
                    score: (nameOverlap * 100) + (rowOverlap * 20)
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex)
            .slice(0, 3)
            .map(item => item.program);
    }

    async function waitForAiServer(timeoutMs = 900000) {
        const startedAt = Date.now();

        while (Date.now() - startedAt < timeoutMs) {
            try {
                const response = await fetch(`${AI_SERVER_URL}/health`, { cache: "no-store" });
                if (response.ok) {
                    return true;
                }
            } catch (error) {
                // The server may still be loading the AI model after login.
            }

            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        return false;
    }

    aiSearchInput.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' || event.repeat || recommendationButton.disabled) {
            return;
        }

        event.preventDefault();
        recommendationButton.click();
    });
    
        recommendationButton.addEventListener('click', async function () {
            const finalQuery = aiSearchInput.value.trim();

            if (!finalQuery) {
                alert("Please type what recommendation you want in the search bar first.");
                aiSearchInput.focus();
                return;
            }

            recommendationButton.innerHTML = "<span>⏳ AI is Analyzing...</span>";
            recommendationButton.disabled = true;
            
            try {
                recommendationButton.innerHTML = "<span>Starting AI server...</span>";
                const serverReady = await waitForAiServer();

                if (!serverReady) {
                    throw new Error("AI server did not become ready on port 5000.");
                }

                recommendationButton.innerHTML = "<span>AI is Analyzing...</span>";
                const response = await fetch(`${AI_SERVER_URL}/recommend`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    // Sending the query (which is now never empty)
                    body: JSON.stringify({
                        text: finalQuery,
                        user_id: "default",
                        source: "search"
                    })
                });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            recommendationList.innerHTML = "";
            
            if (!data.recommendations || data.recommendations.length === 0) {
                recommendationList.innerHTML = "<li>No recommendations found. Try a different search query.</li>";
                return;
            }
            
            data.recommendations.forEach((rec, index) => {
                const li = document.createElement('li');
                li.className = 'recommendation-item';
                li.innerHTML = `
                    <div class="rec-title"><strong>${index + 1}. ${rec.project.title_of_project || 'Untitled Project'}</strong></div>
                    <div class="rec-description">${rec.project.description_of_project || 'No description provided.'}</div>
                    <small class="rec-hint">Click to apply this recommendation</small>
                `;
                
                li.addEventListener('click', () => {
                    // Populate project form fields
                    document.getElementById('title_of_project').value = rec.project.title_of_project || "";
                    document.getElementById('description_of_project').value = rec.project.description_of_project || "";
                    document.getElementById('general_objectives').value = rec.project.general_objectives || "";
                    document.getElementById('program_justification').value = rec.project.program_justification || "";
                    document.getElementById('beneficiaries').value = rec.project.beneficiaries || "";
                    document.getElementById('program_plan').value = rec.project.program_plan || "";
                    
                    // Populate program table
                    const tableBody = document.querySelector('#programPlanTable tbody');
                    tableBody.innerHTML = ""; // Clear existing rows
                    
                    const accuratePrograms = filterAccuratePrograms(finalQuery, rec.program);
                    if (accuratePrograms.length > 0) {
                        accuratePrograms.forEach(p => {
                            const row = document.createElement('tr');
                            const rowData = [
                                p.program || "",
                                p.objectives || "",
                                p.strategies || "",
                                p.persons_agencies_involved || "",
                                p.resources_needed || "",
                                p.budget !== undefined && p.budget !== null && !isNaN(parseFloat(p.budget)) ? parseFloat(p.budget) : "",
                                p.means_of_verification || "",
                                p.time_frame || ""
                            ];
                            
                            // Inside your rec.program.forEach loop
                               // Inside your rec.program.forEach loop...
                             // In the recommendation application section
                                rowData.forEach((val, i) => {
                                    const td = document.createElement('td');
                                    // Use textarea for ALL fields for consistency
                                    const input = document.createElement('textarea');
                                    
                                    input.value = val;
                                    input.classList.add('table-input');
                                    input.readOnly = false;
                                    
                                    // Set rows attribute for better appearance
                                    input.rows = 2;
                                    
                                    td.appendChild(input);
                                    row.appendChild(td);
                                });
                            tableBody.appendChild(row);
                        });
                    } else {
                        for (let rowIndex = 0; rowIndex < 1; rowIndex++) {
                            const emptyRow = document.createElement('tr');
                            for (let i = 0; i < 8; i++) {
                                const td = document.createElement('td');
                                const input = document.createElement('textarea');
                                input.value = "";
                                input.classList.add('table-input');
                                input.readOnly = false;
                                input.rows = 2;
                                td.appendChild(input);
                                emptyRow.appendChild(td);
                            }
                            tableBody.appendChild(emptyRow);
                        }
                    }
                    
                    window.scrollTo({ top: 0, behavior: 'smooth' });

                });
                
                recommendationList.appendChild(li);
            });
            
            recommendationContainer.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            console.error("Fetch Error:", error);
            alert("Could not connect to the AI server. Please log in again or check AI_RECOMMENDATION/ai_server.log.");
        } finally {
            recommendationButton.innerHTML = "AI Recommendations";
            recommendationButton.disabled = false;
        }
    });
    
});
