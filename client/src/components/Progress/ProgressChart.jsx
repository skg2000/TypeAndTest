import {
  Line
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function ProgressChart({ results }) {
  const labels = results.map((r) =>
    new Date(r.createdAt).toLocaleDateString()
  );

  const data = {
    labels,
    datasets: [
      {
        label: "WPM",
        data: results.map((r) => r.wpm),
        borderWidth: 2,
      },
      {
        label: "Accuracy",
        data: results.map((r) => r.accuracy),
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="chart-container">
      <Line data={data} />
    </div>
  );
}

export default ProgressChart;