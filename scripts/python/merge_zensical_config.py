#!/usr/bin/env python3
"""
Merge Zensical Configuration Files

This script merges modular TOML configuration files from config/zensical/
into a single zensical.toml file at the project root.

Usage:
    uv run python scripts/python/merge_zensical_config.py
    # or
    make config
"""

from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path

# Add tomli for Python < 3.11, use tomllib for 3.11+
if sys.version_info >= (3, 11):
    import tomllib
else:
    try:
        import tomli as tomllib
    except ImportError:
        print("Error: tomli is required for Python < 3.11")
        print("Install with: uv pip install tomli")
        sys.exit(1)

try:
    import tomli_w
except ImportError:
    print("Error: tomli_w is required for writing TOML")
    print("Install with: uv pip install tomli-w")
    sys.exit(1)


def deep_merge(base: dict, overlay: dict) -> dict:
    """
    Deep merge two dictionaries. Overlay values take precedence.
    Lists are replaced, not merged.
    """
    result = base.copy()

    for key, value in overlay.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value

    return result


def load_config_files(config_dir: Path) -> dict:
    """
    Load and merge all TOML files from the config directory.
    Files are processed in alphabetical order.
    """
    merged = {}

    # Get all .toml files sorted alphabetically
    toml_files = sorted(config_dir.glob("*.toml"))

    if not toml_files:
        print(f"Warning: No .toml files found in {config_dir}")
        return merged

    print(f"Merging {len(toml_files)} configuration files...")

    for toml_file in toml_files:
        print(f"  + {toml_file.name}")
        try:
            with open(toml_file, "rb") as f:
                data = tomllib.load(f)
                merged = deep_merge(merged, data)
        except Exception as e:
            print(f"Error loading {toml_file}: {e}")
            sys.exit(1)

    return merged


def generate_header() -> str:
    """Generate the header comment for the merged file."""
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    return f'''# ##############################################################################
#
#                    ZENSICAL CONFIGURATION
#                    Brandon's Simplified Life
#
#   AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
#
#   This file is generated from config/zensical/*.toml
#   To modify, edit the source files and run:
#       uv run python scripts/python/merge_zensical_config.py
#
#   Generated: {timestamp}
#
# ##############################################################################

'''


def write_merged_config(config: dict, output_path: Path) -> None:
    """Write the merged configuration to the output file."""
    header = generate_header()

    # Write the merged TOML
    toml_content = tomli_w.dumps(config)

    with open(output_path, "w") as f:
        f.write(header)
        f.write(toml_content)

    print(f"\nGenerated: {output_path}")


def main() -> int:
    """Main entry point."""
    # Determine paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent
    config_dir = project_root / "config" / "zensical"
    output_path = project_root / "zensical.toml"

    print("Zensical Configuration Merger")
    print("=" * 40)
    print(f"Config directory: {config_dir}")
    print(f"Output file: {output_path}")
    print()

    # Check config directory exists
    if not config_dir.exists():
        print(f"Error: Config directory not found: {config_dir}")
        return 1

    # Load and merge configs
    merged_config = load_config_files(config_dir)

    if not merged_config:
        print("Error: No configuration loaded")
        return 1

    # Write output
    write_merged_config(merged_config, output_path)

    # Validate output
    print("\nValidating generated file...")
    try:
        with open(output_path, "rb") as f:
            tomllib.load(f)
        print("Validation passed")
    except Exception as e:
        print(f"Validation failed: {e}")
        return 1

    print("\nDone!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
