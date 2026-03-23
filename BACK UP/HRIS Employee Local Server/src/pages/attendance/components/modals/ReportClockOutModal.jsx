import React from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import RichTextEditor from "@/pages/attendance/components/richtexteditor/RichTextEditor";

const ReportClockOutModal = ({
  show,
  setShowReportModal,
  ccEmails,
  setCcEmails,
  reportSubject,
  setReportSubject,
  reportBody,
  setReportBody,
  handleReportSubmit,
}) => {
  const handleClose = () => {
    setShowReportModal(false);
    setCcEmails("");
    setReportSubject("");
    setReportBody("");
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Daily Report (Clock Out)</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* TO */}
          <InputGroup className="mb-3">
            <InputGroup.Text id="to-addon">TO</InputGroup.Text>

            <Form.Control
              type="text"
              placeholder="hello@snlvirtualpartner.com"
              readOnly
              disabled
              aria-label="TO"
              aria-describedby="to-addon"
            />
          </InputGroup>

          {/* CC */}
          <InputGroup className="mb-3">
            <InputGroup.Text id="cc-addon">CC</InputGroup.Text>

            <Form.Control
              type="email"
              multiple
              value={ccEmails}
              onChange={(e) => setCcEmails(e.target.value)}
              placeholder="Enter email addresses separated by commas"
              aria-label="CC"
              aria-describedby="cc-addon"
            />
          </InputGroup>

          <Form.Text className="text-muted mb-3 d-block">
            Separate multiple emails with commas.
          </Form.Text>

          {/* SUBJECT */}
          <InputGroup className="mb-3">
            <InputGroup.Text id="subject-addon">Subject</InputGroup.Text>

            <Form.Control
              type="text"
              placeholder="Daily report"
              value={reportSubject}
              onChange={(e) => setReportSubject(e.target.value)}
              aria-label="Subject"
              aria-describedby="subject-addon"
            />
          </InputGroup>

          {/* REPORT BODY */}
          <RichTextEditor value={reportBody} onChange={setReportBody} />
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          size="sm"
          className="px-3"
          onClick={handleClose}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          size="sm"
          className="px-3"
          onClick={handleReportSubmit}
        >
          Submit & Clock Out
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReportClockOutModal;