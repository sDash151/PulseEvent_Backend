const StatCard = ({ title, value, change, icon }) => {
  const isPositive = typeof change === 'string' ? change.includes('+') : change > 0
  const changeColor = isPositive ? 'text-green-400' : 'text-red-400'
  const changeIcon = isPositive ? '▲' : '▼'

  return (
    <div className="rounded-2xl p-5 bg-white/5 backdrop-blur-md shadow-lg border border-white/10 transition-all hover:shadow-xl hover:scale-[1.02] duration-300">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
          <p className="mt-1 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="text-3xl text-amber-400">{icon}</div>
      </div>

      {change !== undefined && (
        <div className={`mt-3 flex items-center text-sm font-medium ${changeColor}`}>
          <span className="mr-1">{changeIcon}</span>
          <span>{change}</span>
        </div>
      )}
    </div>
  )
}

export default StatCard
