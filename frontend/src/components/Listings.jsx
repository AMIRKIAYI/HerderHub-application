import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";

function Listings() {
  const [filters, setFilters] = useState({
    category: "",
    sex: "",
    age: "",
    location: "",
    title: "", // Added title
  });
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update filters based on URL query params
  useEffect(() => {
    const category = searchParams.get("category") || "";
    const title = searchParams.get("title") || "";
    const sex = searchParams.get("sex") || "";
    const age = searchParams.get("age") || "";
    const location = searchParams.get("location") || "";

    setFilters((prevFilters) => ({
      ...prevFilters,
      category,
      title,
      sex,
      age,
      location,
    }));
  }, [searchParams]);

  // Fetch listings function wrapped with useCallback
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/listings", {
        params: filters, // Send filters as query parameters
      });
      console.log("Fetched Listings:", response.data);
      setListings(response.data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]); // Dependency array ensures it updates when filters change

  // Fetch listings when filters change
  useEffect(() => {
    fetchListings();
  }, [fetchListings]); // Add fetchListings as a dependency

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col md:flex-row p-4 gap-4 relative">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="md:hidden px-4 py-2 bg-[#ff5100] text-white rounded shadow hover:bg-[#ff9c1b]"
        >
          {isFilterOpen ? "Close Filters" : "Sort & Filter"}
        </button>
      </div>

      {/* Filter Sidebar */}
      <div
        className={`${
          isFilterOpen ? "block" : "hidden"
        } md:block w-full md:w-1/4 p-4 bg-gray-100 rounded shadow`}
      >
        <h2 className="text-lg font-semibold mb-4">Search Filters</h2>

        {/* Title Filter */}
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={filters.title}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded mb-4"
          placeholder="Enter title"
        />

        {/* Category Filter */}
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded mb-4 bg-white"
        >
          <option value="">All</option>
          <option value="Livestock">Livestock</option>
          <option value="Product">Product</option>
        </select>

        {/* Sex Filter */}
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

        {/* Age Filter */}
        <label className="block text-sm font-medium mb-1">Age</label>
        <input
          type="text"
          name="age"
          value={filters.age}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded mb-4"
          placeholder="e.g., 1-2 years"
        />

        {/* Location Filter */}
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
          className="w-full p-2 border rounded mb-4"
          placeholder="City or Region"
        />

        {/* Search Button */}
        <button
          onClick={fetchListings}
          className="w-full bg-[#ff5100] text-white py-2 rounded hover:bg-[#ff9c1b]"
        >
          Search
        </button>
      </div>

      {/* Listings Section */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-4">Listings</h2>
        {loading ? (
          <p>Loading...</p>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                to={`/listing/${listing.id}`}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow transform hover:scale-[1.02] flex flex-col"
              >
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
                  <span className="absolute top-2 left-2 bg-[#ff5100] text-white text-xs font-semibold py-1 px-2 rounded">
                    {listing.category}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 flex-grow line-clamp-3">
                    {listing.description || "No description provided."}
                  </p>
                  <div className="mt-auto">
                    <p className="text-md font-medium text-green-600 mb-1">
                      Kshs {listing.price}
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
