const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Client");
const Client = mongoose.model("client");
require("../models/Service");
const Service = mongoose.model("service");
const { eAdmin } = require("../helpers/eAdmin");

router.get("/", eAdmin, (req, res) => {
  res.render("admin/index");
});

// >> ROTA CLIENTS

router.get("/clientes", eAdmin, (req, res) => {
  Client.find()
    .sort({ date: "desc" })
    .then((clients) => {
      res.render("admin/client", { clients: clients });
    })
    .catch((err) => {
      req.flash("error_msg", "houve um erro ao listar as categorias");
      res.redirect("/admin");
    });
});

router.get("/clientes/add", eAdmin, (req, res) => {
  res.render("admin/addclient");
});

router.post("/clientes/novo", eAdmin, (req, res) => {
  //validação
  let erros = [];

  if (
    !req.body.name ||
    typeof req.body.name == undefined ||
    req.body.name == null
  ) {
    erros.push({ text: "Insira um nome válido" });
  }

  if (req.body.name.length < 4) {
    erros.push({ text: "Digite um nome e sobrenome" });
  }

  if (
    !req.body.cellphone ||
    typeof req.body.cellphone == undefined ||
    req.body.cellphone == null
  ) {
    erros.push({ text: "Insira um número de celular válido" });
  }

  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ text: "Insira um slug válido" });
  }

  if (erros.length > 0) {
    res.render("admin/addclient", { erros: erros });
  } else {
    // guardando o "name" e "slug" pego pela requisição no objeto "newClient"

    //const newClient = new Client({
    //  name: req.body.name,
    //  cellphone: req.body.cellphone,
    //  slug: req.body.slug,
    //})
    const newClient = {
      name: req.body.name,
      cellphone: req.body.cellphone,
      slug: req.body.slug,
    };

    //Criar o client no db
    new Client(newClient)
      .save()
      .then(() => {
        req.flash("success_msg", "cliente salvo com sucesso");
        res.redirect("/admin/clientes");
      })
      .catch((err) => {
        req.flash(
          "error_msg",
          "houve um erro ao salvar o cliente, tente novamente"
        );
        res.redirect("/admin");
      });
  }
});

router.get("/clientes/edit/:id", eAdmin, (req, res) => {
  Client.findOne({ _id: req.params.id })
    .then((client) => {
      res.render("admin/editclient", { client: client });
    })
    .catch((err) => {
      req.flash("error_msg", "Essa categoria não existe!");
      res.redirect("/admin/clientes");
    });
});

router.post("/clientes/edit", eAdmin, (req, res) => {
  Client.findOne({ _id: req.body.id })
    .then((client) => {
      client.name = req.body.name;
      client.cellphone = req.body.cellphone;
      client.slug = req.body.slug;

      client
        .save()
        .then(() => {
          req.flash("success_msg", "Dados do cliente salvo com sucesso!");
          res.redirect("/admin/clientes");
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro interno ao editar o cliente");
          res.redirect("/admin/clientes");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao editar o cliente");
      res.redirect("/admin/clientes");
    });
});

router.post("/clientes/deletar", eAdmin, (req, res) => {
  Client.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Cliente deletado com sucesso");
      res.redirect("/admin/clientes");
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar este cliente");
      res.redirect("/admin/clientes");
    });
});

// >> ROTA SERVICOS

router.get("/servicos", eAdmin, (req, res) => {
  Service.find()
    .populate("client")
    .sort({ date: "desc" })
    .then((services) => {
      const totalProfit = services.reduce(
        (total, service) => total + service.value,
        0
      );

      let totalServices = services.length;

      res.render("admin/service", {
        services: services,
        totalProfit,
        totalServices,
      });
    })
    .catch((err) => {
      req.flash("error_msg", `Houve um erro interno ao listar os servicos`);
      res.redirect("/admin/clientes");
    });
});

router.get("/servicos/add", eAdmin, (req, res) => {
  Client.find()
    .then((client) => {
      res.render("admin/addservice", { client: client });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao lista os clients" + err);
      res.redirect("/admin/servicos");
    });
});

router.post("/servicos/novo", eAdmin, (req, res) => {
  let erros = [];

  if (
    !req.body.client ||
    typeof req.body.client == undefined ||
    req.body.client == null
  ) {
    erros.push({ text: "insira um cliente para o serviço" });
  }
  if (
    !req.body.value ||
    typeof req.body.value == undefined ||
    req.body.value == null
  ) {
    erros.push({ text: "insira o preço do serviço" });
  }
  if (
    !req.body.description ||
    typeof req.body.description == undefined ||
    req.body.description == null
  ) {
    erros.push({ text: "insira uma descrição para o serviço" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ text: "insira um slug-service para o serviço" });
  }

  if (erros.length > 0) {
    res.render("admin/addservice", { erros: erros });
  } else {
    const newService = {
      client: req.body.client,
      value: req.body.value,
      description: req.body.description,
      slug: req.body.slug,
    };

    new Service(newService)
      .save()
      .then(() => {
        req.flash("success_msg", "Serviço adicionado com sucesso!");
        res.redirect("/admin/servicos");
      })
      .catch((err) => {
        req.flash("error_msg", `Houve um erro ao adicionar um serviço ${err}`);
        res.redirect("/admin/servicos");
      });
  }
});

router.get("/servicos/edit/:id", eAdmin, (req, res) => {
  //duas buscas seguidas no banco de dados
  Service.findOne({ _id: req.params.id })
    .then((service) => {
      Client.find().then((client) => {
        res.render("admin/editservice", {
          service: service,
          client: client,
        });
      });
    })
    .catch((err) => {
      req.flash("error_msg", "ocorreu um interno" + err);
      res.redirect("/admin/servicos");
    });
});

router.post("/servicos/edit", eAdmin, (req, res) => {
  Service.findOne({ _id: req.body.id })
    .then((service) => {
      service.client = req.body.client;
      service.description = req.body.description;
      service.value = req.body.value;
      service.slug = req.body.slug;

      service
        .save()
        .then(() => {
          req.flash("success_msg", "Serviço editado com sucesso!");
          res.redirect("/admin/servicos");
        })
        .catch((err) => {
          req.flash("error_msg", "Houve um erro ao salvar");
          res.redirect("/admin/servicos");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Ocorreu um erro ao editar o serviço" + err);
      res.redirect("/admin/servicos");
    });
});

router.post("/servicos/deletar", eAdmin, (req, res) => {
  Service.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Serviço deletado com sucesso");
      res.redirect("/admin/servicos");
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar este serviço");
      res.redirect("/admin/servicos");
    });
});

// Rota de lucros

// router.get("/lucros", (req, res) => {
//   const currentDate = new Date();

//   const oneWeekAgo = new Date();
//   oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

//   Service.find({ date: { $gte: oneWeekAgo, $lte: currentDate } })
//     .then((service) => {
//       //Lógica da lucro máximo obtido
//       const totalProfit = service.reduce(
//         (total, service) => total + service.value,
//         0
//       );

//       //Lógica do lucro obtido na semana
//       const weeklyProfit = service.reduce((total, service) => {
//         if (service.date >= oneWeekAgo && service.date <= currentDate) {
//           total += service.value;
//         }
//         return total;
//       }, 0);

//       res.render("admin/profitdatas", {
//         service: service,
//         totalProfit,
//         weeklyProfit,
//       });
//     })
//     .catch((err) => {
//       req.flash("error_msg", "houve um erro interno");
//       res.redirect("/admin/servicos");
//     });
// });

module.exports = router;
