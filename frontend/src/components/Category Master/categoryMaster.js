// src/components/CategoryMaster/categoryMaster.js
import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "../../api/axios"; // Axios instance with base URL configured
import "./categoryMaster.css";

const CategoryMaster = () => {
  const [categoryCode, setCategoryCode] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState("code");
  const [categories, setCategories] = useState([]);
  const searchInputRef = useRef(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);


  // 🚀 Fetch categories from the backend
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get("/categoryMasters/");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

   // 🚀 Clear form fields
  const handleNew = useCallback(() => {
    setCategoryCode("");
    setCategoryDescription("");
    setSelectedCategoryId(null);
  }, []);

  // 🚀 Save the new category to the backend
  const handleSave = useCallback(async () => {
    if (!categoryCode.trim() || !categoryDescription.trim()) {
      alert("Category Code and Description are required.");
      return;
    }

    try {
      const payload = {
        CATEGORY_code: categoryCode.trim(),
        CATEGORY_description: categoryDescription.trim(),
        CATEGORY_active: true,
      };

      if (selectedCategoryId) {
        await axios.put(`/categoryMasters/${selectedCategoryId}/`, payload);
        alert("Category updated successfully!");
      } else {
        await axios.post("/categoryMasters/", payload);
        alert("✅ Category saved successfully!");
      }

      handleNew(); // Clear form
      fetchCategories(); // Refresh list
    } catch (error) {
      console.error("Error saving/updating category:", error);
      alert("Failed to save or update category.");
    }
  }, [categoryCode, categoryDescription, selectedCategoryId, fetchCategories, handleNew]);

 


  // 🚀 Handle keyboard shortcuts
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
        window.close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleNew]);

  // 🚀 Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 🚀 Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    searchBy === "code"
      ? category.CATEGORY_code.toLowerCase().includes(search.toLowerCase())
      : category.CATEGORY_description
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // hadle edit function
  const handleEditCategory = (category) => {
    setSelectedCategoryId(category.id);
    setCategoryCode(category.CATEGORY_code);
    setCategoryDescription(category.CATEGORY_description);
  };

  // handle delete function

  const handleDelete = useCallback(async () => {
    if (!selectedCategoryId) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this category?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/categoryMasters/${selectedCategoryId}/`);
      alert("🗑️Category deleted successfully!");
      handleNew(); // Clear form
      fetchCategories(); // Refresh list
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category.");
    }
  }, [selectedCategoryId, fetchCategories, handleNew]);


  return (
    <div className="category-master-container">
      <div className="title">Category Master</div>

      {/* Category Details Section */}
      <div className="category-master-section">
        <h3>Category Master Details</h3>
        <div className="form-row">
          <label>Category Code</label>
          <input
            type="text"
            value={categoryCode}
            onChange={(e) => setCategoryCode(e.target.value)}
            placeholder="Enter Category Code"
          />
        </div>
        <div className="form-row">
          <label>Category Description</label>
          <textarea
            rows="3"
            value={categoryDescription}
            onChange={(e) => setCategoryDescription(e.target.value)}
            style={{ resize: "vertical", width: "75%" }}
            placeholder="Enter Category Description"
          ></textarea>
        </div>
        <div className="button-row">
          <button onClick={handleSave}>Save</button>
          <button onClick={handleNew}>New</button>
          <button onClick={handleDelete} disabled={!selectedCategoryId} className="delete-btn">
            Delete
          </button>
        </div>
      </div>

      {/* Search and Category List Section */}
      <div className="category-master-section">
        <h3>Search Categories</h3>
        <div className="form-row-search">
          <label>Search By</label>
          <select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
          >
            <option value="code">Code</option>
            <option value="description">Description</option>
          </select>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            ref={searchInputRef}
            placeholder="Search categories"
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Category Code</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    onClick={() => handleEditCategory(category)}
                    className={selectedCategoryId === category.id ? "selected-row" : ""}
                  >
                    <td>{category.CATEGORY_code}</td>
                    <td>{category.CATEGORY_description}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2">No matching categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="footer-hint">
        Save = Ctrl+S | New = Ctrl+N | Focus Search = F2 | Exit = Esc
      </div>
    </div>
  );
};

export default CategoryMaster;
