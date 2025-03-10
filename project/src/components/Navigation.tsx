import { Link } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="mb-8">
      <ul className="flex space-x-4">
        <li>
          <Link to="/" className="text-purple-600 hover:text-purple-800">
            New Prediction
          </Link>
        </li>
        <li>
          <Link to="/history" className="text-purple-600 hover:text-purple-800">
            History
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navigation; 