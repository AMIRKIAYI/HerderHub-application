import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const SearchInput = ({ searchTerm, filteredResults, onSearchChange }) => {
  const navigate = useNavigate();

  const handleResultClick = (item) => {
    navigate(`/listings/${item.id}`);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search listings..."
        value={searchTerm}
        onChange={onSearchChange}
        className="search-input w-full max-w-xs px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
      />
      {searchTerm && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredResults.length > 0 ? (
            <ul>
              {filteredResults.map((result) => (
                <li
                  key={result.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="font-medium text-gray-800">{result.title}</div>
                  <div className="text-sm text-gray-500 capitalize">{result.category}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-2 text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

SearchInput.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  filteredResults: PropTypes.array.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};

export default SearchInput;