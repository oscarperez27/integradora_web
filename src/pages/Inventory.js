import React, { useState, useEffect } from "react";
import {
  MdAdd,
  MdDeleteOutline,
  MdEdit,
  MdSearch,
} from "react-icons/md";
import "./Inventory.css";

const initialInventoryData = [
  { sku: "PROT-WH001", name: "Proteína Whey Gold Standard 2lb", category: "Proteínas", stock: 25, price: "$850.00", status: "in-stock" },
  { sku: "CREA-MON005", name: "Creatina Monohidratada 300g", category: "Creatinas", stock: 8, price: "$450.00", status: "low-stock" },
  { sku: "PREW-C4001", name: "C4 Pre-Entreno Explosivo", category: "Pre-Entrenos", stock: 0, price: "$600.00", status: "out-of-stock" },
  { sku: "ACC-SHK003", name: "Shaker Prime Gym Logo", category: "Accesorios", stock: 50, price: "$150.00", status: "in-stock" },
  { sku: "ROPA-TSH01", name: "Playera Dry-Fit", category: "Ropa", stock: 12, price: "$300.00", status: "low-stock" },
  { sku: "SUP-BCAA001", name: "BCAAs Aminoácidos", category: "Proteínas", stock: 18, price: "$550.00", status: "in-stock" },
];

const categories = [
  "Proteínas",
  "Creatinas",
  "Pre-Entrenos",
  "Ropa",
  "Accesorios",
];

const stockStatus = [
  { value: "", label: "Todos los estados" },
  { value: "in-stock", label: "En Stock" },
  { value: "low-stock", label: "Stock Bajo" },
  { value: "out-of-stock", label: "Agotado" },
];

const statusMap = {
  "in-stock": { label: "En Stock", class: "status-in-stock" },
  "low-stock": { label: "Stock Bajo", class: "status-low-stock" },
  "out-of-stock": { label: "Agotado", class: "status-out-of-stock" },
};

function InventoryFormModal({ show, onClose, onSave, initial }) {
  const isEdit = !!initial?.sku;
  const [sku, setSku] = useState(initial?.sku || "");
  const [name, setName] = useState(initial?.name || "");
  const [category, setCategory] = useState(initial?.category || categories[0]);
  const [stock, setStock] = useState(initial?.stock || 0);
  const [price, setPrice] = useState(initial?.price || "");
  const [status, setStatus] = useState(initial?.status || "in-stock");

  useEffect(() => {
    if (show) {
      setSku(initial?.sku || "");
      setName(initial?.name || "");
      setCategory(initial?.category || categories[0]);
      setStock(initial?.stock || 0);
      setPrice(initial?.price || "");
      setStatus(initial?.status || "in-stock");
    }
  }, [show, initial]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim() || !category.trim() || !price.trim()) {
      alert("Todos los campos son obligatorios.");
      return;
    }
    if (isNaN(Number(stock)) || Number(stock) < 0) {
      alert("El stock debe ser un número igual o mayor a 0.");
      return;
    }
    onSave({
      sku: sku.trim(),
      name: name.trim(),
      category: category.trim(),
      stock: Number(stock),
      price: price.trim(),
      status,
    });
  };

  return (
    <div className="modal-backdrop">
      <form className="modal-form" onSubmit={handleSubmit}>
        <h2>{isEdit ? "Editar Producto" : "Añadir Producto"}</h2>
        <label>
          SKU
          <input
            type="text"
            value={sku}
            onChange={e => setSku(e.target.value)}
            required
            disabled={isEdit}
          />
        </label>
        <label>
          Nombre
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Categoría
          <select value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Stock
          <input
            type="number"
            min="0"
            value={stock}
            onChange={e => setStock(e.target.value)}
            required
          />
        </label>
        <label>
          Precio
          <input
            type="text"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="$0.00"
            required
          />
        </label>
        <label>
          Estado
          <select value={status} onChange={e => setStatus(e.target.value)}>
            {stockStatus.slice(1).map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
        <div className="modal-actions">
          <button type="submit">{isEdit ? "Guardar Cambios" : "Crear Producto"}</button>
          <button type="button" className="cancel" onClick={onClose}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

const Inventory = () => {
  const [products, setProducts] = useState(initialInventoryData);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStockStatus, setFilterStockStatus] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState(null);

  // Filter and search
  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    const matchesStockStatus = !filterStockStatus || product.status === filterStockStatus;
    return matchesSearch && matchesCategory && matchesStockStatus;
  });

  // CRUD handlers
  const handleAddProduct = () => {
    setModalInitial(null);
    setModalOpen(true);
  };

  const handleEditProduct = (sku) => {
    const product = products.find(p => p.sku === sku);
    setModalInitial({ ...product });
    setModalOpen(true);
  };

  const handleDeleteProduct = (sku) => {
    if (window.confirm("¿Está seguro de eliminar este producto?")) {
      setProducts(products => products.filter(p => p.sku !== sku));
    }
  };

  const handleModalSave = (product) => {
    setProducts(products => {
      const index = products.findIndex(p => p.sku === product.sku);
      if (index !== -1) {
        // Edit
        return products.map(p => (p.sku === product.sku ? { ...product } : p));
      } else {
        // Create
        return [...products, product];
      }
    });
    setModalOpen(false);
    setModalInitial(null);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setModalInitial(null);
  };

  return (
    <div className="inventory-container">
      <h1 className="inventory-title">Control de Inventario</h1>
      <h2 className="inventory-subtitle">Suplementos y Productos</h2>

      <div className="actions-bar">
        <button className="btn-primary" onClick={handleAddProduct}>
          <MdAdd size={20} style={{ marginRight: 6 }} />
          Añadir Producto
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-group">
          <MdSearch size={22} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Buscar por nombre o SKU"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las categorías</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            value={filterStockStatus}
            onChange={e => setFilterStockStatus(e.target.value)}
            className="filter-select"
          >
            {stockStatus.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-scroll-x">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="no-products-cell">
                  No hay productos que coincidan con los filtros.
                </td>
              </tr>
            )}
            {filteredProducts.map(product => (
              <tr key={product.sku}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.stock}</td>
                <td>{product.price}</td>
                <td>
                  <span className={`stock-status-pill ${statusMap[product.status]?.class}`}>
                    {statusMap[product.status]?.label || product.status}
                  </span>
                </td>
                <td>
                  <button
                    className="icon-btn"
                    title="Editar"
                    onClick={() => handleEditProduct(product.sku)}
                  >
                    <MdEdit color="#3498db" size={20} />
                  </button>
                  <button
                    className="icon-btn"
                    title="Eliminar"
                    onClick={() => handleDeleteProduct(product.sku)}
                  >
                    <MdDeleteOutline color="#e74c3c" size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InventoryFormModal
        show={modalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        initial={modalInitial}
      />
    </div>
  );
};

export default Inventory;