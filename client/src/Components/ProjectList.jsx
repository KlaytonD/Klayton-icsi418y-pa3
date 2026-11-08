import {useState, useEffect} from 'react';
import ProjectMembers from './ProjectMembers';
import CreateStory from './CreateStory';
import ProjectBacklog from './ProjectBacklog';

function ProjectList({refreshProjects, refreshUsers}) {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [storyRefresh, setStoryRefresh] = useState(0);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [memberRefresh, setMemberRefresh] = useState(0);

    useEffect(() => {
        async function fetchProjects() {
            try {
                const response = await fetch('http://localhost:9000/api/projects');
                const data = await response.json();
                const userResponse = await fetch('http://localhost:9000/api/users');
                const userData = await userResponse.json();
                setUsers(userData);
                setProjects(data);
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        }

        fetchProjects();
    }, [refreshProjects, refreshUsers]);

    const selectedProject = projects.find(project => project._id === selectedProjectId);

    return (
        <div>
            <h2>Projects</h2>

            <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
            >
                <option value="">Select a project</option>
                {projects.map(project => (
                    <option key={project._id} value={project._id}>
                        {project.name}
                    </option>
                ))}
            </select>

            {selectedProject && (
                <div>
                    <h3>{selectedProject.name}</h3>

                        <p>{selectedProject.description}</p>
                        <p>
                            Status: {selectedProject.status}
                        </p>
                        <p>
                            Project Lead: {
                                users.find(user => user._id === selectedProject.project_lead_id)?.username || "Unknown"
                            }
                        </p>
                        <ProjectMembers 
                            projectId={selectedProject._id}
                            projectLeadId={selectedProject.project_lead_id}
                            refreshUsers={refreshUsers}
                            onMembersChange={() => setMemberRefresh((prev) => prev + 1)}
                        />
                        <CreateStory projectId={selectedProject._id} onStoryCreated={() => setStoryRefresh((prev) => prev + 1)} memberRefresh={memberRefresh} />
                        <ProjectBacklog projectId={selectedProject._id} storyRefresh={storyRefresh} memberRefresh={memberRefresh} />
                    </div>
                )}
        </div>
    );
}

export default ProjectList;