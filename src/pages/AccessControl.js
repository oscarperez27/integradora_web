import React, { useState, useEffect } from "react";
import { MdPersonAdd, MdEdit, MdDelete } from "react-icons/md";
import "./AccessControl.css";
import AlertMessage from "../components/AlertMessage";
import ConfirmModal from "../components/ConfirmModal";
import API from "../config/api"; 

const defaultPhoto = process.env.PUBLIC_URL + "/assets/yooo.jpg";

const membershipTypes = ["básica", "estudiante"];

function MemberForm({ initial, onSave, onClose, setAlertMessage, setAlertType }) {
  const [name, setName] = useState(initial.name || "");
  const [membershipType, setMembershipType] = useState(initial.membershipType || "Básica");
  const [photo, setPhoto] = useState(initial.photo || defaultPhoto);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setAlertType("error");
      setAlertMessage("El nombre es obligatorio");
      return;
    }
    onSave({
      ...initial,
      name: name.trim(),
      membershipType,
      photo,
      active: true,
    });
  };

  return (
    <div className="modal-backdrop">
      <form className="modal-form" onSubmit={handleSubmit}>
        <h2>{initial.id ? "Editar miembro" : "Nuevo miembro"}</h2>
        <label>
          Nombre:
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </label>
        <label>
          Membresía:
          <select value={membershipType} onChange={e => setMembershipType(e.target.value)}>
            {membershipTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Foto (URL): 
          <input
            type="text"
            value={photo}
            onChange={e => setPhoto(e.target.value)}
            placeholder="URL de la imagen o dejar vacío"
          />
        </label>
        <div className="modal-actions">
          <button type="submit">Guardar</button>
          <button type="button" className="cancel" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

const AccessControl = () => {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formInitial, setFormInitial] = useState({});
  const [editIndex, setEditIndex] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("success"); // "error", "success", "info"
  const [confirmData, setConfirmData] = useState({ visible: false, idx: null });

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No hay token en localStorage");
    return;
  }

  fetch(`${API}/api/client/clients`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then(async res => {
      const data = await res.json();
      console.log("Respuesta recibida de /clients:", data);

      if (!res.ok) {
        throw new Error(data.message || "Error al obtener clientes");
      }

      if (!Array.isArray(data)) {
        throw new Error("La respuesta no es un arreglo");
      }

      const loadedMembers = data.map(c => ({
        id: c._id,
        name: `${c.nombre} ${c.apellidos}`,
        membershipType: c.tipoMembresia,
        photo: defaultPhoto,
        active: true,
      }));

      setMembers(loadedMembers);
      setAlertMessage(null);
    })
    .catch(err => {
      setAlertType("error");
      setAlertMessage(err.message || "Error cargando clientes");
    });
}, []);

  const handleAddClick = () => {
    setFormInitial({});
    setEditIndex(null);
    setShowForm(true);
  };

  const handleEditClick = (member, idx) => {
    setFormInitial(member);
    setEditIndex(idx);
    setShowForm(true);
  };

  const handleDeleteClick = (idx) => {
    setConfirmData({ visible: true, idx });
  };

  const confirmDelete = async () => {
  const idx = confirmData.idx;
  const member = members[idx];
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${API}/api/client/delete/${member.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Error al eliminar cliente");

    setMembers(members =>
      members.filter((_, i) => i !== idx)
    );
    setAlertType("success");
    setAlertMessage("Cliente eliminado correctamente");
  } catch (err) {
    setAlertType("error");
    setAlertMessage(err.message || "Error al eliminar cliente");
  } finally {
    setConfirmData({ visible: false, idx: null });
  }
};

  const cancelDelete = () => {
    setConfirmData({ visible: false, idx: null });
  };

  const handleFormSave = async (member) => {
  const token = localStorage.getItem("token");
  const body = {
    nombre: member.name.split(" ")[0],
    apellidos: member.name.split(" ").slice(1).join(" ") || "Apellido",
    correo: `auto-${Date.now()}@correo.com`, // si no usas input real
    telefono: "0000000000",
    fechaNacimiento: "2000-01-01",
    telefonoEmergencia: "0000000000",
    tipoMembresia: member.membershipType,
  };

  try {
    if (editIndex !== null) {
      const id = member.id;
      const res = await fetch(`${API}/api/client/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al actualizar cliente");

      const updated = await res.json();
      setMembers(members =>
        members.map((m, i) =>
          i === editIndex
            ? {
                ...m,
                name: `${updated.client.nombre} ${updated.client.apellidos}`,
                membershipType: updated.client.tipoMembresia,
              }
            : m
        )
      );
      setAlertMessage("Cliente actualizado correctamente");
    } else {
      const res = await fetch(`${API}/api/client/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error al crear cliente");

      const { client } = await res.json();
      setMembers(members => [
        ...members,
        {
          id: client._id,
          name: `${client.nombre} ${client.apellidos}`,
          membershipType: client.tipoMembresia,
          photo: defaultPhoto,
          active: true,
        },
      ]);
      setAlertMessage("Cliente creado correctamente");
    }

    setAlertType("success");
    setShowForm(false);
  } catch (err) {
    setAlertType("error");
    setAlertMessage(err.message || "Error en operación");
  }
};

  const handleFormClose = () => setShowForm(false);

  const activeMembers = members.filter(m => m.active);

  return (
    <div className="access-container">
      <h1 className="access-title">Monitoreo y Registro de Clientes</h1>
      <div className="quick-stats-bar">
        <div className="stat-card">
          <div className="stat-value">{activeMembers.length}</div>
          <div className="stat-label">Personas Actualmente Dentro</div>
        </div>
      </div>
      <h2 className="section-subtitle">Registro de Clientes</h2>
      <div className="add-member-box">
        <div className="add-member-box-title">Clientes</div>
        <button className="btn-add" onClick={handleAddClick}>
          <MdPersonAdd size={20} style={{ marginRight: 6 }} />
          Nuevo Cliente
        </button>
      </div>
      <div className="table-container">
        <div className="table-header-row">
          <div className="cell-photo">Foto</div>
          <div className="cell-name">Nombre</div>
          <div className="cell-membership">Membresía</div>
          <div className="cell-actions">Acciones</div>
        </div>
        {activeMembers.map((item, idx) => (
          <div className="table-row" key={item.id}>
            <div className="cell-photo">
              <img
                src={item.photo || defaultPhoto}
                alt={item.name}
                className="member-photo-sm"
                onError={e => { e.target.src = defaultPhoto; }}
              />
            </div>
            <div className="cell-name">{item.name}</div>
            <div className="cell-membership">{item.membershipType}</div>
            <div className="cell-actions">
              <button className="icon-btn" title="Editar" onClick={() => handleEditClick(item, members.findIndex(m => m.id === item.id))}>
                <MdEdit color="#3498db" size={20} />
              </button>
              <button className="icon-btn" title="Dar de baja" onClick={() => handleDeleteClick(members.findIndex(m => m.id === item.id))}>
                <MdDelete color="#e74c3c" size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <MemberForm
          initial={formInitial}
          onSave={handleFormSave}
          onClose={handleFormClose}
          setAlertMessage={setAlertMessage}
          setAlertType={setAlertType}
        />
      )}
      {alertMessage && (
        <AlertMessage
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
          type={alertType}
        />
      )}
      {confirmData.visible && (
        <ConfirmModal
          message="¿Dar de baja a este miembro? (No se eliminará permanentemente)"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          show={true}
        />
      )}
    </div>
  );
};

export default AccessControl;
