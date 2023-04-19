const express = require("express");
const Book = require("../models/book");
const jsonschema = require("jsonschema");
const bookGetSchema = require("../schemas/bookGetSchema");
const bookCreateSchema = require("../schemas/bookCreateSchema");
const bookUpdateSchema = require("../schemas/bookUpdateSchema");
const router = new express.Router();


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    //why is there a query? we're not searching for anything
    console.log('query is', req.query)
    const books = await Book.findAll(req.query);
    return res.json({ books });

  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {

    const result = jsonschema.validate({ "id": parseInt(req.params.id) }, bookGetSchema);

    if (result.valid) {
      const book = await Book.findOne(req.params.id);
      return res.json({ book });
    } else {

      return res.status(400).json({ "result": result.errors.map(e => e.stack) })
    }

  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {
    const result = jsonschema.validate({ "book": req.body }, bookCreateSchema)
    if (result.valid) {
      const book = await Book.create(req.body);
      return res.status(201).json({ book });
    } else {
      return res.status(400).json({ "error": result.errors.map(e => e.stack) })
    }

  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    const resultISBN = jsonschema.validate({ "id": parseInt(req.params.isbn) }, bookGetSchema)
    const resultBody = jsonschema.validate({ "book": req.body }, bookUpdateSchema)
    if (resultISBN.valid && resultBody.valid) {
      const book = await Book.update(req.params.isbn, req.body);
      return res.json({ book });
    } else {

      return res.status(400).json({
        "error": {
          "isbnError": resultISBN.errors.map(e => e.stack),
          "bodyError": resultBody.errors.map(e => e.stack)
        }
      })
    }

  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    const resultISBN = jsonschema.validate({ "id": parseInt(req.params.isbn) }, bookGetSchema)
    if (resultISBN.valid) {
      await Book.remove(req.params.isbn);
      return res.json({ message: "Book deleted" });
    } else {
      return res.status(400).json({ "error": resultISBN.errors.map(e => e.stack) })
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
