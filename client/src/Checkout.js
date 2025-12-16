import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
// import API_BASE_URL from "./utils/config";
import "./Checkout.css";

const Checkout = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handlePay = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        `/api/payment/create-payment-intent`,
        { amount: 500 }
      );

      const result = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        //   return_url: "http://localhost:3000/payment-success",
        }
      );

   if (result.error) {

  window.location.href = "/payment-failed";
} else if (result.paymentIntent.status === "succeeded") {

  window.location.href = "/payment-success";
}
    } catch (err) {
      window.location.href = "/payment-failed";
    }
  };

  return (
    <div className="container">
      <form className="card" onSubmit={handlePay}>
        <h2>Complete Payment</h2>
        <p>Amount: ₹500</p>

        <div className="card-input">
          <CardElement />
        </div>

        <button type="submit" disabled={!stripe}>
          Pay Now
        </button>
      </form>
    </div>
  );
};

export default Checkout;
