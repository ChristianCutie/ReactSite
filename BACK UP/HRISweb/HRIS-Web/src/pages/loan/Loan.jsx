import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import AdminLayout from "../../components/layout/Adminlayout";
import { PlusCircle } from "react-bootstrap-icons";
import "./Loan.css";

const Loan = ({ setIsAuth }) => {
  const loans = [];

  return (
    <AdminLayout setIsAuth={setIsAuth}>
      <Container fluid className="loan-container">
        {/* Page Header */}
        <div className="loan-header">
          <h2 className="loan-title">Loan</h2>
        </div>

        {/* My Loans Section */}
        <div className="loan-section">
          <div className="section-header-inline">
            <div>
              <h4 className="section-title">My Loans</h4>
              <p className="section-subtitle">
                MyLoans is a secure, fast, and easy way for you to manage your loan online
              </p>
            </div>
            <Button className="btn-apply-loan-inline">
              <PlusCircle size={18} className="me-2" />
              Apply New Loan
            </Button>
          </div>

          {loans.length === 0 ? (
            <Card className="empty-state-card">
              <Card.Body className="empty-state-body">
                <div className="empty-state-icon">
                  <i className="bi bi-cash-coin"></i>
                </div>
                <h5 className="empty-state-title">No Loans Found</h5>
                <p className="empty-state-text">You haven't applied for any loans yet</p>
                <Button className="btn-apply-first">
                  <PlusCircle size={16} className="me-2" />
                  Apply for a Loan
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <div className="loans-list">
              {loans.map((loan) => (
                <Card key={loan.id} className="loan-card">
                  <Card.Body>
                    <Row>
                      <Col md={3}>
                        <p className="loan-label">Type</p>
                        <h6 className="loan-value">{loan.type}</h6>
                      </Col>
                      <Col md={3}>
                        <p className="loan-label">Amount</p>
                        <h6 className="loan-value">{loan.amount}</h6>
                      </Col>
                      <Col md={3}>
                        <p className="loan-label">Monthly Payment</p>
                        <h6 className="loan-value">{loan.payment}</h6>
                      </Col>
                      <Col md={3}>
                        <p className="loan-label">Status</p>
                        <span className={`badge badge-${loan.status.toLowerCase()}`}>
                          {loan.status}
                        </span>
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

export default Loan;
