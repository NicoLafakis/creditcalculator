// Central catalog: constants, rates, availability, and small utilities
// Source: hubspot-documentation/How HubSpot Credits work.md (Sept '25)

export type Edition = "Starter" | "Professional" | "Enterprise";
export type Product =
  | "SmartCRM"
  | "MarketingHub"
  | "SalesHub"
  | "ServiceHub"
  | "ContentHub"
  | "DataHub"
  | "CustomerPlatform"
  | "CommerceHub";

export type Currency =
  | "USD"
  | "EUR"
  | "GBP"
  | "JPY"
  | "AUD"
  | "CAD"
  | "COP"
  | "INR"
  | "SGD";

// Included monthly credits by edition (highest owned edition applies; not additive)
export const INCLUDED: {
  main: Record<Edition, number>;
  data: Record<Edition, number>;
} = {
  main: { Starter: 500, Professional: 3000, Enterprise: 5000 },
  data: { Starter: 500, Professional: 5000, Enterprise: 10000 },
};

// Credit consumption rates (confirmed numbers)
export const RATES = {
  customerAgent_perConversation: 100, // text channels
  prospectingMonitoring_perContactMonth: 100,
  prospectingDeepResearch_perCompany: 10,
  workflowBreezeAction: 10,
  buyerIntent_perCompanyMonth: 10,
  dataAgent_perPromptRecord: 10, // beta
} as const;

// Data Studio (Beta) rates — credits per destination sync
export const DATA_STUDIO_RATES = {
  smallPerDestination: 25,
  mediumPerDestination: 75,
  largePerDestination: 200,
} as const;

// Overage price per credit by currency
export const OVERAGE_PRICE_PER_CREDIT: Record<Currency, number> = {
  USD: 0.010,
  EUR: 0.010,
  GBP: 0.009,
  JPY: 1.20,
  AUD: 0.014,
  CAD: 0.013,
  COP: 30,
  INR: 0.84,
  SGD: 0.014,
};

// Capacity pack pricing (USD) — used for current UI. Other currencies not published in doc.
export const COSTS = {
  PACK_PRICE_PER_1000_USD: 10,
  OVERAGE_PER_CREDIT_USD: OVERAGE_PRICE_PER_CREDIT.USD,
} as const;

// Feature availability guardrails (non-blocking); min edition per product(s)
export const FEATURE_AVAILABILITY = {
  customerAgent: {
    products: [
      "SmartCRM",
      "MarketingHub",
      "SalesHub",
      "ServiceHub",
      "ContentHub",
      "DataHub",
      "CommerceHub",
    ] as Product[],
    minEdition: "Professional" as Edition,
  },
  prospectingAgent: {
    products: ["SalesHub"] as Product[],
    minEdition: "Professional" as Edition,
  },
  dataAgentBeta: {
    // Any Starter-edition product
    products: [
      "SmartCRM",
      "MarketingHub",
      "SalesHub",
      "ServiceHub",
      "ContentHub",
      "DataHub",
      "CommerceHub",
      "CustomerPlatform",
    ] as Product[],
    minEdition: "Starter" as Edition,
  },
} as const;

// Utility: round any positive credit count up to nearest 10 (for invoicing increments)
export function roundUpTo10(n: number): number {
  if (!Number.isFinite(n)) return 0;
  if (n <= 0) return 0;
  return Math.ceil(n / 10) * 10;
}

// Helper: compute included credits by group + edition
export function getIncludedCredits(group: "main" | "data", edition: Edition): number {
  return INCLUDED[group][edition];
}
