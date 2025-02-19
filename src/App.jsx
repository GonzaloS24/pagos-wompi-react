import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WompiPayment from "./pages/wompi/WompiPayment";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WompiPayment />} />
      </Routes>
    </Router>
  );
};

export default App;
