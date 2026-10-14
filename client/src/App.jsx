import Signup from "./Components/Signup";
import Login from "./Components/Login";
import CreateProject from "./Components/CreateProject";
import ProjectList from "./Components/ProjectList";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Signup />
      <Login />
      <CreateProject />
      <ProjectList />
    </div>
  );
}

export default App;