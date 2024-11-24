import { useState } from 'react';

const FAQs = () => {
  // Sample FAQs data
  const faqs = [
    {
      question: "What is HerderHub?",
      answer: "HerderHub is a platform that allows herders to post their livestock for sale, making it easier for buyers to find what they need."
    },
    {
      question: "How do I create an account?",
      answer: "To create an account, click on the 'Sign Up' button on the homepage and fill in the required details."
    },
    {
      question: "How do I post my livestock for sale?",
      answer: "To post your livestock for sale, log in to your account and navigate to the 'Post Listing' section. Fill in the details of your livestock, including photos and descriptions, then submit your listing."
    },
    {
      question: "Can I modify my listings after posting?",
      answer: "Yes, you can edit or remove your listings at any time through your account dashboard."
    },
    {
      question: "What should I do if I forget my password?",
      answer: "If you forget your password, click on 'Forgot Password?' on the login page, and follow the instructions to reset it."
    },
  ];

  // State to manage which FAQ is expanded
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Toggle function for FAQs
  const toggleFAQ = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800">Frequently Asked Questions</h2>
      <p className="text-gray-600 mt-2">Here are some common questions and answers.</p>
      
      <div className="mt-4 space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border rounded shadow-md">
            <button 
              onClick={() => toggleFAQ(index)} 
              className="w-full p-4 text-left bg-gray-200 rounded-t hover:bg-gray-300 focus:outline-none"
            >
              <h3 className="font-medium">{faq.question}</h3>
            </button>
            {expandedIndex === index && (
              <div className="p-4 border-t">
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQs;
