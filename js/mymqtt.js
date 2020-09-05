//Using the HiveMQ public Broker, with a random client Id
var rid = "cid" + Math.floor(Math.random()*1000000000);
var client = new Messaging.Client("test.mosquitto.org", 8081, rid, 30);
var did=0;
var connectionstate=0;


//14936902
//Gets  called if the websocket/mqtt connection gets disconnected for any reason
client.onConnectionLost = function (responseObject) {
     //Depending on your scenario you could implement a reconnect logic here
     //alert("connection lost: " + responseObject.errorMessage);
	 connectionstate=0;
	 //document.getElementById('devicestatus').innerHTML = "Not Connected";
	 LogMessage(did+" Disconnected...");
};

//Gets called whenever you receive a message for your subscriptions
client.onMessageArrived = function (message) {
    //Do something with the push message you received
    //$('#messages').append('<span>Topic: ' + message.destinationName + '  | ' + message.payloadString + '</span><br/>');
    if (message.destinationName == did+"/DVS") {
        document.getElementById('devicestatus').innerHTML = message.payloadString;
		LogMessage(message.payloadString);
    }
    else if (message.destinationName == did+"/DVT") {
        document.getElementById('devicetime').innerHTML = message.payloadString;
    }
    else if (message.destinationName == did+"/SSV") {
        //document.getElementById('pumpstatus').innerHTML = message.payloadString;
        if (message.payloadString == "11") {
            document.getElementById('pumpswitch').checked = true;
			LogMessage("Drip started...");
        }
        else if (message.payloadString == "10") {
            document.getElementById('pumpswitch').checked = false;
			LogMessage("Drip stopped...");
        }
    }
	else if (message.destinationName == did+"/SCH") {
        //document.getElementById('devicestatus').innerHTML = message.payloadString;
		var schobj = JSON.parse(message.payloadString);
		document.getElementById('auto').checked = schobj.auto;
		document.getElementById('manual').checked = schobj.manual;
		document.getElementById('dsch').value = schobj.dsch;
		document.getElementById('dur').value = schobj.dur;
		document.getElementById('upst').checked = schobj.upst;
		document.getElementById('pst').value = schobj.pst;
	
		LogMessage(message.payloadString);
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
        publish('11', did+'/CSV', 2);
		//publish('11', did+'/SSV', 2);
    }
    else {
        publish('10', did+'/CSV', 2);
		//publish('10', did+'/SSV', 2);
    }
}

function setCookie(cname, cvalue, exdays) {
    localStorage.setItem(cname, cvalue);
}

function getCookie(cname) {
    return localStorage.getItem(cname);
}

function OnApplyClick() {
	var schobj={"auto":true, "manual":true, "dsch":0, "dur":5, "upst":true, "pst":"00:00 AM"};
	schobj.auto = document.getElementById('auto').checked;
	schobj.manual = document.getElementById('manual').checked;
	schobj.dsch = document.getElementById('dsch').value;
	schobj.dur = document.getElementById('dur').value;
	schobj.upst = document.getElementById('upst').checked;
	schobj.pst = document.getElementById('pst').value;
	
	var sschobj = JSON.stringify(schobj);
	publish(sschobj, did+'/SCH', 2);
	 
	LogMessage(sschobj);
}

function OnConnectClick() {
	if(connectionstate)
	{
		client.disconnect();
	}
	else
	{
		setCookie("did", document.getElementById('dname').value, 30);
		setup();
	}
}

function LogMessage(msg) {
	var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
	h = checkTime(h);
    m = checkTime(m);
    s = checkTime(s);
    var ts = h + ":" + m + ":" + s;
	document.getElementById('log').value += ts+" "+msg+"\n";
}

function setup() {
    var cdid = getCookie("did");
    document.getElementById('dname').value = cdid;
	
	if(cdid == "")
		return;
	
	did = "GA/"+cdid;
	document.getElementById('devid').innerHTML = did;
	LogMessage(did+" Connecting...");
	
    //Connect Options
    var options = {
        timeout: 30, //Gets Called if the connection has sucessfully been established
        useSSL: true,
        onSuccess: function () {
            client.subscribe(did+'/DVS', { //14978110
                qos: 2
            });
            client.subscribe(did+'/DVT', {
                qos: 2
            });
            client.subscribe(did+'/SSV', {
                qos: 2
            });
			client.subscribe(did+'/SCH', {
                qos: 2
            });
			//document.getElementById('devicestatus').innerHTML = "Connected";
			LogMessage("Connected");
			connectionstate=1;
        }, //Gets Called if the connection could not be established
        onFailure: function (message) {
			connectionstate=0;
			//document.getElementById('devicestatus').innerHTML = "Not Connected";
            LogMessage(message.errorMessage);
        }
    };
    client.connect(options);
    var t = setTimeout(loop, 1000);
}

function loop() {
    /*var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
	h = checkTime(h);
    m = checkTime(m);
    s = checkTime(s);*/
    //document.getElementById('devicetime').innerHTML = h + ":" + m + ":" + s;
    //scan113("http://192.168.43.113/state");
    //scan1("http://192.168.4.1/state");
	if(connectionstate == 0)
		document.getElementById('conbtn').value = "Connect";
	else
		document.getElementById('conbtn').value = "Disconnect";
    var t = setTimeout(loop, 1000);
}

function checkTime(i) {
    if (i < 10) {
        i = "0" + i
    }; // add zero in front of numbers < 10
    return i;
}


