import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const AttendanceChart = ({ data }) => {
  // Calculate totals from the data
  const totalRegistered = data && data.length > 0 ? Math.max(...data.map(item => item.registered || 0)) : 0;
  const totalFeedback = data && data.length > 0 ? Math.max(...data.map(item => item.feedback || 0)) : 0;
  
  console.log('📈 AttendanceChart received data:', data);
  console.log('📊 Calculated totals:', { totalRegistered, totalFeedback });
  
  const chartData = {
    labels: ['Registered Users', 'Users with Feedback'],
    datasets: [
      {
        label: 'User Count',
        data: [totalRegistered, totalFeedback],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)', // green-500
          'rgba(245, 158, 11, 0.8)'   // amber-500
        ],
        borderColor: [
          '#10B981', // green-500
          '#F59E0B'  // amber-500
        ],
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 60,
      }
    ]
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1c1c2b',
        titleColor: '#facc15',
        bodyColor: '#e5e7eb',
        borderColor: '#facc15',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const percentage = totalRegistered > 0 ? Math.round((value / totalRegistered) * 100) : 0;
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#a1a1aa',
          font: { size: 14, weight: 'bold' }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255,255,255,0.08)'
        },
        ticks: {
          color: '#a1a1aa',
          precision: 0,
          font: { size: 14 }
        }
      }
    }
  }

  return (
    <div className="h-80 rounded-xl bg-white/5 backdrop-blur-lg p-4">
      <Bar data={chartData} options={options} />
      
      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{totalRegistered}</div>
          <div className="text-sm text-gray-400">Total Registered</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400">{totalFeedback}</div>
          <div className="text-sm text-gray-400">Gave Feedback</div>
        </div>
      </div>
      
      {/* Participation Rate */}
      {totalRegistered > 0 && (
        <div className="mt-4 text-center">
          <div className="text-lg font-semibold text-white">
            {Math.round((totalFeedback / totalRegistered) * 100)}% Participation Rate
          </div>
          <div className="text-sm text-gray-400">
            {totalRegistered - totalFeedback} users registered but didn't give feedback
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceChart
