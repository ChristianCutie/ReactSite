import React, { useState } from "react";
import { Card, Button, Row, Col, Spinner } from "react-bootstrap";
import { FileEarmarkRuled } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import PayslipPDF from "../../../components/payslip/PayslipPDF";
import api from "../../../config/axios";
import ReactDOM from "react-dom/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const RecentPayslip = ({ recentPayslips = [], pdfRef }) => {
  const [downloadingId, setDownloadingId] = useState(null);

  const formatPeso = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    }).format(value);

  //-------------- Download payslip PDF-------------- //
  const downloadPayslipPDF = async (payslipId) => {
    try {
      setDownloadingId(payslipId);

      // Fetch full payslip details
      const res = await api.get(`/my-payslip/${payslipId}`);
      const payslipData = res.data?.payslip;

      if (!payslipData) {
        alert("Failed to fetch payslip details");
        setDownloadingId(null);
        return;
      }

      // Create a temporary container for rendering the PDF component
      const tempContainer = document.createElement("div");
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.width = "800px";
      document.body.appendChild(tempContainer);

      // Render the PayslipPDF component
      const root = ReactDOM.createRoot(tempContainer);
      root.render(
        <PayslipPDF
          payslip={payslipData}
          formatPeso={formatPeso}
          ref={pdfRef}
        />,
      );

      // Wait for render to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Generate PDF from the rendered content
      const pdfContainer = tempContainer.querySelector(".pdf-container");
      if (pdfContainer) {
        const canvas = await html2canvas(pdfContainer, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Payslip-${payslipData.period}.pdf`);
      }

      // Cleanup
      root.unmount();
      document.body.removeChild(tempContainer);
      setDownloadingId(null);
    } catch (err) {
      console.error("Error downloading payslip:", err);
      alert("Failed to download payslip. Please try again.");
      setDownloadingId(null);
    }
  };

  return (
    <Card className="dashboard-card-modern">
      <Card.Header className="card-header-custom">
        <div className="d-flex align-items-center justify-content-between">
          <h5>Recent Payslips</h5>
          <Link to="/payslip">
            <Button size="sm" variant="outline-primary">
              View All
            </Button>
          </Link>
        </div>
      </Card.Header>
      <Card.Body>
        {recentPayslips.length === 0 ? (
          <div className="text-center py-5">
            <FileEarmarkRuled size={48} className="mb-3 text-muted" />
            <p className="text-muted">No payslips available</p>
          </div>
        ) : (
          <Row>
            {recentPayslips.map((p) => (
              <Col lg={4} md={6} key={p.id} className="mb-4">
                <Card className="payslip-card-modern">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="mb-1 text-primary">
                          {new Date(p.created_at).toLocaleDateString()}
                        </h6>
                        <small className="text-muted">Payslip</small>
                      </div>
                      <span className="badge bg-success">Completed</span>
                    </div>
                    <hr />
                    <div className="payslip-info">
                      <div className="mb-3">
                        <small className="text-muted d-block">Gross Pay</small>
                        <h5 className="mb-0">{formatPeso(p.gross_pay)}</h5>
                      </div>
                      <div>
                        <small className="text-muted d-block">Net Pay</small>
                        <h5 className="mb-0 text-success">
                          {formatPeso(p.net_pay)}
                        </h5>
                      </div>
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="w-100 mt-3"
                      onClick={() => downloadPayslipPDF(p.id)}
                      disabled={downloadingId === p.id}
                    >
                      {downloadingId === p.id ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Downloading...
                        </>
                      ) : (
                        "Download Payslip"
                      )}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

export default RecentPayslip;
