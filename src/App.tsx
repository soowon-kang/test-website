
import { useState } from 'react'
import { AcquisitionTab } from './calc/acquisition'
import { CapitalGainTab } from './calc/capital_gain'
import { PropertyTaxTab } from './calc/holding_local'
import { GltTab } from './calc/holding_glt'

type TabKey = 'acq' | 'cgt' | 'ptx' | 'glt'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'acq', label: '취득세' },
  { key: 'cgt', label: '양도소득세' },
  { key: 'ptx', label: '재산세' },
  { key: 'glt', label: '종합부동산세' },
]

export default function App() {
  const [tab, setTab] = useState<TabKey>('acq')
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-2">KR Real‑Estate Tax Calculator (2025)</h1>
      <p className="text-sm text-zinc-600 mb-6">GitHub Pages demo • YAML rules powered</p>

      <div role="tablist" aria-label="세금 종류" className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 rounded border ${tab === t.key ? 'bg-zinc-900 text-white' : 'bg-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'acq' && <AcquisitionTab />}
      {tab === 'cgt' && <CapitalGainTab />}
      {tab === 'ptx' && <PropertyTaxTab />}
      {tab === 'glt' && <GltTab />}
    </div>
  )
}
