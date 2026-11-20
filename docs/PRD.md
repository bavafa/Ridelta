# Ridelta product requirements

## Summary

Ridelta shows how a two-sided ride marketplace can get more rides from every incentive dollar. It is a portfolio piece for hiring managers and practitioners. It is one web app with a landing page and three connected modules: Target, Sponsor and Prove.

## Why

Ride marketplaces spend heavily on rider offers, and much of that money goes to riders who would have ridden anyway. Ridelta shows three ways to get more from the same spend: pick riders the offer moves, let stores pay for visits they want, and measure the result with a test that does not mislead. It shows a hiring manager that the author can turn public data into a business decision and be honest about what is known.

## Who it is for

Hiring managers, who should get the answer in under 60 seconds. Practitioners, who should find the method and the exact terms in one click.

## Rules that apply everywhere

- Never name a ride, taxi, delivery or mobility company. Say "a ride marketplace" or "the platform". scripts/check-names.py checks this before every commit.
- Plain, warm, professional writing. Short sentences. No em dashes, no semicolons, no contractions, no hype words.
- Every number and chart carries a label: Real, Estimated or Simulated. Each label has its own shape and a word.
- No company financial figures. The framing is better return per incentive dollar.
- The main view uses plain words. Technical names live in Advanced sections and on the Data and method page.

## Target

Ranks riders by how much an offer changes what they do (uplift modeling), instead of how likely they are to ride. It compares four ways to pick who gets the offer at the same budget: everyone (blanket), random, likely riders (propensity) and moved by offer (uplift).

- Data: the public Hillstrom randomized email test. An email stands in for a ride offer. A site visit stands in for a ride.
- Levers: total offer budget, discount size, who gets the offer, how many riders get it, profit per ride.
- Outputs: extra rides, cost per extra ride, return per offer dollar, and a chart of extra rides for each way of picking.

## Sponsor

A sponsor pays for confirmed store visits from sponsored rides. The page ranks the starting areas most likely to bring new visitors.

- Sponsor types: a single store pays for confirmed visits to its own door. A mall operator pays for a confirmed visit to any entrance or participating store.
- Payment rule: the sponsor pays a fixed fee for each confirmed visit, whether or not the rider buys. It is not a share of the discount and not a fee per purchase.
- Rider reward: the rider gets the discount as ride credit after a confirmed check-in.
- How riders learn about the offer: a banner on the home screen of the ride app, or a sponsored entry in the destination search list. Copy: "Get up to $[5.00] back in ride credit when you check in." The label "Sponsored" is always visible.
- Check-in flow: after drop-off, the app shows "You have arrived at [Store name]" with an "I am here" button. On success, it shows "Visit confirmed" and adds the credit. Fallback messages cover low location confidence (scan the entrance code), an expired window and location turned off.
- Data: NYC for-hire trip records (all operators combined), NYC taxi zones and store locations from Overture Maps Places. Extra visits are an assumption, so related outputs are Simulated.
- Levers: who sponsors, store or mall, sponsor budget, fee per confirmed visit, rider credit, check-in window, how far riders can start from, extra visits from the offer (assumed).
- Outputs: a map and ranked list of starting areas, extra store visits per sponsor dollar, platform gross profit (fees minus rider credit), whether the fee covers the rider credit, and a proposed way to check the result for real (a holdout test that compares rides ending at the store from areas with and without the offer).

### Check-in requirements

- The rider can check in only once per ride, within the check-in window.
- The check-in uses location at the moment of the tap, and no background tracking.
- A code scan is available when location confidence is low. The code changes regularly, so a photo of it cannot be reused.
- The sponsor is charged only for confirmed check-ins.
- The platform pays the rider credit only after a confirmed check-in.
- Privacy line near the check-in button: "We check your location only when you tap "I am here." We do not track you after your ride."

### Open questions

- Defaults for rider credit and the check-in window are placeholders. They will be set on the Assumptions page.
- In a real launch, the fee per visit must cover the rider credit plus platform costs. The results show "Fee covers rider credit" as a first check.

## Prove

A marketplace simulator runs the same offer as a group split test (rider-level A/B test) and as an hour-by-hour test (switchback test), then compares both with the real effect set by the visitor.

- Levers: real effect of the offer, how many cars are available, which test to run, length of each time slot, area size, how long the test runs.
- Outputs: what each test found, how far off each test was, and a plain-English recommendation. Confidence ranges, bias and technical names sit in a collapsed Advanced section.

## Out of scope for now

Assumptions, Case study and Data and method pages. Loading, empty and error states.
