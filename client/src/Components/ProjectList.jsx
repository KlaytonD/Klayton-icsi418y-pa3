import {useState, useEffect} from 'react';

function ProjectList() {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);

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
    }, []);

    return (
        <div>
            <h2>Projects</h2>

                {projects.map(project => (
                    <div key={project._id}>
                        <h3>{project.name}</h3>
                        <p>{project.description}</p>
                        <p>
                            Status: {project.status}
                        </p>
                        <p>
                            Project Lead: {
                                users.find(user => user._id === project.project_lead_id)?.username || "Unknown"
                            }
                        </p>
                    </div>
                ))}
        </div>
    );
}

export default ProjectList;