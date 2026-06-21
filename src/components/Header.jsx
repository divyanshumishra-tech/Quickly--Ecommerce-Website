import React from "react";

export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">Blinkit</h1>
        <div className="delivery-info">
          <h3>Delivery in 10 minutes</h3>
          <p>Home - Lucknow, Uttar Pradesh</p>
        </div>
      </div>

      <div className="header-center">
        <input
          type="text"
          placeholder='Search "milk, bread, chips..."'
        />
      </div>

      <div className="header-right">
        <button className="login-btn">Login</button>
        <button className="cart-btn">My Cart</button>
      </div>
    </header>
  );
}