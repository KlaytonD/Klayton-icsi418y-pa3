import {useState, useEffect} from 'react';

function CreateProject() {
    const [users, setUsers] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState('Planning');
    const [projectLeadId, setProjectLeadId] = useState("");

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch('http://localhost:9000/api/users');
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        }

        fetchUsers();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        try {
            const response = await fetch('http://localhost:9000/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    description,
                    status,
                    project_lead_id: projectLeadId
                })
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error creating project:', error);
        }
    }

    return (
        <div>
            <h2>Create Project</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Project Name:</label>
                    <input type="text" value ={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div>
                    <label>Description:</label>
                    <textarea value ={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div>
                    <label>Status:</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="Planning">Planning</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                    </select>
                </div>

                <div>
                    <label>Project Lead:</label>
                    <select value={projectLeadId} onChange={(e) => setProjectLeadId(e.target.value)}>
                        <option value="">Select a user</option>
                        {users.map(user => (
                            <option key={user._id} value={user._id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </div>
                
            <button type="submit">Create Project</button>
            </form>
        </div>
    );
}

export default CreateProject;