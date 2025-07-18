import React, { useState, useEffect, useCallback } from "react";
import {
  MdPeople,
  MdReportProblem,
} from "react-icons/md";
import { FaBoxOpen, FaThermometerHalf } from "react-icons/fa";
import "./Dashboard.css";
import API from "../config/api";

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
  const [alerts, setAlerts] = useState([]);
  const [accessData, setAccessData] = useState({
    currentPeople: 0,
    totalAccessesToday: 0,
  });
  const [environmentData, setEnvironmentData] = useState({
    avgTemp: "--",
    avgHumidity: "--",
    status: "Cargando...",
    statusType: "info",
  });
  const [inventoryData, setInventoryData] = useState({
    lowStockProducts: 0,
    productsToReview: [],
  });

  const token = localStorage.getItem("token");

  const getTodayDates = () => {
  const now = new Date();
  now.setDate(now.getDate() - 1); // restar un día para probar
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  return {
    startDate: `${yyyy}-${mm}-${dd}`,
    endDate: `${yyyy}-${mm}-${dd}`,
  };
};

  const updateAlerts = (newAlerts) => {
    setAlerts(prev => {
      // Filtrar alertas con mismos ids para evitar duplicados
      const filtered = prev.filter(
        alert => !newAlerts.some(newAlert => newAlert.id === alert.id)
      );
      return [...filtered, ...newAlerts];
    });
  };

  const fetchPeopleCount = useCallback(async () => {
  try {
    const res = await fetch(`${API}/api/sensor/people-count?timestamp=${Date.now()}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store", // opción para evitar cache
    });
    const data = await res.json();

    setAccessData({
      currentPeople: data.conteoActual ?? 0,
      totalAccessesToday: data.entradas ?? 0,
    });
  } catch (err) {
    console.error("Error en people-count:", err);
  }
}, [token]);

  const fetchTemperature = useCallback(async () => {
  const { startDate, endDate } = getTodayDates();
  try {
    const res = await fetch(
      `${API}/api/sensor/temperature?startDate=${startDate}&endDate=${endDate}&timestamp=${Date.now()}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    const data = await res.json();
    // resto igual...
  } catch (err) {
    console.error("Error en temperatura:", err);
  }
}, [token]);

const fetchHumidity = useCallback(async () => {
  const { startDate, endDate } = getTodayDates();
  try {
    const res = await fetch(
      `${API}/api/sensor/humidity?startDate=${startDate}&endDate=${endDate}&timestamp=${Date.now()}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    const data = await res.json();
    // resto igual...
  } catch (err) {
    console.error("Error en humedad:", err);
  }
}, [token]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/product/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const lowStock = data.filter(p => p.stock <= 5 && p.status === true);

      setInventoryData({
        lowStockProducts: lowStock.length,
        productsToReview: lowStock.map(p => p.name),
      });

      setAlerts(prev => {
        const nonStockAlerts = prev.filter(alert => !alert.id.startsWith("stock-"));
        const stockAlerts = lowStock.map(p => ({
          id: "stock-" + p._id,
          type: "warning",
          text: "Stock bajo",
          detail: p.name,
        }));
        return [...nonStockAlerts, ...stockAlerts];
      });
    } catch (err) {
      console.error("Error en productos:", err);
    }
  }, [token]);

  useEffect(() => {
  if (!token) return;

  fetchPeopleCount();
  fetchProducts();
  fetchTemperature();
  fetchHumidity();
}, [token, fetchPeopleCount, fetchProducts, fetchTemperature, fetchHumidity]);

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

        <WidgetCard
          title="Alertas Importantes"
          icon={<MdReportProblem size={28} color="#D90429" />}
        >
          <div className="alert-list">
            {alerts.length > 0 ? (
              alerts.map(alert => (
                <div className="alert-item" key={alert.id}>
                  <span
                    className="alert-text"
                    style={{ color: statusColor[alert.type] || "#333" }}
                  >
                    {alert.text}
                    {alert.detail && (
                      <span className="alert-detail-text"> - {alert.detail}</span>
                    )}
                  </span>
                </div>
              ))
            ) : (
              <span className="alert-text" style={{ color: "#27ae60" }}>
                Sin alertas
              </span>
            )}
          </div>
        </WidgetCard>

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
              style={{
                color: statusColor[environmentData.statusType] || "#333",
              }}
            >
              {environmentData.status}
            </span>
          </div>
        </WidgetCard>

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
              Revisar: {inventoryData.productsToReview.join(", ") || "Ninguno"}
            </span>
          </div>
        </WidgetCard>

      </div>
    </div>
  );
};

export default Dashboard;
