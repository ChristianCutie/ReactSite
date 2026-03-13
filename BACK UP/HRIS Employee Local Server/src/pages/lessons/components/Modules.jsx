import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ProgressBar,
  Form,
  Alert,
} from "react-bootstrap";
import AdminLayout from "../../../components/layout/Adminlayout";
import axios from "../../../config/axios";
import { useAuth } from "../../../context/AuthContext";

const Modules = ({ lesson, goBack, setIsAuth }) => {
  const [currentModule, setCurrentModule] = useState(0);
  const [reviewMode, setReviewMode] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [scores, setScores] = useState({});
  const [passedModules, setPassedModules] = useState({});
  const [loading, setLoading] = useState(false);

  const module = lesson?.modules?.[currentModule];
  const key = `${currentModule}`;
  const questions = module?.questions || [];
  const allAnswered = questions.length > 0 && questions.every((q, idx) => typeof selectedAnswers[key]?.[idx] !== "undefined");

  const handleAnswerSelect = (qIndex, optionIndex) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [qIndex]: optionIndex },
    }));
  };

  const { user } = useAuth();

  const handleSubmitTest = async () => {
    setLoading(true);
    const mod = module;
    if (!mod) return;

    // Build answers payload matching backend expectation: { question_id, choice_id }
    const answers = (mod.questions || [])
      .map((q, index) => {
        const selectedIndex = selectedAnswers[key]?.[index];
        const choice = q.choices?.[selectedIndex];
        const choiceId = choice?.id || choice?.choice_id || null;
        return {
          question_id: q.id || q.question_id || null,
          choice_id: choiceId,
        };
      })
      .filter((a) => a.question_id && a.choice_id);

    if (answers.length === 0) return;

    // POST to backend
    try {
      const payload = {
        employee_id: user?.id,
        module_id: mod.id,
        answers,
      };

      const res = await axios.post("/training/submit-test", payload);
      setLoading(false);
      if (res.data && res.data.success) {
        // convert percentage score to count for existing UI (approximate)
        const percent = res.data.score || 0;
        const count = Math.round(
          (percent / 100) * (mod.questions?.length || 0),
        );
        setScores({ ...scores, [key]: count });
        if (res.data.passed)
          setPassedModules({ ...passedModules, [key]: true });
        return;
      }
    } catch (err) {
      console.error(
        "Failed to submit test to backend, falling back to local scoring",
        err,
      );
      setLoading(false);
    }

    // Fallback local scoring if API fails or response not successful
    let score = 0;
    (mod.questions || []).forEach((q, index) => {
      const selectedIndex = selectedAnswers[key]?.[index];
      const choice = q.choices?.[selectedIndex];
      if (choice && (choice.is_correct || choice.isCorrect || choice.correct))
        score++;
    });
    setScores({ ...scores, [key]: score });
    if (score >= Math.ceil((mod.questions || []).length * 0.7)) {
      setPassedModules({ ...passedModules, [key]: true });
    }
  };

  const handleNextModule = () => {
    setCurrentModule(currentModule + 1);
    setReviewMode(true);
  };

  const progress = lesson?.modules?.length
    ? (Object.keys(passedModules).length / lesson.modules.length) * 100
    : 0;

  const allModulesPassed = Array.isArray(lesson?.modules) && lesson.modules.length > 0
    && lesson.modules.every((m, i) => passedModules[i]);

  const downloadCertificate = () => {
    const userName = (user && (user.name || user.full_name || `${user.first_name || ''} ${user.last_name || ''}`)) || 'Employee';
    const date = new Date().toLocaleDateString();
    const lines = [];
    lines.push(`${lesson?.lesson_title} - Completion Certificate`);
    lines.push(`Name: ${userName}`);
    lines.push(`Date: ${date}`);
    lines.push('');
    lines.push('Module results:');
    (lesson.modules || []).forEach((m, i) => {
      const passed = passedModules[i] ? 'Passed' : 'Not passed';
      const scoreCount = scores[`${i}`];
      const total = (m.questions || []).length || 0;
      const scoreText = typeof scoreCount !== 'undefined' ? `${scoreCount}/${total}` : 'N/A';
      lines.push(`- ${m.title}: ${passed} (${scoreText})`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lesson?.lesson_title || 'lesson'}-certificate.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!lesson) {
    return (
      <AdminLayout setIsAuth={setIsAuth}>
        <div className="profile-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading lessons...</span>
          </div>
          <p>Loading lesson information...</p>
        </div>
      </AdminLayout>
    );
  }

  if (lesson.modules === undefined) {
    return (
      <AdminLayout setIsAuth={setIsAuth}>
        <div className="profile-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading modules...</span>
          </div>
          <p>Loading modules...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!Array.isArray(lesson.modules) || lesson.modules.length === 0) {
    return (
      <AdminLayout setIsAuth={setIsAuth}>
        <div className="profile-loading">
          <p>No modules available for this lesson.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout setIsAuth={setIsAuth}>
      <Container fluid className="mt-4 lesson-container">
            <div className="d-flex align-items-center justify-content-between mb-4">
               <h3>{lesson?.lesson_title} Training</h3>
              <Button className="rounded-3 px-3 shadow-sm btn btn-secondary btn-sm" onClick={goBack}>
                ← Select Lesson
              </Button>
            </div>
        <Row className="mb-4">
          <Col>
            <ProgressBar now={progress} />
            <small>{Math.round(progress)}% Completed</small>
          </Col>
        </Row>

        <Row>
          {/* Main Content */}
          <Col md={8}>
            <Card>
              <Card.Body>
                <Card.Title>{module?.title}</Card.Title>

                {reviewMode ? (
                  <>
                    <Card.Text>{module?.description}</Card.Text>
                    <Button
                      className="rounded-3 px-3 shadow-sm btn btn-seocondary btn-sm"
                      onClick={() => setReviewMode(false)}
                    >
                      Let's review!
                    </Button>
                  </>
                ) : (
                  <>
                    {(module?.questions || []).map((q, qIndex) => (
                      <Form.Group key={qIndex} className="mb-3">
                        <Form.Label>
                          {qIndex + 1}. {q.question}
                        </Form.Label>
                        {Array.isArray(q.choices) && q.choices.length > 0 ? (
                          q.choices.map((opt, oIndex) => (
                            <Form.Check
                              key={oIndex}
                              type="radio"
                              label={opt.choice_text}
                              name={`q${qIndex}`}
                              checked={selectedAnswers[key]?.[qIndex] === oIndex}
                              onChange={() => handleAnswerSelect(qIndex, oIndex)}
                              disabled={loading}
                              required
                            />
                          ))
                        ) : (
                          <div className="text-muted">No choices available for this question.</div>
                        )}
                      </Form.Group>
                    ))}
                    <div className="d-flex align-items-center justify-content-between">
                      <Button
                        className="rounded-3 px-3 shadow-sm btn btn-success btn-sm me-2"
                        onClick={handleSubmitTest}
                        disabled={loading || !allAnswered}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Submitting test...
                          </>
                        ) : (
                          "Submit Test"
                        )}
                      </Button>

                      {!allAnswered && !loading && (
                        <div className="text-danger small mt-2">Please answer all questions before submitting.</div>
                      )}

                      {scores[key] !== undefined && (
                        <div className="justify-content-between d-flex align-items-center">
                          <h6 className="me-4 mt-auto">
                            Score: {scores[key]}/
                            {module?.questions?.length || 0}
                          </h6>
                          {passedModules[key] ? (
                            <Button
                              className="rounded-3 px-3 shadow-sm btn btn-seocondary btn-sm me-2"
                              onClick={handleNextModule}
                            >
                              Next Module
                            </Button>
                          ) : (
                            <Alert variant="danger" className="mb-0 py-1">
                              Failed. Please review again.
                            </Alert>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col md={4}>
            <Card>
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  
                </div>
                <Card.Title>{lesson?.lesson_title} Modules</Card.Title>
                {(lesson?.modules || []).map((m, i) => {
                  const locked = i > 0 && !passedModules[i - 1];
                  return (
                    <div
                      key={i}
                      className="module-item mb-3 p-2 border rounded"
                    >
                      <div className="">
                        <div>
                          <h6>{m.title}</h6>
                          <p className="small mb-2">{m.description}</p>
                          <div className="d-flex align-items-center justify-content-between">
                            <Button
                              className="rounded-3 px-3 shadow-sm btn btn-seocondary btn-sm me-2"
                              size="sm"
                              variant={locked ? "secondary" : "outline-primary"}
                              disabled={locked}
                              onClick={() => {
                                setCurrentModule(i);
                                setReviewMode(true);
                              }}
                            >
                              {locked ? "Unavailable" : "Open"}
                            </Button>
                            {passedModules[i] && (
                              <span className="badge bg-success">✓ Passed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {allModulesPassed && (
                  <div className="mt-3 text-center">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={downloadCertificate}
                    >
                      Download Certificate
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </AdminLayout>
  );
};

export default Modules;
