import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ProgressBar,
  Form,
} from "react-bootstrap";
import AdminLayout from "../../components/layout/Adminlayout";
import "./Lesson.css";

const Lesson = ({ setIsAuth }) => {
  const steps = ["Module 1", "Module 2", "Module 3", "Module 4"];
  const [step, setStep] = useState(1);
  const [reviewMode, setReviewMode] = useState(true);

  // Track answers for each test
  const [selectedAnswers, setSelectedAnswers] = useState([[], [], [], []]);
  const [progressStep, setProgressStep] = useState(0);

  // Track if test is submitted
  const [testSubmitted, setTestSubmitted] = useState([
    false,
    false,
    false,
    false,
  ]);

  // Track scores
  const [testScores, setTestScores] = useState([0, 0, 0, 0]);

  // Modules description
  const modules = [
    "Workplace hazard awareness and safety procedures.",
    "Correct safety equipment usage and reporting.",
    "Importance of workplace safety and preventive measures.",
    "Personal protective equipment on site.",
  ];

  // Multiple questions per test
  const tests = [
    {
      questions: [
        {
          q: "What should you do if you see a workplace hazard?",
          options: [
            "Ignore it",
            "Report it immediately",
            "Wait for someone else",
          ],
          correct: 1,
        },
        {
          q: "Who is responsible for reporting hazards?",
          options: ["Employee", "Manager", "Visitor"],
          correct: 0,
        },
        {
          q: "What is a hazard?",
          options: [
            "A safety violation",
            "A potential danger",
            "A finished task",
          ],
          correct: 1,
        },
      ],
    },
    {
      questions: [
        {
          q: "Which of these is safety equipment?",
          options: ["Helmet", "Sandals", "Cap"],
          correct: 0,
        },
        {
          q: "Why wear safety gloves?",
          options: ["Protect hands", "Look professional", "For fun"],
          correct: 0,
        },
        {
          q: "Safety shoes prevent?",
          options: ["Slips and falls", "Fatigue", "Sunburn"],
          correct: 0,
        },
      ],
    },
    {
      questions: [
        {
          q: "Why is workplace safety important?",
          options: ["Prevent accidents", "Not important", "Waste time"],
          correct: 0,
        },
        {
          q: "What happens if safety rules are ignored?",
          options: [
            "Injury risk increases",
            "Nothing happens",
            "Everyone is happy",
          ],
          correct: 0,
        },
        {
          q: "Safety signs are for?",
          options: ["Decoration", "Guidance and warning", "Fun"],
          correct: 1,
        },
      ],
    },
    {
      questions: [
        {
          q: "What should workers wear on construction sites?",
          options: ["Helmet", "Flip-flops", "None"],
          correct: 0,
        },
        {
          q: "High-visibility vests help?",
          options: ["Be seen by others", "Look stylish", "Stay warm"],
          correct: 0,
        },
        {
          q: "Ear protection is for?",
          options: ["Loud environments", "Silent rooms", "Office"],
          correct: 0,
        },
      ],
    },
  ];

  const handleAnswerSelect = (testIndex, questionIndex, optionIndex) => {
    const newAnswers = [...selectedAnswers];
    if (!newAnswers[testIndex]) newAnswers[testIndex] = [];
    newAnswers[testIndex][questionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitTest = () => {
    const testIndex = step - 1;
    const answers = selectedAnswers[testIndex] || [];
    const questions = tests[testIndex].questions;
    let score = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) score++;
    });
    const newScores = [...testScores];
    newScores[testIndex] = score;
    setTestScores(newScores);

    const newSubmitted = [...testSubmitted];
    newSubmitted[testIndex] = true;
    setTestSubmitted(newSubmitted);
  };

  const handleDownload = (testIndex) => {
    const content = `Certificate - ${steps[testIndex]}\n\nEmployee Name has passed ${steps[testIndex]}.\nScore: ${testScores[testIndex]}/${tests[testIndex].questions.length}\nDate: ${new Date().toLocaleDateString()}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${steps[testIndex]}-certificate.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleNextTest = () => {
    if (step < steps.length) {
      setStep(step + 1);
      setReviewMode(true);
      setProgressStep(progressStep + 1);
    }
  };

  return (
    <AdminLayout setIsAuth={setIsAuth}>
      <Container fluid className="mt-4 lesson-container">
        <Row className="mb-3">
          <Col>
            <h3>Workplace Safety Training</h3>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <ProgressBar now={(progressStep / steps.length) * 100} />
            <div className="d-flex justify-content-between mt-2">
              {steps.map((s, i) => (
                <small
                  key={i}
                  className={
                    step >= i + 1 ? "fw-bold text-primary" : "text-muted"
                  }
                >
                  {i + 1}. {s}
                </small>
              ))}
            </div>
          </Col>
        </Row>

        <Row>
          {/* MAIN CONTENT */}
          <Col md={8}>
            <Card>
              <Card.Body>
                <Card.Title>{steps[step - 1]}</Card.Title>

                {reviewMode ? (
                  <>
                    <Card.Text>{modules[step - 1]}</Card.Text>
                    <Button
                      variant="primary"
                      onClick={() => setReviewMode(false)}
                    >
                      Let's Review & Take Test
                    </Button>
                  </>
                ) : (
                  <>
                    {tests[step - 1].questions.map((q, idx) => (
                      <Form.Group className="mb-3" key={idx}>
                        <Form.Label>
                          {idx + 1}. {q.q}
                        </Form.Label>
                        {q.options.map((opt, oIdx) => (
                          <Form.Check
                            key={oIdx}
                            type="radio"
                            name={`t${step}-q${idx}`}
                            label={opt}
                            checked={selectedAnswers[step - 1]?.[idx] === oIdx}
                            onChange={() =>
                              handleAnswerSelect(step - 1, idx, oIdx)
                            }
                          />
                        ))}
                      </Form.Group>
                    ))}
                    <div className="d-flex align-items-center justify-content-between">
                      <Button
                        variant="success"
                        onClick={handleSubmitTest}
                        disabled={
                          selectedAnswers[step - 1]?.length !==
                          tests[step - 1].questions.length
                        }
                      >
                        Submit Test
                      </Button>

                      {testSubmitted[step - 1] && (
                        <div className=" d-flex align-items-center">
                          <div className="text-success me-3 mt-2">
                            You scored: {testScores[step - 1]}/
                            {tests[step - 1].questions.length}
                          </div>

                          <Button
                            className="mt-2"
                            variant="success"
                            onClick={() => handleDownload(step - 1)}
                          >
                            Download Certificate
                          </Button>

                          {step < steps.length && (
                            <Button
                              className="ms-2 mt-2"
                              variant="primary"
                              onClick={handleNextTest}
                              disabled={!testSubmitted[step - 1]}
                            >
                              Next Test
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* SIDEBAR */}
          <Col md={4}>
            {steps.map((s, i) => (
              <Card className="mb-3" key={i}>
                <Card.Body>
                  <Card.Title>{s}</Card.Title>
                  <Card.Text>{modules[i]}</Card.Text>
                  <Button
                    variant="outline-primary"
                    disabled={i > 0 && !testSubmitted[i - 1]}
                    onClick={() => setStep(i + 1)}
                  >
                    Take
                  </Button>
                  {testSubmitted[i] && (
                    <Button
                      className="ms-2"
                      variant="success"
                      onClick={() => handleDownload(i)}
                    >
                      Download Certificate
                    </Button>
                  )}
                </Card.Body>
              </Card>
            ))}
          </Col>
        </Row>
      </Container>
    </AdminLayout>
  );
};

export default Lesson;
