import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProducts, deleteProduct as deleteProductApi } from '../api/productApi';

const ProductContext = createContext();

export const useProducts = () => {
  return useContext(ProductContext);
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeProduct = async (id) => {
    try {
      await deleteProductApi(id);
      setProducts(products.filter(product => product._id !== id));
    } catch (err) {
      setError('Failed to delete product');
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const value = {
    products,
    loading,
    error,
    refreshProducts: fetchProducts,
    deleteProduct: removeProduct,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
