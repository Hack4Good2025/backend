# Resident API Documentation

## Overview
This section documents the endpoints available for managing residents within the application. Each endpoint includes details about the HTTP method, path, input parameters, and expected responses.

## Endpoints

### 1. Create a New Resident
- **Method**: `POST`
- **Path**: `/api/residents/create`
- **Description**: Creates a new resident in the system.
- **Input Parameters**:
  - `name` (string, required): The name of the resident.
  - `password` (string, required): The password for the resident account.
  - `image` (file, optional): An optional image file for the resident.
- **Response**:
  - `201 Created`
    ```json
    {
      "message": "Resident created successfully",
      "resident": {
        "userId": "string",
        "name": "string",
        "voucherBalance": 100,
        "imageUrl": "string",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      }
    }
    ```
  - **Status**: `500 Internal Server Error`: Indicates an error occurred while processing the request.
    ```json
    {
      "message:": "Internal server error",
    }
    ```
- **Sample Usage**
  ```bash
  curl -X POST http://localhost:3000/api/residents/create \
  -H "Content-Type: application/json" \
  -d '{
      "name": "John Doe",
      "password": "securePassword123",
      "image": "path/to/image.jpg"  // Note: Adjust for file upload
  }'
  ```

### 2. Get All Residents
- **Method**: `GET`
- **Path**: `/api/residents/get/all`
- **Description**: Retrieves a list of all residents.
- **Input Parameters**: None
- **Response**:
  - `200 OK`
    ```json
    [
      {
        "id": "string",
        "name": "string",
        "voucherBalance": 100,
        "imageUrl": "string",
        "createdAt": "timestamp",
        "updatedAt": "timestamp"
      },
      ...
    ]
  - `404 Not Found`: Indicates that no residents were found in the database.
    ```json
      {
        "message": "No residents found"
      }
      ```
  - `500 Internal Server Error`: Indicates an error occurred while processing the request. This could be due to issues like database connectivity or unexpected server errors.
    ```json
    {
      "message": "Internal server error"
    }
    ```
- **Sample Usage**
  ```bash
  curl --location 'http://localhost:3000/api/residents/get/all'
  ```

### 3. Get Resident by User ID
- **Method**: `GET`
- **Path**: `/api/residents/get/id`
- **Description**: Retrieves a resident's details by their user ID.
- **Input Parameters**:
  - `userId` (string, required): The ID of the resident to retrieve.
- **Response**:
  - `200 OK`
    ```json
    {
      "id": "string",
      "name": "string",
      "voucherBalance": 100,
      "imageUrl": "string",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
    ```
  - `404 Not Found`: Indicates that the resident with the specified ID was not found.
    ```json
    {
      "message": "Resident not found"
    }
    ```
  - `500 Internal Server Error`: Indicates an error occurred while processing the request. This could be due to issues like database connectivity or unexpected server errors.
    ```json
    {
      "message": "Internal server error"
    }
    ```

- **Sample Usage**
  ```bash
  curl --location --request GET 'http://localhost:3000/api/residents/get/id' \
  --header 'Content-Type: application/json' \
  --data '{
      "userId": "ABC123"
  }'

### 4. Update Resident's Details
- **Method**: `PUT`
- **Path**: `/api/residents/update/details`
- **Description**: Updates the details of a resident based on their user ID.
- **Input Parameters**:
  - `userId` (string, required): The ID of the resident to update.
  - `name` (string, optional): The new name for the resident.
  - `password` (string, optional): The new password for the resident.
  - `image` (file, optional): An optional new image file for the resident.

- **Response**:
  - `200 OK`
    ```json
    {
      "message": "Resident updated successfully"
    }
    ```
  - `400 Bad Request`: Indicates that the provided name or password is invalid (e.g., empty or whitespace).
    ```json
    {
      "message": "Name cannot be empty or whitespace."
    }
    ```
  - `404 Not Found`: Indicates that the resident with the specified ID was not found.
    ```json
    {
      "message": "Resident not found"
    }
    ```
  - `500 Internal Server Error`: Indicates an error occurred while processing the request. This could be due to issues like database connectivity or unexpected server errors.
    ```json
    {
      "message": "Internal server error"
    }
    ```

