const UserRouter = require("./userRoute");
const ProductRouter = require("./productRoute");
const UnitRouter = require("./unitRoute");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
  app.use("/api/unit", UnitRouter);
};

module.exports = routes;
