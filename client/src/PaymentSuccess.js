const PaymentSuccess = () => {
  return (
    <div style={styles.container}>
      <h1 style={{ color: "green" }}>✅ Payment Successful</h1>
      <p>Thank you for your payment.</p>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#eaffea",
  },
};

export default PaymentSuccess;
