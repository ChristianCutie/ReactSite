import React, { useState, useEffect } from "react";
import "./ProfileEditModal.css";
import { Toast, ToastContainer } from "react-bootstrap";
import {
  PersonFill,
  PinMap,
  People,
  Mortarboard,
  FileEarmark,
  Gear,
} from "react-bootstrap-icons";
import "../assets/style/global.css";
import api from "../config/axios";
import { useAuth } from "../context/AuthContext";

const ProfileEditModal = ({ profileData, onClose, onUpdate }) => {
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState(profileData);
  const [updateprofileData, setupdateprofileData] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setShowToast] = useState({
    show: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    setFormData(profileData);
  }, [profileData]);

  // Check if form has changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(profileData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || null,
    }));
  };

  const updateProfile = async (updateData) => {
    try {
      // Create a clean object without null/undefined values
      const cleanData = Object.keys(updateData).reduce((acc, key) => {
        if (
          updateData[key] !== null &&
          updateData[key] !== undefined &&
          updateData[key] !== ""
        ) {
          acc[key] = updateData[key];
        }
        return acc;
      }, {});

      const response = await api.post("/update-profile", cleanData);
      setupdateprofileData(response.data);
      // Update auth context with new user data
      if (response.data) {
        updateUser(response.data);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await updateProfile(formData);
      // Close modal and notify parent after a brief delay
      setTimeout(() => {
        if (onUpdate) onUpdate(result);
        onClose();
      }, 1500);
      
      setShowToast({
        show: true,
        message: "Profile updated successfully!",
        type: "success",
      });
    } catch (error) {
      setShowToast({
        show: true,
        message: error.message || "Error updating profile. Please try again.",
        type: "danger",
      });
      setIsSubmitting(false);
    }
  };

  const tabs = {
    personal: {
      label: "Personal Info",
      icon: <PersonFill size={16} className="me-2" />,
      fields: [
        "first_name",
        "middle_name",
        "last_name",
        "email",
        "phone",
        "sex",
        "date_of_birth",
        "place_of_birth",
        "blood_type",
        "citizenship",
        "civil_status",
        "height_m",
        "weight_kg",
      ],
    },
    contact: {
      label: "Contact Info",
      icon: <PinMap size={16} className="me-2" />,
      fields: [
        "residential_address",
        "residential_tel_no",
        "residential_zipcode",
        "permanent_address",
        "permanent_tel_no",
        "permanent_zipcode",
      ],
    },
    family: {
      label: "Family Info",
      icon: <People size={16} className="me-2" />,
      fields: [
        "father_name",
        "mother_name",
        "spouse_name",
        "spouse_occupation",
        "spouse_employer",
        "spouse_tel_no",
        "spouse_business_address",
        "emergency_contact_name",
        "emergency_contact_relation",
        "emergency_contact_number",
      ],
    },
    education: {
      label: "Education",
      icon: <Mortarboard size={16} className="me-2" />,
      fields: [
        "elementary_school_name",
        "elementary_inclusive_dates",
        "elementary_degree_course",
        "elementary_highest_level",
        "elementary_year_graduated",
        "elementary_honors",
        "secondary_school_name",
        "secondary_inclusive_dates",
        "secondary_degree_course",
        "secondary_highest_level",
        "secondary_year_graduated",
        "secondary_honors",
        "college_school_name",
        "college_inclusive_dates",
        "college_degree_course",
        "college_highest_level",
        "college_year_graduated",
        "college_honors",
        "vocational_school_name",
        "vocational_inclusive_dates",
        "vocational_degree_course",
        "vocational_highest_level",
        "vocational_year_graduated",
        "vocational_honors",
        "graduate_school_name",
        "graduate_inclusive_dates",
        "graduate_degree_course",
        "graduate_highest_level",
        "graduate_year_graduated",
        "graduate_honors",
      ],
    },
    government: {
      label: "Government IDs",
      icon: <FileEarmark size={16} className="me-2" />,
      fields: ["sss_no", "gsis_no", "pagibig_no", "philhealth_no", "tin_no"],
    },
    other: {
      label: "Other",
      icon: <Gear size={16} className="me-2" />,
      fields: ["salary_mode"],
    },
  };

  // Field labels
  const fieldLabels = {
    first_name: "First Name",
    middle_name: "Middle Name",
    last_name: "Last Name",
    email: "Email Address",
    phone: "Phone Number",
    sex: "Gender",
    date_of_birth: "Date of Birth",
    place_of_birth: "Place of Birth",
    blood_type: "Blood Type",
    citizenship: "Citizenship",
    civil_status: "Civil Status",
    height_m: "Height (m)",
    weight_kg: "Weight (kg)",
    residential_address: "Residential Address",
    residential_tel_no: "Residential Telephone",
    residential_zipcode: "Residential Zip Code",
    permanent_address: "Permanent Address",
    permanent_tel_no: "Permanent Telephone",
    permanent_zipcode: "Permanent Zip Code",
    father_name: "Father's Name",
    mother_name: "Mother's Name",
    spouse_name: "Spouse Name",
    spouse_occupation: "Spouse Occupation",
    spouse_employer: "Spouse Employer",
    spouse_tel_no: "Spouse Telephone",
    spouse_business_address: "Spouse Business Address",
    emergency_contact_name: "Emergency Contact Name",
    emergency_contact_relation: "Emergency Contact Relation",
    emergency_contact_number: "Emergency Contact Number",
    elementary_school_name: "Elementary School Name",
    elementary_inclusive_dates: "Elementary Inclusive Dates",
    elementary_degree_course: "Elementary Degree/Course",
    elementary_highest_level: "Elementary Highest Level",
    elementary_year_graduated: "Elementary Year Graduated",
    elementary_honors: "Elementary Honors",
    secondary_school_name: "Secondary School Name",
    secondary_inclusive_dates: "Secondary Inclusive Dates",
    secondary_degree_course: "Secondary Degree/Course",
    secondary_highest_level: "Secondary Highest Level",
    secondary_year_graduated: "Secondary Year Graduated",
    secondary_honors: "Secondary Honors",
    college_school_name: "College School Name",
    college_inclusive_dates: "College Inclusive Dates",
    college_degree_course: "College Degree/Course",
    college_highest_level: "College Highest Level",
    college_year_graduated: "College Year Graduated",
    college_honors: "College Honors",
    vocational_school_name: "Vocational School Name",
    vocational_inclusive_dates: "Vocational Inclusive Dates",
    vocational_degree_course: "Vocational Degree/Course",
    vocational_highest_level: "Vocational Highest Level",
    vocational_year_graduated: "Vocational Year Graduated",
    vocational_honors: "Vocational Honors",
    graduate_school_name: "Graduate School Name",
    graduate_inclusive_dates: "Graduate Inclusive Dates",
    graduate_degree_course: "Graduate Degree/Course",
    graduate_highest_level: "Graduate Highest Level",
    graduate_year_graduated: "Graduate Year Graduated",
    graduate_honors: "Graduate Honors",
    sss_no: "SSS Number",
    gsis_no: "GSIS Number",
    pagibig_no: "PAG-IBIG Number",
    philhealth_no: "PhilHealth Number",
    tin_no: "TIN Number",
    salary_mode: "Salary Mode",
  };

  const getFieldType = (fieldName) => {
    if (fieldName.includes("date")) return "date";
    if (fieldName.includes("email")) return "email";
    if (
      fieldName.includes("phone") ||
      fieldName.includes("tel_no") ||
      fieldName.includes("_no")
    )
      return "tel";
    if (fieldName.includes("height") || fieldName.includes("weight"))
      return "number";
    return "text";
  };

  return (
    <div  className="prof-modal-overlay" onClick={onClose}>
      <div className="prof-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="prof-modal-header">
          <h2>Edit Profile</h2>
          <button className="prof-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="prof-modal-tabs">
          {Object.entries(tabs).map(([key, tab]) => (
            <button
              key={key}
              className={`prof-modal-tab ${activeTab === key ? "active" : ""}`}
              onClick={() => setActiveTab(key)}
              title={tab.label}
            >
              <span className="prof-tab-icon">{tab.icon}</span>
              <span className="prof-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="prof-modal-form">
          <div className="prof-form-fields">
            {tabs[activeTab].fields.map((fieldName) => {
              const fieldType = getFieldType(fieldName);
              const isEducationField =
                fieldName.includes("elementary") ||
                fieldName.includes("secondary") ||
                fieldName.includes("college") ||
                fieldName.includes("vocational") ||
                fieldName.includes("graduate");

              if (isEducationField) {
                const level = fieldName.split("_")[0];
                const prevField =
                  tabs[activeTab].fields[
                    tabs[activeTab].fields.indexOf(fieldName) - 1
                  ];
                const showHeader = !prevField || !prevField.startsWith(level);

                if (showHeader) {
                  return (
                    <div key={fieldName}>
                      <h4 className="prof-education-level">
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </h4>
                      <div className="prof-form-group">
                        <label htmlFor={fieldName}>
                          {fieldLabels[fieldName]}
                        </label>
                        <input
                          type={fieldType}
                          id={fieldName}
                          name={fieldName}
                          value={formData[fieldName] || ""}
                          onChange={handleChange}
                          placeholder={`Enter ${fieldLabels[fieldName].toLowerCase()}`}
                        />
                      </div>
                    </div>
                  );
                }
              }

              return (
                <div key={fieldName} className="prof-form-group">
                  <label htmlFor={fieldName}>{fieldLabels[fieldName]}</label>
                  {fieldName === "sex" ? (
                    <select
                      id={fieldName}
                      name={fieldName}
                      value={formData[fieldName] || ""}
                      onChange={handleChange}
                    >
                      <option value="">-- Select --</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : fieldName === "civil_status" ? (
                    <select
                      id={fieldName}
                      name={fieldName}
                      value={formData[fieldName] || ""}
                      onChange={handleChange}
                    >
                      <option value="">-- Select --</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  ) : fieldName === "blood_type" ? (
                    <select
                      id={fieldName}
                      name={fieldName}
                      value={formData[fieldName] || ""}
                      onChange={handleChange}
                    >
                      <option value="">-- Select --</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  ) : (fieldName.includes("address") &&
                      !fieldName.includes("business")) ||
                    fieldName === "spouse_business_address" ? (
                    <textarea
                      id={fieldName}
                      name={fieldName}
                      value={formData[fieldName] || ""}
                      onChange={handleChange}
                      placeholder={`Enter ${fieldLabels[fieldName].toLowerCase()}`}
                      rows="3"
                    />
                  ) : (
                    <input
                      type={fieldType}
                      id={fieldName}
                      name={fieldName}
                      value={formData[fieldName] || ""}
                      onChange={handleChange}
                      placeholder={`Enter ${fieldLabels[fieldName].toLowerCase()}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="prof-modal-footer ">
            <button
              type="button"
              className="prof-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="prof-btn-update"
              disabled={isSubmitting || !hasChanges}
              title={!hasChanges ? "No changes detected" : ""}
            >
              {isSubmitting ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>

        {/* Toast Notification */}
        <ToastContainer
          position="top-end"
          className="p-3"
          style={{ position: "fixed", zIndex: 9999 }}
        >
          <Toast
            className={
              toast.type === "success"
                ? "glb-toast-success"
                : "glb-toast-danger"
            }
            show={toast.show}
            onClose={() => setShowToast({ ...toast, show: false })}
            delay={3000}
            autohide
          >
            <Toast.Body>{toast.message}</Toast.Body>
          </Toast>
        </ToastContainer>
      </div>
    </div>
  );
};

export default ProfileEditModal;
