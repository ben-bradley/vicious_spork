var Class = require('class.extend'),
		events = require('events'),
		request = require('request');

var ALARM_ATTRIBUTES = [
	{ hex: '0x1006e', name: 'Model_Name' },
	{ hex: '0x11f53', name: 'Model_Handle' },
	{ hex: '0x11f56', name: 'Severity' },
	{ hex: '0x11f4e', name: 'Create_Time' },
	{ hex: '0x12bc4', name: 'Alarm_Title' },
	{ hex: '0x1296e', name: 'Original_Event_Text' },
	{ hex: '0x11f4d', name: '' },
	{ hex: '0x10023', name: '' },
	{ hex: '0x4820020', name: '' },
	{ hex: '0x11f9c', name: '' },
	{ hex: '0x11fc4', name: '' },
	{ hex: '0x11f4f', name: 'Status' },
	{ hex: '0x12b4c', name: '' },
	{ hex: '0x12d79', name: '' },
	{ hex: '0x12d78', name: '' },
	{ hex: '0x11f50', name: '' },
	{ hex: '0x12a07', name: '' },
	{ hex: '0x12a05', name: '' },
	{ hex: '0x11f51', name: '' },
	{ hex: '0x12a6b', name: '' },
	{ hex: '0x10024', name: '' },
	{ hex: '0x1006a', name: '' },
	{ hex: '0x1000a', name: '' },
	{ hex: '0x23000c', name: '' },
	{ hex: '0x5f60002', name: '' },
	{ hex: '0x5f60003', name: '' },
	{ hex: '0x5f60007', name: '' },
	{ hex: '0x5f60000', name: '' },
	{ hex: '0x5f60006', name: '' },
	{ hex: '0x5f60008', name: '' },
	{ hex: '0x5f60009', name: '' },
	{ hex: '0x5f60005', name: '' },
	{ hex: '0x5f60004', name: '' },
	{ hex: '0x4560106', name: '' },
	{ hex: '0x5f60001', name: '' },
	{ hex: '0x23000e', name: '' },
	{ hex: '0x456006f', name: '' },
	{ hex: '0x456006d', name: '' },
	{ hex: '0x129ac', name: '' },
	{ hex: '0x11d42', name: '' },
	{ hex: '0x130d8', name: '' },
	{ hex: '0x130da', name: '' },
	{ hex: '0x130db', name: '' },
	{ hex: '0x130d6', name: '' },
	{ hex: '0x130d7', name: '' },
	{ hex: '0x11f52', name: '' },
	{ hex: '0x48200ae', name: '' },
	{ hex: '0x12a70', name: '' },
	{ hex: '0x12a6f', name: '' },
	{ hex: '0x4560074', name: '' },
	{ hex: '0x130dd', name: '' },
	{ hex: '0x456006e', name: '' },
	{ hex: '0x45600ee', name: '' },
	{ hex: '0x456006a', name: '' },
	{ hex: '0x12a82', name: '' },
	{ hex: '0x1298a', name: '' },
	{ hex: '0x4820067', name: '' },
	{ hex: '0x1295d', name: '' },
	{ hex: '0x5420011', name: '' },
	{ hex: '0x4560071', name: '' },
	{ hex: '0x23000d', name: '' },
	{ hex: '0x1196c', name: '' },
	{ hex: '0x11ee8', name: '' },
	{ hex: '0x129fa', name: '' },
	{ hex: '0x1006e', name: '' },
	{ hex: '0x10001', name: '' },
	{ hex: '0x10000', name: '' },
	{ hex: '0x12a51', name: '' },
	{ hex: '0x12bef', name: '' },
	{ hex: '0x12d7f', name: '' },
	{ hex: '0x12e28', name: '' },
	{ hex: '0x12e31', name: '' },
	{ hex: '0x11fc5', name: '' },
	{ hex: '0x4560072', name: '' },
	{ hex: '0x129ed', name: '' },
	{ hex: '0x11f54', name: '' },
	{ hex: '0x12d83', name: '' },
	{ hex: '0x12c05', name: '' },
	{ hex: '0x10009', name: '' },
	{ hex: '0x12e21', name: '' },
	{ hex: '0x12e22', name: '' },
	{ hex: '0x12e25', name: '' },
	{ hex: '0x12a56', name: '' },
	{ hex: '0x4560073', name: '' },
	{ hex: '0x4560107', name: '' },
	{ hex: '0x820074', name: '' },
	{ hex: '0x12a06', name: '' },
	{ hex: '0x12a04', name: '' },
	{ hex: '0x10b5a', name: '' },
	{ hex: '0x1102e', name: '' },
	{ hex: '0x10b5b', name: '' },
	{ hex: '0x12e30', name: '' },
	{ hex: '0x456006c', name: '' },
	{ hex: '0x45600db', name: '' },
	{ hex: '0x4560094', name: '' },
	{ hex: '0x4560066', name: '' },
	{ hex: '0x4560070', name: '' },
	{ hex: '0x11fc6', name: '' },
	{ hex: '0x12022', name: '' },
	{ hex: '0x11f57', name: '' },
	{ hex: '0x456006b', name: '' },
	{ hex: '0x11f9b', name: '' },
	{ hex: '0x3d007d', name: '' },
	{ hex: '0x12a63', name: '' }
];

