import React from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import OfferBanner from "./components/OfferBanner";
import Category from "./components/Category";
import ProductCard from "./components/ProductCard";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const products = [
    {
      id: 1,
      name: "Amul Milk",
      price: "₹32",
      image: "https://m.media-amazon.com/images/I/61rttYw7bCL.jpg",
    },
    {
      id: 2,
      name: "Banana",
      price: "₹70",
      image: "https://m.media-amazon.com/images/I/51ebZJ+DR4L.jpg",
    },
    {
      id: 3,
      name: "Book",
      price: "₹40",
      image: "https://m.media-amazon.com/images/I/71QKQ9mwV7L.jpg",
    },
    {
      id: 4,
      name: "iphone 14",
      price: "₹20",
      image: "https://m.media-amazon.com/images/I/71v2jVh6nIL.jpg",
    },
  ];

  return (
    <div className="app">
      <Header />
      <Hero />
      <OfferBanner />
      <Category />

      <section className="products-section">
        <h2>Best Sellers</h2>

        <div className="products-grid">
          {products.map((item) => (
            <ProductCard
              key={item.id}
              name={item.name}
              price={item.price}
              image={item.image}
            />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default App;