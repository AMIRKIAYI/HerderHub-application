function PrivacyPolicy() {
    return (
      <div className="bg-gray-100 min-h-screen flex flex-col items-center p-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-lg text-white max-w-2xl">
            Your privacy is important to us. This policy outlines how HerderHub collects, uses, and safeguards your information.
          </p>
        </header>
  
        {/* Information Collection Section */}
        <section className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            We collect various types of information to provide and improve our services. This includes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><span className="font-semibold">Personal Information:</span> Name, contact details, and any information provided when creating an account.</li>
            <li><span className="font-semibold">Usage Data:</span> Details on how you interact with the app, including pages visited and features used.</li>
            <li><span className="font-semibold">Device Information:</span> Data about your device, including IP address, browser type, and app version.</li>
          </ul>
        </section>
  
        {/* Use of Information Section */}
        <section className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            The information we collect helps us to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Enhance the functionality and usability of the app.</li>
            <li>Improve the user experience by personalizing content and features.</li>
            <li>Communicate with you regarding updates, services, and promotional offers.</li>
            <li>Ensure the security and integrity of our platform and users.</li>
          </ul>
        </section>
  
        {/* Information Sharing Section */}
        <section className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sharing Your Information</h2>
          <p className="text-gray-700 mb-4">
            We do not sell or share your personal information with third parties except as necessary to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Provide services requested by you, such as facilitating buyer and herder connections.</li>
            <li>Comply with legal obligations and protect our rights or those of other users.</li>
            <li>Collaborate with service providers who assist us with app operations, under strict confidentiality agreements.</li>
          </ul>
        </section>
  
        {/* Security Section */}
        <section className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Security</h2>
          <p className="text-gray-700">
            We implement industry-standard security measures to safeguard your data. However, no method of transmission over the internet is entirely secure, and we cannot guarantee absolute protection.
          </p>
        </section>
  
        {/* Your Rights Section */}
        <section className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Rights</h2>
          <p className="text-gray-700 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Access the personal data we hold about you.</li>
            <li>Request corrections to any inaccurate information.</li>
            <li>Request deletion of your personal data.</li>
            <li>Opt-out of certain data processing practices.</li>
          </ul>
        </section>
  
        {/* Updates to Policy Section */}
        <section className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Updates to this Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy periodically. Any changes will be posted on this page, and significant changes will be communicated to users via email or app notifications.
          </p>
        </section>
  
        {/* Contact Section */}
        <section className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Us</h2>
          <p className="text-gray-700">
            If you have questions or concerns about this Privacy Policy, please contact us at: 
            <span className="text-blue-500"> support@herderhub.com</span>.
          </p>
        </section>
      </div>
    );
  }
  
  export default PrivacyPolicy;
  