import { useState } from 'react'
import { useStore } from './store.js'
import Onboarding from './screens/Onboarding.jsx'
import Today from './screens/Today.jsx'
import Stack from './screens/Stack.jsx'
import Progress from './screens/Progress.jsx'
import Knowledge from './screens/Knowledge.jsx'

const TABS = [
  { id: 'today', label: 'Сегодня', ico: '🏠' },
  { id: 'stack', label: 'Стек', ico: '💊' },
  { id: 'progress', label: 'Прогресс', ico: '📊' },
  { id: 'knowledge', label: 'База', ico: '📚' },
]

export default function App() {
  const store = useStore()
  const [tab, setTab] = useState('today')

  if (!store.state.profile) {
    return <Onboarding store={store} />
  }

  return (
    <div className="app">
      {tab === 'today' && <Today store={store} goStack={() => setTab('stack')} />}
      {tab === 'stack' && <Stack store={store} />}
      {tab === 'progress' && <Progress store={store} />}
      {tab === 'knowledge' && <Knowledge />}

      <nav className="nav">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            <span className="ico">{t.ico}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
