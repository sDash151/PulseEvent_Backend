const KeywordCloud = ({ keywords }) => {
  // Handle empty or same-count cases
  if (!keywords || keywords.length === 0) return <p className="text-center text-gray-400">No keywords to display.</p>

  const counts = keywords.map(k => k.count)
  const minCount = Math.min(...counts)
  const maxCount = Math.max(...counts)
  const scale = (count) => {
    if (maxCount === minCount) return 1 // Prevent divide by zero
    return 0.9 + ((count - minCount) / (maxCount - minCount)) * 1.6
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 py-6 px-2 rounded-xl bg-white/5 backdrop-blur-md shadow-lg">
      {keywords.map((keyword, index) => (
        <span 
          key={index}
          className="inline-block px-3 py-1 rounded-full text-sm font-semibold text-amber-400 hover:text-amber-300 transition transform hover:scale-105"
          style={{ 
            fontSize: `${scale(keyword.count)}rem`,
            opacity: 0.8 + (0.2 * (keyword.count - minCount) / (maxCount - minCount || 1))
          }}
        >
          {keyword.word} <span className="text-xs text-gray-400">({keyword.count})</span>
        </span>
      ))}
    </div>
  )
}

export default KeywordCloud
