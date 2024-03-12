const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/User");
const User = mongoose.model("user");
const bcrypt = require("bcryptjs");
const passport = require("passport");

//Rotas de registro
router.get("/registro", (req, res) => {
  res.render("user/register");
});

router.post("/registro", (req, res) => {
  let erros = [];

  if (
    !req.body.name ||
    typeof req.body.name == undefined ||
    req.body.name == null
  ) {
    erros.push({ text: "digite um nome" });
  }

  if (req.body.name.length < 4) {
    erros.push({ text: "Digite um nome e sobrenome" });
  }

  if (
    !req.body.email ||
    typeof req.body.email == undefined ||
    req.body.email == null
  ) {
    erros.push({ text: "digite um email válido" });
  }
  if (
    !req.body.password ||
    typeof req.body.password == undefined ||
    req.body.password == null
  ) {
    erros.push({ text: "Digite uma senha válida" });
  }

  if (req.body.password.length < 6) {
    erros.push({ text: "Sua senha deve conter no mínimo 6 caracteres" });
  }
  if (req.body.password2 != req.body.password) {
    erros.push({ text: "Suas senhas tem que ser iguais!" });
  }

  if (erros.length > 0) {
    res.render("user/register", { erros: erros });
  } else {
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (user) {
          req.flash("error_msg", "Email de usuário ja cadastrado");
          res.redirect("/user/registro");
        } else {
          const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
          });

          bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(newUser.password, salt, (erro, hash) => {
              if (erro) {
                req.flash(
                  "error_msg",
                  "Houve um erro interno a criar o usuário"
                );
                res.redirect("/");
              } else {
                newUser.password = hash;

                newUser
                  .save()
                  .then(() => {
                    req.flash("success_msg", "Usuário criado com sucesso");
                    res.redirect("/");
                  })
                  .catch((err) => {
                    req.flash("error_msg", "Houve um erro ao criar o usuário");
                    res.redirect("/user/registro");
                  });
              }
            });
          });
        }
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao localizar o email");
        res.redirect("/");
      });
  }
});

//Rotas de Login
router.get("/login", (req, res) => {
  res.render("user/login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/admin/servicos",
    failureRedirect: "/user/login",
    failureFlash: true,
  })(req, res, next);
});

router.get("/logout", (req, res, next) => {
  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success_msg", "Deslogado com sucesso!");
    res.redirect("/");
  });
});

module.exports = router;
