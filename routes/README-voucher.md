# Voucher API Documentation
## Overview
This section documents the endpoints available for managing voucher within the application. Each endpoint includes details about the HTTP method, path, input parameters, and expected responses.

## Endpoints

### 1. Create Task
- **Method**: `POST`
- **Path**: `/api/vouchers/create`
- **Description**: Creates a new voucher task.
- **Input Parameters**:
  - `value` (integer, required): The value of the voucher task.
  - `taskName` (string, required): The name of the voucher task.
  - `imageFile` (file, optional): An image file associated with the task.

- **Response**:
  - `201 Created`
    ```json
    {
      "message": "Task created successfully",
      "task": {
        "voucherTaskId": "string",
        "value": "integer",
        "taskName": "string",
        "userId": null,
        "claimStatus": false,
        "distributedStatus": false,
        "imageUrl": "string",
        "updatedAt": null,
        "createdAt": "date"
      }
    }
    ```
  - `400 Bad Request`: Validation errors.
  - `500 Internal Server Error`: Error creating task.
- **Sample Usage**
  ```bash
    curl --location 'http://localhost:3000/api/vouchers/create' \
  --form 'value="100"' \
  --form 'taskName="skip"' \
  --form 'image=@"<image>"'
  ```

---

### 2. View all tasks
- **Method**: `GET`
- **Path**: `/api/vouchers/viewtasks/all`
- **Description**: Retrieves all voucher tasks from the database.

- **Response**:
  - `200 OK`
    ```json
    [
      {
        "voucherTaskId": "string",
        "value": "integer",
        "taskName": "string",
        "userId": "string | null",
        "claimStatus": "boolean",
        "distributedStatus": "boolean",
        "imageUrl": "string | null",
        "updatedAt": "date | null",
        "createdAt": "date"
      },
      ...
    ]
    ```
  - `500 Internal Server Error`: Indicates an error occurred while retrieving tasks.
    ```json
    {
      "error": "Failed to retrieve tasks",
      "details": "error message"
    }
    ```
- **Sample Usage**
  ```bash
  curl --location 'http://localhost:3000/api/vouchers/viewtasks/all'
  ```

---

### 3. View Task by Voucher ID
- **Method**: `GET`
- **Path**: `/api/vouchers/viewtask/vouchertaskid`
- **Description**: Retrieves a specific voucher task based on its voucher task ID.

- **Input Parameters**:
  - `voucherTaskId` (string, required): The ID of the voucher task to retrieve.

- **Response**:
  - `200 OK`
    ```json
    {
      "voucherTaskId": "string",
      "value": "integer",
      "taskName": "string",
      "userId": "string | null",
      "claimStatus": "boolean",
      "distributedStatus": "boolean",
      "imageUrl": "string | null",
      "updatedAt": "date | null",
      "createdAt": "date"
    }
    ```
  - `404 Not Found`: Indicates that the task with the specified ID does not exist.
    ```json
    {
      "error": "Task not found"
    }
    ```
  - `500 Internal Server Error`: Indicates an error occurred while retrieving the task.
    ```json
    {
      "error": "Failed to retrieve task",
      "details": "error message"
    }
    ```

- **Sample Usage**
  ```bash
  curl --location --request GET 'http://localhost:3000/api/vouchers/viewtask/vouchertaskid' \
  --header 'Content-Type: application/json' \
  --data '{
      "voucherTaskId": "Id6g2n7u2ZAO8ZUEeKNP"
  }'
  ```

---

### 4. View Tasks by User ID
- **Method**: `GET`
- **Path**: `/api/vouchers/viewtasks/userid`
- **Description**: Retrieves all tasks claimed by a specific user based on their user ID.

- **Input Parameters**:
  - `userId` (string, required): The ID of the user whose claimed tasks are to be retrieved.

