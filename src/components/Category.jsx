import React from "react";

export default function Category() {
  const categories = [
    "Fruits & Vegetables",
    "Dairy, Bread & Eggs",
    "Snacks & Munchies",
    "Cold Drinks & Juices",
    "Tea & Coffee",
    "Bakery & Biscuits",
    "Frozen Food",
    "Beauty & Personal Care",
  ];

  return (
    <section className="category-section">
      <h2>Shop by Category</h2>

      <div className="category-grid">
        {categories.map((item, index) => (
          <div className="category-card" key={index}>
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}