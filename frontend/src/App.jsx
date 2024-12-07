import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Div1 from "./components/Div1";
import Div4 from "./components/Div4";
import LatestListings from "./components/LatestListings";
import Footer from "./components/Footer";
import Div2 from "./components/Div2";
import AboutUs from "./components/AboutUs";
import Help from "./components/Help";
import HowItWorks from "./components/HowItWorks";
import FAQs from "./components/FAQs";
import TermsAndConditions from "./components/TermsAndConditions";
import PrivacyPolicy from "./components/PrivacyPolicy";
import './App.css';
import Messages from "./components/Messages";
import Listings from "./components/Listings";
import Settings from "./components/Settings";
// import Profile from "./components/Profile";
import PostListing from "./components/PostListing";
// import AdminDashboard from "./components/AdminDashboard";
import ListingDetail from "./components/ListingDetail";
import Account from "./components/Account";
import MyListings from "./components/MyListings";
import EditListingForm from "./components/EditListingForm";
import { AuthProvider } from './components/AuthContext';

function App() {
  return (
    <AuthProvider>
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Home route */}
          <Route 
            path="/" 
            element={
              <>
                <Div1 />
                <LatestListings key="latest-listings" />
                <Div4 />
                <Div2 />
              </>
            } 
          />

          {/* Independent routes */}
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/Postlisting" element={<PostListing />} />
          
        {/* <Route path="/AdminDashboard" element={<AdminDashboard/>} />  */}

          {/* <Route path="/profile" element={<Profile />}> */}
          <Route path="/Account" element={<Account />}>
  <Route path="Messages" element={<Messages />} />
  <Route path="Settings" element={<Settings />} />
  <Route path="MyListings" element={<MyListings />} />
  <Route path="MyListings/edit/:id" element={<EditListingForm />} /> {/* Nested under MyListings */}
</Route>

          <Route>
          <Route path="/listings" element={<Listings />} />
          <Route path="/listing/:id" element={<ListingDetail />} /> 
          </Route>
      

          {/* Nested routes under Help */}
          <Route path="/Help" element={<Help />} >
          <Route path="/Help/how-it-works" element={<HowItWorks />} />
          <Route path="/Help/faq" element={<FAQs />} />
          <Route path="/Help/terms" element={<TermsAndConditions />} />
          <Route path="/Help/privacypolicy" element={<PrivacyPolicy />} />
 
          </Route>

          {/* Other routes as needed */}
        </Routes>
        <Footer />
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
