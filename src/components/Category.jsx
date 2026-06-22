import React, { useEffect, useState } from "react";
import { getCategories } from "../utils/api";

const fallback = ["Fruits & Vegetables","Dairy & Breakfast","Snacks & Munchies","Cold Drinks & Juices","Tea & Coffee","Bakery & Biscuits","Frozen Food","Beauty & Personal Care"];

export default function Category({ onCategorySelect }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then((res) => {
        if (res.success && res.categories.length > 0) setCategories(res.categories);
        else setCategories(fallback.map((name, i) => ({ id: i, name, slug: "" })));
      })
      .catch(() => setCategories(fallback.map((name, i) => ({ id: i, name, slug: "" }))));
  }, []);

  return (
    <section className="category-section">
      <h2>Shop by Category</h2>
      <div className="category-grid">
        {categories.map((cat) => (
          <div className="category-card" key={cat.id} onClick={() => onCategorySelect && onCategorySelect(cat.slug)}>
            {cat.name}
          </div>
        ))}
      </div>
    </section>
  );
}