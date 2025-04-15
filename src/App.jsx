import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import StripePayment from "./pages/wompi/StripePayment";
import StripeConfirmation from "./pages/confirmation/Confirmation";
import TransactionCanceled from "./pages/canceled/TransactionCanceled";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StripePayment />} />
        <Route path="/transaction-summary" element={<StripeConfirmation />} />
        <Route path="/transaction-canceled" element={<TransactionCanceled />} />
      </Routes>
    </Router>
  );
};

export default App;
