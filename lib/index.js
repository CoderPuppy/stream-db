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

		this.columnNames = {};

		this.rows = [];
		this.columns = [];

		this.updates = {};

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

					this.emit('row', row);
				}

				return row;
			};

			this.column = function column(name) {
				var self = this;

				var index = this.columnNames[name];

				if(typeof(index) == 'undefined') {
					index = this.columns.length;

					this.columnNames[name] = index;

					var column = new Column(this, name, index);

					column.on('_update', function(update) {
						self._update(update);
					});

					this.columns[index] = column;

					this.emit('column', column);

					return column;
				} else {
					return this.columns[index];
				}
			};

			this.applyUpdate = function applyUpdate(update) {
				if(typeof(update[0]) != 'object' || update[0] == null)
					return false;

				if(typeof(update[0].column) != 'string')
					return false;

				if(typeof(update[0].row) != 'number')
					return false;

				this.updates[update[2]] = update;

				this.row(update[0].row)._update(update);

				this.emit('update', update[0]);

				return true;
			};

			this.history = function history(sources) {
				var self = this;

				return Object.keys(this.updates).map(function(id) {
					return self.updates[id];
				}).filter(function(update) {
					return Scuttlebutt.filter(update, sources);
				});
			};
		}).call(this.prototype);

		return this;
	}).call(DB);
})();

exports = module.exports = DB;