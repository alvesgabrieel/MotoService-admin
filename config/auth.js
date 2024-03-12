const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("../models/User");
const User = mongoose.model("user");

module.exports = (passport) => {
  passport.use(
    new localStrategy({ usernameField: "email" }, (email, password, done) => {
      User.findOne({ email: email }).then((user) => {
        if (!user) {
          return done(null, false, { message: "Esta conta nao existe" });
        }

        bcrypt.compare(password, user.password, (erro, coincide) => {
          if (coincide) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Senha incorreta" });
          }
        });
      });
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .lean()
      .then((usuario) => {
        done(null, usuario);
      })
      .catch((err) => {
        done(null, false, { message: "algo deu errado" });
      });
  });
};
