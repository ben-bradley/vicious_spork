var express = require('express'),
		app = express(),
		_ = require('underscore'),
		OneClick = require('./classes/OneClick');

var localPort = 8087;
var destination = 'http://web-2-test.integra.engr:'+localPort+'/alarm';
var oneClickConfig = require('./credentials');
var oc = new OneClick(oneClickConfig);

app.configure(function() {
	
	// app configs
	app.use(express.limit('4mb'));
	app.use(express.bodyParser()); // handle POST/PUT
	app.use(express.cookieParser()); // enable sessions
	app.use(express.session({ secret: 'blargh' })); // configure sessions
	
	app.post('/alarm', function(req, res) {
		var notifications = req.body['ns1.notification-list'];
		console.log('POST');
		// removed & modified aren't handled because they don't give enough info
		if (notifications['ns1.added-instance']) {
			var addeds = notifications['ns1.added-instance'];
			if (_.isObject(addeds)) { addeds = [ addeds ]; }
			_.each(_.flatten(addeds), function(added) {
				var alarm = new oc.Alarm(added);
				oc.emit('alarm-added', alarm);
			});
		}
		
		if (notifications['ns1.heartbeat']) { oc.emit('heartbeat'); }
		
		res.send({}); // return a response so that the oneclick api will send the next
	});
	

});


oc.on('alarm-added', function(alarm) {
	console.log('==============ADDED');
	alarm.set('Status', 'HONK!');
	oc.update(alarm);
});

oc.on('subscribed', function(id) {
	console.log('SUBSCRIBED: '+id);
});


// start the listener
app.listen(localPort);


// start the subscription
oc.subscription({ destination: destination }).start();
				
				/*added = {
					'@preexisting': 'false',
					'ns1.alarm': {
						'@id': '525ef9d0-f967-1038-0505-008010a8bc99',
						'ns1.attribute': [
							{ '@id': '0x10001', '$': '2228241' },
							{ '@id': '0x10000', '$': 'Gen_IF_Port' },
							{ '@id': '0x12d83', '$': '' },
							...
						]
					}
				}*/