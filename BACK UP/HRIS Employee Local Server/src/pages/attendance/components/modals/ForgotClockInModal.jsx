import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const ForgotClockInModal = ({
  show,
  handleCloseForgotClockInModal,
  forgotClockInForm,
  handleForgotFormChange,
  handleSubmitForgotClockInRequest,
  absentDates,
  loading,
}) => {
  return (
    <Modal
      show={show}
      onHide={handleCloseForgotClockInModal}
      centered
      size="md"
    >
      <Modal.Header closeButton>
        <Modal.Title>Forgot Clock-In Request</Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-2">
        <Form>
          {/* DATE */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Date</Form.Label>

            <Form.Select
              name="adjustedClockDate"
              value={forgotClockInForm.adjustedClockDate}
              onChange={handleForgotFormChange}
              required
              disabled={loading}
            >
              <option value="">Select absent date</option>

              {absentDates.map((date, index) => (
                <option key={index} value={date}>
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* TIME INPUTS */}
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Clock In Time
                </Form.Label>

                <Form.Control
                  type="time"
                  name="adjustedClockIn"
                  value={forgotClockInForm.adjustedClockIn}
                  onChange={handleForgotFormChange}
                  disabled={loading}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Clock Out Time
                </Form.Label>

                <Form.Control
                  type="time"
                  name="adjustedClockOut"
                  value={forgotClockInForm.adjustedClockOut}
                  onChange={handleForgotFormChange}
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* REASON */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Reason for Request
            </Form.Label>

            <Form.Control
              as="textarea"
              rows={4}
              name="reason"
              placeholder="Explain why you forgot to clock in..."
              value={forgotClockInForm.reason}
              onChange={handleForgotFormChange}
              disabled={loading}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <Button
          variant="outline-secondary"
          size="sm"
          className="px-3"
          onClick={handleCloseForgotClockInModal}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          className="px-3"
          size="sm"
          onClick={handleSubmitForgotClockInRequest}
          disabled={loading}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Submitting request...
            </>
          ) : (
            "Submit Request"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ForgotClockInModal;