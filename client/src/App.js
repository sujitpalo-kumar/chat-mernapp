import { BrowserRouter, Routes, Route } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Checkout from "./Checkout";
import PaymentSuccess from "./PaymentSuccess";
import PaymentFailed from "./PaymentFailed";
// import Chat from "./components/Chat";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

const stripePromise = loadStripe("pk_test_51SeVvbD5l38WCeMuOfFP8eangG7vKtWisG1myokGLQfCRnwJwkelFoZ0B2mfU7ChAlSihip2YwzgRblDm46oeT2D008KVqjDoT");


function App() {
  return (
 <AuthProvider>
     <BrowserRouter>
      <Elements stripe={stripePromise}>
        <Routes>
           {/* <Route path="/" element={<Chat />} /> */}
          <Route path="/payment" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />

              <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Elements>
    </BrowserRouter>

</AuthProvider>
 
  );
}

export default App;
