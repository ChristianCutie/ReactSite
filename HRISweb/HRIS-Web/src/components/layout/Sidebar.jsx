import React from 'react'
import { Nav, Offcanvas } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import {
  CalendarCheckFill,
  CalendarXFill,
  CashCoin,
  FileEarmarkTextFill,
  BoxArrowRight,
  Speedometer2
} from 'react-bootstrap-icons'
import './Sidebar.css'
import logo from '../../assets/images/cropped-SnL-Logo-480x480.png';

const Sidebar = ({ show, handleClose }) => {
  const location = useLocation()

  const iconMap = {
    'calendar-check': <CalendarCheckFill />,
    'calendar-x': <CalendarXFill />,
    'cash-coin': <CashCoin />,
    'file-earmark-text': <FileEarmarkTextFill />,
    'speedometer2': <Speedometer2 />,
    'logout': <BoxArrowRight />
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'speedometer2', path: '/dashboard' },
    { id: 'attendance', label: 'Attendance', icon: 'calendar-check', path: '/attendance' },
    { id: 'leave', label: 'Leave', icon: 'calendar-x', path: '/leave' },
    { id: 'loan', label: 'Loan', icon: 'cash-coin', path: '/loan' },
    { id: 'payslip', label: 'Payslip', icon: 'file-earmark-text', path: '/payslip' },
  ]

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <>
      {/* Mobile Offcanvas Sidebar */}
      <Offcanvas show={show} onHide={handleClose} className="sidebar-offcanvas">
        <Offcanvas.Header closeButton className="sidebar-header">
          <Offcanvas.Title>
            <h5 className="sidebar-title mb-0">HRIS</h5>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <Nav className="flex-column sidebar-nav">
            {menuItems.map((item) => (
              <Nav.Link
                as={Link}
                to={item.path}
                key={item.id}
                className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={handleClose}
              >
                <span className="sidebar-icon">{iconMap[item.icon]}</span>
                <span>{item.label}</span>
              </Nav.Link>
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Desktop Sidebar */}
      <div className="sidebar-desktop">
        <div className="sidebar-header-desktop">
          <div className="d-flex justify-content-start align-items-center">
           <img src={logo} alt="SnL Logo" className="sidebar-logo" />
           <h5 className="sidebar-title mb-0">HRIS</h5>
          </div>
        </div>
        <Nav className="flex-column sidebar-nav">
          {menuItems.map((item) => (
            <Nav.Link
              as={Link}
              to={item.path}
              key={item.id}
              className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{iconMap[item.icon]}</span>
              <span>{item.label}</span>
            </Nav.Link>
          ))}
        </Nav>
      </div>
    </>
  )
}

export default Sidebar
