import {useState, useEffect} from 'react';

function CreateProject() {
    const [users, setUsers] = useState([]);

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

    return (
        <div>
            <h2>Create Project</h2>
            <label>Project Lead:</label>
            <select>
                <option value="">Select a user</option>
                {users.map(user => (
                    <option key={user._id} value={user._id}>
                        {user.username}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default CreateProject;