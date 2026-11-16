# FR-03 visual contract

## Brand & Style
Extend the policy record language in `design/global.css`. Present policies as readable records with status and ownership context. React follows the project's shadcn/ui conventions.

## Colors
Use {colors.ink} for primary facts, {colors.muted} for labels, and {colors.accent} for navigation. Pair {colors.active} and {colors.warning} with the words “Active” and “Expired”. Use {colors.focus} for keyboard focus.

## Typography
Use {typography.family}. Product and policy ID identify each record. Dates and percentages use tabular numerals.

## Layout & Spacing
The list uses two columns when space permits and one at narrow widths. Detail has a single reading column. Use labeled facts and a beneficiary list. Remain usable at 320px.

## Elevation & Depth
White surfaces, fine borders, and little shadow. Status does not depend on elevation.

## Shapes
Use {rounded.panel} for record surfaces and {rounded.control} for status labels.

## Components
- Policy record: product, ID, status word, and explicit “View policy” link.
- Detail: product, ID, status, dates, payment frequency, and beneficiaries with allocations.
- State notice: plain text for empty, unavailable, loading, and service failure.

## Do's and Don'ts
Show the synthetic boundary. FR-02 adds the request action; FR-03 has none. Avoid generic dashboard chrome, gradients, and decorative cards.
