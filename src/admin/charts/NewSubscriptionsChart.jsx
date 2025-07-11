import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
// import Card from "../../shared/Card";
import { PuffLoader } from "react-spinners";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const NewSubscriptionsChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Nuevas Suscripciones",
        data: [],
        borderColor: "#009ee3",
        backgroundColor: "rgba(0, 158, 227, 0.1)",
        tension: 0.3,
        borderWidth: 3,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#009ee3",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        fill: true,
      },
    ],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos - reemplazar con llamada real al API
    const fetchData = async () => {
      setLoading(true);
      
      // Datos simulados
      const simulatedData = {
        labels: [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ],
        values: [23, 45, 38, 52, 67, 43, 58, 71, 49, 63, 55, 78]
      };

      setTimeout(() => {
        setChartData({
          labels: simulatedData.labels,
          datasets: [
            {
              label: "Nuevas Suscripciones",
              data: simulatedData.values,
              borderColor: "#009ee3",
              backgroundColor: "rgba(0, 158, 227, 0.1)",
              tension: 0.3,
              borderWidth: 3,
              pointBackgroundColor: "#fff",
              pointBorderColor: "#009ee3",
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 8,
              fill: true,
            },
          ],
        });
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "category",
        title: {
          display: true,
          text: "Mes",
          font: {
            size: 14,
            weight: "bold",
          },
          color: "#666",
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "#666",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Número de Suscripciones",
          font: {
            size: 14,
            weight: "bold",
          },
          color: "#666",
        },
        grid: {
          color: "rgba(0, 158, 227, 0.1)",
        },
        ticks: {
          color: "#666",
          stepSize: 10,
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 15,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 12,
            weight: "500",
          },
          color: "#666",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 13,
        },
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#009ee3",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            return `Nuevas suscripciones: ${context.parsed.y}`;
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    elements: {
      point: {
        hoverBackgroundColor: "#009ee3",
        hoverBorderColor: "#fff",
        hoverBorderWidth: 3,
      },
    },
  };

  return (
    <div className="new-subscriptions-chart">
      <div className="chart-card">
        <div className="chart-header">
          <h5 style={{ color: "#009ee3" }}>
            Número de Nuevas Suscripciones por Mes
          </h5>
        </div>
        
        <div className="chart-container">
          {loading ? (
            <div className="loader-container">
              <PuffLoader
                color="#009ee3"
                loading={true}
                size={60}
                margin={2}
                speedMultiplier={4}
              />
            </div>
          ) : (
            <Line data={chartData} options={options} height={400} />
          )}
        </div>
      </div>
    </div>
  );
};

export default NewSubscriptionsChart;