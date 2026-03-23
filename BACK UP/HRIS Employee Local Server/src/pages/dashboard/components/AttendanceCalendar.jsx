import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Popover } from "react-bootstrap";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import api from "@/config/axios";
import "@/pages/dashboard/components/AttendanceCalendar.css";

const AttendanceCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  const [summary, setSummary] = useState({
    present: 0,
    late: 0,
    missed: 0,
    absent: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasFetched = useRef({});
  const cachedData = useRef({});

  /*
  |--------------------------------------------------------------------------
  | Fetch Attendance
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchAttendance = async () => {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const cacheKey = `${year}-${month}`;

      // ✅ If cached data exists, restore it
      if (cachedData.current[cacheKey]) {
        const cached = cachedData.current[cacheKey];
        setCalendarData(cached.calendar);
        setSummary(cached.summary);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await api.get("/dashboard/calendar", {
          params: { month, year },
        });

        if (res.data.success) {
          const calendar = res.data.calendar || [];
          const summaryData = res.data.summary || {};

          setCalendarData(calendar);
          setSummary(summaryData);

          // ✅ Save data in cache
          cachedData.current[cacheKey] = {
            calendar,
            summary: summaryData,
          };

          hasFetched.current[cacheKey] = true;
        } else {
          setError(res.data.message || "Failed to load attendance");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load attendance");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [currentDate]);

  /*
  |--------------------------------------------------------------------------
  | Calendar Helpers
  |--------------------------------------------------------------------------
  */

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAttendanceStatus = (day) => {
    if (!day) return null;

    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1,
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const record = calendarData.find((item) => item.date === dateStr);

    return record ? record.status : null;
  };

  /*
  |--------------------------------------------------------------------------
  | Calendar Build
  |--------------------------------------------------------------------------
  */

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const days = [];
  const weeks = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  /*
  |--------------------------------------------------------------------------
  | Navigation
  |--------------------------------------------------------------------------
  */

  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  /*
  |--------------------------------------------------------------------------
  | Status Helpers
  |--------------------------------------------------------------------------
  */

  const getStatusClass = (day) => {
    if (!day) return "";

    const status = getAttendanceStatus(day);

    if (!status) return "no-data";

    // Build the date object for this day
    const dayDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0); // remove time for accurate comparison

    if (status.toLowerCase() === "absent") {
      if (dayDate < today) return "absent"; // past absent -> red
      if (dayDate.getTime() === today.getTime()) return "absent-today"; // today absent -> red or special
      return "absent-future"; // future absent -> gray
    }

    return status.toLowerCase(); // other statuses stay the same
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const pastAbsentCount = calendarData.filter((item) => {
    if (item.status !== "absent") return false;

    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0);

    return itemDate <= today; // only count past or today
  }).length;

  const getStatusLabel = (day) => {
    if (!day) return "";

    const status = getAttendanceStatus(day);

    const map = {
      present: "Present",
      late: "Late",
      missed: "Missed",
      weekend: "Weekend",
      absent: "Absent",
    };

    return map[status] || status;
  };

  const getStatusIndicator = (day) => {
    const status = getAttendanceStatus(day);

    const icons = {
      present: "✓",
      late: "⏱",
      missed: "?",
      weekend: "-",
      absent: "✗",
    };

    return icons[status] || "";
  };

  const renderPopover = (day) => {
  const status = getStatusLabel(day);
   return (
    <Popover id={`popover-${day}`}>
      <Popover.Body style={{ fontSize: "12px", textAlign: "center" }}>
        {status}
      </Popover.Body>
    </Popover>
  );
};

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <Card className="attendance-calendar-card h-100">
      <Card.Header className="card-header-custom">
        <div className="calendar-header">
          <h5 className="mb-0">Attendance Calendar</h5>

          <div className="calendar-controls">
            <Button
              variant="sm"
              size="sm"
              onClick={handlePreviousMonth}
              className="btn-icon"
            >
              <ChevronLeft />
            </Button>

            <span className="month-year">{monthName}</span>

            <Button
              variant="sm"
              size="sm"
              onClick={handleNextMonth}
              className="btn-icon"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        {error && <div className="alert alert-danger">{error}</div>}

        {/* SUMMARY */}

        {/* <Row className="mb-3 summary-stats">
          <Col xs={6} sm={3} className="mb-2">
            <div className="stat-box present">
              <div className="stat-number">{summary.present}</div>
              <div className="stat-label">Present</div>
            </div>
          </Col>

          <Col xs={6} sm={3} className="mb-2">
            <div className="stat-box late">
              <div className="stat-number">{summary.late}</div>
              <div className="stat-label">Late</div>
            </div>
          </Col>

          <Col xs={6} sm={3} className="mb-2">
            <div className="stat-box leave">
              <div className="stat-number">{summary.missed}</div>
              <div className="stat-label">Missed</div>
            </div>
          </Col>

          <Col xs={6} sm={3} className="mb-2">
            <div className="stat-box absent">
              <div className="stat-number">{pastAbsentCount}</div>
              <div className="stat-label">Absent</div>
            </div>
          </Col>
        </Row> */}

        {loading && (
          <div className="text-center text-muted py-4">Loading calendar...</div>
        )}

        {!loading && (
          <>
            <div className="calendar-container">
              <div className="calendar-grid">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div key={day} className="weekday-header">
                      {day}
                    </div>
                  ),
                )}

                {weeks.map((week, weekIndex) =>
                  week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`calendar-day ${getStatusClass(day)}`}
                      title={day ? getStatusLabel(day) : ""}
                    >
                      {day && (
                        <div className="day-content">
                          <span className="day-number">{day}</span>

                          {getStatusIndicator(day) && (
                            <span className="status-indicator">
                              {getStatusIndicator(day)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )),
                )}
              </div>
            </div>

            {/* LEGEND */}

            <div className="calendar-legend mt-4">
              <div className="legend-item">
                <span className="legend-color present"></span>
                <span className="legend-text">Present</span>
              </div>

              <div className="legend-item">
                <span className="legend-color late"></span>
                <span className="legend-text">Late</span>
              </div>

              <div className="legend-item">
                <span className="legend-color missed"></span>
                <span className="legend-text">Missed</span>
              </div>

              <div className="legend-item">
                <span className="legend-color weekend"></span>
                <span className="legend-text">Weekend</span>
              </div>

              <div className="legend-item">
                <span className="legend-color absent"></span>
                <span className="legend-text">Absent</span>
              </div>
            </div>
          </>
        )}

        <div className="mt-3">
          <Button variant="outline-primary" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default React.memo(AttendanceCalendar);
