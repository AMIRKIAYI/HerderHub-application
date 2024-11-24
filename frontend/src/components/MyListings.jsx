

const MyListings = () => {
  const listings = [
    { id: 1, title: 'Vintage Chair', price: '$120', status: 'Active' },
    { id: 2, title: 'Desk Lamp', price: '$40', status: 'Sold' },
    { id: 3, title: 'Mountain Bike', price: '$300', status: 'Active' },
  ];

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-brown mb-4">Listings</h1>
      <p className="text-gray-700">Manage and view your active and sold listings.</p>

      {/* Listings Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-gray-800 font-semibold">Title</th>
              <th className="px-4 py-2 text-left text-gray-800 font-semibold">Price</th>
              <th className="px-4 py-2 text-left text-gray-800 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="border-t hover:bg-gray-50 transition duration-200">
                <td className="px-4 py-2">{listing.title}</td>
                <td className="px-4 py-2">{listing.price}</td>
                <td className="px-4 py-2">{listing.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyListings;
