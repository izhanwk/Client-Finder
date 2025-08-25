"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import {
  Building2,
  Search,
  Sparkles,
  ArrowRight,
  MapPin,
  ArrowUp,
} from "lucide-react";

function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const location = searchParams.get("location");
  const companies = sessionStorage.getItem("companies");
  const toJson = JSON.parse(companies || "[]");

  // State for scroll to top button
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loading, setloading] = useState(false);
  const [loadingMessage, setloadingMessage] = useState("Loading");

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const findContacts = async (company) => {
    setloading(true);
    setloadingMessage("Loading");
    const es = new EventSource(
      `/api/find-contacts?company=${encodeURIComponent(company)}`
    );
    let companyWebSite = "";
    let companyEmail = "";
    let companyContactForm = "";

    es.onmessage = async (message) => {
      try {
        const jsonMessage = JSON.parse(message.data);

        if (jsonMessage.status === "progress") {
          console.log("Progress update:", jsonMessage);
          setloadingMessage(jsonMessage.data);
        } else if (jsonMessage.status === "sessionerror") {
          alert("Session error");
        } else if (jsonMessage.status === "Company Website") {
          companyWebSite = jsonMessage.data;
        } else if (jsonMessage.status === 404 || jsonMessage.status === 500) {
          console.log("Contact section not found on website");
        } else if (jsonMessage.status === 200) {
          companyEmail = jsonMessage.data;
        } else if (jsonMessage.status === "contact link") {
          companyContactForm = jsonMessage.data;
          console.log(
            "From here you can contact the company : ",
            jsonMessage.data
          );
        } else if (jsonMessage.status === 550) {
          console.log(jsonMessage.data);
        }

        if (jsonMessage.status === "done") {
          setloadingMessage("Done, redirecting to contacts");
          console.log("✅ Done:", jsonMessage);
          es.close(); // close when finished
          try {
            const str = JSON.stringify(companyEmail);
            console.log(str); // '["info@inlights.ai"]'

            router.push(
              `/extract-contacts?website=${companyWebSite}&emails=${encodeURIComponent(
                str
              )}&contactform=${companyContactForm}`
            );
          } catch (err) {
            setloading(false);
            alert("Error while navigating");
          }
        }
      } catch (err) {
        console.error("Failed to parse message:", message.data, err);
      }
    };

    es.onerror = (error) => {
      console.error("❌ SSE error:", error);
      es.close();
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {loading && (
        <div className="fixed inset-0 w-full h-screen flex justify-center items-center bg-black opacity-50 z-50">
          <div
            role="status"
            className=" w-auto  justify-evenly flex items-center"
          >
            <svg
              aria-hidden="true"
              className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <p className="text-white px-3">{loadingMessage}</p>
          </div>
        </div>
      )}
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gray-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gray-700/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-gray-800/5 to-transparent rounded-full"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-7xl">
          {/* Header section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-400 rounded-2xl blur opacity-75 animate-pulse"></div>
                <div className="relative bg-gray-800 p-2 rounded-2xl border border-gray-700">
                  {/* Smaller icon */}
                  <Building2 className="w-5 h-5 text-gray-300" />
                </div>
              </div>
            </div>

            {/* Smaller heading */}
            <h1 className="text-3xl font-black text-white mb-4 tracking-tight">
              Company
              <span className="bg-gradient-to-r from-gray-400 to-gray-200 bg-clip-text text-transparent ml-2">
                Directory
              </span>
            </h1>

            <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Discover and explore our curated collection of industry-leading
              companies
            </p>

            {/* Stats bar */}
            <div className="flex items-center justify-center mt-8 space-x-6">
              <div className="flex items-center space-x-1 text-gray-500">
                {/* Smaller icon */}
                <Sparkles className="w-3 h-3" />
                <span className="text-xs font-medium">
                  {toJson.length} Companies
                </span>
              </div>
              <div className="w-px h-3 bg-gray-700"></div>
              <div className="flex items-center space-x-1 text-gray-500">
                {/* Smaller icon */}
                <MapPin className="w-3 h-3" />
                <span className="text-xs font-medium">{location}</span>
              </div>
            </div>
          </div>

          {/* Companies grid */}
          {toJson.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {toJson.map((company, index) => (
                <div
                  key={index}
                  className="group relative"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: "fadeInUp 0.6s ease-out forwards",
                  }}
                >
                  {/* Card glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-gray-500 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-500 blur-sm"></div>

                  {/* Main card */}
                  <div
                    className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 h-full hover:bg-gray-700/80 transition-all duration-500 hover:scale-105 hover:border-gray-600/50 cursor-pointer"
                    onClick={(e) => {
                      const name = e.currentTarget.innerText;
                      const newName = name.slice(1).trim();
                      findContacts(newName);
                    }}
                  >
                    {/* Company initial/icon */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-base">
                          {company.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0" />
                    </div>

                    {/* Company name */}
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-gray-100 transition-colors duration-300 leading-tight">
                        {company}
                      </h3>
                      <div className="w-0 group-hover:w-10 h-0.5 bg-gradient-to-r from-gray-500 to-gray-400 transition-all duration-500"></div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute bottom-4 right-4 w-2 h-2 bg-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-4 right-8 w-1 h-1 bg-gray-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700">
                <Search className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                No Companies Found
              </h3>
              <p className="text-gray-400 max-w-md mx-auto text-sm">
                We couldn't find any companies in your search. Try adjusting
                your parameters or check back later.
              </p>
            </div>
          )}

          {/* Footer section */}
          <div className="text-center mt-20 pt-12 border-t border-gray-800">
            <p className="text-gray-500 text-xs">
              Powered by modern web technologies • Built with precision
            </p>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 w-12 h-12 bg-gray-800/90 backdrop-blur-xl border border-gray-600/50 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700/90 hover:border-gray-500/50 hover:scale-110 transition-all duration-300 ${
          showScrollTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Scroll to top"
      >
        {/* Button glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full opacity-0 hover:opacity-20 transition duration-300 blur-sm"></div>
        <ArrowUp className="w-5 h-5 text-gray-300 relative z-10" />
      </button>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Page;
