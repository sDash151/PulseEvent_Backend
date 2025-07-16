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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const EmojiChart = ({ emojis }) => {
  const chartData = {
    labels: emojis.map(e => e.emoji),
    datasets: [
      {
        label: 'Usage Count',
        data: emojis.map(e => e.count),
        backgroundColor: 'rgba(253, 224, 71, 0.35)', // soft golden yellow (amber-300)
        borderColor: '#fbbf24', // richer amber (amber-400)
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 28,
        hoverBackgroundColor: 'rgba(251, 191, 36, 0.6)', // deeper on hover
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
        callbacks: {
          label: (context) => `Count: ${context.raw}`
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
          color: 'rgba(255, 255, 255, 0.08)' // soft glass grid lines
        },
        ticks: {
          precision: 0,
          color: '#a1a1aa'
        }
      }
    }
  }

  return (
    <div className="h-80 rounded-xl bg-white/5 backdrop-blur-md p-4 shadow-xl">
      <Bar data={chartData} options={options} />
    </div>
  )
}

export default EmojiChart
