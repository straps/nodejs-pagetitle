var phpjs = require('./lib/phpjs'),
	pagetitle = require('./lib/pagetitle').pagetitle,
	http = require('http'),
	express=require('express'), app=express.createServer(),
	url=require('url'),
	request = require('request'),
	//Title cache
	redis = require('redis'), rediscli;

(function initRedis(){
	var db_uri = url.parse(process.env['DUOSTACK_DB_REDIS'] || 'redis://:@127.0.0.1:6379/'),
		db_pwd = db_uri.auth.split(':')[1];
	rediscli = redis.createClient(db_uri.port, db_uri.hostname);

	if (process.env['DUOSTACK_DB_REDIS']){
		rediscli.auth(db_pwd, function () {
			console.log('Redis authenticated');
		});
	}
})();

app.get('/',function(req,res){
	var uri=req.param('uri'), callback=req.param('callback');

	console.log('Request arrived, uri='+uri);

	if (uri){
		var onDataReady=function(data){
			if (callback){
				res.send(data);
				//res.send(callback+'('+JSON.stringify(data)+')');
			}else{
				res.send(data);
			}
		};
		rediscli.get(uri,function(err,title){
			if (title){
				onDataReady({uri:uri, title:title});
			}else{
				pagetitle(uri,function(err,title){
					if (!err){
						title=phpjs.html_entity_decode(title);
						onDataReady({uri:uri, title:title});
						rediscli.setex(uri, 86400, title);
					}else{
						onDataReady({uri:uri, error:err.message});
					}
				});
			}
		});
	}else{
		res.sendfile(__dirname+'/lib/index.html');
	}
});
app.listen(3000);

console.log('Server running at http://127.0.0.1:3000/');

