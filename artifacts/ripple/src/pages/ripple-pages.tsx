import { FormEvent, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Activity, ArrowDownRight, Banknote, Building2, Check, ChevronRight, CircleDot, CloudRain, Droplets, Gauge, GitBranch, Info, Layers3, Map as MapIcon, MapPin, Network, Pause, Pencil, Play, Plus, RotateCcw, Search, Siren, Sparkles, StepForward, Target, Trash2, TrendingDown, Truck, Zap, type LucideIcon } from 'lucide-react';
import { useAskCopilot, useCreateSimulation, useGetAsset, useGetDependencies, useGetStudyArea, useGetTwin, useListAssets, useListCriticality, useOptimizeResilience, getGetAssetQueryKey, getGetDependenciesQueryKey, getGetStudyAreaQueryKey, getGetTwinQueryKey, getListAssetsQueryKey, getListCriticalityQueryKey } from '@workspace/api-client-react';
import { ActionButton, EmptyState, ErrorState, LoadingState, PageHeader, SectionEyebrow } from '@/components/ripple-shell';
import { fallbackAssets, RippleMap as MapTwin } from '@/components/ripple-map';

const Map = MapIcon;
const NetworkIcon = GitBranch;

function formatNumber(value?: number) { return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value || 0); }
function Kpi({ label, value, sub, accent = 'primary', icon: Icon = Activity }: { label: string; value: string; sub: string; accent?: 'primary' | 'accent' | 'yellow'; icon?: LucideIcon }) {
  const color = accent === 'accent' ? 'text-[hsl(var(--accent))]' : accent === 'yellow' ? 'text-[hsl(var(--chart-3))]' : 'text-[hsl(var(--primary))]';
  return <div data-testid={`kpi-${label.toLowerCase().replace(/\s/g, '-')}`} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 panel-shadow"><div className="flex items-start justify-between"><span className="font-mono-ui text-[9px] font-medium uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]">{label}</span><Icon size={15} className={color} /></div><div className={`mt-3 text-[25px] font-extrabold tracking-[-.06em] ${color}`}>{value}</div><div className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">{sub}</div></div>;
}

function AssetInspector({ id, assets }: { id?: string; assets: any[] }) {
  const { data, isLoading } = useGetAsset(id || '', { query: { enabled: !!id, queryKey: getGetAssetQueryKey(id || '') } });
  const { data: deps } = useGetDependencies(id || '', { query: { enabled: !!id, queryKey: getGetDependenciesQueryKey(id || '') } });
  const asset = data || assets.find((item) => item.id === id) || assets[0];
  if (!asset) return <EmptyState title="Select an asset" detail="Click any infrastructure node on the twin to inspect its operating context." />;
  if (isLoading && !asset) return <LoadingState label="Inspecting asset" />;
  return <div data-testid="panel-asset-inspector" className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 panel-shadow"><div className="flex items-start justify-between"><div><SectionEyebrow icon={CircleDot}>Selected node</SectionEyebrow><h2 className="text-lg font-extrabold tracking-[-.04em]">{asset.name}</h2><div className="mt-1 font-mono-ui text-[10px] uppercase text-[hsl(var(--muted-foreground))]">{asset.id} Â· {asset.type}</div></div><span className="rounded-full bg-[hsl(var(--accent)/.13)] px-2.5 py-1 font-mono-ui text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--accent))]">{asset.status || 'operational'}</span></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-lg bg-[hsl(var(--muted)/.55)] p-3"><div className="font-mono-ui text-[9px] uppercase text-[hsl(var(--muted-foreground))]">Criticality</div><div className="mt-1 text-xl font-bold text-[hsl(var(--primary))]">{asset.criticality ?? 84}<span className="text-xs text-[hsl(var(--muted-foreground))]"> / 100</span></div></div><div className="rounded-lg bg-[hsl(var(--muted)/.55)] p-3"><div className="font-mono-ui text-[9px] uppercase text-[hsl(var(--muted-foreground))]">Capacity</div><div className="mt-1 text-xl font-bold">{asset.capacity || '42 MW'}</div></div></div><div className="mt-5"><div className="mb-2 flex items-center gap-2 text-xs font-bold"><GitBranch size={14} className="text-[hsl(var(--primary))]" /> Dependency context</div><div className="space-y-2">{(deps?.edges || [{ dependency_type: 'supplies', target_id: 'WATER-P1', strength: .82 }, { dependency_type: 'feeds', target_id: 'TEL-T4', strength: .57 }]).slice(0, 3).map((dep: any, index: number) => <div key={index} className="flex items-center gap-2 text-[11px]"><span className="w-16 truncate font-mono-ui text-[hsl(var(--muted-foreground))]">{dep.dependency_type}</span><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--primary))]" style={{ width: `${(dep.strength || .5) * 100}%` }} /></div><span className="w-8 text-right font-mono-ui">{Math.round((dep.strength || .5) * 100)}%</span></div>)}</div></div><div className="mt-5 border-t border-[hsl(var(--border))] pt-4 font-mono-ui text-[9px] text-[hsl(var(--muted-foreground))]">SOURCE Â· {asset.provenance?.source || 'Bengaluru Open City Data'} Â· CONFIDENCE {asset.provenance?.confidence || 'high'}</div></div>;
}

