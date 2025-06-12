import mongoose from "mongoose";

const CustomerSchema = new mongoose.Schema({
  email: String,
  city: String,
  profession: String,
  country: String,
});

const Customers =
  mongoose.models.Customers || mongoose.model("Customers", CustomerSchema);

export default Customers;
