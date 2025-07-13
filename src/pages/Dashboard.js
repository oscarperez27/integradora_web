import React, { useState, useEffect } from "react";
import {
  MdPeople,
  MdReportProblem,
} from "react-icons/md";
import { FaBoxOpen, FaThermometerHalf } from "react-icons/fa";
import "./Dashboard.css";

// WidgetCard for dashboard widgets (simple, reusable)
function WidgetCard({ title, icon, children }) {
  return (
    <div className="widget-card">
      <div className="widget-card-header">
        {icon}
        <span className="widget-card-title">{title}</span>
      </div>
      <div className="widget-card-content">{children}</div>
    </div>
  );
}

const Dashboard = () => {
  const [alerts, setAlerts] = useState([
    { id: "a1", type: "danger", text: "Temperatura alta", detail: "Zona Cardio" },
    { id: "a2", type: "warning", text: "Stock bajo", detail: "Proteína Whey" },
    { id: "a3", type: "info", text: "Sensor de Puerta Principal Offline", detail: "" },
  ]);

  const [accessData, setAccessData] = useState({
    currentPeople: 127,
    totalAccessesToday: 350,
  });

  const [environmentData, setEnvironmentData] = useState({
    avgTemp: "23°C",
    avgHumidity: "55%",
    status: "Todos los valores en rango.",
    statusType: "ok",
  });

  const [inventoryData, setInventoryData] = useState({
    lowStockProducts: 3,
    productsToReview: ["Proteína Whey", "Barritas Energéticas", "Creatina"],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Aquí podrías actualizar datos desde una API
      // Ejemplo: fetchDatosDashboard();
      // console.log('Actualizando datos del dashboard...');
    }, 50000);
    return () => clearInterval(interval);
  }, []);

  // Colores para tipos de alertas y estado de ambiente
  const statusColor = {
    ok: "#27ae60",
    warning: "#f39c12",
    danger: "#D90429",
    info: "#3498db",
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard General</h1>
      <div className="widgets-grid">

        {/* Widget de Alertas */}
        <WidgetCard
          title="Alertas Importantes"
          icon={<MdReportProblem size={28} color="#D90429" />}
        >
          <div className="alert-list">
            {alerts.map(alert => (
              <div className="alert-item" key={alert.id}>
                <span
                  className={`alert-text`}
                  style={{ color: statusColor[alert.type] || "#333" }}
                >
                  {alert.text}
                  {alert.detail && (
                    <span className="alert-detail-text"> - {alert.detail}</span>
                  )}
                </span>
              </div>
            ))}
            {alerts.length === 0 && (
              <span className="alert-text" style={{ color: "#27ae60" }}>
                Sin alertas
              </span>
            )}
          </div>
        </WidgetCard>

        {/* Widget de Accesos */}
        <WidgetCard
          title="Accesos Hoy"
          icon={<MdPeople size={28} color="#3498db" />}
        >
          <div className="widget-data-container">
            <span className="widget-value">{accessData.currentPeople}</span>
            <span className="widget-label">Personas Actualmente</span>
          </div>
          <div className="widget-data-container">
            <span className="widget-value">{accessData.totalAccessesToday}</span>
            <span className="widget-label">Total Accesos del Día</span>
          </div>
        </WidgetCard>

        {/* Widget de Ambiente */}
        <WidgetCard
          title="Ambiente General"
          icon={<FaThermometerHalf size={26} color="#27ae60" />}
        >
          <div className="widget-data-container">
            <span className="widget-value">{environmentData.avgTemp}</span>
            <span className="widget-label">Temperatura Promedio</span>
          </div>
          <div className="widget-data-container">
            <span className="widget-value">{environmentData.avgHumidity}</span>
            <span className="widget-label">Humedad Promedio</span>
          </div>
          <div className="status-container">
            <span
              className="status-text"
              style={{ color: statusColor[environmentData.statusType] || "#333" }}
            >
              {environmentData.status}
            </span>
          </div>
        </WidgetCard>

        {/* Widget de Inventario */}
        <WidgetCard
          title="Inventario Crítico"
          icon={<FaBoxOpen size={24} color="#f39c12" />}
        >
          <div className="widget-data-container">
            <span className="widget-value">{inventoryData.lowStockProducts}</span>
            <span className="widget-label">Productos con Stock Bajo</span>
          </div>
          <div className="inventory-list">
            <span className="widget-text">
              Revisar: {inventoryData.productsToReview.join(", ")}
            </span>
          </div>
        </WidgetCard>
      </div>
    </div>
  );
};

export default Dashboard;