import { useRef, useState } from 'react'
import { CATALOG, SLOT_LABEL } from '../data.js'
import { getApiKey, setApiKey, fileToBase64Jpeg, scanLabel, toSupplement } from '../vision.js'

function PhotoSlot({ label, hint, file, onPick }) {
  const inputRef = useRef(null)
  return (
    <button className={`photo-slot ${file ? 'filled' : ''}`} onClick={() => inputRef.current?.click()}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => { if (e.target.files?.[0]) onPick(e.target.files[0]); e.target.value = '' }}
      />
      {file ? (
        <>
          <img src={URL.createObjectURL(file)} alt={label} />
          <span className="photo-check">✓</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: 26 }}>📷</span>
          <b>{label}</b>
          <span className="tiny">{hint}</span>
        </>
      )}
    </button>
  )
}

function ScanMode({ store, close }) {
  const [front, setFront] = useState(null)
  const [back, setBack] = useState(null)
  const [key, setKey] = useState(getApiKey())
  const [editKey, setEditKey] = useState(!getApiKey())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [supp, setSupp] = useState(null)

  const scan = async () => {
    setError('')
    setBusy(true)
    try {
      if (editKey) {
        if (!key.trim().startsWith('sk-ant-')) {
          throw new Error('Вставьте API-ключ Anthropic (начинается с sk-ant-...).')
        }
        setApiKey(key)
        setEditKey(false)
      }
      const images = []
      if (front) images.push(await fileToBase64Jpeg(front))
      if (back) images.push(await fileToBase64Jpeg(back))
      if (!images.length) throw new Error('Добавьте хотя бы одно фото этикетки.')
      const r = await scanLabel(images, getApiKey())
      setResult(r)
      setSupp(toSupplement(r))
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const save = () => {
    store.addSupp(supp)
    close()
  }

  if (result && supp) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card green" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>
            <span style={{ fontSize: 22 }}>✅</span>
            <h3 style={{ flex: 1 }}>{supp.name}</h3>
          </div>
          <div className="chips">
            <span className="pill yellow">
              1 порция = {result.serving_units} {result.form}
            </span>
            <span className="pill gray">{result.servings_per_day}× в день</span>
            {result.with_food && <span className="pill gray">с едой</span>}
          </div>
        </div>

        {result.active_ingredients?.length > 0 && (
          <div className="card">
            <div className="card-title"><h3>Активные вещества</h3></div>
            <table className="src-table">
              <thead>
                <tr className="tiny">
                  <td>Вещество</td>
                  <td>на порцию</td>
                  {result.serving_units > 1 && <td>на 1 шт</td>}
                </tr>
              </thead>
              <tbody>
                {result.active_ingredients.map((i) => (
                  <tr key={i.name}>
                    <td>{i.name}</td>
                    <td><b>{i.amount_per_serving}</b></td>
                    {result.serving_units > 1 && <td>{i.amount_per_unit}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
            {result.serving_units > 1 && (
              <p className="tiny" style={{ marginTop: 8 }}>
                ⚠️ Дозы в составе указаны на порцию из {result.serving_units} единиц —
                не путайте с дозой одной капсулы.
              </p>
            )}
          </div>
        )}

        {result.warnings && (
          <div className="interaction conflict">
            <b>⚠️ С этикетки</b>
            {result.warnings}
          </div>
        )}

        <div className="field">
          <label>Время приёма</label>
          <div className="seg">
            {['morning', 'day', 'evening'].map((slot) => (
              <button
                key={slot}
                className={supp.slot === slot ? 'active' : ''}
                onClick={() => setSupp({ ...supp, slot })}
              >
                {SLOT_LABEL[slot]}
              </button>
            ))}
          </div>
        </div>

        <button className="btn primary" onClick={save}>＋ Добавить в стек</button>
        <button className="btn ghost" onClick={() => { setResult(null); setSupp(null) }}>
          ↻ Пересканировать
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p className="muted">
        Сфотографируйте этикетку с двух сторон — распознаем название, состав,
        дозы активных веществ и размер порции.
      </p>

      <div className="scan-grid">
        <PhotoSlot
          label="Лицевая сторона"
          hint="название и бренд"
          file={front}
          onPick={setFront}
        />
        <PhotoSlot
          label="Обратная сторона"
          hint="состав и дозировки"
          file={back}
          onPick={setBack}
        />
      </div>

      {editKey ? (
        <div className="field">
          <label>API-ключ Anthropic (для распознавания фото)</label>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-ant-..."
            type="password"
          />
          <p className="tiny" style={{ marginTop: 6 }}>
            Ключ хранится только на вашем устройстве. Получить:
            console.anthropic.com → API Keys. Один скан стоит ~1–2 ₽.
          </p>
        </div>
      ) : (
        <p className="tiny">
          🔑 API-ключ сохранён.{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); setEditKey(true) }}>Изменить</a>
        </p>
      )}

      {error && (
        <div className="interaction conflict">
          <b>Не получилось</b>
          {error}
        </div>
      )}

      <button className="btn primary" onClick={scan} disabled={busy || (!front && !back)}>
        {busy ? '🔍 Распознаём этикетку…' : '✨ Распознать этикетку'}
      </button>
    </div>
  )
}

export default function AddSupplement({ store, editing, close }) {
  const [mode, setMode] = useState(editing ? 'form' : 'scan')
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

        {!editing && (
          <div className="seg">
            <button className={mode === 'scan' ? 'active' : ''} onClick={() => setMode('scan')}>
              📷 Скан этикетки
            </button>
            <button className={mode === 'catalog' ? 'active' : ''} onClick={() => setMode('catalog')}>
              📋 Каталог
            </button>
            <button className={mode === 'form' ? 'active' : ''} onClick={() => setMode('form')}>
              ✏️ Вручную
            </button>
          </div>
        )}

        {mode === 'scan' && !editing && <ScanMode store={store} close={close} />}

        {mode === 'catalog' && (
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
          </>
        )}
      </div>
    </div>
  )
}
