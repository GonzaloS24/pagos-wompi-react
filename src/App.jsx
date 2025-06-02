import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PaymentContainer from "./pages/payment/PaymentContainer";
import Confirmation from "./pages/confirmation/Confirmation";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PaymentContainer />} />
        <Route path="/transaction-summary" element={<Confirmation />} />
      </Routes>
    </Router>
  );
};

export default App;
