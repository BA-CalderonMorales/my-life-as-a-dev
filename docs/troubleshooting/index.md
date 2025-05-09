# Troubleshooting

This page contains solutions to common issues you might encounter when working with this project.

## Documentation CLI Tool Issues

=== "Git History Conflicts with gh-pages Branch"

    **Issue**: When running the CLI tool to deploy documentation, you receive errors like:

    ```
    error: gh-pages is unrelated to origin/gh-pages
    If you're sure this is intended, retry with --ignore-remote-status
    ```

    **Cause**: This occurs when the local gh-pages branch created by the deployment script has a different history than the remote gh-pages branch on GitHub. Git refuses to push because these branches have unrelated commit histories.

    **Solution**: 

    1. Delete the remote gh-pages branch:

    ```bash
    git push origin --delete gh-pages
    ```

    2. Run the documentation deployment tool again:

    ```bash
    ./doc-cli.sh
    ```
    
    Then select the deployment option. Alternatively, run the command directly:
    
    ```bash
    ./scripts/target/release/doc-cli deploy
    ```

    3. This will create a fresh gh-pages branch locally and push it to GitHub without history conflicts.

    **Prevention**: 
    - Avoid manually modifying the gh-pages branch
    - Always use the CLI tool for deployments
    - If you need to force deployment, consider deleting the remote gh-pages branch first

=== "OpenAI API Key Warning"

    **Issue**: When building or serving the documentation, you see this warning:

    ```
    WARNING:mkdocs.plugins.ai_plugin:AI Plugin: No API key found. Set OPENAI_API_KEY environment variable.
    ```

    **Cause**: The AI plugin is looking for an OpenAI API key but cannot find it in the environment variables.

    **Solution**:
    - This is just a warning and won't prevent building or serving the documentation
    - If you want to use the AI features, set the OPENAI_API_KEY environment variable as described in the [README](../index.md)

=== "MkDocs Build Issues"

    ## Missing Plugin Dependencies

    **Issue**: MkDocs fails to build with an error about missing plugins.

    **Solution**:
    1. Make sure you've installed the project in development mode:
    ```bash
    pip install -e .
    ```

    2. Verify that all dependencies are installed:
    ```bash
    pip install -r requirements.txt
    ```

    3. Ensure the PYTHONPATH includes the current directory:
    ```bash
    export PYTHONPATH=$PYTHONPATH:$(pwd)
    # On Windows PowerShell:
    # $env:PYTHONPATH="$env:PYTHONPATH;$(pwd)"
    ```

=== "Incorrect Plugin Import"

    **Issue**: MkDocs reports that it cannot find a custom plugin.

    **Solution**:
    Verify that the plugin is properly installed:
    ```bash
    python -c "import sys; import mkdocs_plugins; print(f'Plugin module found at: {mkdocs_plugins.__file__}')"
    ```

    If this command fails, reinstall the package:
    ```bash
    pip uninstall -y mkdocs-ai-plugin
    pip install -e .
    ```

=== "GitHub Actions Issues"

    ## GitHub Pages Deployment Failing

    **Issue**: The GitHub Actions workflow for deploying to GitHub Pages is failing.

    **Solution**:
    1. Check the workflow logs in the GitHub Actions tab
    2. Ensure that the GitHub Pages source is set to "GitHub Actions" in the repository settings
    3. Verify that the gh-pages branch exists and has the correct permissions
    4. If the issue persists, try the manual deployment process described in the first section

    ### Mike Alias Conflict during Deployment

    **Issue**: The GitHub Actions workflow fails during the "Build and deploy with Mike" step with an error similar to:
    ```
    error: alias 'latest' already exists for version 'vX.Y.Z'
    Error: Process completed with exit code 1.
    ```

    **Cause**: This error occurs when `mike deploy` attempts to assign an alias (commonly `latest`) to a new version, but this alias is already associated with a different, existing version. By default, `mike` does not overwrite existing aliases to prevent accidental changes.

    **Solution**:
    To resolve this, modify the `mike deploy` command within your GitHub Actions workflow file (typically located at `.github/workflows/github_pages.yml`). Add the `--update-aliases` flag to the command. This flag explicitly permits `mike` to update an existing alias to point to the new version being deployed.

    For example, change:
    ```yaml
    mike deploy --push $LATEST_TAG latest
    ```
    to:
    ```yaml
    mike deploy --push --update-aliases $LATEST_TAG latest
    ```
    This ensures that the specified alias (e.g., `latest`) is always updated to reflect the most recently deployed version tag. You can see this in context in the `Build and deploy with Mike` step:

    ```yaml
    # ...
          # Check if alias 'latest' already exists for this version
          if mike list | grep -q "$LATEST_TAG.*latest"; then
            echo "Alias 'latest' already exists for version $LATEST_TAG, skipping deploy"
          else
            # Deploy the latest version with Mike, updating the alias if it exists
            mike deploy --push --update-aliases $LATEST_TAG latest
          fi
    # ...
    ```

=== "Website Display Issues"

    ## Missing CSS or JavaScript

    **Issue**: The documentation site is missing styles or functionality.

    **Solution**:
    1. Clear your browser cache
    2. Check that all files in the `assets` directory are properly being included in the build
    3. Verify that the import maps and custom components are correctly set up
    4. For interactive elements like dreamscape scenes, check the browser console for JavaScript errors