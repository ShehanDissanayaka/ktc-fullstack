// src/components/ItemMaster/ItemMaster.js
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../api/axios";   // ← same base instance you use elsewhere
import "./itemMaster.css";

const blank = {
    itemType: "", // warranty | utensil | spare
    code: "",
    group: "",
    type: "",
    category: "",
    modelNumber: "",
    name: "",
    spec: "",
    description: "",
    uom: "",
    warranty: "",
    reorderLevel: 0,
    reorderQty: 0,
    minLevel: 0,
    maxLevel: 0,
    purchasingPrice: 0,
    sellingPrice: 0,
    barcode: "",
    printQty: 1,
    active: true,
    invoicable: false,
    barcodeAvailable: false,
    serialNumber: "",
    brandName: "",
    originCountry: "",
    certificate: "",
    notes: ["", "", "", "", ""], // special note 01–05
    power: "",
    voltage: "",
    tempRange: "",
    housingMaterial: "",
    dimension: "",
    netWeight: "",

    image: null, // for warranty items
};


const API = "/item/";

const toBackend = (f) => ({
    ITEM_code: f.code,
    ITEM_type: f.itemType, // warranty | utensil | spare
    ITEM_group: f.group,
    ITEM_type_ref: f.type,
    ITEM_category: f.category,
    ITEM_description: f.description,
    ITEM_uom: f.uom,
    ITEM_warranty: f.warranty,
    ITEM_reorder_level: f.reorderLevel,
    ITEM_reorder_qty: f.reorderQty,
    ITEM_min_level: f.minLevel,
    ITEM_max_level: f.maxLevel,
    ITEM_purchase_price: f.purchasingPrice,
    ITEM_normal_selling_price: f.sellingPrice,
    ITEM_has_barcode: f.barcodeAvailable,
    ITEM_barcode: f.barcode,
    ITEM_invoicable: f.invoicable,
    ITEM_active: f.active,

    // Warranty-specific fields
    ITEM_serial_number: f.serialNumber,
    ITEM_model_number: f.modelNumber,
    ITEM_spec: f.spec,
    ITEM_brand_name: f.brandName,
    ITEM_origin_country: f.originCountry,
    ITEM_certificate: f.certificate,
    ITEM_power: f.power,
    ITEM_voltage: f.voltage,
    ITEM_temp_range: f.tempRange,
    ITEM_housing_material: f.housingMaterial,
    ITEM_dimension: f.dimension,
    ITEM_net_weight: f.netWeight,


    // Utensil fields
    ITEM_name: f.name,
    ITEM_dimension: f.dimension,
    ITEM_net_weight: f.netWeight,

    // Notes (array)
    ITEM_notes: f.notes, // ["note1", "note2", ...]
});


const fromBackend = (it) => ({
    id: it.id,
    code: it.ITEM_code,
    description: it.ITEM_description,
});



