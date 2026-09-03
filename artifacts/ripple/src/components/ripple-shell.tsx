import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Activity, ArrowRight, ChevronDown, CircleHelp, Command, Crosshair, Gauge, Layers3, Map, Menu, MessageSquareText, Moon, Network, Radar, Settings2, ShieldCheck, Siren, SlidersHorizontal, Sparkles, Sun, X } from 'lucide-react';
import { useHealthCheck, getHealthCheckQueryKey } from '@workspace/api-client-react';

const nav = [
  { href: '/', label: 'Command centre', icon: Radar, key: '01' },
  { href: '/simulate', label: 'Simulate cascade', icon: Activity, key: '02' },
  { href: '/criticality', label: 'Criticality rank', icon: Gauge, key: '03' },
  { href: '/what-if', label: 'What-if studio', icon: Layers3, key: '04' },
  { href: '/optimize', label: 'Budget optimizer', icon: SlidersHorizontal, key: '05' },
  { href: '/copilot', label: 'RIPPLE copilot', icon: MessageSquareText, key: '06' },
];

export function StatusPill() {
  const { data, isLoading, isError } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey() } });
  const live = !isError && (isLoading || data?.status === 'ok' || data?.status === 'healthy');
  return (
    <div data-testid="status-system" className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.13em] text-[hsl(var(--muted-foreground))]">
      <span className={`h-2 w-2 rounded-full ${live ? 'animate-pulse-signal bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--destructive))]'}`} />
      {isLoading ? 'Syncing' : live ? 'Twin online' : 'API degraded'}
    </div>
  );
}

export function RippleShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('ripple-theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('ripple-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[250px] flex-col bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[76px] items-center justify-between border-b border-[hsl(var(--sidebar-border))] px-5">
          <Link href="/" data-testid="link-brand" className="flex items-center gap-3">
            <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]">
              <span className="absolute h-16 w-16 rounded-full border border-current opacity-30" />
              <span className="absolute h-10 w-10 rounded-full border border-current opacity-50" />
              <span className="relative font-mono-ui text-xs font-bold">R</span>
            </span>
            <span><span className="block text-[17px] font-extrabold tracking-[-.06em]">RIPPLE</span><span className="block font-mono-ui text-[8px] uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.54)]">urban systems lab</span></span>
          </Link>
          <button data-testid="button-close-menu" onClick={() => setMobileOpen(false)} className="md:hidden"><X size={18} /></button>
        </div>
        <div className="border-b border-[hsl(var(--sidebar-border))] px-5 py-5">
          <div className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.18em] text-[hsl(var(--sidebar-foreground)/.48)]"><Crosshair size={12} /> Active study area</div>
          <div className="flex items-end justify-between"><div><div className="font-semibold">Indiranagar</div><div className="mt-0.5 text-xs text-[hsl(var(--sidebar-foreground)/.55)]">Bengaluru · Karnataka</div></div><ChevronDown size={15} className="mb-1 text-[hsl(var(--sidebar-foreground)/.5)]" /></div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-5">
          <div className="px-3 pb-2 font-mono-ui text-[9px] uppercase tracking-[.2em] text-[hsl(var(--sidebar-foreground)/.36)]">Operations</div>
          {nav.map(({ href, label, icon: Icon, key }) => {
            const active = location === href;
            return <Link key={href} href={href} data-testid={`link-nav-${key}`} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-semibold transition-all ${active ? 'bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] shadow-[0_7px_18px_hsl(var(--sidebar-primary)/.2)]' : 'text-[hsl(var(--sidebar-foreground)/.65)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`}><Icon size={16} strokeWidth={active ? 2.4 : 1.7} /><span className="flex-1">{label}</span><span className={`font-mono-ui text-[9px] ${active ? 'opacity-60' : 'opacity-30'}`}>{key}</span></Link>;
          })}
        </nav>
        <div className="m-3 rounded-xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/.55)] p-3">
          <div className="mb-2 flex items-center justify-between"><span className="font-mono-ui text-[9px] uppercase tracking-[.14em] text-[hsl(var(--sidebar-foreground)/.5)]">Data health</span><ShieldCheck size={14} className="text-[hsl(var(--accent))]" /></div>
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-[hsl(var(--sidebar-foreground)/.1)]"><div className="h-full w-[92%] rounded-full bg-[hsl(var(--accent))]" /></div>
          <div className="flex justify-between font-mono-ui text-[9px] text-[hsl(var(--sidebar-foreground)/.5)]"><span>92% confidence</span><span>v0.8.4</span></div>
        </div>
      </aside>
      {mobileOpen && <button aria-label="Close navigation" data-testid="button-overlay-menu" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-20 bg-[hsl(var(--foreground)/.35)] md:hidden" />}
      <main className="min-h-[100dvh] md:pl-[250px]">
        <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.92)] px-4 backdrop-blur-md sm:px-7">
          <div className="flex items-center gap-3"><button data-testid="button-open-menu" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-[hsl(var(--muted))] md:hidden"><Menu size={19} /></button><div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))] sm:flex"><Map size={14} /> Digital twin <span className="text-[hsl(var(--border))]">/</span> <span className="text-[hsl(var(--foreground))]">Indiranagar</span></div></div>
          <div className="flex items-center gap-2"><button type="button" data-testid="button-theme-toggle" onClick={() => setDarkMode((enabled) => !enabled)} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} className="grid h-8 w-8 place-items-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]">{darkMode ? <Sun size={15} /> : <Moon size={15} />}</button><StatusPill /></div>
        </header>
        <div className="p-4 sm:p-7">{children}</div>
      </main>
    </div>
  );
}

