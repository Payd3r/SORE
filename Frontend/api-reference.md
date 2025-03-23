
# API Reference

This document outlines all the API endpoints that the frontend application expects to communicate with.

## Authentication

### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt-token-here",
    "user": {
      "id": "user-123",
      "name": "John Doe",
      "email": "user@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "About me",
      "createdAt": "2023-01-01T00:00:00Z",
      "coupleId": "couple-123"
    }
  }
  ```

### Register
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**: Same as login

### Get Current User
- **URL**: `/api/auth/user`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "user": {
      "id": "user-123",
      "name": "John Doe",
      "email": "user@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "About me",
      "createdAt": "2023-01-01T00:00:00Z",
      "coupleId": "couple-123"
    },
    "couple": {
      "id": "couple-123",
      "name": "John & Jane",
      "description": "Our story",
      "startDate": "2022-01-01T00:00:00Z",
      "anniversaryDate": "2022-01-01T00:00:00Z",
      "avatar": "https://example.com/couple.jpg",
      "createdAt": "2023-01-01T00:00:00Z",
      "members": [
        {
          "id": "user-123",
          "name": "John Doe",
          "email": "user@example.com",
          "avatar": "https://example.com/avatar.jpg"
        },
        {
          "id": "user-456",
          "name": "Jane Doe",
          "email": "jane@example.com",
          "avatar": "https://example.com/jane.jpg"
        }
      ]
    }
  }
  ```

### Logout
- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Response**: Status 200 OK

## Users

### Get User
- **URL**: `/api/users/{userId}`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "id": "user-123",
    "name": "John Doe",
    "email": "user@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "About me",
    "uploadCount": 42,
    "createdAt": "2023-01-01T00:00:00Z"
  }
  ```

### Update User
- **URL**: `/api/users/{userId}`
- **Method**: `PUT`
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "name": "John Smith",
    "avatar": "https://example.com/new-avatar.jpg",
    "bio": "Updated bio"
  }
  ```
- **Response**: Updated user object

## Couples

### Create Couple
- **URL**: `/api/couples`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "name": "John & Jane",
    "description": "Our story",
    "startDate": "2022-01-01T00:00:00Z",
    "members": ["user-123"]
  }
  ```
- **Response**: Created couple object

### Get Couple
- **URL**: `/api/couples/{coupleId}`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "id": "couple-123",
    "name": "John & Jane",
    "description": "Our story",
    "startDate": "2022-01-01T00:00:00Z",
    "anniversaryDate": "2022-01-01T00:00:00Z",
    "avatar": "https://example.com/couple.jpg",
    "createdAt": "2023-01-01T00:00:00Z",
    "members": [
      {
        "id": "user-123",
        "name": "John Doe",
        "email": "user@example.com",
        "avatar": "https://example.com/avatar.jpg"
      },
      {
        "id": "user-456",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "avatar": "https://example.com/jane.jpg"
      }
    ]
  }
  ```

### Update Couple
- **URL**: `/api/couples/{coupleId}`
- **Method**: `PUT`
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "name": "John & Jane Forever",
    "description": "Updated story",
    "anniversaryDate": "2022-02-14T00:00:00Z"
  }
  ```
- **Response**: Updated couple object

### Join Couple
- **URL**: `/api/couples/{coupleId}/members`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "userId": "user-456"
  }
  ```
- **Response**: Updated couple object

### Leave Couple
- **URL**: `/api/couples/{coupleId}/members/{userId}`
- **Method**: `DELETE`
- **Headers**: Authorization: Bearer {token}
- **Response**: Status 200 OK

## Memories

### Get Memories
- **URL**: `/api/couples/{coupleId}/memories`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `type`: Filter by memory type (travel, event, simple)
  - `startDate`: Filter by start date
  - `endDate`: Filter by end date
