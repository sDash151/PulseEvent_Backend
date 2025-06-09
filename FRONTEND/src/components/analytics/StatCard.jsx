// frontend/src/components/analytics/StatCard.jsx
const StatCard = ({ title, value, change, icon }) => {
  const isPositive = typeof change === 'string' ? change.includes('+') : change > 0
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600'
  const changeIcon = isPositive ? '▲' : '▼'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
      
      {change !== undefined && (
        <div className={`mt-2 flex items-center text-sm ${changeColor}`}>
          <span className="mr-1">{changeIcon}</span>
          <span>{change}</span>
        </div>
      )}
    </div>
  )
}

export default StatCard