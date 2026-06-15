import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, ShoppingCart } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8080';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    productName: '', description: '', price: '', sku: '', stock: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${GATEWAY_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('product', new Blob([JSON.stringify({
      productName: formData.productName,
      description: formData.description,
      price: parseFloat(formData.price),
      sku: formData.sku,
      stock: parseInt(formData.stock)
    })], { type: 'application/json' }));
    
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await axios.post(`${GATEWAY_URL}/products`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowAddForm(false);
      setFormData({ productName: '', description: '', price: '', sku: '', stock: '' });
      setImageFile(null);
      fetchProducts();
    } catch (err) {
      console.error('Failed to add product', err);
      alert('Error adding product');
    }
  };

  const handleQuantityChange = (productId, qty) => {
    setQuantities(prev => ({...prev, [productId]: parseInt(qty) || 1}));
  };

  const handleBuy = async (productId) => {
    const quantity = quantities[productId] || 1;
    try {
      await axios.post(`${GATEWAY_URL}/orders`, { productId, quantity });
      alert('Order placed successfully! Check the Orders tab.');
    } catch (err) {
      console.error('Failed to place order', err);
      alert('Failed to place order');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Products Catalog</h1>
        <button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={18} /> {showAddForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showAddForm && (
        <form className="glass card" onSubmit={handleAddProduct} style={{ marginBottom: '2rem' }}>
          <h3>Add New Product</h3>
          <div className="grid">
            <div className="form-group">
              <label>Product Name</label>
              <input required value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} />
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input required value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Product Image</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
          </div>
          <button type="submit" style={{ alignSelf: 'flex-start' }}>Save Product</button>
        </form>
      )}

      <div className="grid">
        {products.map(p => (
          <div key={p.productId} className="glass card">
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.productName} className="card-image" />
            ) : (
              <div className="card-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ opacity: 0.5 }}>No Image</span>
              </div>
            )}
            <div className="card-title">{p.productName}</div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span className={`badge ${p.availableQuantity > 0 ? 'completed' : 'failed'}`}>
                {p.availableQuantity} in stock
              </span>
            </div>
            <div className="card-text">{p.description}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="price">₹{p.price}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  min="1" 
                  style={{ width: '60px', padding: '0.5rem' }} 
                  value={quantities[p.productId] || 1} 
                  onChange={(e) => handleQuantityChange(p.productId, e.target.value)}
                />
                <button onClick={() => handleBuy(p.productId)}>
                  <ShoppingCart size={18} /> Buy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
