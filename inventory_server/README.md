# MongoDB CRUD API with Node.js and Express

A simple RESTful API for performing CRUD operations on a MongoDB database using Node.js, Express, and Mongoose.

## Features

- Create, Read, Update, and Delete products
- Input validation using express-validator
- Error handling middleware
- Environment variable configuration
- CORS enabled

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- MongoDB Atlas account or local MongoDB instance

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your MongoDB connection string:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   Or for production:
   ```bash
   npm start
   ```

## API Endpoints

### Create a Product
- **POST** `/api/products`
  - Request body should be a JSON object with product details
  - Required fields: `name`, `price`
  - Example:
    ```json
    {
      "name": "Laptop",
      "price": 999.99,
      "description": "High-performance laptop",
      "quantity": 10
    }
    ```

### Get All Products
- **GET** `/api/products`
  - Returns an array of all products

### Get a Single Product
- **GET** `/api/products/:id`
  - Returns a single product by ID

### Update a Product
- **PUT** `/api/products/:id`
  - Updates a product by ID
  - Request body should contain the fields to update
  - Example:
    ```json
    {
      "price": 1099.99,
      "quantity": 8
    }
    ```

### Delete a Product
- **DELETE** `/api/products/:id`
  - Deletes a product by ID

## Error Handling

All endpoints return appropriate HTTP status codes and error messages in the following format:
```json
{
  "message": "Error message"
}
```

## Validation

The API includes request validation for:
- Required fields
- Data types
- Minimum/maximum values
- String lengths
