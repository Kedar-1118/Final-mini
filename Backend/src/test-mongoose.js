import mongoose from "mongoose";

console.log("Mongoose imported successfully");
try {
    if (mongoose.Error) {
        console.log("mongoose.Error exists");
    } else {
        console.log("mongoose.Error does NOT exist");
    }
} catch (e) {
    console.error("Error accessing mongoose.Error:", e);
}