- **Response**:
  ```json
  {
    "memories": [
      {
        "id": "memory-123",
        "type": "travel",
        "title": "Paris Trip",
        "description": "Our first vacation together",
        "startDate": "2022-06-01T00:00:00Z",
        "endDate": "2022-06-07T00:00:00Z",
        "song": "La Vie en Rose",
        "location": {
          "latitude": 48.8566,
          "longitude": 2.3522,
          "name": "Paris, France"
        },
        "images": [
          {
            "id": "image-123",
            "name": "Eiffel Tower",
            "url": "https://example.com/eiffel.jpg",
            "thumbnailUrl": "https://example.com/eiffel-thumb.jpg",
            "date": "2022-06-02T00:00:00Z",
            "type": "couple"
          }
        ],
        "userId": "user-123",
        "creatorName": "John Doe",
        "coupleId": "couple-123",
        "createdAt": "2023-01-10T00:00:00Z",
        "updatedAt": "2023-01-10T00:00:00Z"
      }
    ]
  }
  ```

### Get Memory
- **URL**: `/api/memories/{memoryId}`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Response**: Single memory object

### Create Memory
- **URL**: `/api/memories`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "type": "event",
    "title": "Anniversary Dinner",
    "description": "First anniversary celebration",
    "startDate": "2023-01-01T00:00:00Z",
    "eventTag": "anniversary",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "name": "New York, USA"
    },
    "userId": "user-123",
    "creatorName": "John Doe",
    "coupleId": "couple-123"
  }
  ```
- **Response**: Created memory object

### Update Memory
- **URL**: `/api/memories/{memoryId}`
- **Method**: `PUT`
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "title": "Anniversary Dinner - Updated",
    "description": "Updated description"
  }
  ```
- **Response**: Updated memory object

### Delete Memory
- **URL**: `/api/memories/{memoryId}`
- **Method**: `DELETE`
- **Headers**: Authorization: Bearer {token}
- **Response**: Status 200 OK

## Images

### Get Images
- **URL**: `/api/couples/{coupleId}/images`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `type`: Filter by image type (landscape, singlePerson, couple)
  - `startDate`: Filter by date from
  - `endDate`: Filter by date to
  - `favorite`: Filter by favorite status (true/false)
- **Response**:
  ```json
  {
    "images": [
      {
        "id": "image-123",
        "name": "Beach Photo",
        "url": "https://example.com/beach.jpg",
        "thumbnailUrl": "https://example.com/beach-thumb.jpg",
        "date": "2022-08-15T00:00:00Z",
        "type": "couple",
        "location": {
          "latitude": 25.7617,
          "longitude": -80.1918,
          "name": "Miami, FL"
        },
        "memoryId": "memory-456",
        "userId": "user-123",
        "uploaderName": "John Doe",
        "coupleId": "couple-123",
        "isFavorite": true,
        "createdAt": "2022-08-16T00:00:00Z"
      }
    ]
  }
  ```

### Get Image
- **URL**: `/api/images/{imageId}`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Response**: Single image object

### Upload Image
- **URL**: `/api/images/upload`
- **Method**: `POST`
- **Headers**: 
  - Authorization: Bearer {token}
  - Content-Type: multipart/form-data
- **Form Data**:
  - `image`: File
  - `name`: String
  - `date`: Date
  - `type`: String (landscape, singlePerson, couple)
  - `memoryId`: String (optional)
  - `location`: JSON string (optional)
  - `userId`: String
  - `uploaderName`: String
  - `coupleId`: String
- **Response**: Created image object

### Update Image
- **URL**: `/api/images/{imageId}`
- **Method**: `PUT`
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "name": "Updated Name",
    "type": "landscape"
  }
  ```
- **Response**: Updated image object

### Toggle Favorite
- **URL**: `/api/images/{imageId}/favorite`
- **Method**: `PUT`
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "isFavorite": true
  }
  ```
- **Response**: Updated image object

### Delete Image
- **URL**: `/api/images/{imageId}`
- **Method**: `DELETE`
- **Headers**: Authorization: Bearer {token}
- **Response**: Status 200 OK

## Ideas

### Get Ideas
- **URL**: `/api/couples/{coupleId}/ideas`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Query Parameters**:
  - `type`: Filter by idea type (travel, restaurant, general, challenge)
  - `completed`: Filter by completion status (true/false)
