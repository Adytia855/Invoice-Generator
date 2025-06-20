/**
 * @file server.js
 * @description This file sets up a basic Express.js web server.
 * It serves static files from the 'public' directory and listens for
 * incoming HTTP requests on port 3000.
 */

// Import the Express.js framework.
const express = require('express');

// Create an instance of the Express application.
const app = express();

// Serve static files from the 'public' directory.
app.use(express.static("public"));

// Start the server and make it listen for connections on port 3000.
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
