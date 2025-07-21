const KeywordCloud = ({ keywords }) => {
  // Handle empty or invalid data
  if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-white/5 backdrop-blur-md shadow-lg">
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-center text-gray-400 mb-2">No keywords to display</p>
        <p className="text-center text-gray-500 text-sm">Keywords will appear here when users provide text feedback</p>
      </div>
    )
  }

  // Filter out keywords with very low counts or invalid data
  const validKeywords = keywords.filter(k => k && k.word && k.count && k.count > 0);
  
  if (validKeywords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-white/5 backdrop-blur-md shadow-lg">
        <div className="text-4xl mb-4">📝</div>
        <p className="text-center text-gray-400 mb-2">No significant keywords found</p>
        <p className="text-center text-gray-500 text-sm">Keywords need multiple mentions to appear</p>
      </div>
    )
  }

  const counts = validKeywords.map(k => k.count)
  const minCount = Math.min(...counts)
  const maxCount = Math.max(...counts)
  const scale = (count) => {
    if (maxCount === minCount) return 1.2 // Prevent divide by zero, minimum size
    return 0.9 + ((count - minCount) / (maxCount - minCount)) * 1.6
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 py-6 px-2 rounded-xl bg-white/5 backdrop-blur-md shadow-lg">
      {validKeywords.map((keyword, index) => (
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
