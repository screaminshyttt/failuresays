'use client'

// Editorial business-data visual for FailureSays articles.
// Pure black / white / gray with restrained lime accents. Data-driven.

function LineChart({ points = [], title }) {
  const nums = (points || []).map(Number).filter(n => !isNaN(n))
  if (nums.length < 2) return null
  const w = 320, h = 120, pad = 6
  const max = Math.max(...nums), min = Math.min(...nums)
  const range = max - min || 1
  const step = (w - pad * 2) / (nums.length - 1)
  const coords = nums.map((n, i) => [pad + i * step, h - pad - ((n - min) / range) * (h - pad * 2)])
  const d = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`).join(' ')
  const area = `${d} L ${coords[coords.length - 1][0].toFixed(1)} ${h - pad} L ${pad} ${h - pad} Z`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
      <path d={area} fill="#A3E635" opacity="0.14" />
      <path d={d} fill="none" stroke="#0B0B0B" strokeWidth="2" />
      {coords.map((c, i) => <circle key={i} cx={c[0]} cy={c[1]} r="2.4" fill={i === coords.length - 1 ? '#A3E635' : '#0B0B0B'} />)}
    </svg>
  )
}

function BarChart({ bars = [] }) {
  const items = (bars || []).filter(b => b && b.value !== '' && b.value != null)
  if (!items.length) return null
  const max = Math.max(...items.map(b => Number(b.value) || 0)) || 1
  return (
    <div className="flex items-end gap-3 h-[120px]">
      {items.map((b, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
          <div className="w-full bg-black relative" style={{ height: `${Math.max(6, (Number(b.value) / max) * 100)}%` }}>
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-muted">{b.value}</span>
            {i === items.length - 1 && <span className="absolute inset-x-0 top-0 h-1 bg-lime" />}
          </div>
          <span className="mt-2 text-[10px] uppercase tracking-[0.12em] text-subtle text-center truncate w-full">{b.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function MetricsHero({ data = {} }) {
  const {
    metric, metricLabel, changePct, chartTitle, line = [], bars = [], kpis = [],
    runwayLabel, runwayValue, runwayPct, notes = [], bgImage,
  } = data
  const up = String(changePct || '').trim().startsWith('-') ? false : true
  return (
    <section
      className="my-12 border border-rule bg-white"
      style={bgImage ? { backgroundImage: `linear-gradient(rgba(255,255,255,0.92),rgba(255,255,255,0.92)), url(${bgImage})`, backgroundSize: 'cover' } : {}}
    >
      <div className="grid md:grid-cols-3 border-b border-rule">
        {/* main metric */}
        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-rule">
          <div className="eyebrow">{metricLabel || 'Total Revenue'}</div>
          <div className="display text-5xl md:text-6xl mt-3 leading-none">{metric || '—'}</div>
          {changePct && (
            <div className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium ${up ? 'text-black' : 'text-destructive'}`}>
              <span className={`inline-block w-2 h-2 ${up ? 'bg-lime' : 'bg-destructive'}`} />
              {up ? '▲' : '▼'} {String(changePct).replace('-', '')}
            </div>
          )}
        </div>
        {/* line chart */}
        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-rule md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="eyebrow">{chartTitle || 'Trend'}</div>
            <span className="w-6 h-[2px] bg-lime" />
          </div>
          <div className="mt-4"><LineChart points={line} /></div>
        </div>
      </div>

      {/* KPI cards */}
      {kpis?.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-rule">
          {kpis.slice(0, 4).map((k, i) => (
            <div key={i} className={`p-5 ${i % 2 === 0 ? 'border-r' : ''} md:border-r border-rule last:border-r-0`}>
              <div className="text-[10px] uppercase tracking-[0.16em] text-subtle">{k.label}</div>
              <div className="text-2xl font-semibold mt-1">{k.value}</div>
              {k.sub && <div className="text-[11px] text-muted mt-1">{k.sub}</div>}
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-3">
        {/* bars */}
        {bars?.length > 0 && (
          <div className="p-6 md:p-8 md:col-span-2 md:border-r border-rule">
            <div className="eyebrow mb-4">Breakdown</div>
            <BarChart bars={bars} />
          </div>
        )}
        {/* runway + notes */}
        <div className="p-6 md:p-8">
          {(runwayLabel || runwayValue) && (
            <div>
              <div className="eyebrow">{runwayLabel || 'Runway'}</div>
              <div className="text-2xl font-semibold mt-1">{runwayValue}</div>
              {runwayPct != null && runwayPct !== '' && (
                <div className="mt-3 h-2 w-full bg-cream border border-rule">
                  <div className="h-full bg-lime" style={{ width: `${Math.min(100, Math.max(0, Number(runwayPct)))}%` }} />
                </div>
              )}
            </div>
          )}
          {notes?.filter(Boolean).length > 0 && (
            <ul className="mt-5 space-y-2">
              {notes.filter(Boolean).map((n, i) => (
                <li key={i} className="text-sm text-muted flex gap-2" style={{ fontFamily: 'var(--font-inter)' }}>
                  <span className="text-lime">✳</span><span className="italic">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
