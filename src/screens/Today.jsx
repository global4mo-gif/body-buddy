import { todayKey, dayAdherence, streak } from '../store.js'
import { NUDGES, SLOT_LABEL, SLOT_TIME, SLOT_EMOJI } from '../data.js'

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Доброй ночи'
  if (h < 12) return 'Доброе утро'
  if (h < 18) return 'Добрый день'
  return 'Добрый вечер'
}

function Ring({ pct, taken, total }) {
  const r = 70
  const c = 2 * Math.PI * r
  return (
    <div className="ring-wrap">
      <div className="ring">
        <svg width="168" height="168">
          <circle cx="84" cy="84" r={r} fill="none" stroke="var(--tertiary)" strokeWidth="14" />
          <circle
            cx="84" cy="84" r={r} fill="none"
            stroke="var(--success)" strokeWidth="14" strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct)}
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <div className="ring-center">
          <div className="big">{taken}/{total}</div>
          <div className="tiny">приёмов сегодня</div>
        </div>
      </div>
    </div>
  )
}

export default function Today({ store, goStack }) {
  const { state } = store
  const key = todayKey()
  const day = store.day(key)
  const active = state.stack.filter((s) => !s.paused)
  const taken = active.filter((s) => day.suppIds.includes(s.id))
  const pct = active.length ? taken.length / active.length : 0
  const st = streak(state)
  const nudge = NUDGES[new Date().getDate() % NUDGES.length]
  const waterPct = Math.min(1, day.water / state.profile.waterGoal)

  const slots = ['morning', 'day', 'evening']
    .map((slot) => ({ slot, items: active.filter((s) => s.slot === slot) }))
    .filter((g) => g.items.length)

  return (
    <>
      <div className="topbar">
        <div className="avatar">
          {state.profile.avatar
            ? <img src={state.profile.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            : '🌿'}
        </div>
        <div style={{ flex: 1 }}>
          <div className="hello">{greeting()}, {state.profile.name}</div>
          <div className="sub">Вы отлично справляетесь.</div>
        </div>
        {st > 0 && <span className="pill yellow">🔥 {st} дн.</span>}
      </div>

      <div className="screen fade-in">
        <div className="card">
          <Ring pct={pct} taken={taken.length} total={active.length} />
          <div className="stat-row">
            <div className="stat">
              <b>{Math.round(pct * 100)}%</b>
              <div className="tiny">адгеренс</div>
            </div>
            <div className="stat">
              <b>{day.water} мл</b>
              <div className="tiny">вода</div>
            </div>
            <div className="stat">
              <b>{active.length}</b>
              <div className="tiny">в стеке</div>
            </div>
          </div>
        </div>

        {slots.length === 0 && (
          <div className="empty">
            В стеке пока пусто. Добавьте первую добавку на вкладке «Стек» 💊
          </div>
        )}

        {slots.map(({ slot, items }) => (
          <div key={slot}>
            <div className="section-head">
              <h2>{SLOT_EMOJI[slot]} {SLOT_LABEL[slot]}</h2>
              <span className="tiny">{SLOT_TIME[slot]}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {items.map((s) => {
                const on = day.suppIds.includes(s.id)
                return (
                  <div key={s.id} className={`supp-row ${on ? 'taken' : ''}`}>
                    <div className="icon">{s.emoji || '💊'}</div>
                    <div className="info">
                      <div className="name">{s.name}</div>
                      <div className="meta">{s.dose}{s.note ? ` · ${s.note}` : ''}</div>
                    </div>
                    <button
                      className={`check ${on ? 'on' : ''}`}
                      onClick={() => store.toggleTaken(s.id)}
                      aria-label={on ? 'Отменить приём' : 'Отметить приём'}
                    >
                      {on ? '✓' : ''}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <div className="card blue">
          <div className="card-title">
            <h2>💧 Гидратация</h2>
            <span className="tiny">{day.water} / {state.profile.waterGoal} мл</span>
          </div>
          {waterPct < 1 ? (
            <p className="muted">Ещё {state.profile.waterGoal - day.water} мл до цели.</p>
          ) : (
            <p className="muted">Цель по воде выполнена! 🎉</p>
          )}
          <div className="hydro-bar"><div style={{ width: `${waterPct * 100}%` }} /></div>
          <div className="hydro-actions">
            <button className="btn small ghost" onClick={() => store.addWater(200)}>＋ 200 мл</button>
            <button className="btn small ghost" onClick={() => store.addWater(500)}>＋ 500 мл</button>
            {day.water > 0 && (
              <button className="btn small ghost" onClick={() => store.addWater(-200)}>− 200</button>
            )}
          </div>
        </div>

        <div className="card peach">
          <div className="card-title"><h2>🪶 Мягкий совет</h2></div>
          <p style={{ fontSize: 13.5 }}>{nudge}</p>
        </div>

        <button className="btn primary" onClick={goStack}>Управлять стеком →</button>
      </div>
    </>
  )
}
