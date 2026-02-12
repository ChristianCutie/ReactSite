import React, { useState } from "react";
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
} from "react-bootstrap";
import AdminLayout from "../../components/layout/AdminLayout";
import "./inventory.css";
import "../../components/assets/style/global.css";
import { Search, Plus, Pencil, Trash3, Eye } from "react-bootstrap-icons";

const Inventory = ({ setIsAuth }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add' or 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Sample inventory data
  const [products, setProducts] = useState([
    {
      id: 1,
      code: "INV-001",
      name: "Bandages (Box)",
      category: "First Aid",
      quantity: 150,
      unit: "Box",
      price: 25.5,
      status: "In Stock",
      lastUpdated: "Jan 25, 2026",
    },
    {
      id: 2,
      code: "INV-002",
      name: "Syringes (10ml)",
      category: "Medical Supplies",
      quantity: 45,
      unit: "Pack",
      price: 15.0,
      status: "Low Stock",
      lastUpdated: "Jan 24, 2026",
    },
    {
      id: 3,
      code: "INV-003",
      name: "Face Masks",
      category: "Protection",
      quantity: 0,
      unit: "Box",
      price: 12.0,
      status: "Out of Stock",
      lastUpdated: "Jan 23, 2026",
    },
    {
      id: 4,
      code: "INV-004",
      name: "Latex Gloves",
      category: "Protection",
      quantity: 200,
      unit: "Box",
      price: 18.5,
      status: "In Stock",
      lastUpdated: "Jan 26, 2026",
    },
    {
      id: 5,
      code: "INV-005",
      name: "Thermometer (Digital)",
      category: "Equipment",
      quantity: 12,
      unit: "Piece",
      price: 45.0,
      status: "Low Stock",
      lastUpdated: "Jan 22, 2026",
    },
    {
      id: 6,
      code: "INV-006",
      name: "Alcohol (70%)",
      category: "Disinfectant",
      quantity: 85,
      unit: "Bottle",
      price: 8.5,
      status: "In Stock",
      lastUpdated: "Jan 25, 2026",
    },
  ]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || product.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case "In Stock":
        return "success";
      case "Low Stock":
        return "warning";
      case "Out of Stock":
        return "danger";
      default:
        return "secondary";
    }
  };

  // Open modal for add
  const handleAddProduct = () => {
    setModalType("add");
    setSelectedProduct(null);
    setShowModal(true);
  };

  // Open modal for edit
  const handleEditProduct = (product) => {
    setModalType("edit");
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Delete product
  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <AdminLayout setIsAuth={setIsAuth}>
      <Container fluid>
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h1 className="fw-bold">Inventory Management</h1>
            <p className="text-muted">
              Manage your clinic's medical supplies and equipment
            </p>
          </Col>
          <Col md={3} className="text-end">
            <Button
              variant="primary"
              onClick={handleAddProduct}
              className="btn-add-product"
            >
              <Plus size={18} className="me-2" />
              Add Product
            </Button>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="stat-card shadow-sm">
              <Card.Body>
                <p className="text-muted small mb-2">Total Products</p>
                <h3 className="fw-bold">{products.length}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card shadow-sm">
              <Card.Body>
                <p className="text-muted small mb-2">In Stock</p>
                <h3 className="fw-bold text-success">
                  {products.filter((p) => p.status === "In Stock").length}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card shadow-sm">
              <Card.Body>
                <p className="text-muted small mb-2">Low Stock</p>
                <h3 className="fw-bold text-warning">
                  {products.filter((p) => p.status === "Low Stock").length}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="stat-card shadow-sm">
              <Card.Body>
                <p className="text-muted small mb-2">Out of Stock</p>
                <h3 className="fw-bold text-danger">
                  {products.filter((p) => p.status === "Out of Stock").length}
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
                placeholder="Search by product name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0"
              />
            </InputGroup>
          </Col>
          <Col md={6}>
            <Form.Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Products Table */}
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Product Code</th>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Status</th>
                        <th>Last Updated</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <tr key={product.id}>
                            <td>
                              <span className="fw-semibold text-primary">
                                {product.code}
                              </span>
                            </td>
                            <td>{product.name}</td>
                            <td>
                              <Badge bg="light" text="dark">
                                {product.category}
                              </Badge>
                            </td>
                            <td>
                              <span className="fw-semibold">
                                {product.quantity}
                              </span>
                              <span className="text-muted ms-2 small">
                                {product.unit}
                              </span>
                            </td>
                            <td>${product.price.toFixed(2)}</td>
                            <td>
                              <Badge
                                bg={getStatusBadge(product.status)}
                                className="status-badge"
                              >
                                {product.status}
                              </Badge>
                            </td>
                            <td className="text-muted small">
                              {product.lastUpdated}
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
                                  onClick={() => handleEditProduct(product)}
                                  title="Edit"
                                >
                                  <Pencil size={16} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
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
                              No products found. Try adjusting your search or
                              filters.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
              <Card.Footer className="bg-light text-muted small">
                Showing {filteredProducts.length} of {products.length} products
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "add" ? "Add New Product" : "Edit Product"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Product Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., INV-007"
                defaultValue={selectedProduct ? selectedProduct.code : ""}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Bandages (Box)"
                defaultValue={selectedProduct ? selectedProduct.name : ""}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                defaultValue={selectedProduct ? selectedProduct.category : ""}
              >
                <option>Select Category</option>
                <option>First Aid</option>
                <option>Medical Supplies</option>
                <option>Protection</option>
                <option>Equipment</option>
                <option>Disinfectant</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    defaultValue={
                      selectedProduct ? selectedProduct.quantity : ""
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Box"
                    defaultValue={selectedProduct ? selectedProduct.unit : ""}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Unit Price ($)</Form.Label>
              <Form.Control
                type="number"
                placeholder="0.00"
                defaultValue={selectedProduct ? selectedProduct.price : ""}
                step="0.01"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowModal(false)}>
            {modalType === "add" ? "Add Product" : "Update Product"}
          </Button>
        </Modal.Footer>
      </Modal>
    </AdminLayout>
  );
};

export default Inventory;