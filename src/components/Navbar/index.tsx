import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="text-white font-bold text-lg">
            TLLCC Worship Schedule
          </div>

          {/* Navigation Links */}
          <ul className="flex space-x-4">
            <li>
              <Link to='/' className="text-white hover:text-gray-300">
                Home
              </Link>
            </li>
            <li>
              <a href="#" className="text-white hover:text-gray-300">
                About
              </a>
            </li>
            <li>
              <Link to='/Leaders' className="text-white hover:text-gray-300">
                Leaders
              </Link>
            </li>
            <li>
              <a href="#" className="text-white hover:text-gray-300">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
