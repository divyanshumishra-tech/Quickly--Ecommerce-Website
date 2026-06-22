import React, { useState } from "react";
import { addToCart, removeFromCart } from "../utils/api";

export default function ProductCard({ product, token, onCartUpdate }) {
  const [qty, setQty] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!token) { alert("Please login to add items to cart!"); return; }
    setLoading(true);
    const newQty = qty + 1;
    const res = await addToCart(token, product.id, newQty);
    if (res.success) { setQty(newQty); onCartUpdate(); }
    setLoading(false);
  };

  const handleDecrease = async () => {
    if (qty <= 1) {
      await removeFromCart(token, product.id);
      setQty(0);
    } else {
      await addToCart(token, product.id, qty - 1);
      setQty(qty - 1);
    }
    onCartUpdate();
  };

  return (
    <div className="product-card">
      <img src={product.image_url || "https://via.placeholder.com/150"} alt={product.name}
        onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} />
      {product.discount > 0 && <span className="discount-badge">{product.discount}% OFF</span>}
      <h3>{product.name}</h3>
      {product.unit && <p className="product-unit">{product.unit}</p>}
      <div className="product-price">
        <span className="price">₹{product.price}</span>
        {product.mrp > product.price && <span className="mrp">₹{product.mrp}</span>}
      </div>
      <div className="product-bottom">
        {qty === 0 ? (
          <button className="add-btn" onClick={handleAdd} disabled={loading}>{loading ? "..." : "Add"}</button>
        ) : (
          <div className="qty-controls">
            <button onClick={handleDecrease}>−</button>
            <span>{qty}</span>
            <button onClick={handleAdd}>+</button>
          </div>
        )}
      </div>
    </div>
  );
}