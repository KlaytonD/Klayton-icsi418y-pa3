import Signup from "./Components/Signup";
import Login from "./Components/Login";
import CreateProject from "./Components/CreateProject";
import ProjectList from "./Components/ProjectList";
import "./App.css";
import { useState } from "react";

function App() {
  const [refreshProjects, setRefreshProjects] = useState(0);

  return (
    <div className="app">
      <div className="top-row">
        <Signup />
        <Login />
      </div>
      <div className = "bottom-row">
        <CreateProject onProjectCreated={() => setRefreshProjects(previous => previous + 1)} />
        <ProjectList refreshProjects={refreshProjects} />
      </div>
    </div>
  );
}

export default App;