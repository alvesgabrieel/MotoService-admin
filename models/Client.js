const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Client = new Schema({
  name: {
    type: String,
    require: true,
  },
  cellphone: {
    type: Number,
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

mongoose.model("client", Client);
