const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  // HTML with inline CSS
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>akshay</title>
      <style>
        /* Inline CSS to change the text color */
        body {
          font-family: Arial, sans-serif;
          background-color: #f0f0f0; /* Optional: change background color */
        }
        h1 {
          color: #3d00ff; /* Change this to your desired text color */
        }
      </style>
    </head>
    <body>
      <h1>Hello World...</h1>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
