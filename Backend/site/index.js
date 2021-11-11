const express = require('express');
const app = express();
const port = 8000;

// routing
// only an api route will be needed
require('./routes/api/api')(app);

app.listen(port, () => console.log(`site listening on port ${port}!`))