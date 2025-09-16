import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Info, Calculator, BarChart as BarChartIcon, FileText, Printer } from "lucide-react";
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
  // Policy selection and spend controls
  const [policy, setPolicy] = useState<"auto_packs" | "overage_only">("auto_packs");
  const [overageCap, setOverageCap] = useState<number | "">("");
  // Pack proration (first month only)
  const [prorateFirstMonth, setProrateFirstMonth] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(30);

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

  function formatAmount(n: number) {
    // Minimal currency formatting for overage path; pack path remains USD per catalog
    return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const policyLabel = policy === "auto_packs" ? "Auto-upgrade to capacity packs" : "Stay at committed capacity + overages";
  // For this month's estimate, use prorated pack cost when enabled
  const selectedPathCost = policy === "auto_packs" ? packCostFirstMonth : overageCost;

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6 bg-white text-zinc-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Breeze Credit Calculator</h1>
          <p className="text-slate-700 mt-1">Visual guide for monthly included credits, consumption, and cost planning.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()} aria-label="Print or save as PDF">
            <Printer className="mr-2 h-4 w-4" aria-hidden /> Print / Save as PDF
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
                <div className="font-medium">Included monthly credits</div>
                <div className="text-2xl font-semibold mt-1">{included.toLocaleString()}</div>
                <div className="mt-1">Highest edition applies across groups; not additive. Credits reset monthly.</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 border bg-white">
          <TabsTrigger value="overview"><Info className="mr-2 h-4 w-4" aria-hidden />Overview</TabsTrigger>
          <TabsTrigger value="included"><BarChartIcon className="mr-2 h-4 w-4" aria-hidden />Included</TabsTrigger>
          <TabsTrigger value="rates"><FileText className="mr-2 h-4 w-4" aria-hidden />Rates</TabsTrigger>
          <TabsTrigger value="scenarios"><FileText className="mr-2 h-4 w-4" aria-hidden />Scenarios</TabsTrigger>
          <TabsTrigger value="calculator"><Calculator className="mr-2 h-4 w-4" aria-hidden />Calculator</TabsTrigger>
        </TabsList>

        {/* Page 1: Overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
                <SectionTitle icon={Info} title="What are HubSpot Credits?" subtitle="A flexible, cross-feature unit that resets monthly." tooltip="High-level description: credits are a cross-feature unit that reset monthly and are consumed by various actions." />
              </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc pl-5 text-sm leading-relaxed">
                <li>Used across features (agents, automation, intent, etc.).</li>
                <li>Reset monthly; unused credits don’t roll over.</li>
                <li>Included credits depend on your highest owned edition per product group.</li>
                <li>You can add capacity packs (1,000 credits for {dollars(COSTS.PACK_PRICE_PER_1000_USD)}) or enable per-credit overages ({dollars(OVERAGE_PRICE_PER_CREDIT.USD)} per credit).</li>
                <li>Some features also incur separate service charges (e.g., telephony minutes or SMS).</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
              <CardHeader>
              <SectionTitle icon={BarChartIcon} title="Included credits snapshot" subtitle="Compare editions across product groups." tooltip="Shows included monthly credits per edition and product group; highest edition per group applies." />
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => v.toLocaleString()} />
                    <Bar dataKey="MainHubs" name="Main Hubs (Smart CRM/Marketing/Sales/Service/Content)" fill="#111827" />
                    <Bar dataKey="DataPlatform" name="Data Hub / Customer Platform" fill="#4B5563" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page 2: Included Credits */}
        <TabsContent value="included" className="space-y-4">
          <Card>
            <CardHeader>
              <SectionTitle icon={BarChartIcon} title="Included monthly credits by edition" />
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
              <p className="text-xs text-slate-700 mt-3">When multiple products are owned in a group, the highest edition sets the included monthly credits for that group.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page 3: Rates */}
        <TabsContent value="rates" className="space-y-4">
          <Card>
            <CardHeader>
              <SectionTitle icon={FileText} title="Confirmed credit rates" subtitle="These actions consume credits as listed." />
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
              <div className="text-xs text-slate-700 mt-2">Beta rates may change; HubSpot aims to give ~30 days’ notice.</div>
              <div className="rounded-2xl border p-4 mt-4 text-sm bg-white">
                <div className="font-medium">Buying more credits</div>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Capacity packs: 1,000 credits for $10 (USD) per month.</li>
                  <li>Optional overages: $0.010 per credit (USD), billed monthly.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page 4: Scenarios & Tips */}
        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <SectionTitle title="Worked examples" />
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-2xl border p-4 bg-white">
                <div className="font-medium">Customer Agent on Professional</div>
                <p className="mt-1">120 handled conversations → 120 × 100 = <strong>12,000 credits</strong>. Included I = 3,000 → Overage O = 9,000.</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Packs: ceil(9,000 / 1,000) = <strong>9</strong> → {dollars(90)}</li>
                  <li>Overage path: 9,000 × $0.010 = <strong>{dollars(90)}</strong></li>
                </ul>
              </div>
              <div className="rounded-2xl border p-4 bg-white">
                <div className="font-medium">Prospecting monitoring on Enterprise</div>
                <p className="mt-1">500 contacts monitored for a month → 500 × 100 = <strong>50,000 credits</strong>. Included I = 5,000 → O = 45,000.</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>Packs: 45 × {dollars(10)} = <strong>{dollars(450)}</strong></li>
                  <li>Overage path: 45,000 × $0.010 = <strong>{dollars(450)}</strong></li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionTitle title="Operational tips" />
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Map expected monthly actions to the rate sheet; plan capacity in 1,000-credit steps.</li>
                <li>For volatile workloads, enable overages with a spend cap instead of permanent packs.</li>
                <li>Beta features may start consuming credits with notice; revisit this sheet before modeling.</li>
                <li>Some actions (e.g., telephony/SMS) may incur separate service charges in addition to credits.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page 5: Calculator */}
        <TabsContent value="calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <SectionTitle icon={Calculator} title="Credit cost calculator" subtitle="Estimate monthly usage, compare capacity packs vs. per-credit overage." />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main calculator layout: 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left and middle columns: inputs, controls, summaries */}
                <div className="md:col-span-2 space-y-6">

              {/* Feature tier and currency selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="mb-1 block" htmlFor="featureTier" tooltip="Choose whether to include GA-only features or GA+Beta credit-consuming features in the model">Features included</Label>
                  <Select value={featureTier} onValueChange={(v: any) => setFeatureTier(v)}>
                    <SelectTrigger id="featureTier" className="w-full" aria-label="Feature tier">
                      <SelectValue placeholder="Choose feature tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ga">Generally Available only</SelectItem>
                      <SelectItem value="ga_beta">GA + BETA (credit-based)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-700 mt-1">Toggle to include credit-based betas in the cost model.</p>
                </div>
                <div>
                  <Label className="mb-1 block" htmlFor="currency" tooltip="Select currency to view per-credit overage pricing. Capacity pack cost remains USD">Currency (overage pricing)</Label>
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
                  <p className="text-xs text-slate-700 mt-1">Overage per-credit price uses the selected currency. Capacity pack pricing is shown in USD per catalog.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="conv" tooltip="Number of handled customer conversations per month (text). Each conversation consumes credits">Customer Agent conversations (text)</Label>
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
                      Hint: Requires Professional+ in main hubs or data platform. <label className="inline-flex items-center gap-2"><input type="checkbox" checked={bypassCustomerAgent} onChange={(e) => setBypassCustomerAgent(e.target.checked)} /> Model anyway</label>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="monContacts" tooltip="Number of contacts you monitor monthly via Prospecting Agent; each consumes credits">Prospecting: contacts monitored (monthly)</Label>
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
                      Hint: Prospecting needs Sales Hub Professional+. <label className="inline-flex items-center gap-2"><input type="checkbox" checked={bypassProspecting} onChange={(e) => setBypassProspecting(e.target.checked)} /> Model anyway</label>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="deepCompanies" tooltip="Number of companies per month for deep research by Prospecting Agent">Prospecting: deep research companies</Label>
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
                  <Label htmlFor="wfActions" tooltip="Total number of Breeze workflow actions executed per month">Workflow Breeze actions executed</Label>
                  <Input id="wfActions" type="number" min={0} value={wfActions} onChange={(e) => setWfActions(parseInt(e.target.value || "0", 10))} />
                  <p className="text-xs text-slate-700 mt-1">10 credits each</p>
                </div>
                <div>
                  <Label htmlFor="intentCompanies" tooltip="Count of buyer-intent companies monitored per month; each uses credits">Buyer Intent companies (monthly)</Label>
                  <Input id="intentCompanies" type="number" min={0} value={intentCompanies} onChange={(e) => setIntentCompanies(parseInt(e.target.value || "0", 10))} />
                  <p className="text-xs text-slate-700 mt-1">10 credits each</p>
                </div>
                {featureTier === "ga_beta" && (
                  <>
                    <div>
                      <Label htmlFor="dataPrompts">Data Agent prompts (beta)</Label>
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
                          Hint: Enable GA+Beta to model Data Agent. <label className="inline-flex items-center gap-2"><input type="checkbox" checked={bypassDataAgent} onChange={(e) => setBypassDataAgent(e.target.checked)} /> Model anyway</label>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="dsSmallSources">Data Studio (beta): Small sources/month</Label>
                      <Input id="dsSmallSources" type="number" min={0} value={dsSmallSources} onChange={(e) => setDsSmallSources(parseInt(e.target.value || "0", 10))} />
                      <p className="text-xs text-slate-700 mt-1">{DATA_STUDIO_RATES.smallPerDestination} credits per destination sync</p>
                    </div>
                    <div>
                      <Label htmlFor="dsSmallDests">Destinations per small source</Label>
                      <Input id="dsSmallDests" type="number" min={0} value={dsSmallDests} onChange={(e) => setDsSmallDests(parseInt(e.target.value || "0", 10))} />
                    </div>
                    <div>
                      <Label htmlFor="dsMediumSources">Data Studio (beta): Medium sources/month</Label>
                      <Input id="dsMediumSources" type="number" min={0} value={dsMediumSources} onChange={(e) => setDsMediumSources(parseInt(e.target.value || "0", 10))} />
                      <p className="text-xs text-slate-700 mt-1">{DATA_STUDIO_RATES.mediumPerDestination} credits per destination sync</p>
                    </div>
                    <div>
                      <Label htmlFor="dsMediumDests">Destinations per medium source</Label>
                      <Input id="dsMediumDests" type="number" min={0} value={dsMediumDests} onChange={(e) => setDsMediumDests(parseInt(e.target.value || "0", 10))} />
                    </div>
                    <div>
                      <Label htmlFor="dsLargeSources">Data Studio (beta): Large sources/month</Label>
                      <Input id="dsLargeSources" type="number" min={0} value={dsLargeSources} onChange={(e) => setDsLargeSources(parseInt(e.target.value || "0", 10))} />
                      <p className="text-xs text-slate-700 mt-1">{DATA_STUDIO_RATES.largePerDestination} credits per destination sync</p>
                    </div>
                    <div>
                      <Label htmlFor="dsLargeDests">Destinations per large source</Label>
                      <Input id="dsLargeDests" type="number" min={0} value={dsLargeDests} onChange={(e) => setDsLargeDests(parseInt(e.target.value || "0", 10))} />
                    </div>
                    <div className="md:col-span-3 text-xs text-slate-700">Beta rates may change; HubSpot aims to give ~30 days’ notice.</div>
                  </>
                )}
              </div>

              {/* Removed compare switch: comparison already shown in capacity/overage cards */}

              {/* Policy selection and spend controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="mb-1 block" htmlFor="policy" tooltip="Choose whether to auto-upgrade to capacity packs or stay on overage billing">Policy</Label>
                  <Select value={policy} onValueChange={(v: any) => setPolicy(v)}>
                    <SelectTrigger id="policy" className="w-full" aria-label="Policy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto_packs">Auto-upgrade to capacity packs</SelectItem>
                      <SelectItem value="overage_only">Stay at committed capacity + overages</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-700 mt-1">Used for summary/print. Comparison still shows both paths.</p>
                </div>
                <div>
                  <Label className="mb-1 block" htmlFor="overageCap" tooltip="Optional cap to limit monthly overage charges">Overage monthly cap ({currency})</Label>
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
                  <p className="text-xs text-slate-700 mt-1">Applies to overage path only. We cap the billed overage cost after 10-credit rounding.</p>
                </div>
                <div>
                  <Label className="mb-1 block" htmlFor="prorate" tooltip="When enabled, first-month pack cost is prorated based on days remaining in the billing period">Prorate first month (packs)</Label>
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
                      <div className="text-xs text-slate-700 mt-1">{daysRemaining} of 30 days → first-month pack cost prorated.</div>
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
                    <div className="text-sm font-medium">Capacity packs path</div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex justify-between"><span>Packs</span><span className="font-semibold">{packs}</span></div>
                    {prorateFirstMonth ? (
                      <>
                        <div className="flex justify-between"><span>First-month pack cost (USD, prorated)</span><span className="font-semibold">{dollars(packCostFirstMonth)}</span></div>
                        <div className="flex justify-between"><span>Steady-state monthly pack cost (USD)</span><span className="font-semibold">{dollars(packCostSteady)}</span></div>
                      </>
                    ) : (
                      <div className="flex justify-between"><span>Pack cost (USD)</span><span className="font-semibold">{dollars(packCostSteady)}</span></div>
                    )}
                    <div className="text-xs text-slate-700">Added packs persist through term until renewal change. Pack pricing shown in USD; other currencies not modeled.</div>
                  </CardContent>
                </Card>

                <Card className="col-span-1">
                  <CardHeader>
                    <div className="text-sm font-medium">Per-credit overage path</div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
          <div className="flex justify-between"><span>Overage credits (rounded to 10)</span><span className="font-semibold">{billedOverageCredits.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Overage cost</span><span className="font-semibold">{formatAmount(overageCost)}</span></div>
          {overageCap && Number(overageCap) > 0 && (
            <div className="text-xs text-slate-700">
              Cap applied at {currency} {Number(overageCap).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{overageCost < overageCostRaw ? " (truncated)" : " (not reached)"}.
            </div>
          )}
    <div className="text-xs text-slate-700">Overage invoices issue in 10-credit increments.</div>
                  </CardContent>
                </Card>
              </div>

                {/* Right column: Floating cost summary */}
                <div className="md:col-span-1">
                  <div className="sticky top-4">
                    <Card className="shadow-sm border-zinc-200">
                      <CardContent className="p-4">
                        <div className="text-xs uppercase tracking-wide text-slate-600">Estimated cost this month</div>
                        <div className="mt-1 text-2xl font-semibold">
                          {overageCredits > 0
                            ? (policy === "auto_packs" ? dollars(packCostFirstMonth) : formatAmount(overageCost))
                            : "No extra cost"}
                        </div>
                        {overageCredits > 0 && (
                          <div className="mt-2 text-sm space-y-1">
                            <div className="flex justify-between"><span>Packs</span><span className="font-medium">{prorateFirstMonth ? `${dollars(packCostFirstMonth)} → ${dollars(packCostSteady)}` : dollars(packCostSteady)}</span></div>
                            <div className="flex justify-between"><span>Overage</span><span className="font-medium">{formatAmount(overageCost)}</span></div>
                            <div className="text-xs text-slate-600">Cheaper path: <span className="font-medium">{cheaper}</span></div>
                          </div>
                        )}
                        <div className="mt-3 text-xs text-slate-600">
                          Policy: <span className="font-medium">{policyLabel}</span>
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
                  <div className="font-medium">Recommendation</div>
          <p className="mt-1">
            {cheaper} is cheaper this month (
            {cheaper === "Capacity packs" ? dollars(packCostFirstMonth) : formatAmount(overageCost)}
            ). The other path would cost {cheaper === "Capacity packs" ? formatAmount(overageCost) : dollars(packCostFirstMonth)}.
          </p>
          <p className="mt-2">With your policy (“{policyLabel}”), your estimated charge is {policy === "auto_packs" ? dollars(selectedPathCost) : formatAmount(selectedPathCost)}.</p>
                </div>
              ) : (
                <div className="rounded-2xl border p-4 text-sm bg-white">
                  <div className="font-medium">You’re covered</div>
                  <p className="mt-1">Projected usage is within included credits — no additional credit cost.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionTitle icon={Info} title="Assumptions & disclaimers" />
            </CardHeader>
            <CardContent className="text-xs text-slate-700 space-y-2">
              <p>Rates and inclusions reflect the Sept. '25 HubSpot catalog pricing. Beta features and policies can change; consult the most current catalog for authoritative numbers. Overage pricing uses your selected currency; capacity packs are shown in USD per catalog.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <footer className="text-xs text-slate-700 pt-2 print:hidden">
        Built for internal planning. Print to share as a multi-page PDF.
      </footer>
    </div>
  );
}