- **Response**:
  ```json
  {
    "ideas": [
      {
        "id": "idea-123",
        "title": "Visit Japan",
        "description": "Trip to Tokyo and Kyoto",
        "type": "travel",
        "priority": "high",
        "dueDate": "2023-10-01T00:00:00Z",
        "location": {
          "latitude": 35.6762,
          "longitude": 139.6503,
          "name": "Tokyo, Japan"
        },
        "completed": false,
        "userId": "user-456",
        "creatorName": "Jane Doe",
        "coupleId": "couple-123",
        "createdAt": "2023-01-15T00:00:00Z"
      }
    ]
  }
  ```

### Get Idea
- **URL**: `/api/ideas/{ideaId}`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Response**: Single idea object

### Create Idea
- **URL**: `/api/ideas`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "title": "Cook Italian Dinner",
    "description": "Try making homemade pasta",
    "type": "general",
    "priority": "medium",
    "userId": "user-123",
    "creatorName": "John Doe",
    "coupleId": "couple-123"
  }
  ```
- **Response**: Created idea object

### Update Idea
- **URL**: `/api/ideas/{ideaId}`
- **Method**: `PUT`
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "title": "Cook Italian Dinner - Updated",
    "description": "With tiramisu for dessert",
    "priority": "high"
  }
  ```
- **Response**: Updated idea object

### Complete Idea
- **URL**: `/api/ideas/{ideaId}/complete`
- **Method**: `PUT`
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "userId": "user-123"
  }
  ```
- **Response**: Updated idea object

### Delete Idea
- **URL**: `/api/ideas/{ideaId}`
- **Method**: `DELETE`
- **Headers**: Authorization: Bearer {token}
- **Response**: Status 200 OK

## Stats

### Get Couple Stats
- **URL**: `/api/couples/{coupleId}/stats`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "totalMemories": 15,
    "memoriesByType": {
      "travel": 5,
      "event": 7,
      "simple": 3
    },
    "memoriesByUser": {
      "user-123": 8,
      "user-456": 7
    },
    "totalImages": 42,
    "imagesByType": {
      "landscape": 12,
      "singlePerson": 15,
      "couple": 15
    },
    "imagesByUser": {
      "user-123": 20,
      "user-456": 22
    },
    "totalIdeas": 10,
    "completedIdeas": 4,
    "ideasByType": {
      "travel": 4,
      "restaurant": 3,
      "general": 2,
      "challenge": 1
    },
    "ideasCreatedByUser": {
      "user-123": 6,
      "user-456": 4
    },
    "ideasCompletedByUser": {
      "user-123": 3,
      "user-456": 1
    },
    "locationsVisited": 8,
    "userStats": [
      {
        "userId": "user-123",
        "name": "John Doe",
        "memoriesCreated": 8,
        "ideasCreated": 6,
        "ideasCompleted": 3,
        "imagesUploaded": 20,
        "locationsVisited": 6
      },
      {
        "userId": "user-456",
        "name": "Jane Doe",
        "memoriesCreated": 7,
        "ideasCreated": 4,
        "ideasCompleted": 1,
        "imagesUploaded": 22,
        "locationsVisited": 5
      }
    ]
  }
  ```

## Locations

### Get Locations
- **URL**: `/api/couples/{coupleId}/locations`
- **Method**: `GET`
- **Headers**: Authorization: Bearer {token}
- **Response**:
  ```json
  {
    "locations": [
      {
        "id": "location-123",
        "latitude": 48.8566,
        "longitude": 2.3522,
        "name": "Paris, France"
      },
      {
        "id": "location-124",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "name": "New York, USA"
      }
    ]
  }
  ```

### Add Location
- **URL**: `/api/locations`
- **Method**: `POST`
- **Headers**: Authorization: Bearer {token}
- **Request Body**:
  ```json
  {
    "latitude": 41.9028,
    "longitude": 12.4964,
    "name": "Rome, Italy",
    "coupleId": "couple-123"
  }
  ```
- **Response**: Created location object
