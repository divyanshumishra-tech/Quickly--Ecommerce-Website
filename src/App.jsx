import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import OfferBanner from "./components/OfferBanner";
import Category from "./components/Category";
import ProductCard from "./components/ProductCard";
import CartSidebar from "./components/CartSidebar";
import Footer from "./components/Footer";
import { getProducts, getCart } from "./utils/api";
import "./App.css";

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);
    const timer = setTimeout(() => {
      setLoading(true);
      getProducts(params.toString())
        .then((res) => { if (res.success) setProducts(res.products); else setProducts([]); })
        .catch(() => setProducts([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const refreshCartCount = async () => {
    const t = localStorage.getItem("token");
    if (!t) { setCartCount(0); return; }
    const res = await getCart(t);
    if (res.success) setCartCount(res.totalItems || res.items?.length || 0);
  };

  useEffect(() => { refreshCartCount(); }, [user]);

  return (
    <div className="app">
      <Header
        user={user}
        setUser={(u) => { setUser(u); setToken(localStorage.getItem("token")); }}
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onSearch={setSearch}
      />
      <Hero />
      <OfferBanner />
      <Category onCategorySelect={(slug) => setSelectedCategory(slug)} />
      <section className="products-section">
        <div className="products-section-header">
          <h2>{search ? `Results for "${search}"` : selectedCategory ? "Category Products" : "Best Sellers"}</h2>
          {selectedCategory && (
            <button className="clear-filter" onClick={() => setSelectedCategory("")}>✕ Clear filter</button>
          )}
        </div>
        {loading ? (
          <div className="products-loading">{[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}</div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <p>🛍️ No products found{search ? ` for "${search}"` : ""}.</p>
            <p style={{color:"#888", marginTop:8}}>Add products via the API or seed script.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} token={token} onCartUpdate={refreshCartCount} />
            ))}
          </div>
        )}
      </section>
      <Footer />
      <CartSidebar token={token} open={cartOpen} onClose={() => setCartOpen(false)} onCartUpdate={refreshCartCount} />
    </div>
  );
}

export default App;