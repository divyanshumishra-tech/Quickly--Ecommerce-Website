import React from "react";

export default function ProductCard({ name, price, image }) {
  return (
    <div className="product-card">
      <img
        src={image}
        alt={name}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/150";
        }}
      />

      <h3>{name}</h3>
      <p>{price}</p>

      <div className="product-bottom">
        <button>-</button>
        <span>1</span>
        <button>+</button>
      </div>

      <button className="add-btn">Add to Cart</button>
    </div>
  );
}