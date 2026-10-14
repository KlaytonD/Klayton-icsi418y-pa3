import Signup from "./Components/Signup";
import Login from "./Components/Login";
import CreateProject from "./Components/CreateProject";
import ProjectList from "./Components/ProjectList";
import "./App.css";

function App() {
  return (
    <div className="app">
      <div className="top-row">
        <Signup />
        <Login />
      </div>
      <div className = "bottom-row">
        <CreateProject />
        <ProjectList />
      </div>
    </div>
  );
}

export default App;