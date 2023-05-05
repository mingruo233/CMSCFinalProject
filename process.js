const http = require('http');
const fs = require("fs");
const path = require("path");
const express = require("express");   /* Accessing express module */
const { constants } = require('buffer');
const bodyParser = require("body-parser"); /* To handle post parameters */
const { MongoClient, ServerApiVersion } = require('mongodb');
let portNumber = 5001;


const app = express();
const publicPath = path.resolve(__dirname,"templates");

app.use('/additional_files/', express.static('./additional_files'));

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
   
require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') }) 
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const DBName = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_COLLECTION;
const uri = `mongodb+srv://${userName}:${password}@cluster0.ovi0hdm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const databaseAndCollection = {db: DBName, collection:collection};
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const all_toppings = [{name:"Chopped Peanuts",value:"peanuts",cost:1.00},{name:"Haw Flakes",value:"haw",cost:1.50},{name:"Raisins",value:"raisins",cost:1.00},{name:"Mango",value:"mango",cost:1.00},{name:"Sliced Almonds",value:"almond",cost:1.50},{name:"Watermelon",value:"watermelon",cost:1.00},{name:"Boba",value:"boba",cost:1.00},{name:"Grass Jelly",value:"jelly",cost:1.50}]
app.use(bodyParser.urlencoded({extended:false}));
process.stdin.setEncoding("utf8"); /* encoding */
console.log(`Web server is running at http://localhost:${portNumber}`);
console.log("Type stop to shutdown the server");
process.stdin.on('readable', () => {  /* on equivalent to addEventListener */
	let dataInput = process.stdin.read();
	if (dataInput !== null) {
		let command = dataInput.trim();
		if (command === "stop") {
			console.log("Shutting down the server");
            process.exit(0);  /* exiting */
        } else{
            console.log(`Invalid command: ${command}`);
        }
    }
    process.stdout.write(`Type stop to shut down the server:`);
    process.stdin.resume();
});
app.listen(portNumber);
app.get("/", (request, response) => { 
    response.render("index");});

app.use("/story", (request,response) =>{
    response.render("story");
});

app.use("/trackOrder", (request,response) =>{
    response.render("trackOrder");
});


app.use("/order", (request,response) =>{
    response.render("order");
});
app.post("/ordeConfirmation", (request, response) => {
    let {name, email, delivery, bfsize,sugarLevel,itemsSelected,tip,orderInformation} = request.body;


    /*(async() =>{
        try{
            await client.connect();
            let order = {name:name,email:email,delivery:delivery,bfsize:bfsize,sugarLevel:sugarLevel,topping:itemsSelected,tip:tip,orderInformation:orderInformation};
            await insertOrder(client,databaseAndCollection,order);
            await client.close();
        }catch(e){
            console.error(e);
        }
    })();
    */
    table_one =  `<thead><tr><th>Type </th> <th> Choice </th> </tr></thead>`
    table_one += `<tbody><tr><td>Size</td><td> ${captializeFirstLetter(bfsize)} </td> </tr>`
    table_one += `<tr><td>Sugar Level</td><td> ${parseInt(sugarLevel)} </td> </tr>`
    table_one += `<tr><td>Tip</td><td> ${parseInt(tip)} %</td> </tr></tbody>`

    table_two = `<thead><tr><th>Chosen Topping </th> <th> Cost </th> </tr></thead><tbody>`
    let itemsList = all_toppings.filter((element) => 
    itemsSelected.includes(element.value));
    itemsList.forEach((element)=>
    table_two+=`<tr><td>${element.name} </td><td>${element.cost} </td></tr>`)
    table_two += `</tbody>`

    const variables = {
        name: name,
        email: email,
        delivery: delivery,
        info: orderInformation,
        orderTable: table_one,
        orderTableTopping: table_two
      };
    response.render("orderConfirmation",variables)
 });
 
 async function insertOrder(client,databaseAndCollection,newOrder){
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newOrder);
}
async function lookUpPerson(client, databaseAndCollection, filter){
    const cursor = client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .find(filter);
    const result = await cursor.toArray();
    return result;
}
function captializeFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}