from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
import mysql.connector
import torch
import random
from collections import defaultdict
import numpy as np
from functools import lru_cache
import time

app = Flask(__name__)
CORS(app)

# --------------------------------
# LOAD MODEL (Global)
# --------------------------------
print("Loading model...")
model = SentenceTransformer("all-MiniLM-L6-v2")
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = model.to(device)
print(f"Model loaded on {device}")

# --------------------------------
# DATABASE CONNECTIONS (with connection pooling)
# --------------------------------
def get_db_connection(db_name):
    """Create database connection with pooling"""
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database=db_name,
        pool_name=f"{db_name}_pool",
        pool_size=5
    )

db_synth = get_db_connection("synthetic_db")
db_ces = get_db_connection("ces_reports_db")

# --------------------------------
# USER HISTORY
# --------------------------------
user_history = defaultdict(set)
usage_counter = defaultdict(int)

# --------------------------------
# QUERY EXPANSION (Optimized)
# --------------------------------
KEYWORDS = {
    "food": "food assistance feeding program nutrition community children families",
    "hungry": "food assistance feeding program nutrition community children families",
    "feeding": "food assistance feeding program nutrition community children families",
    "nutrition": "food assistance feeding program nutrition community children families",
    "meal": "food assistance feeding program nutrition community children families",
    "health": "medical mission healthcare outreach vaccination wellness community",
    "medical": "medical mission healthcare outreach vaccination wellness community",
    "medicine": "medical mission healthcare outreach vaccination wellness community",
    "clinic": "medical mission healthcare outreach vaccination wellness community",
    "doctor": "medical mission healthcare outreach vaccination wellness community",
    "education": "education outreach literacy youth training learning community",
    "school": "education outreach literacy youth training learning community",
    "student": "education outreach literacy youth training learning community",
    "youth": "education outreach literacy youth training learning community",
    "literacy": "education outreach literacy youth training learning community",
    "environment": "environment outreach tree planting cleanup sustainability climate",
    "tree": "environment outreach tree planting cleanup sustainability climate",
    "climate": "environment outreach tree planting cleanup sustainability climate",
    "clean": "environment outreach tree planting cleanup sustainability climate",
    "recycle": "environment outreach tree planting cleanup sustainability climate",
    "disaster": "disaster relief emergency response outreach affected families",
    "relief": "disaster relief emergency response outreach affected families",
    "flood": "disaster relief emergency response outreach affected families",
    "typhoon": "disaster relief emergency response outreach affected families",
    "emergency": "disaster relief emergency response outreach affected families",
    "elderly": "social welfare elderly disabled vulnerable community support",
    "senior": "social welfare elderly disabled vulnerable community support",
    "disabled": "social welfare elderly disabled vulnerable community support",
    "pwd": "social welfare elderly disabled vulnerable community support",
    "poor": "social welfare elderly disabled vulnerable community support",
    "community": "community service volunteer engagement outreach development",
    "volunteer": "community service volunteer engagement outreach development",
    "service": "community service volunteer engagement outreach development",
    "outreach": "community service volunteer engagement outreach development"
}

def expand_query(q: str) -> str:
    q_lower = q.lower()
    expansions = set()
    
    # Check each word in query against keywords
    words = q_lower.split()
    for word in words:
        if word in KEYWORDS:
            expansions.add(KEYWORDS[word])
    
    # Check for phrases
    for keyword, expansion in KEYWORDS.items():
        if keyword in q_lower:
            expansions.add(expansion)
    
    return q + " " + " ".join(expansions) if expansions else q

