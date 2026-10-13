import Signup from "./Components/Signup";
import Login from "./Components/Login";
import CreateProject from "./Components/CreateProject";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Signup />
      <Login />
      <CreateProject />
    </div>
  );
}

export default App;