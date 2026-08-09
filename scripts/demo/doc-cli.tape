# doc-cli showcase -- boot the interactive menu once, then work inside it.
# Bare doc-cli opens the menu and stays open until you type exit: every round
# runs one command and returns to the menu. Record from the repository root
# with the Rust binary current (doc-cli.sh rebuilds it if sources changed):
#   vhs scripts/demo/doc-cli.tape

Output docs/demo-doc-cli.gif
Set FontSize 14
Set FontFamily "DejaVu Sans Mono"
Set Width 1100
Set Height 640
Set Padding 24
Set Framerate 30
Set Shell bash

Type "./doc-cli.sh"
Enter
Sleep 4s
# 1. the interactive front door: every command, one numbered pick

Type "info"
Enter
Sleep 4s
# 2. info -- how the repository is put together

Type "validate"
Enter
Sleep 4s
# 3. validate -- configuration is sound

Type "nav-check"
Enter
Sleep 4s
# 4. nav-check -- the docs-as-code contract: no orphaned pages

Type "build"
Enter
Sleep 7s
# 5. build -- Zensical slots the whole site together in seconds

Type "exit"
Enter
Sleep 3s
# 6. leave cleanly
