import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WompiPayment from "./pages/wompi/WompiPayment";
import Confirmation from "./pages/confirmation/Confirmation";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WompiPayment />} />
        <Route path="/transaction-summary" element={<Confirmation />} />
      </Routes>
    </Router>
  );
};

export default App;
