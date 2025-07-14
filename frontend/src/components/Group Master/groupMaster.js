// src/components/GroupMaster.js
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import "./groupMaster.css";

const GroupMaster = () => {
  const [groupCode, setGroupCode] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("code");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  //Fetch Groups from API
  const fetchGroups = useCallback(async () => {
    try {
      const response = await axios.get("/groupMasters/");
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching group data:", error);
      alert("Error fetching group data. Please try again later.");
    }
  }, []);


  // 🔧 Save Group to API
  const handleSave = useCallback(async () => {
    if (!groupCode.trim() || !groupDescription.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const payload = {
        GROUP_code: groupCode,
        GROUP_description: groupDescription,
      };

      const response = selectedGroupId
        ? await axios.put(`/groupMasters/${selectedGroupId}/`, payload)
        : await axios.post("/groupMasters/", payload);

      if (response.status === 201 || response.status === 200) {
        alert(selectedGroupId ? "✅ Group updated successfully!" : "✅ Group saved successfully!");
        setGroupCode("");
        setGroupDescription("");
        setSelectedGroupId(null);
        fetchGroups();
      }
    } catch (err) {
      console.error("❌ Error saving/updating group:", err);
      alert("Failed to save or update group. Please try again.");
    }
  }, [groupCode, groupDescription, selectedGroupId, fetchGroups]);

  // delete handler

  const handleDelete = useCallback(async () => {
    if (!selectedGroupId) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this group?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/groupMasters/${selectedGroupId}/`);
      alert("🗑️ Group deleted successfully!");
      setGroupCode("");
      setGroupDescription("");
      setSelectedGroupId(null);
      fetchGroups();
    } catch (err) {
      console.error("❌ Error deleting group:", err);
      alert("Failed to delete group. Please try again.");
    }
  }, [selectedGroupId, fetchGroups]);



  // 🔧 Clear Form Fields
  const handleNew = useCallback(() => {
    setGroupCode("");
    setGroupDescription("");
    setSelectedGroupId(null);
  }, []);


  // 🔧 Load Groups on Mount
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

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

  // 🔧 Filtered Groups (Memoized for Performance)
  const filteredGroups = useMemo(() => {
    return groups.filter((group) =>
      searchBy === "code"
        ? group.GROUP_code?.toLowerCase().includes(search.toLowerCase())
        : group.GROUP_description?.toLowerCase().includes(search.toLowerCase())
    );
  }, [groups, search, searchBy]);

  const handleEditGroup = (group) => {
    setSelectedGroupId(group.id);
    setGroupCode(group.GROUP_code);
    setGroupDescription(group.GROUP_description);
  };




  return (
    <div className="group-master-container">
      <h2 className="title">Group Master</h2>

      <div className="group-master-section">
        <h3>Group Master Details</h3>
        <div className="form-row">
          <label>Group Code</label>
          <input
            type="text"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value)}
            placeholder="Enter Group Code"
          />
        </div>
        <div className="form-row">
          <label>Group Description</label>
          <textarea
            rows="3"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            placeholder="Enter Group Description"
          ></textarea>
        </div>
        <div className="button-row">
          <button onClick={handleSave} className="save-btn">Save</button>
          <button onClick={handleNew} className="new-btn">New</button>
          <button onClick={handleDelete} className="delete-btn" disabled={!selectedGroupId}>Delete</button>

        </div>
      </div>

      <div className="group-master-section">
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
            placeholder="Search Groups"
          />
        </div>

        <div className="table-container">
          {loading ? (
            <p>Loading groups...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Group Code</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => (
                    <tr
                      key={group.id}
                      onClick={() => handleEditGroup(group)}
                      className={selectedGroupId === group.id ? "selected-row" : ""}
                    >
                      <td>{group.GROUP_code}</td>
                      <td>{group.GROUP_description}</td>
                    </tr>

                  ))
                ) : (
                  <tr>
                    <td colSpan="2">No matching groups found.</td>
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

export default GroupMaster;
