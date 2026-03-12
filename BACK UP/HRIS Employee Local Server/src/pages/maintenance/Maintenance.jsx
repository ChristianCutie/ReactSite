import React, { useState, useEffect } from 'react'
import './Maintenance.css'
import { Container } from 'react-bootstrap';
import { Tools } from 'react-bootstrap-icons';

const Maintenance = () => {
  return (
    <Container fluid className="maintenance-container">
      <div className="maintenance-content">
        <Tools size={64} className="maintenance-icon" />
        <h1 className="maintenance-title">This page is currently under maintenance</h1>
        <p className="maintenance-message">
          Sorry for the inconvenience but we're performing some maintenance at the moment. We'll be back online shortly!
        </p>
      </div>
    </Container>
  )
}

export default Maintenance
