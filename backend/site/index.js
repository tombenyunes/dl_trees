const express = require('express');
const app = express();
const port = 8000;

// API route
require('./routes/main/main')(app);

app.listen(port, () => console.log(`Node Running -> Port: ${port} <-`))