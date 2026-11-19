# Ridelta epics and stories

Source: docs/PRD.md, docs/decision-log.md and the UI in design/ui. Each epic and story is also a GitHub issue (issues 1 to 29, labeled epic or story) on the board at https://github.com/users/bavafa/projects/5.

## E1. App shell and design system

**What:** One web app with the header, module tabs, footer, honesty labels, lever controls and chart styles from design/ui.

**Why:** Every page reuses these parts. Building them once keeps the three modules consistent, which is how a visitor who learns one module can read the others (D13).

**Requirements**
- Palette B, Fira Sans and Fira Code, light mode only (D50, D55).
- Honesty labels use shape plus word: Real, Estimated, Simulated (D8).
- Desktop levers in a sticky left panel. Mobile levers closed on load, with a result strip pinned to the bottom (D14 to D16).
- No ride company names anywhere. scripts/check-names.py runs in CI.

**Acceptance criteria**
- All four pages render from shared components and match design/ui at 1440 px and 390 px.
- No horizontal page scroll at 375 px.
- Every control is reachable by keyboard and at least 44 px tall.
- CI fails when the name check fails.

### S1.1 Set up the app and deploy a blank page
The app builds, deploys to a public URL on every push to main, and runs the name check in CI.
- AC: a push to main updates the public URL. A commit with a banned name fails CI.

### S1.2 Build the shared layout
Header, module tabs, Menu button on mobile, footer, Back and Next links.
- AC: the current module is marked in the nav. Tabs show below 960 px. Back and Next follow Target, Sponsor, Prove.

### S1.3 Build the shared components
Honesty label, key number card, lever panel (slider, segmented choice, field), answer box, Advanced section, mobile result strip.
- AC: each component matches design/ui. Labels never rely on color alone. Advanced sections are closed by default.

## E2. Landing page

**What:** The home page: the problem, the answer and one headline result per module.

**Why:** Most hiring managers read only this page. It has to make the case in under 60 seconds (D7).

**Requirements**
- Hero with one headline, four short sentences and the label legend before the first number (D9).
- Three result cards with the same shape: question, answer, one number, one label, one link.
- Card numbers come from the module outputs, not typed in by hand.

**Acceptance criteria**
- No popups, banners or controls above the results.
- Mobile cards drop the answer line and the chart preview.
- Each card number matches its module's default result.

### S2.1 Build the landing page
- AC: matches design/ui/landing.html at both sizes. All links work.

### S2.2 Feed the result cards from module outputs
- AC: changing a module default changes the card number after the next build.

## E3. Target module

**What:** A page that ranks riders by how much an offer changes what they do, and compares four ways to pick who gets the offer at the same budget.

**Why:** Giving offers to likely riders pays people who would ride anyway. Showing the gain from picking riders the offer moves is the first and largest saving.

**Requirements**
- Data: the public Hillstrom email test. An email stands in for an offer, a site visit for a ride.
- Model: an uplift model fit on the randomized test, scored offline.
- Levers: budget, discount size, who gets the offer, how many riders get it, profit per ride. Results update live (D17).
- Outputs: extra rides, cost per extra ride, return per offer dollar, the extra rides chart and the comparison table. All labeled Estimated.

**Acceptance criteria**
- The four ways to pick are compared at the same budget.
- All curves meet the Everyone point at 100 percent.
- Every chart has a table view with the same numbers.
- Advanced lists the technical names.

### S3.1 Load and prepare the Hillstrom data
- AC: a script downloads the data, records its source and builds the treated and control groups. Row counts match the published file.

### S3.2 Fit the uplift model and export scores
- AC: the model beats random targeting on a held-out uplift curve. Scores and curve points are exported as a static file the page reads.

### S3.3 Compute results from the levers
- AC: extra rides, cost per extra ride and return per offer dollar recompute in under 100 ms when a lever moves. A unit test checks the math against a hand-worked case.

### S3.4 Build the Target page
- AC: matches design/ui/target.html. The cutoff line follows the lever. The selected way to pick is highlighted in the table.

## E4. Sponsor module

**What:** A page that shows which starting areas a store or mall should sponsor rides from, with a fixed fee per confirmed visit.

**Why:** A store that wants visitors can pay part of the offer cost. This lowers the platform's cost per extra ride without cutting the offer.

