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
    if (adminPassword !== adminPasswordConfirm) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      return;
    }
    // Aquí iría la lógica de actualización (API o localStorage si deseas)
    setMessage({ type: "success", text: "Perfil actualizado correctamente" });
    setAdminPassword("");
    setAdminPasswordConfirm("");
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