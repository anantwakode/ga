//Using the HiveMQ public Broker, with a random client Id
var client = new Messaging.Client("broker.mqttdashboard.com", 8000, "myclientid_ant", 10);
//Gets  called if the websocket/mqtt connection gets disconnected for any reason
//client.onConnectionLost = function (responseObject) {
    //Depending on your scenario you could implement a reconnect logic here
    //alert("connection lost: " + responseObject.errorMessage);
    //document.getElementById('txt').innerHTML = "Disconnected" ;
    //sleep(1000);
//};
//Gets called whenever you receive a message for your subscriptions
client.onMessageArrived = function (message) {
    //Do something with the push message you received
    //$('#messages').append('<span>Topic: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>');
    if (message.destinationName == "GA/14978110/DVS") {
        document.getElementById('devicestatus').innerHTML = message.payloadString;
    }
    if (message.destinationName == "GA/14978110/DVT") {
        document.getElementById('devicetime').innerHTML = message.payloadString;
    }
    if (message.destinationName == "GA/14978110/SSV") {
        document.getElementById('pumpstatus').innerHTML = message.payloadString;
        if (message.payloadString == "11") {
            document.getElementById('pumpswitch').checked = true;
        }
        else if (message.payloadString == "10") {
            document.getElementById('pumpswitch').checked = false;
        }
    }
};
//Creates a new Messaging.Message Object and sends it to the HiveMQ MQTT Broker
var publish = function (payload, topic, qos) {
    //Send your message (also possible to serialize it as JSON or protobuf or just use a string, no limitations)
    var message = new Messaging.Message(payload);
    message.destinationName = topic;
    message.qos = qos;
    client.send(message);
}

function PumpSwitchOnClick() {
    if (document.getElementById('pumpswitch').checked) {
        publish('11', 'GA/14978110/CSV', 2);
    }
    else {
        publish('10', 'GA/14978110/CSV', 2);
    }
}

function setCookie(cname, cvalue, exdays) {
    localStorage.setItem(cname, cvalue);
}

function getCookie(cname) {
    return localStorage.getItem(cname);
}

function OnConnectClick() {
    setCookie("did", document.getElementById('dname').value, 30);
    setup();
}

function setup() {
    var did = getCookie("did");
    document.getElementById('dname').value = did;
    //Connect Options
    var options = {
        timeout: 3, //Gets Called if the connection has sucessfully been established
        useSSL: false,
        onSuccess: function () {
            //alert("Connected");
            //document.getElementById('txt').innerHTML = "connected" ;
            client.subscribe('GA/14978110/DVS', {
                qos: 2
            });
            client.subscribe('GA/14978110/DVT', {
                qos: 2
            });
            client.subscribe('GA/14978110/SSV', {
                qos: 2
            });
        }, //Gets Called if the connection could not be established
        onFailure: function (message) {
            //alert("Connection failed: " + message.errorMessage);
            //document.getElementById('txt').innerHTML = message.errorMessage ;
        }
    };
    client.connect(options);
    var t = setTimeout(loop, 1000);
}


function loop() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = checkTime(m);
    s = checkTime(s);
    document.getElementById('devicetime').innerHTML = h + ":" + m + ":" + s;
    //scan113("http://192.168.43.113/state");
    //scan1("http://192.168.4.1/state");
    //var t = setTimeout(loop, 1000);
}

function checkTime(i) {
    if (i < 10) {
        i = "0" + i
    }; // add zero in front of numbers < 10
    return i;
}