**Requirements**
- Data: NYC for-hire trip records (all operators combined), NYC taxi zones, store locations from Overture Maps Places (CDLA Permissive 2.0 and Apache 2.0). Visit lift is an assumption.
- Levers: who sponsors, store, budget, fee per confirmed visit, rider credit, check-in window, how far riders can start from, extra visits from the offer.
- Outputs: map and ranked list of areas, extra store visits per sponsor dollar, platform cost after fees, "Fee covers rider credit" and a holdout test plan.
- The rider check-in flow and its fallback messages are shown as copy mocks.

**Acceptance criteria**
- Outputs that depend on visit lift are labeled Simulated. Trip counts are labeled Real or Estimated (D10, D11).
- The map has a table with the same ranking. Mobile shows the list first (D21).
- The two honesty lines from D46 appear under the results.
- The test plan links to Prove.

### S4.1 Prepare trip, zone and store data
- AC: weekly trips from each zone to each store are precomputed into a static file. The source and date range are recorded.

### S4.2 Compute the ranking and sponsor results
- AC: ranking and outputs recompute live from the levers. A unit test checks fee, credit and platform cost on a hand-worked case.

### S4.3 Size the holdout test
- AC: the plan gives areas with and without the offer, duration and smallest detectable change, from real trip volumes.

### S4.4 Build the Sponsor page
- AC: matches design/ui/sponsor.html, including the rider screens, payment steps and both Advanced sections.

## E5. Prove module

**What:** A marketplace simulator that runs the same offer as a group split test and an hour-by-hour test, then shows how close each gets to the real effect.

**Why:** When cars are scarce, a group split test overstates the offer's effect. Showing this with a known answer explains why the test design matters before money is spent.

**Requirements**
- The visitor sets the real effect. Levers: real effect, how many cars, which test, time slot length, area size, test length.
- Runs on "Run the tests", not live (D17). Changed levers stay marked until the next run.
- Outputs: what each test found, how far off each was, and a recommendation written by fixed rules.
- Ranges, bias and technical names sit in a closed Advanced section (D31).

**Acceptance criteria**
- With many cars, both tests land close to the real effect. With few cars, the group split test reads high.
- A run finishes in under 5 seconds on a mid-range laptop.
- The recommendation text always matches the numbers shown.
- All outputs are labeled Simulated.

### S5.1 Build the marketplace simulator
- AC: riders and cars interact by hour and area. With the offer off, both groups match. A fixed seed gives the same result twice.

### S5.2 Run both test designs and estimate the effect
- AC: each design returns an estimate, a 95 percent range and bias against the real effect.

### S5.3 Write the recommendation rules
- AC: rules cover each car level and test choice. Each rule has a unit test.

### S5.4 Build the Prove page
- AC: matches design/ui/prove.html. The run state, changed marks and Advanced section work.

## E6. Assumptions, Data and method, Case study

**What:** Three supporting pages: every default with its reason, every data source and method, and a short write-up of the project.

**Why:** Practitioners will check the method before they trust a number. These pages also hold the technical detail the main pages leave out.

**Requirements**
- Assumptions sets the open defaults: rider credit and check-in window.
- Data and method lists each source, its date range, its license and the honesty label it supports.
- Case study tells the story in order: Target, Sponsor, Prove.

**Acceptance criteria**
- Every lever default on the module pages links to its reason on Assumptions.
- Every Real label traces to a source listed on Data and method.

### S6.1 Design the three pages
- AC: designs in design/ui at both sizes, approved before build.

### S6.2 Build the three pages
- AC: matches the approved designs. All links from module pages resolve.

## E7. Launch quality

**What:** Accessibility, performance, states and a final review before sharing the link.

**Why:** A portfolio piece is judged on finish. One broken chart or unreadable label undoes the rest.

**Requirements**
- Loading, empty and error states for each module.
- WCAG AA contrast, keyboard paths and screen reader text for every chart.
- Writing rules from the PRD checked on all UI text.

**Acceptance criteria**
- Lighthouse accessibility and performance scores of 90 or more on every page.
- Each module shows a clear message when its data fails to load.
- No em dashes, semicolons or contractions in UI text.

### S7.1 Design and build loading, empty and error states
- AC: each state appears in the right case and keeps the page usable.

### S7.2 Run the accessibility and performance pass
- AC: Lighthouse targets met. Issues found are fixed or logged.

### S7.3 Final copy and fact review
- AC: every number and label checked against its source. The name check and writing rules pass.