- **Response**:
  - `200 OK`
    ```json
    [
      {
        "voucherTaskId": "string",
        "value": "integer",
        "taskName": "string",
        "userId": "string",
        "claimStatus": true,
        "distributedStatus": "boolean",
        "imageUrl": "string | null",
        "updatedAt": "date | null",
        "createdAt": "date"
      },
      ...
    ]
    ```
    - If no claimed tasks are available:
    ```json
    {
      "message": "No claimed tasks available for this user."
    }
    ```
  - `404 Not Found`: Indicates that the user ID does not exist in the residents collection.
    ```json
    {
      "error": "User ID does not exist in residents collection"
    }
    ```
  - `500 Internal Server Error`: Indicates an error occurred while retrieving tasks for the user.
    ```json
    {
      "error": "Failed to retrieve tasks for the user",
      "details": "error message"
    }
    ```

- **Sample Usage**
  ```bash
  curl --location --request GET 'http://localhost:3000/api/vouchers/viewtasks/userid' \
  --header 'Content-Type: application/json' \
  --data '{
      "userId": "GRRSI7"
  }'
  ```

---

### 5. View Tasks Not Claimed
- **Method**: `GET`
- **Path**: `/api/vouchers/viewtasks/notclaimed`
- **Description**: Retrieves all voucher tasks that are not claimed.

- **Response**:
  - `200 OK`
    ```json
    [
      {
        "voucherTaskId": "string",
        "value": "integer",
        "taskName": "string",
        "userId": null,
        "claimStatus": false,
        "distributedStatus": "boolean",
        "imageUrl": "string | null",
        "updatedAt": "date | null",
        "createdAt": "date"
      },
      ...
    ]
    ```
    - If no unclaimed tasks are available:
    ```json
    {
      "message": "No unclaimed tasks available."
    }
    ```
  - `500 Internal Server Error`: Indicates an error occurred while retrieving tasks.
    ```json
    {
      "error": "Failed to retrieve tasks",
      "details": "error message"
    }
    ```

- **Sample Usage**
  ```bash
  curl --location 'http://localhost:3000/api/vouchers/viewtasks/notclaimed'
  ```

---

### 6. View Tasks Claimed
- **Method**: `GET`
- **Path**: `/api/vouchers/viewtasks/claimed`
- **Description**: Retrieves all voucher tasks that have been claimed.

- **Response**:
  - `200 OK`
    ```json
    [
      {
        "voucherTaskId": "string",
        "value": "integer",
        "taskName": "string",
        "userId": "string",
        "claimStatus": true,
        "distributedStatus": "boolean",
        "imageUrl": "string | null",
        "updatedAt": "date | null",
        "createdAt": "date"
      },
      ...
    ]
    ```
    - If no claimed tasks are available:
    ```json
    {
      "message": "No claimed tasks available."
    }
    ```
  - `500 Internal Server Error`: Indicates an error occurred while retrieving tasks.
    ```json
    {
      "error": "Failed to retrieve tasks",
      "details": "error message"
    }
    ```

- **Sample Usage**
  ```bash
  curl --location 'http://localhost:3000/api/vouchers/viewtasks/claimed'
  ```

---

### 7. Update Task
- **Method**: `PUT`
- **Path**: `/api/vouchers/update`
- **Description**: Updates an existing voucher task with new values, task name, or image.

- **Input Parameters**:
  - `voucherTaskId` (string, required): The ID of the voucher task to update.
  - `value` (integer, optional): The new value for the voucher task.
  - `taskName` (string, optional): The new name for the voucher task.
  - `imageFile` (file, optional): An optional new image file associated with the task.

- **Response**:
  - `200 OK`
    ```json
    {
      "message": "Task updated successfully"
    }
    ```
  - `400 Bad Request`: Validation errors.
    ```json
    {
      "error": "At least one of value, taskName, or image is required"
    }
    ```
    - Or for specific validation failures:
    ```json
    {
      "error": "Value must be a positive integer."
    }
    ```
    ```json
    {
      "error": "Task name cannot be empty."
    }
    ```
  - `404 Not Found`: Indicates that the task with the specified ID does not exist.
    ```json
    {
      "error": "Task not found"
    }
    ```
  - `500 Internal Server Error`: Indicates an error occurred while updating the task.
    ```json
    {
      "error": "Failed to update task",
      "details": "error message"
    }
    ```

