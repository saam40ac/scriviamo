'use client'

interface StatCardProps {
  label: string
  value: number
  icon: 'book' | 'check' | 'document' | 'microphone'
  color: 'primary' | 'success' | 'accent' | 'warning'
  format?: 'number'
}

const icons = {
  book: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  check: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  document: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  microphone: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-green-100 text-green-600',
  accent: 'bg-accent/10 text-accent',
  warning: 'bg-amber-100 text-amber-600',
}

export default function StatCard({ label, value, icon, color, format }: StatCardProps) {
  const formatValue = (val: number) => {
    if (format === 'number' && val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`
    }
    return val.toLocaleString('it-IT')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-primary/30 hover:shadow-card transition-all">
      <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icons[icon]}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {formatValue(value)}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}
