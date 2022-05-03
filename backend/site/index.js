const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8000;

app.use(express.static(__dirname + '/public'));     // css styling
app.use(express.static('/scratch/pyxelate/output/'))    // final assets
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
require('./routes/main/main')(app);

// views
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.listen(port, () => console.log(`Node Running -> Port: ${port} <-`))