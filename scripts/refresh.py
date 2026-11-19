"""Verify reviewed source documents before replacing the edition shown by the tool."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import re
from time import sleep
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "sources"
EDITION = ROOT / "web/data/edition.json"


def retrieve(url):
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers={"User-Agent": "CoolCode source refresh/1.0"}), timeout=90) as response:
                return response.read()
        except OSError:
            if attempt == 2:
                raise
            sleep(2 ** attempt)


def check_document(source, previous, today):
    """Keep the latest known-good access date for a fixed, reviewed publication."""
    try:
        raw = retrieve(source["url"])
    except OSError as error:
        if source["url"] not in previous:
            raise
        print(f"Source unavailable ({error}): {source['url']}")
        return {**previous[source["url"]], "status": "Source unavailable on last check"}
    if sha256(raw).hexdigest() != source["sha256"]:
        if source["url"] not in previous:
            raise ValueError("Review this publication before including it: " + source["url"])
        print("Source changed. Check the published transcription: " + source["url"])
        return {**previous[source["url"]], "status": "Source changed; transcription awaits review"}
    return {"url": source["url"], "verified": today, "status": "Verified"}


def refresh():
    today = datetime.now(timezone.utc).date().isoformat()
    documents = json.loads((SOURCES / "documents.json").read_text())
    old = json.loads(EDITION.read_text()) if EDITION.exists() else {}
    previous = {doc["url"]: doc for doc in old.get("documents", [])}
    edition = json.loads((SOURCES / "records.json").read_text())
    update(edition)
    with ThreadPoolExecutor(max_workers=2) as pool:
        edition["documents"] = list(pool.map(lambda doc: check_document(doc, previous, today), documents))
    edition["retrieved"] = today
    temp = EDITION.with_suffix(".tmp")
    temp.write_text(json.dumps(edition, ensure_ascii=False, indent=2) + "\n")
    temp.replace(EDITION)


SURVEY = "https://data.novascotia.ca/resource/tnu4-55e9.json"
MEASURES = ("hours_open", "programs", "program_attendance", "annual_in_person_visits")


def survey_rows(raw):
    result = []
    seen = set()
    for row in raw:
        region, year = row["library_region"].strip(), row["year"]
        if not region or not re.fullmatch(r"\d{4}-\d{4}", year) or (region, year) in seen:
            raise ValueError("Unexpected region or fiscal year in the survey")
        seen.add((region, year))
        record = dict(region=region, year=year)
        for field in MEASURES:
            value = row.get(field)
            number = float(value) if value not in ("", None) else None
            if number is not None and not 0 <= number < 1_000_000_000:
                raise ValueError("Unexpected survey measurement")
            record[field] = number
        result.append(record)
    if ("Halifax Public Libraries", "2024-2025") not in seen or len(result) < 54:
        raise ValueError("Survey is missing known region-years")
    return sorted(result, key=lambda r: (r["region"], r["year"]))


def update(edition):
    rows = []
    offset = 0
    while True:
        url = SURVEY + f"?%24limit=1000&%24offset={offset}&%24order=library_region%2Cyear"
        page = json.loads(retrieve(url))
        rows.extend(page)
        if len(page) < 1000:
            break
        offset += len(page)
    edition["survey"] = survey_rows(rows)
    years = sorted(row["year"] for row in edition["survey"])
    edition["count"] = len(edition["survey"])
    edition["coverage"] = f"NS {years[0]} to {years[-1]} · Vancouver 2023–24"

if __name__ == "__main__":
    refresh()
