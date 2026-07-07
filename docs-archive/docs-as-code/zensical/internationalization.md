---
icon: lucide/languages
tags:
  - Setup
  - Documentation
---

# Internationalization (i18n)

This guide explains how to add multi-language support to the documentation site.

## Understanding How It Works

**Important**: MkDocs Material/Zensical does **not** auto-translate content. The language selector creates links between **separate documentation sites** that you must create and maintain.

### What the Site Language Setting Does

The `language` setting in [04-theme.toml](config/zensical/04-theme.toml) only affects:

- HTML `lang` attribute (`<html lang="en">`)
- Built-in UI strings ("Search", "Table of contents", "Next", "Previous", etc.)
- Text directionality (left-to-right or right-to-left)

```toml
[project.theme]
language = "en"  # Currently English
```

### What the Language Selector Does

When configured, the language selector dropdown links to **completely separate documentation sites** - one for each language:

```
/en/  --> English site
/es/  --> Spanish site (must be manually created)
/de/  --> German site (must be manually created)
```

## Current Configuration

The language selector is **configured but commented out** in [04-theme.toml](config/zensical/04-theme.toml):

```toml
# Uncomment when translated content is available:

# [[project.extra.alternate]]
# name = "English"
# link = "/en/"
# lang = "en"
#
# [[project.extra.alternate]]
# name = "Espanol"
# link = "/es/"
# lang = "es"
```

## Setting Up Multi-Language Support

### Step 1: Restructure Documentation

Move your current docs into a language-specific folder:

```bash
# Create language directories
mkdir -p docs/en docs/es

# Move existing content to English
mv docs/*.md docs/en/
mv docs/learning docs/en/
mv docs/projects docs/en/
# ... etc
```

Resulting structure:

```
docs/
├── en/           # English content
│   ├── index.md
│   ├── learning/
│   ├── projects/
│   └── ...
├── es/           # Spanish content (translated copies)
│   ├── index.md
│   ├── learning/
│   ├── projects/
│   └── ...
└── overrides/    # Shared theme overrides
```

### Step 2: Translate Content

For each language, you need to:

1. **Copy** all English markdown files to the new language folder
2. **Translate** the content (manually or with AI assistance)
3. **Review** translations for accuracy

### Step 3: Configure the Selector

Uncomment the language configuration in `config/zensical/04-theme.toml`:

```toml
[[project.extra.alternate]]
name = "English"
link = "/en/"
lang = "en"

[[project.extra.alternate]]
name = "Espanol"
link = "/es/"
lang = "es"
```

### Step 4: Build and Deploy

You may need to build and deploy each language version separately, or use a multi-site build configuration.

## Translation Options

### Manual Translation

Best for quality but time-intensive. Consider prioritizing:

- Landing page (`index.md`)
- Most-visited documentation
- API references

### AI-Assisted Translation

Use tools like:

- **ChatGPT/Claude** for initial drafts
- **DeepL** for high-quality machine translation

Always review AI translations for:

- Technical accuracy
- Terminology consistency
- Cultural appropriateness

### Professional Services

For production-quality translations, consider services like:

- Crowdin
- Transifex
- Lokalise

## Supported Languages

Zensical supports 60+ languages including:

| Language | Code | Direction |
|----------|------|-----------|
| English | `en` | LTR |
| Spanish | `es` | LTR |
| French | `fr` | LTR |
| German | `de` | LTR |
| Chinese (Simplified) | `zh` | LTR |
| Japanese | `ja` | LTR |
| Korean | `ko` | LTR |
| Arabic | `ar` | RTL |
| Hebrew | `he` | RTL |

For right-to-left languages, set:

```toml
[project.theme]
language = "ar"
direction = "rtl"
```

## UI Translation Customization

To customize built-in UI translations, create a custom language file:

```html title="docs/overrides/partials/languages/custom.html"
<!-- Import base language and fallback -->
{% import "partials/languages/es.html" as language %}
{% import "partials/languages/en.html" as fallback %}

<!-- Custom overrides -->
{% macro override(key) %}{{ {
  "search.placeholder": "Buscar en la documentacion...",
  "toc.title": "En esta pagina"
}[key] }}{% endmacro %}

<!-- Re-export -->
{% macro t(key) %}{{
  override(key) or language.t(key) or fallback.t(key)
}}{% endmacro %}
```

Then reference it:

```toml
[project.theme]
language = "custom"
```

## Resources

- [MkDocs Material - Changing the Language](https://squidfunk.github.io/mkdocs-material/setup/changing-the-language/)
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- [i18n Plugin for MkDocs](https://github.com/ultrabug/mkdocs-static-i18n) (alternative approach)
