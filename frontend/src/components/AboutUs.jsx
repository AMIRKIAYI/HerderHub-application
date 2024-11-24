import './AboutUs.css';

function AboutUs() {
  return (
    <div className="bg-gray-200 min-h-screen flex flex-col items-center">
      {/* Header Section */}
      <header className="text-center py-12 newsect">
        <h1 className="text-6xl font-extrabold text-white mb-4 p-12">About Us</h1>
        <p className="text-2xl font-extrabold text-white max-w-2xl mx-auto">
          Connecting herders with buyers for a seamless livestock trading experience.
        </p>
      </header>

      {/* About HerderHub Section */}
      <section className="max-w-5xl w-full px-6 md:px-12 lg:px-24 py-12">
        <h2 className="text-3xl font-semibold text-brown mb-6">About HerderHub</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          HerderHub is an innovative platform designed to revolutionize the livestock trading experience by connecting herders directly with buyers. Our app provides a user-friendly interface that enables herders to easily post listings for their livestock, showcasing essential details such as breed, age, health status, and price. With advanced search and filtering options, buyers can effortlessly find the animals that meet their specific needs, whether they are looking for cattle, sheep, or goats. This seamless integration of technology and agriculture helps streamline the buying and selling process, reducing the time and effort traditionally associated with livestock transactions.
        </p>
        <p className="text-gray-700 leading-relaxed">
          In addition to facilitating transactions, HerderHub fosters a vibrant community of herders and buyers, promoting trust and collaboration within the livestock industry. The app includes features such as messaging and reviews, allowing users to communicate directly, share experiences, and establish reliable connections. By empowering herders with the tools and resources they need to succeed, HerderHub not only enhances the economic viability of livestock farming but also contributes to sustainable agricultural practices. Whether you are a seasoned herder or a first-time buyer, HerderHub is dedicated to supporting your journey in the livestock marketplace.
        </p>
      </section>

      {/* Mission Section */}
      <section className="max-w-5xl w-full px-6 md:px-12 lg:px-24 py-12">
        <h2 className="text-3xl font-semibold text-brown mb-6">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          At HerderHub, we empower herders by providing a user-friendly platform to post livestock for sale. 
          Our goal is to bridge the gap between herders and buyers, ensuring access to quality animals while 
          fostering a community of trust and support.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Whether you are a herder looking to sell your livestock or a buyer searching for the perfect animal, 
          HerderHub is designed to make the process seamless and efficient.
        </p>
      </section>

      {/* Team Section */}
      <section className="bg-white rounded-lg shadow-lg max-w-6xl w-full p-8 mb-12">
        <h2 className="text-3xl font-semibold text-brown mb-8 text-center">Meet Our Team</h2>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Team Member Example */}
          {teamMembers.map((member, index) => (
            <div key={index} className="flex flex-col items-center text-center p-4 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-300">
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-24 h-24 mb-4 rounded-full object-cover" // Added image tag
              />
              <h3 className="text-lg font-medium text-gray-800">{member.name}</h3>
              <p className="text-gray-500 text-sm">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="text-center py-12 px-6 bg-brown-500 w-full text-black">
        <h2 className="text-3xl font-semibold mb-4 text-brown">Join Our Community</h2>
        <p className="mb-6">
          Be a part of the HerderHub community and connect with other herders and buyers who share your passion for livestock.
        </p>
        <button className="bg-brown text-white font-medium px-8 py-3 rounded-lg hover:bg-brown-200 transition duration-300">
          Get Started
        </button>
      </section>
    </div>
  );
}
const teamMembers = [
  { 
    name: 'Alex Johnson', 
    role: 'Founder & CEO', 
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw7E0UW056eZc5wiNGJs4ZBh_ndipYeGN1ag&s' // Replace with actual image URL
  },
  { 
    name: 'Maria Garcia', 
    role: 'Product Manager', 
    image: 'data:image/jpeg;base64,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' // Replace with actual image URL
  },
  { 
    name: 'John Smith', 
    role: 'Lead Developer', 
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRJu2ducIDK0NgQzdZo7DAyCEw8TsA8liWww&s' // Replace with actual image URL
  },
  { 
    name: 'Lisa Brown', 
    role: 'Marketing Specialist', 
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_8dpmG_EkWjx_cl49hg4iADbFC7Mubb3rAw&s' // Replace with actual image URL
  },
];


export default AboutUs;
