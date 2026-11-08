import {useState, useEffect} from 'react';

function CreateStory({projectId, onStoryCreated, memberRefresh}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [assignedUserId, setAssignedUserId] = useState("");
    const [members, setMembers] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        async function fetchMembers() {
            try {
                const membersResponse = await fetch(`http://localhost:9000/api/projects/${projectId}/members`);

                const userResponse = await fetch('http://localhost:9000/api/users');

                if(!membersResponse.ok || !userResponse.ok) {
                    throw new Error('Failed to fetch members or users');
                }

                const membersData = await membersResponse.json();
                const userData = await userResponse.json();

                setMembers(membersData);
                setUsers(userData);
            } catch (error) {
                console.error(error);
            }
        }

        fetchMembers();
    }, [projectId, memberRefresh]);

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const response = await fetch(`http://localhost:9000/api/projects/${projectId}/stories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    description,
                    priority,
                    assigned_user_id: assignedUserId || null
                })
            });
            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }
            alert(data.message);
            onStoryCreated();
            // Reset form fields after successful submission
            setTitle("");
            setDescription("");
            setPriority("Medium");
            setAssignedUserId("");
        } catch (error) {
            console.error('Error creating story:', error);
        }
    }

    return (
        <div>
            <h3>Create User Story</h3>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title: </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter story title"
                    />
                </div>
                <div>
                    <label>Description: </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="As a user, I want..., so that..."
                    />
                </div>
                <div>
                    <label>Priority: </label>
                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
                <div>
                    <label>Assigned Member: </label>
                    <select
                        value={assignedUserId}
                        onChange={(e) => setAssignedUserId(e.target.value)}
                    >
                        <option value="">Unassigned</option>
                        {members.map(member => {
                            const user = users.find((u) => u._id === member.user_id);
                            return user ? (
                                <option key={user._id} value={user._id}>
                                    {user.username}
                                </option>
                            ) : null;
                        })}
                    </select>
                </div>
                <button type="submit">Create Story</button>
            </form>
        </div>
    );
}

export default CreateStory;