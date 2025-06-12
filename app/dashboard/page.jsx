"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

function Page() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [professions, setprofessions] = useState([]);
  const [loading, setloading] = useState(false);

  const { register, watch, handleSubmit, setValue } = useForm();
  const formValues = watch();

  useEffect(() => {
    console.log(loading);
  }, [loading]);

  // Fetch countries on load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setloading(true);
        const [countriesRes, professionsRes] = await Promise.all([
          axios.get("https://countriesnow.space/api/v0.1/countries/positions"),
          axios.get("api/professions"),
        ]);
        const countriesList = countriesRes.data.data;
        setCountries(countriesList.map((country) => country.name));
        setprofessions(professionsRes.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setloading(false);
        console.log("Loading will stop");
      }
    };

    fetchInitialData();
  }, []);

  // Fetch states when country changes
  useEffect(() => {
    if (formValues.country) {
      const fetchStates = async () => {
        setloading(true);
        try {
          const res = await axios.post(
            "https://countriesnow.space/api/v0.1/countries/states",
            { country: formValues.country }
          );
          setStates(res.data.data.states.map((s) => s.name));
          setValue("state", ""); // reset selected state
          setValue("city", ""); // reset selected city
        } catch (err) {
          console.error("Error fetching states:", err);
        } finally {
          setloading(false);
        }
      };
      fetchStates();
    }
  }, [formValues.country]);

  // Fetch cities when state changes
  useEffect(() => {
    if (formValues.country && formValues.state) {
      const fetchCities = async () => {
        setloading(true);
        try {
          const res = await axios.post(
            "https://countriesnow.space/api/v0.1/countries/state/cities",
            {
              country: formValues.country,
              state: formValues.state,
            }
          );
          setCities(res.data.data);
          setValue("city", ""); // reset selected city
        } catch (err) {
          console.error("Error fetching cities:", err);
        } finally {
          setloading(false);
        }
      };
      fetchCities();
    }
  }, [formValues.state]);

  const onSubmit = async (data) => {
    console.log("Submitted Data:", data);
    const response = await axios.post("/api/extract-clients", data);
    console.log(response);
  };

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
            <p className="text-white px-3">Loading</p>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center text-white mb-8">
            Personal Information
          </h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Country */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Country
                </label>
                <select
                  {...register("country", { required: true })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                >
                  <option value="">Select a country</option>
                  {countries.map((country, index) => (
                    <option key={index}>{country}</option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  State / Province
                </label>
                <select
                  {...register("state", { required: true })}
                  disabled={!formValues.country}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                >
                  <option value="">Select a state</option>
                  {states.map((state, index) => (
                    <option key={index}>{state}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">City</label>
                <select
                  {...register("city", { required: true })}
                  disabled={!formValues.state}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                >
                  <option value="">Select a city</option>
                  {cities.map((city, index) => (
                    <option key={index}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Profession */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  Profession
                </label>
                <select
                  {...register("profession", { required: true })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600"
                >
                  <option value="">Select a profession</option>
                  {professions.map((profession, index) => {
                    return <option key={index}>{profession}</option>;
                  })}
                </select>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-gray-700 rounded-md">
                <h2 className="text-xl text-white mb-4">Your Selections</h2>
                <p className="text-gray-300">
                  Country:{" "}
                  <span className="text-blue-400">
                    {formValues.country || "Not selected"}
                  </span>
                </p>
                <p className="text-gray-300">
                  State:{" "}
                  <span className="text-blue-400">
                    {formValues.state || "Not selected"}
                  </span>
                </p>
                <p className="text-gray-300">
                  City:{" "}
                  <span className="text-blue-400">
                    {formValues.city || "Not selected"}
                  </span>
                </p>
                <p className="text-gray-300">
                  Profession:{" "}
                  <span className="text-blue-400">
                    {formValues.profession || "Not selected"}
                  </span>
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Page;
