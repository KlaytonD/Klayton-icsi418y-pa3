import {useState, useEffect} from 'react';

function ProjectMembers({projectId}) {
    const [members, setMembers] = useState([]);
    const [users, setUsers] = useState([]);

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

    return (
        <div>
            <h3>Project Members</h3>

                {members.map((member) => (
                    <p 
                        key={member._id}>{users.find((user) => user._id === member.user_id)?.username || "Unknown"}
                    </p>
                ))}
        </div>
    );
}

export default ProjectMembers;