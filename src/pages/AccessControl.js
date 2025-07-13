import React, { useState } from "react";
import { MdPersonAdd, MdEdit, MdDelete } from "react-icons/md";
import "./AccessControl.css";

const defaultPhoto = process.env.PUBLIC_URL + "/assets/yooo.jpg";

const initialCurrentlyInsideData = [
  {
    id: "in1",
    photo: defaultPhoto,
    name: "Ana López",
    membershipType: "Premium",
    active: true,
  },
  {
    id: "in2",
    photo: defaultPhoto,
    name: "Carlos Martínez",
    membershipType: "Básica",
    active: true,
  },
  {
    id: "in3",
    photo: defaultPhoto,
    name: "Laura Fernández",
    membershipType: "Estudiante",
    active: true,
  },
];

const membershipTypes = ["Premium", "Básica", "Estudiante"];

function MemberForm({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial.name || "");
  const [membershipType, setMembershipType] = useState(initial.membershipType || "Básica");
  const [photo, setPhoto] = useState(initial.photo || defaultPhoto);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("El nombre es obligatorio");
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
  const [members, setMembers] = useState(initialCurrentlyInsideData);
  const [showForm, setShowForm] = useState(false);
  const [formInitial, setFormInitial] = useState({});
  const [editIndex, setEditIndex] = useState(null);

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
    if (window.confirm("¿Dar de baja a este miembro? (No se eliminará permanentemente)")) {
      setMembers(members =>
        members.map((m, i) => (i === idx ? { ...m, active: false } : m))
      );
    }
  };

  const handleFormSave = (member) => {
    if (editIndex !== null) {
      // Editar
      setMembers(members =>
        members.map((m, i) => (i === editIndex ? { ...member } : m))
      );
    } else {
      // Crear
      setMembers(members => [
        ...members,
        {
          ...member,
          id: "in" + (Math.random() + "").slice(2),
        },
      ]);
    }
    setShowForm(false);
  };

  const handleFormClose = () => setShowForm(false);

  const activeMembers = members.filter(m => m.active);

  return (
    <div className="access-container">
      <h1 className="access-title">Gestión y Monitoreo de Acceso</h1>
      <div className="quick-stats-bar">
        <div className="stat-card">
          <div className="stat-value">{activeMembers.length}</div>
          <div className="stat-label">Personas Actualmente Dentro</div>
        </div>
      </div>
      <h2 className="section-subtitle">Registro de Usuarios</h2>
      <div className="add-member-box">
        <div className="add-member-box-title">Miembros</div>
        <button className="btn-add" onClick={handleAddClick}>
          <MdPersonAdd size={20} style={{ marginRight: 6 }} />
          Nuevo Miembro
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
        />
      )}
    </div>
  );
};

export default AccessControl;