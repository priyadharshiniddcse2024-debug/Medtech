import { AlertCircle, AlertTriangle, CheckCircle, Heart } from 'lucide-react'

const RISK_LEVEL_ICONS = {
  normal: CheckCircle,
  medium: AlertCircle,
  high: AlertTriangle
}

export const getRiskIcon = (riskLevel, size = 20) => {
  const Icon = RISK_LEVEL_ICONS[riskLevel?.toLowerCase()] || Heart
  return <Icon size={size} />
}