- **Sample Usage**
  ```bash
  curl --location --request PUT 'http://localhost:3000/api/vouchers/update' \
  --form 'voucherTaskId="9W4LQCAhLXxPt7l4wSH7"' \
  --form 'value="100"' \
  --form 'taskName="New Task Name"' \
  --form 'image=@"path/to/image.jpg"'
  ```

---

### 8. Delete Task
- **Method**: `DELETE`
- **Path**: `/api/vouchers/delete`
- **Description**: Deletes a specified voucher task and its associated image.

- **Input Parameters**:
  - `voucherTaskId` (string, required): The ID of the voucher task to delete.

- **Response**:
  - `200 OK`
    ```json
    {
      "message": "Task and associated image deleted successfully"
    }
    ```
  - `404 Not Found`: Indicates that the task with the specified ID does not exist.
    ```json
    {
      "error": "Task not found"
    }
    ```
  - `500 Internal Server Error`: Indicates an error occurred while deleting the task.
    ```json
    {
      "error": "Failed to delete task",
      "details": "error message"
    }
    ```

- **Sample Usage**
  ```bash
  curl --location --request DELETE 'http://localhost:3000/api/vouchers/delete' \
  --header 'Content-Type: application/json' \
  --data '{
      "voucherTaskId": "G9sj8RFl8XMcWdmvbyb8"
  }'
  ```

---

### 9. Claim Task
- **Method**: `PATCH`
- **Path**: `/api/vouchers/claim`
- **Description**: Allows a resident to claim a specified voucher task.

- **Input Parameters**:
  - `voucherTaskId` (string, required): The ID of the voucher task to be claimed.
  - `userId` (string, required): The ID of the resident claiming the task.

- **Response**:
  - `200 OK`
    ```json
    {
      "message": "Task claimed successfully"
    }
    ```
  - `400 Bad Request`: Indicates that the task is already claimed or other validation errors.
    ```json
    {
      "error": "Task is already claimed"
    }
    ```
  - `404 Not Found`: Indicates that the user ID does not exist in the residents collection or the task does not exist.
    ```json
    {
      "error": "User ID does not exist in residents collection"
    }
    ```
    ```json
    {
      "error": "Task not found"
    }
    ```
  - `500 Internal Server Error`: Indicates an error occurred while claiming the task.
    ```json
    {
      "error": "Failed to claim task",
      "details": "error message"
    }
    ```

- **Sample Usage**
  ```bash
    curl --location --request PATCH 'http://localhost:3000/api/vouchers/claim' \
  --header 'Content-Type: application/json' \
  --data '{
      "voucherTaskId": "Id6g2n7u2ZAO8ZUEeKNP",
      "userId": "JS55KH"
  }'
  ```

---

### 10. Unclaim Task
- **Method**: `PATCH`
- **Path**: `/api/vouchers/unclaim`
- **Description**: Allows a resident to unclaim a specified voucher task.

- **Input Parameters**:
  - `voucherTaskId` (string, required): The ID of the voucher task to be unclaimed.
  - `userId` (string, required): The ID of the resident unclaiming the task.

- **Response**:
  - `200 OK`
    ```json
    {
      "message": "Task unclaimed successfully"
    }
    ```
  - `400 Bad Request`: Indicates that the task is not currently claimed or other validation errors.
    ```json
    {
      "error": "Task is not claimed; cannot unclaim"
    }
    ```
  - `404 Not Found`: Indicates that the user ID does not exist in the residents collection or the task does not exist.
    ```json
    {
      "error": "User ID does not exist in residents collection"
    }
    ```
    ```json
    {
      "error": "Task not found"
    }
    ```
  - `500 Internal Server Error`: Indicates an error occurred while unclaiming the task.
    ```json
    {
      "error": "Failed to unclaim task",
      "details": "error message"
    }
    ```

