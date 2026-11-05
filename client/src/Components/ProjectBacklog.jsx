import { useState, useEffect } from 'react';

function ProjectBacklog({ projectId }) {
    const [stories, setStories] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        async function fetchStories() {
            try {
                const response = await fetch(`http://localhost:9000/api/projects/${projectId}/stories`);

                if (!response.ok) {
                    throw new Error('Failed to fetch user stories');
                }

                const data = await response.json();
                setStories(data);

                const userResponse = await fetch('http://localhost:9000/api/users');
                if (!userResponse.ok) {
                    throw new Error('Failed to fetch users');
                }
                const userData = await userResponse.json();
                setUsers(userData);

            } catch (error) {
                console.error(error);
            }
        }

        fetchStories();
    }, [projectId]);

    return (
        <div>
            <h3>Project Backlog</h3>
            <p>Number of stories: {stories.length}</p>

            {stories.length === 0 ? (
                <p>No user stories yet.</p>
            ) : (
                stories.map(story => (
                    <div key={story._id}>
                        <h4>{story.title}</h4>
                        <p>{story.description}</p>
                        <p>Priority: {story.priority}</p>
                        <p>Status: {story.status}</p>
                        <p>
                            Assigned to: {
                                users.find(user => user._id === story.assigned_user_id)?.username || "Unassigned"
                            }
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}

export default ProjectBacklog;