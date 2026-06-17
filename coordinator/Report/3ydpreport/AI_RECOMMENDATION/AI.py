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
import re
import copy
import threading
from difflib import get_close_matches

app = Flask(__name__)
CORS(app)

# --------------------------------
# LOAD MODEL (Global)
# --------------------------------
print("Loading model...")
model = SentenceTransformer(
    "all-MiniLM-L6-v2",
    revision="c9745ed1d9f207416be6d2e6f8de32d1f16199bf",
    local_files_only=True,
)
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

db_synth = get_db_connection("ces_database")
db_ces = get_db_connection("ces_database")

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
    "education": "education outreach literacy training learning community",
    "school": "education outreach literacy youth training learning community",
    "student": "education outreach literacy training learning community",
    "youth": "young people students community volunteers",
    "literacy": "education outreach literacy youth training learning community",
    "environment": "environment environmental ecology conservation tree planting cleanup sustainability climate coastal marine",
    "environmental": "environment environmental ecology conservation tree planting cleanup sustainability climate coastal marine",
    "coastal": "coastal marine beach mangrove shoreline cleanup environment conservation",
    "marine": "coastal marine beach mangrove shoreline cleanup environment conservation",
    "beach": "coastal marine beach mangrove shoreline cleanup environment conservation",
    "mangrove": "coastal marine beach mangrove shoreline cleanup environment conservation",
    "tree": "environment environmental tree planting cleanup sustainability climate conservation",
    "climate": "environment environmental tree planting cleanup sustainability climate conservation",
    "clean": "cleanup clean-up cleanliness waste environment coastal community",
    "cleanup": "cleanup clean-up cleanliness waste environment coastal community",
    "recycle": "recycle waste segregation environment cleanup sustainability",
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

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "into",
    "is", "of", "on", "or", "the", "to", "with", "program", "project", "month",
    "week", "campaign", "initiative", "activity", "activities", "plan", "plans",
    "community", "barangay", "youth", "volunteer", "volunteers", "residents",
    "promote", "increase", "enhance", "develop", "conduct", "organize", "organized",
    "engage", "practices", "seminar", "seminars", "workshop", "workshops",
    "awareness", "action", "drive", "month", "program", "give", "me", "recommend",
    "recommendation", "recommendations", "suggest", "suggestion", "for", "about",
    "please", "need", "want", "make", "create", "generate"
}

TOKEN_NORMALIZATIONS = {
    "clean": "cleanup",
    "cleaning": "cleanup",
    "cleanups": "cleanup",
    "litter": "cleanup",
    "littering": "cleanup",
    "eco": "environment",
    "ecological": "environment",
    "ecosystem": "environment",
    "ecosystems": "environment",
    "environmental": "environment",
    "conservation": "environment",
    "protect": "environment",
    "protection": "environment",
    "preserve": "environment",
    "preservation": "environment",
    "rehabilitation": "environment",
    "sustainable": "sustainability",
    "renewable": "sustainability",
    "solar": "sustainability",
    "marine": "coastal",
    "beach": "coastal",
    "mangrove": "coastal",
    "fisherfolk": "coastal",
    "trees": "tree",
    "planting": "plant",
    "planted": "plant",
    "polluted": "pollution",
    "pollution": "pollution",
    "arts": "art",
    "artistic": "art",
    "creative": "art",
    "creativity": "art",
    "culture": "art",
    "cultural": "art",
    "multimedia": "media",
    "digital": "media"
}

KNOWN_TOPIC_TOKENS = set(TOKEN_NORMALIZATIONS.values()) | {
    "environment", "coastal", "cleanup", "tree", "plant", "sustainability",
    "climate", "pollution", "waste", "health", "medical", "food", "nutrition",
    "education", "literacy", "disaster", "relief", "senior", "elderly", "pwd",
    "fitness", "recreation", "technology", "ict", "coding", "stem", "financial",
    "entrepreneurship", "art", "media", "journalism", "film", "photo", "photography",
    "video", "design", "music", "dance", "theater", "leadership", "civic",
    "volunteerism", "water", "hygiene", "sanitation", "safety"
}

