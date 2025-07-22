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
    actuales: 0,
    entradas: 0,
    salidas: 0,
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

  // Obtiene fechas para hoy YYYY-MM-DD
  const getTodayDates = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    const today = `${yyyy}-${mm}-${dd}`;
    return {
      startDate: today,
      endDate: today,
    };
  };

  // Fetch conteo diario accesos
  const fetchPeopleCountToday = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/sensor/people-countToday`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al obtener conteo diario");

      setAccessData({
        actuales: data.actuales || 0,
        entradas: data.entradas || 0,
        salidas: data.salidas || 0,
      });
    } catch (err) {
      console.error("Error en people-countToday:", err);
    }
  }, [token]);

  // Calcula promedio de un arreglo de números
  const calcAverage = (arr) => {
    if (!arr.length) return "--";
    const sum = arr.reduce((a, b) => a + b, 0);
    return (sum / arr.length).toFixed(1);
  };

  // Fetch datos de temperatura
  const fetchTemperature = useCallback(async () => {
    const { startDate, endDate } = getTodayDates();
    try {
      const res = await fetch(
        `${API}/api/sensor/temperature?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al obtener temperatura");

      // data es arreglo con objetos que tienen al menos .valor o similar (ajusta según tu modelo)
      // Aquí asumo que cada doc tiene un campo 'valor' con temperatura numérica
      const temps = data.map(d => d.valor).filter(v => typeof v === "number");

      const avgTemp = calcAverage(temps);
      let statusType = "ok";
      let status = "Temperatura normal";

      if (avgTemp === "--") {
        statusType = "info";
        status = "Sin datos de temperatura";
      } else if (avgTemp > 28) {
        statusType = "warning";
        status = "Temperatura alta";
      } else if (avgTemp < 10) {
        statusType = "danger";
        status = "Temperatura baja";
      }

      setEnvironmentData(env => ({
        ...env,
        avgTemp,
        status,
        statusType,
      }));
    } catch (err) {
      console.error("Error en temperatura:", err);
      setEnvironmentData(env => ({
        ...env,
        avgTemp: "--",
        status: "Error al cargar temperatura",
        statusType: "danger",
      }));
    }
  }, [token]);

  // Fetch datos de humedad
  const fetchHumidity = useCallback(async () => {
    const { startDate, endDate } = getTodayDates();
    try {
      const res = await fetch(
        `${API}/api/sensor/humidity?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al obtener humedad");

      // data es arreglo con objetos que tienen al menos .valor o similar (ajusta según tu modelo)
      const hums = data.map(d => d.valor).filter(v => typeof v === "number");

      const avgHumidity = calcAverage(hums);

      setEnvironmentData(env => ({
        ...env,
        avgHumidity,
      }));
    } catch (err) {
      console.error("Error en humedad:", err);
      setEnvironmentData(env => ({
        ...env,
        avgHumidity: "--",
      }));
    }
  }, [token]);

  // Fetch productos inventario
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
        const nonStockAlerts = prev.filter(alert => !alert.id?.startsWith?.("stock-"));
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

    fetchPeopleCountToday();
    fetchProducts();
    fetchTemperature();
    fetchHumidity();
  }, [token, fetchPeopleCountToday, fetchProducts, fetchTemperature, fetchHumidity]);

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
            <span className="widget-value">{accessData.actuales}</span>
            <span className="widget-label">Personas Actualmente</span>
          </div>
          <div className="widget-data-container">
            <span className="widget-value">{accessData.entradas}</span>
            <span className="widget-label">Entradas Hoy</span>
          </div>
          <div className="widget-data-container">
            <span className="widget-value">{accessData.salidas}</span>
            <span className="widget-label">Salidas Hoy</span>
          </div>
        </WidgetCard>

        <WidgetCard
          title="Ambiente General"
          icon={<FaThermometerHalf size={26} color="#27ae60" />}
        >
          <div className="widget-data-container">
            <span className="widget-value">{environmentData.avgTemp} °C</span>
            <span className="widget-label">Temperatura Promedio</span>
          </div>
          <div className="widget-data-container">
            <span className="widget-value">{environmentData.avgHumidity} %</span>
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
