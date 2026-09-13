import React, { useState } from "react";
import { loginUser, registerUser } from "../utils/api";

export default function Header({ user, setUser, cartCount, onCartOpen, onSearch }) {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = isLogin
        ? await loginUser({ email: form.email, password: form.password })
        : await registerUser(form);
      if (res.success) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        setUser(res.user);
        setShowModal(false);
        setForm({ name: "", email: "", phone: "", password: "" });
      } else {
        setError(res.message || "Something went wrong.");
      }
    } catch {
      setError("Cannot connect to server. Make sure backend is running on port 8080.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <h1 className="logo">Quikly</h1>
          <div className="delivery-info">
            <h3>Delivery in 10 minutes</h3>
            <p>Home - Lucknow, Uttar Pradesh</p>
          </div>
        </div>
        <div className="header-center">
          <input type="text" placeholder='Search "milk, bread, chips..."' onChange={(e) => onSearch(e.target.value)} />
        </div>
        <div className="header-right">
          {user ? (
            <>
              <span className="user-name">Welcome, {user.name.split(" ")[0]}!</span>
              <button className="login-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button className="login-btn" onClick={() => setShowModal(true)}>Login</button>
          )}
          <button className="cart-btn" onClick={onCartOpen}>
            🛒 My Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </header>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h2>{isLogin ? "Login" : "Create Account"}</h2>
            {error && <p className="modal-error">{error}</p>}
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  <input placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </>
              )}
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <button type="submit" className="modal-submit" disabled={loading}>
                {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
              </button>
            </form>
            <p className="modal-switch">
              {isLogin ? "New here? " : "Already have an account? "}
              <span onClick={() => { setIsLogin(!isLogin); setError(""); }}>
                {isLogin ? "Create Account" : "Login"}
              </span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}