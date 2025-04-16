import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WompiPayment from "./pages/wompi/WompiPayment";
import Confirmation from "./pages/confirmation/Confirmation";
import TransactionCanceled from "./pages/canceled/TransactionCanceled";
import StripeConfirmation from "./pages/confirmation/ConfirmationStripe";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WompiPayment />} />
        <Route path="/transaction-summary-wompi" element={<Confirmation />} />
        <Route path="/transaction-summary-stripe" element={<StripeConfirmation />} />
        <Route path="/transaction-canceled" element={<TransactionCanceled />} />
      </Routes>
    </Router>
  );
};

export default App;