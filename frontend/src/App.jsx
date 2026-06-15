import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import { ShoppingBag, FileText, CreditCard } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="glass">
          <h2>DOPS Dashboard</h2>
          <nav>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              <ShoppingBag size={18} /> Products
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => isActive ? 'active' : ''}>
              <FileText size={18} /> Orders
            </NavLink>
            <NavLink to="/payments" className={({ isActive }) => isActive ? 'active' : ''}>
              <CreditCard size={18} /> Payments
            </NavLink>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/payments" element={<Payments />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
