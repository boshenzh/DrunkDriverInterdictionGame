// create an array with nodes
var nodes = new vis.DataSet([
  // { id: 0, label: "res", shape: "image", image:"./res.png",fixed: true, x: 0, y: 10,value:10000},
  // { id: 1, label: "res", shape: "circle", fixed: true, x: 0, y: 200 },
  // { id: 2, label: "home", shape: "hexagon", fixed: true, x: 150, y: 10 },
  // { id: 3, label: "home", shape: "hexagon", fixed: true, x: 150, y: 100 },
  // { id: 4, label: "home", shape: "hexagon", fixed: true, x: 150, y: 200 },
  // { id: 5, label: "mall", shape: "box", fixed: true, x: 300 }, //,icon:{face:"FontAwesome",code:"\uf410"}
]);

// create an array with edges
var edges = new vis.DataSet([
  // { id:1,from: 0, to: 2, arrows: { to: { enabled: true, type: "vee" } },smooth: {type:'cubicBezier'}},
  // { id:2,from: 0, to: 3, arrows: { to: { enabled: true, type: "vee" } } },
  // { id:3,from: 0, to: 4, arrows: { to: { enabled: true, type: "vee" } } },
  // { id:4,from: 1, to: 2, arrows: { to: { enabled: true, type: "vee" } } },
  // { id:5,from: 1, to: 3, arrows: { to: { enabled: true, type: "vee" } } },
  // { id:6,from: 1, to: 4, arrows: { to: { enabled: true, type: "vee" } } },
  // { id:7,from: 2, to: 5, arrows: { to: { enabled: true, type: "vee" } } },
  // { id:8,from: 3, to: 5, arrows: { to: { enabled: true, type: "vee" } } },
  // { id:9,from: 4, to: 5, arrows: { to: { enabled: true, type: "vee" } } },
  // { id:10,from: 2, to: 3, arrows: { to: { enabled: true, type: "vee" } } },
  // { id:11,from: 3, to: 2, arrows: { to: { enabled: true, type: "vee" } } },
  // { id:12,from: 4, to: 3, arrows: { to: { enabled: true, type: "vee" } } },
  // { id:13,from: 3, to: 4, arrows: { to: { enabled: true, type: "vee" } } },
]);
var policeList = [];
var policeMatrix = [];
var costMatrix = [];
var nodeSize = [];
var capacityMatrix = [];
var network;
var policeNum = 2;
var curPoliceNum = 0;
var nodeInt = 6;
var bestResult = 0;
var yourResult = 0;
var ready = false;
var output = [];
var policeList = [];
var sourcePic = "./res.png"
var midPic = "./house.png"
var sinkPic = "./mall.png"


$(document).ready(function () {
  $("#inputNumNode").change(function () {
    var n = $("#inputNumNode").val();
    if (n < 5) $("#inputNumNode").val(5);
    if (n > 8) $("#inputNumNode").val(8);
  });
  $("#inputNumPolice").change(function () {
    var n = $("#inputNumPolice").val();
    if (n < 2) $("#inputNumPolice").val(2);
    if (n > 5) $("#inputNumPolice").val(5);
  });

  $("#inputNumPolice").change(function () {
    if (Number(document.getElementById("inputNumPolice").value) != NaN) {
      policeNum = parseInt(document.getElementById("inputNumPolice").value);
      curPoliceNum = policeNum;
      document.getElementById("policeIcon").innerHTML = "";
      for (let k = 0; k < curPoliceNum; k++) {
        document.getElementById("policeIcon").innerHTML +=
          ' <img src="policeman.jpg" alt="police" class="img-fluid" style="width:48px;height:48px;">';
      }
    }
  });

  $("#changeParaN").change(function (event) {
    event.preventDefault();
    var num1 = $("#inputNumNode").val();
    console.log(num1);
    $.ajax({
      method: "post",
      url: "/dataN",
      data: JSON.stringify({ numN: num1 }),
      contentType: "application/json",
      success: function (data) {
        console.log("node number updated");
      },
    });
  });
  $("#changePara").change(function (event) {
    event.preventDefault();
    var num1 = $("#inputNumPolice").val();
    $.ajax({
      method: "post",
      url: "/data",
      data: JSON.stringify({ numP: num1 }),
      contentType: "application/json",
      success: function (data) {
        console.log("polimen number updated");
      },
    });
  });
  $("#changeDiff").change(function (event) {
    event.preventDefault();
    var num1 = $("#difficulty").val();
    $.ajax({
      method: "post",
      url: "/dataD",
      data: JSON.stringify({ numD: num1 }),
      contentType: "application/json",
      success: function (data) {
        console.log("difficulty updated");
      },
    });
  });
  $("#changePortion").change(function (event) {
    event.preventDefault();
    var num1 = $("#portionDD").val();
    $.ajax({
      method: "post",
      url: "/dataDD",
      data: JSON.stringify({ numDD: num1 }),
      contentType: "application/json",
      success: function (data) {
        console.log("portion of drunken driver updated");
      },
    });
  });
});

