import React, { useState } from "react";
import { Card, Row, Col, Form, Button, Spinner } from "react-bootstrap";
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
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <h6 className="fw-bold mb-4">Export Attendance</h6>

        <Row className="g-3">

          {/* Month */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Month</Form.Label>
              <Form.Select
                value={month}
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
          </Col>

          {/* Year */}
          <Col md={6}>
            <Form.Group>
              <Form.Label>Year</Form.Label>
              <Form.Select
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {[2023, 2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

        </Row>

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
                <Spinner size="sm" className="me-2" />
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
  );
};

export default ExportTab; 