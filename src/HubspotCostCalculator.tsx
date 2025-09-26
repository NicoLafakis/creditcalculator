import React, { useMemo, useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Info, Calculator, BarChart as BarChartIcon, FileText, Printer, Trash, ArrowUp } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/**
 * Breeze Credit Calculator (Accessible)
 * - WCAG AA color/contrast on light theme (white bg, near-black text)
 * - Multi-page tabs: Overview, Included, Rates, Scenarios, Calculator
 * - Calculator supports GA-only vs GA+Beta modeling
 * - Print-friendly (use browser print for PDF)
 */

import { INCLUDED, RATES, COSTS, type Edition, type Currency, OVERAGE_PRICE_PER_CREDIT, roundUpTo10, DATA_STUDIO_RATES } from "./catalog";
import FAQPage from "./FAQPage";
<<<<<<< HEAD
import { B2B_SCENARIOS, B2C_SCENARIOS, applyScenarioFeatures, ScenarioRecord, ScenarioFeature } from './scenarios';
=======
>>>>>>> 2dd7272 (Add comprehensive FAQ for HubSpot Breeze AI and Credits)

function dollars(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

import { Tooltip as UITooltip, TooltipTrigger as UITooltipTrigger, TooltipContent as UITooltipContent } from "./components/ui/tooltip";

function SectionTitle({ icon: Icon, title, subtitle, tooltip }: { icon?: any; title: string; subtitle?: string; tooltip?: string }) {
  return (
    <div className="flex items-center gap-3">
      {Icon ? <Icon className="h-5 w-5" aria-hidden /> : null}
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold leading-tight text-zinc-900">{title}</h3>
          {tooltip ? (
            <UITooltip>
              <UITooltipTrigger tabIndex={0} className="ui-info-trigger">i</UITooltipTrigger>
              <UITooltipContent className="ui-right ui-prominent">{tooltip}</UITooltipContent>
            </UITooltip>
          ) : null}
        </div>
        {subtitle ? <p className="text-sm text-slate-700">{subtitle}</p> : null}
      </div>
    </div>
  );
}

export default function HubSpotCreditsInfographic() {
  const STORAGE_KEY = "hubspot_credit_calc_state_v1";
  // Simple in-app page switch between calculator and FAQ
  const [showFAQ, setShowFAQ] = useState(false);
  // Ownership profile: dual pickers, highest applies (not additive)
  const [editionMain, setEditionMain] = useState<Edition>("Professional");
  const [editionData, setEditionData] = useState<Edition>("Starter");

  // Feature tier: GA-only vs GA + Beta
  const [featureTier, setFeatureTier] = useState<"ga" | "ga_beta">("ga");

  // Currency for overage pricing
  const [currency, setCurrency] = useState<Currency>("USD");

  // Calculator inputs
  const [conv, setConv] = useState(120); // Customer Agent conversations
  const [monContacts, setMonContacts] = useState(200); // Prospecting monitoring contacts
  const [deepCompanies, setDeepCompanies] = useState(50); // Prospecting deep research companies
  const [wfActions, setWfActions] = useState(500); // Workflow Breeze actions
  const [intentCompanies, setIntentCompanies] = useState(100); // Buyer intent companies
  const [dataPrompts, setDataPrompts] = useState(0); // Data Agent prompts (beta)
  // Data Studio (Beta): sources × destinations per month by size
  const [dsSmallSources, setDsSmallSources] = useState(0);
  const [dsSmallDests, setDsSmallDests] = useState(0);
  const [dsMediumSources, setDsMediumSources] = useState(0);
  const [dsMediumDests, setDsMediumDests] = useState(0);
  const [dsLargeSources, setDsLargeSources] = useState(0);
  const [dsLargeDests, setDsLargeDests] = useState(0);
  // Guardrail bypass toggles (optional modeling when availability not met)
  const [bypassCustomerAgent, setBypassCustomerAgent] = useState(false);
  const [bypassProspecting, setBypassProspecting] = useState(false);
  const [bypassDataAgent, setBypassDataAgent] = useState(false);
  // Removed policy selection (always compare both paths)
  const [overageCap, setOverageCap] = useState<number | "">("");
  // Pack proration (first month only)
  const [prorateFirstMonth, setProrateFirstMonth] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(30);

  // Scenario picker state
  const [expandedScenariosB2B, setExpandedScenariosB2B] = useState<Set<string>>(new Set());
  const [expandedScenariosB2C, setExpandedScenariosB2C] = useState<Set<string>>(new Set());
  // Track selected features by unique key scenario|feature for persistence
  const [selectedScenarioFeatures, setSelectedScenarioFeatures] = useState<Set<string>>(new Set());

  const toggleScenario = (group: 'b2b' | 'b2c', name: string) => {
    if (group === 'b2b') {
      setExpandedScenariosB2B(prev => {
        const next = new Set(prev); if (next.has(name)) next.delete(name); else next.add(name); return next;
      });
    } else {
      setExpandedScenariosB2C(prev => {
        const next = new Set(prev); if (next.has(name)) next.delete(name); else next.add(name); return next;
      });
    }
  };

  const scenarioFeatureKey = (scenario: string, feature: string) => `${scenario}||${feature}`;

  // Apply selected features aggregate to calculator inputs (additive per mapping rule)
  useEffect(() => {
    if (!loadedFromStorageRef.current) return; // ensure base load done first
    // Gather features from selected set
    const selectedFeatures: ScenarioFeature[] = [];
    for (const s of [...B2B_SCENARIOS, ...B2C_SCENARIOS]) {
      for (const f of s.features) {
        if (selectedScenarioFeatures.has(scenarioFeatureKey(s.scenario, f.feature))) {
          selectedFeatures.push(f);
        }
      }
    }
    if (selectedFeatures.length === 0) return; // nothing to apply
    const result = applyScenarioFeatures(selectedFeatures);
    // Merge by overriding fields present in patch (we treat scenario selection as intent input)
    if (result.patch.conv !== undefined) setConv(result.patch.conv);
    if (result.patch.monContacts !== undefined) setMonContacts(result.patch.monContacts);
    if (result.patch.deepCompanies !== undefined) setDeepCompanies(result.patch.deepCompanies);
    if (result.patch.wfActions !== undefined) setWfActions(result.patch.wfActions);
    if (result.patch.intentCompanies !== undefined) setIntentCompanies(result.patch.intentCompanies);
    if (result.patch.dataPrompts !== undefined) setDataPrompts(result.patch.dataPrompts);
  }, [selectedScenarioFeatures]);

  // Edition helpers for guardrails
  const rank: Record<Edition, number> = { Starter: 1, Professional: 2, Enterprise: 3 };
  const atLeast = (a: Edition, min: Edition) => rank[a] >= rank[min];
  const hasMainPro = atLeast(editionMain, "Professional");
  const hasDataPro = atLeast(editionData, "Professional");

  // Included credits: highest edition across main vs data groups (not additive)
  const included = Math.max(INCLUDED.main[editionMain], INCLUDED.data[editionData]);

  // Availability checks (non-blocking hints)
  const customerAgentAvailable = hasMainPro || hasDataPro; // requires Professional in either group per catalog
  const prospectingAvailable = hasMainPro; // Sales Hub Professional lives in main group set
  const dataAgentAvailable = featureTier === "ga_beta"; // beta feature toggle gates it

  const totalCredits = useMemo(() => {
    const betaEnabled = featureTier === "ga_beta";
    const dataPromptsEff = betaEnabled ? dataPrompts : 0;
    const dataStudioCredits = betaEnabled
      ? (
          dsSmallSources * dsSmallDests * DATA_STUDIO_RATES.smallPerDestination +
          dsMediumSources * dsMediumDests * DATA_STUDIO_RATES.mediumPerDestination +
          dsLargeSources * dsLargeDests * DATA_STUDIO_RATES.largePerDestination
        )
      : 0;
    const U =
      conv * RATES.customerAgent_perConversation +
      monContacts * RATES.prospectingMonitoring_perContactMonth +
      deepCompanies * RATES.prospectingDeepResearch_perCompany +
      wfActions * RATES.workflowBreezeAction +
      intentCompanies * RATES.buyerIntent_perCompanyMonth +
      dataPromptsEff * RATES.dataAgent_perPromptRecord +
      dataStudioCredits;
    return U;
  }, [conv, monContacts, deepCompanies, wfActions, intentCompanies, dataPrompts, featureTier, dsSmallSources, dsSmallDests, dsMediumSources, dsMediumDests, dsLargeSources, dsLargeDests]);

  const overageCredits = Math.max(0, totalCredits - included);
  const packs = Math.ceil(overageCredits / 1000);
  const packCostSteady = packs * COSTS.PACK_PRICE_PER_1000_USD;
  const prorationFactor = prorateFirstMonth ? Math.max(1, Math.min(30, daysRemaining)) / 30 : 1;
  const packCostFirstMonth = packCostSteady * prorationFactor;
  const billedOverageCredits = roundUpTo10(overageCredits);
  const perCredit = OVERAGE_PRICE_PER_CREDIT[currency];
  const overageCostRaw = billedOverageCredits * perCredit;
  const overageCost = overageCap && Number(overageCap) > 0 ? Math.min(overageCostRaw, Number(overageCap)) : overageCostRaw;

  const cheaper = useMemo(() => {
    if (overageCredits <= 0) return "No extra cost";
    // Compare this month's actual cost (use proration if enabled) vs overage
    return packCostFirstMonth <= overageCost ? "Capacity packs" : "Per-credit overage";
  }, [overageCredits, packCostFirstMonth, overageCost]);

  const chartData = [
    { name: "Starter", MainHubs: INCLUDED.main.Starter, DataPlatform: INCLUDED.data.Starter },
    { name: "Professional", MainHubs: INCLUDED.main.Professional, DataPlatform: INCLUDED.data.Professional },
    { name: "Enterprise", MainHubs: INCLUDED.main.Enterprise, DataPlatform: INCLUDED.data.Enterprise },
  ];

  // Persist/load state to localStorage
  const loadedFromStorageRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      // Only set if present to avoid undefined overwrites
      if (s.editionMain) setEditionMain(s.editionMain as Edition);
      if (s.editionData) setEditionData(s.editionData as Edition);
      if (s.featureTier) setFeatureTier(s.featureTier as "ga" | "ga_beta");
      if (s.currency) setCurrency(s.currency as Currency);
      if (typeof s.conv === "number") setConv(s.conv);
      if (typeof s.monContacts === "number") setMonContacts(s.monContacts);
      if (typeof s.deepCompanies === "number") setDeepCompanies(s.deepCompanies);
      if (typeof s.wfActions === "number") setWfActions(s.wfActions);
      if (typeof s.intentCompanies === "number") setIntentCompanies(s.intentCompanies);
      if (typeof s.dataPrompts === "number") setDataPrompts(s.dataPrompts);
      if (typeof s.dsSmallSources === "number") setDsSmallSources(s.dsSmallSources);
      if (typeof s.dsSmallDests === "number") setDsSmallDests(s.dsSmallDests);
      if (typeof s.dsMediumSources === "number") setDsMediumSources(s.dsMediumSources);
      if (typeof s.dsMediumDests === "number") setDsMediumDests(s.dsMediumDests);
      if (typeof s.dsLargeSources === "number") setDsLargeSources(s.dsLargeSources);
      if (typeof s.dsLargeDests === "number") setDsLargeDests(s.dsLargeDests);
      if (typeof s.bypassCustomerAgent === "boolean") setBypassCustomerAgent(s.bypassCustomerAgent);
      if (typeof s.bypassProspecting === "boolean") setBypassProspecting(s.bypassProspecting);
      if (typeof s.bypassDataAgent === "boolean") setBypassDataAgent(s.bypassDataAgent);
  // policy removed
      if (s.overageCap !== undefined) setOverageCap(s.overageCap);
      if (typeof s.prorateFirstMonth === "boolean") setProrateFirstMonth(s.prorateFirstMonth);
      if (typeof s.daysRemaining === "number") setDaysRemaining(s.daysRemaining);
      if (Array.isArray(s.selectedScenarioFeatures)) {
        setSelectedScenarioFeatures(new Set(s.selectedScenarioFeatures));
      }
      // mark that we've applied stored values (even if partial)
      loadedFromStorageRef.current = true;
    } catch (e) {
      // ignore malformed localStorage
      // console.warn('Failed to load saved calculator state', e);
    }
  }, []);

  // Save on change of relevant state. Skip first saves until after we've loaded from storage
  useEffect(() => {
    if (!loadedFromStorageRef.current) return;
    try {
      const payload = {
        editionMain,
        editionData,
        featureTier,
        currency,
        conv,
        monContacts,
        deepCompanies,
        wfActions,
        intentCompanies,
        dataPrompts,
        dsSmallSources,
        dsSmallDests,
        dsMediumSources,
        dsMediumDests,
        dsLargeSources,
        dsLargeDests,
        bypassCustomerAgent,
        bypassProspecting,
        bypassDataAgent,
  // policy removed
        overageCap,
        prorateFirstMonth,
        daysRemaining,
        selectedScenarioFeatures: Array.from(selectedScenarioFeatures),
      } as const;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore quota errors
    }
  }, [
    editionMain,
    editionData,
    featureTier,
    currency,
    conv,
    monContacts,
    deepCompanies,
    wfActions,
    intentCompanies,
    dataPrompts,
    dsSmallSources,
    dsSmallDests,
    dsMediumSources,
    dsMediumDests,
    dsLargeSources,
    dsLargeDests,
    bypassCustomerAgent,
    bypassProspecting,
    bypassDataAgent,
  // policy removed
    overageCap,
    prorateFirstMonth,
    daysRemaining,
    selectedScenarioFeatures,
  ]);

  function resetToDefaults() {
    setEditionMain("Professional");
    setEditionData("Starter");
    setFeatureTier("ga");
    setCurrency("USD");
    setConv(120);
    setMonContacts(200);
    setDeepCompanies(50);
    setWfActions(500);
    setIntentCompanies(100);
    setDataPrompts(0);
    setDsSmallSources(0);
    setDsSmallDests(0);
    setDsMediumSources(0);
    setDsMediumDests(0);
    setDsLargeSources(0);
    setDsLargeDests(0);
    setBypassCustomerAgent(false);
    setBypassProspecting(false);
    setBypassDataAgent(false);
  // policy removed
    setOverageCap("");
    setProrateFirstMonth(false);
    setDaysRemaining(30);
  setSelectedScenarioFeatures(new Set());
    try {
      localStorage.removeItem(STORAGE_KEY);
      // mark loaded so the save effect will persist the new defaults
      loadedFromStorageRef.current = true;
    } catch (e) {
      // ignore
    }
  }

  function formatAmount(n: number) {
    // Minimal currency formatting for overage path; pack path remains USD per catalog
    return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // No policy: user just sees both paths; show cheaper dynamically.
  const selectedPathCost = cheaper === "Capacity packs" ? packCostFirstMonth : overageCost;

  // If FAQ view active, render FAQ page
  if (showFAQ) {
    return (
      <div className="mx-auto max-w-7xl p-4 md:p-6 space-y-4 bg-white text-zinc-900 min-h-screen">
        <FAQPage onBack={() => setShowFAQ(false)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6 bg-white text-zinc-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="text-3xl font-bold text-[#FF8A00]">harvest</span><span className="text-3xl font-bold text-[#0B9444]">ROI</span>
          <h1 className="text-3xl font-bold tracking-tight">Breeze Credit Calculator</h1>
          <p className="text-slate-700 mt-1">Figure out how many credits you’ll use each month and what that could cost.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()} aria-label="Print or save as PDF">
            <Printer className="mr-2 h-4 w-4" aria-hidden /> Print / Save as PDF
          </Button>
          <Button variant="outline" onClick={resetToDefaults} aria-label="Clear calculator" title="Clear calculator and remove saved state">
            <Trash className="mr-2 h-4 w-4" aria-hidden /> Clear
          </Button>
          <Button variant="outline" onClick={() => setShowFAQ(true)} aria-label="Open FAQ and guidance" title="Open FAQ and guidance">
            <Info className="mr-2 h-4 w-4" aria-hidden /> FAQ
          </Button>
        </div>
      </div>

      {/* Ownership profile: two edition pickers (highest applies; not additive) */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label className="mb-2 block" htmlFor="editionMain">Smart CRM / Marketing / Sales / Service / Content</Label>
              <Select value={editionMain} onValueChange={(v: any) => setEditionMain(v)}>
                <SelectTrigger id="editionMain" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block" htmlFor="editionData">Data Hub / Customer Platform</Label>
              <Select value={editionData} onValueChange={(v: any) => setEditionData(v)}>
                <SelectTrigger id="editionData" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-slate-700">
              <div className="rounded-2xl border p-3 bg-white">
                <div className="font-medium">Included each month</div>
                <div className="text-2xl font-semibold mt-1">{included.toLocaleString()}</div>
                <div className="mt-1">We look at both sides you own and give you the higher number. It resets every month.</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 border bg-white">
          <TabsTrigger value="calculator"><Calculator className="mr-2 h-4 w-4" aria-hidden />Calculator</TabsTrigger>
          <TabsTrigger value="included"><BarChartIcon className="mr-2 h-4 w-4" aria-hidden />Included</TabsTrigger>
          <TabsTrigger value="rates"><FileText className="mr-2 h-4 w-4" aria-hidden />Rates</TabsTrigger>
          <TabsTrigger value="scenarios"><FileText className="mr-2 h-4 w-4" aria-hidden />Scenarios</TabsTrigger>
          <TabsTrigger value="overview" className="hidden" aria-hidden />
        </TabsList>

        {/* Page 2: Included Credits */}
        <TabsContent value="included" className="space-y-4">
          <Card>
            <CardHeader>
              <SectionTitle icon={BarChartIcon} title="How many credits you start with" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border p-4 bg-white">
                  <div className="font-semibold mb-2">Smart CRM / Marketing / Sales / Service / Content</div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="py-2">Edition</th>
                        <th className="py-2">Included credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(INCLUDED.main).map(([k, v]) => (
                        <tr key={k} className="border-t">
                          <td className="py-2">{k}</td>
                          <td className="py-2">{v.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="rounded-2xl border p-4 bg-white">
                  <div className="font-semibold mb-2">Data Hub / Customer Platform</div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="py-2">Edition</th>
                        <th className="py-2">Included credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(INCLUDED.data).map(([k, v]) => (
                        <tr key={k} className="border-t">
                          <td className="py-2">{k}</td>
                          <td className="py-2">{v.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <p className="text-xs text-slate-700 mt-3">If you own more than one product here, we just use the highest level you have. No stacking.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page 3: Rates */}
        <TabsContent value="rates" className="space-y-4">
          <Card>
            <CardHeader>
              <SectionTitle icon={FileText} title="What uses credits" subtitle="Each thing below burns the number shown." />
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-2">Category</th>
                    <th className="py-2">Feature</th>
                    <th className="py-2">Action</th>
                    <th className="py-2">Credits</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="py-2">Breeze Agents</td>
                    <td className="py-2">Customer Agent</td>
                    <td className="py-2">Handle one conversation (text)</td>
                    <td className="py-2">{RATES.customerAgent_perConversation}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Breeze Agents</td>
                    <td className="py-2">Prospecting Agent</td>
                    <td className="py-2">Enable monthly monitoring of one contact</td>
                    <td className="py-2">{RATES.prospectingMonitoring_perContactMonth}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Breeze Agents</td>
                    <td className="py-2">Prospecting Agent</td>
                    <td className="py-2">Deep research on one company</td>
                    <td className="py-2">{RATES.prospectingDeepResearch_perCompany}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Breeze Automation</td>
                    <td className="py-2">Workflows</td>
                    <td className="py-2">Execute one Breeze action</td>
                    <td className="py-2">{RATES.workflowBreezeAction}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Buyer Intent</td>
                    <td className="py-2">Intent</td>
                    <td className="py-2">Enable/monitor one company for a month</td>
                    <td className="py-2">{RATES.buyerIntent_perCompanyMonth}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Breeze Agents (Beta)</td>
                    <td className="py-2">Data Agent</td>
                    <td className="py-2">Generate response to one prompt for one record (text)</td>
                    <td className="py-2">{RATES.dataAgent_perPromptRecord}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Data Studio (Beta)</td>
                    <td className="py-2">Sync (Small)</td>
                    <td className="py-2">Sync one source to one destination</td>
                    <td className="py-2">{DATA_STUDIO_RATES.smallPerDestination}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Data Studio (Beta)</td>
                    <td className="py-2">Sync (Medium)</td>
                    <td className="py-2">Sync one source to one destination</td>
                    <td className="py-2">{DATA_STUDIO_RATES.mediumPerDestination}</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Data Studio (Beta)</td>
                    <td className="py-2">Sync (Large)</td>
                    <td className="py-2">Sync one source to one destination</td>
                    <td className="py-2">{DATA_STUDIO_RATES.largePerDestination}</td>
                  </tr>
                </tbody>
              </table>
              <div className="text-xs text-slate-700 mt-2">Beta numbers can still change. HubSpot usually gives about a month’s heads‑up.</div>
              <div className="rounded-2xl border p-4 mt-4 text-sm bg-white">
                <div className="font-medium">Getting more credits</div>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Pack: 1,000 credits for $10 (USD) every month.</li>
                  <li>Or pay-as-you-go: $0.010 per credit (USD) and we total it monthly.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page 4: Scenarios & Tips */}
        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <SectionTitle title="Scenario library" subtitle="Pick a scenario or mix individual feature rows to auto-fill the calculator." />
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* B2B Column */}
                <div>
                  <h4 className="text-base font-semibold mb-2">B2B Scenarios</h4>
                  <div className="space-y-3">
                    {B2B_SCENARIOS.map((s) => {
                      const expanded = expandedScenariosB2B.has(s.scenario);
                      return (
                        <div key={s.scenario} className="rounded-xl border p-3 bg-white shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => toggleScenario('b2b', s.scenario)}
                              className="text-left flex-1 font-medium hover:underline"
                              aria-expanded={expanded ? true : false}
                            >
                              {s.scenario}
                            </button>
                            <div className="text-xs text-slate-600 whitespace-nowrap">{s.totalMonthlyCredits.toLocaleString()} credits</div>
                          </div>
                          {expanded && (
                            <div className="mt-3 space-y-2">
                              {s.features.map(f => {
                                const key = scenarioFeatureKey(s.scenario, f.feature);
                                const checked = selectedScenarioFeatures.has(key);
                                return (
                                  <label key={key} className="flex items-start gap-2 text-xs cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      className="mt-0.5"
                                      checked={checked}
                                      onChange={(e) => {
                                        setSelectedScenarioFeatures(prev => {
                                          const next = new Set(prev);
                                          if (e.target.checked) next.add(key); else next.delete(key);
                                          return next;
                                        });
                                      }}
                                      aria-label={`Apply feature ${f.feature}`}
                                    />
                                    <span className="flex-1">
                                      <span className="font-medium group-hover:underline">{f.feature}</span>{' '}
                                      <span className="text-slate-600">({f.rawQuantity}, {f.rateDescription})</span>
                                    </span>
                                    <span className="text-slate-700 font-medium">{f.monthlyCredits.toLocaleString()}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* B2C Column */}
                <div>
                  <h4 className="text-base font-semibold mb-2">B2C Scenarios</h4>
                  <div className="space-y-3">
                    {B2C_SCENARIOS.map((s) => {
                      const expanded = expandedScenariosB2C.has(s.scenario);
                      return (
                        <div key={s.scenario} className="rounded-xl border p-3 bg-white shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => toggleScenario('b2c', s.scenario)}
                              className="text-left flex-1 font-medium hover:underline"
                              aria-expanded={expanded ? true : false}
                            >
                              {s.scenario}
                            </button>
                            <div className="text-xs text-slate-600 whitespace-nowrap">{s.totalMonthlyCredits.toLocaleString()} credits</div>
                          </div>
                          {expanded && (
                            <div className="mt-3 space-y-2">
                              {s.features.map(f => {
                                const key = scenarioFeatureKey(s.scenario, f.feature);
                                const checked = selectedScenarioFeatures.has(key);
                                return (
                                  <label key={key} className="flex items-start gap-2 text-xs cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      className="mt-0.5"
                                      checked={checked}
                                      onChange={(e) => {
                                        setSelectedScenarioFeatures(prev => {
                                          const next = new Set(prev);
                                          if (e.target.checked) next.add(key); else next.delete(key);
                                          return next;
                                        });
                                      }}
                                      aria-label={`Apply feature ${f.feature}`}
                                    />
                                    <span className="flex-1">
                                      <span className="font-medium group-hover:underline">{f.feature}</span>{' '}
                                      <span className="text-slate-600">({f.rawQuantity}, {f.rateDescription})</span>
                                    </span>
                                    <span className="text-slate-700 font-medium">{f.monthlyCredits.toLocaleString()}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border p-4 bg-white text-xs space-y-2">
                <div className="font-medium">How this works</div>
                <p>Select feature rows; mapped items overwrite matching calculator inputs (sum if you pick multiple scenarios). Unmapped feature types are ignored for now (e.g. content, email) until those inputs exist.</p>
                <p className="text-slate-600">Clear the calculator to remove selections or uncheck rows here.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionTitle title="Helpful tips" />
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>List what you expect to do each month, then match to the table.</li>
                <li>If usage jumps around, turn on overages and set a cap instead of buying a bunch of packs.</li>
                <li>Beta stuff can change. Recheck numbers once in a while.</li>
                <li>Some things (like phone/SMS) can still have separate fees beyond credits.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page 5: Calculator */}
        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <SectionTitle icon={Calculator} title="Credit cost calculator" subtitle="Plug in rough numbers. See what you’d use and pay." />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main calculator layout: 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left and middle columns: inputs, controls, summaries */}
                <div className="md:col-span-2 space-y-6">

              {/* Feature tier and currency selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="mb-1 block" htmlFor="featureTier" tooltip="Choose if you want to count beta stuff too.">Features included</Label>
                  <Select value={featureTier} onValueChange={(v: any) => setFeatureTier(v)}>
                    <SelectTrigger id="featureTier" className="w-full" aria-label="Feature tier">
                      <SelectValue placeholder="Choose feature tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ga">Generally Available only</SelectItem>
                      <SelectItem value="ga_beta">GA + BETA (credit-based)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-700 mt-1">Turn on beta to include those early features.</p>
                </div>
                <div>
                  <Label className="mb-1 block" htmlFor="currency" tooltip="Pick the currency for per‑credit pricing. Packs stay in USD.">Currency (overage pricing)</Label>
                  <Select value={currency} onValueChange={(v: any) => setCurrency(v)}>
                    <SelectTrigger id="currency" className="w-full" aria-label="Currency">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(OVERAGE_PRICE_PER_CREDIT).map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-700 mt-1">Per‑credit pricing uses this currency. Packs are always shown in USD.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="conv" tooltip="How many chats the agent handles." >Customer Agent conversations (text)</Label>
                  <Input
                    id="conv"
                    type="number"
                    min={0}
                    value={conv}
                    onChange={(e) => setConv(parseInt(e.target.value || "0", 10))}
                    disabled={!customerAgentAvailable && !bypassCustomerAgent}
                    aria-disabled={!customerAgentAvailable && !bypassCustomerAgent}
                  />
                  <p className="text-xs text-slate-700 mt-1">100 credits each</p>
                  {!customerAgentAvailable && (
                    <div className="text-xs text-amber-700 mt-1">
                      Hint: Needs Professional (or higher). <label className="inline-flex items-center gap-2"><input type="checkbox" checked={bypassCustomerAgent} onChange={(e) => setBypassCustomerAgent(e.target.checked)} /> Still model it</label>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="monContacts" tooltip="Contacts you keep an eye on this month.">Prospecting: contacts monitored (monthly)</Label>
                  <Input
                    id="monContacts"
                    type="number"
                    min={0}
                    value={monContacts}
                    onChange={(e) => setMonContacts(parseInt(e.target.value || "0", 10))}
                    disabled={!prospectingAvailable && !bypassProspecting}
                    aria-disabled={!prospectingAvailable && !bypassProspecting}
                  />
                  <p className="text-xs text-slate-700 mt-1">100 credits each</p>
                  {!prospectingAvailable && (
                    <div className="text-xs text-amber-700 mt-1">
                      Hint: Needs Sales Hub Professional. <label className="inline-flex items-center gap-2"><input type="checkbox" checked={bypassProspecting} onChange={(e) => setBypassProspecting(e.target.checked)} /> Still model it</label>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="deepCompanies" tooltip="Companies you do deeper lookups on.">Prospecting: deep research companies</Label>
                  <Input
                    id="deepCompanies"
                    type="number"
                    min={0}
                    value={deepCompanies}
                    onChange={(e) => setDeepCompanies(parseInt(e.target.value || "0", 10))}
                    disabled={!prospectingAvailable && !bypassProspecting}
                    aria-disabled={!prospectingAvailable && !bypassProspecting}
                  />
                  <p className="text-xs text-slate-700 mt-1">10 credits each</p>
                </div>
                <div>
                  <Label htmlFor="wfActions" tooltip="How many AI workflow actions fire.">Workflow Breeze actions executed</Label>
                  <Input id="wfActions" type="number" min={0} value={wfActions} onChange={(e) => setWfActions(parseInt(e.target.value || "0", 10))} />
                  <p className="text-xs text-slate-700 mt-1">10 credits each</p>
                </div>
                <div>
                  <Label htmlFor="intentCompanies" tooltip="Companies you track for intent signals.">Buyer Intent companies (monthly)</Label>
                  <Input id="intentCompanies" type="number" min={0} value={intentCompanies} onChange={(e) => setIntentCompanies(parseInt(e.target.value || "0", 10))} />
                  <p className="text-xs text-slate-700 mt-1">10 credits each</p>
                </div>
                {featureTier === "ga_beta" && (
                  <>
                    <div>
                      <Label htmlFor="dataPrompts" tooltip="Prompts the data agent answers.">Data Agent prompts (beta)</Label>
                      <Input
                        id="dataPrompts"
                        type="number"
                        min={0}
                        value={dataPrompts}
                        onChange={(e) => setDataPrompts(parseInt(e.target.value || "0", 10))}
                        disabled={!dataAgentAvailable && !bypassDataAgent}
                        aria-disabled={!dataAgentAvailable && !bypassDataAgent}
                      />
                      <p className="text-xs text-slate-700 mt-1">10 credits each</p>
                      {!dataAgentAvailable && (
                        <div className="text-xs text-amber-700 mt-1">
                          Hint: Turn on beta to include this. <label className="inline-flex items-center gap-2"><input type="checkbox" checked={bypassDataAgent} onChange={(e) => setBypassDataAgent(e.target.checked)} /> Still model it</label>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="dsSmallSources" tooltip="Small data sources you sync.">Data Studio (beta): Small sources/month</Label>
                      <Input id="dsSmallSources" type="number" min={0} value={dsSmallSources} onChange={(e) => setDsSmallSources(parseInt(e.target.value || "0", 10))} />
                      <p className="text-xs text-slate-700 mt-1">{DATA_STUDIO_RATES.smallPerDestination} credits per destination sync</p>
                    </div>
                    <div>
                      <Label htmlFor="dsSmallDests" tooltip="Destinations each small source goes to.">Destinations per small source</Label>
                      <Input id="dsSmallDests" type="number" min={0} value={dsSmallDests} onChange={(e) => setDsSmallDests(parseInt(e.target.value || "0", 10))} />
                    </div>
                    <div>
                      <Label htmlFor="dsMediumSources" tooltip="Medium data sources.">Data Studio (beta): Medium sources/month</Label>
                      <Input id="dsMediumSources" type="number" min={0} value={dsMediumSources} onChange={(e) => setDsMediumSources(parseInt(e.target.value || "0", 10))} />
                      <p className="text-xs text-slate-700 mt-1">{DATA_STUDIO_RATES.mediumPerDestination} credits per destination sync</p>
                    </div>
                    <div>
                      <Label htmlFor="dsMediumDests" tooltip="Destinations for each medium source.">Destinations per medium source</Label>
                      <Input id="dsMediumDests" type="number" min={0} value={dsMediumDests} onChange={(e) => setDsMediumDests(parseInt(e.target.value || "0", 10))} />
                    </div>
                    <div>
                      <Label htmlFor="dsLargeSources" tooltip="Large data sources.">Data Studio (beta): Large sources/month</Label>
                      <Input id="dsLargeSources" type="number" min={0} value={dsLargeSources} onChange={(e) => setDsLargeSources(parseInt(e.target.value || "0", 10))} />
                      <p className="text-xs text-slate-700 mt-1">{DATA_STUDIO_RATES.largePerDestination} credits per destination sync</p>
                    </div>
                    <div>
                      <Label htmlFor="dsLargeDests" tooltip="Destinations for each large source.">Destinations per large source</Label>
                      <Input id="dsLargeDests" type="number" min={0} value={dsLargeDests} onChange={(e) => setDsLargeDests(parseInt(e.target.value || "0", 10))} />
                    </div>
                    <div className="md:col-span-3 text-xs text-slate-700">Beta numbers can shift later.</div>
                  </>
                )}
              </div>

              {/* Removed compare switch: comparison already shown in capacity/overage cards */}

              {/* Extra cost controls (policy removed) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="mb-1 block" htmlFor="overageCap" tooltip="Optional max spend for pay‑as‑you‑go.">Overage monthly cap ({currency})</Label>
                  <Input
                    id="overageCap"
                    type="number"
                    min={0}
                    placeholder="Optional"
                    value={overageCap}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") return setOverageCap("");
                      const n = parseFloat(val);
                      setOverageCap(Number.isFinite(n) ? Math.max(0, n) : "");
                    }}
                  />
                  <p className="text-xs text-slate-700 mt-1">Cap only affects pay‑as‑you‑go cost.</p>
                </div>
                <div>
                  <Label className="mb-1 block" htmlFor="prorate" tooltip="Pay less the first month if you start mid‑cycle.">Prorate first month (packs)</Label>
                  <div className="flex items-center gap-3">
                    <Switch id="prorate" checked={prorateFirstMonth} onCheckedChange={setProrateFirstMonth} />
                    <span className="text-sm">Enable</span>
                  </div>
                  {prorateFirstMonth && (
                    <div className="mt-2">
                      <Label htmlFor="daysRemaining" className="mb-1 block">Days remaining this billing period</Label>
                      <input
                        id="daysRemaining"
                        type="range"
                        min={1}
                        max={30}
                        step={1}
                        value={daysRemaining}
                        onChange={(e) => setDaysRemaining(parseInt(e.target.value || "30", 10))}
                        aria-label="Days remaining in billing period"
                        className="w-full"
                      />
                      <div className="text-xs text-slate-700 mt-1">{daysRemaining} of 30 days left — first month pack cost scaled down.</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="col-span-1">
                  <CardHeader>
                    <div className="text-sm font-medium">Usage summary</div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex justify-between"><span>Total monthly credits</span><span className="font-semibold">{totalCredits.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Included</span><span className="font-semibold">{included.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Overage</span><span className="font-semibold">{overageCredits.toLocaleString()}</span></div>
                  </CardContent>
                </Card>

                <Card className="col-span-1">
                  <CardHeader>
                    <div className="text-sm font-medium">Pay‑as‑you‑go path</div>
            <div className="text-xs mt-1">
              <span className="font-bold text-[#FF8A00]">harvest</span><span className="font-bold text-[#0B9444]">ROI</span>{' '}
              <span className="text-slate-700">recommended</span>
            </div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
          <div className="flex justify-between"><span>Extra credits (rounded)</span><span className="font-semibold">{billedOverageCredits.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Extra cost</span><span className="font-semibold">{formatAmount(overageCost)}</span></div>
          <div className="mt-2">
            {/* harvestROI brand: 'harvest' lowercase in orange + 'ROI' uppercase, color assumed #FF8A00 */}
          </div>
          {overageCap && Number(overageCap) > 0 && (
            <div className="text-xs text-slate-700">
              Cap applied at {currency} {Number(overageCap).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{overageCost < overageCostRaw ? " (truncated)" : " (not reached)"}.
            </div>
          )}
  <div className="text-xs text-slate-700">Overage is billed in blocks of 10 credits.</div>
                  </CardContent>
                </Card>

                {/*<Card className="col-span-1">
                  <CardHeader>
                    <div className="text-sm font-medium">Pack path</div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex justify-between"><span>Packs</span><span className="font-semibold">{packs}</span></div>
                    {prorateFirstMonth ? (
                      <>
                        <div className="flex justify-between"><span>First month cost (USD)</span><span className="font-semibold">{dollars(packCostFirstMonth)}</span></div>
                        <div className="flex justify-between"><span>After that (USD)</span><span className="font-semibold">{dollars(packCostSteady)}</span></div>
                      </>
                    ) : (
                      <div className="flex justify-between"><span>Pack cost (USD)</span><span className="font-semibold">{dollars(packCostSteady)}</span></div>
                    )}
                    <div className="text-xs text-slate-700">Packs stick around until you change them at renewal. Shown only in USD.</div>
                  </CardContent>
                </Card>*/}
              </div>

                {/* Right column: Floating cost summary */}
                <div className="md:col-span-1">
                  <div className="sticky top-4">
                    <Card className="shadow-sm border-zinc-200">
                      <CardContent className="p-4">
                        <div className="text-xs uppercase tracking-wide text-slate-600">Approximate cost this month</div>
                        <div className="mt-1 text-2xl font-semibold">
                          {overageCredits > 0
                            ? (cheaper === "Capacity packs" ? dollars(packCostFirstMonth) : formatAmount(overageCost))
                            : "No extra cost"}
                        </div>
                        {overageCredits > 0 && (
                          <div className="mt-2 text-sm space-y-1">
                            <div className="flex justify-between"><span>Overage</span><span className="font-medium">{formatAmount(overageCost)}</span></div>
                            <div className="text-xs text-slate-600">Lower total: <span className="font-medium">{cheaper}</span></div>
                          </div>
                        )}
                        <div className="mt-3 text-xs text-slate-600">
                          Cheaper path right now: <span className="font-medium">{cheaper}</span>
                        </div>
                        <div className="mt-1 text-xs text-slate-600 flex justify-between">
                          <span>Included</span>
                          <span className="font-medium">{included.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-slate-600 flex justify-between">
                          <span>Overage</span>
                          <span className="font-medium">{overageCredits.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              </div>

        {overageCredits > 0 ? (
                <div className="rounded-2xl border p-4 text-sm bg-white">
                  <div className="font-medium">What looks better</div>
          <p className="mt-1">
            This month <strong>{cheaper}</strong> costs {cheaper === "Capacity packs" ? dollars(packCostFirstMonth) : formatAmount(overageCost)}. The other way would be {cheaper === "Capacity packs" ? formatAmount(overageCost) : dollars(packCostFirstMonth)}.
          </p>
          <p className="mt-2">Going the cheaper way today: {cheaper === "Capacity packs" ? dollars(selectedPathCost) : formatAmount(selectedPathCost)}.</p>
                </div>
              ) : (
                <div className="rounded-2xl border p-4 text-sm bg-white">
                  <div className="font-medium">All good</div>
                  <p className="mt-1">What you entered fits inside your included credits. No extra spend.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionTitle icon={Info} title="Notes" />
            </CardHeader>
            <CardContent className="text-xs text-slate-700 space-y-2">
              <p>Numbers here are based on the Sept ’25 catalog. Beta features or pricing can shift. Always check the latest catalog if something seems off. Packs display in USD; per‑credit uses the currency you picked.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <footer className="text-xs text-slate-700 pt-2 print:hidden">
        Built for internal planning. Print to share as a multi-page PDF.
      </footer>
      {/* Floating scroll-to-top button */}
      <ScrollToTop />
    </div>
  );
}

function ScrollToTop() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => {
      try {
        setVisible(window.scrollY > 300);
      } catch (e) {
        // ignore (server-side rendering / env issues)
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTop() {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      // fallback
      window.scrollTo(0, 0);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed right-4 bottom-6 z-50">
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Back to top"
        className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-md border border-zinc-200 text-zinc-700 hover:bg-zinc-50 focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8A00]"
      >
        <ArrowUp className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
