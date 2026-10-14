import {useState, useEffect} from 'react';

function ProjectMembers({projectId}) {
    const [members, setMembers] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectUserID, setSelectUserID] = useState("");

    useEffect(() => {
        async function fetchMembers() {
            try {  
                const response = await fetch(`http://localhost:9000/api/projects/${projectId}/members`);
                const data = await response.json();
                const userResponse = await fetch('http://localhost:9000/api/users');
                const userData = await userResponse.json();
                setUsers(userData);
                setMembers(data);
            } catch (error) {
                console.error("Error fetching project members:", error);
            }
        }

        fetchMembers();
    }, [projectId]);

    async function handleAddMember(event) {
        event.preventDefault();
        if (!selectUserID) {
            alert("Please select a user to add.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:9000/api/projects/${projectId}/members`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: selectUserID })
            });
            const data = await response.json();
            
            if (response.ok) {
                const memberResponse = await fetch(`http://localhost:9000/api/projects/${projectId}/members`);
                const updatedMembers = await memberResponse.json();
                setMembers(updatedMembers);
                setSelectUserID("");
                alert("Member added successfully!");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error adding member:", error);
        }
    }
    return (
        <div>
            <h3>Project Members</h3>

                {members.map((member) => (
                    <p 
                        key={member._id}>{users.find((user) => user._id === member.user_id)?.username || "Unknown"}
                    </p>
                ))}
            <form onSubmit={handleAddMember}>
                <select value={selectUserID} onChange={(e) => setSelectUserID(e.target.value)}>
                    <option value="">Select a user</option>

                    {users.map(user => (
                        <option key={user._id} value={user._id}>
                            {user.username}
                        </option>
                    ))}
                </select>
                <button type="submit">Add Member</button>
            </form>
        </div>
    );
}

export default ProjectMembers;