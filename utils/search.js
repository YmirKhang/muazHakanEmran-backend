var vendors = [
    {
        "name": "Uzak",
        "holding": 10,
        "capacity": 2000,
        "_id": "5a87a6a47d0392036665ab35",
        "location": {
            "type": "Point",
            "coordinates": [
                41.282636,
                29.0226
            ]
        },
        "isFactory": false
    },
    {
        "name": "Uzak",
        "holding": 20,
        "capacity": 2000,
        "_id": "5a87af8a6304171585ce60db",
        "location": {
            "type": "Point",
            "coordinates": [
                41.282636,
                29.0226
            ]
        },
        "isFactory": false
    },
    {
        "name": "Uzak",
        "holding": 30,
        "capacity": 2000,
        "_id": "5a87f66d50157e2ed0314ab3",
        "location": {
            "type": "Point",
            "coordinates": [
                41.282636,
                29.0226
            ]
        },
        "isFactory": false
    },
    {
        "name": "Node1",
        "holding": 0,
        "capacity": 2000,
        "_id": "5a87fc2a2da53633cb84a28c",
        "location": {
            "type": "Point",
            "coordinates": [
                41.282636,
                29.1226
            ]
        },
        "isFactory": false
    },
    {
        "name": "Node3",
        "holding": 0,
        "capacity": 2000,
        "_id": "5a87fc342da53633cb84a28d",
        "location": {
            "type": "Point",
            "coordinates": [
                41.282536,
                29.1226
            ]
        },
        "isFactory": false
    },
    {
        "name": "Node4",
        "holding": 0,
        "capacity": 2000,
        "_id": "5a87fc402da53633cb84a28e",
        "location": {
            "type": "Point",
            "coordinates": [
                41.282236,
                29.1226
            ]
        },
        "isFactory": false
    },
    {
        "name": "Node4",
        "holding": 0,
        "capacity": 2000,
        "_id": "5a87fc482da53633cb84a28f",
        "location": {
            "type": "Point",
            "coordinates": [
                41.282236,
                29.1226
            ]
        },
        "isFactory": false
    },
    {
        "name": "Node6",
        "holding": 0,
        "capacity": 2000,
        "_id": "5a87fc522da53633cb84a290",
        "location": {
            "type": "Point",
            "coordinates": [
                41.282236,
                29.2226
            ]
        },
        "isFactory": false
    },
    {
        "name": "Node7",
        "holding": 0,
        "capacity": 2000,
        "_id": "5a87fc6d2da53633cb84a291",
        "location": {
            "type": "Point",
            "coordinates": [
                41.282236,
                29.2226
            ]
        },
        "isFactory": false
    },
    {
        "name": "Node7",
        "holding": 0,
        "capacity": 200000,
        "_id": "5a87fcf9d35d4934e48660ec",
        "location": {
            "type": "Point",
            "coordinates": [
                41.282236,
                29.2326
            ]
        },
        "isFactory": true
    }
];


function aStarSearch(nodes) {

}

function distance(a, b) {
    console.log(a);
    console.log(b);
    return getDistance(a.location.coordinates[0], a.location.coordinates[1], b.location.coordinates[0], b.location.coordinates[1]);
}


function getDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function isFactory(node) {
    return node.isFactory;
}
function heuristic(a) {
    var factory = deneme.filter(function (vendor) {
        return vendor.isFactory == true;
    });

    return distance(a, factory[0]);
}

function hash(node) {
    return node._id;
}

function neighbor(node) {
    neighbors = node.neighbors;
    //console.log(neighbors);
    var nodesStored = [];

    neighbors.forEach(function (item) {
        nodesStored.push(deneme.filter(function (o) {
            return o._id === item._id;
        }))
    });

    /*nodesStored.forEach(function(item){

     item[0].holdingSum= item[0].holding + node.holdingSum;


     });*/
    //console.log(nodesStored);
    return nodesStored
}


/*
 var path = aStar({
 start:startNode,
 isEnd: isFactory,
 neighbor: neighbor,
 distance: distance,
 heuristic: heuristic,
 hash: hash,
 timeout:10000

 });
 */
//console.log(path);

//console.log(path);
//console.log(deneme);
//console.log(neighbors = neighbor(startNode));


function getStops(startCor, searchCoverage) {
    var factory = vendors.filter(function (vendor) {
        return vendor.isFactory == true;
    });
    var target = factory[0].location.coordinates;


    var dirVec = [target[0] - startCor[0], target[1] - startCor[1]]
    inConeList = []


    for (i = 0; i < vendors.length; i++) {
        coor = vendors[i].location.coordinates;
        var fromStart = [coor[0] - startCor[0], coor[1] - startCor[1]];
        var toEnd = [target[0] - coor[0], target[1] - coor[1]];
        vendors[i].cosSimToStart = cosSim(dirVec, fromStart);
        vendors[i].cosSimToTarget = cosSim(dirVec, toEnd);


        /*
        console.log(cosSimToStart);
        console.log(cosSimToTarget);
        console.log('dirVec: ' + dirVec);
        console.log('fromStart: ' + fromStart);
        console.log('toEnd: ' + toEnd);
        */



        if(vendors[i].cosSimToStart > 1-searchCoverage && vendors[i].cosSimToTarget > 1-searchCoverage && vendors[i].holding>0){
            inConeList.push(vendors[i])
        }
        return inConeList
    }


}
start_coor = [41.2, 28.1];

console.log(getStops(start_coor, 10));



function cosSim(v1, v2) {
    return (v1[0] * v2[0] + v1[1] * v2[1]) / (norm2(v1) * norm2(v2))

}

function norm2(a) {
    var sumsqr = 0;
    for (var i = 0; i < a.length; i++) sumsqr += a[i] * a[i];
    return Math.sqrt(sumsqr);
}