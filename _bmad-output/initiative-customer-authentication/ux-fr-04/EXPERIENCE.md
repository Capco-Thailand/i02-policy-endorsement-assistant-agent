---
status: final
feature: FR-04
---

# FR-04 experience

## Entry and content

The signed-in customer opens an owned policy detail page. Structured policy facts load through the existing owner-checked path. The evidence section then retrieves cited passages for that same policy. It identifies the source as a synthetic document; reading evidence does not alter coverage or submit a request.

## States

| State | Customer sees | Action |
| --- | --- | --- |
| Loading | “Loading policy evidence…” | Wait; keep facts visible. |
| Available | Document title, version, section ID, excerpt, and “Matches policy facts” | Continue reading or use the existing request action if eligible. |
| Unresolved | Reason such as missing, stale, or conflicting evidence; no verified citation claim | Retry retrieval; downstream quote or draft remains unavailable. |
| Service failure | “Policy evidence is temporarily unavailable” | Retry retrieval; do not present it as a verified empty result. |
| Session ended | Sign-in message and link | Sign in again; remove protected evidence from view. |

Unknown and unowned policy IDs use the existing indistinguishable unavailable-policy page. An expired owned policy may display its evidence, but its request action stays disabled by the existing policy state. A retry is a new authorized request. Keyboard focus remains visible; state changes are announced through a polite live region, except a session error, which is assertive. The API supplies excerpt text as data, never markup.
