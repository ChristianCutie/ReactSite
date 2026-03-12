import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { PieChart, Pie, ResponsiveContainer, Legend, Tooltip } from "recharts";
import api from "../../../config/axios";

const Overview = () => {
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const [attendanceData, setAttendanceData] = useState({
    present: 0,
    missed: 0,
    absent: 0,
    presentPercentage: 0,
    missedPercentage: 0,
    absentPercentage: 0,
  });

  const chartData = [
    {
      name: "Present",
      value: attendanceData.present,
      fill: "#28a745",
    },
    {
      name: "Missed",
      value: attendanceData.missed,
      fill: "#17a2b8",
    },
    {
      name: "Absent",
      value: attendanceData.absent,
      fill: "#dc3545",
    },
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const year = new Date().getFullYear();

        const res = await api.get("/dashboard/attendance/overview", {
          params: { year },
        });

        const data = res.data.data;

        const present = data.present || 0;
        const missed = data.missed || 0;
        const absent = data.absent || 0;

        const total = present + missed + absent || 1;

        setAttendanceData({
          present,
          missed,
          absent,
          presentPercentage: Math.round((present / total) * 100),
          missedPercentage: Math.round((missed / total) * 100),
          absentPercentage: Math.round((absent / total) * 100),
        });
      } catch (err) {
        setError("Failed to load attendance overview");
      }
    };

    if (!hasFetched.current) {
      fetchDashboard();
      hasFetched.current = true;
    }
  }, []);

  return (
    <Card className="dashboard-card-modern h-100">
      <Card.Header className="card-header-custom">
        <div className="d-flex align-items-center justify-content-between">
          <h5>Overview</h5>
          <Link to="/attendance">
            <Button size="sm" variant="outline-primary">
              View All
            </Button>
          </Link>
        </div>
      </Card.Header>

      <Card.Body>
        {error && <p className="text-danger">{error}</p>}

        <div className="attendance-chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e9ecef",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
                formatter={(value) => `${value} days`}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ paddingTop: "20px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="attendance-stats-container mt-3">
          <Row className="g-3 mb-3">

            <Col>
              <div className="attendance-stat-card">
                <div className="stat-header">
                  <div className="stat-color-indicator absent"></div>
                  <h6>Absent</h6>
                </div>
                <div className="stat-content">
                  <h3>{attendanceData.absent}</h3>
                  <div className="stat-percentage">
                    <span className="percentage-badge danger">
                      {attendanceData.absentPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </Col>

            <Col>
              <div className="attendance-stat-card">
                <div className="stat-header">
                  <div className="stat-color-indicator missed"></div>
                  <h6>Missed</h6>
                </div>
                <div className="stat-content">
                  <h3>{attendanceData.missed}</h3>
                  <div className="stat-percentage">
                    <span className="percentage-badge warning">
                      {attendanceData.missedPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </Col>

            <Col>
              <div className="attendance-stat-card">
                <div className="stat-header">
                  <div className="stat-color-indicator present"></div>
                  <h6>Present</h6>
                </div>
                <div className="stat-content">
                  <h3>{attendanceData.present}</h3>
                  <div className="stat-percentage">
                    <span className="percentage-badge success">
                      {attendanceData.presentPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </Col>

          </Row>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Overview;