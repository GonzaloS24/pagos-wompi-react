import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PaymentContainer from "./pages/payment/PaymentContainer";
import TransactionConfirmation from "./pages/confirmation/TransactionConfirmation";
import RecurringPaymentPage from "./pages/payment/RecurringPaymentPage";
import AdminPage from "./admin/AdminPage";
import PrivateRoute from "./privateRoutes/PrivateRoute";
import Login from "./admin/auth/login/Login";
import { AuthProvider } from "./context/auth/AuthProvider";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PaymentContainer />} />
          <Route path="/admin-login" element={<Login />} />
          <Route
            path="/transaction-summary"
            element={<TransactionConfirmation />}
          />
          <Route path="/recurring-payment" element={<RecurringPaymentPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/admin-dashboard" element={<AdminPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
