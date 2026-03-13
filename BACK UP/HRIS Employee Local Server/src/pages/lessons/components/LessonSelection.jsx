import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import AdminLayout from "../../../components/layout/Adminlayout";
import axios from "../../../config/axios";
import { useAuth } from "../../../context/AuthContext";

const LessonSelection = ({ lessons = [], setSelectedLesson, setIsAuth }) => {
  const { user } = useAuth();

  const downloadLessonCertificate = async (lesson) => {
    // try to fetch full lesson structure if not present
    let full = lesson;
    if (!lesson.modules) {
      try {
        const res = await axios.get(`/training/lessons/${lesson.id}/structure`);
        if (res.data && res.data.success) full = res.data.lesson;
      } catch (err) {
        console.error('Failed to fetch lesson structure for download', err);
      }
    }

    const userName = (user && (user.name || user.full_name || `${user.first_name || ''} ${user.last_name || ''}`)) || 'Employee';
    const date = new Date().toLocaleDateString();
    const lines = [];
    lines.push(`${full?.lesson_title || lesson.lesson_title} - Completion Certificate`);
    lines.push(`Name: ${userName}`);
    lines.push(`Date: ${date}`);
    lines.push('');
    lines.push('Module results:');
    (full.modules || []).forEach((m) => {
      const passed = m.completed ? 'Passed' : 'Not passed';
      lines.push(`- ${m.title}: ${passed}`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${full?.lesson_title || lesson.lesson_title}-certificate.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  return (
    <AdminLayout setIsAuth={setIsAuth}>
      <Container className="mt-4">
        <Row className="mb-3">
          <Col>
            <h3>Available Lessons</h3>
          </Col>
        </Row>
        <Row>
          {lessons.map((lesson, index) => (
            <Col md={6} lg={4} key={lesson.id} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>{lesson.lesson_title}</Card.Title>
                  <Card.Text>
                    {lesson.lesson_description || "No description"}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between align-items-center">
                  <Button
                    className="rounded-3 px-3 shadow-sm btn btn-seocondary btn-sm"
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    Start Lesson
                  </Button>
                  {(
                    lesson.completed || lesson.passed || (lesson.modules && lesson.modules.length > 0 && lesson.modules.every(m => m.completed))
                  ) && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => downloadLessonCertificate(lesson)}
                    >
                      Download Certificate
                    </Button>
                  )}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </AdminLayout>
  );
};

export default LessonSelection;
