# Theme Overrides

This directory contains custom HTML template overrides for the Material for MkDocs theme.

## How It Works

Material for MkDocs uses Jinja2 templates. You can override any template by placing a file with the same name here.

## Current Overrides

### `main.html`
- Extends the base Material theme
- Adds custom footer content
- Can be extended further for custom layouts

## Available Templates to Override

You can override any of these templates from Material:

- `base.html` - Base template
- `main.html` - Main content wrapper
- `partials/header.html` - Header
- `partials/footer.html` - Footer
- `partials/nav.html` - Navigation
- `partials/search.html` - Search
- `partials/tabs.html` - Navigation tabs
- `partials/toc.html` - Table of contents

## Example: Adding Custom Header

Create `overrides/partials/header.html`:

```html
{% extends "base.html" %}

{% block header %}
  <header class="md-header">
    <!-- Your custom header content -->
  </header>
{% endblock %}
```

## Documentation

- [Material Customization Guide](https://squidfunk.github.io/mkdocs-material/customization/)
- [Jinja2 Template Documentation](https://jinja.palletsprojects.com/)
