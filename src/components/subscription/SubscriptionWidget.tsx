import React from 'react'
import { SubscriptionStatus } from './SubscriptionStatus'

export const SubscriptionWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return <SubscriptionStatus compact={compact} />
}
