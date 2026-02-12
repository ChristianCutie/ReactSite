import React, { forwardRef } from "react";
import "./PayslipPDF.css";

const PayslipPDF = forwardRef(({ payslip, formatPeso }, ref) => {
  if (!payslip) return null;

  const calculateTotal = (items) => {
    return items?.reduce((sum, item) => {
      const amount = Number(String(item.allowance_amount || item.deduction_amount).replace(/,/g, ""));
      return sum + amount;
    }, 0) || 0;
  };

  const totalAllowances = calculateTotal(payslip.allowances);
  const totalDeductionsAmount = calculateTotal(payslip.deductions);
  const basicSalary = Number(String(payslip.gross_pay).replace(/,/g, "")) - totalAllowances;

  return (
    <div ref={ref} className="pdf-container">
      {/* Header */}
      <div className="pdf-header">
        <h1 className="pdf-company-title">SNL TECHNOLOGY</h1>
        <p className="pdf-company-address">VORO+J4 Calumagit, Bulacan, Philippines</p>
        <p className="pdf-company-contact">0927-592-6072 | hello@snlvirtualpartner.com</p>
      </div>

      <hr className="pdf-divider" />

      {/* Period Title */}
      <h2 className="pdf-period-title">PAYSLIP FOR PERIOD: {payslip.period}</h2>

      {/* Employee Details */}
      <div className="pdf-details-grid">
        <div className="pdf-detail-row">
          <div className="pdf-detail-item">
            <label className="pdf-detail-label">Employee Name:</label>
            <span className="pdf-detail-value">{payslip.employee_name}</span>
          </div>
          <div className="pdf-detail-item">
            <label className="pdf-detail-label">Employee ID:</label>
            <span className="pdf-detail-value">{payslip.employee_id || "N/A"}</span>
          </div>
        </div>
        <div className="pdf-detail-row">
          <div className="pdf-detail-item">
            <label className="pdf-detail-label">Position:</label>
            <span className="pdf-detail-value">{payslip.position || "N/A"}</span>
          </div>
          <div className="pdf-detail-item">
            <label className="pdf-detail-label">Pay Date:</label>
            <span className="pdf-detail-value">{payslip.generated_at}</span>
          </div>
        </div>
        <div className="pdf-detail-row">
          <div className="pdf-detail-item">
            <label className="pdf-detail-label">Department:</label>
            <span className="pdf-detail-value">{payslip.department || "N/A"}</span>
          </div>
          <div className="pdf-detail-item">
            <label className="pdf-detail-label">Days Worked:</label>
            <span className="pdf-detail-value">{payslip.days_worked || "N/A"}</span>
          </div>
        </div>
        <div className="pdf-detail-row">
          <div className="pdf-detail-item">
            <label className="pdf-detail-label">Daily Rate:</label>
            <span className="pdf-detail-value">{formatPeso(Number(String(payslip.daily_rate).replace(/,/g, "")))}</span>
          </div>
          <div className="pdf-detail-item">
            <label className="pdf-detail-label">Basic Salary:</label>
            <span className="pdf-detail-value">{formatPeso(Number(String(payslip.basic_salary || payslip.gross_base).replace(/,/g, "")))}</span>
          </div>
        </div>
      </div>

      {/* Earnings and Deductions Tables */}
      <div className="pdf-tables-container">
        {/* Earnings Table */}
        <div className="pdf-table-section">
          <h3 className="pdf-table-header">EARNINGS</h3>
          <table className="pdf-earnings-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Salary (8.00 days @ ₱{formatPeso(basicSalary / 8)})</td>
                <td>{formatPeso(basicSalary)}</td>
              </tr>
              {payslip.allowances?.map((a, i) => (
                <tr key={i}>
                  <td>{a.allowance_type}</td>
                  <td>{formatPeso(Number(String(a.allowance_amount).replace(/,/g, "")))}</td>
                </tr>
              ))}
              <tr className="pdf-total-row">
                <td><strong>TOTAL EARNINGS</strong></td>
                <td><strong>{formatPeso(Number(String(payslip.gross_pay).replace(/,/g, "")))}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deductions Table */}
        <div className="pdf-table-section">
          <h3 className="pdf-table-header">DEDUCTIONS</h3>
          <table className="pdf-deductions-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {payslip.deductions?.map((d, i) => (
                <tr key={i}>
                  <td>{d.deduction_type}</td>
                  <td>{formatPeso(Number(String(d.deduction_amount).replace(/,/g, "")))}</td>
                </tr>
              ))}
              <tr className="pdf-total-row">
                <td><strong>TOTAL DEDUCTIONS</strong></td>
                <td><strong>{formatPeso(totalDeductionsAmount)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Net Pay Box */}
      <div className="pdf-net-pay-box">
        <h3 className="pdf-net-pay-title">NET PAY: {formatPeso(Number(String(payslip.net_pay).replace(/,/g, "")))}</h3>
        <p className="pdf-net-pay-note">Amount will be deposited to your registered bank account</p>
      </div>

      {/* Signature Section */}
      <div className="pdf-signature-section">
        <div className="pdf-signature-line">
          <p>Employee's Signature</p>
        </div>
        <div className="pdf-signature-line">
          <p>Authorized Signature</p>
        </div>
      </div>

      {/* Footer */}
      <p className="pdf-footer">Generated by SNL Technology Payroll System. This is a computer-generated document.</p>
    </div>
  );
});

export default PayslipPDF;
