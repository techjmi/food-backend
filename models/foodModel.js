const mongoose = require("mongoose");

//create a food schema
const foodSchema = mongoose.Schema({
  // _id: String,
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: {
    type: String,
    default:
      "https://ideogram.ai/assets/image/lossless/response/VhdWnsDSTFijLGKgREAefQ",
  },
  category: { type: String, required: true },
});
//create a model
const Food = mongoose.model("Food", foodSchema);
module.exports = Food;
