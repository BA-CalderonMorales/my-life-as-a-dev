#!/usr/bin/env python3
"""
Convert bash code blocks to console format for better syntax highlighting.
This script converts command-line examples from bash to console format with $ prompts.
"""

import re
import sys
from pathlib import Path

def convert_bash_to_console(content):
    """Convert bash code blocks with commands to console format."""
    
    def replace_block(match):
        indent = match.group(1)
        code = match.group(2)
        
        # Split into lines
        lines = code.split('\n')
        converted_lines = []
        
        for line in lines:
            line = line.strip()
            if not line:
                converted_lines.append('')
            elif line.startswith('#'):
                # Skip comment lines - context should provide this info
                continue
            else:
                # Add $ prompt before commands
                converted_lines.append(f'$ {line}')
        
        # Remove leading/trailing empty lines
        while converted_lines and not converted_lines[0]:
            converted_lines.pop(0)
        while converted_lines and not converted_lines[-1]:
            converted_lines.pop()
        
        # Reconstruct with proper indentation
        new_code = '\n'.join(converted_lines)
        return f'{indent}```console\n{indent}{new_code}\n{indent}```'
    
    # Pattern to match ```bash blocks with optional indentation
    pattern = r'([ \t]*)```bash\n(.*?)```'
    
    return re.sub(pattern, replace_block, content, flags=re.DOTALL)

def process_file(filepath):
    """Process a single markdown file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if there are bash blocks
        if '```bash' not in content:
            return False
        
        # Convert
        new_content = convert_bash_to_console(content)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}", file=sys.stderr)
        return False

def main():
    """Main function to process all markdown files."""
    base_dir = Path('/home/runner/work/my-life-as-a-dev/my-life-as-a-dev/docs')
    
    # Files to process
    files_to_process = [
        # Terminal Jarvis project
        'projects/active/terminal-jarvis/quick_start/installation.md',
        'projects/active/terminal-jarvis/quick_start/usage.md',
        'projects/active/terminal-jarvis/quick_start/configuration.md',
        'projects/active/terminal-jarvis/quick_start/ai-tools.md',
        'projects/active/terminal-jarvis/details/testing.md',
        'projects/active/terminal-jarvis/details/maintainers.md',
        'projects/active/terminal-jarvis/details/architecture.md',
        'projects/active/terminal-jarvis/details/contributions.md',
        'projects/active/terminal-jarvis/details/limitations.md',
        'projects/active/terminal-screensaver/index.md',
        # Other projects
        'projects/active/coder-starter-scripts/index.md',
        'projects/active/coder-templates/index.md',
        'projects/active/my-life-as-a-dev/quick_start/index.md',
        'projects/experiments/immersive-awe-canvas/quick_start/index.md',
        'projects/experiments/rust-terminal-forge/quick_start/index.md',
        'projects/experiments/shadow-scroll-blossom/quick_start/index.md',
        # Learning materials
        'learning/cloud_ai/vertex_ai/vertex_ai_studio.md',
        'learning/cloud_ai/vertex_ai/environment_setup.md',
        'learning/cloud_ai/vertex_ai/workspace_setup.md',
        # Docs-as-code
        'docs-as-code/zensical/index.md',
    ]
    
    processed = 0
    for file_path in files_to_process:
        full_path = base_dir / file_path
        if full_path.exists():
            if process_file(full_path):
                processed += 1
                print(f"✓ Processed {file_path}")
        else:
            print(f"✗ File not found: {file_path}", file=sys.stderr)
    
    print(f"\nProcessed {processed} files")

if __name__ == '__main__':
    main()
