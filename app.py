from flask import Flask, render_template, request, jsonify
import json
import random
from collections import defaultdict
from flask_cors import CORS 
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load podcast data from JSON file
def load_podcast_data():
    try:
        with open('podcast_data.json', 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        # Return sample data if file not found
        return generate_sample_podcast_data()

def generate_sample_podcast_data():
    """Generate sample podcast data for demonstration purposes"""
    categories = [
    "True Crime", "Comedy", "News", "Politics", "Science", 
      "Technology", "Business", "Health", "Self-Improvement", 
      "History", "Sports", "Entertainment", "Music", "Fiction", 
      "Education", "Travel", "Arts", "Food", "Gaming", "Philosophy",
      "Psychology", "Society", "Culture", "Writing", "Sleep",
      "Security", "Mindfulness", "Stories", "Personal", "Reviews" ,
      "Football", "Finance", "Analysis", "Entrepreneurship", "Trivia" , "anime"
    ]
    
    # Sample podcast data
    podcasts = [
        {
            "id": 1,
            "title": "Serial",
            "host": "Sarah Koenig",
            "description": "Investigative journalism that unfolds one story over multiple episodes.",
            "categories": ["True Crime", "Journalism"],
            "avg_episode_length": 45,
            "image_url": "/static/images/podcasts/serial.jpg",
            "popularity": 9.2,
            "spotify_url": "https://open.spotify.com/show/5PZ2BvZY1FpcObzxGKDSYG"
        },
        {
            "id": 2,
            "title": "This American Life",
            "host": "Ira Glass",
            "description": "Weekly public radio program and podcast featuring journalism, essays, memoirs, field recordings, short fiction, and more.",
            "categories": ["Journalism", "Culture", "Stories"],
            "avg_episode_length": 60,
            "image_url": "/static/images/podcasts/this_american_life.jpg",
            "popularity": 9.0,
            "spotify_url": "https://open.spotify.com/show/2EYhgRHH3WzMKnrMXnYXze"
        },
        {
            "id": 3,
            "title": "Stuff You Should Know",
            "host": "Josh Clark and Chuck Bryant",
            "description": "Educates listeners on a wide variety of topics, often using popular culture as a reference.",
            "categories": ["Education", "Science", "History"],
            "avg_episode_length": 50,
            "image_url": "/static/images/podcasts/sysk.jpg",
            "popularity": 8.8,
            "spotify_url": "https://open.spotify.com/show/0ofXAdFIQQRsCYj9754UFx"
        },
        {
            "id": 4,
            "title": "Hardcore History",
            "host": "Dan Carlin",
            "description": "In-depth historical discussions that examine events from multiple perspectives.",
            "categories": ["History", "Education"],
            "avg_episode_length": 180,
            "image_url": "/static/images/podcasts/hardcore_history.jpg",
            "popularity": 9.1,
            "spotify_url": "https://open.spotify.com/show/72qiPaoDRf8HkGKEChvG5q"
        },
        {
            "id": 5,
            "title": "The Joe Rogan Experience",
            "host": "Joe Rogan",
            "description": "Long-form conversations with guests from various backgrounds.",
            "categories": ["Comedy", "Interview", "Culture"],
            "avg_episode_length": 180,
            "image_url": "/static/images/podcasts/jre.jpg",
            "popularity": 9.5,
            "spotify_url": "https://open.spotify.com/show/4rOoJ6Egrf8K2IrywzwOMk"
        },
        {
            "id": 6,
            "title": "Radiolab",
            "host": "Jad Abumrad and Robert Krulwich",
            "description": "Investigates a strange world through science, philosophy, and human experience.",
            "categories": ["Science", "Philosophy", "Stories"],
            "avg_episode_length": 65,
            "image_url": "/static/images/podcasts/radiolab.jpg",
            "popularity": 8.9,
            "spotify_url": "https://open.spotify.com/show/2hmkzUtix0qTqT4HHMkGN5"
        },
        {
            "id": 7,
            "title": "99% Invisible",
            "host": "Roman Mars",
            "description": "Explores the process and power of design and architecture in our everyday lives.",
            "categories": ["Design", "Architecture", "Culture"],
            "avg_episode_length": 40,
            "image_url": "/static/images/podcasts/99invisible.jpg",
            "popularity": 8.7,
            "spotify_url": "https://open.spotify.com/show/2VRS1IJCTn2Nlkg33ZVfkM"
        },
        {
            "id": 8,
            "title": "Planet Money",
            "host": "NPR",
            "description": "Explains complex economic issues in an entertaining and accessible way.",
            "categories": ["Business", "Economics", "Education"],
            "avg_episode_length": 25,
            "image_url": "/static/images/podcasts/planet_money.jpg",
            "popularity": 8.6,
            "spotify_url": "https://open.spotify.com/show/4FYpq3lSeQMAhqNI81O0Cn"
        },
        {
            "id": 9,
            "title": "The Daily",
            "host": "Michael Barbaro",
            "description": "Daily news podcast from The New York Times.",
            "categories": ["News", "Politics", "Current Events"],
            "avg_episode_length": 25,
            "image_url": "/static/images/podcasts/the_daily.jpg",
            "popularity": 9.3,
            "spotify_url": "https://open.spotify.com/show/3IM0lmZxpFAY7CwMuv9H4g"
        },
        {
            "id": 10,
            "title": "Freakonomics Radio",
            "host": "Stephen J. Dubner",
            "description": "Explores the hidden side of everything, with a blend of storytelling and entertainment along with statistics and science.",
            "categories": ["Economics", "Science", "Society"],
            "avg_episode_length": 45,
            "image_url": "/static/images/podcasts/freakonomics.jpg",
            "popularity": 8.8,
            "spotify_url": "https://open.spotify.com/show/6z4NLXyHPga1UmSJsPK7G1"
        },
        {
            "id": 11,
            "title": "Reply All",
            "host": "PJ Vogt and Alex Goldman",
            "description": "A podcast about the internet and modern life, featuring stories about how people shape the internet and how the internet shapes people.",
            "categories": ["Technology", "Internet Culture", "Stories"],
            "avg_episode_length": 50,
            "image_url": "/static/images/podcasts/reply_all.jpg",
            "popularity": 8.9,
            "spotify_url": "https://open.spotify.com/show/7gozmLqbcbr6PScMjc0Zl4"
        },
        {
            "id": 12,
            "title": "How I Built This",
            "host": "Guy Raz",
            "description": "Explores the stories behind some of the world's best known companies and the movements they built.",
            "categories": ["Business", "Entrepreneurship", "Interviews"],
            "avg_episode_length": 60,
            "image_url": "/static/images/podcasts/how_i_built_this.jpg",
            "popularity": 8.7,
            "spotify_url": "https://open.spotify.com/show/6E709HRH7XaiZrMfgtNCun"
        },
        {
            "id": 13,
            "title": "Crime Junkie",
            "host": "Ashley Flowers",
            "description": "Weekly true crime podcast dedicated to giving you a fix of true crime stories.",
            "categories": ["True Crime", "Mystery"],
            "avg_episode_length": 40,
            "image_url": "/static/images/podcasts/crime_junkie.jpg",
            "popularity": 9.0,
            "spotify_url": "https://open.spotify.com/show/3DgfoleqaW61T2amZQKINx"
        },
        {
            "id": 14,
            "title": "The Moth",
            "host": "Various",
            "description": "True stories told live without notes.",
            "categories": ["Stories", "Personal", "Culture"],
            "avg_episode_length": 55,
            "image_url": "/static/images/podcasts/the_moth.jpg",
            "popularity": 8.5,
            "spotify_url": "https://open.spotify.com/show/1LUPlH0nKHJQ6CJ9tZafEK"
        },
        {
            "id": 15,
            "title": "TED Talks Daily",
            "host": "Various",
            "description": "Thought-provoking ideas on every subject imaginable, from artificial intelligence to zoology.",
            "categories": ["Education", "Science", "Technology", "Culture"],
            "avg_episode_length": 15,
            "image_url": "/static/images/podcasts/ted_talks.jpg",
            "popularity": 8.6,
            "spotify_url": "https://open.spotify.com/show/4AB6ZKpvWpuVQQCw8nZeCI"
        }
    ]
    
    # Generate more podcasts to have a good dataset
    for i in range(16, 51):
        # Randomly select 1-3 categories
        num_categories = random.randint(1, 3)
        podcast_categories = random.sample(categories, num_categories)
        
        # Generate a podcast
        podcast = {
            "id": i,
            "title": f"Generated Podcast {i}",
            "host": f"Host {i}",
            "description": f"This is an automatically generated podcast sample #{i} for demonstration purposes.",
            "categories": podcast_categories,
            "avg_episode_length": random.randint(15, 180),
            "image_url": f"/static/images/podcasts/generic{i % 5 + 1}.jpg",
            "popularity": round(random.uniform(7.0, 9.5), 1),
            "spotify_url": "#"
        }
        podcasts.append(podcast)
    
    return {"podcasts": podcasts, "categories": categories}

# Load podcast data
podcast_data = load_podcast_data()
podcasts = podcast_data["podcasts"]
categories = podcast_data["categories"]

# Create category indices for faster lookups
category_index = defaultdict(list)
for podcast in podcasts:
    for category in podcast["categories"]:
        category_index[category].append(podcast)

@app.route('/')
def index():
    return render_template('index.html', categories=categories)

@app.route('/api/podcasts')
def get_podcasts():
    """API endpoint to get all podcasts"""
    return jsonify(podcasts)

@app.route('/api/categories')
def get_categories():
    """API endpoint to get all categories"""
    return jsonify(categories)

@app.route('/api/recommend', methods=['POST'])
def recommend_podcasts():
    """API endpoint for podcast recommendations based on user input"""
    data = request.json
    user_interests = data.get('interests', [])
    duration_preference = data.get('duration', 'any')
    popularity_min = data.get('popularity_min', 0)
    
    # Filter podcasts based on user preferences
    recommended = []
    for podcast in podcasts:
        # Check if podcast matches any user interest/category
        categories_match = any(interest in podcast["categories"] for interest in user_interests)
        
        # Apply duration filter if specified
        duration_match = True
        if duration_preference == 'short':
            duration_match = podcast["avg_episode_length"] <= 30
        elif duration_preference == 'medium':
            duration_match = 30 < podcast["avg_episode_length"] <= 60
        elif duration_preference == 'long':
            duration_match = podcast["avg_episode_length"] > 60
        
        # Apply popularity filter
        popularity_match = podcast["popularity"] >= popularity_min
        
        if categories_match and duration_match and popularity_match:
            recommended.append(podcast)
    
    # Sort by popularity (highest first)
    recommended.sort(key=lambda x: x["popularity"], reverse=True)
    
    # Limit to 10 recommendations
    return jsonify(recommended[:10])

@app.route('/api/chat', methods=['POST'])
def chatbot_response():
    """API endpoint for chatbot interaction"""
    data = request.json
    user_message = data.get('message', '').lower()
    
    # Import regex if not already imported at the top of your file
    import re
    
    # Expanded keyword extraction for interests
    keywords = {
        "crime": ["crime", "murder", "detective", "mystery", "investigation"],
        "comedy": ["comedy", "funny", "humor", "laugh", "comedic"],
        "news": ["news", "current events", "politics", "world", "daily"],
        "science": ["science", "scientific", "research", "discovery"],
        "technology": ["tech", "technology", "coding", "programming", "computers"],
        "business": ["business", "entrepreneurship", "startup", "finance", "money"],
        "health": ["health", "wellness", "fitness", "medical", "medicine"],
        "history": ["history", "historical", "past", "ancient"],
        "education": ["education", "learning", "educational", "academic"],
        "stories": ["stories", "storytelling", "narrative", "tale"],
        "self-improvement": ["self-improvement", "self improvement", "self help", "personal growth", "development"],
        "sports": ["sports", "athletic", "games", "competition", "athletes"],
        "entertainment": ["entertainment", "shows", "celebrities", "hollywood"],
        "music": ["music", "musical", "songs", "artists", "bands", "albums"],
        "fiction": ["fiction", "novels", "fantasy", "sci-fi", "literary"],
        "travel": ["travel", "tourism", "adventures", "destinations", "journey"],
        "arts": ["arts", "artistic", "creativity", "painting", "sculpture"],
        "food": ["food", "cooking", "cuisine", "recipes", "culinary", "chef"],
        "gaming": ["gaming", "games", "video games", "esports", "gamers"],
        "philosophy": ["philosophy", "philosophical", "ethics", "meaning", "existential"],
        "psychology": ["psychology", "psychological", "mind", "behavior", "mental"],
        "society": ["society", "social", "community", "civilization", "cultural"],
        "culture": ["culture", "cultural", "traditions", "heritage", "customs"],
        "writing": ["writing", "writers", "authors", "literature", "books"],
        "mindfulness": ["mindfulness", "meditation", "zen", "awareness", "presence"],
        "sleep": ["sleep", "insomnia", "dreams", "rest", "bedtime"],
        "security": ["security", "cybersecurity", "protection", "safety", "privacy"],
        "personal": ["personal", "individual", "private", "intimate", "life stories"],
        "reviews": ["reviews", "critiques", "analysis", "opinions", "ratings"],
        "football": ["football", "soccer", "nfl", "sports", "athletes"],
        "analysis": ["analysis", "insights", "deep dive", "examination", "breakdown"],
        "trivia": ["trivia", "facts", "knowledge", "quiz", "interesting" ,"anime" , "AOT" , "Naruto"]
    }
    
    # Extract duration preferences with improved pattern matching
    duration_pref = "any"
    max_minutes = None
    
    # Check for "under X minutes" or "less than X minutes" patterns
    under_pattern = r'under\s+(\d+)\s*(?:min|minutes?)?|less\s+than\s+(\d+)\s*(?:min|minutes?)?'
    under_match = re.search(under_pattern, user_message)
    
    if under_match:
        # Get the number value from whichever group matched
        minutes = int(under_match.group(1) or under_match.group(2))
        max_minutes = minutes  # Store the actual number for precise filtering
        
        if minutes <= 30:
            duration_pref = "short"
        elif minutes <= 60:
            duration_pref = "medium"
        else:
            duration_pref = "long"  # For "under 120 minutes" etc.
    
    # Check for "over X minutes" or "more than X minutes" patterns
    elif re.search(r'over\s+(\d+)|more\s+than\s+(\d+)', user_message):
        duration_pref = "long"
    
    # Simple keyword matching as fallback
    elif any(word in user_message.split() for word in ["short", "brief", "quick"]):
        duration_pref = "short"
    elif any(word in user_message.split() for word in ["medium", "moderate", "average"]):
        duration_pref = "medium"
    elif any(word in user_message.split() for word in ["long", "lengthy", "detailed", "in-depth"]):
        duration_pref = "long"
    
    # Extract categories from message
    detected_categories = []
    for category, terms in keywords.items():
        if any(term in user_message for term in terms):
            detected_categories.append(category)
    
    # Extract specific category names from user message
    # This handles cases where the user mentions a category by name that's not in our keywords list
    all_category_names = [cat.lower() for cat in categories]
    for category in all_category_names:
        if category.lower() in user_message and category not in detected_categories:
            detected_categories.append(category)
    
    # If no categories detected, provide a helpful response including the user's query
    if not detected_categories:
        # First try to extract words after "about", "on", "recommend", etc.
        topic_match = re.search(r'(?:about|on|for|recommend|suggest)\s+(\w+)', user_message)
        
        # If nothing found but the message is short, it might be just the topic
        if not topic_match and len(user_message.split()) <= 3:
            # Use the whole message as the potential topic if it's just a word or two
            potential_topic = user_message.strip()
        else:
            potential_topic = topic_match.group(1) if topic_match else None
        
        # Check if asking for help or general recommendation
        if any(word in user_message for word in ["recommend", "suggestion", "popular", "best"]):
            # Return top 5 most popular podcasts
            top_podcasts = sorted(podcasts, key=lambda x: x["popularity"], reverse=True)[:5]
            
            if potential_topic:
                message = f"I couldn't find any podcasts about '{potential_topic}' in our database. Here are some of our most popular podcasts you might enjoy instead:"
            else:
                message = "Here are some of our most popular podcasts you might enjoy:"
                
            return jsonify({
                "message": message,
                "recommendations": top_podcasts,
                "detected_interests": []
            })
        else:
            if potential_topic:
                message = f"I don't have information about '{potential_topic}'. I'd be happy to recommend some podcasts! What topics are you interested in? For example, 'true crime', 'comedy', 'news', 'science', etc."
            else:
                message = "I don't understand what type of podcasts you're looking for. I'd be happy to recommend some podcasts! What topics are you interested in? For example, 'true crime', 'comedy', 'news', 'science', etc."
            
            return jsonify({
                "message": message,
                "recommendations": [],
                "detected_interests": []
            })
    
    # Find matching podcasts
    matches = []
    for category in detected_categories:
        # Convert category to string format (some might be numbers or other types)
        category_str = str(category).lower()
        
        # Add podcasts from matching categories (case-insensitive matching)
        for podcast in podcasts:
            podcast_categories_lower = [cat.lower() for cat in podcast["categories"]]
            
            # Check if category matches (case-insensitive)
            if category_str in podcast_categories_lower and podcast not in matches:
                matches.append(podcast)
            # Also try matching with title-cased version
            elif category_str.title() in podcast["categories"] and podcast not in matches:
                matches.append(podcast)
    
    # Apply duration filter
    filtered_matches = []
    
    # If we have a specific max minutes value from "under X minutes", use that directly
    if max_minutes is not None:
        for podcast in matches:
            if podcast["avg_episode_length"] <= max_minutes:
                filtered_matches.append(podcast)
    # Otherwise use the duration preference categories
    elif duration_pref != "any":
        for podcast in matches:
            if duration_pref == "short" and podcast["avg_episode_length"] <= 30:
                filtered_matches.append(podcast)
            elif duration_pref == "medium" and 30 < podcast["avg_episode_length"] <= 60:
                filtered_matches.append(podcast)
            elif duration_pref == "long" and podcast["avg_episode_length"] > 60:
                filtered_matches.append(podcast)
    else:
        # No duration filter, use all matches
        filtered_matches = matches
    
    # Sort by popularity and get top 5
    top_matches = sorted(filtered_matches, key=lambda x: x["popularity"], reverse=True)[:5]
    
    # Craft response
    if top_matches:
        response = f"Based on your interest in {', '.join(detected_categories)}"
        
        if max_minutes is not None:
            response += f" and preference for episodes under {max_minutes} minutes"
        elif duration_pref != "any":
            if duration_pref == "short":
                response += " and preference for short episodes (under 30 minutes)"
            elif duration_pref == "medium":
                response += " and preference for medium-length episodes (30-60 minutes)"
            elif duration_pref == "long":
                response += " and preference for longer episodes (over 60 minutes)"
                
        response += ", here are some podcast recommendations:"
    else:
        # If we have categories but no matches after filtering by duration
        if (max_minutes is not None or duration_pref != "any") and len(matches) > 0:
            # Try to recommend without the duration filter
            top_matches = sorted(matches, key=lambda x: x["popularity"], reverse=True)[:5]
            
            duration_desc = ""
            if max_minutes is not None:
                duration_desc = f"under {max_minutes} minutes"
            elif duration_pref == "short":
                duration_desc = "under 30 minutes"
            elif duration_pref == "medium": 
                duration_desc = "between 30-60 minutes"
            elif duration_pref == "long":
                duration_desc = "over 60 minutes"
            
            response = f"I couldn't find podcasts about {', '.join(detected_categories)} with episodes {duration_desc}. Here are some podcasts in those categories regardless of duration:"
        else:
            response = f"I couldn't find podcasts matching your specific criteria. Here are some popular podcasts instead:"
            top_matches = sorted(podcasts, key=lambda x: x["popularity"], reverse=True)[:5]
    
    return jsonify({
        "message": response,
        "recommendations": top_matches,
        "detected_interests": detected_categories
    })

# Add this route to your app.py file

@app.route('/api/search', methods=['POST'])
def search_podcasts():
    """API endpoint for searching podcasts"""
    data = request.json
    query = data.get('query', '').lower()
    search_type = data.get('type', 'podcast')  # Default to podcast search
    
    if not query:
        return jsonify({
            "message": "No search query provided",
            "results": []
        })
    
    # Search functionality for podcasts
    if search_type == 'podcast':
        results = []
        
        for podcast in podcasts:
            # Search in title
            if query in podcast["title"].lower():
                results.append(podcast)
                continue
                
            # Search in host
            if query in podcast["host"].lower():
                results.append(podcast)
                continue
                
            # Search in description
            if query in podcast["description"].lower():
                results.append(podcast)
                continue
                
            # Search in categories
            if any(query in category.lower() for category in podcast["categories"]):
                results.append(podcast)
                continue
        
        # Sort by relevance and popularity
        # For simplicity, just sorting by popularity here
        results.sort(key=lambda x: x["popularity"], reverse=True)
        
        # Limit to 10 results
        results = results[:10]
        
        return jsonify({
            "message": f"Found {len(results)} podcasts matching '{query}'",
            "results": results
        })
    
    # Handle other search types if you expand functionality later
    else:
        return jsonify({
            "message": f"Search type '{search_type}' not supported",
            "results": []
        })

if __name__ == '__main__':

    app.run(debug=True)