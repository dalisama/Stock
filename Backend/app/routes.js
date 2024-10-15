const express = require("express");

module.exports = () => {
  const app = new express.Router();

  app.get("/", function(req, res) {
    res.render("index");
  });

  return app;
};
