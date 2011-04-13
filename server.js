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
		client.auth(db_pwd, function () {
			console.log('Redis authenticated');
		});
	}
})();

app.get('/',function(req,res){
	var uri=req.param('uri');
	if (uri){
		rediscli.get(uri,function(err,title){
			if (title){
				res.send({uri:uri, title:title});
			}else{
				pagetitle(uri,function(err,title){
					if (!err){
						title=phpjs.html_entity_decode(title);
						res.send({uri:uri, title:title});
						rediscli.setex(uri, 3600, title);
					}else{
						res.send({uri:uri, error:err.message});
					}
				});
			}
		});
	}else{
		res.send({
			uri:uri,
			error:'uri not passed'
		});
	}
});
app.listen(3000);

console.log('Server running at http://127.0.0.1:3000/');
