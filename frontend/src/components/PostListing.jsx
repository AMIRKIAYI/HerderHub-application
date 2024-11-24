import { useState } from 'react';
import axios from 'axios';
import './PostListing.css'; // Ensure you have your custom CSS for the remove button

function PostListing() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Livestock',
    price: '',
    quantity: '',
    location: '',
    images: [],
    additionalInfo: '',
    sellerName: '',
    sellerEmail: '',
    sellerPhone: '',
    sellerAddress: '', // New field for seller address
    age: '', // Field for livestock age
    sex: ''  // Field for livestock sex
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length < files.length) {
      alert('Some files are not valid image types and have been ignored.');
    }
  
    // Check file size (e.g., max 5MB)
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const validSizeFiles = validFiles.filter(file => file.size <= maxFileSize);
  
    if (validSizeFiles.length < validFiles.length) {
      alert('Some files are too large and have been ignored.');
    }
  
    setFormData({
      ...formData,
      images: [...formData.images, ...validSizeFiles]
    });
  };
  

  // Handle image removal
  const handleRemoveImage = (index) => {
    const updatedImages = formData.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      images: updatedImages
    });
  };

  // Form validation
  const validate = () => {
    const errors = {};
    if (!formData.title) errors.title = 'Title is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.price || isNaN(formData.price)) errors.price = 'Valid price is required';
    if (!formData.location) errors.location = 'Location is required';
    if (!formData.sellerName) errors.sellerName = 'Seller name is required';
    if (!formData.sellerEmail) errors.sellerEmail = 'Seller email is required';
    // Livestock-specific validation
  if (formData.category === 'Livestock') {
    if (!formData.age) errors.age = 'Age is required for livestock';
    if (!formData.sex) errors.sex = 'Sex is required for livestock';
  }
    return errors;
  };

 // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});
  setServerError('');
  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setIsSubmitting(true);

  const formDataToSubmit = new FormData();
  Object.keys(formData).forEach((key) => {
    // Only add age and sex if category is Livestock
    if (formData[key] || (formData.category === 'Livestock' && (key === 'age' || key === 'sex'))) {
        formDataToSubmit.append(key, formData[key]);
    }
  });

  formData.images.forEach((image) => {
    formDataToSubmit.append('images', image);
  });

  try {
    const response = await axios.post('http://localhost:5000/api/post-listing', formDataToSubmit, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.status === 201) {
      alert('Listing posted successfully!');
      
      // Reset formData to clear form fields for new entry
      setFormData({
        title: '',
        description: '',
        category: 'Livestock', // Default category
        price: '',
        quantity: '',
        location: '',
        images: [],
        additionalInfo: '',
        sellerName: '',
        sellerEmail: '',
        sellerPhone: '',
        sellerAddress: '',
        age: '',
        sex: ''
      });
      
      setErrors({});
    }
  } catch (error) {
    console.log(error); // Log the error details to the console
    setServerError('Failed to post listing. Please try again later.');
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <>
      <div className='sector'>
        <h1 className='sector-message'>Post Your Livestock Here!</h1>
      

      
        <div className="sector-form w-4/5 max-w-screen-lg p-8">
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
            <div className="look grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Product Details Section */}
              <div className="col-span-1">
                <label className="block text-sm mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                  className="w-full p-2 border rounded bg-white text-black"
                  placeholder="Listing Title"
                />
                {errors.title && <span className="text-red-500 text-xs">{errors.title}</span>}
              </div>

              <div className="col-span-1">
                <label className="block text-sm mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded bg-white text-black"
                  placeholder="Listing Description"
                />
                {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
              </div>

              <div className="col-span-1">
                <label className="block text-sm mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded bg-white text-black hover:text-gray-400"
                >
                  <option value="Livestock">Livestock</option>
                  <option value="Product">Product</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="block text-sm mb-2">Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded bg-white text-black"
                  placeholder="Price"
                />
                {errors.price && <span className="text-red-500 text-xs">{errors.price}</span>}
              </div>

              <div className="col-span-1">
                <label className="block text-sm mb-2">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-white text-black"
                  placeholder="Quantity"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded bg-white text-black"
                  placeholder="Location"
                />
                {errors.location && <span className="text-red-500 text-xs">{errors.location}</span>}
              </div>

              <div className="col-span-full">
                <textarea
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-2 border rounded bg-white text-black"
                  placeholder="Additional Information (optional)"
                />
              </div>

              {/* Image Upload Section */}
              <div>
              <label className="block text-sm mb-2">Image</label>
                <input
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  className="w-full p-2 border rounded bg-white text-black"
                />
                <div className="image-preview mt-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="image-thumbnail relative">
                      <img src={URL.createObjectURL(image)} alt={`preview-${index}`} />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="remove-image-btn absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        <span className="text-sm">X</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Conditional Fields for Livestock */}
{formData.category === 'Livestock' && (
  <>
    <div className="col-span-1">
      <label className="block text-sm mb-2">Age</label>
      <input
        type="text"
        name="age"
        value={formData.age}
        onChange={handleChange}
        className="w-full p-2 border rounded bg-white text-black"
        placeholder="Age"
      />
      {errors.age && <span className="text-red-500 text-xs">{errors.age}</span>}
    </div>
    <div className="col-span-1">
      <label className="block text-sm mb-2">Sex</label>
      <select
        name="sex"
        value={formData.sex}
        onChange={handleChange}
        className="w-full p-2 border rounded bg-white text-black"
      >
        <option value="">Select</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
      {errors.sex && <span className="text-red-500 text-xs">{errors.sex}</span>}
    </div>
  </>
)}

              
            </div>

            {/* Seller Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="col-span-1">
                <label className="block text-sm mb-2">Seller Name</label>
                <input
                  type="text"
                  name="sellerName"
                  value={formData.sellerName}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded bg-white text-black"
                  placeholder="Your Name"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm mb-2">Seller Email</label>
                <input
                  type="email"
                  name="sellerEmail"
                  value={formData.sellerEmail}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded bg-white text-black"
                  placeholder="Your Email"
                />
                {errors.sellerEmail && <span className="text-red-500 text-xs">{errors.sellerEmail}</span>}
              </div>

              <div className="col-span-1">
                <label className="block text-sm mb-2">Seller Phone</label>
                <input
                  type="text"
                  name="sellerPhone"
                  value={formData.sellerPhone}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-white text-black"
                  placeholder="Your Phone"
                />
              </div>

              <div className="col-span-1">
                <label className="block text-sm mb-2">Seller Address</label>
                <input
                  type="text"
                  name="sellerAddress"
                  value={formData.sellerAddress}
                  onChange={handleChange}
                  className="w-full p-2 border rounded bg-white text-black"
                  placeholder="Your Address"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="explore text-center mt-4">

  <button
    type="submit"
    disabled={isSubmitting}
    className="ml-2 px-4 py-2 text-white newbag rounded"
  >
    {isSubmitting ? 'Submitting...' : 'Post Listing'}
  </button>
</div>

            {/* Error Messages */}
            {serverError && <div className="text-red-500">{serverError}</div>}
          </form>
        </div>
        </div>
    </>
  );
}

export default PostListing;
