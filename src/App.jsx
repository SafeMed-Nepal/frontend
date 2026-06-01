import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RemedyDetail from './pages/RemedyDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/remedy/:id" element={<RemedyDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;