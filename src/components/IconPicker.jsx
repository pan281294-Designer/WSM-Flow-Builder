import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import * as UntitledIcons from '@untitledui/icons';
import { Icon } from '@iconify/react';

// Curated Untitled UI icons relevant to workflow / architecture diagrams
const UNTITLED_SET = [
  'Server01','Server02','Server03','Server04','Server05','Server06',
  'Globe01','Globe02','Globe03','Globe04','Globe05','Globe06',
  'Database01','Database02','Database03',
  'CpuChip01','CpuChip02',
  'Lightning01','Lightning02',
  'Lock01','Lock02','Lock03','Lock04',
  'Shield01','Shield02','Shield03',
  'Users01','Users02','Users03',
  'Bell01','Bell02','Bell03','Bell04',
  'BarChart01','BarChart02','BarChart03','BarChart04','BarChart05','BarChart06','BarChart07','BarChart08','BarChart09','BarChart010','BarChart011','BarChart012',
  'Activity','ActivityHeart',
  'Code01','Code02',
  'GitBranch01','GitBranch02',
  'SearchLg','SearchMd','SearchSm','SearchRefraction',
  'BookOpen01','BookOpen02','BookOpen03',
  'LayersTwo01','LayersTwo02','LayersThree01','LayersThree02',
  'Cube01','Cube02','Cube03','Cube04',
  'Link01','Link02','Link03','Link04','Link05',
  'Stars01','Stars02','Stars03',
  'Beaker01','Beaker02',
  'FileCheck01','FileCheck02','FileCheck03',
  'Announcement01','Announcement02','Announcement03',
  'Settings01','Settings02','Settings03','Settings04',
  'Cloud01','Cloud02','Cloud03',
  'Wifi','WifiOff',
  'Cpu01',
  'MessageSquare01','MessageSquare02',
  'Webhook',
  'Package',
  'Layers01',
  'Phone01','Phone02',
  'Mail01','Mail02','Mail03','Mail04','Mail05',
  'Send01','Send02','Send03',
  'AlertCircle','AlertHexagon','AlertOctagon','AlertTriangle',
  'CheckCircle','CheckCircleBroken',
  'Eye','EyeOff',
  'Filter','FilterLines','FilterFunnel01','FilterFunnel02',
  'Zap','ZapCircle','ZapFast','ZapSquare',
  'Refresh01','Refresh02','Refresh03','RefreshCcw01','RefreshCw01','RefreshCw02','RefreshCw03','RefreshCw04','RefreshCw05',
  'Share01','Share02','Share03','Share04','Share05','Share06','Share07',
  'ArrowRightLeft',
  'GitMerge','GitCommit','GitPullRequest',
  'Terminal','TerminalBrowser','TerminalCircle','TerminalSquare',
  'Workflow',
  'Dataflow01','Dataflow02','Dataflow03','Dataflow04',
  'PieChart01','PieChart02','PieChart03','PieChart04',
  'LineChartDown01','LineChartDown02','LineChartDown03','LineChartDown04','LineChartDown05',
  'LineChartUp01','LineChartUp02','LineChartUp03','LineChartUp04','LineChartUp05',
].filter(name => !!UntitledIcons[name]); // only include icons that actually exist

// ── Curated Lucide icons (best for workflow diagrams) ──────────
const LUCIDE_SET = [
  'Globe','Smartphone','Server','Key','Database','Zap','HardDrive','Box',
  'Layers','Table','FileSpreadsheet','Brain','Bot','Sparkles','Network',
  'BookOpen','Search','Code','Split','Users','Webhook','Shield','Mail',
  'Bell','BarChart','Activity','Cloud','Lock','GitBranch','Terminal',
  'Workflow','MessageSquare','Plug','RefreshCw','FolderOpen','Package',
  'AlertTriangle','CheckCircle','Eye','Filter','Cpu','Container',
  'Globe2','Wifi','Radio','Link','Settings','Cog','Monitor','Laptop',
  'Tablet','FlaskConical','Microscope','Atom','Dna','Binary',
  'Braces','Hash','Share2','ArrowRightLeft','Repeat2','RotateCcw',
];

const ICONIFY_PREFIXES = [
  { label: 'Material Design', prefix: 'mdi' },
  { label: 'Heroicons', prefix: 'heroicons' },
  { label: 'Tabler', prefix: 'tabler' },
  { label: 'Logos', prefix: 'logos' },
];

