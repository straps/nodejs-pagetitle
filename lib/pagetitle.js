var request = require('request');
exports.pagetitle=function(uri, callback){
	request({
		uri:uri
	}, function (error, res, body) {
		var rv='';
		if (!error && body) {
			body=body.replace(/\n/g,'');
			
			var match=body.match(/<title>(.*)<\/title>/im);
			if (match && match.length>1){
				rv=(''+match[1]).trim();
			}
		}
		callback(error, rv);
	})
};