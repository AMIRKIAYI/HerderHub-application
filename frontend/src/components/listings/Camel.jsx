import { useState, useEffect, useSearchParams } from "react";
import axios from "axios";
import { Link } from "react-router-dom"; // Import Link for navigation

function Listings() {
  const [filters, setFilters] = useState({
    category: "",
    sex: "",
    age: "",
    location: "",
  });
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Update filters based on query params from URL
    const category = searchParams.get("category") || "";
    const subCategory = searchParams.get("subCategory") || "";
    setFilters((prevFilters) => ({
      ...prevFilters,
      category,
      subCategory,
    }));
  }, [searchParams]);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Fetch listings from backend
  const fetchListings = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/listings", {
        params: filters, // Send filters as query params
      });
      setListings(response.data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch listings when filters change
  useEffect(() => {
    fetchListings();
  }, [filters]);

  return (
    <div className="flex flex-col md:flex-row p-4 gap-4 relative">
      {/* Sort & Filter Button (Visible on small screens) */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="md:hidden px-4 py-2 bg-[#ff5100] text-white rounded shadow hover:bg-[#ff9c1b]"
        >
          {isFilterOpen ? "Close Filters" : "Sort & Filter"}
        </button>
      </div>

      {/* Filters Sidebar */}
      <div
        className={`${
          isFilterOpen ? "block" : "hidden"
        } md:block w-full md:w-1/4 p-4 bg-gray-100 rounded shadow`}
      >
        <h2 className="text-lg font-semibold mb-4">Search Filters</h2>

        {/* Filters */}
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded mb-4 bg-white "
        >
          <option value="">All</option>
          <option value="Livestock">Livestock</option>
          <option value="Product">Product</option>
        </select>

        <label className="block text-sm font-medium mb-1">Sex</label>
        <select
          name="sex"
          value={filters.sex}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded mb-4 bg-white"
        >
          <option value="">All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <label className="block text-sm font-medium mb-1">Age</label>
        <input
          type="text"
          name="age"
          value={filters.age}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded mb-4"
          placeholder="e.g., 1-2 years"
        />

        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded mb-4"
          placeholder="City or Region"
        />

        <button
          onClick={fetchListings}
          className="w-full bg-[#ff5100] text-white py-2 rounded hover:bg-[#ff9c1b]"
        >
          Search
        </button>
      </div>

      {/* Listings Content */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-4">Listings</h2>
        {loading ? (
          <p>Loading...</p>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                to={`/listing/${listing.id}`} // Use Link to navigate to individual listing page
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow transform hover:scale-[1.02] flex flex-col"
              >
                {/* Listing Image */}
                <div className="relative h-48">
                  <img
                    src={
                      listing.images && listing.images.length > 0
                        ? `http://localhost:5000/uploads/${listing.images[0]}`
                        : "https://via.placeholder.com/300"
                    }
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Badge for Category */}
                  <span className="absolute top-2 left-2 bg-[#ff5100] text-white text-xs font-semibold py-1 px-2 rounded">
                    {listing.category}
                  </span>
                </div>

                {/* Listing Details */}
                <div className="p-4 flex flex-col flex-1">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {listing.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-2 flex-grow line-clamp-3">
                    {listing.description || "No description provided."}
                  </p>

                  {/* Price and Location */}
                  <div className="mt-auto">
                    <p className="text-md font-medium text-green-600 mb-1">
                      ${listing.price}
                    </p>
                    <p className="text-sm text-gray-500">
                      <i className="fas fa-map-marker-alt mr-1"></i>
                      {listing.location || "Location not specified"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p>No listings found.</p>
        )}
      </div>
    </div>
  );
}

export default Listings;
