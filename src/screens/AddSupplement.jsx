import { useState } from 'react'
import { CATALOG, SLOT_LABEL } from '../data.js'

export default function AddSupplement({ store, editing, close }) {
  const [mode, setMode] = useState(editing ? 'form' : 'catalog')
  const [form, setForm] = useState(
    editing || { name: '', dose: '', slot: 'morning', emoji: '💊', tags: [], note: '' }
  )

  const inStack = new Set(store.state.stack.map((s) => s.name))

  const pick = (item) => {
    setForm({ ...item })
    setMode('form')
  }

  const save = () => {
    if (!form.name.trim()) return
    if (editing) {
      store.updateSupp(editing.id, {
        name: form.name, dose: form.dose, slot: form.slot,
        emoji: form.emoji, tags: form.tags, note: form.note,
      })
    } else {
      store.addSupp(form)
    }
    close()
  }

  return (
    <div className="modal-back" onClick={(e) => { if (e.target === e.currentTarget) close() }}>
      <div className="modal fade-in">
        <div className="grab" />
        <h2>{editing ? 'Редактировать добавку' : 'Добавить в стек'}</h2>

        {mode === 'catalog' && (
          <>
            <p className="muted">Выберите из каталога или создайте свою.</p>
            <div className="catalog">
              {CATALOG.map((item) => (
                <button key={item.name} onClick={() => pick(item)} disabled={inStack.has(item.name)}>
                  <span className="em">{item.emoji}</span>
                  <span style={{ flex: 1 }}>
                    {item.name}
                    <small>{item.dose} · {SLOT_LABEL[item.slot]} · {item.note}</small>
                  </span>
                  {inStack.has(item.name) ? <span className="tiny">уже в стеке</span> : <span>＋</span>}
                </button>
              ))}
            </div>
            <button className="btn ghost" onClick={() => setMode('form')}>
              ✏️ Создать свою
            </button>
          </>
        )}

        {mode === 'form' && (
          <>
            <div className="field">
              <label>Название</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Например, Коллаген"
              />
            </div>
            <div className="field">
              <label>Дозировка</label>
              <input
                value={form.dose}
                onChange={(e) => setForm({ ...form, dose: e.target.value })}
                placeholder="Например, 5 г"
              />
            </div>
            <div className="field">
              <label>Время приёма</label>
              <div className="seg">
                {['morning', 'day', 'evening'].map((slot) => (
                  <button
                    key={slot}
                    className={form.slot === slot ? 'active' : ''}
                    onClick={() => setForm({ ...form, slot })}
                  >
                    {SLOT_LABEL[slot]}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Заметка (необязательно)</label>
              <input
                value={form.note || ''}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Зачем принимаете"
              />
            </div>
            <button className="btn primary" onClick={save} disabled={!form.name.trim()}>
              {editing ? 'Сохранить' : '＋ Добавить в стек'}
            </button>
            {!editing && (
              <button className="btn ghost" onClick={() => setMode('catalog')}>← Назад к каталогу</button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
