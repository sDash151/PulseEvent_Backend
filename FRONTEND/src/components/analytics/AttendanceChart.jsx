import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const AttendanceChart = ({ data }) => {
  const chartData = {
    labels: data.map(item =>
      new Date(item.hour).toLocaleTimeString([], { hour: '2-digit' })
    ),
    datasets: [
      {
        label: 'Feedback Activity',
        data: data.map(item => item.count),
        borderColor: '#facc15', // amber-400
        backgroundColor: 'rgba(250, 204, 21, 0.15)',
        borderWidth: 2,
        pointBackgroundColor: '#facc15',
        pointBorderColor: '#0f0c29',
        pointBorderWidth: 2,
        pointRadius: 5,
        tension: 0.35,
        fill: true
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
        padding: 10,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (tooltipItems) => `Hour: ${tooltipItems[0].label}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#a1a1aa' // gray-400
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255,255,255,0.1)' // subtle glassy lines
        },
        ticks: {
          color: '#a1a1aa',
          precision: 0
        }
      }
    }
  }

  return (
    <div className="h-80 rounded-xl bg-white/5 backdrop-blur-lg p-4">
      <Line data={chartData} options={options} />
    </div>
  )
}

export default AttendanceChart