TOPIC_CATEGORIES = {
    "environment": {
        "environment", "coastal", "cleanup", "tree", "plant", "sustainability",
        "climate", "pollution", "waste"
    },
    "health": {"health", "medical", "nutrition", "fitness", "recreation"},
    "food": {"food", "nutrition"},
    "education": {"education", "literacy", "technology", "ict", "coding", "stem"},
    "arts_media": {
        "art", "media", "journalism", "film", "photo", "photography", "video",
        "design", "music", "dance", "theater"
    },
    "disaster": {"disaster", "relief"},
    "social": {"senior", "elderly", "pwd"},
    "livelihood": {"financial", "entrepreneurship"}
}

CATEGORY_LABELS = {
    "environment": "environment coastal sustainability clean-up conservation",
    "health": "health wellness medical nutrition fitness",
    "food": "food nutrition feeding meals",
    "education": "education ict digital stem coding literacy learning",
    "arts_media": "arts culture digital media creativity design",
    "disaster": "disaster preparedness emergency relief safety",
    "social": "senior citizens elderly social wellness inclusion",
    "livelihood": "financial literacy entrepreneurship livelihood business",
    "leadership": "leadership civic engagement volunteerism governance",
    "water_hygiene": "clean water hygiene sanitation"
}

TOPIC_CATEGORIES.update({
    "leadership": {"leadership", "civic", "volunteerism"},
    "water_hygiene": {"water", "hygiene", "sanitation"}
})

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

def topic_tokens(text: str) -> set:
    tokens = set()
    for token in re.findall(r"[a-z0-9]+", text.lower().replace("-", " ")):
        if len(token) < 3 or token in STOPWORDS:
            continue
        normalized = TOKEN_NORMALIZATIONS.get(token, token)
        if normalized == token and token not in KNOWN_TOPIC_TOKENS:
            close_matches = get_close_matches(token, KNOWN_TOPIC_TOKENS, n=1, cutoff=0.82)
            if close_matches:
                normalized = close_matches[0]
        tokens.add(normalized)
    return tokens

def topic_categories(tokens: set) -> set:
    return {
        category
        for category, category_tokens in TOPIC_CATEGORIES.items()
        if tokens & category_tokens
    }

def infer_project_categories(project) -> list:
    title_tokens = topic_tokens(project.get("title_of_project", ""))
    full_tokens = topic_tokens(build_project_text(project))
    scores = {}

    for category, category_tokens in TOPIC_CATEGORIES.items():
        title_score = len(title_tokens & category_tokens) * 3
        full_score = len(full_tokens & category_tokens)
        score = title_score + full_score
        if score > 0:
            scores[category] = score

    if not scores:
        return []

    max_score = max(scores.values())
    return [
        category
        for category, score in sorted(scores.items(), key=lambda item: (-item[1], item[0]))
        if score >= max_score * 0.5
    ][:3]

def build_project_text(project):
    return " ".join([
        project.get("title_of_project", ""),
        project.get("description_of_project", ""),
        project.get("general_objectives", ""),
        project.get("program_justification", ""),
        project.get("beneficiaries", ""),
        project.get("program_plan", "")
    ])

def build_program_text(program):
    return " ".join([
        program.get("program", ""),
        program.get("objectives", ""),
        program.get("strategies", ""),
        program.get("persons_agencies_involved", ""),
        program.get("resources_needed", ""),
        program.get("means_of_verification", ""),
        program.get("time_frame", "")
    ])

def build_recommendation_text(recommendation):
    project_text = build_project_text(recommendation["project"])
    title = recommendation["project"].get("title_of_project", "")
    return " ".join([
        title,
        title,
        project_text,
        project_text,
        " ".join(build_program_text(program) for program in recommendation.get("program", []))
    ])