- **Sample Usage**
  ```bash
  curl --location --request PUT 'http://localhost:3000/api/residents/update/details' \
  --header 'Content-Type: application/json' \
  --data '{
      "userId": "ABC123",
      "name": "Jane Doe",
      "password": "newSecurePassword123",
      "image": "path/to/new/image.jpg"  // Note: Adjust for file upload
  }'
### 5. Update Resident Voucher Balance
- **Method**: `PUT`
- **Path**: `/api/residents/update/voucher-balance`
- **Description**: Updates the voucher balance of a resident based on their user ID.
- **Input Parameters**:
  - `userId` (string, required): The ID of the resident whose voucher balance will be updated.
  - `newVoucherBalance` (float, required): The new voucher balance to set for the resident. Must be a non-negative number.

- **Response**:
  - `200 OK`
    ```json
    {
      "message": "Voucher balance updated successfully"
      "voucherBalance": "<newVoucherBalance>"
    }
    ```
  - `400 Bad Request`: Indicates that the provided `newVoucherBalance` is invalid (not a float or negative).
    ```json
    {
      "message": "New voucher balance must be a float and cannot be negative."
    }
    ```
  - `404 Not Found`: Indicates that the resident with the specified ID was not found.
    ```json
    {
      "message": "Resident not found"
    }
    ```
  - `500 Internal Server Error`: Indicates an error occurred while processing the request. This could be due to issues like database connectivity or unexpected server errors.
    ```json
    {
      "message": "Internal server error"
    }
    ```

- **Sample Usage**
  ```bash
  curl --location --request PUT 'http://localhost:3000/api/residents/update/voucher-balance' \
  --header 'Content-Type: application/json' \
  --data '{
      "userId": "ABC123",
      "newVoucherBalance": 150.75
  }'

### 6. Delete a Resident
- **Method**: `DELETE`
- **Path**: `/api/residents/delete`
- **Description**: Deletes a resident from the system.
- **Input Parameters**:
  - `userId` (string, required): The ID of the resident to delete.
- **Response**:
  - **Status**: `200 OK`
  - **Body**:
    ```json
    {
      "message": "Resident deleted successfully"
    }
    ```

### 7. Request Password Reset
- **Method**: `POST`
- **Path**: `/api/residents/request-password-reset`
- **Description**: Requests a password reset for a resident.
- **Input Parameters**:
  - `name` (string, required): The name of the resident.
  - `userId` (string, required): The ID of the resident.
- **Response**:
  - **Status**: `200 OK`
  - **Body**:
    ```json
    {
      "message": "Password change request sent to admins successfully"
    }
    ```

### 8. Reset Resident Password
- **Method**: `POST`
- **Path**: `/api/residents/reset-password`
- **Description**: Resets the password for a resident.
- **Input Parameters**:
  - `userId` (string, required): The ID of the resident.
  - `newPassword` (string, required): The new password for the resident.
  - `requestId` (string, required): The ID of the password reset request.
- **Response**:
  - **Status**: `200 OK`
  - **Body**:
    ```json
    {
      "message": "Password updated successfully and request removed."
    }
    ```

### 9. Get User ID from Name
- **Method**: `GET`
- **Path**: `/api/residents/get/name`
- **Description**: Retrieves the user ID based on the resident's name.
- **Input Parameters**:
  - `name` (string, required): The name of the resident to search for.
- **Response**:
  - **Status**: `200 OK`
  - **Body**:
    ```json
    {
      "success": true,
      "residents": [
        {
          "name": "string",
          "userId": "string"
        },
        ...
      ]
    }
    ```

### User Login
- **Method**: `POST`
- **Path**: `/api/residents/login`
- **Description**: Logs in a resident.
- **Input Parameters**:
  - `userId` (string, required): The ID of the resident.
  - `password` (string, required): The password of the resident.
- **Response**:
  - **Status**: `200 OK`
  - **Body**:
    ```json
    {
      "message": "Login successful",
      "isAdmin": false,
      "userId": "string"
    }
    ```

---

This README section provides a detailed overview of the `residentRoutes`, including endpoint descriptions, input parameters, and expected responses. You can adjust the content as needed to fit your specific requirements or add any additional endpoints that may exist.
