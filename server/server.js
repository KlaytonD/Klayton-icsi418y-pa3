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
