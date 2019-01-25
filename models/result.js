const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const resultSchema = new Schema({
  id: { type: Number},
  searchString: {type: String},
  blob: {}
});

const Result = mongoose.model("Result", resultSchema);

module.exports = Result;
