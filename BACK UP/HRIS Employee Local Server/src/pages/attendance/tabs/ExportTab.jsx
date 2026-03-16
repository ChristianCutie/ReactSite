import React, { useState } from "react";
import { Card, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { Download } from "react-bootstrap-icons";

const ExportTab = ({
     clearFilters,
    handleExport,
    loadingExport,
    month,
    year,
    date,
    startDate,
    endDate,
    setMonth,
    setYear,
    setDate,
    setStartDate,
    setEndDate,
}) => {

  return (
    <>
      <Card className="shadow-sm mb-4">
        <Card.Body>

          <h6 className="fw-bold mb-4">Export Attendance</h6>

          <Row className="g-3">

            {/* Date */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Form.Group>
            </Col>

            {/* Month */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Month</Form.Label>
                <Form.Select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <option value="">Select Month</option>
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
            <Col md={4}>
              <Form.Group>
                <Form.Label>Year</Form.Label>
                <Form.Select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="">Select Year</option>
                  {[2023, 2024, 2025, 2026, 2027].map((y) => (
                    <option key={y}>{y}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Start Date */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>

            {/* End Date */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>

          </Row>

          <div className="mt-4 d-flex justify-content-end">
            <Button variant="outline-secondary" className="me-2 px-3" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button onClick={handleExport} disabled={loadingExport} size="sm" className="px-3" variant="primary">
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
    </>
  );
};

export default ExportTab;