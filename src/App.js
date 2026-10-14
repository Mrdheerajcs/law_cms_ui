import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./Component/LoginForm";
import LoginPage from "./Component/LoginPage";
import ForgotPassword from "./Component/ForgotPassword";
import ViewEvent from "./Component/ViewEvent";
import ProtectedRoute from "./ProtectedRoute";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <LoginPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/view-events"
          element={
            <ProtectedRoute>
              <ViewEvent />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;