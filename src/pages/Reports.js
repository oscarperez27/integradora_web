import React, { useState } from "react";
import { FaDumbbell, FaCapsules } from "react-icons/fa";
import {
  MdAir,
  MdGroup,
  MdFilePresent,
  MdPlayCircleOutline,
  MdFileDownload,
  MdPictureAsPdf,
} from "react-icons/md";
import "./Reports.css";

const reportTypes = [
  { id: "gym_usage", title: "Uso del Gimnasio", description: "Afluencia, horas pico, uso de zonas." },
  { id: "supp_consumption", title: "Consumo de Suplementos", description: "Ventas, tendencias, productos populares." },
  { id: "env_performance", title: "Rendimiento Ambiental", description: "Cumplimiento de rangos T°/Humedad." },
  { id: "access_activity", title: "Actividad de Accesos", description: "Registros detallados, permitidos/denegados." },
  { id: "general_report", title: "Reporte General", description: "Resumen consolidado de operaciones." },
];

const zoneOptions = [
  { value: "", label: "Todas" },
  { value: "cardio", label: "Zona Cardio" },
  { value: "pesas_libres", label: "Pesas Libres" },
  { value: "salon_clases", label: "Salón de Clases" },
];

const timeRangeOptions = [
  { value: "", label: "Todo el día" },
  { value: "morning", label: "Mañana (06-12)" },
  { value: "afternoon", label: "Tarde (12-18)" },
  { value: "evening", label: "Noche (18-22)" },
];

const productCategoryOptions = [
  { value: "", label: "Todas" },
  { value: "proteinas", label: "Proteínas" },
  { value: "creatinas", label: "Creatinas" },
  { value: "otros", label: "Otros" },
];

function Reports() {
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [gymZone, setGymZone] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productName, setProductName] = useState("");

  const handleSelectReportType = (typeId) => {
    setSelectedReportType(typeId);
    setGymZone("");
    setTimeRange("");
    setProductCategory("");
    setProductName("");
  };

  const handleGenerateReport = () => {
    alert(`Generando reporte de ${selectedReportType || "General"} desde ${startDate} hasta ${endDate}`);
  };

  const handleDownloadPdf = () => {
    alert(`Descargando PDF de ${selectedReportType || "General"}`);
  };

  const handleDownloadCsv = () => {
    alert(`Descargando CSV de ${selectedReportType || "General"}`);
  };

  const renderSpecificFilters = () => {
    switch (selectedReportType) {
      case "gym_usage":
        return (
          <div className="config-row">
            <div className="form-group">
              <label>Zona del Gimnasio:</label>
              <select value={gymZone} onChange={e => setGymZone(e.target.value)}>
                {zoneOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Franja Horaria:</label>
              <select value={timeRange} onChange={e => setTimeRange(e.target.value)}>
                {timeRangeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      case "supp_consumption":
        return (
          <div className="config-row">
            <div className="form-group">
              <label>Categoría de Producto:</label>
              <select value={productCategory} onChange={e => setProductCategory(e.target.value)}>
                {productCategoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Nombre Producto (opcional):</label>
              <input
                type="text"
                placeholder="Ej: Proteína Whey"
                value={productName}
                onChange={e => setProductName(e.target.value)}
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="no-filters-text">
            No hay filtros adicionales para este tipo de reporte, además de las fechas.
          </div>
        );
    }
  };

  return (
    <div className="reports-container">
      <h1 className="reports-title">Informes y Análisis de Operaciones</h1>

      {/* Paso 1: Selección de tipo de reporte */}
      <div className="section">
        <div className="section-subtitle">1. Seleccione un Tipo de Reporte</div>
        <div className="report-selection-grid">
          {reportTypes.map(type => (
            <button
              type="button"
              key={type.id}
              className={`report-type-card${selectedReportType === type.id ? " selected" : ""}`}
              onClick={() => handleSelectReportType(type.id)}
            >
              <div className="report-type-icon">
                {type.id === "gym_usage" ? (
                  <FaDumbbell size={32} color="#D90429" />
                ) : type.id === "supp_consumption" ? (
                  <FaCapsules size={32} color="#D90429" />
                ) : type.id === "env_performance" ? (
                  <MdAir size={32} color="#D90429" />
                ) : type.id === "access_activity" ? (
                  <MdGroup size={32} color="#D90429" />
                ) : (
                  <MdFilePresent size={32} color="#D90429" />
                )}
              </div>
              <div className="report-type-title">{type.title}</div>
              <div className="report-type-description">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Paso 2: Configurar parámetros */}
      <div className="section">
        <div className="section-subtitle">2. Configure los Parámetros del Reporte</div>
        <div className="report-configuration-panel">
          <div className="config-row">
            <div className="form-group">
              <label>Fecha de Inicio:</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Fecha de Fin:</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="specific-filters-placeholder">{renderSpecificFilters()}</div>

          <div className="actions-row">
            <button className="btn-generate" onClick={handleGenerateReport}>
              <MdPlayCircleOutline size={20} className="btn-icon" />
              Generar Reporte
            </button>
            <button className="btn-download-pdf" onClick={handleDownloadPdf}>
              <MdPictureAsPdf size={20} className="btn-icon" />
              Descargar PDF
            </button>
            <button className="btn-download-csv" onClick={handleDownloadCsv}>
              <MdFileDownload size={20} className="btn-icon" />
              Descargar CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;