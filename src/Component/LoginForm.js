import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import logo from '../Assets/logojv4.png';
import { postRequest } from "../service/apiService";
import { LOGIN } from "../config/apiConfig";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errorMessage) {
      setErrorMessage('');
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setErrorMessage('');
  
  try {
    const response = await postRequest(LOGIN, {
      username: formData.username,
      password: formData.password
    });

    if (response && response.status === 200) {
      // Store user data based on remember me selection
      if (formData.rememberMe) {
        localStorage.setItem("username", response.response.username);
        localStorage.setItem("rememberMe", "true");
      } else {
        sessionStorage.setItem("username", response.response.username);
        sessionStorage.removeItem("rememberMe");
      }

      // ✅ store as string
      localStorage.setItem("loging", "true");

      // Navigate to dashboard
      navigate("/dashboard");
    } else {
      setErrorMessage("Login failed. Please check your credentials.");
    }
  } catch (error) {
    console.error("Login request failed:", error);
    setErrorMessage("Invalid email or password. Please try again.");
  } finally {
    setIsLoading(false);
  }
};


  const handleForgotPassword = () => {
    navigate("/forgot-password");
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
                  <div className="mb-3">
                    <img src={logo}
                    alt="Logo"
                    style={{ width: '120px', height: '60px' }} 
                    />
                  </div>
                  {/*<h3 className="fw-bold text-dark mb-2">Welcome Back</h3>
                  //<p className="text-muted">Please sign in to your account</p>*/}
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {errorMessage}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setErrorMessage('')}
                    ></button>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  {/* Username Field */}
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label fw-medium">
                      Username
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-person text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-medium">
                      Password
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-lock text-muted"></i>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0 ps-0"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        className="btn btn-outline-secondary border-start-0"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label text-muted" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      className="btn btn-link text-decoration-none p-0 text-primary"
                      onClick={handleForgotPassword}
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-medium rounded-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                {/* Divider */}
                {/*<div className="position-relative my-4">
                  <hr className="text-muted" />
                  <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                    or
                  </span>
                </div>*/}

                {/* Social Login Options */}
                {/*<div className="d-grid gap-2">
                  <button className="btn btn-outline-danger rounded-3">
                    <i className="bi bi-google me-2"></i>
                    Continue with Google
                  </button>
                  <button className="btn btn-outline-primary rounded-3">
                    <i className="bi bi-facebook me-2"></i>
                    Continue with Facebook
                  </button>
                </div>*/}

                {/* Sign Up Link */}
                {/*<div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Don't have an account?{' '}
                    <a href="#" className="text-primary text-decoration-none fw-medium">
                      Sign up here
                    </a>
                  </p>
                </div>*/}
              </div>
            </div>

            {/* Footer */}
            {/*<div className="text-center mt-4">
              <p className="text-muted small mb-0">
                © 2025 Your Company. All rights reserved.
              </p>
            </div>*/}
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
    </div>
  );
};

export default LoginForm;