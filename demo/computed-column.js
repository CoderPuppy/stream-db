// var r = require('../test/interact');

// r.context.db      = r.context.db1;
// r.context.row     = r.context.row1;
// r.context.s       = r.context.s1;

// r.context.mux     = require('mux');
// r.context.through = require('through');
// r.context.es      = require('event-stream');

var through = require('through');

var DB = require('../');

var db = new DB('people');

mux(db.column('firstName').createReadStream(), db.column('lastName').createReadStream()).pipe(through(function(data) {
	try {
		data = JSON.parse(data);
	} catch(e) {
		return;
	}

	if(Array.isArray(data)) {
		var update = data[0];

		var row = db.row(update.row);

		this.queue(JSON.stringify([{
			row: update.row,
			value: row.get('firstName') + ' ' + row.get('lastName')
		}, data[1], data[2]]) + '\n');
	}
})).pipe(db.column('fullName').createWriteStream());

var row = db.add({
	firstName: 'Drew',
	lastName: 'Young'
});

process.nextTick(function() { console.log(row.get()); });

function mux() {
	var ts = through();

	[].forEach.call(arguments, function(ws) {
		ws.pipe(ts);
	});

	return ts;
}