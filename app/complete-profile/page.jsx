"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { Briefcase, MapPin, Globe, ArrowRight, UserCircle } from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
function page() {
  const [messagetitle, setmessagetitle] = useState("");
  const [messagetext, setmessagetext] = useState("");
  const [success, setsuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const [loading, setloading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const newdata = { ...data, email: session.user.email };
    try {
      const response = await axios.post("/api/add-customer", newdata);
      setsuccess(true);
      setOpen(true);
      setmessagetitle("Success");
      setmessagetext("You are now registered in our system");
      reset();
    } catch (err) {
      if (err.response) {
        if (err.response.status === 409) {
          setsuccess(false);
          setOpen(true);
          setmessagetitle("Conflict");
          setmessagetext("You are already registered in our system");
          reset();
        }
        if (err.response.status === 401) {
          setsuccess(false);
          setOpen(true);
          setmessagetitle("Not signed in");
          setmessagetext("You are not signed in");
          reset();
        }
      } else {
        setsuccess(false);
        setOpen(true);
        setmessagetitle("Server error");
        setmessagetext(
          "An internal server error occurred. Please try again later"
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
      <Dialog open={open} onClose={setOpen} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div
                    className={`mx-auto flex size-12 shrink-0 items-center justify-center rounded-full ${
                      success ? "bg-green-100" : "bg-red-100"
                    }  sm:mx-0 sm:size-10`}
                  >
                    {success ? (
                      <CheckCircleIcon
                        aria-hidden="true"
                        className="size-6 text-green-500"
                      />
                    ) : (
                      <ExclamationTriangleIcon
                        aria-hidden="true"
                        className="size-6 text-red-600"
                      />
                    )}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <DialogTitle
                      as="h3"
                      className="text-base font-semibold text-gray-900"
                    >
                      {messagetitle}
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{messagetext}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  data-autofocus
                  onClick={() => setOpen(false)}
                  className="mt-3 cursor-pointer inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  OK
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      <div className="w-full max-w-md">
        {/* Card Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-t-2xl p-6 border-b border-white/20">
          <div className="flex items-center justify-center space-x-3">
            <UserCircle className="w-8 h-8 text-white" />
            <h2 className="text-2xl font-bold text-white">Profile Details</h2>
          </div>
          <p className="text-center text-white/80 mt-2">
            Tell us about yourself
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-b-2xl shadow-xl"
        >
          <div className="p-6 space-y-6">
            {/* Profession Field */}
            <div className="relative">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 mr-2 text-indigo-500" />
                Profession
              </label>
              <input
                type="text"
                {...register("profession", {
                  required: "Profession is required",
                })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="What do you do?"
              />
              {errors.profession && (
                <p className="mt-1 text-red-500 text-sm flex items-center">
                  <span className="ml-1">{errors.profession.message}</span>
                </p>
              )}
            </div>

            {/* City Field */}
            <div className="relative">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                City
              </label>
              <input
                type="text"
                {...register("city", { required: "City name is required" })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Where are you based?"
              />
              {errors.city && (
                <p className="mt-1 text-red-500 text-sm flex items-center">
                  <span className="ml-1">{errors.city.message}</span>
                </p>
              )}
            </div>

            {/* Country Field */}
            <div className="relative">
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 mr-2 text-indigo-500" />
                Country
              </label>
              <input
                type="text"
                {...register("country", {
                  required: "Country name is required",
                })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="Which country are you from?"
              />
              {errors.country && (
                <p className="mt-1 text-red-500 text-sm flex items-center">
                  <span className="ml-1">{errors.country.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="px-6 pb-6">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-6 rounded-lg font-medium 
                       hover:from-indigo-600 hover:to-purple-600 transform transition-all duration-200 
                       flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default page;
