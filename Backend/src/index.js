import "dotenv/config";
import { app } from "./app.js";
import { connectDB } from "./db/index.js";
import { config } from "./config/env.config.js";

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.error("Express error", err);
      throw err;
    });

    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
