const PaymentFailed = () => {
    console.log("Payment Failed Component Rendered");
  return (
    <div style={styles.container}>
      <h1 style={{ color: "red" }}>❌ Payment Failed</h1>
      <p>Please try again.</p>
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
    background: "#ffecec",
  },
};

export default PaymentFailed;