const ItemMaster = () => {
    const [form, setForm] = useState(blank);
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState("");
    const codeInputRef = useRef(null);
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState(null);
    const [showWarrantyModal, setShowWarrantyModal] = useState(false);


    /* ---------- fetch list ---------- */
    const fetchItems = useCallback(async () => {
        try {
            const res = await axios.get(API);
            setItems(res.data.map(fromBackend));
        } catch (err) {
            console.error(err);
            alert("Error fetching items");
        }
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    /* ------------from select in the groupmaster-------- */
    const [groupOptions, setGroupOptions] = useState([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await axios.get("/groupMasters/");
                setGroupOptions(response.data); // response should be an array of { GROUP_code, GROUP_description }
            } catch (error) {
                console.error("Error fetching group codes:", error);
                alert("Failed to fetch group codes");
            }
        };

        fetchGroups();
    }, []);

    /* -------from select in the typeMaster------ */

    const [typeOptions, setTypeOptions] = useState([]);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const res = await axios.get("/typeMasters/");
                setTypeOptions(res.data);              // [{ TYPE_code, TYPE_description, … }]
            } catch (err) {
                console.error("Error loading types:", err);
                alert("Failed to load types");
            }
        };

        fetchTypes();
    }, []);

    /* -------from select in the Categorymaster------ */

    const [categoryOptions, setCategoryOptions] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get("/categoryMasters/");
                setCategoryOptions(res.data); // [{ CATEGORY_code, CATEGORY_description, ... }]
            } catch (err) {
                console.error("Error loading categories:", err);
                alert("Failed to load categories");
            }
        };

        fetchCategories();
    }, []);



    /* ---------- handlers ---------- */
    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    };

    const resetForm = () => setForm(blank);

    const saveItem = useCallback(async () => {
        console.log("Saving item...", form);

        try {
            const data = new FormData();

            // Add normal fields
            data.append("ITEM_code", form.code);
            data.append("ITEM_type", form.itemType);
            data.append("ITEM_group", form.group);
            data.append("ITEM_type_ref", form.type);
            data.append("ITEM_category", form.category);
            data.append("ITEM_description", form.description);
            data.append("ITEM_uom", form.uom);
            data.append("ITEM_warranty", form.warranty);
            data.append("ITEM_reorder_level", form.reorderLevel);
            data.append("ITEM_reorder_qty", form.reorderQty);
            data.append("ITEM_min_level", form.minLevel);
            data.append("ITEM_max_level", form.maxLevel);
            data.append("ITEM_purchase_price", form.purchasingPrice);
            data.append("ITEM_normal_selling_price", form.sellingPrice);
            data.append("ITEM_has_barcode", form.barcodeAvailable);
            data.append("ITEM_barcode", form.barcode);
            data.append("ITEM_invoicable", form.invoicable);
            data.append("ITEM_active", form.active);
            data.append("ITEM_serial_number", form.serialNumber);
            data.append("ITEM_model_number", form.modelNumber);
            data.append("ITEM_spec", form.spec);
            data.append("ITEM_brand_name", form.brandName);
            data.append("ITEM_origin_country", form.originCountry);
            data.append("ITEM_certificate", form.certificate);
            data.append("ITEM_name", form.name);
            data.append("power", form.power);
            data.append("voltage", form.voltage);
            data.append("temp_range", form.tempRange);
            data.append("housing_material", form.housingMaterial);
            data.append("ITEM_dimension", form.dimension);
            data.append("ITEM_net_weight", form.netWeight);

            // ✅ Append ITEM_notes as a JSON array
            data.append("ITEM_notes", JSON.stringify(form.notes));


            // File upload
            if (imageFile) {
                data.append("image", imageFile);
            }

            const res = form.id
                ? await axios.put(`${API}${form.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    transformRequest: (formData) => formData
                })
                : await axios.post(API, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    transformRequest: (formData) => formData
                });


            if (res.status === 201) {
                alert("✅ Item saved!");
                resetForm();
                fetchItems();
            }
        } catch (err) {
            console.error("❌ Axios Error:", err);
            if (err.response?.data) {
                let msg = "Error:\n";
                for (let key in err.response.data) {
                    const value = err.response.data[key];
                    if (Array.isArray(value)) {
                        msg += `${key}: ${value.join(', ')}\n`;
                    } else {
                        msg += `${key}: ${value}\n`;
                    }
                }
                alert(msg);
            } else {
                alert("Unknown error saving item");
            }
        }
    }, [form, fetchItems, imageFile]);





    const removeItem = async () => {
        if (!form.id) return alert("Select an item to delete.");
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        try {
            await axios.delete(`${API}${form.id}/`);
            alert("Item deleted.");
            resetForm();
            fetchItems();
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete item.");
        }
    };


    const printBarcode = () => {
        if (!form.barcodeAvailable) return alert("Barcode not available.");
        alert(`Printing ${form.barcode} – Qty ${form.printQty}`);
    };
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm((prev) => ({ ...prev, image: file }));
        }
    };
    /* ---------- shortcuts ---------- */
    useEffect(() => {
        const onKey = (e) => {
            if (e.ctrlKey && e.key.toLowerCase() === "s") { e.preventDefault(); saveItem(); }
            else if (e.ctrlKey && e.key.toLowerCase() === "n") { e.preventDefault(); resetForm(); }
            else if (e.key === "F2") { e.preventDefault(); codeInputRef.current?.focus(); }
            else if (e.key === "Escape") { e.preventDefault(); navigate("/stockcontrol"); }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [saveItem, navigate]);

    /* ---------- search ---------- */
    const [searchCode, setSearchCode] = useState("");
    const [searchDesc, setSearchDesc] = useState("");

    // …and update `filtered`:
    const filtered = useMemo(
        () =>
            items.filter(
                i =>
                    i.code.toLowerCase().includes(searchCode.toLowerCase()) &&
                    i.description?.toLowerCase().includes(searchDesc.toLowerCase())
            ),
        [items, searchCode, searchDesc]
    );

    const handleDownloadPDF = async () => {
        try {
            const res = await axios.get("/price-list/pdf/", {
                responseType: "blob",
            });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "PriceList.pdf");
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Failed to download price list PDF:", err);
            alert("Failed to download PDF");
        }
    };

    return (
        <div className="item-master-container">
            <div className="title">Item Master</div>
            {form.id && (
                <div className="editing-mode">
                    Editing item: <strong>{form.code}</strong>
                </div>
            )}

            <div className="form-section">
                <div className="left-column">
                    <div className="row">
                        <label>Code</label>
                        <input
                            name="code"
                            value={form.code}
                            onChange={onChange}
                            ref={codeInputRef}
                        />
                    </div>

                    <div className="row">

                        <label>Group</label>
                        <select name="group" value={form.group} onChange={onChange}>
                            <option value="">Select</option>
                            {groupOptions.map((g) => (
                                <option key={g.GROUP_code} value={g.GROUP_code}>
                                    {g.GROUP_code} - {g.GROUP_description}
                                </option>
                            ))}
                        </select>


                        <label>Type</label>
                        <select name="type" value={form.type} onChange={onChange}>
                            <option value="">Select</option>
                            {typeOptions.map(t => (
                                <option key={t.TYPE_code} value={t.TYPE_code}>
                                    {t.TYPE_code} - {t.TYPE_description}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="row">
                        <label>Description</label>
                        <textarea
                            name="description"
                            rows="3"
                            value={form.description}
                            onChange={onChange}
                        />
                    </div>

                    <div className="row">
                        <label>Re-order Level</label>
                        <input
                            type="number"
                            name="reorderLevel"
                            value={form.reorderLevel}
                            onChange={onChange}
                        />
                        <label>Re-order QTY</label>
                        <input
                            type="number"
                            name="reorderQty"
                            value={form.reorderQty}
                            onChange={onChange}
                        />
                    </div>

                    <div className="row">
                        <label>Min Level</label>
                        <input
                            type="number"
                            name="minLevel"
                            value={form.minLevel}
                            onChange={onChange}
                        />
                        <label>Max Level</label>
                        <input
                            type="number"
                            name="maxLevel"
                            value={form.maxLevel}
                            onChange={onChange}
                        />
                    </div>
                </div>

                <div className="status-column">
                    <div className="checkbox-section">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="active"
                                checked={form.active}
                                onChange={onChange}
                            />
                            Active
                            <input
                                type="checkbox"
                                name="invoicable"
                                checked={form.invoicable}
                                onChange={onChange}
                            />
                            Invoicable
                        </label>
                    </div>
                    <br />

                    <div className="inline-field">
                        <label>Category</label>
                        <select name="category" value={form.category} onChange={onChange}>
                            <option value="">Select</option>
                            {categoryOptions.map((cat) => (
                                <option key={cat.CATEGORY_code} value={cat.CATEGORY_code}>
                                    {cat.CATEGORY_code} - {cat.CATEGORY_description}
                                </option>
                            ))}
                        </select>

                    </div>

                    <div className="inline-field">
                        <label>UOM</label>
                        <select name="uom" value={form.uom} onChange={onChange}>
                            <option value="">Select</option>
                            <option value="1">Liters(L)</option>
                            <option value="2">Milliliters(mL)</option>
                            <option value="3">Kilograms(kg)</option>
                            <option value="4">Grams(g)</option>
                            <option value="5">Millimeters(m)</option>
                            <option value="6">meters(m)</option>
                            <option value="7">Inches(in)</option>
                            <option value="8">feet(ft)</option>
                            <option value="9">yards(yd)</option>
                            <option value="10">Units</option>
                        </select>
                    </div>

                    <div className="inline-field">
                        <label>Warranty</label>
                        <select name="warranty" value={form.warranty} onChange={onChange}>
                            <option value="">Select</option>
                            <option value="1">Yes</option>
                            <option value="2">No</option>
                        </select>
                    </div>

                    <div className="row">
                        <label>Item Code</label>
                        <input
                            name="code"
                            value={form.code}
                            onChange={onChange}
                            ref={codeInputRef}
                            disabled={form.itemType === "warranty"} // system-generated
                        />
                    </div>

                    <div className="row">
                        <label>Item Type</label>
                        <select
                            value={form.itemType}
                            onChange={(e) => {
                                const selected = e.target.value;
                                setForm((prev) => ({ ...prev, itemType: selected }));

                                if (selected === "") {
                                    setShowWarrantyModal(false);  // Don't open popup when selecting default
                                } else {
                                    setShowWarrantyModal(true);   // Always open popup for any valid selection
                                }

                                if (selected !== "warranty") {
                                    setForm((prev) => ({ ...prev, serialNumber: "" }));
                                }
                            }}
                        >
                            <option value="">-- Select --</option>
                            <option value="warranty">Warranty</option>
                            <option value="non-warranty">Non-Warranty</option>
                            <option value="utensil">Utensil</option>
                            <option value="spare">Spare Part</option>
                        </select>

                    </div>


                </div>
            </div>

            <div className="bottom-section">
                <fieldset className="price-box">
                    <legend>Prices</legend>
                    <div className="row">
                        <label>Purchasing Price</label>
                        <input
                            type="number"
                            name="purchasingPrice"
                            value={form.purchasingPrice}
                            onChange={onChange}
                        />
                    </div>
                    <div className="row">
                        <label>Min Selling Price</label>
                        <input
                            type="number"
                            name="sellingPrice"
                            value={form.sellingPrice}
                            onChange={onChange}
                        />
                    </div>
                </fieldset>

                <fieldset className="barcode-box">
                    <legend>
                        <label>
                            <input
                                type="checkbox"
                                name="barcodeAvailable"
                                checked={form.barcodeAvailable}
                                onChange={onChange}
                            />
                            Barcode Available
                        </label>
                    </legend>

                    <div className="inline-field">
                        <label>Barcode</label>
                        <input
                            name="barcode"
                            value={form.barcode}
                            onChange={onChange}
                        />
                    </div>

                    <div className="inline-field">
                        <label>Print QTY</label>
                        <input
                            type="number"
                            name="printQty"
                            value={form.printQty}
                            onChange={onChange}
                        />
                    </div>

                    <button type="button" onClick={printBarcode}>Print</button>
                </fieldset>
            </div>

            <div className="button-group">
                <button onClick={saveItem}>Save</button>
                <button onClick={resetForm}>New</button>
                <button onClick={removeItem}>Remove</button>
                <button className="btn-download" onClick={handleDownloadPDF}>
                    Download Price List PDF
                </button>

            </div>

            <div className="search-section">
                <h4>Item Search</h4>
                <div className="row">
                    <input
                        placeholder="Code"
                        value={searchCode}
                        onChange={e => setSearchCode(e.target.value)}
                    />
                    <input
                        placeholder="Description"
                        value={searchDesc}
                        onChange={e => setSearchDesc(e.target.value)}
                    />
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Item Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length ? (
                            filtered.map(it => (
                                <tr key={it.id}>
                                    <td>{it.code}</td>
                                    <td>{it.description}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3">No matching items</td>
                            </tr>
                        )}
                    </tbody>

                </table>

            </div>

            <div className="footer-hint">
                Save = Ctrl+S | New = Ctrl+N | Focus Search = F2 | Exit = Esc
            </div>

            {showWarrantyModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Enter Item Details</h2>
                        <div className="space-y-3">

                            <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

                            <input type="text" placeholder="Model Number" value={form.modelNumber} onChange={(e) => setForm({ ...form, modelNumber: e.target.value })} />

                            <input type="text" placeholder="Spec/Capacity" value={form.spec} onChange={(e) => setForm({ ...form, spec: e.target.value })} />

                            <input type="text" placeholder="Power" value={form.power} onChange={(e) => setForm({ ...form, power: e.target.value })} />

                            <input type="text" placeholder="Voltage" value={form.voltage} onChange={(e) => setForm({ ...form, voltage: e.target.value })} />

                            <input type="text" placeholder="Temp. Range" value={form.tempRange} onChange={(e) => setForm({ ...form, tempRange: e.target.value })} />

                            <input type="text" placeholder="Housing Material" value={form.housingMaterial} onChange={(e) => setForm({ ...form, housingMaterial: e.target.value })} />

                            {/* Special Notes */}
                            {[...Array(5)].map((_, i) => (
                                <input key={i} type="text" placeholder={`Special Note 0${i + 1}`}
                                    value={form.notes[i]}
                                    onChange={(e) => {
                                        const newNotes = [...form.notes];
                                        newNotes[i] = e.target.value;
                                        setForm((prev) => ({ ...prev, notes: newNotes }));
                                    }}
                                />
                            ))}

                            <input type="text" placeholder="Dimension" value={form.dimension} onChange={(e) => setForm({ ...form, dimension: e.target.value })} />

                            <input type="text" placeholder="Net Weight" value={form.netWeight} onChange={(e) => setForm({ ...form, netWeight: e.target.value })} />

                            <input type="text" placeholder="Brand Name" value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} />

                            <input type="text" placeholder="Country of Origin" value={form.originCountry} onChange={(e) => setForm({ ...form, originCountry: e.target.value })} />

                            <input type="text" placeholder="Certificate" value={form.certificate} onChange={(e) => setForm({ ...form, certificate: e.target.value })} />

                            {/* Serial Number — only editable for Warranty */}
                            <input
                                type="text"
                                placeholder="Serial Number"
                                value={form.serialNumber}
                                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                                disabled={form.itemType !== "warranty"}
                            />

                            {/* Image Upload — always enabled */}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setImageFile(file);
                                        setForm((prev) => ({ ...prev, image: file.name }));
                                    }
                                }}
                            />

                        </div>

                        <div className="button-group" style={{ marginTop: '20px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowWarrantyModal(false)}>Cancel</button>
                            <button onClick={() => setShowWarrantyModal(false)}>Done</button>
                        </div>
                    </div>
                </div>
            )}



        </div >




    );

    {
        form.itemType === "warranty" && (
            <>
                <div className="row">
                    <label>Model Number</label>
                    <input name="modelNumber" value={form.modelNumber} onChange={onChange} />
                </div>

                <div className="row">
                    <label>Name</label>
                    <input name="name" value={form.name} onChange={onChange} />
                </div>

                <div className="row">
                    <label>Spec / Capacity</label>
                    <input name="spec" value={form.spec} onChange={onChange} />
                </div>

                <div className="row">
                    <label>Serial Number</label>
                    <input name="serialNumber" value={form.serialNumber} onChange={onChange} />
                </div>

                <div className="row">
                    <label>Brand Name</label>
                    <input name="brandName" value={form.brandName} onChange={onChange} />
                </div>

                <div className="row">
                    <label>Country of Origin</label>
                    <input name="originCountry" value={form.originCountry} onChange={onChange} />
                </div>

                <div className="row">
                    <label>Certificate</label>
                    <input name="certificate" value={form.certificate} onChange={onChange} />
                </div>

                <div className="row">
                    <label>Power</label>
                    <input name="power" value={form.power} onChange={onChange} />
                </div>
                <div className="row">
                    <label>Voltage</label>
                    <input name="voltage" value={form.voltage} onChange={onChange} />
                </div>
                <div className="row">
                    <label>Temperature Range</label>
                    <input name="tempRange" value={form.tempRange} onChange={onChange} />
                </div>
                <div className="row">
                    <label>Housing Material</label>
                    <input name="housingMaterial" value={form.housingMaterial} onChange={onChange} />
                </div>
                <div className="row">
                    <label>Dimension</label>
                    <input name="dimension" value={form.dimension} onChange={onChange} />
                </div>
                <div className="row">
                    <label>Net Weight</label>
                    <input name="netWeight" value={form.netWeight} onChange={onChange} />
                </div>

                <div className="row">
                    <label>Upload Image</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>

                {[...Array(5)].map((_, i) => (
                    <div className="row" key={i}>
                        <label>Special Note 0{i + 1}</label>
                        <input
                            name={`notes[${i}]`}
                            value={form.notes[i]}
                            onChange={(e) => {
                                const newNotes = [...form.notes];
                                newNotes[i] = e.target.value;
                                setForm((prev) => ({ ...prev, notes: newNotes }));
                            }}
                        />
                    </div>
                ))}
            </>


        )
    }

    {
        form.itemType === "utensil" && (
            <>
                <div className="row">
                    <label>Model No</label>
                    <input name="modelNumber" value={form.modelNumber} onChange={onChange} />
                </div>

                <div className="row">
                    <label>Spec / Capacity</label>
                    <input name="spec" value={form.spec} onChange={onChange} />
                </div>

                <div className="row">
                    <label>Dimension</label>
                    <input name="dimension" value={form.dimension || ""} onChange={onChange} />
                </div>

                <div className="row">
                    <label>Net Weight</label>
                    <input name="netWeight" value={form.netWeight || ""} onChange={onChange} />
                </div>

                {[...Array(3)].map((_, i) => (
                    <div className="row" key={i}>
                        <label>Special Note 0{i + 1}</label>
                        <input
                            name={`notes[${i}]`}
                            value={form.notes[i]}
                            onChange={(e) => {
                                const newNotes = [...form.notes];
                                newNotes[i] = e.target.value;
                                setForm((prev) => ({ ...prev, notes: newNotes }));
                            }}
                        />
                    </div>
                ))}
            </>
        )
    }

    {
        form.id && (
            <button onClick={async () => {
                const res = await axios.get(`/api/item/${form.id}/pdf/`, { responseType: 'blob' });
                const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                window.open(url, "_blank");
            }}>
                Download Warranty PDF
            </button>
        )
    }





};

export default ItemMaster;
