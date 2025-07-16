const TabGroup = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex border-b border-white/10 ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 
            ${
              activeTab === tab.id
                ? 'text-amber-400'
                : 'text-gray-400 hover:text-white'
            }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full shadow-sm animate-pulse"></div>
          )}
        </button>
      ))}
    </div>
  )
}

export default TabGroup
