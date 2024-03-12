const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const user = require("./routes/user");
const passport = require("passport");
require("./config/auth")(passport);
const { addOne } = require("./helpers/addOne");

// > CONFIG

//session
app.use(
  session({
    secret: "motoservice",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//middlaware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

//BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Handlebars
app.engine(
  "handlebars",
  handlebars.engine({
    helpers: {
      addOne: addOne,
    },
    defaultLayout: "main",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", "handlebars");

//mongoose

mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://127.0.0.1:27017/motoservice")
  .then(() => {
    console.log("Servidor MongoDb conectado");
  })
  .catch((err) => {
    console.log(
      `Algo deu errado ao tentar conectar com o servidor mongoDb: ${err}`
    );
  });

//Public
app.use(express.static(path.join(__dirname, "public")));

// > ROTAS

app.get("/", (req, res) => {
  res.render("user/login");
});

app.use("/admin", admin);
app.use("/user", user);

// > OUTROS
const PORT = 7070;
app.listen(PORT, () => {
  console.log(`Servidor Nodejs rodando em http://localhost:${PORT}`);
});
