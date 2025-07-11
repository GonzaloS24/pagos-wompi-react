import { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { PuffLoader } from "react-spinners";

ChartJS.register(ArcElement, Tooltip, Legend);

const PlansDistributionChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 2,
        hoverBorderWidth: 3,
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
          "Chatea Pro Start", 
          "Chatea Pro Advanced", 
          "Chatea Pro Plus", 
          "Chatea Pro Master"
        ],
        values: [45, 28, 18, 9],
        colors: [
          "#009ee3",
          "#20c997", 
          "#fd7e14",
          "#6f42c1"
        ]
      };

      setTimeout(() => {
        setChartData({
          labels: simulatedData.labels,
          datasets: [
            {
              data: simulatedData.values,
              backgroundColor: simulatedData.colors.map(color => color + "CC"), // Añadir transparencia
              borderColor: simulatedData.colors,
              borderWidth: 2,
              hoverBorderWidth: 3,
              hoverBackgroundColor: simulatedData.colors,
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
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 11,
            weight: "500",
          },
          color: "#666",
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 13,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#009ee3",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "50%", // Para hacer el gráfico tipo doughnut
    elements: {
      arc: {
        borderRadius: 4,
      },
    },
  };

  return (
    <div className="plans-distribution-chart">
      <div className="chart-card">
        <div className="chart-header">
          <h5 style={{ color: "#009ee3" }}>
            Distribución de Suscripciones por Plan
          </h5>
        </div>
        
        <div className="chart-container chart-container-circular">
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
            <Doughnut data={chartData} options={options} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PlansDistributionChart;