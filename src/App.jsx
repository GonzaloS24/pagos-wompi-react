import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PaymentContainer from "./pages/payment/PaymentContainer";
import TransactionConfirmation from "./pages/confirmation/TransactionConfirmation";
import RecurringPaymentPage from "./pages/payment/RecurringPaymentPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentContainer />} />
        <Route
          path="/transaction-summary"
          element={<TransactionConfirmation />}
        />
        <Route path="/recurring-payment" element={<RecurringPaymentPage />} />
      </Routes>
    </Router>
  );
};

export default App;
