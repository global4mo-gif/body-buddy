import { useState } from 'react'
import { CRAVINGS, KNOWLEDGE } from '../data.js'

export default function Knowledge() {
  const [openCrave, setOpenCrave] = useState(null)
  const [openKnow, setOpenKnow] = useState(null)

  return (
    <>
      <div className="topbar">
        <div className="avatar">📚</div>
        <div style={{ flex: 1 }}>
          <div className="hello">Учиться и понимать</div>
          <div className="sub">Слушайте сигналы своего тела</div>
        </div>
      </div>

      <div className="screen fade-in">
        <div className="section-head">
          <h2>🧩 Дешифратор тяги</h2>
        </div>
        <p className="muted" style={{ marginTop: -6 }}>
          Внезапная тяга к еде — часто сигнал о дефиците. Нажмите, чтобы расшифровать.
        </p>

        <div className="decoder-grid">
          {CRAVINGS.map((c, i) => (
            <div
              key={c.crave}
              className={`card know-card ${openCrave === i ? 'peach' : ''}`}
              onClick={() => setOpenCrave(openCrave === i ? null : i)}
            >
              <div className="card-title" style={{ marginBottom: 0 }}>
                <span style={{ fontSize: 22 }}>{c.emoji}</span>
                <h3 style={{ flex: 1 }}>{c.crave}</h3>
                <span className="pill gray">{openCrave === i ? '−' : '+'}</span>
              </div>
              {openCrave === i && (
                <div className="know-body fade-in">
                  <span className="pill yellow">Возможный дефицит: {c.nutrient}</span>
                  <p>{c.text}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="section-head">
          <h2>🔬 Разбор нутриентов</h2>
        </div>

        <div className="decoder-grid">
          {KNOWLEDGE.map((k, i) => (
            <div
              key={k.title}
              className={`card know-card ${openKnow === i ? 'blue' : ''}`}
              onClick={() => setOpenKnow(openKnow === i ? null : i)}
            >
              <div className="card-title" style={{ marginBottom: 0 }}>
                <span style={{ fontSize: 22 }}>{k.emoji}</span>
                <h3 style={{ flex: 1 }}>{k.title}</h3>
                <span className="pill gray">{openKnow === i ? '−' : '+'}</span>
              </div>
              {openKnow === i && (
                <div className="know-body fade-in" onClick={(e) => e.stopPropagation()}>
                  <p>{k.lead}</p>
                  <div>
                    <b style={{ fontSize: 13 }}>Признаки нехватки:</b>
                    <ul>
                      {k.signs.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <b style={{ fontSize: 13 }}>Лучшие источники:</b>
                    <table className="src-table">
                      <tbody>
                        {k.sources.map(([name, amount]) => (
                          <tr key={name}><td>{name}</td><td>{amount}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="interaction synergy">
                    <b>🤝 Лучше вместе</b>
                    {k.synergy}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="card sand">
          <p className="tiny">
            Материалы носят образовательный характер и не заменяют консультацию врача.
            Перед изменением стека добавок проконсультируйтесь со специалистом.
          </p>
        </div>
      </div>
    </>
  )
}
