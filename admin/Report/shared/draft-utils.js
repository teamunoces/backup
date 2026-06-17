(function () {
    function ensureDraftUi() {
        let notice = document.getElementById("draftNotice");
        if (!notice) {
            const container = document.querySelector(".container, .form-container, .report-container, .certificate-container") || document.body;
            notice = document.createElement("div");
            notice.id = "draftNotice";
            notice.className = "draft-notice";
            notice.hidden = true;
            notice.innerHTML = '<span>You have an unfinished draft.</span><div class="draft-notice-actions"><button type="button" id="resumeDraftBtn">Resume Work</button><button type="button" id="closeDraftNoticeBtn" class="draft-notice-close" aria-label="Close draft notice">x</button></div>';
            const titlePatterns = [
                "COMMUNITY NEEDS ASSESSMENT CONSOLIDATED REPORT",
                "MONTHLY ACCOMPLISHMENT REPORT",
                "PROGRAM DESIGN FORM",
                "PROGRAM MONITORING FORM",
                "PROGRAM MONIROTING FORM",
                "3-YEAR DEVELOPMENT PLAN",
                "EVALUATION SHEET FOR EXTENSION SERVICES",
                "CERTIFICATE OF APPEARANCE",
                "MONTHLY ACCOMPLISHMENT REPORT- REFLECTION PAPER",
                "MONTHLY ACCOMPLISHMENT REPORT- NARRATIVE REPORT"
            ];
            const headings = Array.from(container.querySelectorAll("h1, h2, h3"));
            const reportTitle = headings.find(heading => {
                const text = heading.textContent.replace(/\s+/g, " ").trim().toUpperCase();
                return titlePatterns.some(title => text === title || text.includes(title));
            }) || headings[headings.length - 1];

            if (reportTitle && reportTitle.nextSibling) {
                reportTitle.parentNode.insertBefore(notice, reportTitle.nextSibling);
            } else if (reportTitle) {
                reportTitle.parentNode.appendChild(notice);
            } else {
                container.insertBefore(notice, container.firstChild);
            }
        }

        let resumeButton = document.getElementById("resumeDraftBtn");
        if (!resumeButton) {
            resumeButton = document.createElement("button");
            resumeButton.type = "button";
            resumeButton.id = "resumeDraftBtn";
            resumeButton.textContent = "Resume Work";
            let actions = notice.querySelector(".draft-notice-actions");
            if (!actions) {
                actions = document.createElement("div");
                actions.className = "draft-notice-actions";
                notice.appendChild(actions);
            }
            actions.appendChild(resumeButton);
        }

        let closeNoticeButton = document.getElementById("closeDraftNoticeBtn");
        if (!closeNoticeButton) {
            let actions = notice.querySelector(".draft-notice-actions");
            if (!actions) {
                actions = document.createElement("div");
                actions.className = "draft-notice-actions";
                notice.appendChild(actions);
            }
            closeNoticeButton = document.createElement("button");
            closeNoticeButton.type = "button";
            closeNoticeButton.id = "closeDraftNoticeBtn";
            closeNoticeButton.className = "draft-notice-close";
            closeNoticeButton.setAttribute("aria-label", "Close draft notice");
            closeNoticeButton.textContent = "x";
            actions.appendChild(closeNoticeButton);
        }

        const submitButton = document.querySelector(".submit-button, .btn-submit");
        let actionBar = document.querySelector(".report-action-bar");
        if (!actionBar && submitButton && submitButton.parentNode) {
            if (submitButton.parentElement && submitButton.parentElement.classList.contains("form-actions")) {
                actionBar = submitButton.parentElement;
            } else {
                actionBar = document.createElement("div");
                actionBar.className = "report-action-bar";
                submitButton.parentNode.insertBefore(actionBar, submitButton);
                actionBar.appendChild(submitButton);
            }
        }

        let draftButton = document.querySelector(".draft-button");
        if (!draftButton) {
            draftButton = document.createElement("button");
            draftButton.className = "draft-button";
            draftButton.textContent = "Save Draft";
        }
        draftButton.type = "button";

        let clearButton = document.querySelector(".clear-button");
        if (!clearButton) {
            clearButton = document.createElement("button");
            clearButton.className = "clear-button";
            clearButton.textContent = "Clear";
        }
        clearButton.type = "button";

        if (actionBar) {
            if (!actionBar.contains(draftButton)) actionBar.appendChild(draftButton);
            if (!actionBar.contains(clearButton)) actionBar.appendChild(clearButton);
            if (submitButton && !actionBar.contains(submitButton)) actionBar.appendChild(submitButton);
        }

        return { notice, resumeButton, closeNoticeButton, draftButton, clearButton };
    }

    function createReportDraftManager(config) {
        const ui = ensureDraftUi();
        let currentDraftId = null;
        let currentUserId = null;
        let localStorageKey = null;
        let autosaveTimer = null;
        let databaseDraft = null;

        function setLocalStorageKey(userId) {
            currentUserId = userId;
            localStorageKey = `draft_data_${userId}_${config.storageKey}`;
        }

        function saveLocalDraft() {
            if (!localStorageKey || !currentDraftId) return;
            localStorage.setItem(localStorageKey, JSON.stringify({
                saved_at: new Date().toISOString(),
                draft_id: currentDraftId,
                data: config.collect("local_autosave")
            }));
        }

        function stopLocalAutosave() {
            if (autosaveTimer) {
                clearInterval(autosaveTimer);
                autosaveTimer = null;
            }
        }

        function startLocalAutosave() {
            stopLocalAutosave();
            saveLocalDraft();
            autosaveTimer = setInterval(saveLocalDraft, 30000);
        }

        function clearLocalDraft() {
            if (localStorageKey) localStorage.removeItem(localStorageKey);
        }

        async function request(payload) {
            const response = await fetch(config.endpoint || "post.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (error) {
                throw new Error(text || "Server returned an invalid response.");
            }
            if (!response.ok || !result.success) {
                throw new Error(result.message || result.error || "Request failed.");
            }
            return result;
        }

        async function checkDatabaseDraft() {
            try {
                const result = await request({ action: "get_draft" });
                setLocalStorageKey(result.user_id);
                if (result.draft) {
                    databaseDraft = result.draft;
                    currentDraftId = Number(result.draft.id);
                    ui.notice.hidden = false;
                }
            } catch (error) {
                console.warn("Draft check failed:", error);
            }
        }

        ui.resumeButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!databaseDraft) return;
            config.fill(databaseDraft);
            currentDraftId = Number(databaseDraft.id);
            ui.notice.hidden = true;
            startLocalAutosave();
            if (window.showSuccessBanner) showSuccessBanner("Draft loaded. Local auto-save is now active.");
        });

        ui.closeNoticeButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            ui.notice.hidden = true;
        });

        ui.draftButton.addEventListener("click", async (event) => {
            event.preventDefault();
            event.stopPropagation();
            try {
                const data = config.collect("save_draft");
                data.action = "save_draft";
                data.draft_id = currentDraftId;
                const result = await request(data);
                currentDraftId = Number(result.draft_id);
                setLocalStorageKey(result.user_id);
                startLocalAutosave();
                ui.notice.hidden = true;
                if (window.showSuccessBanner) showSuccessBanner(result.message || "Draft saved successfully.");
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        });

        ui.clearButton.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (typeof config.clear === "function") {
                config.clear();
            }
            currentDraftId = null;
        });

        return {
            checkDatabaseDraft,
            applySubmitMeta(data) {
                data.action = "submit";
                data.draft_id = currentDraftId;
                return data;
            },
            completeSubmit() {
                stopLocalAutosave();
                clearLocalDraft();
                currentDraftId = null;
                databaseDraft = null;
                ui.notice.hidden = true;
            }
        };
    }

    window.ReportDrafts = { create: createReportDraftManager };
})();
