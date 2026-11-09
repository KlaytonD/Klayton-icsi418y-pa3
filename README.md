# Programming Assignment 4

A full stack project management application created for ICSI 418Y using React, Express, Node.js, and MongoDB. This application builds on Programming Assignment 3 by adding user stories and a project backlog


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
- Create user stories with a title, description, priority, and assigned member
- Automatically set new user stories to To Do
- View the backlog for a selected project
- Edit user stories, including their status and assigned member
- Delete user stories with confirmation
- Assign stories only to members of the selected project
- Prevent removing members who have assigned user stories
- Update backlog after creating, editing, or deleting stories
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
- stories - Stores user stories, including their title, description, priority, status, project and assigned member

Each user story stores a project_id referencing its project and an assigned_user_id referencing a user or null if unassigned.

## Test Data

To test the application

1. Create at least three registered users.
2. Create at least two projects with different project leads.
3. Add at least one non-lead member to a project
4. Create at least five user stories across the two projects
5. Include High, Medium, and Low priorities
6. Edit stories to include To Do, In Progress, and Done statuses
7. Include both assigned and unassigned stories
8. Verify that stories can only be assigned to members of their project
9. Verify that members with assigned stories cannot be removed until their stories are reassigned, unassigned, or deleted
10. Refresh the application to verify that changes are saved in the MongoDB database.
