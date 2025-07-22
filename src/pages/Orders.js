// src/components/Orders.js
import React, { useEffect, useState } from "react";
import "./Orders.css";
import API from "../config/api";
import AlertMessage from "../components/AlertMessage";
import ConfirmModal from "../components/ConfirmModal";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [newOrder, setNewOrder] = useState({
    Status: "Pending",
    Products: [],
  });
  const [modalConfig, setModalConfig] = useState({
    show: false,
    message: "",
    onConfirm: null,
    onCancel: null,
  });

  const token = localStorage.getItem("token");

  // Obtener usuarios (para mostrar nombre creador en órdenes)
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Error al obtener usuarios");
    }
  };

  // Obtener productos
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/api/product/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error al obtener productos");

      const data = await res.json();

      const backendProducts = data.map((p) => ({
        _id: p._id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        categoria: p.categoria,
        description: p.description,
        stock: p.stock,
      }));

      setProducts(backendProducts);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      setError("Error al obtener productos");
      setProducts([]);
    }
  };

  // Obtener órdenes
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/api/order/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // Aquí guardamos orders con _id correcto para evitar undefined en id
      // Si backend envía orderList sin _id, es problema de backend
      // Pero si hay orders, lo usamos directamente.
      if (data.orders) {
        setOrders(data.orders);
      } else if (data.orderList) {
        // Si sólo tienes orderList sin _id, acá lo arreglamos:
        // No recomendado, mejor pedir backend para enviar _id, pero es workaround
        // Para evitar error, pasamos la lista pero no se podrá usar _id para acciones
        setOrders(
          data.orderList.map((order, index) => ({
            ...order,
            _id: order._id || `fake-id-${index}`, // fake id para no romper UI
          }))
        );
      } else {
        setOrders(data.data || []);
      }
    } catch {
      setError("Error al obtener órdenes");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchOrders();
      await fetchUsers();
      await fetchProducts();
    };
    loadData();
  }, []);

  // Obtener nombre usuario por ID
  const getUserNameById = (id) => {
    const user = users.find((u) => u._id === id);
    return user ? `${user.firstName || user.username || "Usuario"}` : "Desconocido";
  };

  // Mostrar modal para cancelar orden
  const confirmCancel = (id) => {
    if (!id) {
      setError("ID de orden inválido para cancelar");
      return;
    }
    setModalConfig({
      show: true,
      message: "¿Cancelar esta orden?",
      onConfirm: () => handleCancel(id),
      onCancel: () => setModalConfig({ ...modalConfig, show: false }),
    });
  };

  // Cancelar orden
  const handleCancel = async (id) => {
    setModalConfig({ ...modalConfig, show: false });
    try {
      const res = await fetch(`${API}/api/order/delete/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o._id === id ? { ...o, Status: "Cancelled" } : o))
        );
        setAlertMessage({ message:"Orden cancelada correctamente", type: "success" });
      } else {
        throw new Error(data.message || "Error al cancelar orden");
      }
    } catch (e) {
      setError("Error al cancelar la orden");
      console.error("Error al cancelar orden:", e);
    }
  };

  // Mostrar modal para marcar como pagada
  const confirmMarkPaid = (id) => {
    if (!id) {
      setError("ID de orden inválido para marcar como pagada");
      return;
    }
    setModalConfig({
      show: true,
      message: "¿Marcar esta orden como pagada?",
      onConfirm: () => handleStatusChange(id, "Payed"),
      onCancel: () => setModalConfig({ ...modalConfig, show: false }),
    });
  };

  // Actualizar estado de orden
  const handleStatusChange = async (id, Status) => {
    setModalConfig({ ...modalConfig, show: false });
    try {
      const res = await fetch(`${API}/api/order/order/update/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Status }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchOrders();
        setAlertMessage({ message:"Estado actualizado correctamente", type: "success" });
        setError("");
      } else {
        throw new Error(data.message || "Error al actualizar estado");
      }
    } catch (e) {
      setError("Error al actualizar estado");
      console.error("Error al actualizar estado:", e);
    }
  };

  // Crear nueva orden
  const handleCreate = async () => {
    setError("");

    if (!newOrder.Products.length) {
      setError("Por favor, selecciona al menos un producto con cantidad mayor a cero");
      return;
    }

    const cleanedProducts = newOrder.Products
      .filter((p) => p.quantity > 0)
      .map((p) => ({
        sku: products.find((prod) => prod._id === p.productId)?.sku,
        quantity: p.quantity,
      }));

    const hasInvalidProduct = cleanedProducts.some(
      (p) => !p.sku || p.quantity <= 0
    );

    if (hasInvalidProduct || !cleanedProducts.length) {
      setError("Cada producto debe tener un SKU válido y una cantidad mayor a 0");
      return;
    }

    try {
      const subtotal = newOrder.Products.reduce(
        (sum, p) => sum + p.price * p.quantity,
        0
      );
      const ivaRate = 0.16;
      const total = +(subtotal * (1 + ivaRate)).toFixed(2);

      const orderToSend = {
        Status: newOrder.Status,
        Products: cleanedProducts,
        Subtotal: subtotal,
        Total: total,
      };

      const res = await fetch(`${API}/api/order/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderToSend),
      });

      const data = await res.json();
      console.log("Enviando orden al backend:", JSON.stringify(orderToSend, null, 2));
      if (res.ok) {
        await fetchOrders();
        setAlertMessage({ message: "Orden creada exitosamente", type: "success" });
        setNewOrder({ Status: "Pending", Products: [] });
        setError("");
      } else {
        setError(data.message || "Error desconocido al crear orden");
      }
    } catch (err) {
      setError(err.message || "Error al crear orden");
    }
  };

  return (
    <div className="orders-container">
      <h1 className="orders-title">Gestión de Órdenes</h1>

      {error && <div className="orders-error">{error}</div>}
      {alertMessage && alertMessage.message && (
  <AlertMessage
    message={alertMessage.message}
    type={alertMessage.type}
    onClose={() => setAlertMessage(null)}
  />
)}

      <div className="new-order-form">
        <h3>Crear Nueva Orden</h3>

        {/* Eliminada la selección de usuario */}

        <p>Productos:</p>
        {products.length === 0 && <p>Cargando productos...</p>}
        {products.map((prod) => {
          const selectedProduct = newOrder.Products.find(
            (p) => p.productId === prod._id
          ) || { quantity: 0 };
          return (
            <div key={prod._id} className="product-input-row">
              <span>
                {prod.name} (${prod.price.toFixed(2)})
              </span>
              <input
                type="number"
                min="0"
                value={selectedProduct.quantity}
                onChange={(e) => {
                  const qty = parseInt(e.target.value) || 0;
                  let updatedProducts = [...newOrder.Products];
                  if (qty <= 0) {
                    updatedProducts = updatedProducts.filter(
                      (p) => p.productId !== prod._id
                    );
                  } else {
                    const index = updatedProducts.findIndex(
                      (p) => p.productId === prod._id
                    );
                    if (index >= 0) {
                      updatedProducts[index].quantity = qty;
                    } else {
                      updatedProducts.push({
                        productId: prod._id,
                        name: prod.name,
                        quantity: qty,
                        price: prod.price,
                      });
                    }
                  }
                  setNewOrder({ ...newOrder, Products: updatedProducts });
                }}
              />
            </div>
          );
        })}

        <button className="create-btn" onClick={handleCreate}>
          Crear Orden
        </button>
      </div>

      <div className="orders-list">
        {orders.length > 0 ? (
          orders.map((order) => {
            // Calcular subtotal y total para mostrar, buscando precio real en products
            const ivaRate = 0.16;
            const calculatedSubtotal =
              order.Products?.reduce((acc, p) => {
                const prodDetails = products.find(
                  (prod) => prod.sku === p.sku || prod._id === p.productId
                );
                const price = prodDetails ? prodDetails.price : 0;
                const quantity = p.quantity || 1;
                return acc + price * quantity;
              }, 0) || 0;
            const calculatedTotal = +(calculatedSubtotal * (1 + ivaRate)).toFixed(2);

            // Usa createDate del backend, si no está usa updateDate o "Desconocida"
            const fechaOrden = order.createDate
              ? new Date(order.createDate)
              : order.updateDate
              ? new Date(order.updateDate)
              : null;

            return (
              <div
                className="order-card"
                key={order._id}
              >
                <div className="order-header">
                  <span>
                    <strong>Creador:</strong> {getUserNameById(order.IDUser)}
                  </span>
                  <span>
                    <strong>Estado:</strong> {order.Status}
                  </span>
                </div>
                <div className="order-body">
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {fechaOrden ? fechaOrden.toLocaleString() : "Desconocida"}
                  </p>

                  <p>
                    <strong>Subtotal:</strong> ${calculatedSubtotal.toFixed(2)}
                  </p>
                  <p>
                    <strong>Total (IVA {ivaRate * 100}%):</strong> ${calculatedTotal.toFixed(2)}
                  </p>

                  <p>
                    <strong>Productos:</strong>
                  </p>
                  <ul className="product-list">
                    {order.Products?.map((p, i) => {
                      const prodDetails = products.find(
                        (prod) => prod.sku === p.sku || prod._id === p.productId
                      );
                      const price = prodDetails ? prodDetails.price : 0;
                      const quantity = p.quantity || 1;
                      

                      return (
                        <li key={i}>
                          {prodDetails ? prodDetails.name : p.sku} - {quantity} x ${price.toFixed(2)}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {order.Status === "Pending" && (
                  <div className="order-actions">
                    <button onClick={() => confirmMarkPaid(order._id)}>
                      Marcar como Pagada
                    </button>
                    <button onClick={() => confirmCancel(order._id)}>Cancelar</button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>No hay órdenes registradas.</p>
        )}
      </div>

      <ConfirmModal
        show={modalConfig.show}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={modalConfig.onCancel}
      />
    </div>
  );
};

export default Orders;
