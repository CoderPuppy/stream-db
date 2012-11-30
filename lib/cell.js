var Scuttlebutt = require('scuttlebutt');
var util        = require('util');

var id = require('./id');

var Cell = (function() {
	function Cell(db, row, column) {
		this.db = db;
		this.row = row;
		this.column = column;

		this.index = row.index;
		this.name  = column.name;

		this.update = undefined;

		column.add(this);
		row.add(this);

		Scuttlebutt.call(this, id);
	}
	util.inherits(Cell, Scuttlebutt);

	return (function() {
		(function() {
			this.set = function set(val) {
				if(val === undefined)
					val = null;

				this.localUpdate({
					db: this.db.name,
					row: this.row.index,
					column: this.column.name,
					value: val
				});

				return this;
			};

			this.get = function get() {
				if(this.update)
					return this.update[0].value;
				else
					return null;
			};

			this.applyUpdate = function applyUpdate(update) {
				if(typeof(update[0]) != 'object' || update[0] == null)
					return false;

				if(typeof(this.update) != 'undefined') {
					if(this.update[1] > update[1])
						return false;
					else if(this.update[2] == update[2] && this.update[1] == update[1])
						return false;
				}

				if(typeof(update[0].column) == 'string' && update[0].column != this.name)
					return false;

				if(typeof(update[0].row) == 'number' && update[0].row != this.index)
					return false;

				this.update = update;

				this.emit('update', update[0].value);

				return true;
			};

			this.history = function history(sources) {
				var self = this;

				if(Scuttlebutt.filter(this.update))
					return [ this.update ];

				return [];
			};
		}).call(this.prototype);

		return this;
	}).call(Cell);
})();

exports = module.exports = Cell;