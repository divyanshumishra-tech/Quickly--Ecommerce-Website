import React from "react";
import image from "../assets/image.jpg";
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
          src={image}
          alt="groceries"
        />
      </div>
    </section>
  );
}