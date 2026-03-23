import React, { useState, useEffect, useRef } from "react";
import LessonSelection from "@/pages/lessons/components/LessonSelection";
import Modules from "@/pages/lessons/components/Modules";
import AdminLayout from "@/components/layout/Adminlayout";
import api from "@/config/axios";
import Unauthorized from "@/components/access/unauthorized/Unauthorized";

//import { useAuth } from "@/context/AuthContext";

const Lesson = ({ setIsAuth }) => {
 // const { updateUser } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
    const [isUnauthorized, setIsUnauthorized] = useState(false);

      const hasFetched = useRef(false);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await api.get("/training/lessons");
        if (res.data.success) {
          // Check for unauthorized access in the message
          if (res.data.message && res.data.message.includes("Access denied")) {
            setIsUnauthorized(true);
          } else {
            setLessons(res.data.lessons || []);
          }
        }
      } catch (err) {
        // Handle 401 Unauthorized status
        if (err.response && err.response.status === 401) {
          setIsUnauthorized(true);
        } else {
          console.error("Failed to fetch lessons:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    if (hasFetched.current) return;
      hasFetched.current = true;
    fetchLessons();
  }, []);

  // Fetch full lesson structure when a lesson is selected
  const handleSelectLesson = async (lesson) => {
    try {
      const res = await api.get(`/training/lessons/${lesson.id}/structure`);
      if (res.data.success) {
        // Check for unauthorized access in the message
        if (res.data.message && res.data.message.includes("Access denied")) {
          setIsUnauthorized(true);
          return;
        }
        setSelectedLesson(res.data.lesson);
      } else {
        console.error("Failed to fetch lesson structure");
      }
    } catch (err) {
      // Handle 401 Unauthorized status
      if (err.response && err.response.status === 401) {
        setIsUnauthorized(true);
      } else {
        console.error("Error fetching lesson structure:", err);
      }
    }
  };

  // If unauthorized, show the Unauthorized component

  if (isUnauthorized) {
    return (
      <AdminLayout setIsAuth={setIsAuth}>
        <Unauthorized />
      </AdminLayout>
    );
  }

  // Show loading state while fetching lessons

  if (loading || lessons.length === 0) {
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
