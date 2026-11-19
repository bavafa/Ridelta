# Ridelta product requirements

## Summary

Ridelta shows how a two-sided ride marketplace can get more rides from every incentive dollar. It is a portfolio piece for hiring managers and practitioners. It is one web app with a landing page and three connected modules: Target, Sponsor and Prove.

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

A sponsor helps pay for ride offers from the starting areas most likely to bring new shoppers.

- Sponsor types: a single store, or a mall operator. For a mall, the operator pays, and a purchase at any store in the mall counts.
- Payment rule: the rider gets the discount on the ride, and the platform covers it when the ride ends. The sponsor pays its share only when the rider makes a purchase. The rider proves the purchase with the offer code or a loyalty card at checkout. A ride that ends at the store with no purchase costs the sponsor nothing.
- How riders learn about the offer: a banner on the home screen of the ride app, and a sponsored entry at the top of the destination search list. The word "Sponsored" is always visible.
- Data: NYC for-hire trip records (all operators combined), NYC taxi zones and open store data. Extra visits and the share of visits that end in a purchase are assumptions, so related outputs are Simulated.
- Levers: who sponsors, store or mall, sponsor budget, most the offer covers per ride, sponsor share of the discount, how far riders can start from, extra visits from the offer (assumed), visits that end in a purchase (assumed).
- Outputs: a map and ranked list of starting areas, extra purchases per sponsor dollar, platform cost after the sponsor share, and a proposed way to check the result for real (a holdout test).

## Prove

A marketplace simulator runs the same offer as a group split test (rider-level A/B test) and as an hour-by-hour test (switchback test), then compares both with the real effect set by the visitor.

- Levers: real effect of the offer, how many cars are available, which test to run, length of each time slot, area size, how long the test runs.
- Outputs: what each test found, how far off each test was, and a plain-English recommendation. Confidence ranges, bias and technical names sit in a collapsed Advanced section.

## Out of scope for now

Assumptions, Case study and Data and method pages. Loading, empty and error states.
