# FR-01 accessibility review

Static review of `design/page/sign-in.html`, `sign-in.js`, `design/global.css`, and the UX spines. Browser and assistive-technology behavior remains unverified.

## Findings

- **Medium — Input boundary contrast.** `.auth-field input` uses `#8a9bab` against white, about **2.85:1**, below the 3:1 non-text contrast target for identifying an input boundary. A low-vision customer may have trouble finding the fields before focus. **Fix:** darken the default border to a measured 3:1 or greater against white, then verify focused and error states. (`design/global.css:121`)
- **Medium — Mockup state controls are undersized and faint.** The preview buttons use 12px text with 8px vertical padding, giving a roughly 32px touch target; their `#dce6ef` border also has low contrast against white. These are interactive controls in the delivered preview, even though they are absent from the product UI. **Fix:** make them at least 44px tall and give the boundary or surface a 3:1 contrast cue. (`design/global.css:129`)
- **Low — Error association is underspecified.** `EXPERIENCE.md` says all fields have associated errors, while the preview has one form-level alert and no field-specific error association. This is suitable for generic credential rejection, but the contract does not distinguish it from native required-field errors. **Fix:** state that generic credential/service errors are form-level, while required-field errors rely on native validity and focus the invalid field. (`EXPERIENCE.md`, Accessibility Floor and State Patterns)

## Checks that pass in the static review

- Email and password have visible, programmatically associated labels and appropriate autocomplete attributes.
- Failure messages use text plus color, `role="alert"`, and a programmatic focus target; invalid credentials do not reveal whether an account exists.
- Primary white-on-accent button text measures about 4.7:1; body, error, and expired-message text exceed 4.5:1 against their surfaces.
- Keyboard submission, visible input/button focus, and reduced-motion CSS are specified. The 320px layout has no apparent fixed-width overflow.
