/*
  server.js is used to serve html,css file in public folder. 
*/

var path = require('path');
var express = require('express');
var logger = require('morgan');
var app = express();
const {spawn} = require('child_process');
let {PythonShell} = require('python-shell')
var bodyParser = require('body-parser');
const { json } = require('body-parser');
app.use(express.json())
 app.use(express.urlencoded()); // to support URL-encoded bodies

// Log the requests

app.use(logger('dev'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public'))); 


//global variables
var numPolice = 1;
var numNode = 6;
var user_policeInput =[];
var costMatrix =[];
var weightArray = [];
var capacityMatrix =[];
var difficultyLevel = 60
var portionDD = 60

app.use(bodyParser.urlencoded({  //   body-parser to
  extended: true               //   parse data
}));                             //
app.use(bodyParser.json());      //


/*
getting ajax call in index.js and change the global variable 
*/
app.post('/data', function(req, res) {
  numPolice = parseInt(req.body.numP);
  console.log("here " + numPolice);

  res.send(numPolice.toString());
  
})
app.post('/dataN', function(req, res) {
  numNode = parseInt(req.body.numN);
  res.send(numNode.toString());
  
})
app.post('/dataD', function(req, res) {
  difficultyLevel = parseInt(req.body.numD);
  res.send(numNode.toString());
  
})
app.post('/dataDD', function(req, res) {
  portionDD = parseInt(req.body.numDD);
  res.send(numNode.toString());
  
})


app.post('/selection' , (req , res)=>{
  user_policeInput = req.body.policeInput;
  console.log(user_policeInput.toString());
})
app.post('/reset', (req,res)=>{
  user_policeInput =[];
  res.send("Done!")
} )

/*
  using npm python shell to run userInput.py with specific arguments. after the execution of python, send the result to the
  frontend.
  reference: https://www.npmjs.com/package/python-shell
*/
app.post('/public/userInput.py' , (req , res)=>{
  var dataToSend;
  costMatrix = req.body.cost;
   weightArray = req.body.weights;
    capacityMatrix = req.body.capacity;
    user_policeInput = req.body.policeInput;
    costMM = JSON.stringify({ costM: costMatrix, weights:weightArray, capacity:capacityMatrix,policeInput:user_policeInput})
    // console.log('nodeNum = '+numNode)
    // console.log('policeNum = '+numPolice);
    // console.log('difficulty = '+difficultyLevel);
    // console.log('portionofDrunkenDriver = '+portionDD);
    // console.log(costMM);
    
  
    var options = {
      mode: 'text',
      pythonOptions: ['-u'],
      args: [ numNode, numPolice,costMM,difficultyLevel,portionDD]
    }
    PythonShell.run('public/userInput.py', options, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    
    console.log('results: %j', results);
    dataToSend = results;
    res.send(dataToSend);
  });
   
})


/*
  using npm python shell to run correctInput.py with specific arguments. after the execution of python, send the result to the
  frontend.
  reference: https://www.npmjs.com/package/python-shell
*/
app.post('/public/correctInput.py' , (req , res)=>{
   costMatrix = req.body.cost;
   weightArray = req.body.weights;
    capacityMatrix = req.body.capacity;
  var dataToSend;
  costMM = JSON.stringify({ costM: costMatrix, weights:weightArray, capacity:capacityMatrix })
  console.log('nodeNum = '+numNode)
  console.log('policeNum = '+numPolice);
  console.log('difficulty = '+difficultyLevel);
  console.log('portionofDrunkenDriver = '+portionDD);
  console.log(costMM);
  

  var options = {
    mode: 'text',
    pythonOptions: ['-u'],
    args: [ numNode, numPolice,costMM,difficultyLevel,portionDD]
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

