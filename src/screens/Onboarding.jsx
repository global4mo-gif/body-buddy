import { useMemo, useRef, useState } from 'react'

export const WATER_MIN = 1500
export const WATER_MAX = 6000 // физиологический максимум

// База: вес × 35 мл (или × 40 при высокой активности)
// + 750 мл за каждый час интенсивного тренинга (среднее 500–1000)
// + 600 мл в жарком климате (среднее 500–700)
export function calcWaterGoal(weight, trainHours, hotClimate) {
  if (!weight) return 2000
  const base = weight * (trainHours > 0 ? 40 : 35)
  const training = trainHours * 750
  const climate = hotClimate ? 600 : 0
  const total = base + training + climate
  return Math.min(WATER_MAX, Math.max(WATER_MIN, Math.round(total / 100) * 100))
}

// Миффлин — Сан Жеор + активность + цель по весу
export function calcPlan({ gender, age, weight, height, trainHours, goal }) {
  const sexTerm = gender === 'm' ? 5 : gender === 'f' ? -161 : -78
  const bmr = 10 * weight + 6.25 * height - 5 * age + sexTerm
  const activity = [1.35, 1.55, 1.725][trainHours] || 1.35
  let kcal = bmr * activity
  if (goal === 'lose') kcal *= 0.85
  if (goal === 'gain') kcal *= 1.15
  kcal = Math.round(kcal / 50) * 50
  return {
    kcal,
    protein: Math.round((kcal * 0.30) / 4), // г
    carbs: Math.round((kcal * 0.45) / 4),
    fat: Math.round((kcal * 0.25) / 9),
  }
}

const GOALS = [
  { id: 'lose', icon: '↘', label: 'Сбросить вес' },
  { id: 'maintain', icon: '⚖️', label: 'Поддерживать' },
  { id: 'gain', icon: '↗', label: 'Набрать вес' },
]

function MacroBar({ label, grams, pct, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="head" style={{ fontSize: 13.5, color }}>{label}</span>
        <b style={{ fontSize: 14 }}>{grams} г ({pct}%)</b>
      </div>
      <div className="macro-track"><div style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  )
}