def lexical_match_score(query_tokens: set, title_tokens: set, record_tokens: set) -> float:
    if not query_tokens:
        return 0.0

    matched_tokens = query_tokens & record_tokens
    title_matches = query_tokens & title_tokens
    coverage = len(matched_tokens) / len(query_tokens)
    title_coverage = len(title_matches) / len(query_tokens)
    precision = len(matched_tokens) / max(len(record_tokens), 1)

    return min((coverage * 0.55) + (title_coverage * 0.35) + (precision * 0.10), 1.0)

def clean_search_query(query: str) -> str:
    words = []
    for token in re.findall(r"[a-z0-9]+", query.lower().replace("-", " ")):
        if token in STOPWORDS:
            continue
        words.append(token)

    normalized_topics = sorted(topic_tokens(query))
    cleaned = " ".join(words).strip()
    topic_text = " ".join(normalized_topics)

    categories = topic_categories(set(normalized_topics))
    category_text = " ".join(CATEGORY_LABELS.get(category, category) for category in sorted(categories))

    return " ".join(part for part in [cleaned, topic_text, category_text] if part).strip() or query.strip()

# --------------------------------
# PRE-COMPUTED EMBEDDINGS CACHE
# --------------------------------
class RecommendationCache:
    def __init__(self):
        self.embeddings = None
        self.project_embeddings = None
        self.recommendations = None
        self.project_texts = None
        self.search_texts = None
        self.program_plans = []
        self.program_embeddings = None
        self.project_count = 0
        self.program_count = 0
        self.raw_project_rows_loaded = 0
        self.raw_program_rows_loaded = 0
        self.category_counts = {}
        self.ready = False
    
    def load_and_cache(self):
        """Load all recommendations and pre-compute their embeddings"""
        print("Loading recommendations and computing embeddings...")
        start_time = time.time()
        
        self.recommendations = self.load_recommendations()
        self.project_count = len(self.recommendations)
        self.program_count = sum(len(rec.get("program", [])) for rec in self.recommendations)
        self.category_counts = dict(sorted({
            category: sum(1 for rec in self.recommendations if category in rec.get("_categories", []))
            for category in TOPIC_CATEGORIES
        }.items()))
        self.project_texts = []
        self.search_texts = []
        
        for rec in self.recommendations:
            text = build_recommendation_text(rec)
            self.project_texts.append(text)
            title = rec["project"].get("title_of_project", "")
            project_text = build_project_text(rec["project"])
            category_text = " ".join(CATEGORY_LABELS.get(category, category) for category in rec.get("_categories", []))
            self.search_texts.append(f"{title} {title} {title} {project_text} {project_text} {category_text}")
        
        # Full recommendation embeddings include selected program rows.
        self.embeddings = model.encode(
            self.project_texts,
            convert_to_tensor=True,
            normalize_embeddings=True,
            batch_size=32,  # Process in batches for better performance
            show_progress_bar=True
        )

        # Searchbar recommendations should be driven by project fields first.
        self.project_embeddings = model.encode(
            self.search_texts,
            convert_to_tensor=True,
            normalize_embeddings=True,
            batch_size=32,
            show_progress_bar=True
        )
        
        print(f"Loaded {len(self.recommendations)} recommendations in {time.time() - start_time:.2f} seconds")
        self.ready = True
    
    def load_recommendations(self):
        """Load all recommendations (same as before)"""
        # Load synthetic projects
        cursor_synth = db_synth.cursor(dictionary=True)
        cursor_synth.execute("""
            SELECT 
                `Title of the Project/Program`,
                `Description of the Project/Program`,
                `General Objectives`,
                `Program Justification`,
                `Beneficiaries`,
                `program_plan`
            FROM synthetic_projects
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
                "program": [],
                "_source": "synthetic"
            }
            projects.append(project)
        
        # Load synthetic program plans
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
            FROM synthetic_program_plans
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
                "time_frame": row["Time Frame"] or "",
                "_source": "synthetic"
            }
            synth_program_plans.append(program)
        
        # Load report projects
        cursor_ces = db_ces.cursor(dictionary=True)
        cursor_ces.execute("SELECT * FROM `report_3ydp`")
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
                "program": [],
                "_source": "report",
                "_report_id": row.get("id")
            }
            projects.append(project)
        
        # Load report programs
        cursor_ces.execute("SELECT * FROM `report_3ydp_programs`")
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
                "time_frame": prog.get("time_frame") or "",
                "_source": "report",
                "_report_id": prog.get("report_id")
            }
            ces_program_plans.append(program)

        all_program_plans = synth_program_plans + ces_program_plans
        self.program_plans = all_program_plans
        self.raw_project_rows_loaded = len(project_rows) + len(ces_project_rows)
        self.raw_program_rows_loaded = len(all_program_plans)

        self.program_embeddings = model.encode(
            [expand_query(build_program_text(program)) for program in all_program_plans],
            convert_to_tensor=True,
            normalize_embeddings=True,
            batch_size=32
        ) if all_program_plans else None

        program_match_metadata = []
        for program in all_program_plans:
            name = program.get("program", "").strip()
            name_tokens = topic_tokens(name)
            all_tokens = topic_tokens(build_program_text(program))
            program_match_metadata.append({
                "name_lower": name.lower(),
                "name_tokens": name_tokens,
                "all_tokens": all_tokens,
                "categories": topic_categories(name_tokens | all_tokens),
            })

        def best_matching_programs(project, project_embedding, programs, program_embeddings, limit=3):
            if not programs or program_embeddings is None:
                return []

            project_title = project["project"].get("title_of_project", "").strip()
            title_topic_tokens = topic_tokens(project_title)
            title_categories = topic_categories(title_topic_tokens)
            project_title_lower = project_title.lower()
            similarities = torch.matmul(program_embeddings, project_embedding).cpu().numpy()

            scored_programs = []
            for index, (program, metadata) in enumerate(zip(programs, program_match_metadata)):
                title_name_overlap = len(title_topic_tokens & metadata["name_tokens"])
                title_all_overlap = len(title_topic_tokens & metadata["all_tokens"])

                if title_categories and not (title_categories & metadata["categories"]):
                    continue

                score = float(similarities[index])
                score += min(title_name_overlap * 0.18, 0.54)
                score += min(title_all_overlap * 0.06, 0.24)

                if project_title_lower and metadata["name_lower"] and (
                    project_title_lower in metadata["name_lower"] or metadata["name_lower"] in project_title_lower
                ):
                    score += 0.40

                if program.get("_report_id") and program.get("_report_id") == project.get("_report_id"):
                    score += 0.20

                scored_programs.append((score, index, program))

            scored_programs.sort(key=lambda item: (-item[0], item[1]))
            return [program for score, _, program in scored_programs[:limit] if score >= 0.30]

        project_match_embeddings = model.encode(
            [expand_query(build_project_text(project["project"])) for project in projects],
            convert_to_tensor=True,
            normalize_embeddings=True,
            batch_size=32,
        ) if projects else []

        for project, project_embedding in zip(projects, project_match_embeddings):
            project["_categories"] = infer_project_categories(project["project"])
            project["program"] = best_matching_programs(
                project,
                project_embedding,
                all_program_plans,
                self.program_embeddings,
            )

            project.pop("_source", None)
            project.pop("_report_id", None)
            for program in project["program"]:
                program.pop("_source", None)
                program.pop("_report_id", None)
        
        cursor_synth.close()
        cursor_ces.close()
        return projects

# Initialize cache at startup
cache = RecommendationCache()

# --------------------------------
# AI RECOMMENDATION LOGIC (Optimized)
# --------------------------------
@lru_cache(maxsize=128)
def get_user_embedding(query: str, clean_query: bool = True):
    """Cache user embeddings for repeated queries"""
    expanded = clean_search_query(query) if clean_query else query.strip()
    return model.encode(
        expanded,
        convert_to_tensor=True,
        normalize_embeddings=True
    )

def search_matching_programs(query: str, project, limit=3):
    if not query.strip() or not cache.program_plans or cache.program_embeddings is None:
        return project.get("program", [])

    query_tokens = topic_tokens(query)
    query_categories = topic_categories(query_tokens)
    project_tokens = topic_tokens(build_project_text(project))
    combined_query = " ".join([query, build_project_text(project)])
    query_embedding = get_user_embedding(combined_query, clean_query=True)
    cosine_scores = torch.matmul(cache.program_embeddings, query_embedding).cpu().numpy()

    scored_programs = []
    for index, program in enumerate(cache.program_plans):
        program_text = build_program_text(program)
        program_tokens = topic_tokens(program_text)
        program_categories = topic_categories(program_tokens)

        if query_categories and program_categories and not (query_categories & program_categories):
            continue

        query_lexical = lexical_match_score(query_tokens, topic_tokens(program.get("program", "")), program_tokens)
        project_overlap = len(project_tokens & program_tokens) / max(len(project_tokens), 1)
        score = (max(float(cosine_scores[index]), 0.0) * 0.50) + (query_lexical * 0.35) + (project_overlap * 0.15)

        scored_programs.append((score, index, program))

    scored_programs.sort(key=lambda item: (-item[0], item[1]))
    return [copy.deepcopy(program) for score, _, program in scored_programs[:limit] if score >= 0.15]

def get_ai_recommendations(user_text, user_id="default", source="form"):
    if not user_text.strip():
        choices = random.sample(range(len(cache.recommendations)), min(3, len(cache.recommendations)))
        for i in choices:
            user_history[user_id].add(i)
            usage_counter[i] += 1
        return [cache.recommendations[i] for i in choices]
    
    query = user_text.strip()
    cleaned_query = clean_search_query(query)
    query_lower = query.lower()
    query_tokens = topic_tokens(query)
    query_categories = topic_categories(query_tokens)
    is_search_bar = source == "search"

    # For search-bar requests, embed exactly what the user typed and rank with
    # cosine similarity against project search embeddings. Form-context requests
    # still use cleaned topic text so long form fields do not dilute the intent.
    user_embedding = get_user_embedding(query if is_search_bar else cleaned_query, clean_query=not is_search_bar)
    
    # Searchbar ranking uses project-only embeddings so program rows do not blur the project match.
    cosine_scores = torch.matmul(cache.project_embeddings, user_embedding).cpu().numpy()
    similarities = np.zeros_like(cosine_scores, dtype=float)

    for idx, rec in enumerate(cache.recommendations):
        project = rec["project"]
        title = project.get("title_of_project", "")
        title_lower = title.lower()
        rec_text = cache.search_texts[idx]
        rec_text_lower = rec_text.lower()
        title_tokens = topic_tokens(title)
        rec_tokens = topic_tokens(rec_text)
        rec_categories = set(rec.get("_categories", [])) | topic_categories(rec_tokens)
        overlap_count = len(query_tokens & rec_tokens)
        lexical_score = lexical_match_score(query_tokens, title_tokens, rec_tokens)

        if is_search_bar:
            similarities[idx] = (max(float(cosine_scores[idx]), 0.0) * 0.55) + (lexical_score * 0.45)
        else:
            similarities[idx] = float(cosine_scores[idx])

        similarities[idx] += min(overlap_count * (0.02 if is_search_bar else 0.04), 0.10 if is_search_bar else 0.20)

        if query_lower and title_lower:
            if query_lower == title_lower:
                similarities[idx] += 0.35
            elif query_lower in title_lower or title_lower in query_lower:
                similarities[idx] += 0.20
            elif query_lower in rec_text_lower:
                similarities[idx] += 0.10

        title_overlap = len(query_tokens & title_tokens)
        similarities[idx] += min(title_overlap * (0.04 if is_search_bar else 0.08), 0.16 if is_search_bar else 0.32)

        if query_categories and rec_categories:
            if query_categories & rec_categories:
                similarities[idx] += 0.08 if is_search_bar else 0.18
            else:
                similarities[idx] -= 0.80 if is_search_bar else 0.35
        elif is_search_bar and query_tokens and overlap_count == 0:
            similarities[idx] -= 0.25
    
    # For an explicit search, keep results stable and topic-focused.
    # Do not skip or penalize previous matches, because repeated clicks should
    # return the best matches for the same query instead of drifting away.
    ranked_indices = np.argsort(similarities)[::-1]
    category_matched_indices = [
        idx for idx in ranked_indices
        if not query_categories or query_categories & set(cache.recommendations[idx].get("_categories", []))
    ]
    top_indices = category_matched_indices if query_categories else ranked_indices
    
    results = []
    threshold = 0.18 if is_search_bar else (0.05 if query_categories else 0.20)
    
    for idx in top_indices:
        if similarities[idx] < threshold:
            continue
        
        recommendation = copy.deepcopy(cache.recommendations[idx])
        if is_search_bar:
            matching_programs = search_matching_programs(query, recommendation["project"])
            if matching_programs:
                recommendation["program"] = matching_programs
        results.append(recommendation)
        
        if len(results) == 3:
            break
    
    # Fallback to the best available matches if the threshold is too strict.
    # This still follows the search topic instead of returning unrelated random items.
    if not results:
        picks = top_indices[:min(3, len(top_indices))]
        results = []
        for i in picks:
            recommendation = copy.deepcopy(cache.recommendations[i])
            if is_search_bar:
                matching_programs = search_matching_programs(query, recommendation["project"])
                if matching_programs:
                    recommendation["program"] = matching_programs
            results.append(recommendation)
    
    return results

def get_query_debug(user_text):
    query = user_text.strip()
    tokens = topic_tokens(query)
    return {
        "cleaned_query": clean_search_query(query),
        "tokens": sorted(tokens),
        "categories": sorted(topic_categories(tokens))
    }

# --------------------------------
# API ENDPOINT
# --------------------------------
@app.route("/recommend", methods=["POST"])
def recommend():
    if not cache.ready:
        return jsonify({"error": "AI recommendation cache is still loading."}), 503

    data = request.json
    user_text = data.get("text", "")
    user_id = data.get("user_id", "default")
    source = data.get("source", "form")
    
    start_time = time.time()
    results = get_ai_recommendations(user_text, user_id, source)
    elapsed_time = time.time() - start_time
    
    print(f"Recommendation completed in {elapsed_time:.3f} seconds")
    
    return jsonify({
        "recommendations": results,
        "query_debug": get_query_debug(user_text),
        "processing_time": elapsed_time
    })

# --------------------------------
# HEALTH CHECK ENDPOINT
# --------------------------------
@app.route("/health", methods=["GET"])
def health():
    response = jsonify({
        "status": "healthy" if cache.ready else "loading",
        "recommendations_loaded": len(cache.recommendations or []),
        "raw_project_rows_loaded": cache.raw_project_rows_loaded,
        "raw_program_rows_loaded": cache.raw_program_rows_loaded,
        "project_rows_embedded": cache.project_count,
        "matched_program_rows_embedded": cache.program_count,
        "category_counts": cache.category_counts,
        "embeddings_shape": cache.embeddings.shape if cache.embeddings is not None else None,
        "project_search_embeddings_shape": cache.project_embeddings.shape if cache.project_embeddings is not None else None,
        "program_search_embeddings_shape": cache.program_embeddings.shape if cache.program_embeddings is not None else None
    })
    return response, 200 if cache.ready else 503

# --------------------------------
# RUN SERVER
# --------------------------------
if __name__ == "__main__":
    threading.Thread(target=cache.load_and_cache, daemon=True).start()
    app.run(debug=False, port=5000, threaded=True)
