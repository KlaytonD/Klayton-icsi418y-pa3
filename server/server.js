require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb")
const client = new MongoClient(process.env.MONGO_URI);

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.json({
        message: "Server is running"
    });
});
app.get("/api/users", async (req, res) => {
    const db = client.db("pa2");
    const users = db.collection("users");
    try {
        const allUsers = await users.find({}, {
            projection: { password: 0 } // Exclude the password field from the results
        }).toArray();

        res.status(200).json(allUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.post("/api/projects", async (req, res) => {
    const { name, description, status, project_lead_id } = req.body;

    if (!name || !description || !status || !project_lead_id) {
        return res.status(400).json({
            message: "Required information is missing"
        });
    }
    if (!["Planning", "Active", "Completed"].includes(status)) {
        return res.status(400).json({
            message: "Invalid project status"
        });
    }
    const db = client.db("pa2");
    const users = db.collection("users");
    const projects = db.collection("projects");
    const memberships = db.collection("memberships");

    if (!ObjectId.isValid(project_lead_id)) {
        return res.status(400).json({
            message: "Invalid project lead ID"
        });
    }
    try {
        const leadId = new ObjectId(project_lead_id);

        const existingUser = await users.findOne({ _id: leadId });

        if (!existingUser) {
            return res.status(404).json({
                message: "Project lead does not exist"
            });
        }
        
        const result = await projects.insertOne({
            name,
            description,
            status,
            project_lead_id: leadId
        });

        const projectId = result.insertedId;

        await memberships.insertOne({
            project_id: projectId,
            user_id: leadId
        });

        res.status(201).json({
            message: "Project created successfully",
        });

    }catch (error) {

        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
        
    }
});

app.get("/api/projects", async (req, res) => {
    const db = client.db("pa2");
    const projects = db.collection("projects");

    try {
        const allProjects = await projects.find({}).toArray();
        res.status(200).json(allProjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.get("/api/projects/:projectId/members", async (req, res) => {
    const { projectId } = req.params;
    const db = client.db("pa2");
    const memberships = db.collection("memberships");
    const projects = db.collection("projects");

    if (!ObjectId.isValid(projectId)) {
        return res.status(400).json({
            message: "Invalid project ID"
        });
    }

    try {
        const id = new ObjectId(projectId);
        const existingProject = await projects.findOne({ _id: id });

        if (!existingProject) {
            return res.status(404).json({
                message: "Project does not exist"
            });
        }

        const allMembers = await memberships.find({ project_id: id }).toArray();
        res.status(200).json(allMembers);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.post("/api/projects/:projectId/members", async (req, res) => {
    const { projectId } = req.params;
    const { user_id } = req.body;

    const db = client.db("pa2");
    const projects = db.collection("projects");
    const users = db.collection("users");
    const memberships = db.collection("memberships");

    if (!ObjectId.isValid(projectId) || !ObjectId.isValid(user_id)) {
        return res.status(400).json({
            message: "Invalid project ID or user ID"
        });
    }
    try {
        const id = new ObjectId(projectId);
        const userId = new ObjectId(user_id);

        const existingProject = await projects.findOne({ _id: id });
        if (!existingProject) {
            return res.status(404).json({
                message: "Project does not exist"
            });
        }

        const existingUser = await users.findOne({ _id: userId });
        if (!existingUser) {
            return res.status(404).json({
                message: "User does not exist"
            });
        }
        const existingMembership = await memberships.findOne({ project_id: id, user_id: userId });
        if (existingMembership) {
            return res.status(409).json({
                message: "User is already a member of this project"
            });
        }
        await memberships.insertOne({
            project_id: id,
            user_id: userId
        });
        res.status(201).json({
            message: "Member added successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.delete("/api/projects/:projectId/members/:userId", async (req, res) => {
    const { projectId, userId } = req.params;
    const db = client.db("pa2");
    const users = db.collection("users");
    const memberships = db.collection("memberships");
    const projects = db.collection("projects");

    if (!ObjectId.isValid(projectId) || !ObjectId.isValid(userId)) {
        return res.status(400).json({
            message: "Invalid project ID or user ID"
        });
    }
    try {
        const id = new ObjectId(projectId);
        const memberId = new ObjectId(userId);

        const existingProject = await projects.findOne({ _id: id });
        if (!existingProject) {
            return res.status(404).json({
                message: "Project does not exist"
            });
        }
        if (existingProject.project_lead_id.equals(memberId)) {
            return res.status(403).json({
                message: "Cannot remove the project lead"
            });
        }
        const result = await memberships.deleteOne({ project_id: id, user_id: memberId });
        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "Member not found in the project"
            });
        }
        res.status(200).json({
            message: "Member removed successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.post("/api/projects/:projectId/stories", async (req, res) => {
    const { projectId } = req.params;
    const {title, description, priority, assigned_user_id} = req.body;

    const db = client.db("pa2");
    const projects = db.collection("projects");
    const users = db.collection("users");
    const memberships = db.collection("memberships");
    const stories = db.collection("stories");
    // Validate projectID
    if(!ObjectId.isValid(projectId)) {
        return res.status(400).json({
            message: "Invalid project ID"
        });
    }
    // Validate required information
    if(typeof title !== 'string' || !title.trim() || typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({
            message: "Title and description are required"
        });
    }
    if(!["High", "Medium", "Low"].includes(priority)) {
        return res.status(400).json({
            message: "Invalid priority value"
        });
    }

    try{
        const id = new ObjectId(projectId);
        const existingProject = await projects.findOne({_id: id});
        if(!existingProject) {
            return res.status(404).json({
                message: "Project does not exist"
            });
        }

        let assignedUserId = null;
        if (assigned_user_id !== null && assigned_user_id !== undefined && assigned_user_id !== "") {
            if (typeof assigned_user_id !== 'string' || !ObjectId.isValid(assigned_user_id)) {
                return res.status(400).json({
                    message: "Invalid assigned user ID"
                });
            }
            

            assignedUserId = new ObjectId(assigned_user_id);
            const existingUser = await users.findOne({_id: assignedUserId});
            if(!existingUser) {
                return res.status(404).json({
                    message: "Assigned user does not exist"
                });
            }

            const existingMembership = await memberships.findOne({project_id: id, user_id: assignedUserId});
            if(!existingMembership) {
                return res.status(403).json({
                    message: "Assigned user is not a member of the project"
                });
            }
        }   

        const result = await stories.insertOne({
            project_id: id,
            title: title.trim(),
            description: description.trim(),
            priority,
            status: "To Do",
            assigned_user_id: assignedUserId
        });
        res.status(201).json({
            message: "User Story created successfully",
            storyId: result.insertedId
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });

    }
});

app.get("/api/projects/:projectId/stories", async (req, res) => {
    const { projectId } = req.params;
    const db = client.db("pa2");
    const projects = db.collection("projects");
    const stories = db.collection("stories");

    if(!ObjectId.isValid(projectId)) {
        return res.status(400).json({
            message: "Invalid project ID"
        });
    }
    try {
        const id = new ObjectId(projectId);
        const existingProject = await projects.findOne({_id: id});
        if(!existingProject) {
            return res.status(404).json({
                message: "Project does not exist"
            });
        }
        const allStories = await stories.find({project_id: id}).toArray();

        res.status(200).json(allStories);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.put("/api/projects/:projectId/stories/:storyId", async (req, res) => {
    const { projectId, storyId } = req.params;
    const { title, description, priority, status, assigned_user_id } = req.body;

    const db = client.db("pa2");
    const projects = db.collection("projects");
    const stories = db.collection("stories");
    const users = db.collection("users");
    const memberships = db.collection("memberships");

    if (!ObjectId.isValid(projectId) || !ObjectId.isValid(storyId)) {
        return res.status(400).json({
            message: "Invalid project ID or story ID"
        });
    }

    if (typeof title !== 'string' || !title.trim() || typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({
            message: "Title and description are required"
        });
    }

    if (!["High", "Medium", "Low"].includes(priority)) {
        return res.status(400).json({
            message: "Invalid priority value"
        });
    }
    if (!["To Do", "In Progress", "Done"].includes(status)) {
        return res.status(400).json({
            message: "Invalid status value"
        });
    }

    try {
        const id = new ObjectId(projectId);
        const storyIdObj = new ObjectId(storyId);

        const existingProject = await projects.findOne({ _id: id });
        if (!existingProject) {
            return res.status(404).json({
                message: "Project does not exist"
            });
        }

        const existingStory = await stories.findOne({ _id: storyIdObj, project_id: id });
        if (!existingStory) {
            return res.status(404).json({
                message: "User story does not exist in this project"
            });
        }
        let assignedUserId = null;
        if (assigned_user_id !== null && assigned_user_id !== undefined && assigned_user_id !== "") {
            if (typeof assigned_user_id !== 'string' || !ObjectId.isValid(assigned_user_id)) {
                return res.status(400).json({
                    message: "Invalid assigned user ID"
                });
            }
            assignedUserId = new ObjectId(assigned_user_id);

            const existingUser = await users.findOne({ _id: assignedUserId });
            if (!existingUser) {
                return res.status(404).json({
                    message: "Assigned user does not exist"
                });
            }
            const existingMembership = await memberships.findOne({ project_id: id, user_id: assignedUserId });
            if (!existingMembership) {
                return res.status(403).json({
                    message: "Assigned user is not a member of the project"
                });
            }
        }
        const result = await stories.updateOne(
        { _id: storyIdObj, project_id: id },
        {
            $set: {
                title: title.trim(),
                description: description.trim(),
                priority,
                status,
                assigned_user_id: assignedUserId
            }
        }
    );
    if (result.matchedCount === 0) {
        return res.status(404).json({
            message: "User story not found"
        });
    }
    res.status(200).json({
        message: "User story updated successfully"
    });
    }   
    catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Internal server error"
            });
    }
    
});
app.post("/signup", async (req, res) => {
    const { f_name, l_name, username, password } = req.body;

    if (!f_name || !l_name || !username || !password) {
        return res.status(400).json({
            message: "Required information is missing"
        });
    }

    const db = client.db("pa2");
    const users = db.collection("users");

    console.log("Signup data received:", f_name, l_name, username);

    // Check if user already exists
    try {
        const existingUser = await users.findOne({ username });
        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists"
            });
        }

        // Insert new user
        await users.insertOne({
            f_name,
            l_name,
            username,
            password
        });
        res.status(201).json({
            message: "Signup successful"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    const db = client.db("pa2");
    const users = db.collection("users");

    try {
        const user = await users.findOne({ username });
        if(!user) {
            return res.status(401).json({
                message: "Username does not exist"
            });
        }
        if (user.password !== password) {
            return res.status(401).json({
                message: "Incorrect password"
            });
        }
        res.status(200).json({
            message: "Login successful"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

app.listen(9000, () => {
    console.log("Server running on port 9000");
});

async function connectDatabase() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Could not connect to MongoDB");
        console.error(error);
    }
}
connectDatabase();
