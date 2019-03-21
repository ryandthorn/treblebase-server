"use strict";
const dotenv = require("dotenv");
dotenv.config();
exports.CLIENT_ORIGIN = process.env.DATABASE_URL || "http://localhost";
exports.PORT = process.env.PORT || 8080;
exports.DATABASE_URL = process.env.DATABASE_URL;
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
exports.JWT_SECRET = process.env.JWT_SECRET;
<<<<<<< HEAD
=======
exports.JWT_EXPIRY = Math.floor(Date.now() / 1000) + (60 * 60);
>>>>>>> 151ccb9042172df1bf3e2e7d17d95a38ee184dc6
