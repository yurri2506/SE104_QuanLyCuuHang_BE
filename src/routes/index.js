const UserRouter = require("./userRoute");
const ProductRouter = require("./productRoute");

const routes = (app) => {
  app.use("/api/user", UserRouter);
  app.use("/api/product", ProductRouter);
};

module.exports = routes;
