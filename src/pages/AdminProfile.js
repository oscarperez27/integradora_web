import React, { useState } from "react";
import { MdSave } from "react-icons/md";
import "./AdminProfile.css";

const AdminProfile = () => {
  const [adminName, setAdminName] = useState("Usuario Admin");
  const [adminEmail, setAdminEmail] = useState("admin@primegym.com");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState("");
  const [message, setMessage] = useState(null);

  const handleSaveProfile = (e) => {
  e.preventDefault();

  // Validar que nombre no esté vacío
  if (!adminName.trim()) {
    setMessage({ type: "error", text: "El nombre de usuario es obligatorio." });
    return;
  }

  // Validar que email no esté vacío y tenga formato básico
  if (!adminEmail.trim()) {
    setMessage({ type: "error", text: "El correo electrónico es obligatorio." });
    return;
  }
  // Email regex básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(adminEmail)) {
    setMessage({ type: "error", text: "El correo electrónico no es válido." });
    return;
  }

  // Si se pone alguna contraseña, ambas deben coincidir
  if (adminPassword || adminPasswordConfirm) {
    if (adminPassword !== adminPasswordConfirm) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }
    // Opcional: validar longitud mínima de contraseña
    if (adminPassword.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }
  }

  // Si pasa todas las validaciones
  setMessage({ type: "success", text: "Perfil actualizado correctamente." });

  // Limpiar contraseñas
  setAdminPassword("");
  setAdminPasswordConfirm("");

  // Aquí iría lógica de actualización (API, localStorage...)
};

  return (
    <div className="admin-profile-container">
      <form className="admin-profile-form" onSubmit={handleSaveProfile}>
        <h1 className="admin-title">Editar Perfil</h1>
        {message && (
          <div className={`admin-message ${message.type}`}>{message.text}</div>
        )}

        <label className="admin-label">Nombre de Usuario</label>
        <input
          className="admin-input"
          type="text"
          value={adminName}
          onChange={e => setAdminName(e.target.value)}
        />

        <label className="admin-label">Correo Electrónico</label>
        <input
          className="admin-input"
          type="email"
          value={adminEmail}
          onChange={e => setAdminEmail(e.target.value)}
        />

        <label className="admin-label">Nueva Contraseña</label>
        <input
          className="admin-input"
          type="password"
          value={adminPassword}
          onChange={e => setAdminPassword(e.target.value)}
          placeholder="Dejar en blanco para no cambiar"
        />

        <label className="admin-label">Confirmar Contraseña</label>
        <input
          className="admin-input"
          type="password"
          value={adminPasswordConfirm}
          onChange={e => setAdminPasswordConfirm(e.target.value)}
        />

        <button className="admin-save-btn" type="submit">
          <MdSave size={20} style={{ marginRight: 6 }} />
          Guardar Perfil
        </button>
      </form>
    </div>
  );
};

export default AdminProfile;