const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  // HTML with inline CSS
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Raisal</title>
      <style>
        /* Inline CSS to change the text color */
        body {
          background-color: #f0f0f0; /* Optional: change background color */
        }
        h1 {
          color: #3d00ff; /* Change this to your desired text color */
        }
      </style>
    </head>
    <body>
<<<<<<< HEAD
      <h1>HELLO WORLD!!!. HIII!!!...</h1>
=======
      <h1>This is my node app.</h1>
>>>>>>> origin/main
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
