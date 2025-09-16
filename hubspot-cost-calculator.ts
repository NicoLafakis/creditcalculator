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
 * HubSpot Credits Infographic + Cost Calculator (Accessible)
 * - WCAG AA color/contrast on light theme (white bg, near-black text)
 * - Multi-page tabs: Overview, Included, Rates, Scenarios, Calculator
 * - Calculator supports GA-only vs GA+Beta modeling
 * - Print-friendly (use browser print for PDF)
 */

const INCLUDED = {
  main: { Starter: 500, Professional: 3000, Enterprise: 5000 },
  data: { Starter: 500, Professional: 5000, Enterprise: 10000 },
};

const RATES = {
  customerAgent_perConversation: 100, // text channels
  prospectingMonitoring_perContactMonth: 100,
  prospectingDeepResearch_perCompany: 10,
  workflowBreezeAction: 10,
  buyerIntent_perCompanyMonth: 10,
  dataAgent_perPromptRecord: 10, // beta
};

const COSTS = {
  PACK_PRICE_PER_1000_USD: 10,
  OVERAGE_PER_CREDIT_USD: 0.01,
};

function dollars(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon?: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      {Icon ? <Icon className="h-5 w-5" aria-hidden /> : null}
      <div>
        <h3 className="text-xl font-semibold leading-tight text-zinc-900">{title}</h3>
        {subtitle ? <p className="text-sm text-slate-700">{subtitle}</p> : null}
      </div>
    </div>
  );
}

