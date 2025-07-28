import React, { useState, useEffect } from 'react';
import "./InvoiceCashier.css";
import axios from "../../api/axios";

const InvoiceCashier = () => {
  const [invoiceData, setInvoiceData] = useState({
    tokenNumber: '',
    invoiceNumber: '',
    location: '',
    customer: '',
    paymentMethod: '',
    barcode: '',
    itemCode: '',
    description: '',
    sellingPrice: '0.00',
    rate: '0.00',
    qty: '0',
    warranty: '',
    serialNumbers: '',
    commission: '0.00',
    discount: '0.00',
    discountType: 'Value'
  });

  const handleInputChange = (field, value) => {
    if (field === "itemCode") {
      const selected = itemList.find(item => item.ITEM_code === value);
      if (selected) {
        const price = parseFloat(selected.ITEM_normal_selling_price) || 0;
        console.log("🔍 Selected item:", selected);
        setInvoiceData(prev => ({
          ...prev,
          itemCode: value,
          description: selected.ITEM_description || "",
          sellingPrice: price.toFixed(2),
          rate: price.toFixed(2),
        }));
        return;
      }
    }


    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const addItem = () => {
    if (!invoiceData.itemCode) {
      alert("Please select a valid item code.");
      return;
    }

    const selectedItem = itemList.find(item => item.ITEM_code === invoiceData.itemCode);

    if (!selectedItem) {
      alert("Selected item code is not in item list.");
      console.error("Item not found for code:", invoiceData.itemCode);
      return;
    }

    console.log("Adding newItem with id:", selectedItem.ITEM_id);

    const newItem = {
      id: selectedItem.ITEM_id,
      itemCode: selectedItem.ITEM_code,
      description: selectedItem.ITEM_description,
      warranty: invoiceData.warranty,
      rate: parseFloat(invoiceData.rate) || 0,
      qty: parseInt(invoiceData.qty) || 0,
      inlineDiscount: 0, // new field
      total: 0 // will calculate below
    };
    newItem.total = (newItem.rate * newItem.qty) - newItem.inlineDiscount;

    setItems(prev => [...prev, newItem]);


    // Reset fields
    setInvoiceData(prev => ({
      ...prev,
      itemCode: '',
      description: '',
      rate: '0.00',
      qty: '1',
      warranty: '',
      serialNumbers: ''
    }));
  };


  const [items, setItems] = useState([]);

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = () => {
    const commission = parseFloat(invoiceData.commission) || 0;
    const invoiceLevelDiscount = parseFloat(invoiceData.discount) || 0;

    const subtotalWithInlineDiscount = items.reduce((sum, item) => sum + item.total, 0);
    const totalWithoutInlineDiscount = items
      .filter(item => !item.inlineDiscount || item.inlineDiscount === 0)
      .reduce((sum, item) => sum + (item.rate * item.qty), 0);

    const grandTotal = subtotalWithInlineDiscount + commission - invoiceLevelDiscount;

    return grandTotal;
  };


  const handleSave = async () => {


    const payload = {
      INVOICE_H_token: invoiceData.tokenNumber,
      INVOICE_H_number: invoiceData.invoiceNumber,
      INVOICE_H_code: invoiceData.invoiceNumber,
      INVOICE_H_datetime: new Date().toISOString(),
      INVOICE_H_location: invoiceData.location,
      INVOICE_H_customer: invoiceData.customer,
      INVOICE_H_payment_term: invoiceData.paymentMethod,
      INVOICE_H_total_discount: parseFloat(invoiceData.discount),
      INVOICE_H_total_discount_value: parseFloat(invoiceData.discount),
      INVOICE_H_total_discount_type: invoiceData.discountType,
      INVOICE_H_commision: parseFloat(invoiceData.commission),
      INVOICE_H_grand_total: calculateTotal(),
      INVOICE_H_user: "cashier1",
      INVOICE_H_type: "Cash",
      INVOICE_H_remakrs: "",
      details: items.map(item => ({
        INVOICE_D_item: item.id,
        INVOICE_D_qty: item.qty,
        INVOICE_D_rate: item.rate,
        INVOICE_D_discount_value: item.inlineDiscount || 0,
        INVOICE_D_discount_total: item.inlineDiscount || 0,
        INVOICE_D_discount_type: "Value",
        INVOICE_D_warranty_month: item.warranty === "1year" ? 12 : 24,
        INVOICE_D_vat: 0,
        INVOICE_D_vat_rate: 0,
        INVOICE_D_sales_rep: "cashier1",
        INVOICE_D_qty_balance: item.qty
      }))
    };


    try {
      console.log("🧾 Items being saved:", items);

      const res = await axios.post("/invoices/", payload);
      alert("Invoice saved successfully!");
      console.log(res.data);
    } catch (error) {
      console.log("🚨 Payload sent to backend:", payload);

      if (error.response?.data) {
        console.error("🛑 Validation Errors:", error.response.data);
        alert("Validation error: " + JSON.stringify(error.response.data.details, null, 2));
      } else {
        console.error("Save failed", error);
        alert("Save failed");
      }
    }

  };


  const handlePrint = async () => {
    const invoiceNumber = invoiceData.invoiceNumber;
    if (!invoiceNumber) {
      alert("Please save the invoice before printing.");
      return;
    }

    try {
      const res = await axios.get(`/invoice-by-number/${invoiceNumber}/print/?pdf=1`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      window.open(url, '_blank');
    } catch (error) {
      console.error("❌ Error printing invoice:", error);
      alert("Failed to generate invoice PDF.");
    }
  };



  const [customers, setCustomers] = useState([]);
  const [itemList, setItemList] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get("/customers/");
        setCustomers(res.data);

        // Auto-select if newCustomerId exists
        const newId = localStorage.getItem("newCustomerId");
        if (newId) {
          handleInputChange("customer", newId);
          localStorage.removeItem("newCustomerId");
        }
      } catch (err) {
        console.error("Failed to fetch customers", err);
      }
    };

    fetchCustomers();
    window.addEventListener("focus", fetchCustomers);
    return () => window.removeEventListener("focus", fetchCustomers);
  }, []);



  const handleCustomerAdded = (newCustomer) => {
    setCustomers(prev => [...prev, newCustomer]);
    handleInputChange('customer', newCustomer.id);
  };
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get("/item/");
        console.log("📝 Items fetched from API:", res.data);
        setItemList(res.data);
      } catch (err) {
        console.error("Failed to fetch items", err);
      }
    };

    fetchItems();
  }, []);

  // -------------shortcut functions-----------
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S to save
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault(); // prevent browser default save
        handleSave();
      }

      // F2 to focus item code dropdown
      if (e.key === 'F2') {
        e.preventDefault();
        const itemSelect = document.querySelector("select[name='itemCode']");
        if (itemSelect) itemSelect.focus();
      }

      // ESC to clear form or go back
      if (e.key === 'Escape') {
        e.preventDefault();
        setInvoiceData({
          tokenNumber: '',
          invoiceNumber: '',
          location: '',
          customer: '',
          paymentMethod: '',
          barcode: '',
          itemCode: '',
          description: '',
          sellingPrice: '0.00',
          rate: '0.00',
          qty: '1',
          warranty: '',
          serialNumbers: '',
          commission: '0.00',
          discount: '0.00',
          discountType: 'Value'
        });
        setItems([]);
        // or clear form
      }

      // F5 → Let browser handle it unless you want a custom refresh
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const calculateNetValue = () => {
    const discountPercentage = parseFloat(invoiceData.discount) || 0;

    const inlineDiscounted = items.filter(item => item.inlineDiscount && item.inlineDiscount > 0);
    const nonInlineDiscounted = items.filter(item => !item.inlineDiscount || item.inlineDiscount === 0);

    const inlineTotal = inlineDiscounted.reduce((sum, item) => sum + item.total, 0);
    const nonInlineTotal = nonInlineDiscounted.reduce((sum, item) => sum + (item.rate * item.qty), 0);

    const discountAmount = (discountPercentage / 100) * nonInlineTotal;
    const discountedTotal = nonInlineTotal - discountAmount;

    return inlineTotal + discountedTotal;
  };

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <h2>Invoice - Cashier</h2>
      </div>

      <div className="invoice-content">
        {/* Invoice Details Section */}
        <div className="invoice-details">
          <h3>Invoice Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Quotation Number</label>
              <input
                type="number"
                value={invoiceData.tokenNumber}
                onChange={(e) => handleInputChange('tokenNumber', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Invoice Number</label>
              <input
                type="text"
                value={invoiceData.invoiceNumber}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Location</label>
              <select
                value={invoiceData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              >
                <option value="">Select Location</option>
                <option value="location1">Location 1</option>
                <option value="location2">Location 2</option>
              </select>
            </div>
            <div className="form-group customer-group">
              <label>Customer</label>
              <div className="customer-input">
                <select
                  value={invoiceData.customer}
                  onChange={(e) => handleInputChange('customer', e.target.value)}
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.CUSTOMER_name}
                    </option>
                  ))}
                </select>

                <button
                  className="btn-icon"
                  onClick={() => window.open('/CustomerMaster', '_blank')}
                >
                  ...
                </button>

                <button className="btn-icon">+</button>
              </div>

            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Payment Method</label>
              <select
                value={invoiceData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              >
                <option value="">Select Payment Method</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Item Entry Section */}
        <div className="item-entry">
          <div className="form-row">
            <div className="form-group">
              <label>Barcode</label>
              <input
                type="text"
                value={invoiceData.barcode}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
              />
            </div>
          </div>

          <div className="form-row item-row">
            <div className="form-group">
              <label>ITEM Code</label>
              <div className="input-with-button">
                <select
                  value={invoiceData.itemCode}
                  onChange={(e) => handleInputChange('itemCode', e.target.value)}
                >
                  <option value="">Select Item</option>
                  {itemList.map(item => (
                    <option key={item.id} value={item.ITEM_code}>
                      {item.ITEM_code} - {item.ITEM_description}
                    </option>
                  ))}

                </select>
              </div>
            </div>
            <div className="description">
              <label>Description</label>
              <textarea
                rows="2"
                value={invoiceData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>


            <div className="form-group">
              <label>Selling Price</label>
              <div className="price-input">
                <span>Rs</span>
                <input
                  type="number"
                  step="0.01"
                  value={invoiceData.sellingPrice}
                  onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="form-row item-details-row">
            <div className="form-group">
              <label>Rate</label>
              <div className="price-input">
                <span>Rs</span>
                <input
                  type="number"
                  step="0.01"
                  value={invoiceData.rate}
                  onChange={(e) => handleInputChange('rate', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Qty</label>
              <input
                type="number"
                value={invoiceData.qty}
                onChange={(e) => handleInputChange('qty', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Warranty</label>
              <select
                value={invoiceData.warranty}
                onChange={(e) => handleInputChange('warranty', e.target.value)}
              >
                <option value="">Select Warranty</option>
                <option value="1year">1 Year</option>
                <option value="2years">2 Years</option>
              </select>
            </div>
            <div className="form-group">
              <label>Serial Numbers</label>
              <div className="serial-input">
                <input
                  type="text"
                  value={invoiceData.serialNumbers}
                  onChange={(e) => handleInputChange('serialNumbers', e.target.value)}
                />
                <button className="btn-add" onClick={addItem}>Add</button>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="items-table">
          <h3>Goods</h3>
          <table>
            <thead>
              <tr>
                <th>ITEM Code</th>
                <th>ITEM Description</th>
                <th>Warranty</th>
                <th>Rate</th>
                <th>Qty</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.itemCode}</td>
                  <td>{item.description}</td>
                  <td>{item.warranty}</td>
                  <td>Rs {item.rate.toFixed(2)}</td>
                  <td>{item.qty}</td>
                  <td>
                    <input
                      type="number"
                      value={item.inlineDiscount}
                      onChange={(e) => {
                        const updatedItems = [...items];
                        updatedItems[index].inlineDiscount = parseFloat(e.target.value) || 0;
                        updatedItems[index].total = (updatedItems[index].rate * updatedItems[index].qty) - updatedItems[index].inlineDiscount;
                        setItems(updatedItems);
                      }}
                      style={{ width: "80px" }}
                    />
                  </td>
                  <td>Rs {item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        {/* Totals Section - redesigned */}
        <div style={{
          marginLeft: "auto", // Pushes container to right
          width: "30%",
          display: "flex",
          justifyContent: "flex-end", // Aligns table to right within container
          paddingLeft: "10px", // Fixed typo (camelCase)
          marginTop: "20px"
        }}>
          <table className="totals-table" style={{ width: "100%" }}>
            <tbody>
              {/* Table rows remain unchanged */}
              <tr>
                <td style={{ textAlign: "right", fontWeight: "bold", whiteSpace: "nowrap", width: "1%" }}>
                  Grand Total:
                </td>
                <td style={{ textAlign: "right" }}>
                  Rs {calculateSubtotal().toFixed(2)}
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "right", fontWeight: "bold", whiteSpace: "nowrap", width: "1%" }}>
                  Discount (%):
                </td>
                <td style={{ textAlign: "right" }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={invoiceData.discount}
                    onChange={(e) => handleInputChange("discount", e.target.value)}
                    style={{ width: "60px", textAlign: "right" }}
                  /> %
                </td>
              </tr>
              <tr>
                <td style={{ textAlign: "right", fontWeight: "bold", whiteSpace: "nowrap", width: "1%" }}>
                  Net Value:
                </td>
                <td style={{ textAlign: "right" }}>
                  Rs {calculateNetValue().toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-save" onClick={handleSave}>Save</button>
          <button className="btn-close" onClick={() => window.location.reload()}>Close</button>
          <button className="btn-print" onClick={handlePrint}>Print</button>
        </div>


        {/* Keyboard Shortcuts */}
        <div className="keyboard-shortcuts">
          <span>Save = Ctrl+S</span>
          <span>Item Search = F2</span>
          <span>Refresh = F5</span>
          <span>Exit = Esc</span>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCashier;