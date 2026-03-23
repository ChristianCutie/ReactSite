import React from 'react'
import { Container } from 'react-bootstrap';
import { ExclamationTriangle } from 'react-bootstrap-icons';

const Unauthorized = () => {
  return (
    <Container fluid className="maintenance-container">
      <div className="maintenance-content">
        <ExclamationTriangle size={50} className="maintenance-icon" />
        <h1 className="maintenance-title">Unauthorized Access</h1>
        <p className="maintenance-message">
          Sorry for the inconvenience but you do not have permission to access this page. Please contact your administrator if you believe this is an error.
        </p>
      </div>
    </Container>
  )
}

export default Unauthorized
