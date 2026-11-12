- source_plan: `_bmad-output/plan-gh-33-customer-authentication.md`
  summary: Verify FR-01 sign-in, expiry, and sign-out across the localhost web and API services in a browser.
  evidence: The quick review identified this integration check as uncovered; API and component tests pass, but CUA's localhost origin permission was declined, so the cross-port browser behavior remains unverified at medium severity.
