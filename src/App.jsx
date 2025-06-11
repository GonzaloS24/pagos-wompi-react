import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PaymentContainer from "./pages/payment/PaymentContainer";
import TransactionConfirmation from "./pages/confirmation/TransactionConfirmation";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentContainer />} />
        <Route
          path="/transaction-summary"
          element={<TransactionConfirmation />}
        />
      </Routes>
    </Router>
  );
};

export default App;
