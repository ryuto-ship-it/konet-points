import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function PriceChart({ data, sparkline = false }) {
  if (!data || data.length === 0) return null;

  // data = [[timestamp, price], ...]
  const labels = data.map((d) => {
    const date = new Date(d[0]);
    return sparkline
      ? ''
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  const prices = data.map((d) => d[1]);

  // Determine if price went up or down
  const isUp = prices[prices.length - 1] >= prices[0];
  const lineColor = isUp ? '#00DC82' : '#FF3366';
  const gradientColor = isUp ? 'rgba(0, 220, 130,' : 'rgba(255, 51, 102,';

  const chartData = {
    labels,
    datasets: [
      {
        data: prices,
        borderColor: lineColor,
        borderWidth: sparkline ? 1.5 : 2,
        pointRadius: 0,
        pointHoverRadius: sparkline ? 0 : 4,
        pointHoverBackgroundColor: lineColor,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        fill: true,
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const { ctx: canvasCtx, chartArea } = chart;
          if (!chartArea) return 'transparent';
          const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, `${gradientColor} 0.15)`);
          gradient.addColorStop(1, `${gradientColor} 0)`);
          return gradient;
        },
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: sparkline
        ? { enabled: false }
        : {
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
              label: (ctx) => `$${ctx.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`,
            },
          },
    },
    scales: {
      x: {
        display: !sparkline,
        grid: {
          display: false,
        },
        ticks: {
          color: '#556677',
          font: { family: 'Inter', size: 10 },
          maxTicksLimit: 7,
        },
        border: { display: false },
      },
      y: {
        display: !sparkline,
        position: 'right',
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
          drawBorder: false,
        },
        ticks: {
          color: '#556677',
          font: { family: 'JetBrains Mono', size: 10 },
          callback: (val) => `$${val.toLocaleString()}`,
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

  return <Line data={chartData} options={options} />;
}
