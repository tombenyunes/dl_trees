const express = require('express');
const app = express();
const port = 8000;

// public image dir
app.use(express.static('/scratch/pyxelate/output/'))

// routes
require('./routes/main/main')(app);

// views
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.listen(port, () => console.log(`Node Running -> Port: ${port} <-`))