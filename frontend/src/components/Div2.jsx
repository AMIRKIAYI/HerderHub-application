// import app1 from '../images/app1.png';
// import app3 from '../images/app3.png';

function Div2() {
  return (
    <div>
      <section className="relative pt-16 pb-24 md:pt-20 md:pb-32 bg-gray-100 overflow-hidden w-full">
        <div className="px-4">
          <div className="relative mx-auto">
            {/* Desktop view phone image */}
            <img
              className="hidden md:block absolute bottom-0 right-0 -mb-16 lg:mr-12 xl:mr-24 z-10 max-w-xs lg:max-w-md"
              src="https://sellmylivestock.com/img/homepage-download-app.f6a1bc37.png"
              alt=""
            />
            <div className="relative bg-gray-100 rounded-3xl px-6 py-12 md:px-8 md:py-16 lg:px-12 xl:px-20 shadow-lg">
             
              <div className="relative max-w-md lg:max-w-lg xl:max-w-2xl md:text-left">
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight mb-4 lg:mb-6">
                Download our new app
                </h2>
                <p className="text-lg text-gray-900 mb-6 lg:mb-8">
                With push notifications you will never miss a message and be able to trade without ever leaving the field.


                </p>
                <div className="flex justify-center md:justify-start items-center gap-3 mb-6">
                  <a className="inline-block h-10 xs:h-12" href="#">
                    <img
                      className="block h-full object-contain"
                      src="https://sellmylivestock.com/img/android.8c702a2b.png"
                      alt="Google Play"
                    />
                  </a>
                  <a className="inline-block h-10 xs:h-12" href="#">
                    <img className="block h-full object-contain" src="https://sellmylivestock.com/img/ios.7f43d977.png" alt="App Store" />
                  </a>
                </div>
              </div>
            </div>
            {/* Remove the phone image from the mobile view */}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Div2;
