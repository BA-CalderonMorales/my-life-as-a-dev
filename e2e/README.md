# End-to-end test layout

The `e2e` directory organizes quick checks for each documentation domain so that each page can be validated independently or as a group.

- `config/` holds shared configuration such as the `pages.js` map and optional runtime settings.
- `shared/` contains utilities used across specs, such as file existence checks and formatting helpers.
- `pages/` includes a spec per documentation domain. Each spec uses the shared utilities to assert that its source markdown entry point exists and that the rendered HTML does not expose raw Markdown syntax.
- `index.spec.js` validates the folder structure itself, confirms that every documented page has a matching spec and source file, and executes each page spec.

Build the site first so the specs can inspect the rendered HTML output:

```
mkdocs build
node e2e/index.spec.js
```

Run any spec directly with Node, for example `node e2e/pages/home.spec.js`, or run `node e2e/index.spec.js` to confirm the layout and mappings before executing page-specific checks. Running the index spec after a build also verifies that rendered pages keep Markdown styling intact.
