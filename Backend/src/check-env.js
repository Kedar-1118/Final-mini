import "dotenv/config";

console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN);
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Set" : "Not Set");
