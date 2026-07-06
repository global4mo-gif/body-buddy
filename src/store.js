import { useEffect, useState } from 'react'

const KEY = 'body-buddy-v1'

export const todayKey = (d = new Date()) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const dateOffset = (offset) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d
}

const uid = () => Math.random().toString(36).slice(2, 9)

const DEFAULT_STATE = {
  profile: null, // { name, gender, age, goal, waterGoal }
  stack: [
    // seed из дизайна Body Buddy
    { id: 'seed1', name: 'Железо бисглицинат', dose: '25 мг', slot: 'morning', emoji: '🩸', tags: ['iron'], note: 'Энергия и кровь', paused: false },
    { id: 'seed2', name: 'Витамин C', dose: '500 мг', slot: 'morning', emoji: '🍊', tags: ['vitc'], note: 'Усвоение железа', paused: false },
    { id: 'seed3', name: 'Магний глицинат', dose: '400 мг', slot: 'evening', emoji: '🌙', tags: ['magnesium'], note: 'Сон и нервы', paused: false },
  ],
  log: {},   // { '2026-07-06': { suppIds: ['id1'], water: 600 } }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch { /* повреждённые данные — начинаем заново */ }
  return DEFAULT_STATE
}

export function useStore() {
  const [state, setState] = useState(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const day = (key) => state.log[key] || { suppIds: [], water: 0 }

  const api = {
    state,
    day,

    saveProfile(profile) {
      setState((s) => ({ ...s, profile }))
    },

    addSupp(supp) {
      setState((s) => ({ ...s, stack: [...s.stack, { ...supp, id: uid(), paused: false }] }))
    },

    updateSupp(id, patch) {
      setState((s) => ({ ...s, stack: s.stack.map((x) => (x.id === id ? { ...x, ...patch } : x)) }))
    },

    removeSupp(id) {
      setState((s) => ({ ...s, stack: s.stack.filter((x) => x.id !== id) }))
    },

    toggleTaken(suppId, dateKey = todayKey()) {
      setState((s) => {
        const d = s.log[dateKey] || { suppIds: [], water: 0 }
        const suppIds = d.suppIds.includes(suppId)
          ? d.suppIds.filter((x) => x !== suppId)
          : [...d.suppIds, suppId]
        return { ...s, log: { ...s.log, [dateKey]: { ...d, suppIds } } }
      })
    },

    addWater(ml, dateKey = todayKey()) {
      setState((s) => {
        const d = s.log[dateKey] || { suppIds: [], water: 0 }
        return { ...s, log: { ...s.log, [dateKey]: { ...d, water: Math.max(0, d.water + ml) } } }
      })
    },

    reset() {
      localStorage.removeItem(KEY)
      setState(DEFAULT_STATE)
    },
  }

  return api
}

// Адгеренс за день: сколько активных добавок отмечено
export function dayAdherence(state, dateKey) {
  const active = state.stack.filter((x) => !x.paused)
  if (!active.length) return null
  const d = state.log[dateKey]
  if (!d) return 0
  const taken = active.filter((x) => d.suppIds.includes(x.id)).length
  return taken / active.length
}

// Стрик: сколько дней подряд (заканчивая сегодня или вчера) адгеренс 100%
export function streak(state) {
  let n = 0
  for (let i = 0; i < 365; i++) {
    const key = todayKey(dateOffset(-i))
    const a = dayAdherence(state, key)
    if (a === 1) n++
    else if (i === 0) continue // сегодня ещё не закончился — не рвём стрик
    else break
  }
  return n
}
