# Design standard

PO/UX design output is browser-viewable HTML, CSS, and JavaScript under `design/`. These files show intended pages and interactions; the React implementation lives in `apps/web/`.

## Visual reference

Use [Stripe's interface](https://stripe.com/payments/checkout) as a reference for clear type hierarchy, deliberate spacing, concise form guidance, visible input states, and an obvious primary action. Translate those qualities into the synthetic policy-servicing journey. Record the resulting choices in `DESIGN.md` and `EXPERIENCE.md`, and show them in the browser mockups. [Visual and UX constraints](VISUAL_UX_CONSTRAINTS.md) still govern the palette, decoration, and layout.

## Layout

- `design/global.css`: shared colors, type, spacing, and page styles.
- `design/components/<name>.html`: reusable component markup; add component-specific CSS or JavaScript beside it when needed.
- `design/page/<name>.html`: complete page mockups that reference shared components and `global.css`.
- `design/page/index.html`: navigation page linking to the available page mockups.

Use semantic HTML and working relative asset paths. Keep page-specific behavior in a page JavaScript file so a mockup can be previewed without the application.

## BMad UI handoff

For UI work, `bmad-ux` reads the ticket requirements first, then this standard and [VISUAL_UX_CONSTRAINTS.md](VISUAL_UX_CONSTRAINTS.md). It records visual and behavior decisions in `DESIGN.md` and `EXPERIENCE.md`, creates browser-viewable `design/page/<pagename>.html` mockups for relevant screens, and links them from `design/page/index.html`. The UX handoff names the delivered page paths. The two UX documents govern if a mockup differs.

Sofia (`bmad-agent-po`) adds the UX documents and page paths to the ticket. `bmad-build` reads those references before implementing the UI in `apps/web/` and verifies the ticket's UI states and accessibility behavior. API and end-to-end coverage can be added after the feature works; a human walkthrough can be used for acceptance.

The UX/UI process ends with a pull request for the completed handoff. After validating the UX documents and browser-viewable mockups, commit only the handoff files on a task branch, push it, and open a PR against the intended base. Include the ticket and delivered design paths in the PR. The implementation remains a separate `bmad-build` step.

## Component references

Reference reusable fragments from pages with an include marker, for example:

```html
<include src="../components/policy-summary.html"></include>
```

`<include>` is a design convention, not native HTML. A page using it must provide a preview loader or build step that resolves the marker, so the delivered page renders its components. Keep the fragment's source in `design/components/` rather than copying its markup into each page.
