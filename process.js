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
console.log("Type stop to shutdown the server, delete to delete all the database");
process.stdin.on('readable', () => {  /* on equivalent to addEventListener */
	let dataInput = process.stdin.read();
	if (dataInput !== null) {
		let command = dataInput.trim();
		if (command === "stop") {
			console.log("Shutting down the server");
            process.exit(0);  /* exiting */
        } if(command === "delete"){
            (async()=>{
                try {
                    await client.connect();
                    const result = await client.db(databaseAndCollection.db)
                    .collection(databaseAndCollection.collection)
                    .deleteMany({});
                    console.log("deleted");
                } catch (e) {
                    console.error(e);
                } finally {
                    await client.close();
                }
            })();
        }else{
            console.log(`Invalid command: ${command}`);
        }
    }
    process.stdout.write(`Type stop to shutdown the server, delete to delete all the database`);
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
    let {name, email, delivery, bfsize,sugarLevel,itemsSelected,tip,orderInformation,phone1,phone2,phone3,cc1,cc2,cc3,cc4} = request.body;
    let total_cost = 0;
    if (bfsize === "Small") {
        total_cost +=3.99;
    } else if (bfsize === "Medium") {
        total_cost +=4.99;
    } else {
        total_cost +=6.99;
    }
    let phone = phone1+"-"+phone2+"-"+phone3;
    let creditCard = cc1+cc2+cc3+cc4;
    let credit = parseInt(creditCard);
    (async() =>{
        try{
            await client.connect();
            let order = {name:name,email:email,delivery:delivery,bfsize:bfsize,sugarLevel:sugarLevel,topping:itemsSelected,tip:tip,orderInformation:orderInformation,phoneNum:phone,creditCard:credit};
            await insertOrder(client,databaseAndCollection,order);
            await client.close();
        }catch(e){
            console.error(e);
        }
    })();
    table_one =  `<thead><tr><th>Type </th> <th> Choice </th> </tr></thead>`
    table_one += `<tbody><tr><td>Size</td><td> ${captializeFirstLetter(bfsize)} </td> </tr>`
    table_one += `<tr><td>Sugar Level</td><td> ${parseInt(sugarLevel)}% </td> </tr>`
    table_one += `<tr><td>Tip</td><td> ${parseInt(tip)}%</td> </tr></tbody>`

    table_two = `<thead><tr><th>Chosen Topping </th> <th> Cost (USD)</th> </tr></thead><tbody>`
    let itemsList = all_toppings.filter((element) => 
    itemsSelected.includes(element.value));
    itemsList.forEach((element)=> {
        table_two+=`<tr><td>${element.name} </td><td>${element.cost} </td></tr>`;
        total_cost += element.cost;
    })
    table_two += `</tbody>`
    total_cost += total_cost*parseInt(tip)*0.01;

    const variables = {
        name: name,
        email: email,
        delivery: delivery,
        info: orderInformation,
        orderTable: table_one,
        orderTableTopping: table_two,
        totalCost: total_cost.toFixed(2),
        phone: phone
      };
    response.render("orderConfirmation",variables)
 });

 app.use("/jobs", (request,response) =>{
    response.render("jobs");
});

app.get("/pastSales", (request,response) =>{
    (async() =>{
        try{
            await client.connect();
            let filter = {};
            const number = await check_num()
            const variables = {number: number};
            response.render("pastSales",variables);
            await client.close();
        }catch(e){
            console.error(e);
        }
    })();   

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
async function lookUpOrder(client, databaseAndCollection, filter){
    const cursor = client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .findOne(filter);
    return cursor;
}
function captializeFirstLetter(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
}
async function check_num(){
    let result = client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection).countDocuments();
    return result;
}