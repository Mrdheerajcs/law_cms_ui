import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRequest, putRequest } from "../service/apiService";

import {
  GET_ALL_EVENTS,
  UPDATE_EVENT,
  CHANGE_EVENT_STATUS,
} from "../config/apiConfig";

import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../Assets/logojv4.png";
import Popup from "./popup";

const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (!error) return fallback;
  const data = error.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data) {
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
    if (typeof data.message === "string" && data.message.trim()) return data.message;
    if (typeof data.error === "string" && data.error.trim()) return data.error;
  }
  return error.message || fallback;
};

const LIMITS = {
  subject: 255,
  desc: 50000,
};

const ViewEvent = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [saving, setSaving] = useState(false);

  const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "default",
  });

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getRequest(`${GET_ALL_EVENTS}?flag=0`);

      if (response?.status === 200) {
        const formattedData = (response.response || []).map((event) => ({
          id: event.id,
          eventType: event.eventType?.toLowerCase() || "",
          subject: event.subject || "",
          description: event.desc ?? event.description ?? "",
          isActive: event.status === "y",
        }));
        setEvents(formattedData);
      } else {
        showPopup(response?.message || "Failed to fetch events", "error");
      }
    } catch (error) {
      console.error(error);
      showPopup(getErrorMessage(error, "Failed to fetch events"), "error");
    } finally {
      setLoading(false);
    }
  };

  const showPopup = (message, type = "default") => {
    setPopup({ show: true, message, type });
    setTimeout(() => {
      setPopup({ show: false, message: "", type: "default" });
    }, 2500);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const search = searchTerm.toLowerCase();
      const subject = event.subject?.toLowerCase() || "";
      const description = event.description?.toLowerCase() || "";
      const type = event.eventType?.toLowerCase() || "";

      const matchesSearch =
        subject.includes(search) ||
        description.includes(search) ||
        type.includes(search);

      const matchesFilter =
        filterType === "all" || type === filterType.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [events, searchTerm, filterType]);

  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage) || 1;
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const openEditModal = (event) => setSelectedEvent({ ...event });
  const closeEditModal = () => setSelectedEvent(null);

  /** Edit-modal field updater with limit + popup */
  const handleEditFieldChange = (field, rawValue) => {
    const limit = LIMITS[field];

    if (limit && rawValue.length > limit) {
      showPopup(
        `Maximum ${limit} characters allowed for ${field === 'subject' ? 'subject' : 'description'}`,
        "error"
      );
      setSelectedEvent((prev) => ({ ...prev, [field]: rawValue.slice(0, limit) }));
    } else {
      setSelectedEvent((prev) => ({ ...prev, [field]: rawValue }));
    }
  };

  const validateEdit = () => {
    if (!selectedEvent) return false;

    if (!selectedEvent.eventType) {
      showPopup("Event type is required", "error");
      return false;
    }
    if (selectedEvent.eventType.length > 15) {
      showPopup("Event type must not exceed 15 characters", "error");
      return false;
    }
    if (!selectedEvent.subject?.trim()) {
      showPopup("Subject is required", "error");
      return false;
    }
    if (selectedEvent.subject.length > LIMITS.subject) {
      showPopup(`Subject must not exceed ${LIMITS.subject} characters`, "error");
      return false;
    }
    if (!selectedEvent.description?.trim()) {
      showPopup("Description is required", "error");
      return false;
    }
    if (selectedEvent.description.trim().length < 10) {
      showPopup("Description must be at least 10 characters", "error");
      return false;
    }
    if (selectedEvent.description.length > LIMITS.desc) {
      showPopup(`Description must not exceed ${LIMITS.desc} characters`, "error");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateEdit()) return;

    try {
      setSaving(true);
      const payload = {
        eventType: selectedEvent.eventType,
        subject: selectedEvent.subject,
        desc: selectedEvent.description,
      };

      const response = await putRequest(`${UPDATE_EVENT}/${selectedEvent.id}`, payload);

      if (response?.status === 200) {
        setEvents((prev) =>
          prev.map((event) =>
            event.id === selectedEvent.id ? selectedEvent : event
          )
        );
        showPopup("Event Updated Successfully", "success");
        closeEditModal();
      } else {
        showPopup(response?.message || "Update Failed", "error");
      }
    } catch (error) {
      console.error(error);
      showPopup(getErrorMessage(error, "Update failed"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const currentEvent = events.find((e) => e.id === id);
      if (!currentEvent) return;

      const newStatus = currentEvent.isActive ? "n" : "y";
      const response = await putRequest(
        `${CHANGE_EVENT_STATUS}/${id}?status=${newStatus}`
      );

      if (response?.status === 200) {
        setEvents((prev) =>
          prev.map((event) =>
            event.id === id ? { ...event, isActive: !event.isActive } : event
          )
        );
        showPopup("Status Updated", "success");
      } else {
        showPopup(response?.message || "Status Update Failed", "error");
      }
    } catch (error) {
      console.error(error);
      showPopup(getErrorMessage(error, "Status update failed"), "error");
    }
  };

  const handleBack = () => {
    const isLoggedIn = localStorage.getItem("loging");
    if (isLoggedIn === "true") navigate("/dashboard");
    else navigate("/");
  };

  return (
    <div
      className="min-vh-100 py-4"
      style={{ background: "linear-gradient(to right, #eef2f7, #d9e7ff)" }}
    >
      <div className="container-fluid px-lg-5">
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
          <div
            className="position-relative text-white p-4"
            style={{ background: "linear-gradient(135deg, #0d6efd, #084298)" }}
          >
            <img
              src={logo}
              alt="logo"
              style={{ width: "120px", position: "absolute", left: "20px", top: "12px" }}
            />
            <h2 className="text-center fw-bold mb-0">Event Management</h2>
          </div>

          <div className="card-body p-4">
            <div className="row g-3 mb-4">
              <div className="col-md-8">
                <div className="input-group shadow-sm">
                  <span className="input-group-text bg-white border-0">🔍</span>
                  <input
                    type="text"
                    className="form-control border-0 shadow-none"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <select
                  className="form-select shadow-sm"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="news">News</option>
                  <option value="event">Event</option>
                  <option value="webinar">Webinar</option>
                  <option value="blog">Blog</option>
                  <option value="article">Article</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3">Loading Events...</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead style={{ background: "#f4f7fb" }}>
                      <tr>
                        <th>Type</th>
                        <th>Subject</th>
                        <th>Description</th>
                        <th className="text-center">Status</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentEvents.length > 0 ? (
                        currentEvents.map((event) => (
                          <tr key={event.id} className="shadow-sm" style={{ borderRadius: "12px" }}>
                            <td>
                              <span className="badge bg-primary px-3 py-2">
                                {event.eventType}
                              </span>
                            </td>
                            <td className="fw-semibold">{event.subject}</td>
                            <td style={{ maxWidth: "350px" }}>
                              <div
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {event.description}
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="form-check form-switch d-flex justify-content-center">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={event.isActive}
                                  onChange={() => handleToggle(event.id)}
                                  style={{ width: "3em", height: "1.5em" }}
                                />
                              </div>
                              <small
                                className={
                                  event.isActive
                                    ? "text-success fw-bold"
                                    : "text-danger fw-bold"
                                }
                              >
                                {event.isActive ? "ACTIVE" : "INACTIVE"}
                              </small>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-light border shadow-sm"
                                onClick={() => openEditModal(event)}
                              >
                                ✏️ Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-5">
                            No Events Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredEvents.length > 0 && (
                  <nav className="mt-4">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        >
                          Prev
                        </button>
                      </li>

                      {[...Array(totalPages)].map((_, index) => (
                        <li
                          key={index}
                          className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                        >
                          <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                            {index + 1}
                          </button>
                        </li>
                      ))}

                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button
                          className="page-link"
                          onClick={() =>
                            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                          }
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}

                <div className="text-center mt-4">
                  <button className="btn btn-outline-primary px-4" onClick={handleBack}>
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {selectedEvent && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Edit Event</h5>
                <button className="btn-close btn-close-white" onClick={closeEditModal} />
              </div>

              <div className="modal-body p-4">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Event Type</label>
                  <select
                    className="form-select"
                    value={selectedEvent.eventType}
                    onChange={(e) =>
                      setSelectedEvent({ ...selectedEvent, eventType: e.target.value })
                    }
                  >
                    <option value="news">News</option>
                    <option value="event">Event</option>
                    <option value="webinar">Webinar</option>
                    <option value="blog">Blog</option>
                    <option value="article">Article</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Subject <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      selectedEvent.subject?.length >= LIMITS.subject ? "is-invalid" : ""
                    }`}
                    value={selectedEvent.subject}
                    onChange={(e) => handleEditFieldChange("subject", e.target.value)}
                    // no maxLength — clip in handler + popup
                  />
                  <div
                    className={`form-text text-end ${
                      selectedEvent.subject?.length >= LIMITS.subject ? "text-danger fw-bold" : ""
                    }`}
                  >
                    {selectedEvent.subject?.length || 0}/{LIMITS.subject} characters
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Description <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 align-items-start pt-2">
                      <i className="bi bi-text-paragraph text-muted"></i>
                    </span>
                    <textarea
                      className={`form-control border-start-0 ps-0 ${
                        selectedEvent.description?.length >= LIMITS.desc ? "is-invalid" : ""
                      }`}
                      rows="6"
                      value={selectedEvent.description}
                      onChange={(e) => handleEditFieldChange("description", e.target.value)}
                      placeholder="Provide details about your event..."
                      // no maxLength — clip in handler + popup
                    />
                  </div>
                  <div
                    className={`form-text text-end ${
                      selectedEvent.description?.length >= LIMITS.desc ? "text-danger fw-bold" : ""
                    }`}
                  >
                    {selectedEvent.description?.length || 0}/{LIMITS.desc} characters
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-light border" onClick={closeEditModal}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary px-4"
                  onClick={handleUpdate}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {popup.show && (
        <Popup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ show: false, message: "", type: "default" })}
        />
      )}
    </div>
  );
};

export default ViewEvent;