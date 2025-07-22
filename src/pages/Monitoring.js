import React, { useState, useEffect } from "react";
import "./Monitoring.css";
import AlertMessage from "../components/AlertMessage";
import LoadingSpinner from "../components/LoadingSpinner";
import API from "../config/api";

const zonas = [
  { id: "1", name: "Zona de ejercicios Cardio", key: "zona1" },
  { id: "2", name: "Área de Pesas Libres", key: "zona2" },
  { id: "3", name: "Salón de Clases Grupales", key: "zona3" },
];

function ZoneCard({ zoneName, status, temp, humidity, lastUpdated, onDetails }) {
  const statusClass =
    status.toLowerCase().includes("alta") || status.toLowerCase().includes("elevada")
      ? "zone-alert"
      : "zone-optimal";

  return (
    <div className={`zone-card ${statusClass}`}>
      <div className="zone-title">{zoneName}</div>
      <div className="zone-info-row">
        <span className="zone-info-label">Estado:</span>
        <span className="zone-info-value">{status}</span>
      </div>
      <div className="zone-info-row">
        <span className="zone-info-label">Temp:</span>
        <span className="zone-info-value">{temp}°C</span>
        <span className="zone-info-label">Humedad:</span>
        <span className="zone-info-value">{humidity}%</span>
      </div>
      <div className="zone-info-row">
        <span className="zone-info-label">Actualizado:</span>
        <span className="zone-info-value">{lastUpdated}</span>
      </div>
      <button className="zone-details-btn" onClick={onDetails}>
        Ver Detalles
      </button>
    </div>
  );
}

const Monitoring = () => {
  const [zoneData, setZoneData] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const overallStatus = "Todos los sensores Online";
  const activeAlerts = zoneData.filter(
    (z) =>
      z.status.toLowerCase().includes("alta") || z.status.toLowerCase().includes("elevada")
  ).length;

  useEffect(() => {
    const fetchZoneData = async () => {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const today = `${yyyy}-${mm}-${dd}`;

      try {
        const data = await Promise.all(
          zonas.map(async (zona) => {
            const [tempRes, humRes] = await Promise.all([
              fetch(
                `${API}/api/sensor/temperatureByZone?zona=${zona.key}&startDate=${today}&endDate=${today}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
              ),
              fetch(
                `${API}/api/sensor/humidityByZone?zona=${zona.key}&startDate=${today}&endDate=${today}`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
              ),
            ]);

            if (!tempRes.ok || !humRes.ok) {
              throw new Error(`Error al obtener datos para la zona ${zona.name}`);
            }

            const tempData = await tempRes.json();
            const humData = await humRes.json();

            const lastTemp = tempData.length > 0 ? tempData[tempData.length - 1].valor : 0;
            const lastHum = humData.length > 0 ? humData[humData.length - 1].valor : 0;

            let status = "Óptimo";
            if (lastTemp > 26) status = "Temperatura Alta";
            if (lastHum > 70) status = "Humedad Elevada";

            return {
              id: zona.id,
              zoneName: zona.name,
              status,
              temp: lastTemp,
              humidity: lastHum,
              lastUpdated: "Hace 1 min",
            };
          })
        );
        setZoneData(data);
      } catch (err) {
        console.error("Error al cargar datos de sensores", err);
        setAlertMessage("Error al cargar datos de sensores");
      } finally {
        setLoading(false);
      }
    };

    fetchZoneData();
  }, []);

  const handleDetails = (zoneName) => {
    setAlertMessage(`Mostraría detalles específicos para: ${zoneName}`);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="monitoring-container">
      <h1 className="monitoring-title">Estado Ambiental del Gimnasio</h1>

      <div className="monitoring-overview">
        <div>
          <span className="overview-label">Estado General: </span>
          <span className="sensors-ok">{overallStatus}</span>
        </div>
        <div>
          <span className="overview-label">Alertas: </span>
          <span className="alerts-active">{activeAlerts} Activas</span>
        </div>
      </div>

      <div className="zone-grid">
        {zoneData.map((zone) => (
          <ZoneCard key={zone.id} {...zone} onDetails={() => handleDetails(zone.zoneName)} />
        ))}
      </div>

      <AlertMessage message={alertMessage} onClose={() => setAlertMessage(null)} />
    </div>
  );
};

export default Monitoring;
