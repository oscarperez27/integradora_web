import React, { useState } from "react";
import { MdSave, MdAddCircle, MdEdit, MdRestartAlt, MdDelete } from "react-icons/md";
import "./Configuration.css";
import AlertMessage from "../components/AlertMessage";
import ConfirmModal from "../components/ConfirmModal";

const initialSensorsData = [
  {
    id: "s1",
    name: "TEMP-CARDIO-01",
    type: "Temperatura/Humedad (DHT11)",
    zone: "Zona Cardio",
    status: "online",
    battery: "85%",
  },
  {
    id: "s2",
    name: "MOV-PESAS-01",
    type: "Movimiento (PIR)",
    zone: "Área de Pesas Libres",
    status: "online",
    battery: "N/A (Cableado)",
  },
  {
    id: "s3",
    name: "ACCESO-PPL-01",
    type: "Acceso (RFID)",
    zone: "Puerta Principal",
    status: "offline",
    battery: "N/A",
  },
  {
    id: "s4",
    name: "HUM-VESTIDOR-M",
    type: "Humedad (DHT11)",
    zone: "Vestidores Hombres",
    status: "low-battery",
    battery: "15%",
  },
];

const sensorStatusOptions = [
  { value: "online", label: "En línea" },
  { value: "offline", label: "Desconectado" },
  { value: "low-battery", label: "Batería baja" },
];

function getSensorStatus(status) {
  switch (status) {
    case "online":
      return { text: "En línea", color: "#2ecc71" };
    case "offline":
      return { text: "Desconectado", color: "#e74c3c" };
    case "low-battery":
      return { text: "Batería baja", color: "#f1c40f" };
    default:
      return { text: "Desconocido", color: "#7f8c8d" };
  }
}

function SensorFormModal({ show, onClose, onSave, initial }) {
  const isEdit = !!initial?.id;
  const [name, setName] = useState(initial?.name || "");
  const [type, setType] = useState(initial?.type || "");
  const [zone, setZone] = useState(initial?.zone || "");
  const [status, setStatus] = useState(initial?.status || "online");
  const [battery, setBattery] = useState(initial?.battery || "");

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !type.trim() || !zone.trim() || !status.trim() || !battery.trim()) {
      alert("Todos los campos son obligatorios.");
      return;
    }
    onSave({
      ...initial,
      name: name.trim(),
      type: type.trim(),
      zone: zone.trim(),
      status,
      battery: battery.trim(),
    });
  };

  return (
    <div className="modal-backdrop">
      <form className="modal-form" onSubmit={handleSubmit}>
        <h2>{isEdit ? "Editar Sensor" : "Añadir Sensor"}</h2>
        <label>
          Nombre del Sensor
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Tipo
          <input
            type="text"
            value={type}
            onChange={e => setType(e.target.value)}
            required
          />
        </label>
        <label>
          Zona
          <input
            type="text"
            value={zone}
            onChange={e => setZone(e.target.value)}
            required
          />
        </label>
        <label>
          Estado
          <select value={status} onChange={e => setStatus(e.target.value)} required>
            {sensorStatusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Batería
          <input
            type="text"
            value={battery}
            onChange={e => setBattery(e.target.value)}
            required
          />
        </label>
        <div className="modal-actions">
          <button type="submit">{isEdit ? "Guardar Cambios" : "Crear Sensor"}</button>
          <button type="button" className="cancel" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
      
    </div>
  );
}