- **Sample Usage**
  ```bash
  curl --location --request PATCH 'http://localhost:3000/api/vouchers/unclaim' \
  --header 'Content-Type: application/json' \
  --data '{
      "voucherTaskId": "",
      "userId": ""
  }'
  ```

---

### 11. Approve Voucher
- **Method**: `PATCH`
- **Path**: `/api/vouchers/approve`
- **Description**: Approves a specified voucher task and updates the resident's voucher balance.

- **Input Parameters**:
  - `voucherTaskId` (string, required): The ID of the voucher task to be approved.

- **Response**:
  - `200 OK`
    ```json
    {
      "message": "Voucher approved and balance updated"
    }
    ```
  - `400 Bad Request`: Indicates that the voucher is already approved or other validation errors.
    ```json
    {
      "error": "Voucher is approved; cannot approve again"
    }
    ```
  - `404 Not Found`: Indicates that the specified voucher task does not exist.
    ```json
    {
      "error": "Voucher task not found"
    }
    ```
  - `500 Internal Server Error`: Indicates an error occurred while approving the voucher.
    ```json
    {
      "error": "Failed to approve voucher",
      "details": "error message"
    }
    ```

- **Sample Usage**
  ```bash
  curl --location --request PATCH 'http://localhost:3000/api/vouchers/approve' \
  --header 'Content-Type: application/json' \
  --data '{
      "voucherTaskId": ""
  }'
  ```

---

### 12. Unapprove Voucher
- **Method**: `PATCH`
- **Path**: `/api/vouchers/unapprove`
- **Description**: Reverts the approval of a specified voucher task and decrements the resident's voucher balance.

- **Input Parameters**:
  - `voucherTaskId` (string, required): The ID of the voucher task to be unapproved.

- **Response**:
  - `200 OK`
    ```json
    {
      "message": "Voucher unapproved and balance decremented"
    }
    ```
  - `400 Bad Request`: Indicates that the voucher is not approved or other validation errors.
    ```json
    {
      "error": "Voucher is not approved; cannot unapprove"
    }
    ```
    ```json
    {
      "error": "Invalid task data"
    }
    ```
  - `404 Not Found`: Indicates that the specified voucher task does not exist.
    ```json
    {
      "error": "Voucher task not found"
    }
    ```
  - `500 Internal Server Error`: Indicates an error occurred while unapproving the voucher.
    ```json
    {
      "error": "Failed to unapprove voucher",
      "details": "error message"
    }
    ```

- **Sample Usage**
  ```bash
  curl --location --request PATCH 'http://localhost:3000/api/vouchers/unapprove' \
  --header 'Content-Type: application/json' \
  --data '{
      "voucherTaskId": ""
  }'
  ```

---

### 13. Reject Voucher
- **Method**: `PATCH`
- **Path**: `/api/vouchers/reject`
- **Description**: Rejects a specified voucher task and reverts its user ID and distributed status.

- **Input Parameters**:
  - `voucherTaskId` (string, required): The ID of the voucher task to be rejected.

- **Response**:
  - `200 OK`
    ```json
    {
      "message": "Voucher rejected and user ID reverted"
    }
    ```
  - `404 Not Found`: Indicates that the specified voucher task does not exist.
    ```json
    {
      "error": "Voucher task not found"
    }
    ```
  - `500 Internal Server Error`: Indicates an error occurred while rejecting the voucher.
    ```json
    {
      "error": "Failed to reject voucher",
      "details": "error message"
    }
    ```

- **Sample Usage**
  ```bash
  curl --location --request PATCH 'http://localhost:3000/api/vouchers/reject' \
  --header 'Content-Type: application/json' \
  --data '{
      "voucherTaskId": ""
  }'
  ```
