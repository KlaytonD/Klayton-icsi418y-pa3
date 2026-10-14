# Programming Assignment 3

A full stack project management application created for ICSI 418Y using React, Express, Node.js, and MongoDB


## Technologies

- React
- Express
- Node.js
- MongoDB

## Features

- Create a new user
- Prevent duplicate usernames
- Login with existing account
- Validates signup and login information through database
- Create projects with a name, description, status, and project lead
- Display all projects and their project leads
- Automatically add the project lead as a member
- View members of each project
- Add users to projects
- Prevent duplicate project memberships
- Remove members from projects, except the project lead
- Displays success and error messages for user actions

## How To Run

1. Download the GitHub repository
2. Open the project folder in VS Code
3. Open a terminal and move into the server folder
4. Run npm install to install the backend
5. Create a .env file inside the server folder with the MongoDB connection string: MONGO_URI=your-mongodb-connectionstring
6. Run node server.js to start the backend server
7. Open another terminal and move into the client folder
8. Run npm install to install the frontend
9. Run npm run dev to start the React application
10. Open the URL displayed in the terminal usually http://localhost:5173 The backend server runs on http://localhost:9000

## Database

The application uses MongoDB Atlas with three collections:

- users - Stores registered user data
- projects - Stores project information, including the project lead
- memberships - Stores relationships between users and projects using ObjectIds