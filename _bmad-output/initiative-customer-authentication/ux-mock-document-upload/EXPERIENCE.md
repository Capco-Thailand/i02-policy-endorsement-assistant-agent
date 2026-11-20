# Mock document upload — behavior contract

After recording a request for an owned active policy, the customer sees cited FR-05 document guidance for the request's change type and effective date and can select one PDF, PNG, or JPEG up to 10 MiB. Missing, conflicting, or failed guidance appears as unresolved. Do not use the guidance to judge the uploaded file.

The button stays disabled until a file is selected and shows upload progress. Success shows `RECEIVED_MOCK` and explains that the file's contents and suitability were not verified. A technical failure leaves the picker available for retry and never displays success. Session expiry, unowned requests, and expired policies follow the existing unavailable/error states. Tell customers to use synthetic files and never upload real identity or health records.

Use explicit labels, keyboard-reachable controls, a visible focus style, and an `aria-live` result. Any server audit failure is an upload failure. No upload changes coverage.
