import React, { useState, useEffect } from "react";
import LessonSelection from "./components/LessonSelection";
import Modules from "./components/Modules";
import AdminLayout from "../../components/layout/Adminlayout";
import axios from "../../config/axios";

const Lesson = ({ setIsAuth }) => {
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await axios.get("/training/lessons");
        if (res.data.success) setLessons(res.data.lessons || []);
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

    // Fetch full lesson structure when a lesson is selected
  const handleSelectLesson = async (lesson) => {
    try {
      const res = await axios.get(`/training/lessons/${lesson.id}/structure`);
      if (res.data.success) {
        setSelectedLesson(res.data.lesson);
      } else {
        console.error("Failed to fetch lesson structure");
      }
    } catch (err) {
      console.error("Error fetching lesson structure:", err);
    }
  };

    if (lessons.length === 0) {
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

  return (
    <>
      {!selectedLesson ? (
        <LessonSelection
          lessons={lessons}
          setSelectedLesson={handleSelectLesson}
          setIsAuth={setIsAuth}
        />
      ) : (
        <Modules
          lesson={selectedLesson}
          goBack={() => setSelectedLesson(null)}
          setIsAuth={setIsAuth}
        />
      )}
    </>
  );
};

export default Lesson;