import React from "react";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-left">
        <h1>
          Groceries delivered in <span>10 minutes</span>
        </h1>
        <p>
          Fresh vegetables, fruits, snacks and daily essentials
          delivered at your doorstep.
        </p>
        <button>Order Now</button>
      </div>

      <div className="hero-right">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"
          alt="groceries"
        />
      </div>
    </section>
  );
}