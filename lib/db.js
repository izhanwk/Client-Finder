import mongoose from "mongoose";
let alreadyConnected = false;
const connectDB = async () => {
  try {
    if (alreadyConnected) {
      return console.log("Database is already connected");
    }
    await mongoose.connect(process.env.MONGO_URL).then(() => {
      console.log("Database Connected");
      alreadyConnected = true;
    });
  } catch (err) {
    console.log("Error occurred while connecting with database : ", err);
    alreadyConnected = false;
  }
};

export default connectDB;
