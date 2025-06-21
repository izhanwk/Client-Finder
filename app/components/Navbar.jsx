"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";

import {
  Home,
  Settings,
  UserCircle,
  Search,
  Bell,
  Menu,
  Power,
  ChevronDown,
} from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";

function Navbar() {
  const router = useRouter();
  const path = usePathname();
  const [loading, setloading] = useState(false);
  const [email, setemail] = useState("");
  const { data: session, status } = useSession();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const dropdownRef = useRef(null);

  const [loadingMessage, setloadingMessage] = useState("");

  // useEffect(() => {
  //   console.log(status);
  //   if (status === "loading") {
  //     setloadingMessage("Checking status");
  //     setloading(true);
  //   } else {
  //     setloading(false);
  //   }

  //   if (status === "unauthenticated") {
  //     router.push("/");
  //   }
  // }, [status]);

  useEffect(() => {
    const checkUser = async () => {
      if (path !== "/") {
        setloading(false);
        return;
      }

      if (session?.user?.email && !checked) {
        setChecked(true);
        setemail(session.user.email);
        // setloadingMessage("Loading");
        // setloading(true);
        try {
          // setloadingMessage("Please wait a bit");
          // setloadingMessage("Loading");
          // setloading(true);
          const response = await axios.post("/api/check-customer", {
            email: session.user.email,
          });
          setloadingMessage("Redirecting to Dashboard");
          setloading(true);
          setTimeout(() => {
            router.push("/dashboard");
          }, 100); // 100ms is enough for the browser to show the loader
        } catch (error) {
          if (error.response) {
            if (
              error.response.status === 404 ||
              error.response.status === 408
            ) {
              setloadingMessage("Redirecting to complete profile");
              setloading(true);
              router.push("/complete-profile");
            }
          }
        }
      } else {
        console.log("return");
        setloading(false);
      }
    };
    if (path === "/complete-profile") {
      setloading(false);
    }

    checkUser();
  }, [session, path, checked]);

  // useEffect(() => {}, [path]);

  // ✅ Depend on session so it runs when session updates

  useEffect(() => {
    console.log(loading);
  }, [loading]);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsSignInOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 w-full h-screen flex justify-center items-center bg-black opacity-50">
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
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-950 via-slate-900 to-gray-950 border-b border-gray-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0 transform hover:scale-110 transition-transform duration-200">
                <Home className="h-8 w-8 text-slate-400 hover:text-slate-300" />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-6">
                  {["Dashboard", "Projects", "Team"].map((item) => (
                    <a
                      key={item}
                      href="#"
                      className="relative group text-slate-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors duration-200"
                    >
                      {item}
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side icons */}
            <div className="hidden md:flex items-center space-x-6">
              <button className="text-slate-500 hover:text-white transform hover:scale-110 transition-all duration-200">
                <Search className="h-5 w-5" />
              </button>
              <button className="text-slate-500 hover:text-white transform hover:scale-110 transition-all duration-200 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-slate-600 rounded-full animate-pulse"></span>
              </button>
              <button className="text-slate-500 hover:text-white transform hover:scale-110 transition-all duration-200">
                <Settings className="h-5 w-5" />
              </button>

              {session ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsSignInOpen(!isSignInOpen)}
                    className="flex items-center space-x-2 bg-slate-800/50 text-white px-4 py-2.5 rounded-lg hover:bg-slate-700/50 transition-all duration-200 border border-slate-700/30 hover:border-slate-600/50"
                  >
                    <UserCircle className="h-5 w-5 text-slate-400" />
                    <span className="text-sm font-medium">
                      {session.user.email}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </button>
                  {isSignInOpen && (
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-slate-900 rounded-lg shadow-xl border border-slate-800 backdrop-blur-sm">
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors duration-200"
                      >
                        <Power className="h-4 w-4 mr-2 text-slate-400" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsSignInOpen(!isSignInOpen)}
                    className="cursor-pointer flex items-center space-x-2 bg-slate-800 text-white px-6 py-2.5 rounded-lg hover:bg-slate-700 transition-all duration-200 shadow-lg hover:shadow-slate-800/25"
                  >
                    <UserCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Sign in</span>
                  </button>
                  {isSignInOpen && (
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-slate-900 rounded-lg shadow-xl border border-slate-800">
                      <button
                        onClick={() => signIn("google")}
                        className="cursor-pointer w-full flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors duration-200"
                      >
                        <i className="fab fa-google text-white mr-2"></i>
                        Sign in with Google
                      </button>
                      <button
                        onClick={() => signIn("facebook")}
                        className="cursor-pointer w-full flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-slate-800/50 transition-colors duration-200"
                      >
                        <i className="fab fa-facebook text-white mr-2"></i>
                        Sign in with Facebook
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-500 hover:text-white p-2 rounded-lg hover:bg-slate-800/50 transition-colors duration-200"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              {["Dashboard", "Projects", "Team"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block text-slate-400 hover:text-white hover:bg-slate-800/50 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                >
                  {item}
                </a>
              ))}
              <div className="flex items-center space-x-4 px-3 py-2">
                <button className="text-slate-500 hover:text-white">
                  <Search className="h-5 w-5" />
                </button>
                <button className="text-slate-500 hover:text-white relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-slate-600 rounded-full"></span>
                </button>
                <button className="text-slate-500 hover:text-white">
                  <Settings className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Sign In/Out Section */}
              <div className="px-3 pt-4 border-t border-slate-800">
                {session ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <UserCircle className="h-5 w-5 text-slate-500" />
                      <span className="text-sm">{session.user.email}</span>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="flex items-center space-x-2 w-full text-left text-slate-400 hover:text-white hover:bg-slate-800/50 px-2 py-2 rounded-md text-sm transition-colors duration-200"
                    >
                      <Power className="h-4 w-4 text-slate-500" />
                      <span>Sign out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => signIn("google")}
                      className="flex items-center space-x-2 w-full text-slate-400 hover:text-white hover:bg-slate-800/50 px-2 py-2 rounded-md text-sm transition-colors duration-200"
                    >
                      <i className="fab fa-google text-slate-500"></i>
                      <span>Sign in with Google</span>
                    </button>
                    <button
                      onClick={() => signIn("facebook")}
                      className="flex items-center space-x-2 w-full text-slate-400 hover:text-white hover:bg-slate-800/50 px-2 py-2 rounded-md text-sm transition-colors duration-200"
                    >
                      <i className="fab fa-facebook text-slate-500"></i>
                      <span>Sign in with Facebook</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;
