
const Food = require('../models/foodModel');

// Food add API
const addFood = async (req, res) => {
  try {
    // Extract data from the request body
    const { name, description, price, image, category } = req.body;
    // Create a new Food instanc
    const food = new Food({
      name,
      description,
      price,
      image,
      category,
    });
    // Save the new food item to the database
    await food.save();
    // Log the saved food item to the console
    console.log('Saved food item:', food);
    // Send the saved food item back as a response also u can add json to see response in postman
    res.status(201).send(food);
  } catch (error) {
    console.error('Error creating food:', error);
    res.status(500).send('Internal Server Error');
  }
};
//get food logic get food api code
const getFood=async(req,res)=>{
    try {
        const foods= await Food.find({})
        res.json(foods)
        // console.log({)
    } catch (error) {
        console.log('The Error While Getting the food is', error.message)
    }
}
//remove food with id
const deleteFoodById = async (req, res) => {
  try {
      const foodId = req.params.id;
      const deletedFood = await Food.findByIdAndDelete(foodId);
      if (!deletedFood) {
          return res.status(404).json({ message: 'Food item not found' });
      }
      res.json({ message: 'Food item deleted successfully', deletedFood });
  } catch (error) {
      console.log('The Error While Deleting the food is', error.message);
      res.status(500).json({ message: 'An error occurred while deleting the food item' });
  }
};


module.exports = { addFood,getFood ,deleteFoodById};
