
const UserRouter = require("./userRoute");
const ProductRouter = require("./productRoute");
const UnitRouter = require("./unitRoute");
const CategoryRouter = require("./categoryRoute");
const userRoute = require('./userRoute');
const customerRoute = require('./customerRoute');
const serviceTicketRoute = require('./serviceTicketRoute');

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/unit", UnitRouter);
  app.use("/api/category", CategoryRouter);
  app.use('/customers', customerRoute);
  app.use('/services', serviceTicketRoute);
};
const express = require('express');

module.exports = routes;