import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  Typography,
  CircularProgress
} from '@mui/material';
import { createProduct, updateProduct } from '../../api/productApi';
import { useProducts } from '../../contexts/ProductContext';

export default function ProductForm({ product, onClose }) {
  const { refreshProducts } = useProducts();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    quantity: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        quantity: product.quantity?.toString() || '',
        price: product.price?.toString() || ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.sku.trim()) return 'SKU is required';
    if (isNaN(formData.quantity) || formData.quantity < 0) return 'Quantity must be a positive number';
    if (isNaN(formData.price) || formData.price <= 0) return 'Price must be greater than 0';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const productData = {
        ...formData,
        quantity: Number(formData.quantity),
        price: Number(formData.price)
      };

      if (product) {
        await updateProduct(product._id, productData);
      } else {
        await createProduct(productData);
      }
      
      refreshProducts();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3} sx={{ mt: 1, mb: 2 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            required
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            required
            margin="normal"
            inputProps={{ min: 0 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
            margin="normal"
            InputProps={{
              startAdornment: <span style={{ marginRight: 8 }}>$</span>,
              inputProps: { min: 0, step: 0.01 }
            }}
          />
        </Grid>
        {error && (
          <Grid item xs={12}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Grid>
        )}
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {product ? 'Update' : 'Create'} Product
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}
