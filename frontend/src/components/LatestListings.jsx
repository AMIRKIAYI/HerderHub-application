import AnimalCard from './AnimalCard';

function LatestListings() {
  // Sample data for cow listings
  const animals = [
    {
      id: 1,
      name: 'Bessie',
      breed: 'Holstein',
      age: 3,
      price: 1500,
      image: 'https://img.freepik.com/premium-photo/mountain-goats-grazing-carpathian-mountains-romania-happy-goat-runs-steep-rock_333900-24782.jpg?ga=GA1.1.1776042718.1729511895&semt=ais_hybrid', // Replace with actual cow images
    },
    {
      id: 2,
      name: 'Maggie',
      breed: 'Jersey',
      age: 2,
      price: 1200,
      image: 'https://img.freepik.com/premium-photo/dairy-cows-field-farm-australia-beautiful-cow-close-up-agriculture-farming-land_866797-9580.jpg?ga=GA1.1.1776042718.1729511895&semt=ais_hybrid', // Replace with actual cow images
    },
    {
      id: 3,
      name: 'Daisy',
      breed: 'Angus',
      age: 1,
      price: 900,
      image: 'https://img.freepik.com/free-photo/closeup-shot-black-brown-jersey-calves-farmland_181624-45068.jpg?ga=GA1.1.1776042718.1729511895&semt=ais_hybrid', // Replace with actual cow images
    },
  ];

  return (
    <div className="p-4 md:p-8 lg:p-20 bg-gray-50"> {/* Responsive padding */}
      <h2 className="text-2xl font-bold text-center text-brown-600 mb-6 p-8">Latest Listings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"> {/* Responsive grid layout */}
        {animals.map((animal) => (
          <AnimalCard key={animal.id} animal={animal} />
        ))}
      </div>
      <div className="text-center mt-8">
        <button className="bg-brown text-white py-2 px-4 rounded-lg hover:bg-brown-700 transition duration-300">
          View More
        </button>
      </div>
    </div>
  );
}

export default LatestListings;
