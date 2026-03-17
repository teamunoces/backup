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
# LOAD MODEL ONCE
# --------------------------------
model = SentenceTransformer("all-MiniLM-L6-v2")

# --------------------------------
# DATABASE CONNECTION
# --------------------------------
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="synthetic_db"
)
cursor = db.cursor(dictionary=True)

# --------------------------------
# USER HISTORY (ANTI-REPEAT)
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
# LOAD & EMBED DATABASE
# --------------------------------
def load_recommendations():

    combined_texts = []

    # -------------------------
    # LOAD PROJECTS
    # -------------------------
    cursor.execute("""
        SELECT 
            `Title of the Project/Program`,
            `Description of the Project/Program`,
            `General Objectives`,
            `Program Justification`,
            `Beneficiaries`,
            `program_plan`
        FROM projects
    """)
    project_rows = cursor.fetchall()

    projects = []
    project_texts = []

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
            "program": []
        }
        projects.append(project)

        project_texts.append(
            f"{project['project']['title_of_project']} "
            f"{project['project']['description_of_project']} "
            f"{project['project']['general_objectives']} "
            f"{project['project']['program_justification']}"
        )

    # -------------------------
    # LOAD PROGRAM PLANS
    # -------------------------
    cursor.execute("""
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
    program_rows = cursor.fetchall()

    program_plans = []
    program_texts = []

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
        program_plans.append(program)

        program_texts.append(
            f"{program['program']} "
            f"{program['milestones']} "
            f"{program['objectives']} "
            f"{program['strategies']}"
        )

    # -------------------------
    # CREATE EMBEDDINGS
    # -------------------------
    project_embeddings = model.encode(
        project_texts,
        convert_to_tensor=True,
        normalize_embeddings=True
    )

    program_embeddings = model.encode(
        program_texts,
        convert_to_tensor=True,
        normalize_embeddings=True
    )

    # -------------------------
    # MATCH PROGRAMS TO PROJECTS USING COSINE SIMILARITY
    # -------------------------
    for i, project in enumerate(projects):

        # Compute cosine similarity (dot product of normalized embeddings)
        sim_scores = torch.matmul(program_embeddings, project_embeddings[i])

        # Get top 10 similar programs
        top_scores, top_indices = torch.topk(sim_scores, k=min(10, len(program_plans)))

        seen_programs = set()
        unique_programs = []

        for score, idx in zip(top_scores, top_indices):
            prog = program_plans[idx.item()]
            name = prog["program"]

            # Skip duplicates
            if name in seen_programs:
                continue

            # Only strong matches
            if score < 0.35:
                continue

            seen_programs.add(name)
            unique_programs.append(prog)

            # Limit to max 3 programs per project
            if len(unique_programs) == 3:
                break

        project["program"] = unique_programs

        combined_texts.append(
            f"{project['project']['title_of_project']} "
            f"{project['project']['description_of_project']} "
            f"{project['project']['general_objectives']} "
            f"{project['project']['program_justification']} "
            f"{project['project']['beneficiaries']} "
            f"{project['project']['program_plan']}"
        )

    return projects


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

    # Cosine similarity with stored embeddings
    scores = []
    for rec in STORED_RECS:
        proj_text = f"{rec['project']['title_of_project']} {rec['project']['description_of_project']} {rec['project']['general_objectives']} {rec['project']['program_justification']} {rec['project']['beneficiaries']} {rec['project']['program_plan']}"
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