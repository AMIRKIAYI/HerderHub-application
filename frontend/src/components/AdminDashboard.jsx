import { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const AdminDashboard = () => {
  const [listings, setListings] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get('/api/admin/listings');
        setListings(response.data);
      } catch (error) {
        console.error('Error fetching listings', error);
      }
    };

    fetchListings();
  }, []);

  const handleEdit = (id) => {
    history.push(`/admin/edit/${id}`);
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Price</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => (
            <tr key={listing._id}>
              <td>{listing.title}</td>
              <td>{listing.category}</td>
              <td>{listing.price}</td>
              <td>{listing.location}</td>
              <td>
                <button onClick={() => handleEdit(listing._id)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
