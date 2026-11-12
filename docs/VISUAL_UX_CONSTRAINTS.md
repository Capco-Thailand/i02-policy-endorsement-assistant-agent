# Visual and UX Constraints

Use this document when creating or changing product screens in `design/` or `apps/web/`. The customer policy list and detail flow should feel purpose-built for the Policy Endorsement Assistant, not assembled from a generic SaaS template.

## Avoid these visual patterns

- Purple-to-blue gradients, glassmorphism, frosted-glass panels, backdrop blur, and soft-glow hero backgrounds.
- Abstract blob or ribbon illustrations, floating geometric background shapes, and decorative 3D isometric cubes, spheres, or rings.
- Stock-photo-style business people, including handshake, laptop-staring, or whiteboard-pointing scenes.
- Hero sections with a floating phone or laptop mockup.
- Overusing large rounded corners, especially `rounded-2xl`-style treatment on every surface.
- Heavy or layered drop shadows.
- Cookie-cutter palettes such as indigo and teal, purple and pink, or blue and white alone.
- Tailwind-like utility styling that makes the interface look interchangeable with other sites.
- Gradient text headings and sans-serif typography without a clear hierarchy or character.

## Avoid these layout and component defaults

- Bento-grid dashboard layouts unless the product requirements explicitly call for one.
- Treating a sidebar, topbar, and main-content area as the only viable page structure.
- Defaulting to a three-column row of feature cards, each with an icon, heading, and description.
- Using “Get Started for Free” or “Try it Free” as the only call to action.
- Testimonial carousels with an avatar, quote, name, and title.
- “Meet the Team” sections with headshots.
- FAQ accordions as the only way to display information.
- Three-column Starter / Pro / Enterprise pricing tables.
- Four-column footers with link groups, social icons, and copyright as a template.

## Avoid these interaction patterns and copy

- Empty marketing phrases such as “seamless experience,” “revolutionize your workflow,” “empower your team,” “unlock the power of,” and “supercharge your.”
- Onboarding tooltips that point out obvious controls.
- Toast notifications for trivial actions.
- Confetti or celebration animations for basic task completion.
- Loading spinners as the only feedback mechanism; communicate what is loading or provide a useful page-level state.
- Hover effects whose only result is scaling an element slightly.

## Design from the product

- Start with the actual content, user tasks, and information architecture. Let those determine the layout.
- Use color with purpose: choose one intentional accent and leave generous whitespace. Do not depend on gradients for depth.
- Establish a clear typographic hierarchy before adding decoration.
- Make each component answer a user need. Remove components that do not help the user understand or complete a task.
- Prefer simple, flat, restrained treatments when decoration does not add meaning.
- Keep the interface specific to synthetic policy servicing and endorsement review. Make policy status, key policy facts, beneficiaries, and the path to an endorsement request easy to understand where relevant.
- Preserve the product boundary: policy data and proposed updated-policy views are synthetic. Customers review their own proposals; approval adds a non-binding history record. Never present that record as issued coverage or a live policy update.
