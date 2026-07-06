// Распознавание этикетки БАДа по фото через Claude API (vision).
// Ключ API хранится только в localStorage браузера пользователя;
// фото уходят напрямую в Anthropic, без промежуточного сервера.

const KEY_STORAGE = 'body-buddy-api-key'

export const getApiKey = () => localStorage.getItem(KEY_STORAGE) || ''
export const setApiKey = (k) => localStorage.setItem(KEY_STORAGE, k.trim())

// Сжимаем фото до разумного размера перед отправкой
export function fileToBase64Jpeg(file, maxDim = 1400) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      resolve(dataUrl.split(',')[1])
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Не удалось прочитать фото')) }
    img.src = url
  })
}

const SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Название добавки на русском (активное вещество + форма), например "Магний глицинат" или "Ежовик гребенчатый"' },
    brand: { type: 'string', description: 'Бренд/производитель, если виден' },
    form: { type: 'string', enum: ['капсулы', 'таблетки', 'порошок', 'жидкость', 'пастилки', 'другое'] },
    serving_units: { type: 'integer', description: 'КЛЮЧЕВОЕ ПОЛЕ: сколько единиц (капсул/таблеток/мерных ложек) составляет ОДНУ порцию по инструкции. Часто 2-3 и более.' },
    servings_per_day: { type: 'integer', description: 'Сколько порций в день рекомендует производитель' },
    active_ingredients: {
      type: 'array',
      description: 'Активные вещества с дозой НА ОДНУ ПОРЦИЮ (не на одну капсулу, если порция больше одной единицы)',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Название вещества на русском' },
          amount_per_serving: { type: 'string', description: 'Доза на порцию с единицей измерения, напр. "400 мг", "5000 МЕ"' },
          amount_per_unit: { type: 'string', description: 'Доза на 1 капсулу/таблетку, если порция из нескольких единиц; иначе то же значение' },
        },
        required: ['name', 'amount_per_serving', 'amount_per_unit'],
        additionalProperties: false,
      },
    },
    timing: { type: 'string', enum: ['morning', 'day', 'evening'], description: 'Оптимальное время приёма по инструкции или свойствам веществ' },
    with_food: { type: 'boolean', description: 'Нужно ли принимать с едой' },
    note: { type: 'string', description: 'Краткая заметка: зачем добавка (до 6 слов)' },
    warnings: { type: 'string', description: 'Важные предупреждения с этикетки, если есть; иначе пустая строка' },
    label_readable: { type: 'boolean', description: 'false, если этикетку не удалось разобрать' },
  },
  required: ['name', 'brand', 'form', 'serving_units', 'servings_per_day', 'active_ingredients', 'timing', 'with_food', 'note', 'warnings', 'label_readable'],
  additionalProperties: false,
}

const PROMPT = `Ты — нутрициолог, который заводит БАДы в трекер приёма. На фото — этикетка добавки (лицевая и/или обратная сторона).

Извлеки данные строго по схеме. КРИТИЧЕСКИ ВАЖНО:
1. РАЗМЕР ПОРЦИИ (serving size): найди на этикетке, сколько капсул/таблеток составляет одну порцию ("Serving Size: 2 Capsules", "Рекомендации по применению: по 3 капсулы"). Очень часто порция — это 2, 3 и более единиц. Если порция не указана явно, выведи из инструкции по применению.
2. ДОЗЫ АКТИВНЫХ ВЕЩЕСТВ: в таблице состава (Supplement Facts / Состав) дозы обычно указаны НА ПОРЦИЮ, а не на одну капсулу. Укажи amount_per_serving как на этикетке, а amount_per_unit рассчитай делением на количество единиц в порции.
3. Если этикетка на английском — переведи названия веществ на русский, дозировки сохрани как есть.
4. Никогда не выдумывай данные: если чего-то не видно, ставь пустую строку, а при полностью нечитаемой этикетке — label_readable: false.`

