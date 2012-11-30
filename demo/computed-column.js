// var r = require('../test/interact');

// r.context.db      = r.context.db1;
// r.context.row     = r.context.row1;
// r.context.s       = r.context.s1;

// r.context.mux     = require('mux');
// r.context.through = require('through');
// r.context.es      = require('event-stream');

var through     = require('through');
var demux       = require('demux');
var scuttlebutt = require('scuttlebutt-stream');

var test = require('../test');

var r    = require('../test/interact');

r.context.db  = test.db1;
r.context.row = test.row1;
r.context.s   = test.s1;

var db  = test.db1;
var row = test.row1;

// var DB = require('../');

// var db = new DB('people');

demux(db.column('firstName').createReadStream(), db.column('lastName').createReadStream()).pipe(scuttlebutt(function(update) {
	var row = db.row(update.row);

	this.queue({
		row: update.row,
		value: row.get('firstName') + ' ' + row.get('lastName')
	});
})).pipe(db.column('fullName').createWriteStream());

// var row = db.add({
// 	firstName: 'Drew',
// 	lastName: 'Young'
// });

// process.nextTick(function() {
// 	console.log(row.get());
// });