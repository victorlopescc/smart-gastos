import { useContext } from 'react'
import { ReportsContext } from '../contexts/ReportsContext'

export const useReports = () => {
  const context = useContext(ReportsContext)
  if (context === undefined) {
    throw new Error('useReports must be used within a ReportsProvider')
  }
  return context
}
