import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StockControl from './pages/stockControl';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<StockControl />} />
          <Route path="/stockcontrol" element={<StockControl />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