export function SectionEyebrow({ children, icon: Icon = Activity }: { children: React.ReactNode; icon?: typeof Activity }) {
  return <div className="mb-2 flex items-center gap-2 font-mono-ui text-[10px] font-medium uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]"><Icon size={13} className="text-[hsl(var(--primary))]" /> {children}</div>;
}

export function PageHeader({ eyebrow, title, detail, action }: { eyebrow: string; title: string; detail: string; action?: React.ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div><SectionEyebrow>{eyebrow}</SectionEyebrow><h1 className="text-3xl font-extrabold tracking-[-.06em] sm:text-[40px]">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{detail}</p></div>{action}</div>;
}

export function LoadingState({ label = 'Loading twin data' }: { label?: string }) {
  return <div className="animate-pulse space-y-4" data-testid="status-loading"><div className="h-5 w-40 rounded bg-[hsl(var(--muted))]" /><div className="h-48 rounded-2xl bg-[hsl(var(--muted))]" /><div className="h-16 rounded-xl bg-[hsl(var(--muted))]" /><span className="font-mono-ui text-[10px] uppercase tracking-[.15em] text-[hsl(var(--muted-foreground))]">{label}...</span></div>;
}

export function ErrorState({ onRetry, message = 'The twin did not return a usable signal.' }: { onRetry?: () => void; message?: string }) {
  return <div data-testid="status-error" className="rounded-2xl border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.06)] p-8 text-center"><Siren className="mx-auto mb-3 text-[hsl(var(--destructive))]" size={25} /><p className="font-semibold">{message}</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Check the API connection and retry the operation.</p>{onRetry && <button data-testid="button-retry" onClick={onRetry} className="mt-5 rounded-lg bg-[hsl(var(--destructive))] px-4 py-2 text-xs font-bold text-white">Retry connection</button>}</div>;
}

export function EmptyState({ title, detail, action }: { title: string; detail: string; action?: React.ReactNode }) {
  return <div data-testid="status-empty" className="rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card)/.5)] p-12 text-center"><Network className="mx-auto mb-3 text-[hsl(var(--muted-foreground))]" size={24} /><p className="font-semibold">{title}</p><p className="mx-auto mt-1 max-w-sm text-sm text-[hsl(var(--muted-foreground))]">{detail}</p>{action}</div>;
}

export function ActionButton({ children, onClick, variant = 'primary', testId = 'button-action', type = 'button' }: { children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'outline' | 'dark'; testId?: string; type?: 'button' | 'submit' }) {
  const styles = variant === 'primary' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:brightness-95' : variant === 'dark' ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:brightness-110' : 'border border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]';
  return <button type={type} data-testid={testId} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all active:scale-[.98] ${styles}`}>{children}<ArrowRight size={14} /></button>;
}