/*
  server.js is used to serve html,css file in public folder. 
*/

let path = require('path');
let express = require('express');
let logger = require('morgan');
let app = express();
// const {spawn} = require('child_process');
let {PythonShell} = require('python-shell');
let bodyParser = require('body-parser');
// const { json } = require('body-parser');
app.use(express.json())
app.use(express.urlencoded()); // to support URL-encoded bodies

// Log the requests

app.use(logger('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
let mysql = require('mysql');

let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Boshen1234",
    database: "userinfo"
});

//global variables
let numPolice = 1;
let numNode = 6;
let user_policeInput = [];
let costMatrix = [];
let weightArray = [];
let capacityMatrix = [];
let difficultyLevel = 60
let portionDD = 60

app.use(bodyParser.urlencoded({  //   body-parser to
    extended: true               //   parse data
}));                             //
app.use(bodyParser.json());      //


/*
getting ajax call in index.js and change the global variable 
*/
app.post('/data', function (req, res) {
    numPolice = parseInt(req.body.numP);
    console.log("here " + numPolice);

    res.send(numPolice.toString());

})
app.post('/dataN', function (req, res) {
    numNode = parseInt(req.body.numN);
    res.send(numNode.toString());

})
app.post('/dataD', function (req, res) {
    difficultyLevel = parseInt(req.body.numD);
    res.send(numNode.toString());

})
app.post('/dataDD', function (req, res) {
    portionDD = parseInt(req.body.numDD);
    res.send(numNode.toString());

})


app.post('/selection', (req, res) => {
    user_policeInput = req.body.policeInput;
    console.log(user_policeInput.toString());
})
app.post('/reset', (req, res) => {
    user_policeInput = [];
    res.send("Done!")
})

/*
  using npm python shell to run userInput.py with specific arguments. after the execution of python, send the result to the
  frontend.
  reference: https://www.npmjs.com/package/python-shell
*/
app.post('/public/userInput.py', (req, res) => {
    let dataToSend;
    costMatrix = req.body.cost;
    weightArray = req.body.weights;
    capacityMatrix = req.body.capacity;
    user_policeInput = req.body.policeInput;
    let gameMode = req.body.gameMode;
    let nodeAmount= req.body.nodeAmount;
    let policeAmount = req.body.policeAmount;
    let policeList = req.body.edgeSelected;
    let seed = req.body.seed;
    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    let currentTime = date+' '+time;    let costMM = JSON.stringify({
        costM: costMatrix,
        weights: weightArray,
        capacity: capacityMatrix,
        policeInput: user_policeInput
    })
    let sql = "INSERT INTO `userinfo`.`behavior` (`Time`, `Game_played`, `Node_amount`, `Police_amount`, `Percentage`, `Difficulty`, `Selected_edge`,`Seed`) VALUES ('"  + currentTime + "', '"+gameMode +"', '"+ nodeAmount+ "', '" + policeAmount +  "', '"+ portionDD+ "', '"+difficultyLevel + "', '"+policeList+ "', '"+seed+"');";

    // console.log('nodeNum = '+numNode)
    // console.log('policeNum = '+numPolice);
    // console.log('difficulty = '+difficultyLevel);
    // console.log('portionofDrunkenDriver = '+portionDD);
    // console.log(costMM);

    let options = {
        mode: 'text',
        pythonOptions: ['-u'],
        args: [numNode, numPolice, costMM, difficultyLevel, portionDD]
    }
    PythonShell.run('public/userInput.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution

        con.query(sql, function (err, result) {
            if (err) throw err;
            // result = JSON.parse(JSON.stringify(result));
            // console.log(result);
            // res.send(result);
        });
        console.log('results: %j', results);
        res.send(results);
    });


})


/*
  using npm python shell to run correctInput.py with specific arguments. after the execution of python, send the result to the
  frontend.
  reference: https://www.npmjs.com/package/python-shell
*/
app.post('/public/correctInput.py', (req, res) => {
    costMatrix = req.body.cost;
    weightArray = req.body.weights;
    capacityMatrix = req.body.capacity;
    let dataToSend;
    let costMM = JSON.stringify({costM: costMatrix, weights: weightArray, capacity: capacityMatrix})
    // console.log('nodeNum = ' + numNode)
    // console.log('policeNum = ' + numPolice);
    // console.log('difficulty = ' + difficultyLevel);
    // console.log('portionofDrunkenDriver = ' + portionDD);
    // console.log(costMM);


    let options = {
        mode: 'text',
        pythonOptions: ['-u'],
        args: [numNode, numPolice, costMM, difficultyLevel, portionDD]
    }
    PythonShell.run('public/correctInput.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        console.log('results: %j', results);
        dataToSend = results;
        res.send(dataToSend);
    });

    // res.sendFile(`${__dirname}/public/result.html`)
})

// Fire it up!
app.listen(3000);
console.log('Listening on port 3000');

