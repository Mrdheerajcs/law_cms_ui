import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRequest,
  putRequest,
} from "../service/apiService";

import {
  GET_ALL_EVENTS,
  UPDATE_EVENT,
  CHANGE_EVENT_STATUS,
} from "../config/apiConfig";

import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../Assets/logojv4.png";
import Popup from "./popup";

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
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const response = await getRequest(
        `${GET_ALL_EVENTS}?flag=0`
      );

      if (response?.status === 200) {
        const formattedData = response.response.map(
          (event) => ({
            id: event.id,
            eventType: event.eventType?.toLowerCase(),
            subject: event.subject,
            description: event.desc,
            isActive: event.status === "y",
          })
        );

        setEvents(formattedData);
      } else {
        showPopup("Failed to fetch events", "error");
      }
    } catch (error) {
      console.error(error);
      showPopup("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };


  const showPopup = (
    message,
    type = "default"
  ) => {
    setPopup({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setPopup({
        show: false,
        message: "",
        type: "default",
      });
    }, 2500);
  };


  const filteredEvents = useMemo(() => {
    return events.filter((event) => {

      const search = searchTerm.toLowerCase();

      const subject =
        event.subject?.toLowerCase() || "";

      const description =
        event.description?.toLowerCase() || "";

      const type =
        event.eventType?.toLowerCase() || "";

      const matchesSearch =
        subject.includes(search) ||
        description.includes(search) ||
        type.includes(search);

      const matchesFilter =
        filterType === "all" ||
        type === filterType.toLowerCase();

      return matchesSearch && matchesFilter;
    });
  }, [events, searchTerm, filterType]);


  const totalPages = Math.ceil(
    filteredEvents.length / eventsPerPage
  );

  const indexOfLastEvent =
    currentPage * eventsPerPage;

  const indexOfFirstEvent =
    indexOfLastEvent - eventsPerPage;

  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );


  const openEditModal = (event) => {
    setSelectedEvent({ ...event });
  };

  const closeEditModal = () => {
    setSelectedEvent(null);
  };


  const handleUpdate = async () => {
    try {
      setSaving(true);

      const payload = {
        eventType: selectedEvent.eventType,
        subject: selectedEvent.subject,
        desc: selectedEvent.description,
      };

      const response = await putRequest(
        `${UPDATE_EVENT}/${selectedEvent.id}`,
        payload
      );

      if (response?.status === 200) {

        setEvents((prev) =>
          prev.map((event) =>
            event.id === selectedEvent.id
              ? selectedEvent
              : event
          )
        );

        showPopup(
          "Event Updated Successfully",
          "success"
        );

        closeEditModal();

      } else {
        showPopup("Update Failed", "error");
      }

    } catch (error) {
      console.error(error);
      showPopup("Something went wrong", "error");
    } finally {
      setSaving(false);
    }
  };


  const handleToggle = async (id) => {
    try {
      const currentEvent = events.find(
        (e) => e.id === id
      );

      const newStatus = currentEvent.isActive
        ? "n"
        : "y";

      const response = await putRequest(
        `${CHANGE_EVENT_STATUS}/${id}?status=${newStatus}`
      );

      if (response?.status === 200) {
        setEvents((prev) =>
          prev.map((event) =>
            event.id === id
              ? {
                ...event,
                isActive: !event.isActive,
              }
              : event
          )
        );

        showPopup(
          "Status Updated",
          "success"
        );
      } else {
        showPopup(
          "Status Update Failed",
          "error"
        );
      }
    } catch (error) {
      console.error(error);
      showPopup("Something went wrong", "error");
    }
  };


  const handleBack = () => {
    const isLoggedIn =
      localStorage.getItem("loging");

    if (isLoggedIn === "true") {
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className="min-vh-100 py-4"
      style={{
        background:
          "linear-gradient(to right, #eef2f7, #d9e7ff)",
      }}
    >
      <div className="container-fluid px-lg-5">


        <div className="card border-0 shadow-lg rounded-4 overflow-hidden">


          <div
            className="position-relative text-white p-4"
            style={{
              background:
                "linear-gradient(135deg, #0d6efd, #084298)",
            }}
          >
            <img
              src={logo}
              alt="logo"
              style={{
                width: "120px",
                position: "absolute",
                left: "20px",
                top: "12px",
              }}
            />

            <h2 className="text-center fw-bold mb-0">
              Event Management
            </h2>
          </div>


          <div className="card-body p-4">


            <div className="row g-3 mb-4">

              <div className="col-md-8">
                <div className="input-group shadow-sm">

                  <span className="input-group-text bg-white border-0">
                    🔍
                  </span>

                  <input
                    type="text"
                    className="form-control border-0 shadow-none"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="col-md-4">
                <select
                  className="form-select shadow-sm"
                  value={filterType}
                  onChange={(e) =>
                    setFilterType(
                      e.target.value
                    )
                  }
                >
                  <option value="all">
                    All Types
                  </option>
                  <option value="news">
                    News
                  </option>
                  <option value="event">
                    Event
                  </option>
                  <option value="webinar">
                    Webinar
                  </option>
                  <option value="blog">
                    Blog
                  </option>
                  <option value="article">
                    Article
                  </option>
                </select>
              </div>
            </div>


            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  role="status"
                />
                <p className="mt-3">
                  Loading Events...
                </p>
              </div>
            ) : (
              <>
                <div className="table-responsive">

                  <table className="table align-middle">

                    <thead
                      style={{
                        background: "#f4f7fb",
                      }}
                    >
                      <tr>
                        <th>Type</th>
                        <th>Subject</th>
                        <th>Description</th>
                        <th className="text-center">
                          Status
                        </th>
                        <th className="text-center">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>

                      {currentEvents.length > 0 ? (
                        currentEvents.map(
                          (event) => (
                            <tr
                              key={event.id}
                              className="shadow-sm"
                              style={{
                                borderRadius:
                                  "12px",
                              }}
                            >
                              <td>
                                <span className="badge bg-primary px-3 py-2">
                                  {
                                    event.eventType
                                  }
                                </span>
                              </td>

                              <td className="fw-semibold">
                                {event.subject}
                              </td>

                              <td
                                style={{
                                  maxWidth:
                                    "350px",
                                }}
                              >
                                <div
                                  style={{
                                    overflow:
                                      "hidden",
                                    textOverflow:
                                      "ellipsis",
                                    whiteSpace:
                                      "nowrap",
                                  }}
                                >
                                  {
                                    event.description
                                  }
                                </div>
                              </td>


                              <td className="text-center">

                                <div className="form-check form-switch d-flex justify-content-center">

                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={
                                      event.isActive
                                    }
                                    onChange={() =>
                                      handleToggle(
                                        event.id
                                      )
                                    }
                                    style={{
                                      width:
                                        "3em",
                                      height:
                                        "1.5em",
                                    }}
                                  />
                                </div>

                                <small
                                  className={
                                    event.isActive
                                      ? "text-success fw-bold"
                                      : "text-danger fw-bold"
                                  }
                                >
                                  {event.isActive
                                    ? "ACTIVE"
                                    : "INACTIVE"}
                                </small>
                              </td>


                              <td className="text-center">

                                <button
                                  className="btn btn-light border shadow-sm"
                                  onClick={() =>
                                    openEditModal(
                                      event
                                    )
                                  }
                                >
                                  ✏️ Edit
                                </button>

                              </td>
                            </tr>
                          )
                        )
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="text-center py-5"
                          >
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

                      <li
                        className={`page-item ${currentPage === 1
                          ? "disabled"
                          : ""
                          }`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            setCurrentPage(
                              (prev) =>
                                prev - 1
                            )
                          }
                        >
                          Prev
                        </button>
                      </li>

                      {[...Array(totalPages)].map(
                        (_, index) => (
                          <li
                            key={index}
                            className={`page-item ${currentPage ===
                              index + 1
                              ? "active"
                              : ""
                              }`}
                          >
                            <button
                              className="page-link"
                              onClick={() =>
                                setCurrentPage(
                                  index + 1
                                )
                              }
                            >
                              {index + 1}
                            </button>
                          </li>
                        )
                      )}

                      <li
                        className={`page-item ${currentPage ===
                          totalPages
                          ? "disabled"
                          : ""
                          }`}
                      >
                        <button
                          className="page-link"
                          onClick={() =>
                            setCurrentPage(
                              (prev) =>
                                prev + 1
                            )
                          }
                        >
                          Next
                        </button>
                      </li>

                    </ul>
                  </nav>
                )}


                <div className="text-center mt-4">
                  <button
                    className="btn btn-outline-primary px-4"
                    onClick={handleBack}
                  >
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
          style={{
            background:
              "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">

            <div className="modal-content border-0 rounded-4 shadow-lg">


              <div className="modal-header bg-primary text-white">

                <h5 className="modal-title">
                  Edit Event
                </h5>

                <button
                  className="btn-close btn-close-white"
                  onClick={closeEditModal}
                />
              </div>


              <div className="modal-body p-4">


                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Event Type
                  </label>

                  <select
                    className="form-select"
                    value={
                      selectedEvent.eventType
                    }
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        eventType:
                          e.target.value,
                      })
                    }
                  >
                    <option value="news">
                      News
                    </option>
                    <option value="event">
                      Event
                    </option>
                    <option value="webinar">
                      Webinar
                    </option>
                    <option value="blog">
                      Blog
                    </option>
                    <option value="article">
                      Article
                    </option>
                  </select>
                </div>


                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Subject
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={
                      selectedEvent.subject
                    }
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        subject:
                          e.target.value,
                      })
                    }
                  />
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
                      className={`form-control border-start-0 ps-0 ${selectedEvent.description?.length > 50000
                          ? "is-invalid"
                          : ""
                        }`}
                      rows="6"
                      value={selectedEvent.description}
                      onChange={(e) =>
                        setSelectedEvent({
                          ...selectedEvent,
                          description: e.target.value.slice(0, 50000), // HARD LIMIT
                        })
                      }
                      placeholder="Provide details about your event..."
                    />
                  </div>

                  {/* ERROR MESSAGE (optional) */}
                  {selectedEvent.description?.length > 50000 && (
                    <div className="text-danger small mt-1">
                      Maximum 50000 characters allowed
                    </div>
                  )}

                  {/* CHARACTER COUNTER */}
                  <div className="form-text text-end">
                    {selectedEvent.description?.length || 0}/50000 characters
                  </div>
                </div>
              </div>


              <div className="modal-footer">

                <button
                  className="btn btn-light border"
                  onClick={closeEditModal}
                >
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
          onClose={() =>
            setPopup({
              show: false,
              message: "",
              type: "default",
            })
          }
        />
      )}
    </div>
  );
};

export default ViewEvent;