export default function HubSpotCreditsInfographic() {
  const [group, setGroup] = useState<"main" | "data">("main");
  const [edition, setEdition] = useState<"Starter" | "Professional" | "Enterprise">("Professional");

  // Feature tier: GA-only vs GA + Beta
  const [featureTier, setFeatureTier] = useState<"ga" | "ga_beta">("ga");

  // Calculator inputs
  const [conv, setConv] = useState(120); // Customer Agent conversations
  const [monContacts, setMonContacts] = useState(200); // Prospecting monitoring contacts
  const [deepCompanies, setDeepCompanies] = useState(50); // Prospecting deep research companies
  const [wfActions, setWfActions] = useState(500); // Workflow Breeze actions
  const [intentCompanies, setIntentCompanies] = useState(100); // Buyer intent companies
  const [dataPrompts, setDataPrompts] = useState(0); // Data Agent prompts (beta)
  const [compareBoth, setCompareBoth] = useState(true);

  const included = INCLUDED[group][edition];

  const totalCredits = useMemo(() => {
    const betaEnabled = featureTier === "ga_beta";
    const dataPromptsEff = betaEnabled ? dataPrompts : 0;
    const U =
      conv * RATES.customerAgent_perConversation +
      monContacts * RATES.prospectingMonitoring_perContactMonth +
      deepCompanies * RATES.prospectingDeepResearch_perCompany +
      wfActions * RATES.workflowBreezeAction +
      intentCompanies * RATES.buyerIntent_perCompanyMonth +
      dataPromptsEff * RATES.dataAgent_perPromptRecord;
    return U;
  }, [conv, monContacts, deepCompanies, wfActions, intentCompanies, dataPrompts, featureTier]);

  const overageCredits = Math.max(0, totalCredits - included);
  const packs = Math.ceil(overageCredits / 1000);
  const packCost = packs * COSTS.PACK_PRICE_PER_1000_USD;
  const overageCost = overageCredits * COSTS.OVERAGE_PER_CREDIT_USD;

  const cheaper = useMemo(() => {
    if (overageCredits <= 0) return "No extra cost";
    return packCost <= overageCost ? "Capacity packs" : "Per-credit overage";
  }, [overageCredits, packCost, overageCost]);

  const chartData = [
    { name: "Starter", MainHubs: INCLUDED.main.Starter, DataPlatform: INCLUDED.data.Starter },
    { name: "Professional", MainHubs: INCLUDED.main.Professional, DataPlatform: INCLUDED.data.Professional },
    { name: "Enterprise", MainHubs: INCLUDED.main.Enterprise, DataPlatform: INCLUDED.data.Enterprise },
  ];

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6 bg-white text-zinc-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Breeze Credits Calculator</h1>
          <p className="text-slate-700 mt-1">Visual guide for monthly included credits, consumption, and cost planning.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.print()} aria-label="Print or save as PDF">
            <Printer className="mr-2 h-4 w-4" aria-hidden /> Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* Edition picker (applies across pages) */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label className="mb-2 block" htmlFor="productGroup">Product group</Label>
              <Select value={group} onValueChange={(v: any) => setGroup(v)}>
                <SelectTrigger id="productGroup" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Smart CRM / Marketing / Sales / Service / Content</SelectItem>
                  <SelectItem value="data">Data Hub / Customer Platform</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block" htmlFor="edition">Edition</Label>
              <Select value={edition} onValueChange={(v: any) => setEdition(v)}>
                <SelectTrigger id="edition" className="w-full">
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
                <div className="mt-1">Credits reset monthly and don’t roll over.</div>
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
              <SectionTitle icon={Info} title="What are HubSpot Credits?" subtitle="A flexible, cross-feature unit that resets monthly." />
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc pl-5 text-sm leading-relaxed">
                <li>Used across features (agents, automation, intent, etc.).</li>
                <li>Reset monthly; unused credits don’t roll over.</li>
                <li>Included credits depend on your highest owned edition per product group.</li>
                <li>You can add capacity packs (1,000 credits for $10) or enable per-credit overages ($0.010 per credit).</li>
                <li>Some features also incur separate service charges (e.g., telephony minutes or SMS).</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <SectionTitle icon={BarChartIcon} title="Included credits snapshot" subtitle="Compare editions across product groups." />
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
                    <td className="py-2">100</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Breeze Agents</td>
                    <td className="py-2">Prospecting Agent</td>
                    <td className="py-2">Enable monthly monitoring of one contact</td>
                    <td className="py-2">100</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Breeze Agents</td>
                    <td className="py-2">Prospecting Agent</td>
                    <td className="py-2">Deep research on one company</td>
                    <td className="py-2">10</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Breeze Automation</td>
                    <td className="py-2">Workflows</td>
                    <td className="py-2">Execute one Breeze action</td>
                    <td className="py-2">10</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Buyer Intent</td>
                    <td className="py-2">Intent</td>
                    <td className="py-2">Enable/monitor one company for a month</td>
                    <td className="py-2">10</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-2">Breeze Agents (Beta)</td>
                    <td className="py-2">Data Agent</td>
                    <td className="py-2">Generate response to one prompt for one record (text)</td>
                    <td className="py-2">10</td>
                  </tr>
                </tbody>
              </table>
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
              {/* Feature tier selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="mb-1 block" htmlFor="featureTier">Features included</Label>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="conv">Customer Agent conversations (text)</Label>
                  <Input id="conv" type="number" min={0} value={conv} onChange={(e) => setConv(parseInt(e.target.value || "0", 10))} />
                  <p className="text-xs text-slate-700 mt-1">100 credits each</p>
                </div>
                <div>
                  <Label htmlFor="monContacts">Prospecting: contacts monitored (monthly)</Label>
                  <Input id="monContacts" type="number" min={0} value={monContacts} onChange={(e) => setMonContacts(parseInt(e.target.value || "0", 10))} />
                  <p className="text-xs text-slate-700 mt-1">100 credits each</p>
                </div>
                <div>
                  <Label htmlFor="deepCompanies">Prospecting: deep research companies</Label>
                  <Input id="deepCompanies" type="number" min={0} value={deepCompanies} onChange={(e) => setDeepCompanies(parseInt(e.target.value || "0", 10))} />
                  <p className="text-xs text-slate-700 mt-1">10 credits each</p>
                </div>
                <div>
                  <Label htmlFor="wfActions">Workflow Breeze actions executed</Label>
                  <Input id="wfActions" type="number" min={0} value={wfActions} onChange={(e) => setWfActions(parseInt(e.target.value || "0", 10))} />
                  <p className="text-xs text-slate-700 mt-1">10 credits each</p>
                </div>
                <div>
                  <Label htmlFor="intentCompanies">Buyer Intent companies (monthly)</Label>
                  <Input id="intentCompanies" type="number" min={0} value={intentCompanies} onChange={(e) => setIntentCompanies(parseInt(e.target.value || "0", 10))} />
                  <p className="text-xs text-slate-700 mt-1">10 credits each</p>
                </div>
                {featureTier === "ga_beta" && (
                  <div>
                    <Label htmlFor="dataPrompts">Data Agent prompts (beta)</Label>
                    <Input id="dataPrompts" type="number" min={0} value={dataPrompts} onChange={(e) => setDataPrompts(parseInt(e.target.value || "0", 10))} />
                    <p className="text-xs text-slate-700 mt-1">10 credits each</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={compareBoth} onCheckedChange={setCompareBoth} id="compare" />
                <Label htmlFor="compare">Compare packs vs. per-credit overage</Label>
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
                    <div className="flex justify-between"><span>Pack cost</span><span className="font-semibold">{dollars(packCost)}</span></div>
                    <div className="text-xs text-slate-700">Packs are monthly and persist through term until changed.</div>
                  </CardContent>
                </Card>

                <Card className="col-span-1">
                  <CardHeader>
                    <div className="text-sm font-medium">Per-credit overage path</div>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex justify-between"><span>Overage credits (O)</span><span className="font-semibold">{overageCredits.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Overage cost</span><span className="font-semibold">{dollars(overageCost)}</span></div>
                    <div className="text-xs text-slate-700">Invoices are issued in credit increments (rounded by billing).</div>
                  </CardContent>
                </Card>
              </div>

              {overageCredits > 0 ? (
                <div className="rounded-2xl border p-4 text-sm bg-white">
                  <div className="font-medium">Recommendation</div>
                  <p className="mt-1">{cheaper} is cheaper this month ({dollars(Math.min(packCost, overageCost))}). The other path would cost {dollars(Math.max(packCost, overageCost))}.</p>
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
              <p>Rates and inclusions reflect the Sept. '25 HubSpot catalog pricing. Beta features and policies can change; consult the most current catalog for authoritative numbers. Currency shown is USD.</p>
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
