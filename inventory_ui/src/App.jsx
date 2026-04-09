import React from 'react';
import { CssBaseline, Container, ThemeProvider, createTheme } from '@mui/material';
import { ProductProvider } from './contexts/ProductContext';
import ProductList from './components/products/ProductList';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ProductProvider>
        <CssBaseline />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <ProductList />
        </Container>
      </ProductProvider>
    </ThemeProvider>
  );
}

export default App;
