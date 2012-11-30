# Stream DB

`var DB = require('stream-db');`

## DB

### new DB(name)
Create an new database (equivalent to a table in SQL or a collection in MongoDB) with a given name.

### DB#row(index, create = false)
Gets a row at a given index.

- create: Specifies whether to create it if it doesn't exist.

### DB#column(name)
Gets or creates a column with the given name.

### DB#add(data)
Adds a row to the database initalizing it to the given data.

## Row

### Row#column(name)
Gets or creates a cell for the given column.

### Row#set(column, value)
Sets the given column to the given value.

### Row#set({ column: value... })
Sets the given columns to the given values.

### Row#get(column)
Gets the value of the given column.

### Row#get()
Gets the values of all the columns.

### Row#column(name)
Gets or creates a cell for a column of the given name.

## Column

### Column#row(index)
Gets or creates a cell for the given row.

### Column#set(index, value)
Sets the row at index to the given value.

### Column#set([ value... ])
Sets the all the rows to the given values.

### Column#get(index)
Gets the value for the row at index.

### Column#get()
Gets the values for all the rows (in the database).