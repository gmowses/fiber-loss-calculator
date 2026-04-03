import { useState, useEffect } from 'react'
import { Sun, Moon, Languages, Zap } from 'lucide-react'

const translations = {
  en: {
    title: 'Fiber Loss Budget Calculator',
    subtitle: 'Calculate total optical loss for a fiber link. Compare against receiver sensitivity. Everything client-side.',
    linkParams: 'Link Parameters',
    distance: 'Distance (km)',
    fiberType: 'Fiber type',
    splices: 'Splices',
    connectors: 'Connectors (pairs)',
    splitters: 'Splitters',
    splitterRatio: 'Ratio',
    txPower: 'TX Power (dBm)',
    rxSensitivity: 'RX Sensitivity (dBm)',
    results: 'Results',
    fiberLoss: 'Fiber attenuation',
    spliceLoss: 'Splice loss',
    connectorLoss: 'Connector loss',
    splitterLoss: 'Splitter loss',
    totalLoss: 'Total loss',
    rxLevel: 'Expected RX Power',
    margin: 'Power margin',
    marginOk: 'Link is within budget',
    marginWarn: 'Margin is thin (< 3 dB)',
    marginFail: 'Link exceeds loss budget',
    builtBy: 'Built by',
    smNote: 'SM G.652D: 0.35 dB/km @ 1310nm, 0.20 dB/km @ 1550nm',
    mmNote: 'MM OM4: 3.5 dB/km @ 850nm, 1.5 dB/km @ 1300nm',
    addSplitter: 'Add splitter',
    removeSplitter: 'Remove',
  },
  pt: {
    title: 'Calculadora de Perda em Fibra',
    subtitle: 'Calcule a perda optica total de um enlace de fibra e compare com a sensibilidade do receptor.',
    linkParams: 'Parametros do Enlace',
    distance: 'Distancia (km)',
    fiberType: 'Tipo de fibra',
    splices: 'Emendas',
    connectors: 'Conectores (pares)',
    splitters: 'Splitters',
    splitterRatio: 'Razao',
    txPower: 'Potencia TX (dBm)',
    rxSensitivity: 'Sensibilidade RX (dBm)',
    results: 'Resultados',
    fiberLoss: 'Atenuacao da fibra',
    spliceLoss: 'Perda em emendas',
    connectorLoss: 'Perda em conectores',
    splitterLoss: 'Perda em splitters',
    totalLoss: 'Perda total',
    rxLevel: 'Potencia RX esperada',
    margin: 'Margem de potencia',
    marginOk: 'Enlace dentro do orcamento',
    marginWarn: 'Margem pequena (< 3 dB)',
    marginFail: 'Enlace excede o orcamento de perda',
    builtBy: 'Criado por',
    smNote: 'SM G.652D: 0.35 dB/km @ 1310nm, 0.20 dB/km @ 1550nm',
    mmNote: 'MM OM4: 3.5 dB/km @ 850nm, 1.5 dB/km @ 1300nm',
    addSplitter: 'Adicionar splitter',
    removeSplitter: 'Remover',
  },
} as const

type Lang = keyof typeof translations

const FIBER_TYPES = [
  { label: 'SM G.652D @ 1310nm', attenDbKm: 0.35 },
  { label: 'SM G.652D @ 1550nm', attenDbKm: 0.20 },
  { label: 'SM G.655 @ 1550nm', attenDbKm: 0.22 },
  { label: 'SM G.657A @ 1310nm', attenDbKm: 0.40 },
  { label: 'MM OM1 @ 850nm', attenDbKm: 3.5 },
  { label: 'MM OM3 @ 850nm', attenDbKm: 2.5 },
  { label: 'MM OM4 @ 850nm', attenDbKm: 3.5 },
  { label: 'MM OM5 @ 850nm', attenDbKm: 3.0 },
  { label: 'Plastic (POF) @ 650nm', attenDbKm: 200 },
]

const SPLITTER_RATIOS = [
  { label: '1:2', lossDb: 3.5 },
  { label: '1:4', lossDb: 7.0 },
  { label: '1:8', lossDb: 10.5 },
  { label: '1:16', lossDb: 13.5 },
  { label: '1:32', lossDb: 17.5 },
  { label: '1:64', lossDb: 20.5 },
  { label: '1:128', lossDb: 23.5 },
]

interface SplitterEntry { id: string; ratioIdx: number }
function uid() { return Math.random().toString(36).slice(2) }

