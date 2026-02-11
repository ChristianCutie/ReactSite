import React from 'react'
import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import AdminLayout from '../../components/layout/AdminLayout'
import './Dashboard.css'
import {
  Cart3,
  People,
  GraphUpArrow ,
  CheckCircle,
} from 'react-bootstrap-icons'

const Dashboard = ({ setIsAuth }) => {
  const stats = [
    {
      id: 1,
      title: 'Total Products',
      value: '1,234',
      icon: Cart3,
      color: 'primary',
      trend: '+12%',
    },
    {
      id: 2,
      title: 'Total Users',
      value: '456',
      icon: People,
      color: 'success',
      trend: '+5%',
    },
    {
      id: 3,
      title: 'Revenue',
      value: '$45,230',
      icon: GraphUpArrow,
      color: 'info',
      trend: '+8%',
    },
    {
      id: 4,
      title: 'Completed Orders',
      value: '89',
      icon: CheckCircle,
      color: 'warning',
      trend: '+3%',
    },
  ]

  return (
    <AdminLayout setIsAuth={setIsAuth}>
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h1 className="fw-bold">Dashboard</h1>
            <p className="text-muted">Welcome back to Inventory Clinic Admin</p>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Col key={stat.id} md={6} lg={3} className="mb-3">
                <Card className="stat-card shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <p className="text-muted small mb-2">{stat.title}</p>
                        <h3 className="fw-bold mb-1">{stat.value}</h3>
                        <span className={`badge bg-${stat.color}`}>
                          {stat.trend}
                        </span>
                      </div>
                      <div className={`stat-icon stat-icon-${stat.color}`}>
                        <Icon size={28} />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )
          })}
        </Row>

        {/* Charts and Tables Section */}
        <Row>
          <Col lg={8} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-light border-bottom">
                <h5 className="mb-0">Recent Orders</h5>
              </Card.Header>
              <Card.Body>
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#001</td>
                      <td>John Doe</td>
                      <td>$250.00</td>
                      <td>
                        <span className="badge bg-success">Completed</span>
                      </td>
                      <td>Jan 25, 2026</td>
                    </tr>
                    <tr>
                      <td>#002</td>
                      <td>Jane Smith</td>
                      <td>$180.50</td>
                      <td>
                        <span className="badge bg-warning">Pending</span>
                      </td>
                      <td>Jan 26, 2026</td>
                    </tr>
                    <tr>
                      <td>#003</td>
                      <td>Mike Johnson</td>
                      <td>$320.75</td>
                      <td>
                        <span className="badge bg-info">Processing</span>
                      </td>
                      <td>Jan 27, 2026</td>
                    </tr>
                  </tbody>
                </table>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} className="mb-4">
            <Card className="shadow-sm">
              <Card.Header className="bg-light border-bottom">
                <h5 className="mb-0">Quick Actions</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-grid gap-2">
                  <Button variant="primary" className="text-start">
                    + Add New Product
                  </Button>
                  <Button variant="outline-primary" className="text-start">
                    + Add New User
                  </Button>
                  <Button variant="outline-primary" className="text-start">
                    View Reports
                  </Button>
                  <Button variant="outline-primary" className="text-start">
                    Settings
                  </Button>
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