var OneClickAPI = Class.extend({
	
	init: function(options) {
		
		this.hostname = options.hostname;
		this.username = options.username;
		this.password = options.password;
		
	},
	
	req: function(options, callback) {
		if (!options.body) { options.body = ''; }
		if (!options.method) { options.method = 'GET'; }
		
		request({
			url: 'http://'+this.hostname+'/spectrum/restful'+options.path,
			method: options.method,
			body: options.body,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/xml',
				'Content-Length': options.body.length
			},
			auth: { user: this.username, pass: this.password }
		}, callback);
	},
	
	subscription: function(options) {
		var self = this;
		
		this.destination = options.destination;
		this.maxAlarms = (options.maxAlarms || 5);
		this.maxTime = (options.maxTime || 1000);
		this.heartbeat = (options.heartbeat || 5000);
		
		var alarmXml = '';
		ALARM_ATTRIBUTES.forEach(function(attr) { alarmXml += '<rs:requested-attribute id="'+attr.hex+'"/>'; });
		
		this.subscriptionXml = '<?xml version="1.0" encoding="UTF-8"?>'+
			'<rs:subscription-request'+
			'	xmlns:rs="http://www.ca.com/spectrum/restful/schema/request"'+
			'	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"'+
			'	xsi:schemaLocation="http://www.ca.com/spectrum/restful/schema/request ../../../Rest.a/src/xsd/Request.xsd ">'+
				'<rs:push-delivery-mode>'+
					'<rs:destination-url>'+this.destination+'</rs:destination-url>'+
					'<rs:batch-notifications max-notifications="'+this.maxAlarms+'" max-time="'+this.maxTime+'"/>'+
					'<rs:heartbeat-interval>'+this.heartbeat+'</rs:heartbeat-interval>'+
				'</rs:push-delivery-mode>'+
				'<rs:alarm-request>'+alarmXml+'</rs:alarm-request>'+
			'</rs:subscription-request>';
		
		this.start = function() {
			var subscription = this;
			
			self.req({
				path: '/subscription',
				method: 'POST',
				body: this.subscriptionXml
			}, function(err, res, body) {
				if (res.statusCode == 200) {
					var json = JSON.parse(body);
					subscription.ns =	(json['ns1.subscription-response']) ? 'ns1.' :
														(json['ns2.subscription-response']) ? 'ns2.' :
														/* DEFAULT */													'';
					var ns = subscription.ns;
					subscription.id = json[ns+'subscription-response'][ns+'subscription-id'];
					self.emit('subscribed', subscription.id);
				}
				else {
					console.log('NOT SUBSCRIBED');
					console.log(res.statusCode);
				}
			});
		};
		
		return this;
		
	},
	
	Alarm: function(data) {
		if (data == undefined) { return false; }
		
		var self = this;
		
		this.preexisting = (data['@preexisting'] === 'true') ? true : false;
		this.id = data['ns1.alarm']['@id'];
		
		var dataAttrs = data['ns1.alarm']['ns1.attribute'];
		
		for (var a = 0; a < dataAttrs.length; a++) {
			var attr = dataAttrs[a];
			dataAttrs[a] = {
				hex: attr['@id'],
				val: attr['$']
			};
		}
		
		dataAttrs.forEach(function(dAttr) {
			ALARM_ATTRIBUTES.forEach(function(aAttr) {
				if (dAttr.hex == aAttr.hex) { dAttr.name = aAttr.name; }
			});
		});
		
		this.attrs = dataAttrs;
		
		// return an attribute of the alarm specified by either the hex or the name
		this.attr = function(f) {
			var vals = [];
			self.attrs.forEach(function(a) { if (a.hex == f || a.name == f) { vals.push(a); } });
			return vals;
		};
		
		// set an attribute value based on the hex or the name
		this.set = function(k, v) {
			self.attrs.forEach(function(a) {
				if (a.hex == k || a.name == k) {
					a.val = v;
					a._set = true;
				}
			})
		};
		
		// build the attribute query string
		this.updateQueryString = function() {
			var qs = '';
			self.attrs.forEach(function(a) {
				if (a._set == true) {
					qs += 'attr='+a.hex+'&val='+a.val+'&';
				}
			});
			qs = qs.replace(/\&$/,'');
			return qs;
		};
		
//		this.id = alarm['@id'];
//		this.attributes = _.map(alarm['ns1.attribute'], function(attr) {
//			return {
//				attr: attr['@id'],
//				value:	(!attr['$'])								? false : // convert missing attrs to false
//								(attr['$'] == 'false')			? false : // convert string "false" to bln false
//								(attr['$'] == 'true')				? true : // convert string "true" to bln true
//								(attr['$'].match(/^0x/))		? attr['$'] : // prevent converting hex to int
//								(Number(attr['$']))					? Number(attr['$']) : // convert number to number
//								(attr['@id'] == '0x1296e')	? attr['$'].split('\n') : // split up the originating text
//								/******* DEFAULT *******/			attr['$']
//			};
//		});
		
		return this;
	},
	
	update: function(alarm) {
		this.req({
			path: '/alarms/'+alarm.id+'?'+alarm.updateQueryString(),
			method: 'PUT',
			body: ''
		}, function(err, res, body) {
			console.log(body);
		});
	}
	
});

// add events
OneClickAPI.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = OneClickAPI;
