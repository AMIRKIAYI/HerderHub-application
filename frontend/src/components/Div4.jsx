import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteLeft, faUser } from '@fortawesome/free-solid-svg-icons';
import './Div4.css';

function Div4() {
  return (
    <div className="div4 p-4 md:p-8 lg:p-20"> {/* Responsive padding */}
      <h2 className="text-center text-2xl font-bold mb-6">Users Comments</h2> {/* Centered heading */}

      <div className="flex flex-col md:flex-row justify-between items-start gap-8 p-4 bg-white rounded-lg shadow-lg"> {/* Adjusted padding */}
        
        {/* Left Paragraph */}
        <div className="flex flex-col items-start text-left w-full md:w-1/2 space-y-4">
          <div className="flex items-center space-x-2 text-brown">
            <FontAwesomeIcon icon={faQuoteLeft} className="text-2xl" />
            <h3 className="text-lg font-semibold">What our farmers have to say</h3>
          </div>
          <p className="text-gray-700 text-sm md:text-base">
            I have used the SellMyLivestock website for selling hay, haylage and sheep. I have always had an excellent response. 
            It is an easy website to use, and I have uploaded a variety of photos, and easily updated them. I think it is now 
            the go-to website for farmers.
          </p>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faUser} className="text-gray-500" />
            <span className="text-brown-800 font-semibold">Tango F - Yorkshire</span>
          </div>
        </div>
        
        {/* Right Paragraph */}
        <div className="flex flex-col items-start text-left w-full md:w-1/2 space-y-4">
          <div className="flex items-center space-x-2 text-brown">
            <FontAwesomeIcon icon={faQuoteLeft} className="text-2xl" />
            <h3 className="text-lg font-semibold">Another satisfied farmer</h3>
          </div>
          <p className="text-gray-700 text-sm md:text-base">
            I was able to create my listing in minutes. The trickiest thing was getting the sheep to pose for the photos! 
            I received a text when a message had come through about my stock, which meant I could reply ASAP. When the 
            purchaser was happy & agreed to buy I simply clicked the sold box.
          </p>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faUser} className="text-gray-500" />
            <span className="text-brown-800 font-semibold">Mark G - Bewdly</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default Div4;
