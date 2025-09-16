## How HubSpot Credits work

- Credits are a flexible, cross‑feature unit that resets monthly and does not roll over; they are consumed per action or per recurrence as defined by the rate sheet, and certain features may also trigger other billable services (e.g., telephony minutes or SMS) in addition to credits.[^1]
- Included monthly credits are set by the highest‑level edition owned and are not additive across products; if multiple products are owned, the highest applicable included amount applies, and credits can be increased via capacity packs or by enabling per‑credit overages with monthly invoicing in 10‑credit increments.[^1]


## Included credits by edition

- Highest‑level edition for Smart CRM, Marketing Hub, Sales Hub, Service Hub, and Content Hub: Starter = 500, Professional = 3,000, Enterprise = 5,000, with the single highest edition across these products determining inclusions when multiple are owned.[^1]
- Data Hub and Customer Platform inclusions are higher: Starter = 500, Professional = 5,000, Enterprise = 10,000, and if both a main Hub and Data Hub are owned, the highest applicable inclusion applies (e.g., Marketing Hub Pro + Data Hub Pro = 5,000).[^1]

| Product group | Starter | Professional | Enterprise |
| :-- | :-- | :-- | :-- |
| Smart CRM, Marketing, Sales, Service, Content | 500 [^1] | 3,000 [^1] | 5,000 [^1] |
| Data Hub, Customer Platform | 500 [^1] | 5,000 [^1] | 10,000 [^1] |

## Buying more credits and overages

- Additional capacity packs are sold in 1,000‑credit monthly units at **\$10 per pack** and will auto‑upgrade as usage exceeds available credits unless overages are enabled; proration applies for the remainder of the current billing period and packs persist through term until removed at renewal.[^1]
- Optional overages bill monthly at the per‑credit rate below with invoices issued in increments of 10 credits; admins can also set a maximum monthly limit to cap spend.[^1]

| Currency | Overage price per credit |
| :-- | :-- |
| USD | 0.010 [^1] |
| EUR | 0.010 [^1] |
| GBP | 0.009 [^1] |
| JPY | 1.20 [^1] |
| AUD | 0.014 [^1] |
| CAD | 0.013 [^1] |
| COP | 30 [^1] |
| INR | 0.84 [^1] |
| SGD | 0.014 [^1] |

## Credit rate sheet (confirmed numbers)

- Breeze Agents: Customer Agent — 100 credits per handled conversation on text‑based channels; Prospecting Agent — 100 credits to enable monthly monitoring of one contact; Prospecting Agent deep research — 10 credits per company.[^1]
- Breeze Automation: Workflows — 10 credits per Breeze action execution in a workflow.[^1]
- Buyer Intent: 10 credits to enable intent signals to create/monitor a company for one month.[^1]

| Category | Feature | Action | Credits |
| :-- | :-- | :-- | :-- |
| Breeze Agents | Customer Agent | Handle one conversation (text) | 100 [^1] |
| Breeze Agents | Prospecting Agent | Enable monthly monitoring of one contact | 100 [^1] |
| Breeze Agents | Prospecting Agent | Deep research on one company | 10 [^1] |
| Breeze Automation | Workflows | Execute one Breeze action | 10 [^1] |
| Buyer Intent | Intent | Enable/monitor one company for a month | 10 [^1] |

## Beta features and current beta rates

- Breeze Data Agent (Beta): 10 credits to generate a response to one prompt for one record over text‑based channels, with availability across any Starter‑edition product.[^1]
- Data Studio (Beta): Run sync per destination — small source (<500K rows) = 25 credits, medium source (500K–5M rows) = 75 credits, large source (>5M rows) = 200 credits.[^1]

| Category | Feature (Beta) | Action | Credits |
| :-- | :-- | :-- | :-- |
| Breeze Agents | Data Agent | Generate response to one prompt for one record (text) | 10 [^1] |
| Data Studio | Data Studio | Sync small source per destination | 25 [^1] |
| Data Studio | Data Studio | Sync medium source per destination | 75 [^1] |
| Data Studio | Data Studio | Sync large source per destination | 200 [^1] |

## Other beta agents with no published rate yet

- Customer Agent — voice minutes, Closing Agent, Customer Handoff Agent, Customer Health Agent, Blog Research Agent, Company Research Agent, Deal Loss Agent, RFP Agent, Sales‑to‑Marketing Feedback Agent, Social Post Agent, Shopify Store Performance Agent, and Call Recap Agent are listed in beta with no rate specified in the sheet; rates may be adjusted during beta and HubSpot aims to give 30 days’ notice before credit billing begins, though this may vary by beta.[^1]
- Breeze Automation betas include Marketing Studio content creation, Sales Meeting Notetaker per unique user per month, and Feedback Topics analysis, each currently listed without a published credit rate in the sheet.[^1]


