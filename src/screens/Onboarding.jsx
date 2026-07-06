import { useMemo, useState } from 'react'

const GOALS = [
  { id: 'energy', label: '⚡ Больше энергии' },
  { id: 'sleep', label: '🌙 Лучше спать' },
  { id: 'focus', label: '🧠 Фокус и ясность' },
  { id: 'immunity', label: '🛡️ Иммунитет' },
]

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

export default function Onboarding({ store }) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('f')
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [goal, setGoal] = useState('energy')
  const [trainHours, setTrainHours] = useState(0)
  const [hotClimate, setHotClimate] = useState(false)
  const [waterAdjust, setWaterAdjust] = useState(0) // ручная подстройка ±

  const w = Number(weight) || 0
  const recommended = useMemo(
    () => calcWaterGoal(w, trainHours, hotClimate),
    [w, trainHours, hotClimate]
  )
  const waterGoal = Math.min(WATER_MAX, Math.max(WATER_MIN, recommended + waterAdjust))

  const submit = () => {
    store.saveProfile({
      name: name.trim() || 'Buddy',
      gender,
      age: age ? Number(age) : null,
      weight: w || null,
      goal,
      trainHours,
      hotClimate,
      waterGoal,
    })
  }

  return (
    <div className="onb fade-in">
      <div style={{ textAlign: 'center', fontSize: 44 }}>🌿</div>
      <h1>Добро пожаловать домой</h1>
      <p className="lead">
        Настроим профиль, чтобы собрать план, который подходит именно вам.
      </p>

      <div className="field">
        <label>Как вас зовут?</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя"
        />
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
          <input
            type="number"
            inputMode="numeric"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="28"
          />
        </div>
        <div className="field">
          <label>Вес, кг</label>
          <input
            type="number"
            inputMode="numeric"
            value={weight}
            onChange={(e) => { setWeight(e.target.value); setWaterAdjust(0) }}
            placeholder="70"
          />
        </div>
      </div>

      <div className="field">
        <label>Главный фокус</label>
        <div className="goal-list">
          {GOALS.map((g) => (
            <button key={g.id} className={goal === g.id ? 'active' : ''} onClick={() => setGoal(g.id)}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Интенсивные тренировки в день</label>
        <div className="seg">
          {[0, 1, 2].map((h) => (
            <button
              key={h}
              className={trainHours === h ? 'active' : ''}
              onClick={() => { setTrainHours(h); setWaterAdjust(0) }}
            >
              {h === 0 ? 'Нет' : `~${h} ч`}
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

      <div className="card blue">
        <div className="card-title" style={{ marginBottom: 4 }}>
          <h2>💧 Ваша цель по воде</h2>
          <span className="big-number" style={{ fontSize: 24 }}>{(waterGoal / 1000).toFixed(1)} л</span>
        </div>
        {w > 0 ? (
          <p className="tiny">
            База {w} кг × {trainHours > 0 ? 40 : 35} мл = {((w * (trainHours > 0 ? 40 : 35)) / 1000).toFixed(1)} л
            {trainHours > 0 && ` · тренировки +${(trainHours * 750 / 1000).toFixed(2).replace(/0$/, '')} л`}
            {hotClimate && ' · жара +0.6 л'}
            {' · максимум 6 л/сутки'}
          </p>
        ) : (
          <p className="tiny">Укажите вес — рассчитаем цель по формуле 35–40 мл на кг.</p>
        )}
        <div className="hydro-actions" style={{ marginTop: 10 }}>
          <button
            className="btn small ghost"
            onClick={() => setWaterAdjust((a) => Math.max(WATER_MIN - recommended, a - 250))}
            disabled={waterGoal <= WATER_MIN}
          >− 250 мл</button>
          <button
            className="btn small ghost"
            onClick={() => setWaterAdjust((a) => Math.min(WATER_MAX - recommended, a + 250))}
            disabled={waterGoal >= WATER_MAX}
          >＋ 250 мл</button>
        </div>
      </div>

      <button className="btn primary" onClick={submit}>
        ✨ Рассчитать мой план
      </button>
      <p className="tiny center">
        Данные хранятся только на вашем устройстве.
      </p>
    </div>
  )
}