export default function Onboarding({ store }) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('f')
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [region, setRegion] = useState('')
  const [goal, setGoal] = useState('maintain')
  const [trainHours, setTrainHours] = useState(0)
  const [hotClimate, setHotClimate] = useState(false)
  const [avatar, setAvatar] = useState(null)
  const [waterAdjust, setWaterAdjust] = useState(0)
  const [plan, setPlan] = useState(null)
  const fileRef = useRef(null)
  const planRef = useRef(null)

  const w = Number(weight) || 0
  const h = Number(height) || 0
  const a = Number(age) || 0
  const ready = w > 0 && h > 0 && a > 0

  const recommended = useMemo(
    () => calcWaterGoal(w, trainHours, hotClimate),
    [w, trainHours, hotClimate]
  )
  const waterGoal = Math.min(WATER_MAX, Math.max(WATER_MIN, recommended + waterAdjust))

  const pickAvatar = (file) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const size = 200
      const canvas = document.createElement('canvas')
      canvas.width = size; canvas.height = size
      const s = Math.max(size / img.width, size / img.height)
      canvas.getContext('2d').drawImage(
        img,
        (size - img.width * s) / 2, (size - img.height * s) / 2,
        img.width * s, img.height * s
      )
      setAvatar(canvas.toDataURL('image/jpeg', 0.85))
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const calculate = () => {
    setPlan(calcPlan({ gender, age: a, weight: w, height: h, trainHours, goal }))
    setTimeout(() => planRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const start = () => {
    store.saveProfile({
      name: name.trim() || 'Buddy',
      gender,
      age: a,
      weight: w,
      height: h,
      region: region.trim() || null,
      goal,
      trainHours,
      hotClimate,
      waterGoal,
      plan,
      avatar,
    })
  }

  return (
    <div className="onb fade-in">
      <h1>Добро пожаловать домой</h1>
      <p className="lead">
        Настроим профиль, чтобы собрать план, который подходит именно вам.
      </p>

      {/* Аватар — как в дизайне: "Let's put a face to the name!" */}
      <div className="card avatar-card">
        <div className="avatar-topline" />
        <h2 className="head" style={{ color: 'var(--brown)' }}>Добавим лицо профилю!</h2>
        <button className="avatar-pick" onClick={() => fileRef.current?.click()}>
          <input
            ref={fileRef} type="file" accept="image/*" hidden
            onChange={(e) => { if (e.target.files?.[0]) pickAvatar(e.target.files[0]); e.target.value = '' }}
          />
          {avatar ? <img src={avatar} alt="Аватар" /> : <span style={{ fontSize: 40 }}>🌿</span>}
          <span className="avatar-edit">✏️</span>
        </button>
      </div>

      {/* О вас */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3 className="head" style={{ color: 'var(--brown)' }}>👤 О вас</h3>

        <div className="field">
          <label>Имя</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Как вас зовут?" />
        </div>

        <div className="field">
          <label>Пол</label>
          <div className="seg">
            <button className={gender === 'f' ? 'active' : ''} onClick={() => setGender('f')}>Женский</button>
            <button className={gender === 'm' ? 'active' : ''} onClick={() => setGender('m')}>Мужской</button>
            <button className={gender === 'o' ? 'active' : ''} onClick={() => setGender('o')}>Другое</button>
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Возраст</label>
            <input type="number" inputMode="numeric" value={age}
              onChange={(e) => { setAge(e.target.value); setPlan(null) }} placeholder="24" />
          </div>
          <div className="field">
            <label>Вес, кг</label>
            <input type="number" inputMode="numeric" value={weight}
              onChange={(e) => { setWeight(e.target.value); setWaterAdjust(0); setPlan(null) }} placeholder="65" />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label>Рост, см</label>
            <input type="number" inputMode="numeric" value={height}
              onChange={(e) => { setHeight(e.target.value); setPlan(null) }} placeholder="170" />
          </div>
          <div className="field">
            <label>Город (необязательно)</label>
            <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="📍 Москва" />
          </div>
        </div>
      </div>

      {/* Главный фокус — Lose / Maintain / Gain из дизайна */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h3 className="head" style={{ color: 'var(--brown)' }}>Главный фокус</h3>
        <div className="goal-grid">
          {GOALS.map((g) => (
            <button
              key={g.id}
              className={`goal-tile ${goal === g.id ? 'active' : ''}`}
              onClick={() => { setGoal(g.id); setPlan(null) }}
            >
              <span className="goal-icon">{g.icon}</span>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Активность — для воды и калорий */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <h3 className="head" style={{ color: 'var(--brown)' }}>🏃 Активность</h3>
        <div className="field">
          <label>Интенсивные тренировки в день</label>
          <div className="seg">
            {[0, 1, 2].map((hrs) => (
              <button key={hrs} className={trainHours === hrs ? 'active' : ''}
                onClick={() => { setTrainHours(hrs); setWaterAdjust(0); setPlan(null) }}>
                {hrs === 0 ? 'Нет' : `~${hrs} ч`}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Жаркий климат / душное помещение</label>
          <div className="seg">
            <button className={!hotClimate ? 'active' : ''} onClick={() => { setHotClimate(false); setWaterAdjust(0) }}>Нет</button>
            <button className={hotClimate ? 'active' : ''} onClick={() => { setHotClimate(true); setWaterAdjust(0) }}>Да</button>
          </div>
        </div>
      </div>

      <button className="btn primary" onClick={calculate} disabled={!ready}>
        🧮 Рассчитать мой план
      </button>
      {!ready && (
        <p className="tiny center">Укажите возраст, вес и рост — и рассчитаем план.</p>
      )}

      {/* Панель плана — "Your Plan Awaits" из дизайна */}
      <div ref={planRef}>
        {!plan ? (
          <div className="plan-placeholder">
            <div className="plan-sparkle">✨</div>
            <h3 className="head" style={{ color: 'var(--text-3)' }}>Ваш план ждёт</h3>
            <p className="muted">
              Заполните данные и нажмите «Рассчитать мой план» — соберём вашу
              персональную дорожную карту здоровья.
            </p>
          </div>
        ) : (
          <div className="card plan-card fade-in">
            <div className="card-title">
              <span className="pill green">💚 Точный план</span>
            </div>
            <div className="center" style={{ margin: '6px 0 14px' }}>
              <div className="tiny" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Дневная цель калорий
              </div>
              <div className="big-number" style={{ fontSize: 40, color: 'var(--brown)' }}>
                {plan.kcal.toLocaleString('ru-RU')} <span style={{ fontSize: 20, fontWeight: 500 }}>ккал</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <b style={{ fontSize: 14.5 }}>Баланс БЖУ</b>
              <MacroBar label="Белки" grams={plan.protein} pct={30} color="var(--success)" />
              <MacroBar label="Углеводы" grams={plan.carbs} pct={45} color="var(--secondary)" />
              <MacroBar label="Полезные жиры" grams={plan.fat} pct={25} color="var(--brown-soft)" />
            </div>

            <div className="card blue" style={{ marginTop: 14 }}>
              <div className="card-title" style={{ marginBottom: 4 }}>
                <h3>💧 Вода</h3>
                <span className="big-number" style={{ fontSize: 22 }}>{(waterGoal / 1000).toFixed(1)} л</span>
              </div>
              <p className="tiny">
                {w} кг × {trainHours > 0 ? 40 : 35} мл
                {trainHours > 0 && ` + тренировки ${(trainHours * 750 / 1000).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')} л`}
                {hotClimate && ' + жара 0.6 л'} · максимум 6 л/сутки
              </p>
              <div className="hydro-actions" style={{ marginTop: 8 }}>
                <button className="btn small ghost" disabled={waterGoal <= WATER_MIN}
                  onClick={() => setWaterAdjust((v) => Math.max(WATER_MIN - recommended, v - 250))}>− 250 мл</button>
                <button className="btn small ghost" disabled={waterGoal >= WATER_MAX}
                  onClick={() => setWaterAdjust((v) => Math.min(WATER_MAX - recommended, v + 250))}>＋ 250 мл</button>
              </div>
            </div>

            <div className="buddy-note">
              «Вот ваша персональная дорожная карта к лучшей версии себя!
              Помните: маленькие шаги приводят к большим сдвигам. У вас получится!»
              <div className="buddy-sign">🌿 <b>Body Buddy</b></div>
            </div>

            <button className="btn primary" style={{ marginTop: 14 }} onClick={start}>
              ✨ Начать путь
            </button>
          </div>
        )}
      </div>

      <p className="tiny center">Данные хранятся только на вашем устройстве.</p>
    </div>
  )
}
