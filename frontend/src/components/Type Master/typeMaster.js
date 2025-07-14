// src/components/TypeMaster.js
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios"; // Use your axios instance
import "./typeMaster.css";

const TypeMaster = () => {
  const [typeCode, setTypeCode] = useState("");
  const [typeDescription, setTypeDescription] = useState("");
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("code");
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState(null);

  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // 🔧 Fetch Types from API
  const fetchTypes = useCallback(async () => {
    try {
      const response = await axios.get("/typeMasters/");
      setTypes(response.data);
    } catch (error) {
      console.error("Error fetching type data:", error);
      alert("Error fetching type data. Please try again later.");
    }
  }, []);


  // 🔧 Save Type to API
  const handleSave = useCallback(async () => {
    if (!typeCode.trim() || !typeDescription.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const payload = {
        TYPE_code: typeCode,
        TYPE_description: typeDescription,
      };

      const response = selectedTypeId
        ? await axios.put(`/typeMasters/${selectedTypeId}/`, payload)
        : await axios.post("/typeMasters/", payload);

      if (response.status === 201 || response.status === 200) {
        alert(selectedTypeId ? "✅ Type updated successfully!" : "✅ Type saved successfully!");
        setTypeCode("");
        setTypeDescription("");
        setSelectedTypeId(null);
        fetchTypes();
      }
    } catch (err) {
      console.error("❌ Error saving/updating type:", err);
      alert("Failed to save or update type. Please try again.");
    }
  }, [typeCode, typeDescription, selectedTypeId, fetchTypes]);

  // 🔧 Clear Form Fields
  const handleNew = useCallback(() => {
    setTypeCode("");
    setTypeDescription("");
    setSelectedTypeId(null);
  }, []);


  // 🔧 Load Types on Mount
  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  // 🔧 Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      } else if (e.ctrlKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleNew();
      } else if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleNew, navigate]);

  // 🔧 Filtered Types (Memoized for Performance)
  const filteredTypes = useMemo(() => {
    return types.filter((type) =>
      searchBy === "code"
        ? type.TYPE_code?.toLowerCase().includes(search.toLowerCase())
        : type.TYPE_description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [types, search, searchBy]);

  // handle edite function
  const handleEditType = (type) => {
    setSelectedTypeId(type.id);
    setTypeCode(type.TYPE_code);
    setTypeDescription(type.TYPE_description);
  };

  // handle delete function

  const handleDelete = useCallback(async () => {
    if (!selectedTypeId) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this type?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/typeMasters/${selectedTypeId}/`);
      alert("🗑️ Type deleted successfully!");
      setTypeCode("");
      setTypeDescription("");
      setSelectedTypeId(null);
      fetchTypes();
    } catch (err) {
      console.error("❌ Error deleting type:", err);
      alert("Failed to delete type. Please try again.");
    }
  }, [selectedTypeId, fetchTypes]);


  return (
    <div className="type-master-container">
      <h2 className="title">Type Master</h2>

      <div className="type-master-section">
        <h3>Type Master Details</h3>
        <div className="form-row">
          <label>Type Code</label>
          <input
            type="text"
            value={typeCode}
            onChange={(e) => setTypeCode(e.target.value)}
            placeholder="Enter Type Code"
          />
        </div>
        <div className="form-row">
          <label>Type Description</label>
          <textarea
            rows="3"
            value={typeDescription}
            onChange={(e) => setTypeDescription(e.target.value)}
            placeholder="Enter Type Description"
          ></textarea>
        </div>
        <div className="button-row">
          <button onClick={handleSave} className="save-btn">Save</button>
          <button onClick={handleNew} className="new-btn">New</button>
          <button onClick={handleDelete} className="delete-btn" disabled={!selectedTypeId}>
            Delete
          </button>

        </div>
      </div>

      <div className="type-master-section">
        <h3>Search</h3>
        <div className="form-row-search">
          <label>Search</label>
          <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
            <option value="code">Code</option>
            <option value="description">Description</option>
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            ref={searchInputRef}
            placeholder="Search Types"
          />
        </div>

        <div className="table-container">
          {loading ? (
            <p>Loading types...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Type Code</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredTypes.length > 0 ? (
                  filteredTypes.map((type) => (
                    <tr
                      key={type.id}
                      onClick={() => handleEditType(type)}
                      className={selectedTypeId === type.id ? "selected-row" : ""}
                    >
                      <td>{type.TYPE_code}</td>
                      <td>{type.TYPE_description}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">No matching types found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="footer-hint">
        <strong>Save = Ctrl+S | New = Ctrl+N | Focus Search = F2 | Exit = Esc</strong>
      </div>
    </div>
  );
};

export default TypeMaster;
