// import WompiPayment from "./components/wompiPayment/WompiPayment";
import PaymentButton from "./components/wompiTest/WompiTest";

const App = () => {
  return (
    <div>
      {/* <WompiPayment /> */}
      <PaymentButton amount={50000} reference="pedido-123" webhookUrl="https://webhook-test.com/a3af9ab23fe8512e4d15629cc5a5ea28" />
    </div>
  );
};

export default App;
