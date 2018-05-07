const express = require('express');
const cors = require('cors');
const mongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser'); //read form data and form fields
const methodOverride = require('method-override'); //to support PUT and DELETE FROM browssers

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(methodOverride('_method'));
const mongoServerURL = "mongodb://bmss:bmssproject@ds223009.mlab.com:23009/librarydb";

//default route - display all items

function displayJSON(route, Category)
{
	app.get(route, (request, response, next) => {
		mongoClient.connect(mongoServerURL, (err, db) => {
			if (err)
				console.log("DB Connect Error:" + err.message);
			
			//connect to the librarydb
			const librarydb = db.db("librarydb");
			
			//read from the books collections
			librarydb.collection("books").find(Category).toArray((err, bookDocsArray) => {
				if (err)
					console.log(err.message);
				
				response.send(JSON.stringify(bookDocsArray));
			});
			
			//close the connection to the db
			db.close();
		});
	});
}


//displayJSON('route', {key:"value"});
displayJSON('/', {});
displayJSON('/Fiction', {Category:"Fiction"});
displayJSON('/Romance', {Category:"Romance"});
displayJSON('/Adventure', {Category:"Adventure"});
displayJSON('/Scfi', {Category:"Science Fiction"});
displayJSON('/Fantasy', {Category:"Fantasy"});
displayJSON('/Drama', {Category:"Drama"});

//get one book by book name - used in update and delete web pages
app.get('/books/:bookName', (request, response, next) => {

	const bookName = request.params.bookName;

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to librarydb
		const librarydb = db.db("librarydb");

		console.log(bookName);
		//build the query filter
		let query = {Book_Name:bookName};

		//read from librarydb books collection
		librarydb.collection("books").find(query).toArray((err, booksArray) => {
			if (err)
				console.log(err.message);

			response.send(JSON.stringify(booksArray));
		});

		//close the connection to the db
		db.close();
	});

});

//add a new book - using HTTP POST method
app.post('/books', (request, response, next) => {
	//access the form fields by the same names as in the HTML form
	const bookName = request.body.bookName;
	const bookAuthor = request.body.Author;
	const bookYearPublished = request.body.YearPublished;
	const bookPublishedBy = request.body.PublishedBy;
	const bookCategory = request.body.Category;

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to librarydb
		const librarydb = db.db("librarydb");
		
		const newBook = {Book_Name:bookName, Author:bookAuthor, Year_Published:bookYearPublished,
						Published_By:bookPublishedBy, Category:bookCategory};
		//insert to librarydb books collection
		librarydb.collection("books").insertOne(newBook, (err, result) => {
			if (err) {
				console.log(err.message);
			}

			if (result.insertedCount == 1) {
				
				response.redirect("/static/books.html");
			}
			else
				response.end("Book " + bookName + " could not be added!!");

			
		});

		//close the connection to the db
		db.close();
	});	
});

//update book - uisng HTTP PUT method
app.put('/books', (request, response, next) => {
	console.log("in PUT");
	const bookName = request.param('bookName');
	const bookAuthor = request.param('Author');
	const bookYearPublished = request.param('YearPublished');
	const bookPublishedBy = request.param('PublishedBy');
	const bookCategory = request.param('Category');


	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to librarydb
		const librarydb = db.db("librarydb");
		
		//we are updating by the Book_Name
		const updateFilter = {Book_Name:bookName};
		const updateValues = {$set:{Author:bookAuthor, Year_Published:bookYearPublished,
						Published_By:bookPublishedBy,Category:bookCategory}};
		//insert from librarydb books collection
		librarydb.collection("books").updateOne(updateFilter, updateValues, (err, res) => {
			if (err) {
				console.log(err.message);
			}

			response.redirect("/static/books.html");
		});

		//close the connection to the db
		db.close();
	});	
});

//delete book by Book_Name
app.delete('/books', (request, response, next) => {
	const bookName = request.param('bookName');

	mongoClient.connect(mongoServerURL, (err, db) => {
		if (err)
			console.log("Cannot connect to Mongo:"+err.message);

		//connect to librarydb
		const librarydb = db.db("librarydb");
		
		//we are deleting by the Book_Name
		const deleteFilter = {Book_Name:bookName};

		//insert from librarydb books collection
		librarydb.collection("books").deleteOne(deleteFilter, (err, res) => {
			if (err) {
				console.log(err.message);
			}


			if (res.deletedCount > 0) {
				response.redirect("/static/books.html");
			}
			else {
				response.send("<script>alert(\"deleted \" +bookName);</script>");
			}
		});

		//close the connection to the db
		db.close();
	});	
});

//Enable a static route /static to access the HTML file.
app.use('/static', express.static('public'));
const port = process.env.PORT || 7878;
app.listen(port, () => {
	console.log("server listening on " + port);
});
