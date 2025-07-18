import React, { useEffect, useState } from "react";
import "./Orders.css";
import API from "../config/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]); // Para guardar usuarios
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Traer usuarios
    const fetchUsers = async () => {
      try {
        const resUsers = await fetch(`${API}/api/auth/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          cache: "no-store",
        });
        const data = await resUsers.json();
        if (!resUsers.ok) throw new Error(data.message || "Error al obtener usuarios");
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los usuarios.");
      }
    };

    // Traer órdenes
    const fetchOrders = async () => {
  try {
    const res = await fetch(`${API}/api/order/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    const data = await res.json();
    console.log("Datos órdenes recibidos:", data);

    if (!res.ok) throw new Error(data.message || "Error al obtener órdenes");

    if (Array.isArray(data)) {
      setOrders(data);
    } else if (Array.isArray(data.orders)) {
      setOrders(data.orders);
    } else if (Array.isArray(data.data)) {
      setOrders(data.data);
    } else {
      console.warn("No se encontró arreglo de órdenes en la respuesta");
      setOrders([]);
    }
  } catch (err) {
    console.error(err);
    setError("No se pudieron cargar las órdenes.");
  }
};

    fetchUsers();
    fetchOrders();
  }, [token]);

  // Función para obtener nombre de usuario por id
  const getUserNameById = (id) => {
    if (!id) return "Desconocido";
    const user = users.find((u) => u._id.toString() === id.toString());
    if (!user) return "Desconocido";
    return `${user.firstName || user.username || user.name || ""} ${user.lastName || ""}`.trim();
  };

  const handleCancel = async (id) => {
    const confirm = window.confirm("¿Estás seguro de cancelar esta orden?");
    if (!confirm) return;

    try {
      const res = await fetch(`${API}/api/order/delete/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al cancelar la orden");

      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, Status: "Cancelled" } : order
        )
      );
    } catch (err) {
      console.error(err);
      alert("Error al cancelar la orden.");
    }
  };

  return (
    <div className="orders-container">
      <h1 className="orders-title">Gestión de Órdenes</h1>
      {error && <div className="orders-error">{error}</div>}

      <div className="orders-list">
        {Array.isArray(orders) && orders.length > 0 ? (
          orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-header">
                <span><strong>Cliente:</strong> {getUserNameById(order.IDUser)}</span>
                <span><strong>Estado:</strong> {order.Status}</span>
              </div>
              <div className="order-body">
                <p><strong>Fecha:</strong> {new Date(order.createDate).toLocaleString()}</p>
                <p><strong>Subtotal:</strong> ${order.Subtotal.toFixed(2)}</p>
                <p><strong>Total:</strong> ${order.Total.toFixed(2)}</p>
                <p><strong>Productos:</strong></p>
                <ul className="product-list">
                  {order.Products.map((prod, i) => (
                    <li key={i}>
                      {prod.name} - {prod.quantity} x ${prod.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>
              {order.Status === "Pending" && (
                <button className="order-cancel-btn" onClick={() => handleCancel(order._id)}>
                  Cancelar Orden
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No hay órdenes registradas.</p>
        )}
      </div>
    </div>
  );
};

export default Orders;
