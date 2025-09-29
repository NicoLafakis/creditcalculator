// Scenario data model & mapping utilities for applying scenario features to calculator inputs
// Generated from CSV -> JSON conversion (see b2b-scenarios.json & b2c-scenarios.json)

import b2bRaw from './assets/b2b-scenarios.json';
import b2cRaw from './assets/b2c-scenarios.json';

export interface ScenarioFeature {
  feature: string;
  description: string;
  rawQuantity: string;        // e.g. "3,000 conversations"
  quantity: number;           // parsed numeric quantity
  rateDescription: string;    // e.g. "100 credits per conversation"
  creditsPerUnit: number;     // numeric credit rate
  monthlyCredits: number;     // quantity * creditsPerUnit (as provided)
}

export interface ScenarioRecord {
  scenario: string;
  features: ScenarioFeature[];
  totalMonthlyCredits: number;
}

export const B2B_SCENARIOS = b2bRaw as ScenarioRecord[];
export const B2C_SCENARIOS = b2cRaw as ScenarioRecord[];

// Calculator input keys we can influence via scenarios
export interface CalculatorInputsPatch {
  conv?: number;            // Customer Agent conversations
  monContacts?: number;     // Prospecting monitored contacts
  deepCompanies?: number;   // Prospecting deep research companies
  wfActions?: number;       // Workflow Breeze actions
  intentCompanies?: number; // Buyer intent companies
  dataPrompts?: number;     // Data Agent prompts
}

// Mapping rules: scenario feature name (case-insensitive substring match) -> calculator field
// We'll use the first rule that matches. Order matters (more specific first).
interface FeatureMappingRule {
  pattern: RegExp;
  field: keyof CalculatorInputsPatch;
  // whether quantity represents direct units for the field
  // (if false, we might ignore or implement custom logic later)
  direct?: boolean;
}

export const FEATURE_MAPPING_RULES: FeatureMappingRule[] = [
  { pattern: /customer\s+agent/i, field: 'conv', direct: true },
  { pattern: /prospecting\s+agent/i, field: 'monContacts', direct: true },
  { pattern: /deep\s+research/i, field: 'deepCompanies', direct: true },
  { pattern: /breeze\s+actions?\s+in\s+workflows/i, field: 'wfActions', direct: true },
  { pattern: /workflow/i, field: 'wfActions', direct: true },
  { pattern: /buyer\s+intent\s+tracking/i, field: 'intentCompanies', direct: true },
  { pattern: /intent\b/i, field: 'intentCompanies', direct: true },
  { pattern: /data\s+agent/i, field: 'dataPrompts', direct: true },
  // Additional features not yet mapped to existing calculator fields are intentionally omitted:
  // e.g., Content Agent, Knowledge Base Agent, AI-Powered Email, Social Media Agent, etc.
];

export interface AppliedFeature {
  feature: ScenarioFeature;
  mappedField?: keyof CalculatorInputsPatch;
}

export interface ApplyScenarioResult {
  patch: CalculatorInputsPatch;           // values to merge into calculator state
  applied: AppliedFeature[];              // features mapped
  unmapped: AppliedFeature[];             // features not mapped
  totalCreditsOfMapped: number;           // sum of monthlyCredits for mapped features
  totalCreditsOfUnmapped: number;         // credits for unmapped (for potential future fields)
}

function findMapping(featureName: string): keyof CalculatorInputsPatch | undefined {
  for (const rule of FEATURE_MAPPING_RULES) {
    if (rule.pattern.test(featureName)) return rule.field;
  }
  return undefined;
}

export function applyScenarioFeatures(features: ScenarioFeature[]): ApplyScenarioResult {
  const patch: CalculatorInputsPatch = {};
  const applied: AppliedFeature[] = [];
  const unmapped: AppliedFeature[] = [];
  let mappedCredits = 0;
  let unmappedCredits = 0;

  for (const f of features) {
    const field = findMapping(f.feature);
    if (field) {
      // Additive: we assume selecting multiple scenarios sums their intent values.
      // If you'd rather override instead of sum, change to assignment.
      patch[field] = (patch[field] || 0) + f.quantity;
      applied.push({ feature: f, mappedField: field });
      mappedCredits += f.monthlyCredits;
    } else {
      unmapped.push({ feature: f });
      unmappedCredits += f.monthlyCredits;
    }
  }

  return {
    patch,
    applied,
    unmapped,
    totalCreditsOfMapped: mappedCredits,
    totalCreditsOfUnmapped: unmappedCredits,
  };
}

// Helper: merge a patch into existing calculator input values
export function mergeCalculatorInputs(current: Required<CalculatorInputsPatch>, patch: CalculatorInputsPatch): Required<CalculatorInputsPatch> {
  return {
    conv: patch.conv !== undefined ? patch.conv : current.conv,
    monContacts: patch.monContacts !== undefined ? patch.monContacts : current.monContacts,
    deepCompanies: patch.deepCompanies !== undefined ? patch.deepCompanies : current.deepCompanies,
    wfActions: patch.wfActions !== undefined ? patch.wfActions : current.wfActions,
    intentCompanies: patch.intentCompanies !== undefined ? patch.intentCompanies : current.intentCompanies,
    dataPrompts: patch.dataPrompts !== undefined ? patch.dataPrompts : current.dataPrompts,
  };
}

// Utility to aggregate multiple scenario selections by combining patches
export function aggregateScenarioSelections(selected: ScenarioFeature[][]): ApplyScenarioResult {
  const allFeatures = selected.flat();
  return applyScenarioFeatures(allFeatures);
}
