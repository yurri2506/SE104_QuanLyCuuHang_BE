
const UserRouter = require("./userRoute");
const ProductRouter = require("./productRoute");
const UnitRouter = require("./unitRoute");
const CategoryRouter = require("./categoryRoute");
const userRoute = require('./userRoute');
const customerRoute = require('./customerRoute');
const serviceTicketRoute = require('./serviceTicketRoute');
const providerRoute = require('./providerRoute');
const purchaseOrder = require('./purchaseRoute');


const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/unit", UnitRouter);
  app.use("/api/category", CategoryRouter);
  app.use('/api/customers', customerRoute);
  app.use('/api/services', serviceTicketRoute);
  app.use('/api/provider', providerRoute);
  app.use('/api/purchase', purchaseOrder);
};

module.exports = routes;