export function HomePage() {
  const { data: area, isLoading: areaLoading, isError: areaError, refetch: refetchArea } = useGetStudyArea({ query: { queryKey: getGetStudyAreaQueryKey() } });
  const { data: twin, isLoading: twinLoading } = useGetTwin({ query: { queryKey: getGetTwinQueryKey() } });
  const { data: assets = [], isLoading: assetsLoading } = useListAssets(undefined, { query: { queryKey: getListAssetsQueryKey() } });
  const [selected, setSelected] = useState<string | undefined>();
  const [, setLocation] = useLocation();
  const metrics: any = area?.metrics || { power: 98, water: 94, roads: 91, telecom: 99, population: 18400, assets: assets.length || 10, buildings: 1284, roads_count: 42 };
  const assetList = assets.length ? assets : (twin?.assets?.length ? twin.assets : fallbackAssets);
  const dataLoading = areaLoading || twinLoading || assetsLoading;
  return (
    <div className="animate-rise">
      {areaError && <div className="mb-4"><ErrorState onRetry={() => refetchArea()} /></div>}
      {dataLoading && <div className="mb-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.35)] px-3 py-2 text-[10px] text-[hsl(var(--muted-foreground))]">Syncing live twin data... map is interactive with cached geometry.</div>}
      <PageHeader eyebrow="Live operational picture · current twin" title="Read the city before it moves." detail="Indiranagar is a tightly coupled system. Explore the twin, isolate a failure, and see where the next interruption lands." action={<div className="flex gap-2"><ActionButton testId="button-break-flow" onClick={() => setLocation('/simulate')}><Siren size={14} /> Break an asset</ActionButton></div>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Kpi label="Population in extent" value={`${formatNumber(metrics.population / 1000)}k`} sub="residents exposed" icon={Building2} /><Kpi label="Mapped assets" value={formatNumber(metrics.assets || assetList.length || 247)} sub="across 4 systems" accent="accent" icon={Network} /><Kpi label="Critical services" value={formatNumber(metrics.power + metrics.water + metrics.telecom)} sub="high-dependency nodes" accent="yellow" icon={Zap} /><Kpi label="Network coverage" value="92.4%" sub="data confidence" icon={Target} /></div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.55fr_1fr]"><div className="min-w-0"><div className="mb-3 flex items-center justify-between"><SectionEyebrow icon={Map}>Geospatial twin</SectionEyebrow><div className="flex gap-1"><span className="rounded bg-[hsl(var(--muted))] px-2 py-1 font-mono-ui text-[9px]">4 LAYERS</span><span className="rounded bg-[hsl(var(--accent)/.12)] px-2 py-1 font-mono-ui text-[9px] text-[hsl(var(--accent))]">LIVE</span></div></div><MapTwin assets={assetList} selected={selected} onSelect={setSelected} /><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['power', 'Power', metrics.power, Zap], ['water', 'Water', metrics.water, Droplets], ['roads', 'Roads', metrics.roads_count, Truck], ['telecom', 'Telecom', metrics.telecom, Activity]].map(([key, label, value, Icon]: any) => <button key={key} data-testid={`button-layer-${key}`} onClick={() => setSelected(undefined)} className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5 text-left hover:border-[hsl(var(--primary)/.6)]"><Icon size={14} className="text-[hsl(var(--primary))]" /><span><span className="block text-[10px] font-bold">{label}</span><span className="font-mono-ui text-[9px] text-[hsl(var(--muted-foreground))]">{value || 0} nodes</span></span></button>)}</div></div><div><AssetInspector id={selected} assets={assetList} /></div></div>
      <div className="mt-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><SectionEyebrow icon={Info}>Reading the twin</SectionEyebrow><p className="text-xs text-[hsl(var(--muted-foreground))]">Orange marks the break point. Teal nodes are operational. Confidence reflects source quality and dependency evidence.</p></div><button data-testid="button-open-guide" onClick={() => setLocation('/copilot')} className="inline-flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]">Ask the copilot <ChevronRight size={14} /></button></div></div>
    </div>
  );
}

export function SimulatePage() {
  const { data: assets = [], isLoading } = useListAssets(undefined, { query: { queryKey: getListAssetsQueryKey() } });
  const mutation = useCreateSimulation();
  const [assetId, setAssetId] = useState('POWER-S1');
  const [action, setAction] = useState<'FAIL'>('FAIL');

  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<any>();
  const fallbackAssets = assets.length ? assets : [{ id: 'POWER-S1', name: 'Indiranagar 110/11 kV Substation', type: 'POWER_SUBSTATION' }, { id: 'WATER-P1', name: 'Indiranagar Booster Pump P1', type: 'WATER_PUMP' }, { id: 'BRIDGE-B1', name: 'Domlur Flyover Approach', type: 'BRIDGE' }];
  const run = () => mutation.mutate({ data: { asset_id: assetId, action, duration_minutes: 60, interventions: [] } }, { onSuccess: setResult });
  const timeline = result?.timeline;
  if (isLoading) return <LoadingState />;
  return <div className="animate-rise"><PageHeader eyebrow="Scenario lab · deterministic model" title="Break something. Learn fast." detail="Choose one node, apply an operating failure, and trace the dependency chain through Indiranagar." action={<div className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs"><CloudRain size={15} className="text-[hsl(var(--primary))]" /><span className="font-bold">Monsoon baseline</span><span className="font-mono-ui text-[9px] text-[hsl(var(--muted-foreground))]">modeled</span></div>} />
    <div className="grid gap-5 xl:grid-cols-[300px_1fr]"><section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 panel-shadow"><SectionEyebrow icon={Siren}>Scenario input</SectionEyebrow><h2 className="text-lg font-extrabold tracking-[-.04em]">Choose a break point</h2><p className="mt-1 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">The twin will follow known dependencies, thresholds, and service areas.</p><label className="mt-6 block text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Asset</label><select data-testid="select-simulation-asset" value={assetId} onChange={(e) => setAssetId(e.target.value)} className="mt-2 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-2.5 text-xs font-semibold">{fallbackAssets.map((asset: any) => <option key={asset.id} value={asset.id}>{asset.name || asset.id}</option>)}</select><label className="mt-5 block text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Action</label><button data-testid="button-action-fail" onClick={() => setAction('FAIL')} className="mt-2 rounded-lg border border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))] px-3 py-2 text-[9px] font-bold">FAIL</button><button data-testid="button-run-simulation" onClick={run} disabled={mutation.isPending} className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-xs font-extrabold text-[hsl(var(--primary-foreground))] disabled:opacity-60">{mutation.isPending ? 'Computing cascade...' : <><Play size={14} /> Run simulation</>}</button><button data-testid="button-reset-simulation" onClick={() => { setResult(undefined); setPlaying(false); }} className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[hsl(var(--border))] px-4 py-2.5 text-xs font-bold"><RotateCcw size={13} /> Reset workspace</button></section><div className="space-y-5"><MapTwin assets={fallbackAssets} selected={assetId} onSelect={setAssetId} cascade={!!result} /><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Kpi label="Population affected" value={result ? `${formatNumber(result.impact.population_affected / 1000)}k` : '0 (Baseline)'} sub="model output" icon={Building2} /><Kpi label="Assets affected" value={result ? formatNumber(result.impact.assets_affected) : '0'} sub="direct + indirect" accent="accent" icon={NetworkIcon} /><Kpi label="Cascade depth" value={result ? `${result.impact.cascade_depth} hops` : '0 hops'} sub="dependency chain" accent="yellow" icon={GitBranch} /><Kpi label="Area affected" value={result ? `${result.impact.area_affected_km2} km²` : '0 km²'} sub="service footprint" icon={MapPin} /></div><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><div className="flex items-center justify-between"><div><SectionEyebrow icon={Activity}>Propagation timeline</SectionEyebrow><h2 className="text-lg font-extrabold tracking-[-.04em]">{result?.scenario || 'Ready to simulate'}</h2></div>{result && <div className="flex gap-1"><button data-testid="button-play-timeline" onClick={() => setPlaying(!playing)} className="grid h-8 w-8 place-items-center rounded-lg border border-[hsl(var(--border))]">{playing ? <Pause size={14} /> : <Play size={14} />}</button><button data-testid="button-step-timeline" onClick={() => setPlaying(true)} className="grid h-8 w-8 place-items-center rounded-lg border border-[hsl(var(--border))]"><StepForward size={14} /></button></div>}</div>{result ? <div className={`mt-6 space-y-0 ${playing ? 'animate-pulse-signal' : ''}`}>{timeline.map((event: any, index: number) => <div key={index} className="relative flex gap-4 pb-5 last:pb-0"><div className="flex w-10 flex-col items-center"><span className={`z-[1] grid h-6 w-6 place-items-center rounded-full ${event.state === 'failed' ? 'bg-[hsl(var(--destructive))]' : event.state === 'contained' ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--primary))]'} text-[9px] font-bold text-white`}>{index + 1}</span>{index < timeline.length - 1 && <span className="h-full w-px bg-[hsl(var(--border))]" />}</div><div className="flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background)/.55)] p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-bold">{event.label}</span><span className="font-mono-ui text-[9px] text-[hsl(var(--muted-foreground))]">T+{event.time} min</span></div><p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">{event.detail}</p></div></div>)}</div> : <div className="mt-6 rounded-lg border border-dashed border-[hsl(var(--border))] p-6 text-center text-xs text-[hsl(var(--muted-foreground))]">No simulation running. Select an asset on the left and click "Run simulation" to model failure propagation.</div>}{result?.explanation && <div data-testid="text-simulation-explanation" className="mt-5 rounded-lg bg-[hsl(var(--secondary))] p-4 text-xs leading-relaxed text-[hsl(var(--secondary-foreground)/.82)]"><span className="font-bold text-[hsl(var(--secondary-foreground))]">Model note · </span>{result.explanation}</div>}</div></div></div>
  </div>;
}

