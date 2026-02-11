import React, { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import AdminLayout from "../../../components/layout/AdminLayout";
import "./FaceRecognition.css";

function App({ setIsAuth }) {
  const videoRef = useRef();
  const canvasRef = useRef();

  // LOAD FROM USEEFFECT
  useEffect(() => {
    const initialize = async () => {
      await startVideo();
      if (videoRef.current) {
        loadModels();
      }
    };
    initialize();
  }, []);

  // OPEN YOU FACE WEBCAM
  const startVideo = async () => {
    return navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((currentStream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      })
      .catch((err) => {
        console.error("Camera error:", err);
      });
  };
  // LOAD MODELS FROM FACE API
  const loadModels = () => {
    const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]).then(() => {
      faceMyDetect();
    }).catch((err) => {
      console.error("Model loading error:", err);
    });
  };
 const faceMyDetect = () => {
  if (!videoRef.current || !canvasRef.current) return;

  const video = videoRef.current;
  const canvas = canvasRef.current;
  const displaySize = { width: 940, height: 650 };
  canvas.width = displaySize.width;
  canvas.height = displaySize.height;
  faceapi.matchDimensions(canvas, displaySize);

  video.onplay = () => {
    const interval = setInterval(async () => {
      if (video.readyState === 4) { // HAVE_ENOUGH_DATA
        try {
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

          const resized = faceapi.resizeResults(detections, displaySize);

          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          faceapi.draw.drawDetections(canvas, resized);
          faceapi.draw.drawFaceLandmarks(canvas, resized);
          faceapi.draw.drawFaceExpressions(canvas, resized);
        } catch (err) {
          console.error("Face detection error:", err);
        }
      }
    }, 100);
  };
};


  return (
    <AdminLayout setIsAuth={setIsAuth}>
      <div className="myapp">
        <h1>FAce Detection</h1>
        <div className="appvide">
          <video 
            crossOrigin="anonymous" 
            ref={videoRef} 
            autoPlay 
            muted
            width="940"
            height="650"
          ></video>
        </div>
        <canvas
          ref={canvasRef}
          width="940"
          height="650"
          className="appcanvas"
        />
      </div>
    </AdminLayout>
  );
}

export default App;
