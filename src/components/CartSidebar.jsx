import React, { useEffect, useState } from "react";
import { getCart, removeFromCart, addToCart, placeOrder } from "../utils/api";

export default function CartSidebar({ token, open, onClose, onCartUpdate }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const fetchCart = async () => {
    if (!token) return;
    const res = await getCart(token);
    if (res.success) { setItems(res.items); setTotal(res.totalAmount); }
  };

  useEffect(() => { if (open) fetchCart(); }, [open, token]);

  const handleQty = async (productId, newQty) => {
    if (newQty < 1) await removeFromCart(token, productId);
    else await addToCart(token, productId, newQty);
    fetchCart(); onCartUpdate();
  };

  const handleOrder = async () => {
    if (!token) { alert("Please login first!"); return; }
    setLoading(true);
    const res = await placeOrder(token, { payment_method: "cod" });
    setLoading(false);
    if (res.success) {
      setOrderPlaced(true); setItems([]); setTotal(0); onCartUpdate();
      setTimeout(() => { setOrderPlaced(false); onClose(); }, 3000);
    } else {
      alert(res.message || "Failed to place order.");
    }
  };

  const deliveryCharge = parseFloat(total) >= 199 ? 0 : 25;
  const finalAmount = parseFloat(total || 0) + deliveryCharge;

  if (!open) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>🛒 My Cart</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {orderPlaced ? (
          <div className="order-success">
            <div style={{fontSize:64}}>🎉</div>
            <h3>Order Placed!</h3>
            <p>Your order will be delivered in 10 minutes.</p>
          </div>
        ) : !token ? (
          <div className="cart-empty"><p>Please login to view your cart.</p></div>
        ) : items.length === 0 ? (
          <div className="cart-empty">
            <div style={{fontSize:60}}>🛒</div>
            <p>Your cart is empty</p>
            <span>Add items to get started!</span>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-item" key={item.product_id}>
                  <img src={item.image_url || "https://via.placeholder.com/60"} alt={item.name}
                    onError={(e) => e.target.src = "https://via.placeholder.com/60"} />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    {item.unit && <span className="cart-item-unit">{item.unit}</span>}
                    <p className="cart-item-price">₹{item.price} × {item.quantity}</p>
                  </div>
                  <div className="cart-item-controls">
                    <button onClick={() => handleQty(item.product_id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleQty(item.product_id, item.quantity + 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="cart-row"><span>Subtotal</span><span>₹{total}</span></div>
              <div className="cart-row">
                <span>Delivery</span>
                <span>{deliveryCharge === 0 ? <span className="free">FREE</span> : `₹${deliveryCharge}`}</span>
              </div>
              {deliveryCharge > 0 && <p className="free-delivery-hint">Add ₹{(199 - parseFloat(total)).toFixed(0)} more for free delivery</p>}
              <div className="cart-row total"><span>Total</span><span>₹{finalAmount.toFixed(2)}</span></div>
              <button className="checkout-btn" onClick={handleOrder} disabled={loading}>
                {loading ? "Placing Order..." : `Place Order • ₹${finalAmount.toFixed(2)}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}