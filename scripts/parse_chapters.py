import os
import re
import json

raw_dir = "data/raw"
output_file = "frontend/src/data/chapters.ts"

CHAPTER_FILES = [
    "CHAPTER ONE—SOVEREIGNTY OF THE PEOPLE.txt",
    "CHAPTER TWO—THE REPUBLIC.txt",
    "CHAPTER THREE—CITIZENSHIP.txt",
    "CHAPTER FOUR—THE BILL OF RIGHTS.txt",
    "CHAPTER FIVE—LAND AND ENVIRONMENT.txt",
    "CHAPTER SIX—LEADERSHIP AND INTEGRITY.txt",
    "CHAPTER SEVEN—REPRESENTATION OF THE PEOPLE.txt",
    "CHAPTER EIGHT—THE LEGISLATURE.txt",
    "CHAPTER NINE—THE EXECUTIVE.txt",
    "CHAPTER TEN—JUDICIARY.txt",
    "CHAPTER ELEVEN—DEVOLVED GOVERNMENT.txt",
    "CHAPTER TWELVE—PUBLIC FINANCE.txt",
    "CHAPTER THIRTEEN—THE PUBLIC SERVICE.txt",
    "CHAPTER FOURTEEN—NATIONAL SECURITY.txt",
    "CHAPTER FIFTEEN—COMMISSIONS AND INDEPENDENT OFFICES.txt",
    "CHAPTER SIXTEEN—AMENDMENT OF THIS CONSTITUTION.txt",
    "CHAPTER SEVENTEEN—GENERAL PROVISION.txt",
    "CHAPTER EIGHTEEN—TRANSITIONAL AND CONSEQUENTIAL PROVISIONS.txt",
]

def parse_file(filename):
    filepath = os.path.join(raw_dir, filename)
    if not os.path.exists(filepath):
        print(f"Warning: File {filepath} not found.")
        return None

    with open(filepath, "r", encoding="utf-8") as f:
        lines = [line.rstrip() for line in f]

    if not lines:
        return None

    # First line is chapter title
    chapter_title = lines[0].strip()
    # Replace en-dash or em-dash with standard dash or leave as is
    chapter_title = re.sub(r'\s+–\s+|\s+—\s+', '—', chapter_title)

    parts = []
    current_part = {
        "title": "GENERAL PROVISIONS",
        "articles": []
    }
    
    current_article = None
    collecting_text = None  # "summary" or "full_text"

    # Regex to check for a new article: e.g. "1. Sovereignty" or "238. Principles"
    article_re = re.compile(r'^(\d+)\.\s+(.*)$')
    # Regex to check for a new part: e.g. "PART 1 - ..." or "PART 1—..."
    part_re = re.compile(r'^PART\s+\d+.*$')

    for line in lines[1:]:
        stripped = line.strip()
        if not stripped:
            continue

        # Check if line is a Part heading
        if part_re.match(stripped):
            # If we had a previous part with articles, save it
            if current_part["articles"]:
                parts.append(current_part)
            current_part = {
                "title": stripped,
                "articles": []
            }
            current_article = None
            collecting_text = None
            continue

        # Check if line is a new Article
        art_match = article_re.match(stripped)
        if art_match:
            art_num = art_match.group(1)
            art_title = art_match.group(2).strip()
            
            # Save the current article if it exists
            if current_article:
                current_part["articles"].append(current_article)
                
            current_article = {
                "number": art_num,
                "title": art_title,
                "summary": "",
                "fullText": ""
            }
            collecting_text = None
            continue

        # Check if we are starting Summary or Full Text
        if stripped.lower().startswith("summary:"):
            collecting_text = "summary"
            content = stripped[len("summary:"):].strip()
            if current_article:
                current_article["summary"] = content
            continue
        elif stripped.lower().startswith("full text:"):
            collecting_text = "full_text"
            content = stripped[len("full text:"):].strip()
            if current_article:
                current_article["fullText"] = content
            continue

        # Otherwise, append to whatever we are collecting
        if current_article:
            if collecting_text == "summary":
                if current_article["summary"]:
                    current_article["summary"] += " " + stripped
                else:
                    current_article["summary"] = stripped
            elif collecting_text == "full_text":
                if current_article["fullText"]:
                    current_article["fullText"] += "\n" + stripped
                else:
                    current_article["fullText"] = stripped

    # Append the last article and part
    if current_article:
        current_part["articles"].append(current_article)
    if current_part["articles"]:
        parts.append(current_part)

    # If the file had actual parts (other than our general provisions default),
    # filter out any empty default parts.
    actual_parts = [p for p in parts if p["title"] != "GENERAL PROVISIONS" or len(parts) == 1]
    if not actual_parts and parts:
        actual_parts = parts

    return {
        "title": chapter_title,
        "parts": actual_parts
    }

def main():
    chapters = []
    for filename in CHAPTER_FILES:
        print(f"Parsing {filename}...")
        parsed = parse_file(filename)
        if parsed:
            chapters.append(parsed)

    # Write output to TS file
    print(f"Writing to {output_file}...")
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("// Auto-generated by scripts/parse_chapters.py\n\n")
        f.write("export interface Article {\n")
        f.write("  number: string;\n")
        f.write("  title: string;\n")
        f.write("  summary: string;\n")
        f.write("  fullText: string;\n")
        f.write("}\n\n")
        f.write("export interface Part {\n")
        f.write("  title: string;\n")
        f.write("  articles: Article[];\n")
        f.write("}\n\n")
        f.write("export interface Chapter {\n")
        f.write("  title: string;\n")
        f.write("  parts: Part[];\n")
        f.write("}\n\n")
        f.write("export const chapters: Chapter[] = ")
        f.write(json.dumps(chapters, indent=2, ensure_ascii=False))
        f.write(";\n")

    print("Done!")

if __name__ == "__main__":
    main()
