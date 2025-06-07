import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Fuse from 'fuse.js';

const SearchInput = ({ searchTerm, onSearchChange, listingsData }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [siteResults, setSiteResults] = useState([]);

  // Static site index (pages that exist in your app)
  const staticSiteIndex = [
    { 
      id: 'home', 
      title: 'Home', 
      description: 'Go to homepage', 
      url: '/', 
      type: 'Page' 
    },
    { 
      id: 'about', 
      title: 'About Us', 
      description: 'Learn about our company', 
      url: '/about', 
      type: 'Page' 
    },
    { 
      id: 'help', 
      title: 'Help Center', 
      description: 'Get support', 
      url: '/help', 
      type: 'Page' 
    },
  ];

  // Combine static pages with dynamic listings
  const fullSiteIndex = [
    ...staticSiteIndex,
    ...(listingsData?.map(item => ({
      id: item.id,
      title: item.title,
      description: item.category,
      url: `/listings/${item.id}`,
      type: 'Listing'
    })) || [])
  ];

  // Initialize fuzzy search
  const fuse = new Fuse(fullSiteIndex, {
    keys: ['title', 'description'],
    includeScore: true,
    threshold: 0.4,
    minMatchCharLength: 2
  });

  useEffect(() => {
    if (searchTerm.length > 1) {
      const results = fuse.search(searchTerm);
      setSiteResults(results.map(r => r.item));
    } else {
      setSiteResults([]);
    }
  }, [searchTerm, location.pathname]); // Re-run when search term or route changes

  const handleResultClick = (item) => {
    navigate(item.url);
    onSearchChange({ target: { value: '' } }); // Clear search
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search anything..."
        value={searchTerm}
        onChange={onSearchChange}
        className="search-input w-full max-w-xs px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
      />
      {searchTerm && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {siteResults.length > 0 ? (
            <ul>
              {siteResults.map((result) => (
                <li
                  key={result.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="font-medium text-gray-800 flex justify-between">
                    <span>{result.title}</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {result.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">{result.description}</div>
                </li>
              ))}
            </ul>
          ) : searchTerm.length > 1 ? (
            <div className="px-4 py-2 text-gray-500">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

SearchInput.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  listingsData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
    })
  ),
};

export default SearchInput;