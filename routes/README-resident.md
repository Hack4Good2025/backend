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
        "updatedAt": "timestamp",
        "preOrderRequests": [],
        "transactionHistory": [],
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
      "image": "path/to/image.jpg"
  }'
  ```
---

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
        "userId": "string",
        "name": "string",
        "voucherBalance": 100,
        "imageUrl": "string",
        "createdAt": "timestamp",
        "updatedAt": "timestamp",
        "preOrderRequests": [],
        "transactionHistory": [],
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
---

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
      "userId": "string",
      "name": "string",
      "voucherBalance": 100,
      "imageUrl": "string",
      "createdAt": "timestamp",
      "updatedAt": "timestamp",
      "preOrderRequests": [],
      "transactionHistory": [],
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
        "userId": "GRRSI7"
    }
    '
  ```
---
### 4. Get User ID from Name
- **Method**: `POST`
- **Path**: `/api/residents/get/userid`
- **Description**: Retrieves the user ID(s) of residents based on the provided name.
- **Input Parameters**:
  - `name` (string, required): The name of the resident to search for.

- **Response**:
  - `200 OK`
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
  - `400 Bad Request`: Indicates that the name parameter is missing.
    ```json
    {
      "success": false,
      "message": "Name is required"
    }
    ```
  - `404 Not Found`: Indicates that no residents were found with the specified name.
    ```json
    {
      "success": false,
      "message": "No residents found with this name"
    }
    ```
  - `500 Internal Server Error`: Indicates an error occurred while processing the request. This could be due to issues like database connectivity or unexpected server errors.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

- **Sample Usage**
  ```bash
  curl --location --request GET 'http://localhost:3000/api/residents/get/name' \
  --header 'Content-Type: application/json' \
  --data '{
      "name": "user"
  }'
  ```
---
### 5. Update Resident's Details
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
    --form 'userId="5P3N8Y"' \
    --form 'name=""' \
    --form 'password=""' \
    --form 'image=@"path/to/image.jpg"'
  ```
---
### 6. Update Resident Voucher Balance
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
    curl --location --request PUT 'http://localhost:3000/api/residents/update/balance' \
  --header 'Content-Type: application/json' \
  --data '{
      "userId": "GRRSI7",
      "newVoucherBalance": 500
  }'
  ```
---
### 7. Delete a Resident
- **Method**: `DELETE`
- **Path**: `/api/residents/delete`
- **Description**: Deletes a resident from the system based on their user ID.
- **Input Parameters**:
  - `userId` (string, required): The ID of the resident to delete.

- **Response**:
  - `200 OK`
    ```json
    {
      "message": "Resident deleted successfully"
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
    curl --location --request DELETE 'http://localhost:3000/api/residents/delete' \
  --header 'Content-Type: application/json' \
  --data '{
      "userId": "5P3N8Y"
  }'
  ```
---
### 8. Get User ID from Name
- **Method**: `POST`
- **Path**: `/api/residents/get/userid`
- **Description**: Retrieves the user ID(s) of residents based on the provided name.
- **Input Parameters**:
  - `name` (string, required): The name of the resident to search for.

- **Response**:
  - `200 OK`
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
  - `400 Bad Request`: Indicates that the name parameter is missing.
    ```json
    {
      "success": false,
      "message": "Name is required"
    }
    ```
  - `404 Not Found`: Indicates that no residents were found with the specified name.
    ```json
    {
      "success": false,
      "message": "No residents found with this name"
    }
    ```
  - `500 Internal Server Error`: Indicates an error occurred while processing the request. This could be due to issues like database connectivity or unexpected server errors.
    ```json
    {
      "success": false,
      "message": "Internal server error"
    }
    ```

- **Sample Usage**
  ```bash
  curl --location 'http://localhost:3000/api/residents/request-password-reset' \
  --header 'Content-Type: application/json' \
  --data '{
      "name": "Joe",
      "userId": "7884a685-ff30-4fe2-bf3c-57ce2fd75c0c"
  }'
  ```
---
### 9. Reset Resident's Password
- **Method**: `PUT`
- **Path**: `/api/residents/reset/password`
- **Description**: Resets the password of a resident based on their user ID.
- **Input Parameters**:
  - `userId` (string, required): The ID of the resident whose password will be reset.
  - `newPassword` (string, required): The new password to set for the resident.
  - `requestId` (string, required): The ID of the password reset request to be deleted after the password is reset.

- **Response**:
  - `200 OK`
    ```json
    {
      "message": "Password updated successfully and request removed."
    }
    ```
  - `404 Not Found`: Indicates that the resident with the specified ID was not found.
    ```json
    {
      "message": "Resident not found."
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
    curl --location 'http://localhost:3000/api/residents/reset-password' \
  --header 'Content-Type: application/json' \
  --data '{
      "userId": "7884a685-ff30-4fe2-bf3c-57ce2fd75c0c",
      "newPassword": "newPassword",
      "requestId": "7884a685-ff30-4fe2-bf3c-57ce2fd75c0c_1736858274319"
  }'
  ```
---
### 10. Login User
- **Method**: `POST`
- **Path**: `/api/users/login`
- **Description**: Authenticates a user based on their user ID and password.
- **Input Parameters**:
  - `userId` (string, required): The user ID of the resident or admin.
  - `password` (string, required): The password associated with the user ID.

- **Response**:
  - `200 OK`: Successful login.
    ```json
    {
      "message": "Login successful",
      "isAdmin": true, // or false
      "userId": "string"
    }
    ```
  - `400 Bad Request`: Indicates that either the user ID or password is missing.
    ```json
    {
      "message": "User ID and password are required."
    }
    ```
  - `404 Not Found`: Indicates that no resident was found with the specified user ID.
    ```json
    {
      "message": "No resident found with this user ID."
    }
    ```
  - `401 Unauthorized`: Indicates that the password is incorrect.
    ```json
    {
      "message": "Incorrect password."
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
  curl --location 'http://localhost:3000/api/residents/login' \
  --header 'Content-Type: application/json' \
  --data '{"userId": "HJ0Q3N", "password": "user"}'
  ```

---

This README section provides a detailed overview of the `residentRoutes`, including endpoint descriptions, input parameters, and expected responses. You can adjust the content as needed to fit your specific requirements or add any additional endpoints that may exist.
