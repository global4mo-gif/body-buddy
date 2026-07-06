import { todayKey, dateOffset, dayAdherence, streak } from '../store.js'

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function level(a) {
  if (a === null || a === undefined) return ''
  if (a >= 1) return 'l3'
  if (a >= 0.5) return 'l2'
  if (a > 0) return 'l1'
  return ''
}

export default function Progress({ store }) {
  const { state } = store
  const st = streak(state)

  // сетка последних 4 недель, заканчивая текущей неделей (Пн-Вс)
  const today = new Date()
  const dow = (today.getDay() + 6) % 7 // 0=Пн
  const cells = []
  // от понедельника три недели назад до сегодняшнего дня
  for (let i = 21 + dow; i >= 0; i--) {
    const d = dateOffset(-i)
    const key = todayKey(d)
    cells.push({
      key,
      day: d.getDate(),
      a: state.log[key] ? dayAdherence(state, key) : null,
      isToday: key === todayKey(),
    })
  }

  // адгеренс по каждой добавке за 14 дней
  const days14 = Array.from({ length: 14 }, (_, i) => todayKey(dateOffset(-i)))
  const loggedDays = days14.filter((k) => state.log[k])
  const perSupp = state.stack
    .filter((s) => !s.paused)
    .map((s) => {
      const takenDays = loggedDays.filter((k) => (state.log[k].suppIds || []).includes(s.id)).length
      return { ...s, pct: loggedDays.length ? takenDays / loggedDays.length : 0 }
    })
    .sort((a, b) => b.pct - a.pct)

  // среднее по воде за 7 дней
  const days7 = Array.from({ length: 7 }, (_, i) => todayKey(dateOffset(-i)))
  const waterAvg = Math.round(
    days7.reduce((sum, k) => sum + (state.log[k]?.water || 0), 0) / 7
  )

  return (
    <>
      <div className="topbar">
        <div className="avatar">📊</div>
        <div style={{ flex: 1 }}>
          <div className="hello">Ваш прогресс</div>
          <div className="sub">Постоянство важнее совершенства</div>
        </div>
      </div>

      <div className="screen fade-in">
        <div className="grid-2">
          <div className="card green center">
            <div className="big-number">🔥 {st}</div>
            <div className="tiny">дней подряд без пропусков</div>
          </div>
          <div className="card blue center">
            <div className="big-number">{waterAvg}</div>
            <div className="tiny">мл воды в среднем / день</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title"><h2>Последние 4 недели</h2></div>
          <div className="heat" style={{ marginBottom: 6 }}>
            {WEEKDAYS.map((w) => (
              <div key={w} className="tiny center">{w}</div>
            ))}
          </div>
          <div className="heat">
            {cells.map((c) => (
              <div key={c.key} className={`cell ${level(c.a)} ${c.isToday ? 'today' : ''}`}>
                {c.day}
              </div>
            ))}
          </div>
          <p className="tiny" style={{ marginTop: 10 }}>
            Чем зеленее день — тем полнее выполнен план приёма.
          </p>
        </div>

        <div className="card">
          <div className="card-title"><h2>По добавкам · 14 дней</h2></div>
          {perSupp.length === 0 ? (
            <p className="muted">Добавьте добавки в стек, чтобы видеть статистику.</p>
          ) : loggedDays.length === 0 ? (
            <p className="muted">Пока нет отметок — начните отмечать приёмы на вкладке «Сегодня».</p>
          ) : (
            <div className="bar-list">
              {perSupp.map((s) => (
                <div key={s.id} className="row">
                  <span className="lbl">{s.emoji} {s.name}</span>
                  <div className="track"><div style={{ width: `${s.pct * 100}%` }} /></div>
                  <span className="val">{Math.round(s.pct * 100)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card sand">
          <div className="card-title"><h2>🎯 Цель профиля</h2></div>
          <p style={{ fontSize: 13.5 }}>
            {{
              energy: 'Больше энергии: следите за железом, B-комплексом и режимом сна.',
              sleep: 'Лучше спать: магний вечером, меньше кофеина после 14:00, стабильный отбой.',
              focus: 'Фокус и ясность: омега-3, ежовик и ровный уровень глюкозы в течение дня.',
              immunity: 'Иммунитет: витамин D, цинк, витамин C и функциональные грибы.',
            }[state.profile.goal] || 'Держите курс — постоянство решает.'}
          </p>
        </div>

        <button
          className="btn ghost"
          onClick={() => {
            if (confirm('Сбросить все данные приложения? Это действие необратимо.')) store.reset()
          }}
        >
          Сбросить данные
        </button>
      </div>
    </>
  )
}
