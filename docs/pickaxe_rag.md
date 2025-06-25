# Pickaxe RAG Integration

This project can run Retrieval Augmented Generation (RAG) using [Pickaxe](https://github.com/hatchet-dev/pickaxe) during the MkDocs build process.

## Placeholders

Add a placeholder to any Markdown page:

```html
<div class="pickaxe-rag" data-query="What does this project do?">
  Loading answer...
</div>
```

When `PICKAXE_API_KEY` is set, the `pickaxe_rag_plugin` will query your Pickaxe deployment and replace the placeholder with the returned answer.

## Environment Variables

- `PICKAXE_API_KEY` – API token for Pickaxe
- `PICKAXE_HOST` – Optional base URL (default: `https://api.pickaxe.ai`)

## Usage

Set the environment variables and build the site:

```bash
export PICKAXE_API_KEY=your-key
make build
```

The generated site will include Pickaxe-powered answers wherever placeholders are used.

You can explore Pickaxe's source code and CLI at [github.com/hatchet-dev/pickaxe](https://github.com/hatchet-dev/pickaxe).
