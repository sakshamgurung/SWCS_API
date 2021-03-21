const express = require('express');
const config = require('./src/config');
const connectDB = require('./src/loaders/mongoose');
const apiErrorHandler = require('./src/error/apiErrorHandler');

const wasteCatalogsUrl = require('./src/routes/wasteCatalogs');

const accountUrl = require('./src/routes/account');
const notificationsUrl = require('./src/routes/notifications');

const companiesUrl = require('./src/routes/companies');
const staffUrl = require('./src/routes/staff');
const vehiclesUrl = require('./src/routes/vehicles');
const geoObjectsUrl = require('./src/routes/geoObjects');
const wasteListUrl = require('./src/routes/wasteList');
const staffGroupUrl = require('./src/routes/staffGroup');

const worksUrl = require('./src/routes/works');

const customersUrl = require('./src/routes/customers');
const customerRequestsUrl = require('./src/routes/customerRequests');
const subscriptionsUrl = require('./src/routes/subscriptions');
const wasteDumpUrl = require('./src/routes/wasteDump');
const customerUsedGeoObjectsUrl = require('./src/routes/customerUsedGeoObjects');
const schedulesUrl = require('./src/routes/schedules');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION!");
});

const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({extended:false}));

app.get('/', (req, res)=>{
  res.send("hello world");
})
const apiVersion = "/api/v1/"
app.use(apiVersion, wasteCatalogsUrl);
app.use(apiVersion, accountUrl);
app.use(apiVersion, notificationsUrl);


app.use(apiVersion, customerRequestsUrl);
app.use(apiVersion, subscriptionsUrl);
app.use(apiVersion, wasteDumpUrl);
app.use(apiVersion, customerUsedGeoObjectsUrl);
app.use(apiVersion, schedulesUrl);

app.use(apiVersion, vehiclesUrl);//should be above companiesUrl other wise route conflict
app.use(apiVersion, geoObjectsUrl);
app.use(apiVersion, wasteListUrl);
app.use(apiVersion, staffGroupUrl);
app.use(apiVersion, worksUrl);
app.use(apiVersion, staffUrl);
app.use(apiVersion, customersUrl);
app.use(apiVersion, companiesUrl);

app.use(apiErrorHandler);

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log("UNHANDLED REJECTION!");
  
});

app.listen(config.port,()=>{
  console.log(`Server running at PORT: ${config.port}`)
});