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
