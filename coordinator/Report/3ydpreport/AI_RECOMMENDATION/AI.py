from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import mysql.connector
import torch
import random
from collections import defaultdict

app = Flask(__name__)
CORS(app)

# --------------------------------
# LOAD MODEL
# --------------------------------
model = SentenceTransformer("all-MiniLM-L6-v2")

# --------------------------------
# DATABASE CONNECTIONS
# --------------------------------
# synthetic_db
db_synth = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="synthetic_db"
)
cursor_synth = db_synth.cursor(dictionary=True)

# ces_reports_db
db_ces = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="ces_reports_db"
)
cursor_ces = db_ces.cursor(dictionary=True)

# --------------------------------
# USER HISTORY
# --------------------------------
user_history = defaultdict(set)
usage_counter = defaultdict(int)

# --------------------------------
# QUERY EXPANSION
# --------------------------------
def expand_query(q: str) -> str:
    q = q.lower()
    expansions = []

    if any(w in q for w in ["food", "hungry", "feeding", "nutrition", "meal"]):
        expansions.append("food assistance feeding program nutrition community children families")

    if any(w in q for w in ["health", "medical", "medicine", "clinic", "doctor"]):
        expansions.append("medical mission healthcare outreach vaccination wellness community")

    if any(w in q for w in ["education", "school", "student", "youth", "literacy"]):
        expansions.append("education outreach literacy youth training learning community")

    if any(w in q for w in ["environment", "tree", "climate", "clean", "recycle"]):
        expansions.append("environment outreach tree planting cleanup sustainability climate")

    if any(w in q for w in ["disaster", "relief", "flood", "typhoon", "emergency"]):
        expansions.append("disaster relief emergency response outreach affected families")

    if any(w in q for w in ["elderly", "senior", "disabled", "pwd", "poor"]):
        expansions.append("social welfare elderly disabled vulnerable community support")

    if any(w in q for w in ["community", "volunteer", "service", "outreach"]):
        expansions.append("community service volunteer engagement outreach development")

    return q + " " + " ".join(expansions)