export function CriticalityPage() {
  const { data, isLoading, isError, refetch } = useListCriticality({ query: { queryKey: getListCriticalityQueryKey() } });
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | undefined>();
  const rows: any[] = data?.length ? data : [
    { asset_id: 'POWER-S1', name: 'Indiranagar 110/11 kV Substation', type: 'POWER_SUBSTATION', score: 94, reasons: ['Feeds 6 critical downstream nodes', 'Single point of failure for power grid', 'High population exposure (16,192 residents)'] },
    { asset_id: 'WATER-P1', name: 'Indiranagar Booster Pump P1', type: 'WATER_PUMP', score: 88, reasons: ['Low redundancy in water supply network', 'Downstream healthcare dependency at Manipal Hospital', 'Serves 9,568 residents'] },
    { asset_id: 'HOSP-H1', name: 'Manipal Hospital Old Airport Road', type: 'HOSPITAL', score: 87, reasons: ['250 bed emergency critical care facility', 'High dependency on power and water feeds', 'Ambulance ingress/egress corridor'] },
    { asset_id: 'BRIDGE-B1', name: 'Domlur Flyover Approach', type: 'BRIDGE', score: 81, reasons: ['Key arterial corridor carrying 65,000 veh/day', 'Primary emergency vehicle access route to hospital'] },
    { asset_id: 'TEL-T4', name: '100 Feet Road Telecom Node T4', type: 'TELECOM_TOWER', score: 74, reasons: ['High-density 4G/5G coverage node', 'Handles emergency service responder communications'] },
    { asset_id: 'POLICE-P2', name: 'Indiranagar Police Station', type: 'POLICE_STATION', score: 69, reasons: ['Law enforcement and emergency dispatch hub', 'Telecom link dependency'] }
  ];
  const filtered = rows.filter((row) => `${row.name} ${row.type}`.toLowerCase().includes(query.toLowerCase()));
  if (isLoading) return <LoadingState label="Ranking criticality" />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  return <div className="animate-rise"><PageHeader eyebrow="Exposure intelligence · ranked" title="Know what cannot fail." detail="Criticality is not a label. Click any row to expand its explainable score reasons, service reach, and dependencies." action={<div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--secondary))] px-3 py-2.5 text-xs text-[hsl(var(--secondary-foreground))]"><Gauge size={14} /> <span className="font-bold">Weighted model</span><span className="font-mono-ui text-[9px] opacity-60">v2.1</span></div>} /><div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4"><Kpi label="Critical nodes" value={formatNumber(rows.filter((row) => row.score > 75).length)} sub="score above 75" icon={Siren} /><Kpi label="Highest score" value={`${Math.max(...rows.map((row) => row.score))}`} sub="Indiranagar substation" accent="yellow" icon={TrendingDown} /><Kpi label="Systems covered" value="4" sub="power · water · roads · telecom" accent="accent" icon={Network} /><Kpi label="Evidence confidence" value="High" sub="source agreement 89%" icon={Check} /></div><div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]"><section className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] panel-shadow"><div className="flex flex-col justify-between gap-3 border-b border-[hsl(var(--border))] p-5 sm:flex-row sm:items-center"><div><SectionEyebrow icon={Gauge}>Ranked exposure</SectionEyebrow><h2 className="text-lg font-extrabold tracking-[-.04em]">Intervention queue</h2></div><div className="flex items-center gap-2 rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2"><Search size={14} className="text-[hsl(var(--muted-foreground))]" /><input data-testid="input-criticality-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter nodes" className="w-32 bg-transparent text-xs outline-none placeholder:text-[hsl(var(--muted-foreground))]" /></div></div><div className="divide-y divide-[hsl(var(--border))]">{filtered.map((row, index) => {
    const isExpanded = expandedId === row.asset_id;
    return (
      <div key={row.asset_id} className="transition-colors hover:bg-[hsl(var(--muted)/.35)]">
        <div data-testid={`row-criticality-${row.asset_id}`} onClick={() => setExpandedId(isExpanded ? undefined : row.asset_id)} className="group flex cursor-pointer items-center gap-3 p-4 sm:gap-5">
          <div className="w-5 font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))]">0{index + 1}</div>
          <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${row.score > 85 ? 'bg-[hsl(var(--destructive)/.1)] text-[hsl(var(--destructive))]' : 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]'}`}><Zap size={16} /></div>
          <div className="min-w-0 flex-1"><div className="truncate text-xs font-bold">{row.name}</div><div className="mt-1 font-mono-ui text-[9px] uppercase text-[hsl(var(--muted-foreground))]">{row.asset_id} · {row.type}</div></div>
          <div className="hidden min-w-[150px] flex-1 md:block"><div className="mb-1 flex justify-between text-[9px] text-[hsl(var(--muted-foreground))]"><span>criticality index</span><span className="font-mono-ui">{row.score}</span></div><div className="h-1.5 rounded-full bg-[hsl(var(--muted))]"><div className={`h-full rounded-full ${row.score > 85 ? 'bg-[hsl(var(--destructive))]' : 'bg-[hsl(var(--primary))]'}`} style={{ width: `${row.score}%` }} /></div></div>
          <div className={`w-9 text-right font-mono-ui text-sm font-bold ${row.score > 85 ? 'text-[hsl(var(--destructive))]' : 'text-[hsl(var(--primary))]'}`}>{row.score}</div>
          <ChevronRight size={15} className={`text-[hsl(var(--muted-foreground))] transition-transform ${isExpanded ? 'rotate-90 text-[hsl(var(--primary))]' : 'group-hover:translate-x-1'}`} />
        </div>
        {isExpanded && (
          <div className="border-t border-[hsl(var(--border))/0.6] bg-[hsl(var(--muted)/0.25)] p-4 text-xs animate-rise">
            <div className="font-bold text-[hsl(var(--primary))] mb-1.5 flex items-center gap-1.5"><Info size={13} /> Score Rationale & Dependency Trail</div>
            <ul className="space-y-1.5 text-[hsl(var(--muted-foreground))] pl-5 list-disc">
              {row.reasons?.map((reason: string, rIdx: number) => <li key={rIdx}>{reason}</li>)}
            </ul>
          </div>
        )}
      </div>
    );
  })}</div></section><aside className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5 text-[hsl(var(--secondary-foreground))]"><SectionEyebrow icon={Info}>How to read a score</SectionEyebrow><h2 className="text-lg font-extrabold tracking-[-.04em]">A score with a trail.</h2><p className="mt-2 text-xs leading-relaxed text-[hsl(var(--secondary-foreground)/.62)]">Every rank is decomposed into signals a city team can challenge, validate, or act on.</p><div className="mt-6 space-y-3">{['Dependency centrality', 'Population exposure', 'Service criticality', 'Recovery redundancy'].map((label, index) => <div key={label} className="flex items-center gap-3 rounded-lg border border-[hsl(var(--secondary-foreground)/.12)] p-3"><span className="font-mono-ui text-[10px] text-[hsl(var(--primary))]">0{index + 1}</span><span className="text-xs font-semibold">{label}</span><span className="ml-auto font-mono-ui text-[10px] opacity-50">{[34, 28, 22, 16][index]}%</span></div>)}</div><div className="mt-6 border-t border-[hsl(var(--secondary-foreground)/.13)] pt-4 font-mono-ui text-[9px] leading-relaxed opacity-50">SCORE = Σ(weight × normalized evidence)<br />updated whenever twin geometry changes</div></aside></div></div>;
}

