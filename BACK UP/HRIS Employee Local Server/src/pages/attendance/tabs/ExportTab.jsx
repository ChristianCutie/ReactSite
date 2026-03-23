import React, { useState } from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";
import { Download } from "react-bootstrap-icons";

const ExportTab = ({
  clearFilters,
  handleExport,
  loadingExport,
  month,
  year,
  status,
  setMonth,
  setYear,
  setStatus,
}) => {
  return (
    <Row>
      <Col lg={6}>
        <Card className="shadow-sm mb-4 ">
          <Card.Body>
            <h6 className="fw-bold mb-4">Export Attendance</h6>
            {/* Month */}
            <Form.Group>
              <Form.Label>Month</Form.Label>
              <Form.Select
                value={month}
                className="p-2"
                onChange={(e) => setMonth(e.target.value)}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("en-US", {
                      month: "long",
                    })}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Year */}
            <Form.Group>
              <Form.Label>Year</Form.Label>
              <Form.Select
                value={year}
                className="p-2"
                onChange={(e) => setYear(e.target.value)}
              >
                {[2023, 2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="mt-4 d-flex justify-content-end">
              <Button
                variant="outline-secondary"
                className="me-2 px-3"
                size="sm"
                onClick={clearFilters}
              >
                Clear
              </Button>

              <Button
                onClick={handleExport}
                disabled={loadingExport}
                size="sm"
                className="px-3"
                variant="primary"
              >
                {loadingExport ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="me-2" />
                    Export CSV
                  </>
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={6}>
        <Card className=" mb-4 bg-light border-0 ">
          <Card.Body>
            <h6 className="fw-bold mb-4">Export Information</h6>
            <div className="mb-4">
              <h6 className="text-secondary">What's included in the export:</h6>
              <ul className="mb-3">
                <li>Employee attendance records</li>
                <li>Clock-in and clock-out times</li>
                <li>Attendance status (Present/Absent)</li>
                <li>Monthly summary data</li>
              </ul>
            </div>
            <div>
              <h6 className="text-secondary">Instructions:</h6>
              <ol className="mb-0">
                <li>Select the desired <strong>Month</strong> and <strong>Year</strong></li>
                <li>Click the <strong>Export CSV</strong> button to download</li>
                <li>Use <strong>Clear</strong> to reset to default values</li>
              </ol>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default React.memo(ExportTab);
