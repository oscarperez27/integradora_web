// import React from "react"; // Eliminamos useState y useEffect si no los usamos
import React, { useState } from "react";
import "./Monitoring.css";
import AlertMessage from "../components/AlertMessage";

const initialZoneData = [
  {
    id: "1",
    zoneName: "Zona de ejercicios Cardio",
    status: "Óptimo",
    temp: 22,
    humidity: 50,
    lastUpdated: "Hace 1 min",
  },
  {
    id: "2",
    zoneName: "Área de Pesas Libres",
    status: "Temperatura Alta",
    temp: 28,
    humidity: 58,
    lastUpdated: "Hace 2 min",
  },
  {
    id: "3",
    zoneName: "Salón de Clases Grupales",
    status: "Humedad Elevada",
    temp: 24,
    humidity: 75,
    lastUpdated: "Hace 1 min",
  },
];

function ZoneCard({ zoneName, status, temp, humidity, lastUpdated, onDetails }) {
  let statusClass = "zone-optimal";
  if (status.toLowerCase().includes("alta") || status.toLowerCase().includes("elevada")) {
    statusClass = "zone-alert";
  }
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
  const overallStatus = "Todos los sensores Online"; // Valor constante
  const activeAlerts = 2; // Valor constante

  const [alertMessage, setAlertMessage] = useState(null);

  const handleDetails = (zoneName) => {
    ;setAlertMessage(`Mostraría detalles específicos para: ${zoneName}`);
    // Ocultar automáticamente después de unos segundos
  };

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
        {initialZoneData.map(zone => (
          <ZoneCard
            key={zone.id}
            {...zone}
            onDetails={() => handleDetails(zone.zoneName)}
          />
        ))}
      </div>
      <AlertMessage message={alertMessage} onClose={() => setAlertMessage(null)} />
    </div>
  );
};

export default Monitoring;