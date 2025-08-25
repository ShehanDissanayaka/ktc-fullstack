import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./Dashboard.css";
Modal.setAppElement("#root");

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch("/dashboard/")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Dashboard fetch error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data available.</p>;

  const { kpis, salesByDay, topItems, itemTypeDistribution } = data;

  // Format pie data
  const pieData = [
    { name: "Warranty", value: itemTypeDistribution.warranty },
    { name: "Non-Warranty", value: itemTypeDistribution["non_warranty"] },
    { name: "Utensil", value: itemTypeDistribution.utensil },
    { name: "Spare Parts", value: itemTypeDistribution.spare }, // ✅ fixed key
  ];

  const COLORS = ["#4CAF50", "#FF9800", "#2196F3", "#9C27B0"];

  return (
    <div className="dashboard">
      <h1>📊 Business Dashboard</h1>

      {/* KPI Section */}
      <div className="kpi-grid">
        <KpiCard
          title="Today’s Revenue"
          value={`LKR ${kpis.todayRevenue.toLocaleString()}`}
        />
        <KpiCard title="Invoices Today" value={kpis.invoicesToday} />
        {/* 👉 Clickable KPI */}
        <KpiCard
          title="Items Sold Today"
          value={kpis.itemsSoldToday}
          onClick={() => {
            console.log("📊 KPI clicked"); // debug
            setModalOpen(true);
          }}
        />

        <KpiCard
          title="Avg Order Value"
          value={`LKR ${kpis.avgOrderValueToday.toFixed(2)}`}
        />
        <KpiCard
          title="MTD Revenue"
          value={`LKR ${kpis.mtdRevenue.toLocaleString()}`}
        />
        <KpiCard title="Total Items" value={kpis.itemsCount} />
        <KpiCard title="Total Invoices" value={kpis.invoicesCount} />
      </div>

      {/* Modal with Pie Chart */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="modal"
        overlayClassName="overlay"
        ariaHideApp={false}
      >
        <h2>🛒 Items Sold Today Breakdown</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#2b2b3c", color: "#fff" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <button onClick={() => setModalOpen(false)}>Close</button>
      </Modal>

      {/* Sales Trends */}
      <div className="chart-container">
        <h2>📈 Sales Trend (Last 14 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesByDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Items */}
      <div className="chart-container">
        <h2>🏆 Top Selling Items (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topItems}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="qty" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, onClick }) => (
  <div
    className="kpi-card"
    onClick={onClick}
    style={{ cursor: onClick ? "pointer" : "default" }}
  >
    <h4>{title}</h4>
    <p>{value}</p>
  </div>
);

export default Dashboard;
