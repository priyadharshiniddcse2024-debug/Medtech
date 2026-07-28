// Shared state, validation and payload building for the health parameter forms.

export const HEALTH_FORM_FIELDS = [
  'systolic_bp',
  'diastolic_bp',
  'blood_sugar',
  'body_weight',
  'hemoglobin',
  'heart_rate',
  'protein_urine',
  'age',
  'gestational_week'
]

export const createEmptyHealthForm = () =>
  HEALTH_FORM_FIELDS.reduce((form, field) => ({ ...form, [field]: '' }), {})

const RULES = [
  { field: 'systolic_bp', parse: parseInt, min: 80, max: 200, message: 'Systolic blood pressure should be between 80-200 mmHg', required: true },
  { field: 'diastolic_bp', parse: parseInt, min: 50, max: 120, message: 'Diastolic blood pressure should be between 50-120 mmHg', required: true },
  { field: 'blood_sugar', parse: parseFloat, min: 60, max: 300, message: 'Blood sugar should be between 60-300 mg/dL', required: true },
  { field: 'body_weight', parse: parseFloat, min: 40, max: 150, message: 'Body weight should be between 40-150 kg', required: true },
  { field: 'hemoglobin', parse: parseFloat, min: 6, max: 18, message: 'Hemoglobin should be between 6-18 g/dL', required: true },
  { field: 'heart_rate', parse: parseInt, min: 50, max: 150, message: 'Heart rate should be between 50-150 bpm' },
  { field: 'age', parse: parseInt, min: 16, max: 45, message: 'Age should be between 16-45 years' },
  { field: 'gestational_week', parse: parseInt, min: 1, max: 42, message: 'Gestational week should be between 1-42 weeks' }
]

/**
 * Validate a health entry form.
 * @returns {string|null} the first validation error, or null when the form is valid
 */
export const validateHealthForm = (formData) => {
  for (const { field, parse, min, max, message, required } of RULES) {
    const rawValue = formData[field]
    if (!required && !rawValue) continue

    const value = parse(rawValue)
    if (value < min || value > max) return message
  }

  return null
}

// Applied when an optional parameter is left blank
export const OPTIONAL_PARAM_DEFAULTS = {
  heart_rate: 75,
  protein_urine: 0.1,
  age: 28,
  gestational_week: 20
}

export const buildHealthRecordPayload = (formData) => ({
  systolic_bp: parseInt(formData.systolic_bp),
  diastolic_bp: parseInt(formData.diastolic_bp),
  blood_sugar: parseFloat(formData.blood_sugar),
  body_weight: parseFloat(formData.body_weight),
  hemoglobin: parseFloat(formData.hemoglobin),
  heart_rate: formData.heart_rate ? parseInt(formData.heart_rate) : OPTIONAL_PARAM_DEFAULTS.heart_rate,
  protein_urine: formData.protein_urine ? parseFloat(formData.protein_urine) : OPTIONAL_PARAM_DEFAULTS.protein_urine,
  age: formData.age ? parseInt(formData.age) : OPTIONAL_PARAM_DEFAULTS.age,
  gestational_week: formData.gestational_week
    ? parseInt(formData.gestational_week)
    : OPTIONAL_PARAM_DEFAULTS.gestational_week
})

/**
 * Read health parameters supplied as query string parameters, e.g. for manual testing.
 * @returns {object|null} the supplied values, or null when none are present
 */
export const readHealthParamsFromUrl = (search = window.location.search, fields = HEALTH_FORM_FIELDS) => {
  const urlParams = new URLSearchParams(search)
  const values = {}

  fields.forEach((field) => {
    const value = urlParams.get(field)
    if (value) values[field] = value
  })

  return Object.keys(values).length > 0 ? values : null
}
