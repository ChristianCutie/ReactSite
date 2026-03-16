import React from "react";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import { Clock, DoorOpen, Lightbulb } from "react-bootstrap-icons";

const DRTAdjustmentModal = ({
  show,
  handleClose,
  selectedRecord,
  adjustmentForm,
  handleAdjustmentFormChange,
  handleSubmitAdjustment,
  formatTime,
}) => {
  if (!selectedRecord) return null;

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Request DTR Adjustment</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* ORIGINAL TIMES */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">Original Times</h6>

          <Row>
            <Col md={6}>
              <div>
                <small className="text-muted">Clock In</small>

                <div className="d-flex align-items-center gap-2">
                  <Clock size={18} className="text-primary" />
                  <strong>{formatTime(selectedRecord.clock_in)}</strong>
                </div>

                <small className="text-muted">
                  {new Date(selectedRecord.clock_in).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </small>
              </div>
            </Col>

            <Col md={6}>
              <div>
                <small className="text-muted">Clock Out</small>

                <div className="d-flex align-items-center gap-2">
                  <DoorOpen size={18} className="text-primary" />

                  <strong>
                    {selectedRecord.clock_out
                      ? formatTime(selectedRecord.clock_out)
                      : "Not clocked out"}
                  </strong>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        <hr />

        {/* ADJUSTED TIMES */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">Adjusted Times</h6>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Adjusted Clock In</Form.Label>

            <Form.Control
              type="time"
              name="adjustedClockIn"
              value={adjustmentForm.adjustedClockIn}
              onChange={handleAdjustmentFormChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Adjusted Clock Out</Form.Label>

            <Form.Control
              type="time"
              name="adjustedClockOut"
              value={adjustmentForm.adjustedClockOut}
              onChange={handleAdjustmentFormChange}
            />
          </Form.Group>

          <small className="text-warning d-block mb-3">
            <Lightbulb size={16} className="me-1" />
            Use the time inputs above to adjust your times
          </small>
        </div>

        {/* REASON */}
        <div className="mb-4">
          <Form.Group>
            <Form.Label className="fw-bold">Reason for Adjustment</Form.Label>

            <Form.Control
              as="textarea"
              rows={4}
              name="reason"
              placeholder="Please explain why you need this adjustment..."
              value={adjustmentForm.reason}
              onChange={handleAdjustmentFormChange}
            />
          </Form.Group>
        </div>

        {/* INFO */}
        <div className="alert alert-info d-flex gap-2 mb-0">
          <span>💡</span>
          <span>
            Your adjustment request will be reviewed and approved by your
            supervisor. You'll be notified once it's processed.
          </span>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button
          size="sm"
          className="px-3"
          variant="outline-secondary"
          onClick={handleClose}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          size="sm"
          className="px-3"
          onClick={handleSubmitAdjustment}
        >
          Submit Request
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DRTAdjustmentModal;