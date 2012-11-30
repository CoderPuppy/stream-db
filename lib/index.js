var Scuttlebutt = require('scuttlebutt');
var util        = require('util');

var Row    = require('./row');
var Cell   = require('./cell');
var id     = require('./id');
var Column = require('./column');

var DB = (function() {
	// Should it be row oriented or column oriented.
	// Row oriented is good for iteration.
	// Column oriented is good for summing stuff up.
	// Row oriented should do for now. (But it could change)

	// Name must be unique
	function DB(name) {
		this.name = name;

		this.rows = [];

		// This might not be used immediatly.
		// But the plan is for them to sum up all the data from the rows of that column (or of this column of each row)
		// name => stream
		this.columns = {};

		Scuttlebutt.call(this, id);
	}
	util.inherits(DB, Scuttlebutt);

	return (function() {
		this.id = id;

		(function() {
			this.add = function add(data) {
				var row = this.row(this.rows.length, true);

				row.set(data);

				return row;
			};

			this.row = function row(id, create) {
				var self = this;

				var row = this.rows[id];

				if(!row && create !== false) {
					row = new Row(this, id);

					row.on('_update', function(update) {
						self._update(update);
					});

					this.rows[id] = row;
				}

				return row;
			};

			this.column = function column(name) {
				var column = this.columns[name];

				if(!column) {
					column = new Column(this, name);

					column.on('_update', function(update) {
						self._update(update);
					});

					this.columns[name] = column;
				}

				return column;
			}

			this.applyUpdate = function applyUpdate(update) {
				if(typeof(update[0]) != 'object' || update[0] == null)
					return false;

				if(typeof(update[0].column) != 'string')
					return false;

				if(typeof(update[0].row) != 'number')
					return false;

				this.row(update[0].row)._update(update);

				this.emit('update', update[0]);

				return true;
			};

			this.history = function history(sources) {
				var self = this;

				return Object.keys(this.sources).map(function(id) {
					return self.sources[id];
				}).filter(function(update) {
					return Scuttlebutt.filter(update, sources);
				});
			};
		}).call(this.prototype);

		return this;
	}).call(DB);
})();

exports = module.exports = DB;