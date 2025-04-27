import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Meeting from "./pages/Meeting";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/meeting/:meetingId" element={<Meeting />} />
      </Routes>
    </Router>
  );
}

export default App;
