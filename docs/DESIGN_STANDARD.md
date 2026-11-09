# Design standard

PO/UX design output is browser-viewable HTML, CSS, and JavaScript under `design/`. These files show intended pages and interactions; the React implementation lives in `apps/web/`.

## Layout

- `design/global.css`: shared colors, type, spacing, and page styles.
- `design/component/<name>.html`: reusable component markup; add component-specific CSS or JavaScript beside it when needed.
- `design/page/<name>.html`: complete page mockups that reference shared components and `global.css`.

Use semantic HTML and working relative asset paths. Keep page-specific behavior in a page JavaScript file so a mockup can be previewed without the application.

## Component references

Reference reusable fragments from pages with an include marker, for example:

```html
<include src="../component/policy-summary.html"></include>
```

`<include>` is a design convention, not native HTML. A page using it must provide a preview loader or build step that resolves the marker, so the delivered page renders its components. Keep the fragment's source in `design/component/` rather than copying its markup into each page.