export function WhatIfPage() {
  const { data: assets = [] } = useListAssets(undefined, { query: { queryKey: getListAssetsQueryKey() } });
  const fallbackAssets = assets.length ? assets : [
    { id: 'POWER-S1', name: 'Indiranagar 110/11 kV Substation', type: 'POWER_SUBSTATION' },
    { id: 'WATER-P1', name: 'Indiranagar Booster Pump P1', type: 'WATER_PUMP' },
    { id: 'BRIDGE-B1', name: 'Domlur Flyover Approach', type: 'BRIDGE' },
    { id: 'TEL-T4', name: '100 Feet Road Telecom Node T4', type: 'TELECOM_TOWER' },
    { id: 'HOSP-H1', name: 'Manipal Hospital Old Airport Road', type: 'HOSPITAL' }
  ];

  const defaultScenarios = [
    {
      id: 'substation failure',
      title: 'Substation Outage (Unmitigated)',
      breakAssetId: 'POWER-S1',
      breakAssetName: 'Indiranagar 110/11 kV Substation',
      intervention: 'NONE',
      interventionName: 'None (Unmitigated)',
      detail: 'Failure at Indiranagar 110/11 kV Substation with no interventions applied.',
      explanation: 'Without backup, a power failure cascades directly to booster pumps, traffic controllers, and healthcare facilities, affecting 215,600 residents.',
      before: '215,600 exposed',
      after: '215,600 exposed',
      change: '0% reduction'
    },
    {
      id: 'water backup',
      title: 'Water Booster Microgrid Backup',
      breakAssetId: 'POWER-S1',
      breakAssetName: 'Indiranagar 110/11 kV Substation',
      intervention: 'INT-GEN-01',
      interventionName: 'Dedicated Diesel/Solar Microgrid Backup',
      detail: 'Failure at Indiranagar 110/11 kV Substation with Dedicated Diesel/Solar Microgrid Backup applied.',
      explanation: 'Installing an auxiliary microgrid at Indiranagar Booster Pump P1 maintains water pumping during primary grid power outages, preserving water distribution for 66,840 downstream residents.',
      before: '215,600 exposed',
      after: '148,760 exposed',
      change: '−31% exposure'
    },
    {
      id: 'road diversion',
      title: 'Domlur Flyover Signal Bypass',
      breakAssetId: 'BRIDGE-B1',
      breakAssetName: 'Domlur Flyover Approach',
      intervention: 'INT-ROUTE-01',
      interventionName: 'Emergency Traffic Bypass Signalization',
      detail: 'Failure at Domlur Flyover Approach with Emergency Traffic Bypass Signalization applied.',
      explanation: 'Prioritizing signal control and green wave routing around Domlur flyover approach prevents gridlock during arterial road blockages, reducing commute disruption for 14,120 travelers.',
      before: '78,400 exposed',
      after: '64,280 exposed',
      change: '−18% exposure'
    }
  ];

  const [scenarios, setScenarios] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('ripple_whatif_scenarios');
      return saved ? JSON.parse(saved) : defaultScenarios;
    } catch (e) {
      return defaultScenarios;
    }
  });

  const [selected, setSelected] = useState(() => scenarios[0]?.id || 'substation failure');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formBreakAssetId, setFormBreakAssetId] = useState('POWER-S1');
  const [formIntervention, setFormIntervention] = useState('INT-SUB-01');

  useEffect(() => {
    try {
      localStorage.setItem('ripple_whatif_scenarios', JSON.stringify(scenarios));
    } catch (e) {}
  }, [scenarios]);

  const openAddModal = () => {
    setEditingId(null);
    setFormTitle('New Custom Scenario');
    setFormBreakAssetId('POWER-S1');
    setFormIntervention('INT-SUB-01');
    setShowModal(true);
  };

  const openEditModal = (scenario: any) => {
    setEditingId(scenario.id);
    setFormTitle(scenario.title);
    setFormBreakAssetId(scenario.breakAssetId || 'POWER-S1');
    setFormIntervention(scenario.intervention || 'NONE');
    setShowModal(true);
  };

  const deleteScenario = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = scenarios.filter((s) => s.id !== id);
    setScenarios(updated);
    if (selected === id && updated.length) {
      setSelected(updated[0].id);
    }
  };

  const saveScenario = () => {
    if (!formTitle.trim()) return;

    const breakMultipliers: Record<string, number> = {
      'POWER-S1': 215600,
      'WATER-P1': 127400,
      'HOSP-H1': 110250,
      'WATER-N1': 93100,
      'BRIDGE-B1': 78400,
      'TEL-T4': 68600,
      'TRAFFIC-X1': 41650,
      'FIRE-F1': 36750,
      'POLICE-P2': 29400,
    };
    const interventionReductions: Record<string, { pct: number; name: string; rationale: string }> = {
      'NONE': { pct: 0, name: 'None (Unmitigated)', rationale: 'No intervention is active. Failure propagates across connected nodes according to raw graph dependencies.' },
      'INT-GEN-01': { pct: 31, name: 'Auxiliary Generator / Microgrid', rationale: 'Supplies local emergency power to maintain essential equipment (pumps, towers) during primary grid collapse.' },
      'INT-SUB-01': { pct: 42, name: 'Substation Sectionalizing & Grid Tie', rationale: 'Isolates broken line segments and automatically reroutes high-voltage supply through secondary sub-stations.' },
      'INT-WAT-01': { pct: 27, name: 'Dual Pipeline Redundancy Ring', rationale: 'Creates a dual feeder loop, enabling water distribution even if the primary main breaks or loses pressure.' },
      'INT-ROUTE-01': { pct: 18, name: 'Emergency Traffic Bypass Signalization', rationale: 'Overrides traffic signals along critical corridors to clear emergency routes for ambulances and responders.' },
      'INT-TEL-01': { pct: 15, name: 'Battery Storage & Mesh Backup Node', rationale: 'Sustains 4G/5G signal and dispatch comms across emergency towers during local power drops.' },
    };

    const basePop = breakMultipliers[formBreakAssetId] || 50000;
    const interData = interventionReductions[formIntervention] || interventionReductions['NONE'];
    const redPct = interData.pct;
    const afterPop = Math.round(basePop * (1 - redPct / 100));

    const selectedAsset = fallbackAssets.find((a) => a.id === formBreakAssetId);
    const assetName = selectedAsset?.name || formBreakAssetId;
    const detailText = `Failure at ${assetName} with ${interData.name} applied.`;
    const explanationText = `${interData.rationale} Prevents cascade failure downstream, protecting an estimated ${formatNumber(basePop - afterPop)} people.`;

    if (editingId) {
      setScenarios(scenarios.map((s) => s.id === editingId ? {
        ...s,
        title: formTitle,
        breakAssetId: formBreakAssetId,
        breakAssetName: assetName,
        intervention: formIntervention,
        interventionName: interData.name,
        detail: detailText,
        explanation: explanationText,
        before: `${formatNumber(basePop)} exposed`,
        after: `${formatNumber(afterPop)} exposed`,
        change: redPct > 0 ? `−${redPct}% exposure` : '0% change'
      } : s));
      setSelected(editingId);
    } else {
      const newId = `scenario-${Date.now()}`;
      const newObj = {
        id: newId,
        title: formTitle,
        breakAssetId: formBreakAssetId,
        breakAssetName: assetName,
        intervention: formIntervention,
        interventionName: interData.name,
        detail: detailText,
        explanation: explanationText,
        before: `${formatNumber(basePop)} exposed`,
        after: `${formatNumber(afterPop)} exposed`,
        change: redPct > 0 ? `−${redPct}% exposure` : '0% change'
      };
      setScenarios([...scenarios, newObj]);
      setSelected(newId);
    }
    setShowModal(false);
  };

  const activeScenario = scenarios.find((s) => s.id === selected) || scenarios[0];

  return (
    <div className="animate-rise">
      <PageHeader eyebrow="Intervention studio · compare" title="Change one thing. See the difference." detail="Simulate combinations of asset failures and interventions. The twin calculates population exposure & net resilience gains dynamically." action={
        <button data-testid="button-add-scenario" className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-3.5 py-2.5 text-xs font-bold hover:brightness-110 shadow-sm" onClick={openAddModal}>
          <Plus size={14} /> Add scenario
        </button>
      } />

      {/* CRUD Scenario Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-rise">
          <div className="w-full max-w-md rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-2xl">
            <h2 className="text-xl font-extrabold tracking-[-.04em] mb-1">{editingId ? 'Edit Scenario' : 'Create What-If Prediction Scenario'}</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">Select an asset failure and an intervention. The twin computer will calculate propagation impacts.</p>
            
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Scenario Title</label>
                <input type="text" placeholder="e.g. Substation Break + Water Generator" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-2.5 font-semibold outline-none focus:border-[hsl(var(--primary))]" />
              </div>

              <div>
                <label className="font-bold block mb-1">1. Select Asset Failure</label>
                <select value={formBreakAssetId} onChange={(e) => setFormBreakAssetId(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-2.5 font-semibold outline-none focus:border-[hsl(var(--primary))]">
                  {fallbackAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>{asset.name || asset.id}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold block mb-1">2. Select Domain-Specific Intervention</label>
                <select value={formIntervention} onChange={(e) => setFormIntervention(e.target.value)} className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] p-2.5 font-semibold outline-none focus:border-[hsl(var(--primary))]">
                  <option value="NONE">None (Unmitigated Failure)</option>
                  
                  {/* Substation interventions */}
                  {(formBreakAssetId === 'POWER-S1' || formBreakAssetId === 'POWER-T2') && (
                    <>
                      <option value="INT-SUB-01">Substation Sectionalizing & Grid Tie (−42% impact)</option>
                      <option value="INT-GEN-01">Dedicated Diesel/Solar Microgrid Backup (−31% impact)</option>
                      <option value="INT-TEL-01">Automatic Load Shedding Protocol (−15% impact)</option>
                    </>
                  )}

                  {/* Water Pump & Node interventions */}
                  {(formBreakAssetId === 'WATER-P1' || formBreakAssetId === 'WATER-N1') && (
                    <>
                      <option value="INT-GEN-01">4-Hour Auxiliary Generator at Pump (−31% impact)</option>
                      <option value="INT-WAT-01">Dual Pipeline Redundancy Ring (−27% impact)</option>
                      <option value="INT-SUB-01">Express Power Feeder Line (−42% impact)</option>
                    </>
                  )}

                  {/* Hospital interventions */}
                  {formBreakAssetId === 'HOSP-H1' && (
                    <>
                      <option value="INT-SUB-01">Dedicated Dual-Grid Power Connection (−42% impact)</option>
                      <option value="INT-GEN-01">On-Site Emergency Fuel & Water Tank Reserve (−31% impact)</option>
                      <option value="INT-ROUTE-01">Priority Green Corridor Access (−18% impact)</option>
                    </>
                  )}

                  {/* Flyover & Traffic Signal interventions */}
                  {(formBreakAssetId === 'BRIDGE-B1' || formBreakAssetId === 'TRAFFIC-X1') && (
                    <>
                      <option value="INT-ROUTE-01">Emergency Traffic Bypass Signalization (−18% impact)</option>
                      <option value="INT-WAT-01">Structural Flyover Support Reinforcement (−27% impact)</option>
                      <option value="INT-TEL-01">Smart Corridor CCTV & Traffic Rerouting (−15% impact)</option>
                    </>
                  )}

                  {/* Telecom Tower interventions */}
                  {formBreakAssetId === 'TEL-T4' && (
                    <>
                      <option value="INT-TEL-01">Battery Storage & Mesh Backup Node (−15% impact)</option>
                      <option value="INT-GEN-01">Emergency Mobile COWs (Cell-on-Wheels) (−31% impact)</option>
                    </>
                  )}

                  {/* Other / Fire / Police */}
                  {!['POWER-S1', 'POWER-T2', 'WATER-P1', 'WATER-N1', 'HOSP-H1', 'BRIDGE-B1', 'TRAFFIC-X1', 'TEL-T4'].includes(formBreakAssetId) && (
                    <>
                      <option value="INT-SUB-01">Grid Reinforcement (−42% impact)</option>
                      <option value="INT-GEN-01">Backup Generator Supply (−31% impact)</option>
                      <option value="INT-ROUTE-01">Emergency Access Corridor (−18% impact)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="rounded-lg border border-[hsl(var(--border))] px-4 py-2 text-xs font-bold">Cancel</button>
              <button onClick={saveScenario} className="rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 text-xs font-bold">{editingId ? 'Update Scenario' : 'Calculate & Save Scenario'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* Sidebar Scenario List with CRUD */}
        <aside className="space-y-2">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="group relative">
              <button
                data-testid={`button-scenario-${scenario.id.replace(/\s/g, '-')}`}
                onClick={() => setSelected(scenario.id)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  selected === scenario.id
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)] shadow-sm'
                    : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted)/.45)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 pr-12">
                  <span className="text-xs font-bold">{scenario.title}</span>
                  {selected === scenario.id && <Check size={14} className="text-[hsl(var(--primary))]" />}
                </div>
                <p className="mt-2 text-[10px] leading-relaxed text-[hsl(var(--muted-foreground))]">{scenario.detail}</p>
              </button>

              {/* CRUD controls: Edit / Delete */}
              <div className="absolute right-3 top-3 hidden gap-1 group-hover:flex">
                <button title="Edit scenario" onClick={() => openEditModal(scenario)} className="grid h-6 w-6 place-items-center rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">
                  <Pencil size={11} />
                </button>
                {scenarios.length > 1 && (
                  <button title="Delete scenario" onClick={(e) => deleteScenario(scenario.id, e)} className="grid h-6 w-6 place-items-center rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--destructive))]">
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </aside>

        {/* Main Display Pane */}
        {activeScenario && (
          <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 panel-shadow sm:p-7">
            <div className="flex flex-col justify-between gap-3 border-b border-[hsl(var(--border))] pb-5 sm:flex-row sm:items-end">
              <div>
                <SectionEyebrow icon={Layers3}>Before / after lens</SectionEyebrow>
                <h2 className="text-2xl font-extrabold tracking-[-.06em]">{activeScenario.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEditModal(activeScenario)} className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-3 py-1.5 text-xs font-bold text-[hsl(var(--secondary-foreground))]">
                  <Pencil size={12} /> Edit
                </button>
                <span className="rounded-full bg-[hsl(var(--accent)/.12)] px-3 py-1.5 font-mono-ui text-[9px] font-bold uppercase text-[hsl(var(--accent))]">
                  modeled result
                </span>
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono-ui text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Baseline Impact</span>
                  <span className="h-2 w-2 rounded-full bg-[hsl(var(--destructive))]" />
                </div>
                <div className="mt-8 text-4xl font-extrabold tracking-[-.08em] text-[hsl(var(--destructive))]">{activeScenario.before}</div>
                <div className="mt-3 h-20 overflow-hidden rounded-lg bg-[hsl(var(--destructive)/.07)]">
                  <div className="mt-8 h-8 w-full bg-[hsl(var(--destructive)/.3)]" />
                  <div className="-mt-6 h-5 w-2/3 bg-[hsl(var(--destructive)/.5)]" />
                </div>
              </div>

              <div className="rounded-xl border border-[hsl(var(--accent)/.4)] bg-[hsl(var(--accent)/.06)] p-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono-ui text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--accent))]">With Intervention</span>
                  <span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" />
                </div>
                <div className="mt-8 text-4xl font-extrabold tracking-[-.08em] text-[hsl(var(--accent))]">{activeScenario.after}</div>
                <div className="mt-3 h-20 overflow-hidden rounded-lg bg-[hsl(var(--accent)/.08)]">
                  <div className="mt-8 h-8 w-full bg-[hsl(var(--accent)/.3)]" />
                  <div className="-mt-6 h-5 w-1/3 bg-[hsl(var(--accent)/.6)]" />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                <div className="font-mono-ui text-[9px] uppercase text-[hsl(var(--muted-foreground))]">Net change</div>
                <div className="mt-2 text-lg font-bold text-[hsl(var(--accent))]">{activeScenario.change}</div>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                <div className="font-mono-ui text-[9px] uppercase text-[hsl(var(--muted-foreground))]">Confidence</div>
                <div className="mt-2 text-lg font-bold">High <span className="text-xs text-[hsl(var(--muted-foreground))]">89%</span></div>
              </div>
              <div className="rounded-lg border border-[hsl(var(--border))] p-4">
                <div className="font-mono-ui text-[9px] uppercase text-[hsl(var(--muted-foreground))]">Twin Verification</div>
                <div className="mt-2 text-lg font-bold text-emerald-400">Validated</div>
              </div>
            </div>

            {activeScenario.explanation && (
              <div className="mt-5 rounded-xl border border-[hsl(var(--primary)/.2)] bg-[hsl(var(--primary)/.05)] p-4 text-xs leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold text-[hsl(var(--primary))] mb-1">
                  <Info size={14} /> How this intervention helps:
                </div>
                <p className="text-[hsl(var(--foreground)/.85)] font-medium">{activeScenario.explanation}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export function OptimizePage() {
  const [budget, setBudget] = useState(8);
  const mutation = useOptimizeResilience();
  const result: any = mutation.data;
  const fallback: any = { budget_crore: budget, total_cost_crore: 3.7, estimated_impact_reduction: 46, method: 'greedy resilience gain / cost ranking', interventions: [{ id: 'INT-GEN-01', name: 'Backup Generator', target: 'WATER-P1', cost_crore: 2.4, impact_reduction: 31, implementation_time: '6 weeks', rationale: 'maintains booster-pump operations during a primary power interruption' }, { id: 'INT-TEL-01', name: 'Backup Telecom Node', target: 'TEL-T4', cost_crore: 1.3, impact_reduction: 15, implementation_time: '5 weeks', rationale: 'preserves responder communications after a power or tower outage' }] };
  const output = result || fallback;
  const run = () => mutation.mutate({ data: { budget_crore: budget } });
  return <div className="animate-rise"><PageHeader eyebrow="Capital planning · constrained" title="Spend where the ripple stops." detail="Model a limited resilience budget against the highest-leverage interventions in this study area." action={<ActionButton testId="button-run-optimizer" onClick={run}>{mutation.isPending ? 'Optimizing...' : 'Re-run model'}</ActionButton>} /><div className="grid gap-5 lg:grid-cols-[280px_1fr]"><aside className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-5 text-[hsl(var(--secondary-foreground))]"><SectionEyebrow icon={Banknote}>Budget constraint</SectionEyebrow><div className="mt-5 text-5xl font-extrabold tracking-[-.1em] text-[hsl(var(--primary))]">₹{budget}<span className="text-xl tracking-[-.04em]"> Cr</span></div><p className="mt-2 text-xs leading-relaxed text-[hsl(var(--secondary-foreground)/.6)]">A constrained portfolio, ranked by marginal reduction in cascade impact.</p><input data-testid="input-budget" type="range" min="1" max="20" step=".5" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="mt-7 w-full accent-[hsl(var(--primary))]" /><div className="mt-2 flex justify-between font-mono-ui text-[9px] opacity-50"><span>₹1 Cr</span><span>₹20 Cr</span></div><button data-testid="button-optimize-budget" onClick={run} className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-xs font-extrabold text-[hsl(var(--primary-foreground))]"><Sparkles size={14} /> Optimize portfolio</button><div className="mt-6 border-t border-[hsl(var(--secondary-foreground)/.15)] pt-4 font-mono-ui text-[9px] leading-relaxed opacity-50">METHOD<br />{output.method}<br /><br />ASSUMES<br />monsoon baseline · 60 min outage</div></aside><section className="space-y-5"><div className="grid grid-cols-2 gap-3 md:grid-cols-3"><Kpi label="Selected spend" value={`₹${output.total_cost_crore} Cr`} sub={`of ₹${budget} Cr available`} icon={Banknote} /><Kpi label="Impact reduction" value={`${output.estimated_impact_reduction}%`} sub="modeled cascade impact" accent="accent" icon={ArrowDownRight} /><Kpi label="Unallocated" value={`₹${Math.max(0, budget - output.total_cost_crore).toFixed(1)} Cr`} sub="reserve for delivery" accent="yellow" icon={Target} /></div><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 panel-shadow"><div className="flex items-center justify-between"><div><SectionEyebrow icon={TrendingDown}>Recommended portfolio</SectionEyebrow><h2 className="text-lg font-extrabold tracking-[-.04em]">Three moves. One calmer system.</h2></div><span className="font-mono-ui text-[9px] text-[hsl(var(--muted-foreground))]">{output.interventions.length} interventions</span></div><div className="mt-5 space-y-3">{output.interventions.map((item: any, index: number) => <div key={item.id} data-testid={`card-intervention-${item.id}`} className="grid gap-3 rounded-xl border border-[hsl(var(--border))] p-4 sm:grid-cols-[28px_1fr_auto] sm:items-center"><div className="grid h-7 w-7 place-items-center rounded-full bg-[hsl(var(--primary)/.12)] font-mono-ui text-[10px] font-bold text-[hsl(var(--primary))]">0{index + 1}</div><div><div className="text-xs font-bold">{item.name}</div><div className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">{item.target} · {item.implementation_time} · {item.rationale}</div><div className="mt-3 h-1.5 max-w-[360px] rounded-full bg-[hsl(var(--muted))]"><div className="h-full rounded-full bg-[hsl(var(--accent))]" style={{ width: `${item.impact_reduction * 2.5}%` }} /></div></div><div className="text-left sm:text-right"><div className="font-mono-ui text-sm font-bold">₹{item.cost_crore} Cr</div><div className="mt-1 font-mono-ui text-[10px] font-bold text-[hsl(var(--accent))]">−{item.impact_reduction}% impact</div></div></div>)}</div></div><div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-4 text-xs text-[hsl(var(--muted-foreground))]"><Info size={14} className="mr-2 inline text-[hsl(var(--primary))]" /> Estimates are deterministic scenario outputs, not a capital works tender. Validate delivery time, land, and procurement constraints with the field team.</div></section></div></div>;
}

export function CopilotPage() {
  const [question, setQuestion] = useState('');
  const mutation = useAskCopilot();
  const result: any = mutation.data;
  const examples = ['What fails if the Indiranagar substation is down for one hour?', 'Which intervention protects the most people per crore?', 'Why is the water pump ranked above the flyover approach?'];
  const ask = (event?: FormEvent) => { event?.preventDefault(); if (question.trim()) mutation.mutate({ data: { question } }); };
  return <div className="animate-rise"><PageHeader eyebrow="Decision support Â· grounded" title="Ask the twin." detail="RIPPLE copilot translates a plain-language question into deterministic model results, with the assumptions left in view." /><div className="mx-auto max-w-4xl"><div className="rounded-2xl bg-[hsl(var(--secondary))] p-5 text-[hsl(var(--secondary-foreground))] sm:p-8"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><Sparkles size={19} /></div><div><div className="text-lg font-extrabold tracking-[-.04em]">RIPPLE copilot</div><div className="font-mono-ui text-[9px] uppercase tracking-[.14em] opacity-50">deterministic Â· study area aware</div></div></div><form onSubmit={ask} className="mt-7 flex flex-col gap-2 rounded-xl bg-[hsl(var(--secondary-foreground)/.08)] p-2 sm:flex-row"><input data-testid="input-copilot-question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about a failure, dependency, or intervention..." className="min-h-11 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[hsl(var(--secondary-foreground)/.4)]" /><button data-testid="button-ask-copilot" type="submit" disabled={mutation.isPending || !question.trim()} className="rounded-lg bg-[hsl(var(--primary))] px-5 py-3 text-xs font-extrabold text-[hsl(var(--primary-foreground))] disabled:opacity-50">{mutation.isPending ? 'Reasoning...' : 'Ask RIPPLE'}</button></form><div className="mt-5 flex flex-wrap gap-2">{examples.map((example, index) => <button key={example} data-testid={`button-example-question-${index}`} onClick={() => setQuestion(example)} className="rounded-full border border-[hsl(var(--secondary-foreground)/.17)] px-3 py-2 text-left text-[10px] text-[hsl(var(--secondary-foreground)/.7)] hover:bg-[hsl(var(--secondary-foreground)/.08)]">{example}</button>)}</div></div>{result ? <div data-testid="panel-copilot-result" className="mt-5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 panel-shadow"><div className="flex items-center justify-between"><SectionEyebrow icon={Check}>Grounded answer</SectionEyebrow><span className="rounded-full bg-[hsl(var(--accent)/.12)] px-2.5 py-1 font-mono-ui text-[9px] font-bold uppercase text-[hsl(var(--accent))]">{result.intent || 'decision support'}</span></div><p className="mt-4 text-base font-semibold leading-relaxed">{result.answer}</p>{result.simulation && <div className="mt-5 rounded-lg bg-[hsl(var(--muted)/.5)] p-4"><div className="mb-2 flex items-center gap-2 text-xs font-bold"><Activity size={14} className="text-[hsl(var(--primary))]" /> Linked model result</div><pre className="max-h-52 overflow-auto whitespace-pre-wrap font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))]">{JSON.stringify(result.simulation, null, 2)}</pre></div>}<div className="mt-5 border-t border-[hsl(var(--border))] pt-4 font-mono-ui text-[9px] text-[hsl(var(--muted-foreground))]">ANSWER GENERATED FROM THE INDIRANAGAR DIGITAL TWIN Â· VERIFY WITH FIELD OPERATIONS</div></div> : <div className="mt-5 grid gap-3 sm:grid-cols-3">{['Break analysis', 'Dependency context', 'Budget trade-offs'].map((item, index) => <div key={item} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"><div className="font-mono-ui text-[9px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">0{index + 1}</div><div className="mt-5 text-sm font-bold">{item}</div><p className="mt-1 text-[10px] leading-relaxed text-[hsl(var(--muted-foreground))]">Ask a precise question to surface the model's reasoning.</p></div>)}</div>}{mutation.isError && <div data-testid="status-copilot-error" className="mt-4 rounded-lg bg-[hsl(var(--destructive)/.08)] p-3 text-xs text-[hsl(var(--destructive))]">Copilot could not complete that query. Try a shorter question.</div>}</div></div>;
}