## Agent availability by product edition

- Customer Agent: Available with Professional or Enterprise editions of Marketing Hub, Sales Hub, Service Hub, Content Hub, Data Hub, Commerce Hub, or Smart CRM.[^1]
- Prospecting Agent: Available with Sales Hub Professional or Enterprise.[^1]

| Agent | Availability |
| :-- | :-- |
| Customer Agent | Pro/Enterprise of Marketing, Sales, Service, Content, Data, Commerce, or Smart CRM [^1] |
| Prospecting Agent | Sales Hub Professional or Enterprise [^1] |
| Blog Research Agent (Beta) | Content Hub Professional or Enterprise [^1] |
| Closing Agent (Beta) | Content Hub Professional or Enterprise [^1] |
| Social Post Agent (Beta) | Marketing Hub Professional or Enterprise [^1] |
| Handoff, Health, Company Research, Data Agent, Deal Loss, RFP, Shopify Store Performance, Call Recap, Sales‑to‑Marketing Feedback (Betas) | Any Starter‑edition product [^1] |

## Smart CRM and Intelligence notes

- Smart CRM includes extensive data quality and enrichment‑oriented features across tiers, and several Intelligence capabilities indicate that they “may consume HubSpot Credits” or “consume HubSpot Credits” where applicable, with exact consumption governed by the current rate sheet and the beta policy; no per‑record enrichment credit rate is published in this catalog.[^1]
- Where Intelligence features are automated or recurring (e.g., automated intent orchestration or continuous enrichment), note that the rate sheet’s recurrence model applies when credits are in scope; many of these Intelligence capabilities are flagged as features rather than explicit rated actions in this document.[^1]


## How credit consumption accrues

- Actions consume credits per event (e.g., a conversation handled, a workflow action executed), while recurring features consume on activation and monthly while enabled, with timing in a month dependent on account configuration; some features can also trigger separate service charges like minutes or SMS.[^1]
- Automated, bulk, and high‑volume features can consume credits at scale and accelerate total usage within a monthly cycle, which is why capacity pack planning or overage caps are recommended operationally.[^1]


## Cost formulas

- Let total monthly usage be $U$ credits and included monthly credits be $I$; overage credits are $O = \\max(0, U - I)$ and round‑up capacity packs are $P = \\lceil O / 1000 \\rceil$; monthly pack cost is \$C_{packs} = 10 \\times P\$ (USD), and optional per‑credit overages are \$C_{over} = 0.010 \\times O\$ (USD) per the overage price table.[^1]
- Admins can choose either auto‑upgrade to capacity packs or keep the original committed capacity with end‑of‑month overage billing, and can set a maximum monthly limit to control spend.[^1]


## Worked examples (real numbers)

- Customer Agent on Professional: 120 handled conversations → $120 \\times 100 = 12{,}000$ credits; included $I=3{,}000$; overage $O=9{,}000$; packs $P=\\lceil 9000/1000 \\rceil = 9$; cost $$
C_{packs} = 9 \\times \\$10 = \\$90$; optional overage path at $0.010\\times 9000 = \\$90
$$ in USD.[^1]
- Prospecting Agent monitoring on Enterprise: 500 contacts monitored for a month → $500 \\times 100 = 50{,}000$ credits; included $I=5{,}000$; overage $O=45{,}000$; packs $P=45$; cost $$
C_{packs}=45\\times\\$10=\\$450$; optional overage path at $0.010\\times 45{,}000=\\$450
$$ in USD.[^1]


## Operational guidance

- Use the included credits table by highest‑level edition, map expected monthly actions to the rate sheet, and plan capacity packs in 1,000‑credit increments; for volatile workloads or short‑term spikes, consider enabling overages with a spend cap to avoid persistent pack upgrades.[^1]
- Track consumption and change management through the account’s credits configuration; remember that beta features may begin consuming credits with notice and that published rates can evolve, so rely on the current catalog rate sheet for authoritative numbers when modeling.[^1]


## Full beta policy (from catalog)

- Beta features may or may not consume credits, rates can change during beta, and HubSpot aims to provide at least 30 days’ notice before starting credit consumption; the HubSpot Beta Services Terms apply to all betas.[^1]

If a specific feature is not listed with a numeric rate above, the catalog does not publish a per‑use number for it at this time; planning should therefore reference only the explicit rates and policies in the current catalog until updated by HubSpot.[^1]

<div style="text-align: center">⁂</div>

[^1]: HubSpot-Pricing.md

