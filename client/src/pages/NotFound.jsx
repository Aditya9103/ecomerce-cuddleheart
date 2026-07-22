import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center font-body bg-gray-50 text-center px-4">
      <div className="bg-white p-10 md:p-16 rounded-3xl shadow-sm border border-gray-100 max-w-lg w-full">
        <h1 className="text-8xl font-black text-primary mb-4 font-heading drop-shadow-sm">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Oops! The cuddly companion or page you are looking for seems to have wandered off.
        </p>
        <Link 
          to="/" 
          className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 w-full sm:w-auto"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
