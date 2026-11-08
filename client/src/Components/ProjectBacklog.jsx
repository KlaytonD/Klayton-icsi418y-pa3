import { useState, useEffect } from 'react';

function ProjectBacklog({ projectId, storyRefresh, memberRefresh }) {
    const [stories, setStories] = useState([]);
    const [users, setUsers] = useState([]);
    const [editingStory, setEditingStory] = useState(null);

    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editPriority, setEditPriority] = useState('Medium');
    const [editStatus, setEditStatus] = useState('To Do');
    const [editAssignedUserId, setEditAssignedUserId] = useState('');
    const [members, setMembers] = useState(null);

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
    }, [projectId, storyRefresh]);

    useEffect(() => {
        async function fetchMembers() {
            try {
                const response = await fetch(`http://localhost:9000/api/projects/${projectId}/members`);

                if (!response.ok) {
                    throw new Error('Failed to fetch project members');
                }

                const data = await response.json();
                setMembers(data);

            } catch (error) {
                console.error(error);
            }
        }

        fetchMembers();
    }, [projectId, memberRefresh]);

    function handleEdit(story) {
        setEditingStory(story);
        setEditTitle(story.title);
        setEditDescription(story.description);
        setEditPriority(story.priority);
        setEditStatus(story.status);
        setEditAssignedUserId(story.assigned_user_id || "");
    }

    async function handleSave(e) {
        e.preventDefault();
        if (!editingStory) return;

        try {
            const response = await fetch(`http://localhost:9000/api/projects/${projectId}/stories/${editingStory._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    priority: editPriority,
                    status: editStatus,
                    assigned_user_id: editAssignedUserId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }
            alert(data.message);

            setStories((prevStories) =>
                prevStories.map((story) =>
                    story._id === editingStory._id ? { ...story, title: editTitle.trim(), description: editDescription.trim(), priority: editPriority, status: editStatus, assigned_user_id: editAssignedUserId || null } : story
                )
            );
            setEditingStory(null);

        } catch (error) {
            console.error(error);
            alert("Error updating user story");
        }
    }

    async function handleDelete(story) {
        const confirmed = window.confirm("Are you sure you want to delete this user story?");
        
        if (!confirmed) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:9000/api/projects/${projectId}/stories/${story._id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.message);
                return;
            }

            alert(data.message);

            setStories((prevStories) => prevStories.filter((s) => s._id !== story._id));

            setEditingStory(null);
        } catch (error) {
            console.error(error);
            alert("Error deleting user story");
        }
    }

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
                        <button onClick={() => handleEdit(story)}>
                            Edit
                        </button>

                        <button onClick={() => handleDelete(story)}>
                            Delete
                        </button>

                        {editingStory?._id === story._id && (
                            <div>
                                <h4>Edit User Story</h4>

                                <form onSubmit={handleSave}>
                                    <div>
                                        Title:
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        Description:
                                        <textarea
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        Priority:
                                        <select
                                            value={editPriority}
                                            onChange={(e) => setEditPriority(e.target.value)}
                                        >   
                                            <option value="High">High</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Low">Low</option>
                                        </select>
                                    </div>
                                    <div>
                                        Status:
                                        <select
                                            value={editStatus}
                                            onChange={(e) => setEditStatus(e.target.value)}
                                        >
                                            <option value="To Do">To Do</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Done">Done</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label>Assigned Member:</label>
                                        <select
                                            value={editAssignedUserId}
                                            onChange={(e) => setEditAssignedUserId(e.target.value)}
                                        >
                                            <option value="">Unassigned</option>
                                            {members && members.map(member => {
                                                const user = users.find(u => u._id === member.user_id);
                                                return user ? (
                                                    <option key={user._id} value={user._id}>
                                                        {user.username}
                                                    </option>
                                                ) : null;
                                            })}
                                        </select>
                                    </div>
                                    <button type="submit">
                                        Save Changes
                                    </button>
                                    
                                    <button onClick={() => setEditingStory(null)}>
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default ProjectBacklog;