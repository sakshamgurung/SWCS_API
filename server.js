const express = require('express');
const bodyParser = require('body-parser');
const config = require('./src/config');
const connectDB = require('./src/loaders/mongoose');

const geoObjectsURL = require('./src/routes/geoObjects');

const apiErrorHandler = require('./src/error/apiErrorHandler');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION!");
});

const app = express();
connectDB();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.get('/', (req, res)=>{
  res.send("hello world");
})

app.use('/api/v1/', geoObjectsURL);

app.use(apiErrorHandler);

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION!");
  
});

app.listen(config.port,()=>{
  console.log(`Server running at PORT: ${config.port}`)
});