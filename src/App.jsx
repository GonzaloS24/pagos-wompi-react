import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import StripePayment from "./pages/wompi/StripePayment";
import StripeConfirmation from "./pages/confirmation/Confirmation";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StripePayment />} />
        <Route path="/transaction-summary" element={<StripeConfirmation />} />
      </Routes>
    </Router>
  );
};

export default App;
