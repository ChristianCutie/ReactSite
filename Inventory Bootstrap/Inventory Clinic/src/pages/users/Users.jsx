import React, { useState } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Modal,
  Badge,
  InputGroup,
  Image,
} from 'react-bootstrap'
import AdminLayout from '../../components/layout/AdminLayout'
import './Users.css'
import api from '../../config/axios'
import {
  Search,
  Plus,
  Pencil,
  Trash3,
  Eye,
  Lock,
  Unlock,
} from 'react-bootstrap-icons'

const Users = ({ setIsAuth }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('add') // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null)

  // Dynamic user data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "",
      email: "",
      phone: "",
      role: "",
      status: "",
      joinDate: "",
      avatar: "",
    },
  ])

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole

    return matchesSearch && matchesRole
  })

  // Get role badge color
  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin':
        return 'danger'
      case 'Doctor':
        return 'primary'
      case 'Nurse':
        return 'info'
      case 'Receptionist':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  // Get status badge color
  const getStatusBadge = (status) => {
    return status === 'Active' ? 'success' : 'secondary'
  }

  // Open modal for add
  const handleAddUser = () => {
    setModalType('add')
    setSelectedUser(null)
    setShowModal(true)
  }

  // Open modal for edit
  const handleEditUser = (user) => {
    setModalType('edit')
    setSelectedUser(user)
    setShowModal(true)
  }

  // Delete user
  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((u) => u.id !== id))
    }
  }

  // Toggle user status
  const handleToggleStatus = (id) => {
    setUsers(
      users.map((u) =>
        u.id === id
          ? {
              ...u,
              status: u.status === 'Active' ? 'Inactive' : 'Active',
            }
          : u
      )
    )
  }

  return (
    <AdminLayout setIsAuth={setIsAuth}>
      <Container fluid>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h1 className="fw-bold">User Management</h1>
            <p className="text-muted">Manage clinic staff and user accounts</p>
          </Col>
          <Col md={3} className="text-end">
            <Button
              variant="primary"
              onClick={handleAddUser}
              className="btn-add-user"
            >
              <Plus size={18} className="me-2" />
              Add User
            </Button>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="stat-card shadow-sm">
              <Card.Body>
                <p className="text-muted small mb-2">Total Users</p>
                <h3 className="fw-bold">{users.length}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card shadow-sm">
              <Card.Body>
                <p className="text-muted small mb-2">Active Users</p>
                <h3 className="fw-bold text-success">
                  {users.filter((u) => u.status === 'Active').length}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card shadow-sm">
              <Card.Body>
                <p className="text-muted small mb-2">Doctors</p>
                <h3 className="fw-bold text-primary">
                  {users.filter((u) => u.role === 'Doctor').length}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card shadow-sm">
              <Card.Body>
                <p className="text-muted small mb-2">Nurses</p>
                <h3 className="fw-bold text-info">
                  {users.filter((u) => u.role === 'Nurse').length}
                </h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters and Search */}
        <Row className="mb-4">
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text className="bg-white border-end-0">
                <Search size={18} className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0"
              />
            </InputGroup>
          </Col>
          <Col md={6}>
            <Form.Select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Receptionist">Receptionist</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Users Table */}
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Join Date</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="user-info">
                                <div className="user-avatar">
                                  {user.avatar}
                                </div>
                                <span className="fw-semibold">{user.name}</span>
                              </div>
                            </td>
                            <td className="text-muted small">{user.email}</td>
                            <td className="text-muted small">{user.phone}</td>
                            <td>
                              <Badge bg={getRoleBadge(user.role)}>
                                {user.role}
                              </Badge>
                            </td>
                            <td>{user.department}</td>
                            <td>
                              <Badge
                                bg={getStatusBadge(user.status)}
                                className="status-badge"
                              >
                                {user.status}
                              </Badge>
                            </td>
                            <td className="text-muted small">
                              {user.joinDate}
                            </td>
                            <td className="text-center">
                              <div className="action-buttons">
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  title="View"
                                >
                                  <Eye size={16} />
                                </Button>
                                <Button
                                  variant="outline-warning"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </Button>
                                <Button
                                  variant={
                                    user.status === 'Active'
                                      ? 'outline-secondary'
                                      : 'outline-success'
                                  }
                                  size="sm"
                                  onClick={() => handleToggleStatus(user.id)}
                                  title={
                                    user.status === 'Active'
                                      ? 'Deactivate'
                                      : 'Activate'
                                  }
                                >
                                  {user.status === 'Active' ? (
                                    <Lock size={16} />
                                  ) : (
                                    <Unlock size={16} />
                                  )}
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                  title="Delete"
                                >
                                  <Trash3 size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-5">
                            <p className="text-muted mb-0">
                              No users found. Try adjusting your search or filters.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
              <Card.Footer className="bg-light text-muted small">
                Showing {filteredUsers.length} of {users.length} users
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Add/Edit User Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'add' ? 'Add New User' : 'Edit User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Dr. John Doe"
                defaultValue={selectedUser ? selectedUser.name : ''}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="e.g., john@clinic.com"
                defaultValue={selectedUser ? selectedUser.email : ''}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                placeholder="e.g., +1 (555) 123-4567"
                defaultValue={selectedUser ? selectedUser.phone : ''}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    defaultValue={selectedUser ? selectedUser.role : ''}
                  >
                    <option>Select Role</option>
                    <option>Admin</option>
                    <option>Doctor</option>
                    <option>Nurse</option>
                    <option>Receptionist</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., General Practitioner"
                    defaultValue={
                      selectedUser ? selectedUser.department : ''
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            {modalType === 'add' && (
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter password"
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            {modalType === 'add' ? 'Add User' : 'Update User'}
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  )
}

export default Users
