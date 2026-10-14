import React, { useState } from "react";
import { putRequest } from "../service/apiService";
import { FORGOT_PASSWORD } from "../config/apiConfig";
import Popup from "./popup"; // Import your Popup component
import logo from "../Assets/logojv4.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    message: '',
    type: 'default'
  });

  const showPopup = (message, type = 'default') => {
    setPopup({
      show: true,
      message,
      type
    });
  };

  const closePopup = () => {
    setPopup({
      show: false,
      message: '',
      type: 'default'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await putRequest(`${FORGOT_PASSWORD}/${email}`);

      if (response && response.status === 200) {
        showPopup(response.response, 'success');
      } else {
        showPopup(response.message, 'error');
      }
    } catch (err) {
      console.error("Forgot password request failed:", err);
      showPopup("An error occurred. Please try again later.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <img src={logo}
                    alt="Logo"
                    style={{ width: '150px', height: '60px' }} 
                    />
                  <h4 className="fw-bold text-dark mb-2">Forgot Password</h4>
                  <p className="text-muted">Enter your email to reset your password</p>
                </div>

                {/* Forgot Password Form */}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-medium">
                      Email Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-envelope text-muted"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control border-start-0 ps-0"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your registered email"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-100 py-2 fw-medium rounded-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                {/* Back to Login Link */}
                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Remember your password?{' '}
                    <a href="/" className="text-primary text-decoration-none fw-medium">
                      Back to Login
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap Icons CDN */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css"
        rel="stylesheet"
      />

      {/* Bootstrap CSS */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css"
        rel="stylesheet"
      />

      {/* Popup for messages */}
      {popup.show && (
        <Popup 
          message={popup.message} 
          type={popup.type} 
          onClose={closePopup} 
        />
      )}
    </div>
  );
};

export default ForgotPassword;