# --------------------------------
# PRE-COMPUTED EMBEDDINGS CACHE
# --------------------------------
class RecommendationCache:
    def __init__(self):
        self.embeddings = None
        self.recommendations = None
        self.project_texts = None
    
    def load_and_cache(self):
        """Load all recommendations and pre-compute their embeddings"""
        print("Loading recommendations and computing embeddings...")
        start_time = time.time()
        
        self.recommendations = self.load_recommendations()
        self.project_texts = []
        
        for rec in self.recommendations:
            text = f"{rec['project']['title_of_project']} {rec['project']['description_of_project']} {rec['project']['general_objectives']} {rec['project'].get('program_justification','')} {rec['project'].get('beneficiaries','')} {rec['project'].get('program_plan','')}"
            self.project_texts.append(text)
        
        # Batch encode all project texts at once (much faster)
        self.embeddings = model.encode(
            self.project_texts,
            convert_to_tensor=True,
            normalize_embeddings=True,
            batch_size=32,  # Process in batches for better performance
            show_progress_bar=True
        )
        
        print(f"Loaded {len(self.recommendations)} recommendations in {time.time() - start_time:.2f} seconds")
    
    def load_recommendations(self):
        """Load all recommendations (same as before)"""
        combined_texts = []
        stored_recs = []
        
        # Load synthetic_db projects
        cursor_synth = db_synth.cursor(dictionary=True)
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
        
        # Load synthetic_db program plans
        cursor_synth.execute("""
            SELECT 
                `Program`,
                `Objectives`,
                `Strategies`,
                `Persons/Agencies Involved`,
                `Resources Needed`,
                `Budget`,
                `Means_of_Verification`,
                `Time Frame`
            FROM program_plans
        """)
        program_rows = cursor_synth.fetchall()
        
        synth_program_plans = []
        for row in program_rows:
            program = {
                "program": row["Program"] or "",
                "objectives": row["Objectives"] or "",
                "strategies": row["Strategies"] or "",
                "persons_agencies_involved": row["Persons/Agencies Involved"] or "",
                "resources_needed": row["Resources Needed"] or "",
                "budget": float(row["Budget"]) if row["Budget"] else 0,
                "means_of_verification": row["Means_of_Verification"] or "",
                "time_frame": row["Time Frame"] or ""
            }
            synth_program_plans.append(program)
        
        # Load ces_reports_db projects
        cursor_ces = db_ces.cursor(dictionary=True)
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
                "program": []
            }
            projects.append(project)
        
        # Load ces_reports_db programs
        cursor_ces.execute("SELECT * FROM `3ydp_programs`")
        ces_program_rows = cursor_ces.fetchall()
        
        ces_program_plans = []
        for prog in ces_program_rows:
            program = {
                "program": prog.get("program") or "",
                "objectives": prog.get("objectives") or "",
                "strategies": prog.get("strategies") or "",
                "persons_agencies_involved": prog.get("persons_agencies_involved") or "",
                "resources_needed": prog.get("resources_needed") or "",
                "budget": float(prog.get("budget") or 0),
                "means_of_verification": prog.get("means_of_verification") or "",
                "time_frame": prog.get("time_frame") or ""
            }
            ces_program_plans.append(program)
        
        # Combine all program plans
        all_program_plans = synth_program_plans + ces_program_plans
        
        # Assign programs to projects
        if projects and all_program_plans:
            for i, project in enumerate(projects):
                programs_per_project = max(3, len(all_program_plans) // len(projects))
                start_idx = (i * programs_per_project) % len(all_program_plans)
                end_idx = start_idx + programs_per_project
                
                if end_idx <= len(all_program_plans):
                    project["program"] = all_program_plans[start_idx:end_idx]
                else:
                    project["program"] = all_program_plans[start_idx:] + all_program_plans[:end_idx - len(all_program_plans)]
        
        cursor_synth.close()
        cursor_ces.close()
        return projects

# Initialize cache at startup
cache = RecommendationCache()
cache.load_and_cache()

# --------------------------------
# AI RECOMMENDATION LOGIC (Optimized)
# --------------------------------
@lru_cache(maxsize=128)
def get_user_embedding(query: str):
    """Cache user embeddings for repeated queries"""
    expanded = expand_query(query)
    return model.encode(
        expanded,
        convert_to_tensor=True,
        normalize_embeddings=True
    )

def get_ai_recommendations(user_text, user_id="default"):
    if not user_text.strip():
        choices = random.sample(range(len(cache.recommendations)), min(3, len(cache.recommendations)))
        for i in choices:
            user_history[user_id].add(i)
            usage_counter[i] += 1
        return [cache.recommendations[i] for i in choices]
    
    # Get cached user embedding
    user_embedding = get_user_embedding(user_text)
    
    # Compute all similarities at once using matrix multiplication
    # This is much faster than looping through each recommendation
    similarities = torch.matmul(cache.embeddings, user_embedding).cpu().numpy()
    
    # Apply usage penalty
    for idx, count in usage_counter.items():
        if idx < len(similarities):
            similarities[idx] -= count * 0.05
    
    # Get top 15 indices
    top_indices = np.argsort(similarities)[-15:][::-1]
    
    results = []
    threshold = 0.35
    
    for idx in top_indices:
        if idx in user_history[user_id]:
            continue
        if similarities[idx] < threshold:
            continue
        
        results.append(cache.recommendations[idx])
        user_history[user_id].add(idx)
        usage_counter[idx] += 1
        
        if len(results) == 3:
            break
    
    # Fallback to random if not enough results
    if not results:
        unseen = [i for i in range(len(cache.recommendations)) if i not in user_history[user_id]]
        picks = random.sample(unseen, min(3, len(unseen))) if unseen else random.sample(range(len(cache.recommendations)), min(3, len(cache.recommendations)))
        results = [cache.recommendations[i] for i in picks]
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
    
    start_time = time.time()
    results = get_ai_recommendations(user_text, user_id)
    elapsed_time = time.time() - start_time
    
    print(f"Recommendation completed in {elapsed_time:.3f} seconds")
    
    return jsonify({
        "recommendations": results,
        "processing_time": elapsed_time
    })

# --------------------------------
# HEALTH CHECK ENDPOINT
# --------------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "recommendations_loaded": len(cache.recommendations),
        "embeddings_shape": cache.embeddings.shape if cache.embeddings is not None else None
    })

# --------------------------------
# RUN SERVER
# --------------------------------
if __name__ == "__main__":
    app.run(debug=False, port=5000, threaded=True)