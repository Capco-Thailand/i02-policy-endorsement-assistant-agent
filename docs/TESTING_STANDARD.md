# Testing standard

QA/Sec works across the components the new project actually builds. Use test data that follows its privacy and safety rules. Tie each test case to a goal, workflow step, safety boundary, or success measure in [PRD.md](PRD.md), and record the expected state, external calls, and audit result where applicable. Replace the previous project's PRD before using its measures as a test source.

## Test-driven development

For behavior-changing work, choose the public interfaces to test during planning and confirm those seams with the requester before writing tests. State what each seam can and cannot prove. Map the selected acceptance criterion to an observable result at that seam; prefer a known expected value from the requirement over one calculated by the implementation.

Work in small vertical slices. Write one focused test first, run it, and confirm it fails because the required behavior is missing rather than because the test setup is broken. Implement only what makes that test pass, run it again, then take the next slice. Do not write a whole suite of speculative tests before implementation. Keep tests independent of private methods and internal collaborators; mock external boundaries such as an API, clock, or filesystem only when needed. Perform broader refactoring and rerun the affected tests during review, after the red-to-green implementation cycles.

Record the test name and red/green commands or results in the implementation handoff. A test added after its implementation does not count as test-first evidence. Documentation, formatting, and other changes without observable behavior may use relevant checks without a red test.

## Coverage

- Test required fields, validation, authorization, domain decisions, and side-effect gates at the unit or component level.
- Test API contracts for valid and rejected input, authorization failures, dependency failures, and documented error responses when the project has an API.
- Test user-facing screens for relevant loading, empty, success, error, and access states when the project has a UI.
- Test complete workflows with controlled external dependencies. Assert which calls and state changes occur, and which must be blocked for rejected, unsupported, or unauthorized requests. Compare outputs with versioned expected fixtures rather than values calculated by the implementation under test.
- Include adversarial and boundary cases relevant to the project's risks, such as conflicting data, ambiguous dates, repeated submission, dependency failures, and prompt injection when AI consumes untrusted text.

Keep component tests beside the code they cover. When a shared flow spans components, reuse a labeled scenario and its permitted test fixtures across the relevant tests. Verify that audit records contain the identifiers, decisions, calls, and final state needed to explain the result without unnecessary personal data.

## Browser E2E and visual checks

Treat a request to "run E2E" as authorization to prepare and run the browser suite. If no ticket or feature is named, use the active ticket or feature evident from the current checkout and recent test evidence; if none is identifiable, run all implemented user-facing flows. Record the chosen scope in the report. Do not pause to confirm the target or ask permission to add the dependency, configuration, browser, fixtures, or runnable tests needed for the run. Ask only when the scope cannot be determined from the repository or an external decision is required.

Before claiming browser coverage, check for a Playwright dependency, configuration, test command, and runnable browser tests. If any piece is missing, set up the Playwright runner, install the browser, configure the new application's startup and permitted test fixtures, and add at least one runnable browser test before running E2E or claiming browser coverage. An E2E request includes this setup work. Do not report a manual browser walkthrough or component test as automated E2E evidence.

When asked to run E2E for a ticket or feature, cover every acceptance criterion that can be exercised through the implemented UI and API in the current checkout. Include applicable success, rejection, and boundary cases; do not stop after a smoke test or one representative criterion. Use browser scenarios for behavior that crosses the UI and API boundary, and API or lower-layer tests for claims a browser cannot directly observe. Before reporting the run, compare the scenarios against every current criterion and add feasible missing cases. For behavior blocked by an unimplemented dependency, record the exact missing check, its owning ticket, and why it could not run. Do not count those criteria as verified.

Run browser E2E scenarios through the public UI against the API and web app when the requirement covers user-visible behavior. Use role and label locators, assert visible outcomes and access boundaries, and name the ticket criterion in each test. Record the browser, run time, Git commit, scenario scope, result, and uncovered criteria in the report or linked traceability record. For each scenario that verifies UI behavior, capture at least one screenshot of the rendered application and attach it to that run's HTML report, including passing scenarios. Requirements with no UI behavior do not need UI screenshots. Keep additional failure screenshots and traces so a reviewer can inspect the cause.

For a screen with a reviewed UX handoff, compare stable desktop and narrow viewport screenshots to baselines reviewed against its `DESIGN.md`, `EXPERIENCE.md`, and browser-viewable mockup. A passing screenshot comparison proves the current UI matches that baseline; it does not prove exact pixel identity with the mockup or cover states and pages absent from the test. Remove development-only overlays from captures and review intended design changes before updating baselines. Attach both the reference and current images to the HTML result even when a visual test passes.

Save each Playwright HTML result under a ticket-specific folder, `test-results/<ticket-id>/`, with the local run date and time in the HTML filename. Keep its image and trace assets beside that file so older reports remain viewable. Keep `test-results/index.html` pointing to the latest run across all ticket folders. Use the ID from the active ticket and the new project's configured timezone for the timestamp. Before browser E2E becomes a delivery gate, provide a working `npm run test:e2e` command, install Chromium with `npx playwright install chromium`, and run the suite. The current root package provides ticket tests only.

## Acceptance criteria traceability

For each ticket, use its current acceptance criteria as the source for test planning. Before implementation, break each criterion into observable success, rejection, and boundary cases as applicable. Give each case a stable reference to the ticket and criterion; use the criterion's ID when it has one, otherwise a short identifying phrase that remains clear if bullets are reordered. Include that reference in the test name or in a nearby test comment. Build the mapping as each red-to-green slice lands.

Maintain a traceability record with the ticket that contains, for every criterion: its reference, test file and scenario or manual check, verification layer (unit, component, API, integration, or browser), expected result, latest run result, and any uncovered behavior. Link to evidence rather than treating a test filename or a planned test as proof of a pass. Mark a criterion verified only when every part of it has applicable evidence and the relevant checks have passed.

Choose the layer that can prove the claim: a mocked component test proves UI behavior under the simulated response, while an API test proves the server contract. Use an integration or browser check when the criterion spans those boundaries. If a dependent endpoint or workflow does not exist yet, record the missing integration check and its owning ticket; do not mark the original criterion fully verified from a guard or mock alone. Revisit the mapping whenever requirements, routes, UI behavior, or shared authorization rules change.

## Reporting

For evaluation runs, report fixture or dataset version, sample count, pass count, percentage, and failures for each PRD measure. Do not claim a target passed from a percentage alone when its sample size or failed cases are missing.

## Evaluation protocol

When the product has measurable model, retrieval, or decision quality targets, fix a versioned evaluation set before each run. Cover each supported input or outcome category at the sample size specified in the new project's PRD. Include success, rejection, missing or conflicting evidence, unauthorized use, and dependency failure cases where applicable. Evaluate output completeness and agreement with deterministic sources on every relevant case.

For each measure, report the fixture version, denominator, passing count, percentage, and failed case IDs. Record a baseline on the first run and report counter-metrics that reveal harmful successes or unnecessary rejections, with counts and denominators. Investigate regressions against the baseline before declaring a release target met. A percentage alone, or a result below the specified sample size, does not satisfy a release target.

Build the safety set from the new project's authorization and side-effect boundaries. Include session and cross-account checks when those concepts exist, repeated submissions, attempts to bypass approval gates, and external-tool failures. Assert the blocked action and unchanged state, not only the visible error.
