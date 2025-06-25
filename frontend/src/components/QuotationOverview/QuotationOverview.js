import React, { useState, useEffect } from "react";
import axios from '../../api/axios';
import "./QuotationOverview.css";

const QuotationOverview = () => {
    const [header, setHeader] = useState({
        QUH_code: "",
        QUH_pay_type: "",
        QUH_validity: "",
        QUH_location: "",
        QUH_your_ref: "",
        QUH_customer_name: "",
        QUH_customer_address: "",
        QUH_customer_contact: "",
        QUH_attention: "",
        QUH_date: "",
        QUH_quatation_date: "",
    });
    const [item, setItem] = useState({ id: "", code: "", description: "", rate: "", qty: "" });
    const [availableItems, setAvailableItems] = useState([]);
    const [items, setItems] = useState([]);
    const [grossValue, setGrossValue] = useState(0);
    const [netValue, setNetValue] = useState(0);
    const [quotationId, setQuotationId] = useState(null);

    // Load Items
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await axios.get("/api/item/");
                console.log("Available Items:", res.data);
                setAvailableItems(res.data);
            } catch (error) {
                console.error(error);
                alert("❌ Failed to load items.");
            }
        };
        fetchItems();
    }, []);


    const handleHeaderChange = e => {
        const { name, value } = e.target;
        setHeader({ ...header, [name]: value });
    };
    const handleItemChange = e => {
        const { name, value } = e.target;
        setItem({ ...item, [name]: value });
    };
    const addItem = async () => {
        if (!item.id || !item.qty || !item.rate) {
            alert("Please fill Item, Quantity, and Rate");
            return;
        }
        const value = parseFloat(item.qty) * parseFloat(item.rate);
        const newItems = [...items, { ...item, value }];
        setItems(newItems);
        const total = newItems.reduce((sum, i) => sum + i.value, 0);
        setGrossValue(total);
        setNetValue(total);
        setItem({ id: "", code: "", description: "", rate: "", qty: "" }); // Reset
    };
    const saveQuotation = async () => {
        const payload = {
            ...header,
            QUH_validity: parseInt(header.QUH_validity, 10),
            QUH_gross_value: grossValue,
            QUH_net_value: netValue,
            details: items.map((i, idx) => ({
                QUD_line_no: idx + 1,
                QUD_item: i.id,
                QUD_rate: parseFloat(i.rate),
                QUD_qty: parseFloat(i.qty),
            })),
        };
        try {
            const res = await axios.post("/api/quotation/", payload);
            console.log("Save Response:", res.data);
            alert("✅ Quotation Saved");
            setQuotationId(res.data.id);
        } catch (error) {
            console.error(error);
            if (error.response) {
                console.error(error.response.data);
                alert(`❌ Error Details:\n${JSON.stringify(error.response.data, null, 2)}`);
            }
        }
    };

    const deleteQuotation = async () => {
        if (!quotationId) return alert("Save first!");
        try {
            await axios.delete(`/api/quotation/${quotationId}/`);
            alert("✅ Deleted");
        } catch (error) {
            console.error(error);
            alert("❌ Error deleting the quotation");
        }
    };
    const printQuotation = async () => {
        if (!quotationId) return alert("Save first!");
        try {
            const res = await axios.get(`/api/quotation/${quotationId}/pdf/`, {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
            window.open(url, "_blank");
        } catch (error) {
            console.error(error);
            alert("❌ Error generating the PDF");
        }
    };
    const newQuotation = () => {
        setHeader({
            QUH_code: "",
            QUH_pay_type: "",
            QUH_validity: "",
            QUH_location: "",
            QUH_your_ref: "",
            QUH_customer_name: "",
            QUH_customer_address: "",
            QUH_customer_contact: "",
            QUH_attention: "",
            QUH_date: "",
            QUH_quatation_date: "",
        });
        setItems([]);
        setGrossValue(0);
        setNetValue(0);
        setQuotationId(null);
    };
    return (
        <div className="quotation-container">
            <div className="top-sections">
                {/* Left Section */}
                <div className="section header-section">
                    <div className="input-group"><label>Code</label><input name="QUH_code" value={header.QUH_code} onChange={handleHeaderChange} /></div>
                    <div className="input-group"><label>Pay Type</label><input name="QUH_pay_type" value={header.QUH_pay_type} onChange={handleHeaderChange} /></div>
                    <div className="input-group"><label>Validity (Days)</label><input name="QUH_validity" value={header.QUH_validity} onChange={handleHeaderChange} /></div>
                    <div className="input-group"><label>Location</label><input name="QUH_location" value={header.QUH_location} onChange={handleHeaderChange} /></div>
                    <div className="input-group"><label>Your Ref</label><input name="QUH_your_ref" value={header.QUH_your_ref} onChange={handleHeaderChange} /></div>
                    <div className="input-group"><label>Attention</label><input name="QUH_attention" value={header.QUH_attention} onChange={handleHeaderChange} /></div>
                    <div className="input-group"><label>Date</label><input type="date" name="QUH_date" value={header.QUH_date} onChange={handleHeaderChange} /></div>
                    <div className="input-group"><label>Quotation Date</label><input type="date" name="QUH_quatation_date" value={header.QUH_quatation_date} onChange={handleHeaderChange} /></div>
                </div>

                {/* Middle Section */}
                <div className="section item-section">
                    <div className="input-group">
                        <label>Item</label>
                        <select
                            name="id"
                            value={item.id}
                            onChange={(e) => {
                                const selectedId = e.target.value;
                                if (!selectedId) {
                                    setItem({ id: "", code: "", description: "", rate: "", qty: "" });
                                    return;
                                }
                                const selectedItem = availableItems.find(
                                    (it) => it.ITEM_id === parseInt(selectedId, 10)
                                );
                                if (selectedItem) {
                                    setItem({
                                        id: selectedItem.ITEM_id,
                                        code: selectedItem.ITEM_code,
                                        description: selectedItem.ITEM_description,
                                        rate: selectedItem.ITEM_normal_selling_price,
                                        qty: "",
                                    });
                                }
                            }}
                        >
                            <option value="">--Select Item--</option>
                            {availableItems.map((it) => (
                                <option key={it.ITEM_id} value={it.ITEM_id}>
                                    {it.ITEM_code} - {it.ITEM_description}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group"><label>Item Description</label><input value={item.description} readOnly /></div>
                    <div className="input-group"><label>Rate</label><input value={item.rate} readOnly /></div>
                    <div className="input-group"><label>QTY</label><input name="qty" value={item.qty} onChange={handleItemChange} /></div>
                    <div className="add-button-container"><button className="add-button" onClick={addItem}>Add</button></div>


                </div>

                {/* Right Section */}
                <div className="section totals-section">
                    <div className="input-group"><label>Customer Name</label><input name="QUH_customer_name" value={header.QUH_customer_name} onChange={handleHeaderChange} /></div>
                    <div className="input-group"><label>Customer Address</label><input name="QUH_customer_address" value={header.QUH_customer_address} onChange={handleHeaderChange} /></div>
                    <div className="input-group"><label>Customer Contact</label><input name="QUH_customer_contact" value={header.QUH_customer_contact} onChange={handleHeaderChange} /></div>
                    <div className="totals">
                        <div>Gross Value: Rs. {grossValue.toFixed(2)}</div>
                        <div>Net Value: Rs. {netValue.toFixed(2)}</div>
                    </div>
                    <div className="actions">
                        <button onClick={saveQuotation}>Save</button>
                        <button onClick={newQuotation}>New</button>
                        <button onClick={deleteQuotation}>Delete</button>
                        <button onClick={printQuotation}>Print</button>
                    </div>
                </div>
            </div>

            <div className="table-section">
                <table>
                    <thead><tr><th>Code</th><th>Description</th><th>QTY</th><th>Rate</th><th>Value</th></tr></thead>
                    <tbody>
                        {items.length > 0 ? (
                            items.map((it, idx) => (
                                <tr key={idx}>
                                    <td>{it.code}</td><td>{it.description}</td><td>{it.qty}</td><td>{it.rate}</td><td>{it.value}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="5">No Items Added</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default QuotationOverview;

