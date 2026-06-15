import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8080';

export default function Payments() {
  const [payments, setPayments] = useState([]);

  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${GATEWAY_URL}/payments`);
      setPayments(res.data);
    } catch (err) {
      console.error('Failed to fetch payments', err);
    }
  };

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleProcess = async (orderId, success) => {
    try {
      await axios.post(`${GATEWAY_URL}/payments/${orderId}/process?success=${success}`);
      fetchPayments();
    } catch (err) {
      console.error('Failed to process payment', err);
      alert('Error processing payment');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Manual Payment Gateway</h1>
        <button onClick={fetchPayments}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="grid">
        {payments.length === 0 && <p>No payments available.</p>}
        {payments.map(p => (
          <div key={p.paymentId} className="glass card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <strong>Payment for Order:</strong>
              <span className={`badge ${p.status?.toLowerCase()}`}>{p.status}</span>
            </div>
            
            <div className="card-text">
              <p><strong>Order ID:</strong> {p.orderId}</p>
              {p.failureReason && <p style={{ color: 'var(--danger)', marginTop: '0.5rem' }}>Reason: {p.failureReason}</p>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <span className="price">{p.currency} {p.amount}</span>
              
              {p.status === 'PENDING' ? (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="danger" onClick={() => handleProcess(p.orderId, false)} style={{ padding: '0.5rem', borderRadius: '50%' }}>
                    <XCircle size={20} />
                  </button>
                  <button className="success" onClick={() => handleProcess(p.orderId, true)} style={{ padding: '0.5rem', borderRadius: '50%' }}>
                    <CheckCircle size={20} />
                  </button>
                </div>
              ) : (
                <span style={{ opacity: 0.5, fontSize: '0.875rem' }}>
                  {p.status === 'COMPLETED' ? 'Processed' : 'Declined'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
