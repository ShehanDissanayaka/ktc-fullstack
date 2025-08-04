import React, { useState, useEffect } from "react";
import "./CustomerMaster.css";
import axios from "../../api/axios";

const CustomerMaster = () => {
  const [formData, setFormData] = useState({
    code: "",
    group: "",
    area: "",
    name: "",
    address: "",
    telephone1: "",
    telephone2: "",
    mobile: "",
    fax: "",
    email: "",
    contactPerson: "",
    term: "",
    creditLimit: "",
    creditPeriod: "",
    vatNumber: "",
    accountNumber: "",
    lock: false,
  });

  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchBy, setSearchBy] = useState("CUSTOMER_name");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get("/customers/");
      setCustomers(response.data);
    } catch (error) {
      console.error("❌ Error fetching customers:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSave = async () => {
    try {
      const response = await axios.post("/customers/", {
        CUSTOMER_code: formData.code,
        CUSTOMER_group: parseInt(formData.group || 0),
        CUSTOMER_area: parseInt(formData.area || 0),
        CUSTOMER_name: formData.name,
        CUSTOMER_address: formData.address,
        CUSTOMER_tele_1: formData.telephone1,
        CUSTOMER_tele_2: formData.telephone2,
        CUSTOMER_tele_mobile: formData.mobile,
        CUSTOMER_fax: formData.fax,
        CUSTOMER_email: formData.email,
        CUSTOMER_contact_person: formData.contactPerson,
        CUSTOMER_term: parseInt(formData.term || 0),
        CUSTOMER_credit_limit: parseFloat(formData.creditLimit || 0),
        CUSTOMER_creidt_period: parseInt(formData.creditPeriod || 0),
        CUSTOMER_vat_number: formData.vatNumber,
        CUSTOMER_account_number: parseInt(formData.accountNumber || 0),
        CUSTOMER_lock: formData.lock,
        CUSTOMER_prefix_id: 1,
        CUSTOMER_prefix_number: 1,
      });

      alert("✅ Customer saved");
      fetchCustomers();
      console.log("Saved data:", response.data);
    } catch (error) {
      console.error("❌ Error saving customer:", error.response?.data || error);
      alert("❌ Failed to save customer");
    }
  };

  const handleNew = () => {
    setFormData({
      code: "",
      group: "",
      area: "",
      name: "",
      address: "",
      telephone1: "",
      telephone2: "",
      mobile: "",
      fax: "",
      email: "",
      contactPerson: "",
      term: "",
      creditLimit: "",
      creditPeriod: "",
      vatNumber: "",
      accountNumber: "",
      lock: false,
    });
  };

  return (
    <div className="customer-master">
      <h2>Customer Master</h2>

      <div className="form-grid">
        {/* LEFT COLUMN */}
        <div className="form-col">
          <div className="form-row">
            <label>Customer Code</label>
            <input name="code" value={formData.code} onChange={handleChange} />
          </div>
          <div className="form-row double">
            <div>
              <label>Customer Group</label>
              <select
                name="group"
                value={formData.group}
                onChange={handleChange}
              >
                <option value="">Select</option>
              </select>
            </div>
            <div>
              <label>Area Code</label>
              <select name="area" value={formData.area} onChange={handleChange}>
                <option value="">Select</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <label>Name</label>
            <input name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
            ></textarea>
          </div>
          <div className="form-row">
            <label>Telephone - 1</label>
            <input
              name="telephone1"
              value={formData.telephone1}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label>Telephone - 2</label>
            <input
              name="telephone2"
              value={formData.telephone2}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label>Mobile</label>
            <input
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="form-col">
          <div className="form-row">
            <label>FAX</label>
            <input name="fax" value={formData.fax} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Email</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label>Contact Person</label>
            <input
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label>Term</label>
            <select name="term" value={formData.term} onChange={handleChange}>
              <option value="1">Cash</option>
              <option value="2">Credit</option>
            </select>
          </div>

          <div className="form-row">
            <label>Credit Limit</label>
            <input
              name="creditLimit"
              value={formData.creditLimit}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label>Credit Period (Days)</label>
            <input
              name="creditPeriod"
              value={formData.creditPeriod}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label>VAT Reg. Number</label>
            <input
              name="vatNumber"
              value={formData.vatNumber}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <label>Account Number</label>
            <input
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
            />
          </div>
          <div className="form-row checkbox">
            <label>Lock</label>
            <input
              type="checkbox"
              name="lock"
              checked={formData.lock}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="button-row">
        <button onClick={handleSave}>Save</button>
        <button onClick={handleNew}>New...</button>
        <button>Close</button>
      </div>

      <div className="search-section">
        <label>Search</label>
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
          <option value="CUSTOMER_name">Customer Name</option>
          <option value="CUSTOMER_code">Customer Code</option>
        </select>
      </div>

      <div className="table-section">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Customer Name</th>
              <th>Telephone 1</th>
              <th>Telephone 2</th>
              <th>TP - Mobile</th>
              <th>Lock</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {customers
              .filter((cust) =>
                cust[searchBy]?.toLowerCase().includes(searchText.toLowerCase())
              )
              .map((cust) => (
                <tr key={cust.id}>
                  <td>{cust.CUSTOMER_code}</td>
                  <td>{cust.CUSTOMER_name}</td>
                  <td>{cust.CUSTOMER_tele_1}</td>
                  <td>{cust.CUSTOMER_tele_2}</td>
                  <td>{cust.CUSTOMER_tele_mobile}</td>
                  <td>{cust.CUSTOMER_lock ? "Yes" : "No"}</td>
                  <td>{cust.CUSTOMER_address}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="footer-hints">
        Save = Ctrl+S | New = Ctrl+N | Focus Search = F2 | Exit = Esc | Refresh
        = F5
      </div>
    </div>
  );
};

export default CustomerMaster;