# --------------------------------
# LOAD & EMBED DATABASES
# --------------------------------
def load_recommendations():
    combined_texts = []
    stored_recs = []

    # -------------------------
    # 1. LOAD synthetic_db - PROJECTS
    # -------------------------
    cursor_synth.execute("""
        SELECT 
            `Title of the Project/Program`,
            `Description of the Project/Program`,
            `General Objectives`,
            `Program Justification`,
            `Beneficiaries`,
            `program_plan`
        FROM projects
    """)
    project_rows = cursor_synth.fetchall()

    projects = []
    project_texts = []

    # Get all projects from synthetic_db
    for row in project_rows:
        project = {
            "project": {
                "title_of_project": row["Title of the Project/Program"] or "",
                "description_of_project": row["Description of the Project/Program"] or "",
                "general_objectives": row["General Objectives"] or "",
                "program_justification": row["Program Justification"] or "",
                "beneficiaries": row["Beneficiaries"] or "",
                "program_plan": row["program_plan"] or ""
            },
            "program": []  # Initialize empty program list
        }
        projects.append(project)
        project_texts.append(
            f"{project['project']['title_of_project']} "
            f"{project['project']['description_of_project']} "
            f"{project['project']['general_objectives']} "
            f"{project['project']['program_justification']}"
        )

    # -------------------------
    # 2. LOAD synthetic_db - PROGRAM PLANS (standalone)
    # -------------------------
    cursor_synth.execute("""
        SELECT 
            `Program`,
            `Milestones`,
            `Objectives`,
            `Strategies`,
            `Persons/Agencies Involved`,
            `Resources Needed`,
            `Budget`,
            `Time Frame`
        FROM program_plans
    """)
    program_rows = cursor_synth.fetchall()

    # Create program plans list from synthetic_db
    synth_program_plans = []
    for row in program_rows:
        program = {
            "program": row["Program"] or "",
            "milestones": row["Milestones"] or "",
            "objectives": row["Objectives"] or "",
            "strategies": row["Strategies"] or "",
            "persons_agencies_involved": row["Persons/Agencies Involved"] or "",
            "resources_needed": row["Resources Needed"] or "",
            "budget": float(row["Budget"]) if row["Budget"] else 0,
            "time_frame": row["Time Frame"] or ""
        }
        synth_program_plans.append(program)

    # -------------------------
    # 3. LOAD ces_reports_db - PROJECTS ONLY (no program relationship)
    # -------------------------
    cursor_ces.execute("SELECT * FROM `3ydp`")
    ces_project_rows = cursor_ces.fetchall()

    for row in ces_project_rows:
        project = {
            "project": {
                "title_of_project": row.get("title_of_project") or "",
                "description_of_project": row.get("description_of_project") or "",
                "general_objectives": row.get("general_objectives") or "",
                "program_justification": row.get("program_justification") or "",
                "beneficiaries": row.get("beneficiaries") or "",
                "program_plan": row.get("program_plan_text") or ""
            },
            "program": []  # Initialize empty program list
        }
        projects.append(project)
        project_texts.append(
            f"{project['project']['title_of_project']} "
            f"{project['project']['description_of_project']} "
            f"{project['project']['general_objectives']} "
            f"{project['project']['program_justification']} "
            f"{project['project']['beneficiaries']} "
            f"{project['project']['program_plan']}"
        )

    # -------------------------
    # 4. LOAD ces_reports_db - PROGRAMS ONLY (standalone)
    # -------------------------
    cursor_ces.execute("SELECT * FROM `3ydp_programs`")
    ces_program_rows = cursor_ces.fetchall()

    # Create program plans list from ces_reports_db
    ces_program_plans = []
    for prog in ces_program_rows:
        program = {
            "program": prog.get("program") or "",
            "milestones": prog.get("milestones") or "",
            "objectives": prog.get("objectives") or "",
            "strategies": prog.get("strategies") or "",
            "persons_agencies_involved": prog.get("persons_agencies_involved") or "",
            "resources_needed": prog.get("resources_needed") or "",
            "budget": float(prog.get("budget") or 0),
            "time_frame": prog.get("time_frame") or ""
        }
        ces_program_plans.append(program)

    # -------------------------
    # 5. COMBINE ALL PROGRAM PLANS
    # -------------------------
    all_program_plans = synth_program_plans + ces_program_plans

    # -------------------------
    # 6. ASSIGN PROGRAMS TO PROJECTS (evenly distribute)
    # -------------------------
    if projects and all_program_plans:
        # Distribute programs evenly across all projects
        for i, project in enumerate(projects):
            # Calculate which programs to assign to this project
            # This ensures each project gets a fair share of programs
            programs_per_project = max(1, len(all_program_plans) // len(projects))
            start_idx = (i * programs_per_project) % len(all_program_plans)
            end_idx = start_idx + programs_per_project
            
            # Handle wrapping around the end of the list
            if end_idx <= len(all_program_plans):
                project["program"] = all_program_plans[start_idx:end_idx]
            else:
                # Wrap around to the beginning
                project["program"] = all_program_plans[start_idx:] + all_program_plans[:end_idx - len(all_program_plans)]

    return projects

# Load recommendations once at startup
STORED_RECS = load_recommendations()

# --------------------------------
# AI RECOMMENDATION LOGIC
# --------------------------------
def get_ai_recommendations(user_text, user_id="default"):
    if not user_text.strip():
        choices = random.sample(range(len(STORED_RECS)), min(3, len(STORED_RECS)))
        for i in choices:
            user_history[user_id].add(i)
            usage_counter[i] += 1
        return [STORED_RECS[i] for i in choices]

    expanded = expand_query(user_text)
    user_embedding = model.encode(
        expanded,
        convert_to_tensor=True,
        normalize_embeddings=True
    )

    scores = []
    for rec in STORED_RECS:
        proj_text = f"{rec['project']['title_of_project']} {rec['project']['description_of_project']} {rec['project']['general_objectives']} {rec['project'].get('program_justification','')} {rec['project'].get('beneficiaries','')} {rec['project'].get('program_plan','')}"
        proj_emb = model.encode(proj_text, convert_to_tensor=True, normalize_embeddings=True)
        score = torch.matmul(proj_emb, user_embedding)
        scores.append(score.item())

    top_scores, top_indices = torch.topk(torch.tensor(scores), k=min(15, len(scores)))

    results = []
    threshold = 0.35
    for score, idx in zip(top_scores, top_indices):
        idx = int(idx)
        if idx in user_history[user_id]:
            continue
        if score < threshold:
            continue
        adjusted_score = score - (usage_counter[idx] * 0.05)
        if adjusted_score < threshold:
            continue

        results.append(STORED_RECS[idx])
        user_history[user_id].add(idx)
        usage_counter[idx] += 1

        if len(results) == 3:
            break

    if not results:
        unseen = [i for i in range(len(STORED_RECS)) if i not in user_history[user_id]]
        picks = random.sample(unseen, min(3, len(unseen))) if unseen else random.sample(range(len(STORED_RECS)), min(3, len(STORED_RECS)))
        results = [STORED_RECS[i] for i in picks]
        for i in picks:
            user_history[user_id].add(i)
            usage_counter[i] += 1

    return results

# --------------------------------
# API ENDPOINT
# --------------------------------
@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.json
    user_text = data.get("text", "")
    user_id = data.get("user_id", "default")
    results = get_ai_recommendations(user_text, user_id)
    return jsonify({"recommendations": results})

# --------------------------------
# RUN SERVER
# --------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)