const Configuration = () => {
  const [gymName, setGymName] = useState("Prime Gym Durango");
  const [gymAddress, setGymAddress] = useState("Av. Siempre Viva 123, Col. Centro");
  const [gymPhone, setGymPhone] = useState("618-123-4567");
  const [gymZones, setGymZones] = useState(
    "Zona Cardio, Área de Pesas Libres, Salón de Clases Grupales, Recepción, Vestidores"
  );
  const [sensors, setSensors] = useState(initialSensorsData);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("info");
  const [confirmModal, setConfirmModal] = useState({
  show: false,
  message: "",
  action: null, // 'delete' o 'restart'
  sensorIdx: null
});
  // Modal state for sensors
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState(null);

  const handleSaveGymInfo = (e) => {
  e.preventDefault();
  if (!gymName.trim() || !gymAddress.trim() || !gymPhone.trim()) {
    setAlertType("error");
    setAlertMessage("Por favor, completa todos los campos obligatorios.");
    return;
  }
  setAlertType("success");
  setAlertMessage("¡Información del gimnasio guardada correctamente!");
};

  const handleAddNewSensor = () => {
    setModalInitial(null);
    setModalOpen(true);
  };

  const handleEditSensor = (idx) => {
    setModalInitial({ ...sensors[idx] });
    setModalOpen(true);
  };

  const handleDeleteSensor = (idx) => {
  const sensor = sensors[idx];
  setConfirmModal({
    show: true,
    message: `¿Estás seguro de eliminar el sensor "${sensor.name}"?`,
    action: "delete",
    sensorIdx: idx
  });
};

  const handleRestartSensor = (idx) => {
  const sensor = sensors[idx];
  setAlertType("info");
  setAlertMessage(`Sensor "${sensor.name}" reiniciado correctamente.`);
};

const handleConfirmAction = () => {
  setConfirmModal(prev => {
    const { action, sensorIdx } = prev;
    const sensor = sensors[sensorIdx];

    if (action === "delete") {
      setSensors(s => s.filter((_, i) => i !== sensorIdx));
      setAlertType("success");
      setAlertMessage(`Sensor "${sensor.name}" eliminado correctamente.`);
    }

    if (action === "restart") {
      setAlertType("info");
      setAlertMessage(`Sensor "${sensor.name}" reiniciado correctamente.`);
    }

    return { show: false, message: "", action: null, sensorIdx: null };
  });
};

  const handleSensorModalSave = (sensorData) => {
    setSensors(sensors => {
  if (sensorData.id) {
    setAlertType("success");
    setAlertMessage(`Sensor "${sensorData.name}" editado correctamente.`);
    return sensors.map(s => (s.id === sensorData.id ? { ...sensorData } : s));
  } else {
    setAlertType("success");
    setAlertMessage(`Sensor "${sensorData.name}" creado correctamente.`);
    return [
      ...sensors,
      { ...sensorData, id: "s" + (Math.random() + "").slice(2) },
    ];
  }
});
setModalOpen(false);
setModalInitial(null);
  };

  const handleSensorModalClose = () => {
    setModalOpen(false);
    setModalInitial(null);
  };

  return (
    <div className="configuration-container">
      <h1 className="config-title">Configuración del Sistema</h1>
      <div className="config-subtitle">Ajustes generales y administración</div>

      {/* Información del Gimnasio */}
      <form className="config-card" onSubmit={handleSaveGymInfo}>
        <h2 className="config-card-title">Información del Gimnasio</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Nombre del Gimnasio</label>
            <input
              type="text"
              value={gymName}
              onChange={e => setGymName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              value={gymAddress}
              onChange={e => setGymAddress(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              value={gymPhone}
              onChange={e => setGymPhone(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Logo Actual</label>
            <img
              src={process.env.PUBLIC_URL + "/assets/Prime_Gym.jpg"}
              alt="Logo Prime Gym"
              className="gym-logo"
            />
          </div>
        </div>
        <div className="form-group full-width">
          <label>Zonas del Gimnasio</label>
          <textarea
            value={gymZones}
            onChange={e => setGymZones(e.target.value)}
            rows={3}
            placeholder="Separar zonas por comas"
          />
        </div>
        <button className="btn-primary" type="submit">
          <MdSave size={20} style={{ marginRight: 6 }} />
          Guardar Información
        </button>
      </form>

      {/* Gestión de Sensores */}
      <div className="config-card">
        <h2 className="config-card-title">Gestión de Sensores</h2>
        <button className="btn-secondary" onClick={handleAddNewSensor}>
          <MdAddCircle size={20} style={{ marginRight: 6 }} />
          Añadir Sensor
        </button>
        <div className="sensor-table-container">
          <div className="sensor-table">
            <div className="sensor-table-row sensor-table-header">
              <div className="sensor-table-cell sensor-col-name">Sensor</div>
              <div className="sensor-table-cell sensor-col-type">Tipo</div>
              <div className="sensor-table-cell sensor-col-zone">Zona</div>
              <div className="sensor-table-cell sensor-col-status">Estado</div>
              <div className="sensor-table-cell sensor-col-battery">Batería</div>
              <div className="sensor-table-cell sensor-col-actions">Acciones</div>
            </div>
            {sensors.map((sensor, idx) => {
              const status = getSensorStatus(sensor.status);
              return (
                <div className="sensor-table-row" key={sensor.id}>
                  <div className="sensor-table-cell sensor-col-name">
                    {sensor.name}
                  </div>
                  <div className="sensor-table-cell sensor-col-type">
                    {sensor.type}
                  </div>
                  <div className="sensor-table-cell sensor-col-zone">
                    {sensor.zone}
                  </div>
                  <div className="sensor-table-cell sensor-col-status">
                    <span
                      className="status-dot"
                      style={{ backgroundColor: status.color }}
                    ></span>
                    <span>{status.text}</span>
                  </div>
                  <div className="sensor-table-cell sensor-col-battery">
                    {sensor.battery}
                  </div>
                  <div className="sensor-table-cell sensor-col-actions">
                    <button
                      className="icon-btn"
                      title="Editar"
                      onClick={() => handleEditSensor(idx)}
                    >
                      <MdEdit color="#3498db" size={20} />
                    </button>
                    <button
                      className="icon-btn"
                      title="Reiniciar"
                      onClick={() => handleRestartSensor(idx)}
                    >
                      <MdRestartAlt color="#f39c12" size={20} />
                    </button>
                    <button
                      className="icon-btn"
                      title="Eliminar"
                      onClick={() => handleDeleteSensor(idx)}
                    >
                      <MdDelete color="#e74c3c" size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <SensorFormModal
        show={modalOpen}
        onClose={handleSensorModalClose}
        onSave={handleSensorModalSave}
        initial={modalInitial}
      />
      {alertMessage && (
        <AlertMessage type={alertType} message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}

      {confirmModal.show && (
        <ConfirmModal
          show={confirmModal.show}
          message={confirmModal.message}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmModal({ show: false, message: "", action: null, sensorIdx: null })}
        />
      )}
    </div>
  );
};

export default Configuration;