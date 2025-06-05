import re
from pathlib import Path

INDEX_FILE = Path(__file__).resolve().parent.parent / "docs" / "repositories" / "index.md"


def slug(name: str) -> str:
    return name.lower().replace('-', '_')


def main():
    lines = INDEX_FILE.read_text(encoding="utf-8").splitlines()
    pattern = re.compile(r"^(\s*\d+\.\s+\*\*\[([^\]]+)\]\(https://github.com/BA-CalderonMorales/[^)]+\)\*\*.*)")
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        m = pattern.match(line)
        if m:
            repo = m.group(2)
            new_lines.append(line)
            next_line = lines[i+1] if i+1 < len(lines) else ""
            slug_dir = slug(repo)
            if f"./{slug_dir}/index.md" not in next_line:
                new_lines.append(f"        {line.strip().split('.')[0]}. [documentation](./{slug_dir}/index.md)")
            i += 1
        else:
            if not line.startswith("root@"):  # remove accidental prompt text
                new_lines.append(line)
            i += 1
    INDEX_FILE.write_text("\n".join(new_lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
