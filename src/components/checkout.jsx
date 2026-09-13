import { useState } from "react";

const API = import.meta.env.VITE_API_URL;
const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * Opens Razorpay's secure payment window.
 *
 * The server must expose POST /payments/create-order and POST /payments/verify.
 * Neither the Razorpay key secret nor payment verification belongs in the browser.
 */
export default function Checkout({
  amount,
  token,
  customer = {},
  disabled = false,
  onSuccess,
  onFailure,
  buttonText,
}) {
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    if (!token) {
      onFailure?.("Please log in before making a payment.");
      return;
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      onFailure?.("The payment amount is invalid.");
      return;
    }

    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Unable to load Razorpay. Please check your connection and try again.");

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const orderResponse = await fetch(`${API}/payments/create-order`, {
        method: "POST",
        headers,
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const order = await orderResponse.json();

      if (!orderResponse.ok || !order.success) {
        throw new Error(order.message || "Could not start the payment.");
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Blinkit",
        description: "Grocery order payment",
        order_id: order.orderId,
        prefill: {
          name: customer.name || "",
          email: customer.email || "",
          contact: customer.phone || "",
        },
        theme: { color: "#0c831f" },
        handler: async (response) => {
          try {
            const verificationResponse = await fetch(`${API}/payments/verify`, {
              method: "POST",
              headers,
              body: JSON.stringify(response),
            });
            const verification = await verificationResponse.json();

            if (!verificationResponse.ok || !verification.success) {
              throw new Error(verification.message || "Payment verification failed.");
            }
            onSuccess?.(verification);
          } catch (error) {
            onFailure?.(error.message || "We could not verify your payment.");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      checkout.on("payment.failed", (response) => {
        setLoading(false);
        onFailure?.(response.error?.description || "Payment failed. Please try again.");
      });
      checkout.open();
    } catch (error) {
      setLoading(false);
      onFailure?.(error.message || "Unable to start payment.");
    }
  };

  return (
    <button type="button" className="checkout-btn" onClick={pay} disabled={disabled || loading}>
      {loading ? "Opening payment..." : buttonText || `Pay ₹${Number(amount || 0).toFixed(2)}`}
    </button>
  );
}
