import React, { useState, useEffect } from "react";
import { MdAdd, MdEdit, MdDeleteOutline } from "react-icons/md";
import AlertMessage from "../components/AlertMessage";
import ConfirmModal from "../components/ConfirmModal";
import API from "../config/api";
import "./Employes.css"; // Puedes dejar este archivo para agregar extras si hace falta

const Employes = () => {
  const [users, setUsers] = useState([]);
  const [alert, setAlert] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener usuarios");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      setAlert({ type: "error", message: "Error al obtener usuarios" });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/auth/users/delete/${userId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error("Error al eliminar usuario");
      setAlert({ type: "success", message: "Usuario eliminado correctamente" });
      fetchUsers();
    } catch (error) {
      console.error(error);
      setAlert({ type: "error", message: "Error al eliminar usuario" });
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <div className="access-container">
      <h1 className="access-title">Gestión de Usuarios</h1>

      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="add-member-box">
        <span className="add-member-box-title">Administrar empleados registrados</span>
        <button className="btn-add">
          <MdAdd style={{ marginRight: 6 }} /> Nuevo Usuario
        </button>
      </div>

      <div className="table-container">
        <div className="table-header-row">
          <div className="cell-name">Username</div>
          <div className="cell-membership">Email</div>
          <div className="cell-membership">Roles</div>
          <div className="cell-membership">Estado</div>
          <div className="cell-actions">Acciones</div>
        </div>

        {users.map((u) => (
          <div key={u._id} className="table-row">
            <div className="cell-name">{u.username}</div>
            <div className="cell-membership">{u.email}</div>
            <div className="cell-membership">{u.roles.join(", ")}</div>
            <div className="cell-membership">
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  u.status
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {u.status ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="cell-actions">
              <button
                className="icon-btn text-blue-600 hover:text-blue-800"
                onClick={() => console.log("Editar", u)}
              >
                <MdEdit size={20} />
              </button>
              <button
                className="icon-btn text-red-600 hover:text-red-800"
                onClick={() => {
                  setSelectedUser(u);
                  setShowConfirm(true);
                }}
              >
                <MdDeleteOutline size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showConfirm && selectedUser && (
        <ConfirmModal
          show={true}
          title="¿Eliminar usuario?"
          message={`¿Estás seguro de eliminar a ${selectedUser.username}?`}
          onConfirm={() => handleDelete(selectedUser._id)}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default Employes;
