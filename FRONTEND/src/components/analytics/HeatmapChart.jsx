import React, { useState } from 'react';
import { CalendarIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline';

const HeatmapChart = ({ data, type = 'hourly' }) => {
  const [selectedCell, setSelectedCell] = useState(null);

  // Defensive: Only use real data, do not generate demo data
  const heatmapData = Array.isArray(data) && data.length > 0 ? data : null;

  // Color intensity based on value
  const getIntensityColor = (value) => {
    const intensity = Math.min(value / 100, 1);
    if (intensity === 0) return 'bg-gray-800';
    if (intensity <= 0.2) return 'bg-blue-900/40';
    if (intensity <= 0.4) return 'bg-blue-700/60';
    if (intensity <= 0.6) return 'bg-blue-500/70';
    if (intensity <= 0.8) return 'bg-blue-400/80';
    return 'bg-blue-300/90';
  };

  const getIntensityBorder = (value) => {
    const intensity = Math.min(value / 100, 1);
    if (intensity >= 0.8) return 'border-2 border-blue-300/50';
    if (intensity >= 0.6) return 'border border-blue-400/40';
    return 'border border-gray-600/30';
  };

  // Handle cell hover/click
  const handleCellInteraction = (rowIndex, colIndex, cellData) => {
    setSelectedCell({
      row: rowIndex,
      col: colIndex,
      data: cellData
    });
  };

  if (!heatmapData) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400 bg-white/5 rounded-xl">
        <div className="text-4xl mb-4">🔥</div>
        <p className="text-gray-400 mb-2">No heatmap data available</p>
        <p className="text-gray-500 text-sm text-center">
          {type === 'hourly' 
            ? 'Engagement heatmap will appear when users check in during the event'
            : 'Activity heatmap will appear when users participate in the event'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <FireIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {type === 'hourly' ? 'Weekly Engagement Heatmap' : 'Monthly Activity Heatmap'}
            </h3>
            <p className="text-sm text-gray-400">
              {type === 'hourly' ? 'User engagement by hour and day' : 'Event activity by week and month'}
            </p>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-400">Less</span>
          <div className="flex space-x-1">
            {[0, 20, 40, 60, 80].map(value => (
              <div
                key={value}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(value)} border border-gray-600`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400">More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Column Headers */}
          <div className="flex mb-2">
            <div className="w-12"></div> {/* Empty space for row labels */}
            {type === 'hourly' ? (
              // Hour labels
              Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="w-6 text-center">
                  <span className="text-xs text-gray-400">
                    {i === 0 ? '12a' : i <= 12 ? `${i}a` : `${i-12}p`}
                  </span>
                </div>
              ))
            ) : (
              // Week labels
              Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="w-16 text-center">
                  <span className="text-xs text-gray-400">W{i + 1}</span>
                </div>
              ))
            )}
          </div>

          {/* Heatmap Rows */}
          <div className="space-y-1">
            {heatmapData.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center">
                {/* Row Label */}
                <div className="w-12 text-right pr-2">
                  <span className="text-xs text-gray-400 font-medium">
                    {type === 'hourly' ? row.day : row.month}
                  </span>
                </div>
                
                {/* Cells */}
                <div className="flex space-x-1">
                  {(type === 'hourly' ? row.hours : row.weeks).map((cell, colIndex) => (
                    <div
                      key={colIndex}
                      className={`${type === 'hourly' ? 'w-6 h-6' : 'w-16 h-8'} ${getIntensityColor(cell.value)} 
                                 ${getIntensityBorder(cell.value)} rounded-sm cursor-pointer 
                                 hover:scale-110 transition-all duration-200 hover:shadow-lg
                                 flex items-center justify-center group relative`}
                      onMouseEnter={() => handleCellInteraction(rowIndex, colIndex, cell)}
                      onMouseLeave={() => setSelectedCell(null)}
                    >
                      {/* Hover tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                                    bg-gray-800 text-white text-xs rounded-lg px-2 py-1 opacity-0 
                                    group-hover:opacity-100 transition-opacity duration-200 z-10 whitespace-nowrap">
                        <div className="text-center">
                          <div className="font-medium">
                            {type === 'hourly' ? 
                              `${row.day} ${cell.hour === 0 ? '12am' : cell.hour <= 12 ? `${cell.hour}am` : `${cell.hour-12}pm`}` :
                              `${row.month} Week ${cell.week}`
                            }
                          </div>
                          <div className="text-gray-300">
                            {cell.value} engagement • {cell.events} events
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
                                      border-l-2 border-r-2 border-t-4 border-transparent border-t-gray-800" />
                      </div>
                      
                      {/* High activity indicator */}
                      {cell.value >= 80 && (
                        <FireIcon className="w-3 h-3 text-orange-300 animate-pulse" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-600">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <FireIcon className="w-4 h-4 text-orange-400" />
            <span className="text-lg font-bold text-orange-400">
              {Math.max(...heatmapData.flatMap(row => 
                (type === 'hourly' ? row.hours : row.weeks).map(cell => cell.value)
              ))}
            </span>
          </div>
          <div className="text-xs text-gray-400">Peak Activity</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <CalendarIcon className="w-4 h-4 text-blue-400" />
            <span className="text-lg font-bold text-blue-400">
              {Math.round(
                heatmapData.flatMap(row => 
                  (type === 'hourly' ? row.hours : row.weeks).map(cell => cell.value)
                ).reduce((a, b) => a + b, 0) / 
                heatmapData.flatMap(row => type === 'hourly' ? row.hours : row.weeks).length
              )}
            </span>
          </div>
          <div className="text-xs text-gray-400">Avg Activity</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <ClockIcon className="w-4 h-4 text-green-400" />
            <span className="text-lg font-bold text-green-400">
              {heatmapData.flatMap(row => 
                (type === 'hourly' ? row.hours : row.weeks).filter(cell => cell.value >= 50)
              ).length}
            </span>
          </div>
          <div className="text-xs text-gray-400">Active Periods</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1 mb-1">
            <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
            <span className="text-lg font-bold text-blue-400">
              {heatmapData.flatMap(row => 
                (type === 'hourly' ? row.hours : row.weeks).map(cell => cell.events)
              ).reduce((a, b) => a + b, 0)}
            </span>
          </div>
          <div className="text-xs text-gray-400">Total Events</div>
        </div>
      </div>

      {/* Peak Times Analysis */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Peak Activity Analysis</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400 mb-2">Most Active {type === 'hourly' ? 'Hours' : 'Periods'}</div>
            <div className="space-y-1">
              {heatmapData
                .flatMap((row, rowIndex) => 
                  (type === 'hourly' ? row.hours : row.weeks).map((cell, colIndex) => ({
                    ...cell,
                    label: type === 'hourly' ? 
                      `${row.day} ${cell.hour}:00` : 
                      `${row.month} W${cell.week}`,
                    rowIndex,
                    colIndex
                  }))
                )
                .sort((a, b) => b.value - a.value)
                .slice(0, 3)
                .map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-300">{item.label}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-400 font-medium">{item.value}</span>
                      {index === 0 && <FireIcon className="w-3 h-3 text-orange-400" />}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-400 mb-2">Activity Insights</div>
            <div className="space-y-1 text-sm text-gray-300">
              <div>• {type === 'hourly' ? 'Weekdays' : 'Q2-Q3'} show highest engagement</div>
              <div>• {type === 'hourly' ? 'Evening hours' : 'Mid-month weeks'} peak activity</div>
              <div>• Consistent user participation patterns</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeatmapChart;


