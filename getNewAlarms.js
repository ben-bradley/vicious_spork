var events = require('events'),
		http = require('http'),
		xml2js = require('xml2js'),
		_ = require('underscore'),
		restler = require('restler');

function App() {
	
	/* restler variables/data */
	this.queries = {
		getNewAlarms: function() {
			return '<?xml version="1.0" encoding="UTF-8"?>'+
			'<rs:alarm-request throttlesize="0" '+
				'xmlns:rs="http://www.ca.com/spectrum/restful/schema/request" '+
				'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '+
				'xsi:schemaLocation="http://www.ca.com/spectrum/restful/schema/request ../../../xsd/Request.xsd">'+
				'<rs:attribute-filter>'+
					'<search-criteria xmlns="http://www.ca.com/spectrum/restful/schema/filter">'+
					'<filtered-models>'+
						'<greater-than>'+
							'<attribute id="0x11f4e">'+
								'<value>1378548600</value>'+
							'</attribute>'+
						'</greater-than>'+
						'</filtered-models>'+
					'</search-criteria>'+
				'</rs:attribute-filter>'+
			'</rs:alarm-request>';
		},
		getAlarmAttributes: function(attrsToGet, alarmIds) {
			return '<?xml version="1.0" encoding="UTF-8"?>'+
			'<rs:alarm-request throttlesize="0" '+
				'xmlns:rs="http://www.ca.com/spectrum/restful/schema/request" '+
				'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '+
				'xsi:schemaLocation="http://www.ca.com/spectrum/restful/schema/request ../../../xsd/Request.xsd">'+
				'<!-- Attributes of Interest -->'+
				_.map(attrsToGet, function(attr) { return '<rs:requested-attribute id="'+attr+'"/>'; }).join('')+
				'<!-- Alarms of Interest -->'+
				'<rs:alarms id="4d2cc290-4854-1000-026e-0023aeab765c"/>'+
				'<rs:alarms id="4d2cc31a-9434-1002-034e-0080102af862"/>'+
				_.map(alarmIds, function(id) { return '<rs:alarms id="'+id+'"/>'; }).join('')+
			'</rs:alarm-request>';
		}
	};
	
	this.attrsToGet = [
		'0x11f53',
		'0x10000',
		'0x11f56',
		'0x12b4c',
		'0x11f4d',
		'0x4820179',
		'0x4825001',
		'0x10023',
		'0x4820020',
		'0x11f9c',
		'0x11fc4',
		'0x11f4f',
		'0x12d79',
		'0x12d78',
		'0x11f50',
		'0x12a07',
		'0x12a05',
		'0x11f51',
		'0x12a6b',
		'0x10024',
		'0x1006a',
		'0x1000a',
		'0x23000c',
		'0x11f4e',
		'0x5f60002',
		'0x5f60003',
		'0x5f60007',
		'0x5f60000',
		'0x5f60006',
		'0x5f60008',
		'0x5f60009',
		'0x5f60005',
		'0x5f60004',
		'0x4560106',
		'0x5f60001',
		'0x23000e',
		'0x456006f',
		'0x456006d',
		'0x129ac',
		'0x11d42',
		'0x130d8',
		'0x130da',
		'0x130db',
		'0x130d6',
		'0x130d7',
		'0x11f52',
		'0x48200ae',
		'0x12a70',
		'0x12a6f',
		'0x4560074',
		'0x130dd',
		'0x456006e',
		'0x45600ee',
		'0x456006a',
		'0x12a82',
		'0x1298a',
		'0x4820067',
		'0x1295d',
		'0x5420011',
		'0x4560071',
		'0x23000d',
		'0x1196c',
		'0x11ee8',
		'0x129fa',
		'0x1006e',
		'0x10001',
		'0x12a51',
		'0x12bef',
		'0x12d7f',
		'0x12e28',
		'0x12e31',
		'0x11fc5',
		'0x1296e',
		'0x4560072',
		'0x129ed',
		'0x11f54',
		'0x12d83',
		'0x12c05',
		'0x10009',
		'0x12e21',
		'0x12e22',
		'0x12e25',
		'0x12a56',
		'0x4560073',
		'0x4560107',
		'0x820074',
		'0x12a06',
		'0x12a04',
		'0x10b5a',
		'0x1102e',
		'0x10b5b',
		'0x12e30',
		'0x456006c',
		'0x45600db',
		'0x4560094',
		'0x4560066',
		'0x4560070',
		'0x11fc6',
		'0x12022',
		'0x11f57',
		'0x456006b',
		'0x11f9b',
		'0x3d007d',
		'0x12a63'
	];
	
	this.post = function(query, callback) {
		var req = http.request({
			hostname: 'oneclick01.integra.engr',
			auth: 'caengadm:In!0nGoQ',
			path: '/spectrum/restful/alarms',
			headers: {
				'Content-Type': 'application/xml',
				'Content-Length': query.length
			},
			method: 'POST'
		}, function(res) {
			var xml = '';
			res.setEncoding('utf8');
			res.on('data', function(chunk) { xml += chunk; });
			res.on('end', function() { xml2js.parseString(xml, callback); });
		});
		req.write(query);
		req.end();
	};
	
	/* parse the restler response to validate that alarms were returned */
	this.parseAlarms = function(data) {
		try {
			var alarms = data['alarm-response-list']['alarm-responses'][0].alarm;
			alarms = _.map(alarms, function(alarm) {
				return {
					id: alarm.$.id,
					attributes: _.map(alarm.attribute, function(attr) {
						var value = (!attr._)							? undefined :
												(attr._ == 'true')		? true :
												(attr._ == 'false')		? false :
												(attr._.match(/^0x/))	? attr._ : // prevent convering hex to int
												(Number(attr._))			? Number(attr._) :
																								attr._; // default to string
						return { attr: attr.$.id, value: value };
					})
				};
			});
		}
		catch(err) {
			console.log('PARSE_ERROR');
			console.log(err);
			var alarms = false;
		}
		return alarms;
	};
	
	/* get new alarms from the API */
	this.getNewAlarms = function() {
		var query = this.queries.getNewAlarms(),
				self = this;
		this.post(query, function(err, data) {
			var alarms = self.parseAlarms(data);
			if (alarms) { self.emit('gotNewAlarms', alarms); }
			else {
				console.log('getNewAlarms() got unexpected response:');
				console.log(err);
				console.log(data);
			}
		});
	};
	
	/* get attributes for a list of alarms */
	this.getAlarmAttributes = function(alarms) {
		var query = this.queries.getAlarmAttributes(this.attrsToGet, _.pluck(alarms, 'id')),
				self = this;
		this.post(query, function(err, data) {
			var alarms = self.parseAlarms(data);
			if (alarms) { self.emit('gotAlarmAttributes', alarms); }
			else {
				console.log('getAlarmAttributes() got unexpected response:');
				console.log(err);
				console.log(data);
			}
		});
	};
	
	this.initialize = function() {
		
		var self = this;
		
		this.on('gotNewAlarms', function(alarms) { self.getAlarmAttributes(alarms); });
		
		this.on('gotAlarmAttributes', function(alarms) {
			_.each(alarms, function(alarm) {
				console.log(alarm.attributes);
			});
		});
		
		this.getNewAlarms();
	}
	
	return this;
	
}
App.prototype.__proto__ = events.EventEmitter.prototype;

var app = new App();
app.initialize();