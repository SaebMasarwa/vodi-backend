# Vodi API

## Overview

The Vodi API provides endpoints for managing users and movies. Below are the main functionalities:

- **User Authentication**: Endpoints for user registration, login, and token verification.
- **Movies Management**: Endpoints for creating, updating, deleting, and retrieving movies.
- **User Management**: Endpoints for managing user roles and permissions.
- **Search**: Endpoints for searching movies by various criteria.

## Features

- **User Authentication**: Secure login and registration system.
- **Movie Management**: Create, edit, and delete business cards.

## Technologies Used

- **JWT**: JSON Web Tokens for secure authentication.
- **Node.js**: Backend runtime environment.
- **Express**: Web framework for Node.js.
- **MongoDB**: NoSQL database for storing card data.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/SaebMasarwa/vodi-backend.git
   ```
2. Navigate to the project directory:
   ```sh
   cd vodi-backend
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Start the server in dev mode:
   ```sh
   npm run start:dev
   ```
5. Start the server in production mode:
   ```sh
   npm run start:prod
   ```

## Usage

After starting the server, you can access the API at `http://localhost:8000`. Use tools like Postman to interact with the endpoints.

## Endpoints

### User Authentication

- `POST /users`: Register a new user.
- `POST /users/login`: Login a user.

### Card Management

- `POST /movies`: Create a new movie.
- `GET /movies`: Retrieve all movies.
- `GET /movies/my-movies`: Retrieve all logged in user movies.
- `GET /movies/:id`: Retrieve a specific movie.
- `PUT /movies/:id`: Update a business movie details.
- `PATCH /movies/:id`: Update a movie like status for logged in user.
- `DELETE /movies/:id`: Delete a movie.

### User Management

- `GET /users/`: Retrieve all users.
- `GET /users/:id`: Retrieve a specific user.
- `PUT /users/:id`: Update a user details.
- `DELETE /users/:id`: Delete a user.
