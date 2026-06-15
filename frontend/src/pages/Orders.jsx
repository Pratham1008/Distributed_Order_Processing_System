import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Package } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8080';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${GATEWAY_URL}/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${GATEWAY_URL}/products`);
      const prodMap = {};
      res.data.forEach(p => prodMap[p.productId] = p.productName);
      setProducts(prodMap);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
      fetchProducts();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Order Tracking</h1>
        <button onClick={fetchOrders}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="grid">
        {orders.length === 0 && <p>No orders placed yet.</p>}
        {orders.map(o => (
          <div key={o.orderId} className="glass card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={20} /> <strong>Order</strong>
              </div>
              <span className={`badge ${o.orderStatus?.toLowerCase()}`}>{o.orderStatus}</span>
            </div>
            <div className="card-text">
              <p><strong>Order ID:</strong> {o.orderId}</p>
              <p><strong>Product:</strong> {products[o.productId] || o.productId}</p>
              <p><strong>Quantity:</strong> {o.quantity}</p>
            </div>
            <div className="price" style={{ alignSelf: 'flex-end' }}>
              ₹{o.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