export default function IconPicker({ currentIcon, onSelect, color = '#06b6d4' }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('untitled');   // 'untitled' | 'lucide' | 'iconify'
  const [query, setQuery] = useState('');
  const [iconifyResults, setIconifyResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Lucide filter
  const lucideFiltered = query.trim()
    ? LUCIDE_SET.filter(n => n.toLowerCase().includes(query.toLowerCase()))
    : LUCIDE_SET;

  // Iconify debounce search
  useEffect(() => {
    if (tab !== 'iconify') return;
    if (!query.trim()) { setIconifyResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=40`);
        const d = await res.json();
        setIconifyResults(d.icons || []);
      } catch { setIconifyResults([]); }
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
  }, [query, tab]);

  const handleSelect = (icon) => { onSelect(icon); setOpen(false); };

  return (
    <div className="relative" ref={ref}>
      <label className="text-[12px] font-semibold text-slate-500 dark:text-[#94a3b8] block mb-2">Icon</label>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-3 py-2.5 bg-slate-50 dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg text-sm hover:border-cyan-400 transition-colors"
      >
        {currentIcon ? (
          currentIcon.startsWith('untitled:')
            ? (() => { const U = UntitledIcons[currentIcon.slice(9)]; return U ? <U size={22} color={color} strokeWidth={1.5} /> : null; })()
            : currentIcon.includes(':')
              ? <Icon icon={currentIcon} width={22} color={color} />
              : (() => { const L = LucideIcons[currentIcon]; return L ? <L size={22} color={color} strokeWidth={1.5} /> : null; })()
        ) : (
          <div className="w-[22px] h-[22px] rounded-full bg-slate-200 dark:bg-[#30363d]" />
        )}
        <span className="text-slate-500 dark:text-[#64748b] text-[12px] truncate">
          {currentIcon || 'Pick icon…'}
        </span>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-xl shadow-2xl z-50 overflow-hidden" style={{ width: 280 }}>
          {/* Tab bar */}
          <div className="flex border-b border-slate-100 dark:border-[#30363d]">
            {[['untitled', 'Untitled UI'], ['lucide', 'Lucide'], ['iconify', 'Iconify']].map(([t, label]) => (
              <button
                key={t}
                onClick={() => { setTab(t); setQuery(''); }}
                className={`flex-1 py-2 text-[11px] font-semibold transition-colors ${tab === t ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500' : 'text-slate-500 dark:text-[#64748b]'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="p-2 border-b border-slate-100 dark:border-[#30363d] flex items-center gap-2">
            <Search size={13} className="text-slate-400 shrink-0" />
            <input
              autoFocus
              className="flex-1 bg-transparent text-[13px] text-slate-800 dark:text-white outline-none placeholder-slate-400"
              placeholder={tab === 'lucide' ? 'Filter Lucide…' : 'Search Iconify…'}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && <button onClick={() => setQuery('')}><X size={12} className="text-slate-400" /></button>}
          </div>

          {/* Icons grid */}
          <div className="grid grid-cols-6 gap-0.5 p-2 max-h-52 overflow-y-auto">
            {tab === 'untitled' ? (
              (() => {
                const filtered = query.trim()
                  ? UNTITLED_SET.filter(n => n.toLowerCase().includes(query.toLowerCase()))
                  : UNTITLED_SET;
                return filtered.length ? filtered.map(name => {
                  const U = UntitledIcons[name];
                  if (!U) return null;
                  const key = `untitled:${name}`;
                  return (
                    <button
                      key={name}
                      title={name}
                      onClick={() => handleSelect(key)}
                      className={`flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1c212b] transition-colors ${currentIcon === key ? 'bg-violet-100 dark:bg-violet-900/30' : ''}`}
                    >
                      <U size={18} color={color} strokeWidth={1.5} />
                    </button>
                  );
                }) : <div className="col-span-6 text-center py-4 text-[11px] text-slate-400">No results</div>;
              })()
            ) : tab === 'lucide' ? (
              lucideFiltered.length ? lucideFiltered.map(name => {
                const L = LucideIcons[name];
                if (!L) return null;
                return (
                  <button
                    key={name}
                    title={name}
                    onClick={() => handleSelect(name)}
                    className={`flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1c212b] transition-colors ${currentIcon === name ? 'bg-slate-100 dark:bg-[#1c212b]' : ''}`}
                  >
                    <L size={18} color={color} strokeWidth={1.5} />
                  </button>
                );
              }) : <div className="col-span-6 text-center py-4 text-[11px] text-slate-400">No results</div>
            ) : (
              loading
                ? <div className="col-span-6 text-center py-4 text-[11px] text-slate-400">Searching…</div>
                : !query.trim()
                  ? <div className="col-span-6 text-center py-4 text-[11px] text-slate-400">Type to search 100k+ icons</div>
                  : iconifyResults.length
                    ? iconifyResults.map(icon => (
                        <button key={icon} title={icon} onClick={() => handleSelect(icon)}
                          className={`flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1c212b] transition-colors ${currentIcon === icon ? 'bg-slate-100 dark:bg-[#1c212b]' : ''}`}
                        >
                          <Icon icon={icon} width={18} color={color} />
                        </button>
                      ))
                    : <div className="col-span-6 text-center py-4 text-[11px] text-slate-400">No results</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
