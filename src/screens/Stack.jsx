import { useMemo, useState } from 'react'
import { INTERACTIONS, SLOT_LABEL, SLOT_TIME, SLOT_EMOJI } from '../data.js'
import { todayKey, dateOffset, dayAdherence } from '../store.js'
import AddSupplement from './AddSupplement.jsx'

function findInteractions(stack) {
  const active = stack.filter((s) => !s.paused)
  const result = []
  for (const rule of INTERACTIONS) {
    const [a, b] = rule.tags
    const hasA = active.filter((s) => (s.tags || []).includes(a))
    const hasB = active.filter((s) => (s.tags || []).includes(b))
    // пара должна состоять из разных добавок
    const pairExists = hasA.some((x) => hasB.some((y) => y.id !== x.id))
    if (pairExists) result.push(rule)
  }
  return result
}

function adherence30(state) {
  let sum = 0
  let n = 0
  for (let i = 1; i <= 30; i++) {
    const a = dayAdherence(state, todayKey(dateOffset(-i)))
    if (a !== null && state.log[todayKey(dateOffset(-i))]) {
      sum += a
      n++
    }
  }
  return n ? sum / n : null
}

export default function Stack({ store }) {
  const { state } = store
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const interactions = useMemo(() => findInteractions(state.stack), [state.stack])
  const adh = adherence30(state)
  const active = state.stack.filter((s) => !s.paused)

  const slots = ['morning', 'day', 'evening']
    .map((slot) => ({ slot, items: active.filter((s) => s.slot === slot) }))
    .filter((g) => g.items.length)

  return (
    <>
      <div className="topbar">
        <div className="avatar">💊</div>
        <div style={{ flex: 1 }}>
          <div className="hello">Ваш стек добавок</div>
          <div className="sub">Точное расписание под вашу биологию</div>
        </div>
      </div>

      <div className="screen fade-in">
        <div className="section-head">
          <h2>Активный стек</h2>
          <span className="pill green">{active.length} активно</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {state.stack.map((s) => (
            <div key={s.id} className="supp-row" style={s.paused ? { opacity: 0.5 } : null}>
              <div className="icon">{s.emoji || '💊'}</div>
              <div className="info">
                <div className="name">{s.name}</div>
                <div className="meta">
                  {s.dose} · {SLOT_LABEL[s.slot]} {SLOT_TIME[s.slot]}
                  {s.paused ? ' · на паузе' : ''}
                </div>
              </div>
              <button className="icon-btn" title={s.paused ? 'Возобновить' : 'Пауза'}
                onClick={() => store.updateSupp(s.id, { paused: !s.paused })}>
                {s.paused ? '▶️' : '⏸'}
              </button>
              <button className="icon-btn" title="Редактировать" onClick={() => { setEditing(s); setModal(true) }}>✏️</button>
              <button className="icon-btn" title="Удалить" onClick={() => {
                if (confirm(`Удалить «${s.name}» из стека?`)) store.removeSupp(s.id)
              }}>🗑</button>
            </div>
          ))}
          {state.stack.length === 0 && (
            <div className="empty">Стек пуст — добавьте первую добавку ниже.</div>
          )}
        </div>

        <button className="btn chip-add" onClick={() => { setEditing(null); setModal(true) }}>
          ＋ Добавить добавку
        </button>

        {interactions.length > 0 && (
          <>
            <div className="section-head">
              <h2>🧪 Движок взаимодействий</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {interactions.map((r) => (
                <div key={r.title} className={`interaction ${r.type}`}>
                  <b>{r.type === 'synergy' ? '🤝 ' : '⚠️ '}{r.title}</b>
                  {r.text}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="card dark">
          <div className="card-title"><h2 style={{ color: '#f4f1ea' }}>Адгеренс стека</h2></div>
          {adh === null ? (
            <p style={{ fontSize: 13.5, opacity: 0.85 }}>
              Пока нет данных — отмечайте приёмы на вкладке «Сегодня», и здесь появится статистика за 30 дней.
            </p>
          ) : (
            <>
              <div className="big-number">{Math.round(adh * 100)}%</div>
              <p style={{ fontSize: 13, opacity: 0.85 }}>среднее выполнение плана за 30 дней</p>
            </>
          )}
        </div>

        {slots.length > 0 && (
          <>
            <div className="section-head"><h2>⏱ Точное расписание</h2></div>
            <div className="card">
              <div className="timeline">
                {slots.map(({ slot, items }, i) => (
                  <div key={slot} className="tl-item">
                    <div className="tl-time">{SLOT_TIME[slot]}</div>
                    <div className="tl-rail">
                      <div className="tl-dot" />
                      {i < slots.length - 1 && <div className="tl-line" />}
                    </div>
                    <div className="tl-body">
                      <b>{SLOT_EMOJI[slot]} {SLOT_LABEL[slot]}</b>
                      <div className="muted" style={{ marginTop: 2 }}>
                        {items.map((s) => `${s.name} (${s.dose})`).join(' · ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="card sand">
          <div className="card-title"><h2>🔬 Заметка из лаборатории</h2></div>
          <p style={{ fontSize: 13.5 }}>
            Добавки работают лучше, когда опираются на анализы. Проверяйте ферритин,
            витамин D и B12 хотя бы раз в полгода — и корректируйте стек по результатам.
          </p>
        </div>
      </div>

      {modal && (
        <AddSupplement
          store={store}
          editing={editing}
          close={() => { setModal(false); setEditing(null) }}
        />
      )}
    </>
  )
}
