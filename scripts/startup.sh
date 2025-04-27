#!/bin/bash
# filepath: /workspaces/my-life-as-a-dev/scripts/startup.sh

check_port_and_kill_option() {
    if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port 8000 is already in use."
        
        # Show what process is using the port
        echo "Process using port 8000:"
        lsof -Pi :8000 -sTCP:LISTEN
        
        read -p "Do you want to kill this process? (y/n): " answer
        if [[ "$answer" == "y" || "$answer" == "Y" ]]; then
            echo "Terminating process on port 8000..."
            lsof -ti:8000 | xargs kill -9
            echo "Process terminated."
        else
            echo "Port 8000 is still in use. MkDocs server may fail to start."
        fi
    else
        echo "Port 8000 is available."
    fi
}

echo "==== Starting setup for my-life-as-a-dev project ===="

# Detect if we're in GitHub Codespaces
if [ -n "$CODESPACES" ]; then
    echo "GitHub Codespaces environment detected! Setting up development environment..."

    # Install dependencies from requirements.txt
    echo "Installing dependencies..."
    python -m pip install -r requirements.txt

    # Check if installation was successful
    if [ $? -eq 0 ]; then
        echo "Dependencies installed successfully."
    else
        echo "Error: Failed to install dependencies."
        exit 1
    fi

    check_port_and_kill_option

    # Start the development server in background
    echo "Starting MkDocs development server..."
    echo "Once ready, you can preview the site at: $(gp url 8000)"
    mkdocs serve &

    echo "==== Setup complete! ===="
    echo "The documentation is now available at: $(gp url 8000)"
    echo "You can start editing the files in the 'docs/' directory."
    echo "Changes will be reflected automatically on the development server."
else
    # Fail early if not in Codespaces
    echo "This script is optimized for GitHub Codespaces."
    echo "For local development, please follow the instructions in the README:"
    echo "https://github.com/BA-CalderonMorales/my-life-as-a-dev#local-development"
fi