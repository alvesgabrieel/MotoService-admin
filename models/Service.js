const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Service = new Schema({
  //relacionamento entre 2 documentos pelo id
  client: {
    type: Schema.Types.ObjectId, //vai armazenar o ID de um cliente
    ref: "client", // Tipe de objeto "client"
    require: true,
  },
  value: {
    type: Number,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  slug: {
    type: String,
    require: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

mongoose.model("service", Service);
