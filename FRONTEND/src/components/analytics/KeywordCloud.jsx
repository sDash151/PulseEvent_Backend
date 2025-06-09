// frontend/src/components/analytics/KeywordCloud.jsx
const KeywordCloud = ({ keywords }) => {
  // Scale the keywords based on count
  const minCount = Math.min(...keywords.map(k => k.count))
  const maxCount = Math.max(...keywords.map(k => k.count))
  const scale = (count) => {
    return 0.7 + (count - minCount) / (maxCount - minCount) * 1.3
  }

  return (
    <div className="flex flex-wrap justify-center gap-4 py-4">
      {keywords.map((keyword, index) => (
        <span 
          key={index}
          className="inline-block px-4 py-2 rounded-full bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors"
          style={{ 
            fontSize: `${scale(keyword.count)}rem`,
            opacity: 0.8 + (0.2 * (keyword.count - minCount) / (maxCount - minCount))
          }}
        >
          {keyword.word} ({keyword.count})
        </span>
      ))}
    </div>
  )
}

export default KeywordCloud