export default function FiberLossCalculator() {
  const [lang, setLang] = useState<Lang>(() => (navigator.language.startsWith('pt') ? 'pt' : 'en'))
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [distKm, setDistKm] = useState(5)
  const [fiberTypeIdx, setFiberTypeIdx] = useState(0)
  const [splices, setSplices] = useState(3)
  const [connectors, setConnectors] = useState(2)
  const [splitterList, setSplitterList] = useState<SplitterEntry[]>([])
  const [txPower, setTxPower] = useState(3)
  const [rxSens, setRxSens] = useState(-28)

  const t = translations[lang]
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const fiberLoss = distKm * FIBER_TYPES[fiberTypeIdx].attenDbKm
  const spliceLoss = splices * 0.1
  const connLoss = connectors * 0.5
  const splitterLoss = splitterList.reduce((sum, s) => sum + SPLITTER_RATIOS[s.ratioIdx].lossDb, 0)
  const totalLoss = fiberLoss + spliceLoss + connLoss + splitterLoss
  const rxLevel = txPower - totalLoss
  const headroomFinal = rxLevel - rxSens
  const hMsg = headroomFinal >= 3 ? t.marginOk : headroomFinal >= 0 ? t.marginWarn : t.marginFail
  const hBorderColor = headroomFinal >= 3 ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : headroomFinal >= 0 ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="font-semibold">Fiber Loss Calculator</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/fiber-loss-calculator" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Inputs */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5">
              <h2 className="font-semibold">{t.linkParams}</h2>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t.fiberType}</label>
                <select value={fiberTypeIdx} onChange={e => setFiberTypeIdx(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  {FIBER_TYPES.map((f, i) => <option key={i} value={i}>{f.label} ({f.attenDbKm} dB/km)</option>)}
                </select>
              </div>

              {[
                { label: t.distance, value: distKm, set: setDistKm, min: 0.001, max: 100, step: 0.1, suffix: 'km' },
                { label: t.splices, value: splices, set: setSplices, min: 0, max: 200, step: 1, suffix: '× 0.1 dB' },
                { label: t.connectors, value: connectors, set: setConnectors, min: 0, max: 50, step: 1, suffix: '× 0.5 dB' },
                { label: t.txPower, value: txPower, set: setTxPower, min: -10, max: 20, step: 1, suffix: 'dBm' },
                { label: t.rxSensitivity, value: rxSens, set: setRxSens, min: -50, max: -5, step: 1, suffix: 'dBm' },
              ].map(({ label, value, set, min, max, step, suffix }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">{label}</label>
                    <span className="text-sm font-bold text-red-500 tabular-nums">{value} {suffix}</span>
                  </div>
                  <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(Number(e.target.value))} className="w-full h-1.5 cursor-pointer accent-red-500" />
                  <div className="flex justify-between text-[10px] text-zinc-400 px-0.5"><span>{min}</span><span>{max}</span></div>
                </div>
              ))}

              {/* Splitters */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.splitters}</label>
                {splitterList.map(s => (
                  <div key={s.id} className="flex gap-2 items-center">
                    <select value={s.ratioIdx} onChange={e => setSplitterList(sl => sl.map(x => x.id === s.id ? { ...x, ratioIdx: Number(e.target.value) } : x))}
                      className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                      {SPLITTER_RATIOS.map((r, i) => <option key={i} value={i}>{r.label} ({r.lossDb} dB)</option>)}
                    </select>
                    <button onClick={() => setSplitterList(sl => sl.filter(x => x.id !== s.id))} className="text-xs text-zinc-400 hover:text-red-500 transition-colors px-2 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg">{t.removeSplitter}</button>
                  </div>
                ))}
                <button onClick={() => setSplitterList(sl => [...sl, { id: uid(), ratioIdx: 0 }])}
                  className="w-full py-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-xs text-zinc-500 hover:border-red-500 hover:text-red-500 transition-colors">
                  + {t.addSplitter}
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5">
              <h2 className="font-semibold">{t.results}</h2>

              <div className="space-y-2 text-sm">
                {[
                  { label: t.fiberLoss, value: fiberLoss, suffix: 'dB' },
                  { label: t.spliceLoss, value: spliceLoss, suffix: 'dB' },
                  { label: t.connectorLoss, value: connLoss, suffix: 'dB' },
                  ...(splitterLoss > 0 ? [{ label: t.splitterLoss, value: splitterLoss, suffix: 'dB' }] : []),
                ].map(({ label, value, suffix }) => (
                  <div key={label} className="flex justify-between px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/30">
                    <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
                    <span className="font-mono font-semibold tabular-nums">{value.toFixed(2)} {suffix}</span>
                  </div>
                ))}
                <div className="flex justify-between px-3 py-2.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 font-semibold">
                  <span>{t.totalLoss}</span>
                  <span className="font-mono text-red-600 dark:text-red-400">{totalLoss.toFixed(2)} dB</span>
                </div>
              </div>

              <div className="rounded-xl border-2 border-red-500/30 bg-red-50 dark:bg-red-900/10 p-5 text-center">
                <p className="text-xs uppercase tracking-wide text-zinc-400 mb-1">{t.rxLevel}</p>
                <p className="text-5xl font-bold tabular-nums text-zinc-700 dark:text-zinc-200">{rxLevel.toFixed(1)}</p>
                <p className="text-xs text-zinc-400 mt-1">dBm</p>
              </div>

              <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 p-5 text-center">
                <p className="text-xs uppercase tracking-wide text-zinc-400 mb-1">{t.margin}</p>
                <p className={`text-4xl font-bold tabular-nums ${headroomFinal >= 3 ? 'text-green-500' : headroomFinal >= 0 ? 'text-amber-500' : 'text-red-500'}`}>{headroomFinal.toFixed(1)}</p>
                <p className="text-xs text-zinc-400 mt-1">dB</p>
              </div>

              <div className={`rounded-lg border px-4 py-3 text-sm font-medium ${hBorderColor}`}>{hMsg}</div>

              <div className="text-[10px] text-zinc-400 space-y-0.5">
                <p>{t.smNote}</p>
                <p>{t.mmNote}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-red-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