// Определяем теги для движка взаимодействий по названиям веществ
const TAG_RULES = [
  [/магни|magnesium/i, 'magnesium'],
  [/желез|iron|ferr/i, 'iron'],
  [/аскорб|витамин\s*c\b|vitamin\s*c/i, 'vitc'],
  [/витамин\s*d|холекальциферол|cholecalciferol|\bd3\b/i, 'd3'],
  [/\bk2\b|менахинон|menaquinone/i, 'k2'],
  [/омега|рыбий жир|\bepa\b|\bdha\b|omega/i, 'omega3'],
  [/цинк|zinc/i, 'zinc'],
  [/кальци|calcium/i, 'calcium'],
  [/\bb12\b|\bb6\b|\bb1\b|тиамин|рибофлавин|ниацин|фолиев|биотин|b-компл|пантотен/i, 'bcomplex'],
  [/мелатонин|melatonin/i, 'melatonin'],
  [/пробиотик|lactobacillus|bifido/i, 'probiotic'],
  [/креатин|creatine/i, 'creatine'],
  [/ежовик|рейши|кордицепс|летипорус|чага|мухомор|гриб|mushroom|lion.?s mane|hericium|reishi|cordyceps/i, 'mushroom'],
]

export function inferTags(result) {
  const haystack = [result.name, ...(result.active_ingredients || []).map((i) => i.name)].join(' ')
  const tags = new Set()
  for (const [re, tag] of TAG_RULES) {
    if (re.test(haystack)) tags.add(tag)
  }
  return [...tags]
}

const FORM_SHORT = {
  'капсулы': 'капс', 'таблетки': 'таб', 'порошок': 'порц',
  'жидкость': 'порц', 'пастилки': 'шт', 'другое': 'ед',
}

// Собираем объект добавки для стека из результата распознавания
export function toSupplement(result) {
  const main = (result.active_ingredients || [])
    .map((i) => `${i.name} ${i.amount_per_serving}`)
    .slice(0, 3)
    .join(' + ')
  const unitsLabel = `${result.serving_units} ${FORM_SHORT[result.form] || 'ед'}`
  return {
    name: result.brand && !result.name.toLowerCase().includes(result.brand.toLowerCase())
      ? `${result.name} (${result.brand})`
      : result.name,
    dose: unitsLabel + (main ? ` · ${main}` : ''),
    slot: result.timing || 'morning',
    emoji: '📷',
    tags: inferTags(result),
    note: [result.note, result.with_food ? 'с едой' : null].filter(Boolean).join(' · '),
    serving: { units: result.serving_units, form: result.form, perDay: result.servings_per_day },
    ingredients: result.active_ingredients || [],
    warnings: result.warnings || '',
  }
}

export async function scanLabel(images, apiKey) {
  const content = images.map((data) => ({
    type: 'image',
    source: { type: 'base64', media_type: 'image/jpeg', data },
  }))
  content.push({ type: 'text', text: PROMPT })

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 2048,
      output_config: { format: { type: 'json_schema', schema: SCHEMA } },
      messages: [{ role: 'user', content }],
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const msg = body?.error?.message || `HTTP ${res.status}`
    if (res.status === 401) throw new Error('Неверный API-ключ. Проверьте ключ в настройках сканера.')
    if (res.status === 429) throw new Error('Слишком много запросов — подождите минуту и попробуйте снова.')
    throw new Error(`Ошибка распознавания: ${msg}`)
  }

  const data = await res.json()
  if (data.stop_reason === 'refusal') {
    throw new Error('Модель отклонила запрос. Попробуйте другое фото.')
  }
  const text = data.content?.find((b) => b.type === 'text')?.text
  if (!text) throw new Error('Пустой ответ от модели — попробуйте ещё раз.')

  const result = JSON.parse(text)
  if (result.label_readable === false) {
    throw new Error('Не удалось разобрать этикетку. Сфотографируйте ближе и при хорошем свете — особенно таблицу состава.')
  }
  return result
}
