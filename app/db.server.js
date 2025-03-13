import mongoose from "mongoose";

const dbconnection = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/nearbyStores`);
    console.log("Database is connected");
    return mongoose.connection;
  } catch (error) {
    console.log("============ error ============", error);
    return;
  }
};

export default dbconnection();

