"""Generate course update dates from published teaching material on the default branches."""

import json
import re
import subprocess
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.parse import urljoin
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
SEOUL = ZoneInfo("Asia/Seoul")


def git(repo, *args):
    return subprocess.check_output(["git", "-C", repo, *args], text=True).strip()


class LessonContent(HTMLParser):
    """Compare learner-facing text and resource destinations inside the course page."""

    def __init__(self, path):
        super().__init__()
        self.base_url = f"https://amnotyoung.github.io/{path}"
        self.in_main = False
        self.nav_depth = 0
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag == "main":
            self.in_main = True
        if tag == "nav":
            self.nav_depth += 1
        if self.in_main and not self.nav_depth:
            for name, value in attrs:
                if name in {"href", "src", "poster"} and value:
                    self.parts.append(urljoin(self.base_url, value))
                elif name == "alt" and value:
                    self.parts.append(value)

    def handle_endtag(self, tag):
        if tag == "nav":
            self.nav_depth = max(0, self.nav_depth - 1)
        if tag == "main":
            self.in_main = False

    def handle_data(self, data):
        if self.in_main and not self.nav_depth:
            self.parts.append(data)


def local_html_date(repo, path):
    # A header, footer or shared stylesheet edit must not redate every course.
    history = git(repo, "log", "--first-parent", "--format=%H %ct", "--", path)
    previous_content = None
    previous_date = 0
    for line in history.splitlines():
        revision, timestamp = line.split()
        content = ""
        if git(repo, "ls-tree", "--name-only", revision, "--", path):
            parser = LessonContent(path)
            parser.feed(git(repo, "show", f"{revision}:{path}"))
            parser.close()
            content = " ".join(" ".join(parser.parts).split())
        if previous_content is not None and previous_content != content:
            break
        previous_content = content
        previous_date = int(timestamp)
    return previous_date


def material_date(repo, paths):
    if not paths:
        return 0
    timestamp = git(repo, "log", "-1", "--first-parent", "--format=%ct", "--", *paths)
    return int(timestamp or 0)


def course_date(course, temp):
    source = course["repository"]
    paths = course["materials"]["source"]
    if not re.fullmatch(r"https://github\.com/[\w.-]+/[\w.-]+", source) or not paths:
        raise ValueError(f"Invalid course material source for {course['id']}")
    # A bare, blobless clone reads path history without downloading slide decks or videos.
    mirror = temp / "source.git"
    git(temp, "clone", "--quiet", "--bare", "--filter=blob:none", "--single-branch",
        "--no-tags", source, str(mirror))
    latest = material_date(mirror, paths)
    if not latest:
        raise ValueError(f"No material history matches {source}: {paths}")

    for path in course["materials"].get("local", []):
        timestamp = local_html_date(ROOT, path) if path.endswith(".html") else material_date(ROOT, [path])
        if not timestamp:
            raise ValueError(f"No local material history for {path}")
        latest = max(latest, timestamp)
    return datetime.fromtimestamp(latest, SEOUL).date().isoformat()


def main():
    if git(ROOT, "rev-parse", "--is-shallow-repository") == "true":
        raise SystemExit("Full site history is required to date local teaching materials.")
    courses = json.loads((ROOT / "data/courses.json").read_text())
    dates = {}
    for course in courses:
        with TemporaryDirectory() as temp:
            dates[course["id"]] = course_date(course, Path(temp))
        print(f"{course['id']}: {dates[course['id']]}", flush=True)

    output = ROOT / "data/course-updates.json"
    output.write_text(json.dumps(dates, indent=2) + "\n")


if __name__ == "__main__":
    main()
