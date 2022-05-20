
// create an array with nodes that will be used in vis.js
// please refer to https://visjs.github.io/vis-network/docs/network/ 
let nodes = new vis.DataSet([
    // { id: 0, label: "res", shape: "image", image:"./res.png",fixed: true, x: 0, y: 10,value:10000},
    // { id: 1, label: "res", shape: "circle", fixed: true, x: 0, y: 200 },
    // { id: 2, label: "home", shape: "hexagon", fixed: true, x: 150, y: 10 },
    // { id: 3, label: "home", shape: "hexagon", fixed: true, x: 150, y: 100 },
    // { id: 4, label: "home", shape: "hexagon", fixed: true, x: 150, y: 200 },
    // { id: 5, label: "mall", shape: "box", fixed: true, x: 300 }, //,icon:{face:"FontAwesome",code:"\uf410"}
]);

// create an array with edges
let edges = new vis.DataSet([
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

//global variables
let policeMatrix = [];
let costMatrix = [];
let nodeSize = [];
let capacityMatrix = [];
let network;
let policeNum = 2;
let curPoliceNum = 0;
let nodeInt = 6;
let bestResult = 0;
let yourResult = 0;
let ready = false;
let output = [];
let policeList = [];
let sourcePic = "./res.png"
let midPic = "./house.png"
let sinkPic = "./mall.png"
let seed = 1;
Math.seedrandom(seed);
console.log(Math.random());          // Always 0.9282578795792454
console.log(Math.random());          // Always 0.9282578795792454

//define website element beavior with JQuery.
$(document).ready(function () {
    //give constraint to input field: number of node 5 - 8
    $("#inputNumNode").change(function () {
        let n = $("#inputNumNode").val();
        if (n < 5) $("#inputNumNode").val(5);
        if (n > 8) $("#inputNumNode").val(8);
    });
    //give constraint to input field: number of seed 1-100
    $("#inputSeed").change(function () {
        let n = $("#inputSeed").val();
        if (n < 1) $("#inputSeed").val(1);
        if (n > 100) $("#inputSeed").val(100);
    });
    //give constraint to input field: number of police 2 - 5
    $("#inputNumPolice").change(function () {
        let n = $("#inputNumPolice").val();
        if (n < 2) $("#inputNumPolice").val(2);
        if (n > 5) $("#inputNumPolice").val(5);
    });
    //add police icon according to the input of police number. this is using policeman.jpg
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

    //update number of node using AJAX.
    $("#changeParaN").change(function (event) {
        event.preventDefault();
        let num1 = $("#inputNumNode").val();
        console.log(num1);
        $.ajax({
            method: "post",
            url: "/dataN",
            data: JSON.stringify({numN: num1}),
            contentType: "application/json",
            success: function (data) {
                console.log("node number updated");
            },
        });
    });

    //update number of police using AJAX
    $("#changePara").change(function (event) {
        event.preventDefault();
        let num1 = $("#inputNumPolice").val();
        $.ajax({
            method: "post",
            url: "/data",
            data: JSON.stringify({numP: num1}),
            contentType: "application/json",
            success: function (data) {
                console.log("polimen number updated");
            },
        });
    });

    //update difficulty of the game once the scroll bar changed
    $("#changeDiff").change(function (event) {
        event.preventDefault();
        let num1 = $("#difficulty").val();
        $.ajax({
            method: "post",
            url: "/dataD",
            data: JSON.stringify({numD: num1}),
            contentType: "application/json",
            success: function (data) {
                console.log("difficulty updated");
            },
        });
    });

    //update portion of drunk driver using AJAX
    $("#changePortion").change(function (event) {
        event.preventDefault();
        let num1 = $("#portionDD").val();
        $.ajax({
            method: "post",
            url: "/dataDD",
            data: JSON.stringify({numDD: num1}),
            contentType: "application/json",
            success: function (data) {
                console.log("portion of drunken driver updated");
            },
        });
    });
});

(function ($, window, document) {
    $(function () {
        /*
          change the text and pictures according to the game category
        */
        function listQ() {
            let selectValue = document.getElementById("game-category").value;
            let textValue = document.getElementById("altertext");
            let legend1 = document.getElementById("res-legend");

            if (selectValue == "iem") {
                sourcePic = "./enemybase.png";
                midPic = "./pillbox.png";
                sinkPic = "./camp.png";
                textValue.innerHTML = "Percentage of enemies:"
                document.getElementById('legend-1').innerHTML= "<span><img src='enemybase.png' alt='enemybase' style='width:20px;height:20px;'></span> Enemy Base";
                document.getElementById('legend-2').innerHTML= "<span><img src='pillbox.png' alt='pillbox' style='width:20px;height:20px;'></span> Pillbox";
                document.getElementById('legend-3').innerHTML= "<span><img src='camp.png' alt='camp' style='width:20px;height:20px;'></span> Camp";
                document.getElementById('first-sec').innerHTML= " <b>Number at each node:</b><br>Number of opponent armies starting incading at each node";
                document.getElementById('second-sec').innerHTML= "<b>Scene:</b><br>Opponent armies start invading from enemy bases and pillboxes to the<br>military base camp<br>Our army locations for catching maximum number of opponent armies are needed ";

                generateNode();
            } else if (selectValue == "smug") {
                sourcePic = "./warehouse.png";
                midPic = "./checkpoint.png";
                sinkPic = "./border.png"
                textValue.innerHTML = "Percentage of smuggler:"
                document.getElementById('legend-1').innerHTML= "<span><img src='warehouse.png' alt='warehouse' style='width:20px;height:20px;'></span> Warehouse";
                document.getElementById('legend-2').innerHTML= "<span><img src='checkpoint.png' alt='checkpoint' style='width:20px;height:20px;'></span> Checkpoint";
                document.getElementById('legend-3').innerHTML= "<span><img src='border.png' alt='border' style='width:20px;height:20px;'></span> Border";
                document.getElementById('first-sec').innerHTML= " <b>Number at each node:</b><br>Number of smugglers starting moving from each node";
                document.getElementById('second-sec').innerHTML= "<b>Scene:</b><br>Smugglers carrying illegal drugs start moving from illegal goods warehouses<br>and checkpoints to the US-Mexico border<br>The police Locations for catching maximum number of smugglers are needed ";

                generateNode();
            } else if (selectValue == "dd") {
                sourcePic = "./res.png"
                midPic = "./house.png"
                sinkPic = "./mall.png"
                textValue.innerHTML = "Percentage of drunk driver:"
                document.getElementById('legend-1').innerHTML= "<span><img src='res.png' alt='res' style='width:20px;height:20px;'></span> Restauraunt";
                document.getElementById('legend-2').innerHTML= "<span><img src='house.png' alt='house' style='width:20px;height:20px;'></span> House";
                document.getElementById('legend-3').innerHTML= "<span><img src='mall.png' alt='mall' style='width:20px;height:20px;'></span> Mall";
               
                document.getElementById('first-sec').innerHTML= " <b>Number at each node:</b><br>Number of drivers start moving from each node";
                document.getElementById('second-sec').innerHTML= "<b>Scene:</b><br>Drivers including drunken drives start moving from restaurants and <br>residential areas to the shopping mall.<br>The police Locations for catching maximum number of drunken drivers are needed ";

                generateNode();
            }

        }

        document.getElementById("game-category").onchange = listQ;

        //generate graph in the beginning
        generateNode();
        // let select = document.getElementById('language');
        // let value = select.options[select.selectedIndex].value;

        document.getElementById("graph-container").style.border = "dashed #800000";
        document.getElementById("graph-container").style.borderRadius = "5px";
        /*
          give button eventlistener.
        */
        let showEdgeButton = document.getElementById("showLocation");
        showEdgeButton.addEventListener("click", showEdge);

        let hideCompleteButton = document.getElementById("compute-py");
        hideCompleteButton.addEventListener("click", runPy);
        let userResultButton = document.getElementById("compute-user");
        userResultButton.addEventListener("click", runPyUser);
        userResultButton = document.getElementById("showHint");
        userResultButton.addEventListener("click", showHint);

        let nodeButton = document.getElementById("generate-graph");
        nodeButton.addEventListener("click", generateNode);
        nodeButton = document.getElementById("add-police");
        nodeButton.addEventListener("click", addPolice);

        let resetButton = document.getElementById("reset");
        resetButton.addEventListener("click", reset);

        let slider = document.getElementById("difficulty");
        let sliderValue = document.getElementById("difficulty-output");
        sliderValue.innerHTML = slider.value;

        let sliderDD = document.getElementById("portionDD");
        let sliderValueDD = document.getElementById("PDD-output");
        sliderValueDD.innerHTML = sliderDD.value;

        //change the displayed text value
        slider.oninput = function () {
            sliderValue.innerHTML = this.value;
        };
        sliderDD.oninput = function () {
            sliderValueDD.innerHTML = this.value;
        };

        let container = document.getElementById("graph-container");
        let data = {
            nodes: nodes,
            edges: edges,
        };
        let options = {};

        // initialize the network
        network = new vis.Network(container, data, options);
    });


    /*
      functionality of show hint button. change the edge color to green 
    */
    function showHint() {

        const uncoloredEs = edges.get();
        let correctnum = 0;
        for (let a = 0; a < uncoloredEs.length; a++) {
            if (policeList.includes(uncoloredEs[a].id)) {
                for (let e = 1; e < output.length; e++) {
                    let text = output[e].slice(1, output[e].length - 1);
                    const posArray = text.split(", ");
                    const bfrom = parseInt(posArray[0]);
                    const bto = parseInt(posArray[1]);
                    console.log(uncoloredEs[a]);
                    console.log(bfrom);
                    console.log(bto);

                    if (uncoloredEs[a].from == bfrom && uncoloredEs[a].to == bto) {
                        correctnum = correctnum + 1;
                        uncoloredEs[a].color = {
                            color: "green",
                        };
                        edges.update(uncoloredEs[a]);
                    }
                }
            }
        }
        if (bestResult == yourResult) {
            $("#best-output").html("That's Correct!");
        } else {
            $("#best-output").html(correctnum + " polimen were placed correctly!");
        }


    }

    /*
    function for display answer button. display the correct answer for the current graph. 
    */
    function showEdge() {
        for (let e = 1; e < output.length; e++) {
            const uncoloredEs = edges.get();
            let text = output[e].slice(1, output[e].length - 1);
            const posArray = text.split(", ");
            const bfrom = posArray[0];
            const bto = posArray[1];
            for (let a = 0; a < uncoloredEs.length; a++) {
                if (uncoloredEs[a].from == bfrom && uncoloredEs[a].to == bto) {
                    uncoloredEs[a].color = {
                        color: "green",
                    };
                    edges.update(uncoloredEs[a]);
                }
            }
        }
        //  $("#best-output").html("Number of drunk driver caught by best decision: " +bestResult);

    }

    /*

    run the python code for calculating correct input when user hit "ready" button. it also disable and enable buttons
  */
    function runPy() {
        reset();
        if (!ready) {
            ready = true;
            document.getElementById("difficulty").disabled = true;
            document.getElementById("inputNumPolice").disabled = true;
            document.getElementById("portionDD").disabled = true;
            document.getElementById("inputNumNode").disabled = true;
            document.getElementById("inputSeed").disabled = true;

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
            document.getElementById("inputSeed").disabled = false;

            document.getElementById("generate-graph").disabled = false;

            document.getElementById("reset").disabled = true;
            document.getElementById("compute-user").disabled = true;
            document.getElementById("add-police").disabled = true;
            document.getElementById("showLocation").disabled = true;
            document.getElementById("showHint").disabled = true;
        }
    }

    /*
      run the python code for calculating user input when user hit "display answer" button.
       it also disable and enable buttons
    */
    function runPyUser() {
        console.log("calculate user input");
        let selectedValue = document.getElementById("game-category").value;
        $.ajax({
            type: "post",
            url: "/public/userInput.py",
            data: JSON.stringify({
                cost: costMatrix,
                weights: nodeSize,
                capacity: capacityMatrix,
                policeInput: policeMatrix,
                gameMode: selectedValue,
                nodeAmount: nodeInt,
                policeAmount:policeNum,
                edgeSelected:policeList,
                seed:seed
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

    /*
      reset everything to default. called when clicking on "reset" button

    */
    function reset() {
        console.log("reset clicked");
        $("#best-output").html("")
        $("#percentageOut").val();
        curPoliceNum = policeNum;
        policeList = [];
        // policeList = [];
        policeMatrix = [];
        for (let i = 0; i < nodeInt; i++) {
            policeMatrix[i] = [];
            for (let j = 0; j < nodeInt; j++) {
                policeMatrix[i][j] = 0;
            }
        }
        // let outputSelection = document.getElementById("policeSelected");
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

        for (let i = 0; i < usedEdges.length; i++) {
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

    /*
      change edge color when click on edge& click on "add police button". update the global let iable.
    */
    function addPolice() {
        console.log("buttonclicked");
        console.log(network.getConnectedNodes(network.getSelection().edges));

        console.log(parseInt(document.getElementById("inputNumPolice").value));
        let outputSelection = document.getElementById("policeSelected");

        if (
            curPoliceNum != 0 &&
            network.getConnectedNodes(network.getSelection().edges) !== ""
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
            let e = network.getSelectedEdges();

            let edgeClicked = edges.get(e[0]);
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

    /*
      used for generating node network graph. parsing user default and generate specific graph.
      please refer to https://visjs.github.io/vis-network/docs/network/
    */
    function generateNode() {
        seed = document.getElementById("inputSeed").value;
        Math.seedrandom(seed);
        console.log("nodebuttonclicked");
        let inputVal = document.getElementById("inputNumNode").value;

        nodeInt = parseInt(inputVal);
        numSink = 2;
        numSource = parseInt((nodeInt - numSink) / 2);
        numMid = nodeInt - numSink - numSource;
        if (nodeInt != NaN) {
            let nodeoptions = {};
            let edgeoptions = {};

            nodes = new vis.DataSet(nodeoptions);
            edges = new vis.DataSet(edgeoptions);

            for (let i = 0; i < numSource; i++) {
                let sourceNum1 = Math.floor(Math.random() * 100 + 10);
                nodes.add({
                    id: i,
                    label: "" + sourceNum1,
                    shape: "image",
                    image: sourcePic,
                    fixed: true,
                    x: 0,
                    y: i * 120,
                    size: sourceNum1 / 5 + 25,

                });
            }
            for (let j = 0; j < numMid; j++) {
                let numOfPeople = Math.floor(Math.random() * 100) + 10;
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
            let sinkNum = 0;

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
                label: "",
                shape: "image",
                image: sinkPic,
                fixed: true,
                x: 450,
                y: 200,
                size: sinkNum / 5 + 50,
            });
            let container = document.getElementById("graph-container");

            nodeSize = [];

            const allNodes = nodes.get();
            for (let i = 0; i < allNodes.length; i++) {
                let thisN = allNodes[i];
                let weightStr = thisN.label;
                if (weightStr == "") {
                    nodeSize.push(0)
                } else {
                    let weight = parseInt(weightStr);

                    nodeSize.push(weight);
                }
            }
            sumF = 0;
            maxF = nodeSize[0];
            for (let ele = 0; ele < nodeSize.length; ele++) {
                sumF = sumF + nodeSize[ele];
                if (maxF < nodeSize[ele]) {
                    maxF = nodeSize[ele];
                }
            }

            capacityRangeL = sumF / numSource;
            capacityRangeR = maxF;

            for (let k = numSource; k < numSource + numMid; k++) {
                for (let m = 0; m < numSource; m++) {
                    edges.add({
                        from: m,
                        to: k,
                        arrows: {to: {enabled: true, type: "arrow", scaleFactor: 0.4}},
                        color: "gray",
                        value: Math.floor(
                            Math.random() * (capacityRangeR - capacityRangeL) + capacityRangeL
                        ),
                        smooth: {type: "cubicBezier", roundness: Math.random()},
                        scaling: {max: 6},
                    });
                }

                //edges.add({from: j, to: i,arrows:{to:{enabled:true,type:"vee"}},color:"gray"})
            }
            for (let q = numSource; q < nodeInt - 3; q++) {
                edges.add({
                    from: q,
                    to: q + 1,
                    arrows: {to: {enabled: true, type: "arrow", scaleFactor: 0.4}},
                    color: "gray",
                    value: Math.floor(
                        Math.random() * (capacityRangeR - capacityRangeL) + capacityRangeL
                    ),
                    smooth: {type: "curvedCCW", roundness: Math.random()},
                    scaling: {max: 6},
                });
                edges.add({
                    from: q + 1,
                    to: q,
                    arrows: {to: {enabled: true, type: "arrow", scaleFactor: 0.4}},
                    color: "gray",
                    value: Math.floor(
                        Math.random() * (capacityRangeR - capacityRangeL) + capacityRangeL
                    ),
                    smooth: {type: "curvedCCW", roundness: Math.random()},
                    scaling: {max: 6},
                });
            }
            for (let s = numSource; s < nodeInt - 2; s++) {
                edges.add({
                    from: s,
                    to: nodeInt - 1,
                    arrows: {to: {enabled: true, type: "arrow", scaleFactor: 0.4}},
                    color: "gray",
                    value: Math.floor(
                        Math.random() * (capacityRangeR - capacityRangeL) + capacityRangeL
                    ),
                    smooth: {type: "cubicBezier", roundness: Math.random()},
                    scaling: {max: 6},
                });
                edges.add({
                    from: s,
                    to: nodeInt - 2,
                    arrows: {to: {enabled: true, type: "arrow", scaleFactor: 0.4}},
                    color: "gray",
                    value: Math.floor(
                        Math.random() * (capacityRangeR - capacityRangeL) + capacityRangeL
                    ),
                    smooth: {type: "cubicBezier", roundness: Math.random()},
                    scaling: {max: 6},
                });
            }
            //initialize cost matrix  & capacty matrix
            costMatrix = [];
            capacityMatrix = [];
            for (let i = 0; i < nodeInt; i++) {
                costMatrix[i] = [];
                for (let j = 0; j < nodeInt; j++) {
                    if (i == j) {
                        costMatrix[i][j] = 0;
                    } else {
                        costMatrix[i][j] = -1;
                    }
                }
            }
            //initialize police matrix
            policeMatrix = [];
            for (let i = 0; i < nodeInt; i++) {
                policeMatrix[i] = [];
                for (let j = 0; j < nodeInt; j++) {
                    policeMatrix[i][j] = 0;
                }
            }
            for (let i = 0; i < nodeInt; i++) {
                capacityMatrix[i] = [];
                for (let j = 0; j < nodeInt; j++) {
                    capacityMatrix[i][j] = 0;
                }
            }

            //get edge and insert element in cost and capacity matrix
            const allEdges = edges.get();
            for (let i = 0; i < allEdges.length; i++) {
                let thisE = allEdges[i];
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

            let data = {
                nodes: nodes,
                edges: edges,
            };
            let options = {};

            network = new vis.Network(container, data, options);
        }
    }
})(window.jQuery, window, document);
