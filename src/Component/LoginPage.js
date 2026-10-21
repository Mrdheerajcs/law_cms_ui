import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { postRequest } from "../service/apiService";
import { CREATE_EVENT } from "../config/apiConfig";
import Popup from "./popup";
import logo from "../Assets/logojv4.png";

/**
 * Extract a human-readable message from any axios/fetch/unknown error.
 * Handles:
 *  - { response: { subject: "..." , desc: "..." }, message: "..." }  (validation map)
 *  - { response: null, message: "..." }                             (ApiResponse error)
 *  - plain string body
 *  - raw Error object
 */
const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (!error) return fallback;

  const data = error.response?.data;

  if (typeof data === "string" && data.trim()) return data;

  if (data) {
    // Field-level validation errors: { response: { field: "msg", ... }, message: "..." }
    if (
      data.response &&
      typeof data.response === "object" &&
      !Array.isArray(data.response)
    ) {
      const values = Object.values(data.response).filter(
        (v) => typeof v === "string" && v.trim()
      );
      if (values.length) return values.join(" | ");
    }

    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
  }

  return error.message || fallback;
};

const JVEventPage = () => {
  const [formData, setFormData] = useState({
    eventType: '',
    subject: '',
    desc: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    message: '',
    type: 'default'
  });
  const navigate = useNavigate();

  const eventTypes = [
    { value: '', label: 'Select an event type' },
    { value: 'news', label: 'News' },
    { value: 'event', label: 'Event' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'blog', label: 'Blogs' },
    { value: 'article', label: 'Articles' },
  ];

  const handleToggleEvents = () => {
    const isLoggedIn = localStorage.getItem("loging");
    if (isLoggedIn === "true") {
      navigate("/view-events");
    } else {
      navigate("/");
    }
  };

  const showPopup = (message, type = 'default') => {
    setPopup({ show: true, message, type });
  };

  const closePopup = () => {
    setPopup({ show: false, message: '', type: 'default' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {};

    if (!formData.eventType) {
      newErrors.eventType = 'Please select an event type';
      valid = false;
    } else if (formData.eventType.length > 15) {
      newErrors.eventType = 'Event type must not exceed 15 characters';
      valid = false;
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Please provide a subject';
      valid = false;
    } else if (formData.subject.length > 255) {
      newErrors.subject = 'Subject must not exceed 255 characters';
      valid = false;
    }

    if (!formData.desc.trim()) {
      newErrors.desc = 'Please provide a description';
      valid = false;
    } else if (formData.desc.trim().length < 10) {
      newErrors.desc = 'Description must be at least 10 characters long';
      valid = false;
    } else if (formData.desc.trim().length > 50000) {
      newErrors.desc = 'Description must not exceed 50000 characters';
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) {
      // Show first error as popup too
      const first = Object.values(newErrors)[0];
      if (first) showPopup(first, 'error');
    }

    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const isLoggedIn = () => localStorage.getItem("loging") === "true";
    if (!isLoggedIn()) {
      navigate("/");
      return;
    }

    setIsLoading(true);

    try {
      const response = await postRequest(CREATE_EVENT, {
        eventType: formData.eventType,
        subject: formData.subject,
        desc: formData.desc
      });

      // Accept 200 OR any 2xx — backend wraps as { response, status, message }
      const statusCode = response?.status ?? 200;
      if (statusCode === 200 || (statusCode >= 200 && statusCode < 300)) {
        showPopup('Event created successfully!', 'success');
        setFormData({ eventType: '', subject: '', desc: '' });
        setErrors({});
      } else {
        showPopup(response?.message || 'Failed to create event. Please try again.', 'error');
      }
    } catch (error) {
      console.error("Create event request failed:", error);
      showPopup(getErrorMessage(error, 'Failed to create event'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-header bg-primary text-white text-center py-3 rounded-top-4 position-relative">
                <img
                  src={logo}
                  alt="Logo"
                  className="position-absolute"
                  style={{
                    width: "150px",
                    height: "50px",
                    top: "10px",
                    left: "20px",
                    borderRadius: "8px"
                  }}
                />
                <h4 className="card-title mb-0">JV Event</h4>
                <button
                  className="btn btn-danger position-absolute"
                  style={{ top: "10px", right: "20px" }}
                  onClick={() => {
                    localStorage.setItem("loging", "false");
                    sessionStorage.removeItem("username");
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </div>

              <div className="card-body p-4 p-md-5">
                <form onSubmit={handleSubmit} noValidate>
                  {/* Event Type */}
                  <div className="mb-4">
                    <label htmlFor="eventType" className="form-label fw-medium">
                      Event Type <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-calendar-event text-muted"></i>
                      </span>
                      <select
                        className={`form-select border-start-0 ps-0 ${errors.eventType ? 'is-invalid' : ''}`}
                        id="eventType"
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleInputChange}
                      >
                        {eventTypes.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.eventType && (
                      <div className="text-danger small mt-1">{errors.eventType}</div>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="mb-4">
                    <label htmlFor="subject" className="form-label fw-medium">
                      Subject <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-chat-text text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className={`form-control border-start-0 ps-0 ${errors.subject ? 'is-invalid' : ''}`}
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Enter event subject"
                        maxLength={255}
                      />
                    </div>
                    {errors.subject && (
                      <div className="text-danger small mt-1">{errors.subject}</div>
                    )}
                    <div className="form-text text-end">
                      {formData.subject.length}/255 characters
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label htmlFor="desc" className="form-label fw-medium">
                      Description <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 align-items-start pt-2">
                        <i className="bi bi-text-paragraph text-muted"></i>
                      </span>
                      <textarea
                        className={`form-control border-start-0 ps-0 ${errors.desc ? 'is-invalid' : ''}`}
                        id="desc"
                        name="desc"
                        rows="4"
                        placeholder="Provide details about your event..."
                        value={formData.desc}
                        onChange={handleInputChange}
                        maxLength={50000}
                      ></textarea>
                    </div>
                    {errors.desc && (
                      <div className="text-danger small mt-1">{errors.desc}</div>
                    )}
                    <div className="form-text text-end">
                      {formData.desc.length}/50000 characters
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Creating Event...
                        </>
                      ) : (
                        'Create Event'
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={handleToggleEvents}
                    >
                      View Events
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css"
        rel="stylesheet"
      />
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.2/css/bootstrap.min.css"
        rel="stylesheet"
      />

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

export default JVEventPage;