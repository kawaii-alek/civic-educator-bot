import os
import subprocess
import random
from datetime import datetime, timedelta

def run_git_commit(message, date):
    # Set env variables for backdating
    env = os.environ.copy()
    env["GIT_AUTHOR_DATE"] = date.isoformat()
    env["GIT_COMMITTER_DATE"] = date.isoformat()
    
    # Create a small change in a dummy file to ensure a unique commit
    with open(".contribution_log", "a") as f:
        f.write(f"Commit on {date.isoformat()}: {message}\n")
    
    subprocess.run(["git", "add", ".contribution_log"], env=env, check=True)
    subprocess.run(["git", "commit", "-m", message], env=env, check=True)

def fill_contributions():
    start_date = datetime(2025, 10, 1, 10, 0, 0)
    end_date = datetime(2025, 11, 30, 22, 0, 0)
    
    messages = [
        "Refactored backend architecture", "Fixed RAG retrieval bug",
        "Improved frontend responsiveness", "Updated constitutional text chapters",
        "Optimized FAISS index performance", "Enhanced system prompts",
        "Added Lucide icons for UI", "Implemented multi-turn conversation memory",
        "Standardized naming conventions", "Cleaned up old script files",
        "Added basic form validation", "Updated README with new structure",
        "Adjusted Tailwind gradients", "Refined institutional aesthetic",
        "Configured Pydantic settings", "Fixed CORS middleware settings",
        "Added descriptive logging", "Indexed new legal data chunks",
        "Optimized embedding generation", "Polished sidebar navigation",
        "Fixed EADDRINUSE error handler", "Updated package dependencies",
        "Implemented expert persona logic", "Enhanced mobile layout",
        "Added legal quote of the day feature", "Refined search query logic"
    ]

    current_date = start_date
    while current_date <= end_date:
        # User requested 8 to 20 commits per day
        num_commits = random.randint(8, 20)
        
        print(f"Generating {num_commits} commits for {current_date.date()}...")
        
        # Distribute commits throughout the day
        hours_to_add = 10 / num_commits # Work within a 10-hour window
        
        day_date = current_date
        for i in range(num_commits):
            msg = random.choice(messages)
            # Add some randomness to the exact time
            commit_time = day_date + timedelta(minutes=random.randint(0, 45))
            run_git_commit(msg, commit_time)
            day_date += timedelta(hours=hours_to_add)
            
        current_date += timedelta(days=1)

if __name__ == "__main__":
    # Ensure ignore log file if needed
    with open(".gitignore", "a") as f:
        pass # placeholder
        
    try:
        fill_contributions()
        print("\nSuccessfully generated the commit history!")
        # Finally commit all the current work as the latest state
        subprocess.run(["git", "add", "."], check=True)
        subprocess.run(["git", "commit", "-m", "Finalizing senior refactor and modernization"], check=True)
    except Exception as e:
        print(f"Error: {e}")
