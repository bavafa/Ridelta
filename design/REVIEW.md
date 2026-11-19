# Ridelta wireframe review

Screenshots are in design/screenshots, one file per view and size, such as prove-desktop.png and prove-mobile.png. Live files are in docs/wireframes. Each change below has its reason in docs/decision-log.md (D30 to D40).

## Revision 1 (2026-11-18)

1. **Prove chart.** The confidence bar chart is replaced by one simple scale. It shows the real effect and where each test landed, with "off by [0.0] points" for each miss. Ranges and the bias table moved into a closed Advanced section.
2. **Real effect lever.** "True effect size" is now "Real effect of the offer", still a slider. Helper: "Set the real answer, then see which test finds it."
3. **Plain words.** Main views on all four pages now use plain words, such as extra rides, who gets the offer, how many cars are available, group split test, hour-by-hour test and how to check this for real. Each module has a closed "Advanced: technical names" section with the technical terms.
4. **Pay on purchase.** A "How payment works" card on Sponsor shows that the sponsor pays only when the rider buys something, proven by code or loyalty card at checkout. The headline is now extra purchases per sponsor dollar. A new assumed lever sets the share of visits that end in a purchase. The PRD records the rule.
5. **Mall operator.** "Who sponsors" offers Single store or Mall operator. For a mall, the operator pays and any purchase in the mall counts.
6. **How riders see the offer.** A small mock on Sponsor shows a home screen banner and a sponsored entry in the destination search list.

## Revision 2 (2026-11-18)

Sponsor now uses a check-in model. Reasons are in docs/decision-log.md (D41 to D49).

1. **Pay per confirmed visit.** The sponsor pays a fixed fee for each confirmed visit, whether or not the rider buys. The rider gets the discount as ride credit after checking in. "How payment works" shows the four new steps.
2. **Sponsor type helper.** Single store pays for visits to its own door. A mall operator pays for a visit to any entrance or participating store.
3. **Levers.** New: fee per confirmed visit, rider credit and check-in window. Removed: sponsor share of the discount, most the offer covers per ride and visits that end in a purchase.
4. **Results.** The headline is back to extra store visits per sponsor dollar. A line says a confirmed visit does not prove the offer caused it. A break-even line shows whether the fee covers the rider credit.
5. **What the rider sees.** Banner, search entry, after drop-off with the privacy line, check-in success, and three fallback messages.
6. **Advanced.** New section "How visits are confirmed".
7. **Landing.** The Sponsor card now says sponsors pay a fixed fee for each confirmed visit.
