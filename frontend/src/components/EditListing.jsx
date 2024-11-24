import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useHistory } from 'react-router-dom';

const EditListing = () => {
  const [listing, setListing] = useState({});
  const [formData, setFormData] = useState({});
  const { id } = useParams();
  const history = useHistory();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await axios.get(`/api/admin/listings/${id}`);
        setListing(response.data);
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching listing details', error);
      }
    };

    fetchListing();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/listings/${id}`, formData);
      history.push('/admin');
    } catch (error) {
      console.error('Error updating listing', error);
    }
  };

  return (
    <div>
      <h1>Edit Listing</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          placeholder="Title"
        />
        <input
          type="number"
          name="price"
          value={formData.price || ''}
          onChange={handleChange}
          placeholder="Price"
        />
        <input
          type="text"
          name="category"
          value={formData.category || ''}
          onChange={handleChange}
          placeholder="Category"
        />
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          placeholder="Description"
        />
        <button type="submit">Update Listing</button>
      </form>
    </div>
  );
};

export default EditListing;
