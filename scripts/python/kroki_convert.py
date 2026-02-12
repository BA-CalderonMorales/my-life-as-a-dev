import requests
import json
import os
import sys


def convert_to_svg(excalidraw_path):
    with open(excalidraw_path, "r") as f:
        data = f.read()

    # Kroki expects the raw JSON content for excalidraw
    response = requests.post("https://kroki.io/excalidraw/svg", data=data)

    if response.status_code == 200:
        return response.text
    else:
        print(f"Error: {response.status_code} - {response.text}")
        return None


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python kroki_convert.py <path_to_excalidraw_file>")
        sys.exit(1)

    excalidraw_path = sys.argv[1]
    svg_content = convert_to_svg(excalidraw_path)

    if svg_content:
        svg_path = excalidraw_path.replace(".excalidraw", ".svg")
        with open(svg_path, "w") as f:
            f.write(svg_content)
        print(f"Successfully converted {excalidraw_path} to {svg_path}")
    else:
        sys.exit(1)
