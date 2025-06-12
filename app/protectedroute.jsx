"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loader from "./components/Loader.jsx";

function Protectedroute({ children }) {
  const { status } = useSession();
  const route = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      route.push("/");
    }
  }, [status, route]);

  if (status === "loading") {
    return (
      <div className=" h-screen flex flex-col justify-center items-center bg-gradient-to-r from-gray-950 via-slate-900 to-gray-950 border-b border-gray-800">
        <Loader />
        <p className="text-white text-2xl py-5">Authenticating</p>
      </div>
    );
  }

  return children;
}

export default Protectedroute;
