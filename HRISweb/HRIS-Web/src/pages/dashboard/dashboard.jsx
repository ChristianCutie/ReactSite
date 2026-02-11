import React from 'react'
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap'
import AdminLayout from '../../components/layout/Adminlayout'
import {
  PeopleFill,
  CalendarCheckFill,
  CalendarXFill,
  ListCheck,
  ArrowUp,
  ArrowDown,
  ClockHistory,
  CalendarWeek,
  GraphUp,
  ExclamationCircle
} from 'react-bootstrap-icons'
import './Dashboard.css'

const Dashboard = ({ setIsAuth }) => {
  const iconMap = {
    'people-fill': <PeopleFill />,
    'calendar-check-fill': <CalendarCheckFill />,
    'calendar-x-fill': <CalendarXFill />,
    'list-check': <ListCheck />,
    'arrow-up': <ArrowUp />,
    'arrow-down': <ArrowDown />,
    'clock-history': <ClockHistory />,
    'calendar-week': <CalendarWeek />,
    'graph-up': <GraphUp />,
    'exclamation-circle': <ExclamationCircle />
  }

  // Stat Cards Data
  const stats = [
    {
      id: 1,
      label: 'Total Employees',
      value: '1,284',
      icon: 'people-fill',
      color: 'primary',
      trend: '+12%'
    },
    {
      id: 2,
      label: 'Present Today',
      value: '1,156',
      icon: 'calendar-check-fill',
      color: 'success',
      trend: '+5%'
    },
    {
      id: 3,
      label: 'On Leave',
      value: '128',
      icon: 'calendar-x-fill',
      color: 'warning',
      trend: '-2%'
    },
    {
      id: 4,
      label: 'Pending Tasks',
      value: '34',
      icon: 'list-check',
      color: 'danger',
      trend: '+8%'
    }
  ]

  // Recent Activities Data
  const recentActivities = [
    { id: 1, employee: 'John Doe', action: 'Check In', time: '09:00 AM', status: 'success' },
    { id: 2, employee: 'Jane Smith', action: 'Check Out', time: '05:30 PM', status: 'info' },
    { id: 3, employee: 'Mike Johnson', action: 'Leave Request', time: '10:15 AM', status: 'warning' },
    { id: 4, employee: 'Sarah Williams', action: 'Check In', time: '08:45 AM', status: 'success' },
    { id: 5, employee: 'Tom Brown', action: 'Overtime', time: '07:00 PM', status: 'danger' },
  ]

  return (
    <AdminLayout setIsAuth={setIsAuth}>
      <Container fluid className="dashboard-container">
        {/* Page Header */}
      <Row className="mb-4">
        <Col>
          <div className="dashboard-header">
            <h2 className="dashboard-title">Dashboard</h2>
            <p className="dashboard-subtitle">Welcome back! Here's your HRIS overview</p>
          </div>
        </Col>
      </Row>

      {/* Stat Cards */}
      <Row className="mb-4">
        {stats.map((stat) => (
          <Col lg={3} md={6} sm={12} key={stat.id} className="mb-3">
            <Card className={`stat-card stat-card-${stat.color}`}>
              <Card.Body>
                <div className="stat-content">
                  <div className="stat-info">
                    <p className="stat-label">{stat.label}</p>
                    <h3 className="stat-value">{stat.value}</h3>
                    <span className={`stat-trend trend-${stat.color}`}>
                      <span className="trend-icon">
                        {stat.trend.includes('+') ? iconMap['arrow-up'] : iconMap['arrow-down']}
                      </span>
                      {stat.trend}
                    </span>
                  </div>
                  <div className={`stat-icon stat-icon-${stat.color}`}>
                    {iconMap[stat.icon]}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content Row */}
      <Row className="mb-4">
        {/* Attendance Overview */}
        <Col lg={8} className="mb-3">
          <Card className="dashboard-card">
            <Card.Header className="card-header-custom">
              <h5 className="card-title">Attendance Overview</h5>
              <Button variant="outline-primary" size="sm">
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="attendance-chart">
                <div className="attendance-item">
                  <div className="attendance-stat">
                    <span className="attendance-label">Present</span>
                    <h4>1,156</h4>
                    <span className="percentage">90%</span>
                  </div>
                  <div className="progress-circle">
                    <div className="circle" style={{ background: 'conic-gradient(#28a745 0deg, #28a745 324deg, #e9ecef 324deg)' }}></div>
                  </div>
                </div>

                <div className="attendance-item">
                  <div className="attendance-stat">
                    <span className="attendance-label">Absent</span>
                    <h4>128</h4>
                    <span className="percentage">10%</span>
                  </div>
                  <div className="progress-circle">
                    <div className="circle" style={{ background: 'conic-gradient(#ffc107 0deg, #ffc107 36deg, #e9ecef 36deg)' }}></div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Stats */}
        <Col lg={4} className="mb-3">
          <Card className="dashboard-card">
            <Card.Header className="card-header-custom">
              <h5 className="card-title">Quick Stats</h5>
            </Card.Header>
            <Card.Body>
              <div className="quick-stats">
                <div className="quick-stat-item">
                  <span className="quick-icon">{iconMap['clock-history']}</span>
                  <div className="stat-details">
                    <span>Avg. Work Hours</span>
                    <h6>8.5 hrs</h6>
                  </div>
                </div>
                <div className="quick-stat-item">
                  <span className="quick-icon">{iconMap['calendar-week']}</span>
                  <div className="stat-details">
                    <span>This Week</span>
                    <h6>42.5 hrs</h6>
                  </div>
                </div>
                <div className="quick-stat-item">
                  <span className="quick-icon">{iconMap['graph-up']}</span>
                  <div className="stat-details">
                    <span>Productivity</span>
                    <h6>95%</h6>
                  </div>
                </div>
                <div className="quick-stat-item">
                  <span className="quick-icon">{iconMap['exclamation-circle']}</span>
                  <div className="stat-details">
                    <span>Pending Approvals</span>
                    <h6>3</h6>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Row>
        <Col lg={12}>
          <Card className="dashboard-card">
            <Card.Header className="card-header-custom">
              <h5 className="card-title">Recent Activities</h5>
              <Button variant="outline-primary" size="sm">
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table borderless className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Action</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivities.map((activity) => (
                      <tr key={activity.id}>
                        <td className="employee-cell">
                          <div className="employee-avatar">
                            {activity.employee.charAt(0)}
                          </div>
                          <span>{activity.employee}</span>
                        </td>
                        <td>{activity.action}</td>
                        <td>{activity.time}</td>
                        <td>
                          <Badge bg={activity.status}>
                            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      </Container>
    </AdminLayout>
  )
}

export default Dashboard
