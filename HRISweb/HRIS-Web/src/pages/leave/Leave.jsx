import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import AdminLayout from "../../components/layout/Adminlayout";
import { CalendarFill, PlusCircle } from "react-bootstrap-icons";
import "./Leave.css";

const Leave = ({ setIsAuth }) => {
  const leaveRequests = [];
  const leaveBalance = [];

  return (
    <AdminLayout setIsAuth={setIsAuth}>
      <Container fluid className="leave-container">
        {/* Page Header */}
        <div className="leave-header">
          <h2 className="leave-title">Leave</h2>
        </div>

        {/* Leave Requests Section */}
        <div className="leave-section">
          <div className="section-header-inline">
            <div>
              <h4 className="section-title">Leave Requests</h4>
              <p className="section-subtitle">Your recent and upcoming leave requests</p>
            </div>
            <Button className="btn-request-leave-inline">
              <PlusCircle size={18} className="me-2" />
              Request Leave
            </Button>
          </div>

          {leaveRequests.length === 0 ? (
            <Card className="empty-state-card">
              <Card.Body className="empty-state-body">
                <div className="empty-state-icon">
                  <CalendarFill size={48} />
                </div>
                <h5 className="empty-state-title">No Leave Requests</h5>
                <p className="empty-state-text">
                  You haven't requested any time off yet
                </p>
                <Button className="btn-request-first">
                  <PlusCircle size={16} className="me-2" />
                  Request Your First Leave
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <div className="leave-requests-list">
              {leaveRequests.map((request) => (
                <Card key={request.id} className="leave-request-card">
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <p className="request-label">Type</p>
                        <h6 className="request-value">{request.type}</h6>
                      </Col>
                      <Col md={4}>
                        <p className="request-label">From - To</p>
                        <h6 className="request-value">
                          {request.from} - {request.to}
                        </h6>
                      </Col>
                      <Col md={4}>
                        <p className="request-label">Status</p>
                        <span
                          className={`badge badge-${request.status.toLowerCase()}`}
                        >
                          {request.status}
                        </span>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Leave Balance Section */}
        <div className="leave-section">
          <div className="section-header">
            <h4 className="section-title">Leave Balance</h4>
          </div>

          {leaveBalance.length === 0 ? (
            <div className="leave-balance-empty">
              <div className="balance-icon">
                <CalendarFill size={32} />
              </div>
              <p className="balance-text">No leave types available</p>
            </div>
          ) : (
            <div className="leave-balance-list">
              {leaveBalance.map((balance) => (
                <Card key={balance.id} className="balance-card">
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <p className="balance-label">{balance.type}</p>
                      </Col>
                      <Col md={6}>
                        <p className="balance-value">
                          {balance.remaining} / {balance.total} days
                        </p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>
    </AdminLayout>
  );
};

export default Leave;
