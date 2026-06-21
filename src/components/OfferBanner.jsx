import React from "react";

export default function OfferBanner() {
  const offers = [
    "⚡ Up to 50% OFF on Snacks",
    "🥛 Fresh Dairy Products Delivered Fast",
    "🍎 Fruits & Vegetables at Best Price",
    "🛒 Free Delivery on Orders Above ₹99",
  ];

  return (
    <section className="offer-banner">
      {offers.map((offer, index) => (
        <div className="offer-card" key={index}>
          {offer}
        </div>
      ))}
    </section>
  );
}