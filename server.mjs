import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import morgan from 'morgan';
import cors from 'cors';

import './config/index.mjs';

const mongodbURI = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.z48jiqt.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(mongodbURI);
const database = client.db('myshop');
const productsCollection = database.collection('products');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));


// root path
app.get("/", (req, res) => {
    res.send("My Shop");
});


// Get All Products
app.get("/products", async (req, res) =>{
    try{
        const getAllProducts = productsCollection.find({});
        const arrProducts = await getAllProducts.toArray();
        res.send({
            message: "all products",
            data: arrProducts
        });
    }
    catch(err){
        console.log("error",err);
        res.status(500).send({ message: "Failed to get all products, please try later" })
    }
});


// Get single Product
app.get("/product/:id", async (req, res) =>{
    console.log(req.params.id);
    if (!ObjectId.isValid(req.params.id)) {
        res.status(403).send({ message: "incorrect product id" });
        return;
      }
    try{
        const getSingleProduct = await productsCollection.findOne({_id: new ObjectId(req.params.id)});
        res.send({
            message: "single product found",
            data: getSingleProduct
        });
    }
    catch(err){
        console.log("error",err);
        res.status(500).send({ message: "Failed to get a product, please try later" })
    }
});


// Add a product
app.post("/product", async (req, res) => {

    if (!req?.body?.name
      || !req?.body?.price
      || !req?.body?.description) {
      res.status(403).send(`
        required parameter missing. example JSON request body:
        {
          name: "abc product",
          price: "$23.12",
          description: "abc product description"
        }`);
    }
  
    try {
      const doc = {
        name: req?.body?.name,
        price: req?.body?.price,
        description: req?.body?.description,
      }
      const result = await productsCollection.insertOne(doc);
      res.status(201).send({ message: "created product" });
    } catch (error) {
      console.log("error: ", error);
      res.status(500).send({ message: "Failed to add, please try later" })
    }
  });


  // Edit a Product
app.put("/product/:id", async (req, res) =>{
    console.log(req.params.id);
    if (!ObjectId.isValid(req.params.id)) {
        res.status(403).send({ message: "incorrect product id" });
        return;
      }
    if (!req.body.name
        && !req.body.price
        && !req.body.description) {
        res.status(403).send(`
          required parameter missing. 
          atleast one parameter is required: name, price or description to complete update
          example JSON request body:
          {
            name: "abc product",
            price: "$23.12",
            description: "abc product description"
          }`);
        return;
      }

    let product = {}
    if (req.body.name) product.name = req.body.name;
    if (req.body.price) product.price = req.body.price;
    if (req.body.description) product.description = req.body.description;

    try {
        const editProduct = await productsCollection
            .updateOne(
                {_id: new ObjectId(req.params.id)}, 
                { $set: product }
            );
        console.log("Product edit: ", editProduct);
        res.send({
            message: "product edit successfully",
        });
    }
    catch(err){
        console.log("error",err);
        res.status(500).send({ message: "Failed to edit a product, please try later" })
    }
});


// Delete a Product
app.delete("/product/:id", async (req, res) =>{
    console.log(req.params.id);
    if (!ObjectId.isValid(req.params.id)) {
        res.status(403).send({ message: "incorrect product id" });
        return;
      }
    try{
        const delSingleProduct = await productsCollection.deleteOne({_id: new ObjectId(req.params.id)});
        console.log("Product deleted: ", delSingleProduct);
        res.send({
            message: "product deleted successfully",
        });
    }
    catch(err){
        console.log("error",err);
        res.status(500).send({ message: "Failed to delete a product, please try later" })
    }
});




// ports details
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});