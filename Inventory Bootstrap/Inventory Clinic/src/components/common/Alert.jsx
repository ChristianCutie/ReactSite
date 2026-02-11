import { useEffect } from "react";

const Alert = ({ show, message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div
      className={`alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`}
      style={{ zIndex: 1055 }}
      role="alert"
    >
      {message}
      <button type="button" className="btn-close" onClick={onClose}></button>
    </div>
  );
};

export default Alert;
