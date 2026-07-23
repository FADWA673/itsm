import { Routes, Route } from "react-router-dom";
import "./styles/App.css";

function Home() {
  return <h1>ITSM Platform — Home</h1>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;