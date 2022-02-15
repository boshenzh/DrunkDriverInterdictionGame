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
// GET response for '/'
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

// app.post('/nump' , (req , res)=>{
//   numPolice = req.body.police;
//   console.log(req.body.police);
// })
// app.post('/numn' , (req , res)=>{
//   numNode = req.body.node;
//   console.log(req.body.node);
// })
app.post('/selection' , (req , res)=>{
  user_policeInput = req.body.policeInput;
  console.log(user_policeInput.toString());
})
app.post('/reset', (req,res)=>{
  user_policeInput =[];
  res.send("Done!")
} )


app.post('/public/userInput.py' , (req , res)=>{
  var dataToSend;
  costMatrix = req.body.cost;
   weightArray = req.body.weights;
    capacityMatrix = req.body.capacity;
    user_policeInput = req.body.policeInput;
    costMM = JSON.stringify({ costM: costMatrix, weights:weightArray, capacity:capacityMatrix,policeInput:user_policeInput})
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
    PythonShell.run('public/userInput.py', options, function (err, results) {
    if (err) throw err;
    // results is an array consisting of messages collected during execution
    
    console.log('results: %j', results);
    dataToSend = results;
    res.send(dataToSend);
  });
   
})

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
// app.get('/public/helloworld.py', function (req, res) {

//     // render the 'index' template, and pass in a few variables
//     // res.render('index', { title: 'Hey', message: 'Hello' });
//   PythonShell.run('public/helloworld.py', options, function (err, results) {
//       if (err) throw err;
//       // results is an array consisting of messages collected during execution
//       console.log('results: %j', results);
//   });

// });
// app.get('*', function(req, res){
//   res.send('Hello World');
// });


// app.get('/public/helloworld.py', function(req, res) {
//   // Call your python script here.
//   // I prefer using spawn from the child process module instead of the Python shell
//   const scriptPath = '/public/helloworld.py'
//   const process = spawn('python', [scriptPath])
//   console.log("here")
//   process.stdout.on('data', (myData) => {
//       // Do whatever you want with the returned data.
//       // ...
//       res.send("Done!")
//   })
//   process.stderr.on('data', (myErr) => {
//       // If anything gets written to stderr, it'll be in the myErr variable\
//       console.log(myErr);
//   })
// })

// Fire it up!
app.listen(3000);
console.log('Listening on port 3000');


// const express = require('express')
// const {spawn} = require('child_process');
// const app = express()
// const port = 3000

// app.get('/', (req, res) => {
 
//   var dataToSend;
//   // spawn new child process to call the python script
//   const python = spawn('python', ['helloworld.py','pram1','pram2']);
//   // collect data from script
//   python.stdout.on('data', function (data) {
//    console.log('Pipe data from python script ...');
//    dataToSend = data.toString();
//   });
//   // in close event we are sure that stream from child process is closed
//   python.on('close', (code) => {
//   console.log(`child process close all stdio with code ${code}`);
//   // send data to browser
//   res.send(dataToSend)
//   });
  
//  })
//  app.listen(port, () => console.log(`Example app listening on port 
//  ${port}!`))
