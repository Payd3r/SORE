
# Couple Memories API Reference

This document provides detailed information about the API endpoints for the Couple Memories application.

## Base URL

```
http://your-api-domain.com/api
```

## Authentication

Most endpoints require authentication using a JWT token. To authenticate, include the token in the Authorization header:

```
Authorization: Bearer your_jwt_token
```

## API Endpoints

### Authentication

#### Register a new user

```
POST /auth/register
```

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2023-01-01T00:00:00.000Z"
  },
  "token": "jwt_token"
}
```

#### Login

```
POST /auth/login
```

Request body:
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "coupleId": "couple-uuid",
    "avatar": "/media/user_123.jpg",
    "bio": "About me"
  },
  "token": "jwt_token"
}
```

#### Get current user

```
GET /auth/user
```

Response:
```json
{
  "id": "user-uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "coupleId": "couple-uuid",
  "avatar": "/media/user_123.jpg",
  "bio": "About me",
  "uploadCount": 15,
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

#### Logout

```
POST /auth/logout
```

Response:
```json
{
  "message": "Logged out successfully"
}
```

### Users

#### Get user by ID

```
GET /users/:userId
```

Response:
```json
{
  "id": "user-uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "coupleId": "couple-uuid",
  "avatar": "/media/user_123.jpg",
  "bio": "About me",
  "uploadCount": 15,
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

#### Update user

```
PUT /users/:userId
```

Request (multipart/form-data):
```
name: John Smith
bio: Updated bio
avatar: [file upload]
```

Response:
```json
{
  "id": "user-uuid",
  "name": "John Smith",
  "email": "john@example.com",
  "coupleId": "couple-uuid",
  "avatar": "/media/user_456.jpg",
  "bio": "Updated bio",
  "uploadCount": 15,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

### Couples

#### Create couple

```
POST /couples
```

Request body:
```json
{
  "name": "John & Jane",
  "description": "Our journey together",
  "startDate": "2020-01-01T00:00:00.000Z",
  "anniversaryDate": "2022-01-01T00:00:00.000Z"
}
```

Response:
```json
{
  "couple": {
    "id": "couple-uuid",
    "name": "John & Jane",
    "description": "Our journey together",
    "startDate": "2020-01-01T00:00:00.000Z",
    "anniversaryDate": "2022-01-01T00:00:00.000Z",
    "createdAt": "2023-01-01T00:00:00.000Z"
  },
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "coupleId": "couple-uuid",
    "avatar": "/media/user_123.jpg",
    "bio": "About me"
  }
}
```

#### Get couple by ID

```
GET /couples/:coupleId
```

Response:
```json
{
  "id": "couple-uuid",
  "name": "John & Jane",
  "description": "Our journey together",
  "startDate": "2020-01-01T00:00:00.000Z",
  "anniversaryDate": "2022-01-01T00:00:00.000Z",
  "avatar": "/media/couple_123.jpg",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "members": [
    {
      "id": "user-uuid-1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "/media/user_123.jpg",
      "bio": "About John"
    },
    {
      "id": "user-uuid-2",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "avatar": "/media/user_456.jpg",
      "bio": "About Jane"
    }
  ]
}
```

#### Update couple

```
PUT /couples/:coupleId
```

Request (multipart/form-data):
```
name: John & Jane Forever
description: Our amazing journey together
startDate: 2020-01-01T00:00:00.000Z
anniversaryDate: 2022-01-01T00:00:00.000Z
avatar: [file upload]
```

Response:
```json
{
  "id": "couple-uuid",
  "name": "John & Jane Forever",
  "description": "Our amazing journey together",
  "startDate": "2020-01-01T00:00:00.000Z",
  "anniversaryDate": "2022-01-01T00:00:00.000Z",
  "avatar": "/media/couple_456.jpg",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z",
  "members": [
    {
      "id": "user-uuid-1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "/media/user_123.jpg",
      "bio": "About John"
    },
    {
      "id": "user-uuid-2",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "avatar": "/media/user_456.jpg",
      "bio": "About Jane"
    }
  ]
}
```

#### Join couple

```
POST /couples/:coupleId/members
```

Response:
```json
{
  "user": {
    "id": "user-uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "coupleId": "couple-uuid",
    "avatar": "/media/user_456.jpg",
    "bio": "About Jane"
  },
  "couple": {
    "id": "couple-uuid",
    "name": "John & Jane",
    "description": "Our journey together",
    "startDate": "2020-01-01T00:00:00.000Z",
    "members": [
      {
        "id": "user-uuid-1",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "/media/user_123.jpg",
        "bio": "About John"
      },
      {
        "id": "user-uuid-2",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "avatar": "/media/user_456.jpg",
        "bio": "About Jane"
      }
    ]
  }
}
```

#### Leave couple

```
DELETE /couples/:coupleId/members
```

Response:
```json
{
  "id": "user-uuid",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "coupleId": null,
  "avatar": "/media/user_456.jpg",
  "bio": "About Jane",
  "uploadCount": 10,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

### Memories

#### Get memories

```
GET /couples/:coupleId/memories?type=travel&startDate=2023-01-01&endDate=2023-12-31
```

Response:
```json
[
  {
    "id": "memory-uuid-1",
    "type": "travel",
    "title": "Trip to Paris",
    "description": "Our amazing trip to Paris",
    "startDate": "2023-05-01T00:00:00.000Z",
    "endDate": "2023-05-07T00:00:00.000Z",
    "song": "La Vie En Rose",
    "location": {
      "latitude": 48.8566,
      "longitude": 2.3522,
      "name": "Paris, France"
    },
    "userId": "user-uuid-1",
    "creatorName": "John Doe",
    "coupleId": "couple-uuid",
    "createdAt": "2023-06-01T00:00:00.000Z",
    "updatedAt": "2023-06-01T00:00:00.000Z",
    "images": [
      {
        "id": "image-uuid-1",
        "name": "Eiffel Tower",
        "url": "/media/eiffel_tower.jpg",
        "thumbnailUrl": "/media/thumbs/eiffel_tower.jpg",
        "date": "2023-05-02T00:00:00.000Z",
        "type": "landscape"
      },
      {
        "id": "image-uuid-2",
        "name": "Us at Louvre",
        "url": "/media/louvre.jpg",
        "thumbnailUrl": "/media/thumbs/louvre.jpg",
        "date": "2023-05-03T00:00:00.000Z",
        "type": "couple"
      }
    ]
  },
  {
    "id": "memory-uuid-2",
    "type": "travel",
    "title": "Beach Vacation",
    "description": "Relaxing week at the beach",
    "startDate": "2023-07-15T00:00:00.000Z",
    "endDate": "2023-07-22T00:00:00.000Z",
    "location": {
      "latitude": 40.1234,
      "longitude": 3.4567,
      "name": "Costa del Sol, Spain"
    },
    "userId": "user-uuid-2",
    "creatorName": "Jane Doe",
    "coupleId": "couple-uuid",
    "createdAt": "2023-07-25T00:00:00.000Z",
    "updatedAt": "2023-07-25T00:00:00.000Z",
    "images": []
  }
]
```

#### Get memory by ID

```
GET /memories/:memoryId
```

Response:
```json
{
  "id": "memory-uuid-1",
  "type": "travel",
  "title": "Trip to Paris",
  "description": "Our amazing trip to Paris",
  "startDate": "2023-05-01T00:00:00.000Z",
  "endDate": "2023-05-07T00:00:00.000Z",
  "song": "La Vie En Rose",
  "location": {
    "latitude": 48.8566,
    "longitude": 2.3522,
    "name": "Paris, France"
  },
  "userId": "user-uuid-1",
  "creatorName": "John Doe",
  "coupleId": "couple-uuid",
  "createdAt": "2023-06-01T00:00:00.000Z",
  "updatedAt": "2023-06-01T00:00:00.000Z",
  "images": [
    {
      "id": "image-uuid-1",
      "name": "Eiffel Tower",
      "url": "/media/eiffel_tower.jpg",
      "thumbnailUrl": "/media/thumbs/eiffel_tower.jpg",
      "date": "2023-05-02T00:00:00.000Z",
      "type": "landscape"
    },
    {
      "id": "image-uuid-2",
      "name": "Us at Louvre",
      "url": "/media/louvre.jpg",
      "thumbnailUrl": "/media/thumbs/louvre.jpg",
      "date": "2023-05-03T00:00:00.000Z",
      "type": "couple"
    }
  ]
}
```

#### Create memory

```
POST /memories
```

Request body:
```json
{
  "title": "Trip to Paris",
  "description": "Our amazing trip to Paris",
  "type": "travel",
  "startDate": "2023-05-01T00:00:00.000Z",
  "endDate": "2023-05-07T00:00:00.000Z",
  "song": "La Vie En Rose",
  "locationName": "Paris, France",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "imageIds": ["image-uuid-1", "image-uuid-2"]
}
```

Response:
```json
{
  "id": "memory-uuid-1",
  "title": "Trip to Paris",
  "description": "Our amazing trip to Paris",
  "type": "travel",
  "startDate": "2023-05-01T00:00:00.000Z",
  "endDate": "2023-05-07T00:00:00.000Z",
  "song": "La Vie En Rose",
  "userId": "user-uuid-1",
  "creatorName": "John Doe",
  "coupleId": "couple-uuid",
  "createdAt": "2023-06-01T00:00:00.000Z",
  "updatedAt": "2023-06-01T00:00:00.000Z",
  "location": {
    "latitude": 48.8566,
    "longitude": 2.3522,
    "name": "Paris, France"
  },
  "images": [
    {
      "id": "image-uuid-1",
      "name": "Eiffel Tower",
      "url": "/media/eiffel_tower.jpg",
      "thumbnailUrl": "/media/thumbs/eiffel_tower.jpg",
      "date": "2023-05-02T00:00:00.000Z",
      "type": "landscape"
    },
    {
      "id": "image-uuid-2",
      "name": "Us at Louvre",
      "url": "/media/louvre.jpg",
      "thumbnailUrl": "/media/thumbs/louvre.jpg",
      "date": "2023-05-03T00:00:00.000Z",
      "type": "couple"
    }
  ]
}
```

#### Update memory

```
PUT /memories/:memoryId
```

Request body:
```json
{
  "title": "Amazing Trip to Paris",
  "description": "Our unforgettable trip to the city of love",
  "imageIds": ["image-uuid-1", "image-uuid-2", "image-uuid-3"]
}
```

Response:
```json
{
  "id": "memory-uuid-1",
  "title": "Amazing Trip to Paris",
  "description": "Our unforgettable trip to the city of love",
  "type": "travel",
  "startDate": "2023-05-01T00:00:00.000Z",
  "endDate": "2023-05-07T00:00:00.000Z",
  "song": "La Vie En Rose",
  "userId": "user-uuid-1",
  "creatorName": "John Doe",
  "coupleId": "couple-uuid",
  "createdAt": "2023-06-01T00:00:00.000Z",
  "updatedAt": "2023-06-02T00:00:00.000Z",
  "location": {
    "latitude": 48.8566,
    "longitude": 2.3522,
    "name": "Paris, France"
  },
  "images": [
    {
      "id": "image-uuid-1",
      "name": "Eiffel Tower",
      "url": "/media/eiffel_tower.jpg",
      "thumbnailUrl": "/media/thumbs/eiffel_tower.jpg",
      "date": "2023-05-02T00:00:00.000Z",
      "type": "landscape"
    },
    {
      "id": "image-uuid-2",
      "name": "Us at Louvre",
      "url": "/media/louvre.jpg",
      "thumbnailUrl": "/media/thumbs/louvre.jpg",
      "date": "2023-05-03T00:00:00.000Z",
      "type": "couple"
    },
    {
      "id": "image-uuid-3",
      "name": "Seine River",
      "url": "/media/seine.jpg",
      "thumbnailUrl": "/media/thumbs/seine.jpg",
      "date": "2023-05-05T00:00:00.000Z",
      "type": "landscape"
    }
  ]
}
```

#### Delete memory

```
DELETE /memories/:memoryId
```

Response:
```json
{
  "message": "Memory deleted successfully"
}
```

### Images

#### Get images

```
GET /couples/:coupleId/images?type=landscape&startDate=2023-01-01&endDate=2023-12-31
```

Response:
```json
[
  {
    "id": "image-uuid-1",
    "name": "Eiffel Tower",
    "url": "/media/eiffel_tower.jpg",
    "thumbnailUrl": "/media/thumbs/eiffel_tower.jpg",
    "date": "2023-05-02T00:00:00.000Z",
    "type": "landscape",
    "isFavorite": true,
    "memoryId": "memory-uuid-1",
    "userId": "user-uuid-1",
    "uploaderName": "John Doe",
    "coupleId": "couple-uuid",
    "createdAt": "2023-05-10T00:00:00.000Z",
    "location": {
      "latitude": 48.8584,
      "longitude": 2.2945,
      "name": "Eiffel Tower, Paris"
    }
  },
  {
    "id": "image-uuid-2",
    "name": "Us at Louvre",
    "url": "/media/louvre.jpg",
    "thumbnailUrl": "/media/thumbs/louvre.jpg",
    "date": "2023-05-03T00:00:00.000Z",
    "type": "couple",
    "isFavorite": false,
    "memoryId": "memory-uuid-1",
    "userId": "user-uuid-2",
    "uploaderName": "Jane Doe",
    "coupleId": "couple-uuid",
    "createdAt": "2023-05-10T00:00:00.000Z",
    "location": {
      "latitude": 48.8606,
      "longitude": 2.3376,
      "name": "Louvre Museum, Paris"
    }
  }
]
```

#### Get image by ID

```
GET /images/:imageId
```

Response:
```json
{
  "id": "image-uuid-1",
  "name": "Eiffel Tower",
  "url": "/media/eiffel_tower.jpg",
  "thumbnailUrl": "/media/thumbs/eiffel_tower.jpg",
  "date": "2023-05-02T00:00:00.000Z",
  "type": "landscape",
  "isFavorite": true,
  "memoryId": "memory-uuid-1",
  "userId": "user-uuid-1",
  "uploaderName": "John Doe",
  "coupleId": "couple-uuid",
  "createdAt": "2023-05-10T00:00:00.000Z",
  "updatedAt": "2023-05-10T00:00:00.000Z",
  "location": {
    "latitude": 48.8584,
    "longitude": 2.2945,
    "name": "Eiffel Tower, Paris"
  },
  "Memory": {
    "id": "memory-uuid-1",
    "title": "Trip to Paris"
  }
}
```

#### Upload image

```
POST /images/upload
```

Request (multipart/form-data):
```
images: [file1, file2, ...]
name: Vacation photos
type: landscape
memoryId: memory-uuid-1
date: 2023-05-02T00:00:00.000Z
locationName: Paris, France
latitude: 48.8566
longitude: 2.3522
```

Response:
```json
[
  {
    "id": "image-uuid-1",
    "name": "Vacation photos",
    "url": "/media/eiffel_tower.jpg",
    "thumbnailUrl": "/media/thumbs/eiffel_tower.jpg",
    "date": "2023-05-02T00:00:00.000Z",
    "type": "landscape",
    "isFavorite": false,
    "memoryId": "memory-uuid-1",
    "userId": "user-uuid-1",
    "uploaderName": "John Doe",
    "coupleId": "couple-uuid",
    "createdAt": "2023-05-10T00:00:00.000Z",
    "location": {
      "latitude": 48.8566,
      "longitude": 2.3522,
      "name": "Paris, France"
    }
  },
  {
    "id": "image-uuid-2",
    "name": "Vacation photos",
    "url": "/media/notre_dame.jpg",
    "thumbnailUrl": "/media/thumbs/notre_dame.jpg",
    "date": "2023-05-02T00:00:00.000Z",
    "type": "landscape",
    "isFavorite": false,
    "memoryId": "memory-uuid-1",
    "userId": "user-uuid-1",
    "uploaderName": "John Doe",
    "coupleId": "couple-uuid",
    "createdAt": "2023-05-10T00:00:00.000Z",
    "location": {
      "latitude": 48.8566,
      "longitude": 2.3522,
      "name": "Paris, France"
    }
  }
]
```

#### Update image

```
PUT /images/:imageId
```

Request body:
```json
{
  "name": "Beautiful Eiffel Tower",
  "type": "landscape",
  "memoryId": "memory-uuid-2",
  "isFavorite": true,
  "locationName": "Eiffel Tower, Paris",
  "latitude": 48.8584,
  "longitude": 2.2945
}
```

Response:
```json
{
  "id": "image-uuid-1",
  "name": "Beautiful Eiffel Tower",
  "url": "/media/eiffel_tower.jpg",
  "thumbnailUrl": "/media/thumbs/eiffel_tower.jpg",
  "date": "2023-05-02T00:00:00.000Z",
  "type": "landscape",
  "isFavorite": true,
  "memoryId": "memory-uuid-2",
  "userId": "user-uuid-1",
  "uploaderName": "John Doe",
  "coupleId": "couple-uuid",
  "createdAt": "2023-05-10T00:00:00.000Z",
  "updatedAt": "2023-05-11T00:00:00.000Z",
  "location": {
    "latitude": 48.8584,
    "longitude": 2.2945,
    "name": "Eiffel Tower, Paris"
  },
  "Memory": {
    "id": "memory-uuid-2",
    "title": "Another Trip to Paris"
  }
}
```

#### Toggle favorite

```
PUT /images/:imageId/favorite
```

Request body:
```json
{
  "isFavorite": true
}
```

Response:
```json
{
  "id": "image-uuid-1",
  "isFavorite": true
}
```

#### Delete image

```
DELETE /images/:imageId
```

Response:
```json
{
  "message": "Image deleted successfully"
}
```

### Ideas

#### Get ideas

```
GET /couples/:coupleId/ideas?type=travel&completed=false
```

Response:
```json
[
  {
    "id": "idea-uuid-1",
    "title": "Visit Tokyo",
    "description": "Let's go to Tokyo during cherry blossom season",
    "type": "travel",
    "priority": "high",
    "dueDate": "2024-03-15T00:00:00.000Z",
    "completed": false,
    "userId": "user-uuid-1",
    "creatorName": "John Doe",
    "coupleId": "couple-uuid",
    "createdAt": "2023-06-01T00:00:00.000Z",
    "location": {
      "latitude": 35.6762,
      "longitude": 139.6503,
      "name": "Tokyo, Japan"
    }
  },
  {
    "id": "idea-uuid-2",
    "title": "Try that new restaurant",
    "description": "The Italian place downtown everyone's talking about",
    "type": "restaurant",
    "priority": "medium",
    "dueDate": null,
    "completed": false,
    "userId": "user-uuid-2",
    "creatorName": "Jane Doe",
    "coupleId": "couple-uuid",
    "createdAt": "2023-06-05T00:00:00.000Z",
    "location": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "name": "Downtown NYC"
    }
  }
]
```

#### Get idea by ID

```
GET /ideas/:ideaId
```

Response:
```json
{
  "id": "idea-uuid-1",
  "title": "Visit Tokyo",
  "description": "Let's go to Tokyo during cherry blossom season",
  "type": "travel",
  "priority": "high",
  "dueDate": "2024-03-15T00:00:00.000Z",
  "completed": false,
  "userId": "user-uuid-1",
  "creatorName": "John Doe",
  "coupleId": "couple-uuid",
  "createdAt": "2023-06-01T00:00:00.000Z",
  "updatedAt": "2023-06-01T00:00:00.000Z",
  "location": {
    "latitude": 35.6762,
    "longitude": 139.6503,
    "name": "Tokyo, Japan"
  }
}
```

#### Create idea

```
POST /ideas
```

Request body:
```json
{
  "title": "Visit Tokyo",
  "description": "Let's go to Tokyo during cherry blossom season",
  "type": "travel",
  "priority": "high",
  "dueDate": "2024-03-15T00:00:00.000Z",
  "locationName": "Tokyo, Japan",
  "latitude": 35.6762,
  "longitude": 139.6503
}
```

Response:
```json
{
  "id": "idea-uuid-1",
  "title": "Visit Tokyo",
  "description": "Let's go to Tokyo during cherry blossom season",
  "type": "travel",
  "priority": "high",
  "dueDate": "2024-03-15T00:00:00.000Z",
  "completed": false,
  "userId": "user-uuid-1",
  "creatorName": "John Doe",
  "coupleId": "couple-uuid",
  "createdAt": "2023-06-01T00:00:00.000Z",
  "location": {
    "latitude": 35.6762,
    "longitude": 139.6503,
    "name": "Tokyo, Japan"
  }
}
```

#### Update idea

```
PUT /ideas/:ideaId
```

Request body:
```json
{
  "title": "Visit Tokyo during Sakura",
  "priority": "medium",
  "dueDate": "2024-04-01T00:00:00.000Z"
}
```

Response:
```json
{
  "id": "idea-uuid-1",
  "title": "Visit Tokyo during Sakura",
  "description": "Let's go to Tokyo during cherry blossom season",
  "type": "travel",
  "priority": "medium",
  "dueDate": "2024-04-01T00:00:00.000Z",
  "completed": false,
  "userId": "user-uuid-1",
  "creatorName": "John Doe",
  "coupleId": "couple-uuid",
  "createdAt": "2023-06-01T00:00:00.000Z",
  "updatedAt": "2023-06-02T00:00:00.000Z",
  "location": {
    "latitude": 35.6762,
    "longitude": 139.6503,
    "name": "Tokyo, Japan"
  }
}
```

#### Complete idea

```
PUT /ideas/:ideaId/complete
```

Response:
```json
{
  "id": "idea-uuid-1",
  "title": "Visit Tokyo during Sakura",
  "description": "Let's go to Tokyo during cherry blossom season",
  "type": "travel",
  "priority": "medium",
  "dueDate": "2024-04-01T00:00:00.000Z",
  "completed": true,
  "completedAt": "2023-06-03T00:00:00.000Z",
  "completedById": "user-uuid-1",
  "completedByName": "John Doe",
  "userId": "user-uuid-1",
  "creatorName": "John Doe",
  "coupleId": "couple-uuid",
  "createdAt": "2023-06-01T00:00:00.000Z",
  "updatedAt": "2023-06-03T00:00:00.000Z",
  "location": {
    "latitude": 35.6762,
    "longitude": 139.6503,
    "name": "Tokyo, Japan"
  }
}
```

#### Delete idea

```
DELETE /ideas/:ideaId
```

Response:
```json
{
  "message": "Idea deleted successfully"
}
```

### Stats

#### Get couple stats

```
GET /couples/:coupleId/stats
```

Response:
```json
{
  "totalMemories": 15,
  "memoriesByType": {
    "travel": 8,
    "event": 5,
    "simple": 2
  },
  "totalImages": 120,
  "imagesByType": {
    "landscape": 60,
    "singlePerson": 40,
    "couple": 20
  },
  "totalIdeas": 25,
  "completedIdeas": 10,
  "ideasByType": {
    "travel": 12,
    "restaurant": 8,
    "general": 3,
    "challenge": 2
  },
  "locationsVisited": 12,
  "userStats": [
    {
      "userId": "user-uuid-1",
      "name": "John Doe",
      "memoriesCreated": 8,
      "imagesUploaded": 70,
      "ideasCreated": 15,
      "ideasCompleted": 6
    },
    {
      "userId": "user-uuid-2",
      "name": "Jane Doe",
      "memoriesCreated": 7,
      "imagesUploaded": 50,
      "ideasCreated": 10,
      "ideasCompleted": 4
    }
  ]
}
```

## Media Files

Media files are served from `/media` endpoint:

- Original images: `/media/filename.jpg`
- Thumbnails: `/media/thumbs/filename.jpg`

## Error Responses

All errors return a JSON object with a message and optionally an error property:

```json
{
  "message": "Error message description",
  "error": "Detailed error information (in development mode)"
}
```

Common HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
