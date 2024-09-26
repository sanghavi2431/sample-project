import LOGGER from "./config/LOGGER";
import app from "./config/express";
const PORT = process.env.PORT || 5000;
// const PORT = 3000;
import router from "./Routes/index";
import path from "path";
import express from "express";
const ejs = require('ejs');

app.use(router);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
// app.use('/views',express.static('./views'))
app.use(express.static('./assets'));

const server = app.listen(PORT, () => {
  LOGGER.info(`Server running at ${PORT}`);
});

server.setTimeout(600000); 