(function ($, window, document) {
  $(function () {
    function listQ(){
       var selectValue = document.getElementById("game-category").value;
       var textValue = document.getElementById("altertext");

        if(selectValue =="iem"){
          sourcePic = "./enemybase.png";
          midPic = "./pillbox.png";
          sinkPic = "./camp.png";
          textValue.innerHTML = "Percentage of enemies:"
          generateNode();
        }
        else if(selectValue =="smug"){
          sourcePic = "./warehouse.png";
          midPic = "./checkpoint.png";
          sinkPic = "./border.png"
          textValue.innerHTML = "Percentage of smuggler:"
          generateNode();
        }
        else if(selectValue =="dd"){
           sourcePic = "./res.png"
           midPic = "./house.png"
           sinkPic = "./mall.png"
           textValue.innerHTML = "Percentage of drunk driver:"
          generateNode();
        }

    }
  document.getElementById("game-category").onchange = listQ;
      
    
    generateNode();
    // var select = document.getElementById('language');
    // var value = select.options[select.selectedIndex].value; 
    
    document.getElementById("graph-container").style.border = "dashed #800000";
    document.getElementById("graph-container").style.borderRadius = "5px";

    showEdgeButton = document.getElementById("showLocation");
    showEdgeButton.addEventListener("click", showEdge);

    hideCompleteButton = document.getElementById("compute-py");
    hideCompleteButton.addEventListener("click", runPy);
    userResultButton = document.getElementById("compute-user");
    userResultButton.addEventListener("click", runPyUser);
    userResultButton = document.getElementById("showHint");
    userResultButton.addEventListener("click", showHint);

    nodeButton = document.getElementById("generate-graph");
    nodeButton.addEventListener("click", generateNode);
    nodeButton = document.getElementById("add-police");
    nodeButton.addEventListener("click", addPolice);

    resetButton = document.getElementById("reset");
    resetButton.addEventListener("click", reset);

    var slider = document.getElementById("difficulty");
    var sliderValue = document.getElementById("difficulty-output");
    sliderValue.innerHTML = slider.value;

    var sliderDD = document.getElementById("portionDD");
    var sliderValueDD = document.getElementById("PDD-output");
    sliderValueDD.innerHTML = sliderDD.value;

    slider.oninput = function () {
      sliderValue.innerHTML = this.value;
    };
    sliderDD.oninput = function () {
      sliderValueDD.innerHTML = this.value;
    };

    var container = document.getElementById("graph-container");
    var data = {
      nodes: nodes,
      edges: edges,
    };
    var options = {};

    // initialize your network!
    network = new vis.Network(container, data, options);
  });
  
    

  
  function showHint() {
    
    const uncoloredEs = edges.get();
    var correctnum = 0;
    for (var a = 0; a < uncoloredEs.length; a++) {
      if (policeList.includes(uncoloredEs[a].id)) {
        for (var e = 1; e < output.length; e++) {
          var text = output[e].slice(1, output[e].length - 1);
          const posArray = text.split(", ");
          const bfrom = parseInt(posArray[0]);
          const bto = parseInt(posArray[1]);
          console.log("jjj");
          console.log(uncoloredEs[a]);
          console.log(bfrom);
          console.log(bto);
  
          if (uncoloredEs[a].from == bfrom && uncoloredEs[a].to == bto) {
            correctnum = correctnum +1;
            uncoloredEs[a].color = {
              color: "green",
            };
            edges.update(uncoloredEs[a]);
          } 
        }
      }
    }
    if (bestResult == yourResult){
      $("#best-output").html("That's Correct!");
    }
    else{
      $("#best-output").html(correctnum+ " polimen were placed correctly!");
    }

    

  }
  function showEdge() {
    for (var e = 1; e < output.length; e++) {
      const uncoloredEs = edges.get();
      var text = output[e].slice(1, output[e].length - 1);
      const posArray = text.split(", ");
      const bfrom = posArray[0];
      const bto = posArray[1];
      for (var a = 0; a < uncoloredEs.length; a++) {
        if (uncoloredEs[a].from == bfrom && uncoloredEs[a].to == bto) {
          uncoloredEs[a].color = {
            color: "green",
          };
          edges.update(uncoloredEs[a]);
        }
      }
    }
     $("#best-output").html("Number of drunk driver caught by best decision: " +bestResult);

  }
  function runPy() {
    reset();
    if (!ready) {
      ready = true;
      document.getElementById("difficulty").disabled = true;
      document.getElementById("inputNumPolice").disabled = true;
      document.getElementById("portionDD").disabled = true;
      document.getElementById("inputNumNode").disabled = true;
      document.getElementById("generate-graph").disabled = true;

      document.getElementById("compute-py").innerText = "Unready";

      document.getElementById("reset").disabled = false;
      document.getElementById("compute-user").disabled = false;
      document.getElementById("add-police").disabled = false;
      document.getElementById("showLocation").disabled = false;
      document.getElementById("showHint").disabled = false;

      console.log("calculate actual score");
      $.ajax({
        type: "post",
        url: "/public/correctInput.py",
        data: JSON.stringify({
          cost: costMatrix,
          weights: nodeSize,
          capacity: capacityMatrix,
        }),
        contentType: "application/json",
        success: function (data) {
          bestResult = parseInt(data[0]);

          output = data;
          console.log("data =" + data);
          // console.log(bestEdges)
          // $("#best-output").html(bestResult);
        },
      });
    } else {
      ready = false;
      document.getElementById("compute-py").innerText = "Ready";
      document.getElementById("difficulty").disabled = false;
      document.getElementById("inputNumPolice").disabled = false;
      document.getElementById("portionDD").disabled = false;
      document.getElementById("inputNumNode").disabled = false;
      document.getElementById("generate-graph").disabled = false;

      document.getElementById("reset").disabled = true;
      document.getElementById("compute-user").disabled = true;
      document.getElementById("add-police").disabled = true;
      document.getElementById("showLocation").disabled = true;
      document.getElementById("showHint").disabled = true;
    }
  }
  function runPyUser() {
    console.log("calculate user input");
    $.ajax({
      type: "post",
      url: "/public/userInput.py",
      data: JSON.stringify({
        cost: costMatrix,
        weights: nodeSize,
        capacity: capacityMatrix,
        policeInput: policeMatrix,
      }),
      contentType: "application/json",
      success: function (data) {
        console.log("data =" + data);
        yourResult = parseInt(data[0]);
        
        // $("#user-output").html(data);
        $("#percentageOut").val(
          parseInt((yourResult / bestResult) * 100) + "%"
        );
      },
    });
  }

  function reset() {
    console.log("reset clicked");
    $("#best-output").html("")
    $("#percentageOut").val(
      
    );
    curPoliceNum = policeNum;
    policeList = [];
    // policeList = [];
    policeMatrix = [];
    for (var i = 0; i < nodeInt; i++) {
      policeMatrix[i] = [];
      for (var j = 0; j < nodeInt; j++) {
        policeMatrix[i][j] = 0;
      }
    }
    // var outputSelection = document.getElementById("policeSelected");
    // outputSelection.textContent = policeList;
    document.getElementById("policeIcon").innerHTML = "";
    for (let k = 0; k < policeNum; k++) {
      document.getElementById("policeIcon").innerHTML +=
        '<img src="policeman.jpg" alt="police" class="img-fluid" style="width:48px;height:48px;">';
    }
    // document.getElementById("inputNumPolice").value = 0;
    // document.getElementById('policeIcon').innerHTML ="<span class=\"glyphicon glyphicon-user\"></span>";
    // document.getElementById("optimalSwitch").checked = false;
    const usedEdges = edges.get();

    for (var i = 0; i < usedEdges.length; i++) {
      if (usedEdges[i].color.color != "gray") {
        usedEdges[i].color = {
          color: "gray",
        };
        edges.update(usedEdges[i]);
      }
    }

    $.post("/reset", {}, function (data, status) {
      // alert("Data: " + data + "\nStatus: " + status);
    });
  }
  function addPolice() {
    console.log("buttonclicked");
    console.log(network.getConnectedNodes(network.getSelection().edges));

    console.log(parseInt(document.getElementById("inputNumPolice").value));
    var outputSelection = document.getElementById("policeSelected");

    if (
      curPoliceNum != 0 &&
      network.getConnectedNodes(network.getSelection().edges) != ""
    ) {
      //change visually: police icon
      curPoliceNum--;
      policeList.push(network.getSelection().edges[0]);
      console.log(policeList);
      document.getElementById("policeIcon").innerHTML = "";
      for (let k = 0; k < curPoliceNum; k++) {
        document.getElementById("policeIcon").innerHTML +=
          '<img src="policeman.jpg" alt="police" class="img-fluid" style="width:48px;height:48px;">';
      }
      //change edge color
      var e = network.getSelectedEdges();

      var edgeClicked = edges.get(e[0]);
      console.log(edgeClicked);
      edgeClicked.color = {
        color: "maroon",
      };
      edges.update(edgeClicked);
      //change backend
      // policeList.push(network.getConnectedNodes(network.getSelection().edges));
      // outputSelection.textContent = policeList;
      policeMatrix[edgeClicked.from][edgeClicked.to] = 1;
      console.log(edgeClicked.from);
      console.log(edgeClicked.to);

      console.log(policeMatrix);
    } else {
      if (policeNum == 0) {
        window.alert("maximum number of police is not set");
      } else if (
        network.getConnectedNodes(network.getSelection().edges) == ""
      ) {
        window.alert("edge not selected yet, please click on any edge");
      } else {
        window.alert(
          "maximum number of police is " +
            document.getElementById("inputNumPolice").value
        );
      }
    }
  }
  function generateNode() {
    console.log("nodebuttonclicked");
    var inputVal = document.getElementById("inputNumNode").value;
    nodeInt = parseInt(inputVal);
    numSink = 2;
    numSource = parseInt((nodeInt - numSink) / 2);
    numMid = nodeInt - numSink - numSource;
    if (nodeInt != NaN) {
      var nodeoptions = {};
      var edgeoptions = {};

      nodes = new vis.DataSet(nodeoptions);
      edges = new vis.DataSet(edgeoptions);

      for (var i = 0; i < numSource; i++) {
        var sourceNum1 = Math.floor(Math.random() * 100 + 10);
        nodes.add({
          id: i,
          label: "" + sourceNum1,
          shape: "image",
          image: sourcePic,
          fixed: true,
          x: 0,
          y: i * 120,
          size: sourceNum1 / 5 +25,
          
        });
      }
      for (var j = 0; j < numMid; j++) {
        var numOfPeople = Math.floor(Math.random() * 100) + 10;
        nodes.add({
          id: j + numSource,
          label: "" + numOfPeople,
          shape: "image",
          image: midPic,
          fixed: true,
          x: 250,
          y: j * 140,
          size: numOfPeople / 5 + 25,
        });
      }
      var sinkNum = 0;

      nodes.add({
        id: nodeInt - 1,
        label: "",
        shape: "image",
        image: sinkPic,
        fixed: true,
        x: 450,
        y: 50,
        size: sinkNum / 5 + 50,
      });
      nodes.add({
        id: nodeInt - 2,
        label: "" ,
        shape: "image",
        image: sinkPic,
        fixed: true,
        x: 450,
        y: 200,
        size: sinkNum / 5 + 50,
      });
      var container = document.getElementById("graph-container");

      nodeSize = [];

      const allNodes = nodes.get();
      for (var i = 0; i < allNodes.length; i++) {
        var thisN = allNodes[i];
        var weightStr = thisN.label;
        if(weightStr == ""){
          nodeSize.push(0)
        }
        else{
          var weight = parseInt(weightStr);
        
          nodeSize.push(weight);
        }
      }
      sumF = 0;
      maxF = nodeSize[0];
      for (var ele = 0; ele < nodeSize.length; ele++) {
        sumF = sumF + nodeSize[ele];
        if (maxF < nodeSize[ele]) {
          maxF = nodeSize[ele];
        }
      }

      capacityRangeL = sumF / numSource;
      capacityRangeR = maxF;

      for (var k = numSource; k < numSource + numMid; k++) {
        for (var m = 0; m < numSource; m++) {
          edges.add({
            from: m,
            to: k,
            arrows: { to: { enabled: true, type: "arrow", scaleFactor: 0.4 } },
            color: "gray",
            value: Math.floor(
              Math.random() * (capacityRangeR - capacityRangeL) + capacityRangeL
            ),
            smooth: { type: "cubicBezier", roundness: Math.random() },
            scaling: { max: 6 },
          });
        }

        //edges.add({from: j, to: i,arrows:{to:{enabled:true,type:"vee"}},color:"gray"})
      }
      for (var q = numSource; q < nodeInt - 3; q++) {
        edges.add({
          from: q,
          to: q + 1,
          arrows: { to: { enabled: true, type: "arrow", scaleFactor: 0.4 } },
          color: "gray",
          value: Math.floor(
            Math.random() * (capacityRangeR - capacityRangeL) + capacityRangeL
          ),
          smooth: { type: "curvedCCW", roundness: Math.random() },
          scaling: { max: 6 },
        });
        edges.add({
          from: q + 1,
          to: q,
          arrows: { to: { enabled: true, type: "arrow", scaleFactor: 0.4 } },
          color: "gray",
          value: Math.floor(
            Math.random() * (capacityRangeR - capacityRangeL) + capacityRangeL
          ),
          smooth: { type: "curvedCCW", roundness: Math.random() },
          scaling: { max: 6 },
        });
      }
      for (var s = numSource; s < nodeInt - 2; s++) {
        edges.add({
          from: s,
          to: nodeInt - 1,
          arrows: { to: { enabled: true, type: "arrow", scaleFactor: 0.4 } },
          color: "gray",
          value: Math.floor(
            Math.random() * (capacityRangeR - capacityRangeL) + capacityRangeL
          ),
          smooth: { type: "cubicBezier", roundness: Math.random() },
          scaling: { max: 6 },
        });
        edges.add({
          from: s,
          to: nodeInt - 2,
          arrows: { to: { enabled: true, type: "arrow", scaleFactor: 0.4 } },
          color: "gray",
          value: Math.floor(
            Math.random() * (capacityRangeR - capacityRangeL) + capacityRangeL
          ),
          smooth: { type: "cubicBezier", roundness: Math.random() },
          scaling: { max: 6 },
        });
      }
      //initialize cost matrix  & capacty matrix
      costMatrix = [];
      capacityMatrix = [];
      for (var i = 0; i < nodeInt; i++) {
        costMatrix[i] = [];
        for (var j = 0; j < nodeInt; j++) {
          if (i == j) {
            costMatrix[i][j] = 0;
          } else {
            costMatrix[i][j] = -1;
          }
        }
      }
      //initialize police matrix
      policeMatrix = [];
      for (var i = 0; i < nodeInt; i++) {
        policeMatrix[i] = [];
        for (var j = 0; j < nodeInt; j++) {
          policeMatrix[i][j] = 0;
        }
      }
      for (var i = 0; i < nodeInt; i++) {
        capacityMatrix[i] = [];
        for (var j = 0; j < nodeInt; j++) {
          capacityMatrix[i][j] = 0;
        }
      }

      //get edge and insert element in cost and capacity matrix
      const allEdges = edges.get();
      for (var i = 0; i < allEdges.length; i++) {
        var thisE = allEdges[i];
        console.log(thisE);
        if (thisE.value != 0) {
          costE = parseInt(thisE.smooth.roundness * 10);
          capacityE = thisE.value;
          fromE = thisE.from;
          ToE = thisE.to;
          console.log(ToE);
          costMatrix[fromE][ToE] = costE;
          capacityMatrix[fromE][ToE] = capacityE;
        }
      }

      var data = {
        nodes: nodes,
        edges: edges,
      };
      var options = {};

      network = new vis.Network(container, data, options);
    }
  }
})(window.jQuery, window, document);
