import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function VolumeChart({ data }) {
  if (!data || data.length === 0) return null;

  // data = [[timestamp, volume], ...]
  const labels = data.map((d) => {
    const date = new Date(d[0]);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  const volumes = data.map((d) => d[1]);

  const chartData = {
    labels,
    datasets: [
      {
        data: volumes,
        backgroundColor: 'rgba(0, 229, 255, 0.25)',
        hoverBackgroundColor: 'rgba(0, 229, 255, 0.45)',
        borderColor: 'rgba(0, 229, 255, 0.5)',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10, 22, 40, 0.95)',
        titleColor: '#8899AA',
        bodyColor: '#E8ECF4',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: { family: 'Inter', size: 11 },
        bodyFont: { family: 'JetBrains Mono', size: 13 },
        displayColors: false,
        callbacks: {
          label: (ctx) => `$${ctx.parsed.y.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#556677',
          font: { family: 'Inter', size: 10 },
          maxTicksLimit: 7,
        },
        border: { display: false },
      },
      y: {
        position: 'right',
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: '#556677',
          font: { family: 'JetBrains Mono', size: 10 },
          callback: (val) => {
            if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
            if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
            if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
            return `$${val}`;
          },
          maxTicksLimit: 5,
        },
        border: { display: false },
      },
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
  };

  return <Bar data={chartData} options={options} />;
}
