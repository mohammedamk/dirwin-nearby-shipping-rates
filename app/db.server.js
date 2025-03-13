import mongoose from "mongoose";

const dbconnection = async () => {
  try {
    await mongoose.connect(
      process.env.NODE_ENV === "development"
        ? `${process.env.MONGODB_URI}/nearbyStores`
        : process.env.MONGODB_URI,
    );
    console.log("Database is connected");
    return mongoose.connection;
  } catch (error) {
    console.log("============ error ============", error);
    return;
  }
};

export default dbconnection();
