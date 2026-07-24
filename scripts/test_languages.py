"""
Language Response Test Script
Tests all 8 supported languages by sending the same constitutional question
to the backend API and verifying each returns a valid response.
"""

import requests
import time
import json
import sys

API_URL = "http://localhost:8001/v1/chat/completions"
API_KEY = "my_secret_key123"
TEST_QUERY = "What are the rights of a citizen in Kenya?"

LANGUAGES = [
    "English",
    "Kiswahili (Swahili)",
    "Gĩkũyũ (Kikuyu)",
    "Dholuo (Luo)",
    "Luhya",
    "Kikamba (Kamba)",
    "Ekegusii (Kisii)",
    "Kalenjin",
]

HEADERS = {
    "Content-Type": "application/json",
    "api-key": API_KEY,
}


def test_language(language: str) -> dict:
    """Send a test query in the given language and return the result."""
    payload = {
        "messages": [{"role": "user", "content": TEST_QUERY}],
        "language": language,
    }

    start = time.time()
    try:
        resp = requests.post(API_URL, headers=HEADERS, json=payload, timeout=60)
        elapsed = time.time() - start

        if resp.status_code != 200:
            return {
                "language": language,
                "status": "FAIL",
                "error": f"HTTP {resp.status_code}: {resp.text[:200]}",
                "time_s": round(elapsed, 2),
            }

        data = resp.json()
        content = data.get("content", "")

        if not content or content.strip() == "":
            return {
                "language": language,
                "status": "FAIL",
                "error": "Empty response body",
                "time_s": round(elapsed, 2),
            }

        # Check for known error messages in the response content
        error_phrases = [
            "momentarily unavailable",
            "cannot generate a response",
            "safety settings",
        ]
        for phrase in error_phrases:
            if phrase.lower() in content.lower():
                return {
                    "language": language,
                    "status": "WARN",
                    "error": f"Response contains error indicator: '{phrase}'",
                    "preview": content[:150],
                    "time_s": round(elapsed, 2),
                }

        return {
            "language": language,
            "status": "PASS",
            "preview": content[:200],
            "response_length": len(content),
            "time_s": round(elapsed, 2),
        }

    except requests.exceptions.Timeout:
        return {
            "language": language,
            "status": "FAIL",
            "error": "Request timed out (60s)",
            "time_s": 60.0,
        }
    except requests.exceptions.ConnectionError:
        return {
            "language": language,
            "status": "FAIL",
            "error": "Connection refused — is the backend running on port 8001?",
            "time_s": 0,
        }
    except Exception as e:
        return {
            "language": language,
            "status": "FAIL",
            "error": str(e),
            "time_s": round(time.time() - start, 2),
        }


def main():
    print("=" * 70)
    print("  CIVIC EDUCATOR BOT — Language Response Test")
    print(f"  Query: \"{TEST_QUERY}\"")
    print(f"  Testing {len(LANGUAGES)} languages")
    print("=" * 70)

    results = []
    for i, lang in enumerate(LANGUAGES, 1):
        print(f"\n[{i}/{len(LANGUAGES)}] Testing: {lang} ...", end=" ", flush=True)
        result = test_language(lang)
        results.append(result)

        status_icon = {"PASS": "✅", "FAIL": "❌", "WARN": "⚠️"}.get(result["status"], "?")
        print(f"{status_icon}  ({result['time_s']}s)")

        if result["status"] == "PASS":
            print(f"    Preview: {result['preview'][:120]}...")
        elif result.get("error"):
            print(f"    Error:   {result['error']}")

    # Summary
    passed = sum(1 for r in results if r["status"] == "PASS")
    warned = sum(1 for r in results if r["status"] == "WARN")
    failed = sum(1 for r in results if r["status"] == "FAIL")
    total_time = sum(r["time_s"] for r in results)

    print("\n" + "=" * 70)
    print("  RESULTS SUMMARY")
    print("=" * 70)
    print(f"  ✅ Passed:  {passed}/{len(LANGUAGES)}")
    if warned:
        print(f"  ⚠️  Warned:  {warned}/{len(LANGUAGES)}")
    if failed:
        print(f"  ❌ Failed:  {failed}/{len(LANGUAGES)}")
    print(f"  ⏱  Total:   {round(total_time, 1)}s")
    print("=" * 70)

    # Print failure details
    failures = [r for r in results if r["status"] in ("FAIL", "WARN")]
    if failures:
        print("\n  ISSUES:")
        for r in failures:
            print(f"    [{r['status']}] {r['language']}: {r.get('error', 'unknown')}")

    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
