import React, { useState } from 'react';
import './stockControl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSun, FaMoon } from 'react-icons/fa';
import Dashboard from '../components/Dashboard/Dashboard'; // ✅ New dashboard import
import GroupMaster from '../components/Group Master/groupMaster';
import TypeMaster from '../components/Type Master/typeMaster';
import CategoryMaster from '../components/Category Master/categoryMaster';
import ItemMaster from '../components/Item Master/itemMaster';
import QuotationOverview from '../components/QuotationOverview/QuotationOverview';
import CustomerMaster from '../components/Customer Master/CustomerMaster';
import InvoiceCashier from '../components/Invoice/InvoiceCashier';

const StockControl = () => {
  // ✅ Show dashboard first when loading
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [darkMode, setDarkMode] = useState(true);

  const renderContent = () => {
    const content = (() => {
      switch (activeMenu) {
        case 'Dashboard': return <Dashboard />;
        case 'Group Master': return <GroupMaster />;
        case 'Type Master': return <TypeMaster />;
        case 'Category Master': return <CategoryMaster />;
        case 'Customer Master': return <CustomerMaster />;
        case 'Item Master': return <ItemMaster />;
        case 'Quotation': return <QuotationOverview />;
        case 'Invoice': return <InvoiceCashier />;
        default: return <Dashboard />; // Fallback to dashboard
      }
    })();

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMenu}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className={`stock-control ${darkMode ? 'dark' : 'light'}`}>
      {/* Header */}
      <header className="header">
        <h1>Stock Control</h1>
        <div className="theme-toggle">
          <FaSun className={`icon ${!darkMode ? 'active' : ''}`} />
          <label className="switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span className="slider round"></span>
          </label>
          <FaMoon className={`icon ${darkMode ? 'active' : ''}`} />
        </div>
      </header>

      {/* Main Layout */}
      <div className="main-container">
        {/* Side Menu */}
        <div className="side-menu">
          <div className="menu-section">
            <h3>Master Files</h3>
            <ul>
              {[
                'Dashboard',
                'Group Master',
                'Type Master',
                'Category Master',
                'Customer Master',
                'Item Master',
                'Quotation',
                'Invoice'
              ].map((item) => (
                <li
                  key={item}
                  className={activeMenu === item ? 'active' : ''}
                  onClick={() => setActiveMenu(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Content Area */}
        <div className="content-area">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StockControl;
