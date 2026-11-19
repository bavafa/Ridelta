# Ridelta decision log

Each entry records one decision and the reason for it. Newest entries go at the bottom.

Date of this round: 2026-11-18. Scope: high-level wireframes for Landing, Target, Sponsor and Prove at 1440 px and 390 px.

## How the design system was chosen

The design system came from the ui-ux-pro-max skill. The query was "analytics data story portfolio experimentation dashboard trustworthy". The dials were variance 3, motion 2 and density 6. Some results were accepted and some were changed. The reasons follow.

## Decisions

### D1. Wireframes are static HTML files in docs/wireframes

- **Decision:** One HTML file per view. Each file shows the desktop frame and the mobile frame side by side. All files share one stylesheet.
- **Why:** The files open in any browser with no build step. A reviewer can compare both sizes on one screen. They are wireframes, not application code.

### D2. Low fidelity, grayscale, with one blue for actions

- **Decision:** Shapes and text are gray and near black. The primary blue (#1E40AF) appears only on primary buttons, links, the targeting cutoff line and the store pin.
- **Why:** At this stage the review should be about structure and content, not color. Keeping blue for actions also tests that nothing depends on color to make sense.

### D3. Style: Minimalism and Swiss style (accepted from the skill)

- **Decision:** Grid-based layout, generous white space, high contrast, sans-serif type, no decoration.
- **Why:** The audience is hiring managers and practitioners. They value clarity and precision. The skill rates this style low risk for accessibility and performance.

### D4. Palette: navy and slate, amber kept for notes only (adjusted)

- **Decision:** Keep the skill palette of navy primary, slate text and a light slate background. The amber accent is not used in the product. In the wireframes, amber marks design notes only.
- **Why:** A second bright color would compete with the honesty labels. Amber already reads as "note" in many design tools, so it separates notes from the design.

### D5. Type: Fira Sans for all text, Fira Code for numbers only (adjusted)

- **Decision:** The skill suggested Fira Code for headings. Headings use Fira Sans instead. Fira Code is used for numbers, lever values and eyebrow labels.
- **Why:** The brief asks for a warm and professional voice. Code-style headings feel cold and technical. Fira Code still helps numbers, because its figures have equal width and line up in tables.

### D6. Landing pattern: short story in chapters (skill pattern rejected)

- **Decision:** The skill offered "Enterprise Gateway", which leads to a sales contact. It was rejected. The landing page follows the skill's second match, scroll storytelling, but with no scroll effects. Order: hook, headline results, how the modules connect, what is real and what is not.
- **Why:** This is a portfolio piece with nothing to sell. The goal is understanding in under 60 seconds. The skill itself says the story must work without scroll effects, so there are none.

### D7. Landing reading budget of 60 seconds

- **Decision:** The hero holds one headline and one paragraph of four short sentences. Then come three result cards with the same shape: question, one-line answer, one number, one label and one link. There are no controls, popups or cookie banners above the results.
- **Why:** The brief sets a limit of 60 seconds. A repeated card shape lets the eye scan instead of read. On mobile the cards drop the one-line answer and the chart preview to stay within the limit.

### D8. Honesty labels use shape plus word

- **Decision:** Real is a filled square. Estimated is a filled triangle. Simulated is a hollow circle. Each label always shows its word next to the shape.
- **Why:** The brief asks for a distinct shape and a word, not color alone. The skill rates "color only" as a high-severity issue. Filled versus hollow also hints at the meaning. Real and Estimated rest on real data, so they are solid. Simulated rests on assumptions, so it is hollow.

### D9. The label legend sits in the landing hero

- **Decision:** The three labels and their one-line meaning appear in the hero, before the first number.
- **Why:** A visitor should learn the labels before meeting a labeled number. Otherwise the labels look like decoration.

### D10. Mixed sources get two labels, not one

- **Decision:** When a view blends sources, both labels appear. The Sponsor map shows "Real map and trips" and "Simulated ranking". The zone table labels its trips column Real and its visits column Simulated.
- **Why:** One label would hide which part is real. Splitting them keeps the honesty rule exact.

### D11. Label choice per output

- **Decision:** Target outputs are Estimated, because they come from models fit on a real randomized test. Sponsor visit outputs and net cost are Simulated, because visit lift is an assumption. Sponsored ride counts and the holdout test sizes are Estimated, because they come from real trip volumes. All Prove outputs are Simulated.
- **Why:** The label follows the weakest input. If any input is assumed, the output is Simulated.

### D12. Placeholders in brackets, no invented results

- **Decision:** Every number in the wireframes is a bracketed placeholder such as [0.00].
- **Why:** The models do not exist yet. A made-up number in a wireframe can leak into a later draft as if it were a result.

### D13. One module layout for all three modules

- **Decision:** Each module page has the same order. Question as the page title, the answer in one sentence, the data source with its label, then levers on the left and results on the right. Results follow the same order: key numbers, main chart, comparison table, then "how to read this".
- **Why:** A visitor who learns one module can read the other two at once. The question-first title keeps the framing about return per incentive dollar.

### D14. Desktop levers in a sticky left panel, 320 px wide

- **Decision:** Levers sit in a fixed-width panel that stays in view while results scroll.
- **Why:** The visitor can move a lever and see the change in the same view. Left placement follows reading order: inputs first, outputs second.

### D15. Mobile levers open in place, closed on first visit

- **Decision:** On mobile, levers sit in an in-page panel that opens and closes. It is closed on first visit. There is no popup or bottom sheet.
- **Why:** Results come first for a reader who only wants the answer. An in-page panel keeps the back button and scroll position predictable. It also honors the "no popups" spirit across the site.

### D16. Mobile result strip pinned to the bottom

- **Decision:** Each mobile module page has a strip at the bottom with the two key numbers and their label.
- **Why:** With levers open, the charts move off screen. The strip shows the effect of each change without scrolling. It is two numbers only, so it covers little content.

### D17. Target and Sponsor update live, Prove uses a Run button

- **Decision:** Target and Sponsor recompute as a lever moves. Prove waits for "Run simulation". Changed levers stay marked until the next run.
- **Why:** Target and Sponsor are fast lookups on precomputed scores. Prove runs a marketplace simulation that takes seconds. Live updates there would feel broken and could show half-finished results.

### D18. Target uplift curve: lines told apart by style and direct labels

- **Decision:** Each policy has its own line style (solid, dashed, dotted) and a label at the line. Blanket is a single square point at 100 percent, because it reaches everyone. A blue line marks the current cutoff.
- **Why:** The skill had no direct match for an uplift curve, so this follows its general chart rules as a fallback: no color-only encoding, direct labels and a table view. Showing blanket as a point is more honest than drawing a line for it.

### D19. Every chart has a "View as table" link

- **Decision:** Each chart offers a table with the same numbers.
- **Why:** The skill names a table as the accessible fallback for every chart type used here. It also helps practitioners who want exact values.

### D20. Sponsor map: tiers by fill and hatch, ranks by number

- **Decision:** Zone tiers use gray steps plus a hatch pattern for the top tier. The top five zones carry rank numbers. The ranked table sits next to the map on desktop.
- **Why:** The skill warns that a map must not depend on color alone and needs a table fallback. The table is also the keyboard path through the map.

### D21. Sponsor on mobile: list first, map second

- **Decision:** A List and Map switch sits above the ranked zones. List is the default on mobile.
- **Why:** The skill flags maps as conditional on mobile. Small zones are hard to read and tap at 390 px. The list carries the same ranking.

### D22. Sponsor ends with a holdout test design

- **Decision:** The last result card proposes a test with sponsored zones, matched holdout zones, a duration and the smallest lift it can detect. It links to Prove.
- **Why:** Visit lift is an assumption. The honest next step is a plan to measure it. The link ties Sponsor to Prove.

### D23. Prove: estimates against a dashed truth line

- **Decision:** One row per test design. A marker shows the estimate, a bar shows the 95 percent interval and a dashed vertical line shows the true effect. Each design has its own marker shape and a text verdict ("covers the truth" or "misses the truth").
- **Why:** The core idea of Prove is the gap between estimate and truth. This layout shows bias and interval width in one look without relying on color.

### D24. Prove recommendation in plain English, near the top

- **Decision:** The recommendation sits in the answer box under the title. It is written by fixed rules from the results.
- **Why:** Hiring managers may read only the top of the page. Fixed rules keep the text consistent with the numbers.

### D25. Navigation

- **Decision:** Desktop has a top bar with the three modules on the left and Assumptions, Data and method and Case study on the right. Mobile has a top bar with a Menu button and a row of three module tabs on module pages. Each module page ends with Back and Next links.
- **Why:** Three modules fit in plain tabs, so they never hide behind a menu. Back and Next follow the story order: Target, Sponsor, Prove.

### D26. Touch targets and type size

- **Decision:** Buttons, tabs, segmented controls and menu are at least 44 px tall. Body text is 16 px. Small help text is no smaller than 13 px.
- **Why:** These are the skill's priority 1 and 2 rules for accessibility and touch.

### D27. Motion kept out of the wireframes

- **Decision:** The wireframes have no motion. The motion dial was set low (2 of 10).
- **Why:** Motion is not a high-level decision. The skill's advice for this tier is a short fade on scroll with a reduced-motion fallback. That can be added at visual design.

### D28. Name checker in scripts/check-names.py

- **Decision:** A short deny list of ride, taxi, delivery and mobility brand names. Unique names match in any case. Names that are also common words match only when capitalized. The script scans file names and file contents and can also scan a commit message with --text. It has a --self-test option.
- **Why:** The naming rule covers files, UI text, comments and commit messages. Common words such as "grab" and "via" would raise false alarms in lower case. The script skips its own file, because the deny list has to name what it denies.

### D29. Writing rules applied to UI text and notes

- **Decision:** UI text, design notes and this log use short sentences with no contractions, no semicolons, no em dashes and no hype words.
- **Why:** The brief sets these rules for all UI text and documents.

## Revision 1 (2026-11-18)

Feedback asked for six fixes. Layout, style and components stay the same. Desktop and mobile were both updated for Landing, Target, Sponsor and Prove.

### D30. Prove chart is now one simple scale

- **Decision:** "Estimated versus true effect" is replaced by "How close did each test get?". It is one horizontal scale with a diamond for the real effect, a circle for the group split test and a square for the hour-by-hour test. A dashed line and the words "off by [0.0] points" show each miss.
- **Why:** First-time visitors could not read confidence bars without instructions. A gap on one line needs no legend. Each marker keeps its own shape and name, so it still reads without color.

### D31. Ranges and bias moved to a closed Advanced section

- **Decision:** The old chart with 95 percent ranges and the bias table now sit in "Advanced: ranges, bias and technical names", closed by default.
- **Why:** Practitioners still get the full detail. Non-experts are not stopped by it.

### D32. "True effect size" becomes "Real effect of the offer"

- **Decision:** The lever is renamed and keeps its slider. Helper text: "Set the real answer, then see which test finds it."
- **Why:** Plain words state the point of the module. The word "Real" here is not the Real data label. The value still carries the Simulated label, because the visitor sets it.

### D33. Plain words in the main view, technical names in Advanced

- **Decision:** Main views use plain words. Extra rides (incremental rides). Who gets the offer (targeting policy) with options Everyone, Random, Likely riders and Moved by offer (blanket, random, propensity, uplift). How many riders get it (targeting cutoff). Return per offer dollar (incremental contribution per incentive dollar). How many cars are available, with Many, Some and Few (supply tightness). Group split test (A/B test). Hour-by-hour test (switchback test). Length of each time slot (switchback window). Area size (zone granularity). Starting areas (origin zones). How to check this for real (holdout test). Each module page has a closed "Advanced: technical names" section that maps each plain term to its technical name.
- **Why:** The first reader is often a hiring manager, not a specialist. Practitioners can still find the exact terms in one place.

### D34. Target policy control is a two by two grid on both sizes

- **Decision:** The four options for who gets the offer sit in a two by two grid on desktop as well as mobile.
- **Why:** The plain names are longer than the old ones and do not fit in one row of the 320 px lever panel.

### D35. Sponsor pays only on purchase

- **Decision:** The rider gets the discount on the ride, and the platform covers it when the ride ends. The sponsor pays its share only when the rider shows the offer code or a loyalty card at checkout. A new "How payment works" card shows these four steps. The cost share helper says "Paid only when the rider buys something."
- **Why:** This matches how a store would want to pay: for a sale, not for a trip. It is also the honest way to show that the platform carries the cost of rides with no purchase.

### D36. Sponsor headline metric is now extra purchases per sponsor dollar

- **Decision:** "Incremental visits per sponsor dollar" becomes "Extra purchases per sponsor dollar". A new assumed lever, "Visits that end in a purchase", sits under "Extra visits from the offer". The holdout test now compares purchases.
- **Why:** If the sponsor pays per purchase, its cost and its return both depend on purchases. The model cannot compute sponsor cost without a purchase rate. Both are assumptions, so the outputs stay Simulated.

### D37. Mall operator as a sponsor type

- **Decision:** A "Who sponsors" lever with Single store and Mall operator is now the first Sponsor lever. Helper: "For a mall, the mall operator pays. A purchase at any store in the mall counts." The page title reads "store or mall".
- **Why:** Malls gain from any purchase on site, so they can sponsor wider. One switch adds the case without a new page. On mobile the lever panel is shown open so the switch is visible in the wireframe.

### D38. Small mock of how riders see the offer

- **Decision:** A "How riders see the offer" card shows two small phone mocks: a banner on the home screen and a sponsored entry at the top of the destination search list. It sits next to "How payment works" on desktop and above it on mobile.
- **Why:** Visitors need to see where the offer appears to believe the funnel. The word "Sponsored" is always visible and the entry has a border, so the ad is never hidden among normal results.

### D39. Short PRD added

- **Decision:** docs/PRD.md now records the product brief, including the pay-on-purchase rule, the mall operator and the two places riders see the offer.
- **Why:** The feedback asked to update the PRD, and the project had none. It holds only what the brief and this revision already state.

### D40. Screenshots and review note

- **Decision:** Each frame is exported to design/screenshots as one PNG per view and size, using headless Chrome. design/REVIEW.md lists what changed.
- **Why:** Reviewers can see the result without running a server.

## Revision 2 (2026-11-18)

The Sponsor payment model changed. This revision replaces D35 and D36 and updates D37 and D38. Desktop and mobile were both updated for Sponsor. The Sponsor card on Landing was updated to match.

### D41. Sponsors pay a fixed fee per confirmed visit

- **Decision:** Sponsors pay a fixed fee per confirmed visit, not per purchase and not as a share of the discount. This replaces D35.
- **Why:** The platform's job is to bring a visitor to the store. Purchases depend on the store. Paying per purchase leaves the platform paying for visitors who find nothing they want.

### D42. The rider gets the discount as ride credit after checking in

- **Decision:** The rider earns the discount as ride credit after a confirmed check-in, not as a lower fare up front.
- **Why:** One reward model keeps the copy consistent. The platform pays the credit only for confirmed visits, so it never pays for a ride that did not reach the store.

### D43. Visits are confirmed by an in-app check-in, with a code scan as backup

- **Decision:** After drop-off the rider taps "I am here" within the check-in window. Location is read only at the moment of the tap. Where location is not accurate enough, such as inside malls, the rider scans a code at the entrance that changes regularly.
- **Why:** The app has location access only while it is open. Background tracking after a ride needs extra permission and clear consent, and indoor location is too inaccurate on its own.

### D44. Levers follow the new model

- **Decision:** "Sponsor share of the discount" and "Most the offer covers per ride" become "Fee per confirmed visit" and "Rider credit". "Visits that end in a purchase" is removed. "Check-in window" is added. The lever count stays at eight.
- **Why:** Purchases no longer drive cost or payment, so the purchase rate has no job. The window is a real product choice that changes how many visits are confirmed.

### D45. Headline metric returns to extra store visits per sponsor dollar

- **Decision:** The headline is "Extra store visits per sponsor dollar". This replaces D36. The second number is "Platform cost after sponsor fees". The holdout test compares rides that end at the store from areas with and without the offer.
- **Why:** The sponsor now buys visits, so return per sponsor dollar is counted in extra visits. Rides that end at the store can be counted in both groups, while check-ins exist only where the offer runs.

### D46. Two honesty lines under the results

- **Decision:** Under the key numbers: "A confirmed visit shows the rider came in. It does not show the offer caused the visit. The test below measures that." In the payment card: "A visit does not mean the rider bought something. It also does not mean the rider would have stayed home without the offer."
- **Why:** A check-in count is easy to mistake for impact. The lines keep the honesty rule without adding a new label.

### D47. A simple break-even check

- **Decision:** A line next to the results shows "Fee covers rider credit: [Yes]" with a Simulated label.
- **Why:** In a real launch the fee per visit has to cover the credit paid to riders plus platform costs. A yes or no is the smallest honest signal. Platform costs are left out until the Assumptions page sets them.

### D48. "What the rider sees" shows the full check-in flow

- **Decision:** The rider mock card now shows four moments: banner, search entry, after drop-off and check-in success. Three short fallback messages follow: location unclear, window ended and location off. The privacy line sits next to the "I am here" button. This updates D38.
- **Why:** The check-in is the new part of the funnel, so a reviewer needs to see it. The fallback messages show the model has an answer for common failures. They are copy mocks of the rider app, not designs of Ridelta's own loading, empty or error states.

### D49. Advanced gains "How visits are confirmed"

- **Decision:** A second closed Advanced section explains the four checks behind a confirmed visit and the code scan backup.
- **Why:** Practitioners will ask how visits are verified and how fraud is limited. Most visitors do not need it on first read.

## Visual design round (2026-11-18)

High-fidelity pages for Landing, Target, Sponsor and Prove are in design/ui. Each page is one responsive file. design/ui/index.html shows each page at 1440 px and 390 px side by side.

### D50. Palette B, Ink and gold

- **Decision:** Ivory paper (#FAF8F3), white cards, near-black ink (#1B1B1F), warm gray text (#5E5A55). Dark navy (#1B2D55) is for actions only. Deep gold (#8A6512) marks the result to look at. Gray (#BDB6A8) marks the options it is compared with. This updates D2 and D4.
- **Why:** Chosen by the owner from three options shown in design/ui/palette-sample.html. The brief asked for minimal, practical, trust-building, hopeful and elegant. Gold reads as value and is dark enough to pass contrast as text.

### D51. Sample values replace bracketed placeholders

- **Decision:** UI pages show plausible sample values. Every page carries a visible "Sample values, not results" note. This replaces D12 for the UI pages only. Wireframes keep brackets.
- **Why:** Charts and tables cannot be judged with brackets. The note keeps sample values from being read as findings. The values are internally consistent, so a reviewer can check the math.

### D52. One responsive page per view

- **Decision:** Each page is a single responsive HTML file using design/ui/ui.css. Below 960 px the layout follows the mobile wireframes: module tabs, Menu button, levers closed on load (D15) and a result strip at the bottom (D16).
- **Why:** One file per page is closer to the real build and avoids keeping two copies of the same content in step.

### D53. Gold highlights one thing per view

- **Decision:** On each view, gold marks only the selected or winning result: Moved by offer on Target, extra visits per sponsor dollar on Sponsor, the hour-by-hour test on Prove. Everything else uses ink and gray.
- **Why:** One accent per view tells the eye where to look first. Shapes and words still carry the meaning, so nothing depends on color alone.

### D54. Levers are real form controls

- **Decision:** Sliders, segmented choices and fields are native inputs with labels. Prove marks a changed lever with "changed" until Run is pressed (D17).
- **Why:** Native inputs give keyboard and screen reader support for free and show the real interaction in the mockup.

### D55. Light mode only

- **Decision:** The pages have one light look. There is no dark mode and no switch. This updates D50, whose dark set is dropped.
- **Why:** Ridelta is an illustrative portfolio site. One carefully tuned look serves it better than a second theme that reads less well. It also keeps the gold and navy roles exact.

## Build round 1 (2026-11-19)

### D56. Static React app on GitHub Pages
- **Decision:** Vite, React and TypeScript with hash routes. Model outputs are precomputed by Python scripts into small JSON files in public/data. The site deploys from main with GitHub Actions.
- **Why:** The site has no server work. Precomputed files keep the pages fast and let a visitor move levers live (D17).

### D57. Overture Maps Places for stores, Hillstrom stays for Target
- **Decision:** Sponsor store locations come from Overture Maps Places, not OpenStreetMap or NYC Open Data. Hillstrom stays as the Target source. Criteo is not used.
- **Why:** Overture has categories and a permissive license (CDLA Permissive 2.0, Apache 2.0 for some records) with no share-alike duty. Criteo is CC BY-NC-SA, which does not suit a public site. Hillstrom has no formal license, so only aggregate curve points are published, and the Data and method page must say so.

### D58. Target compares ways of picking at the same spend
- **Decision:** Each way of picking reaches as many riders as the budget and the cutoff allow. The headline compares Moved by offer with Random at the same spend. Everyone reaches all riders, so it is flagged "over budget" when it costs more.
- **Why:** An earlier version left the budget unused, so Everyone was compared with smaller spends. Equal spend is the fair test.

### D59. Offer cost is a fixed cost per rider reached
- **Decision:** Cost = riders reached x 20 percent who use the offer x discount x $20 fare. All three are placeholders for the Assumptions page.
- **Why:** This is the usual uplift-marketing rule. Charging the offer on every ride a reached rider takes was tried first. Under that rule, Moved by offer gained about 0 percent over Random at equal spend, because riders with high uplift also ride more. That finding belongs on the Data and method page. The rule is an assumption, so Target stays labeled Estimated and the page says the three values are placeholders.

### D60. Uplift model and evaluation
- **Decision:** Two gradient boosting models, one fit on treated riders and one on control riders, scored on a held-out half. Curves are cumulative uplift (treated visit rate minus control visit rate) by share of riders reached, in 5 percent steps. Per-rider scores are not published, only curve points. The script checks that the model beats random at 30 percent.
- **Why:** The test is randomized, so the held-out difference in means is a fair measure of uplift. Curve points are all the page needs and keep the derived files small.

### D61. Sponsor data and model
- **Decision:** Trips come from one month (2025-09) of the NYC high-volume for-hire file, read as zone-to-zone counts only. Stores come from Overture Maps Places (10 store types and shopping centers, confidence 0.9 or higher, 175 in total). The page ranks starting areas by extra visits per sponsor dollar. It spends the budget down the ranking and pays the fee for every confirmed visit.
- **Why:** Only zone-level counts are needed, so the published file is 373 KB. Rank by value per dollar keeps the order stable when the budget changes.

### D62. Sponsor placeholders
- **Decision:** These are assumptions, not data: a 4-week campaign, a visit rate with no offer (4 percent for a store, 8 percent for a mall), the share who check in in time (1 minus e to the power of minus window over 12 minutes) and an effect that falls from 1 at the store to 0.5 at the edge of the distance. They are stated in the Advanced section and move to the Assumptions page.
- **Why:** No public source gives these. Naming them keeps every output that uses them Simulated.

### D63. Holdout plan uses rides to the store's zone
- **Decision:** The plan pairs the busiest starting areas by volume and finds the shortest test (2 to 12 weeks) whose smallest detectable change is 10 percent or less, using two Poisson counts, 80 percent power and a 5 percent test. Rides to the store's zone stand in for rides to the store door.
- **Why:** No public data shows rides to a single door. The page says so next to the plan.

## Open items for the next round

- The Assumptions, Case study and Data and method pages are not designed yet.
- Loading, empty and error states are not designed yet.
- Real copy for the recommendation rules in Prove.
- Defaults for rider credit and the check-in window, to be set on the Assumptions page.
