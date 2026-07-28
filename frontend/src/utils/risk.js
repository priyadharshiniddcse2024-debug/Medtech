// Shared colour palettes and labels for risk levels and symptom/condition severity.

export const RISK_LEVEL_THEME_COLORS = {
  normal: 'var(--success-color)',
  medium: 'var(--warning-color)',
  high: 'var(--danger-color)',
  default: 'var(--text-secondary)'
}

export const RISK_LEVEL_HEX_COLORS = {
  normal: '#48bb78',
  medium: '#ed8936',
  high: '#f56565',
  default: '#718096'
}

export const SEVERITY_HEX_COLORS = {
  low: '#48bb78',
  moderate: '#ed8936',
  high: '#f56565',
  default: '#718096'
}

export const SEVERITY_LABELS = {
  low: 'Mild',
  moderate: 'Moderate',
  high: 'Severe'
}

/**
 * @param {string} riskLevel Normal / Medium / High (case insensitive)
 * @param {'theme'|'hex'} palette CSS custom properties or literal hex values
 */
export const getRiskColor = (riskLevel, palette = 'theme') => {
  const colors = palette === 'hex' ? RISK_LEVEL_HEX_COLORS : RISK_LEVEL_THEME_COLORS
  return colors[riskLevel?.toLowerCase()] || colors.default
}

export const getSeverityColor = (severity) =>
  SEVERITY_HEX_COLORS[severity?.toLowerCase()] || SEVERITY_HEX_COLORS.default

/** Map a 1-5 symptom severity score onto a severity name */
export const severityFromScore = (score) => {
  if (score <= 2) return 'low'
  if (score <= 4) return 'moderate'
  return 'high'
}

export const getSeverityColorForScore = (score) => getSeverityColor(severityFromScore(score))

export const getSeverityLabelForScore = (score) => SEVERITY_LABELS[severityFromScore(score)]
