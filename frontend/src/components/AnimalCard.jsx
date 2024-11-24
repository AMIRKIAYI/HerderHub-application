import './LatestListings.css'
import PropTypes from 'prop-types';

function AnimalCard({ animal }) {
  return (
    <div className="max-w-sm bg-white border border-gray-300 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <img
        className="rounded-t-lg h-48 w-full object-cover"
        src={animal.image}
        alt={animal.name}
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800">{animal.name}</h3>
        <p className="text-gray-600">Breed: {animal.breed}</p>
        <p className="text-gray-600">Age: {animal.age} years</p>
        <p className="text-brown font-bold">Price: ${animal.price}</p>
        <button className="mt-4 px-4 py-2 bg-brown text-white rounded-md hover:bg-brown transition duration-200">
          View Details
        </button>
      </div>
    </div>
  );
}

// PropTypes validation
AnimalCard.propTypes = {
  animal: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    breed: PropTypes.string.isRequired,
    age: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
};

export default AnimalCard;
