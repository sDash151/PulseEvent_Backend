import React from 'react';
import { UserGroupIcon, CalendarIcon, CheckCircleIcon, TrophyIcon } from '@heroicons/react/24/outline';

const EngagementFunnelChart = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 bg-white/5 rounded-xl">
        No funnel data available
      </div>
    );
  }

  // Calculate conversion rates
  const stages = [
    {
      name: 'Invitations Sent',
      count: data.invited,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      percentage: 100
    },
    {
      name: 'Registered',
      count: data.registered,
      icon: CalendarIcon,
      color: 'bg-green-500',
      percentage: Math.round((data.registered / data.invited) * 100)
    },
    {
      name: 'Checked In',
      count: data.checkedIn,
      icon: CheckCircleIcon,
      color: 'bg-yellow-500',
      percentage: Math.round((data.checkedIn / data.invited) * 100)
    },
    {
      name: 'Completed Event',
      count: data.completed,
      icon: TrophyIcon,
      color: 'bg-purple-500',
      percentage: Math.round((data.completed / data.invited) * 100)
    }
  ];

  const maxCount = Math.max(...stages.map(stage => stage.count));

  return (
    <div className="space-y-4">
      {/* Funnel Visualization */}
      <div className="relative">
        {stages.map((stage, index) => {
          const width = (stage.count / maxCount) * 100;
          const Icon = stage.icon;
          
          return (
            <div key={stage.name} className="mb-3 last:mb-0">
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 ${stage.color} rounded-lg flex items-center justify-center opacity-80`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-200">{stage.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-white">{stage.count}</span>
                  <span className="text-sm text-gray-400">({stage.percentage}%)</span>
                </div>
              </div>
              
              {/* Funnel Bar */}
              <div className="relative h-8 bg-gray-700/30 rounded-lg overflow-hidden backdrop-blur-sm">
                <div
                  className={`h-full ${stage.color} opacity-70 transition-all duration-700 ease-out rounded-lg`}
                  style={{ width: `${width}%` }}
                >
                  <div className={`h-full ${stage.color} opacity-30 animate-pulse`} />
                </div>
                
                {/* Glow effect */}
                <div
                  className={`absolute top-0 left-0 h-full ${stage.color} opacity-20 blur-sm`}
                  style={{ width: `${width}%` }}
                />
              </div>
              
              {/* Conversion Rate (between stages) */}
              {index > 0 && (
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-500">
                    {Math.round((stage.count / stages[index - 1].count) * 100)}% conversion from previous
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-600">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {Math.round((data.registered / data.invited) * 100)}%
          </div>
          <div className="text-xs text-gray-400">Registration Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {Math.round((data.completed / data.registered) * 100)}%
          </div>
          <div className="text-xs text-gray-400">Completion Rate</div>
        </div>
      </div>

      {/* Drop-off Analysis */}
      <div className="bg-gray-800/30 rounded-lg p-4 mt-4">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Drop-off Analysis</h4>
        <div className="space-y-2">
          {stages.slice(1).map((stage, index) => {
            const prevStage = stages[index];
            const dropOff = prevStage.count - stage.count;
            const dropOffPercentage = Math.round((dropOff / prevStage.count) * 100);
            
            return (
              <div key={`dropoff-${index}`} className="flex justify-between items-center text-sm">
                <span className="text-gray-400">
                  {prevStage.name} → {stage.name}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-red-400">-{dropOff}</span>
                  <span className="text-gray-500">({dropOffPercentage}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EngagementFunnelChart;


