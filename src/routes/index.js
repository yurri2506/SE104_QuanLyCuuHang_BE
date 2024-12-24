
const UserRouter = require("./userRoute");
const ProductRouter = require("./productRoute");
const UnitRouter = require("./unitRoute");
const CategoryRouter = require("./categoryRoute");
<<<<<<< HEAD
const userRoute = require('./userRoute');
const customerRoute = require('./customerRoute');
const serviceTicketRoute = require('./serviceTicketRoute');
const providerRoute = require('./providerRoute');
const purchaseOrder = require('./purchaseRoute');
// const warehouseManage = require('./warehouseManageRoute');
=======
const CustomerRoute = require('./customerRoute');
const ServiceTicketRoute = require('./serviceTicketRoute');
const ServiceTypeRoute = require('./serviceTypeRoute');
const SaleInvoiceRoute = require('./saleInvoiceRoute');
const ProviderRoute = require ('./providerRoute');
const PurchaseOrder = require('./purchaseRoute');
>>>>>>> 0ac5e7f4da6ff16b47d1c811c6f5e852196a4a27

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/unit", UnitRouter);
  app.use("/api/category", CategoryRouter);
<<<<<<< HEAD
  app.use('/api/customers', customerRoute);
  app.use('/api/services', serviceTicketRoute);
  app.use('/api/provider', providerRoute);
  app.use('/api/purchase', purchaseOrder);
  // app.use('/api/warehouse', warehouseManage);
=======
  app.use("/api/customers", CustomerRoute);
  app.use("/api/services", ServiceTicketRoute);
  app.use("/api/service-types", ServiceTypeRoute);
  app.use('/api/provider', ProviderRoute);
  app.use('/api/purchase', PurchaseOrder);
  app.use("/api/sale", SaleInvoiceRoute);
>>>>>>> 0ac5e7f4da6ff16b47d1c811c6f5e852196a4a27
};

module.exports = routes;