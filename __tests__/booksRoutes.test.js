process.env.NODE_ENV = "test";

const request = require("supertest");
const db = require("../db");
const app = require("../app");
const Book = require("../models/book");


describe("Books Routes Test", function () {

    beforeEach(async function () {
        // await db.query("DELETE FROM books");

        let b = await Book.create({

            "isbn": 111,
            "amazon_url": "www.amzon.com",
            "author": "karmen",
            "language": "japanese",
            "pages": 777,
            "publisher": "you",
            "title": "the you",
            "year": 1984

        });
        console.log(b)
    });

    afterEach(async function () {
        console.log('deleting books at aftereach')
        await db.query("DELETE FROM books");
    })

    afterAll(async function () {
        await db.end();
    })


    describe("GET /books", function () {
        test("can get all book", async function () {
            console.log('tsting get all books')
            let response = await request(app)
                .get("/books/");
            console.log(response.body)
            let book = response.body
            expect(response.statusCode).toBe(200)
            expect(book.books[0].isbn).toEqual("111")

        })
    })

    describe("POST /books", function () {
        test("can create", async function () {
            let response = await request(app)
                .post("/books/")
                .send({
                    "isbn": 222,
                    "amazon_url": "www.amzon2.com",
                    "author": "karmen2",
                    "language": "japanese2",
                    "pages": 123,
                    "publisher": "me",
                    "title": "the me",
                    "year": 1985
                });

            expect(response.statusCode).toBe(201)
            let book = response.body;

            expect(book).toEqual({
                "book": {
                    "isbn": "222",
                    "amazon_url": "www.amzon2.com",
                    "author": "karmen2",
                    "language": "japanese2",
                    "pages": 123,
                    "publisher": "me",
                    "title": "the me",
                    "year": 1985
                }

            });
        });
    });

    describe("POST /books no isbn", function () {
        test("no isbn create", async function () {
            let response = await request(app)
                .post("/books/")
                .send({
                    "amazon_url": "www.amzon2.com",
                    "author": "karmen2",
                    "language": "japanese2",
                    "pages": 123,
                    "publisher": "me",
                    "title": "the me",
                    "year": 1985
                });


            let book = response.body;

            expect(response.statusCode).toBe(400)
            expect(book.error[0]).toEqual('instance.book requires property "isbn"')
        });
    });

    describe("POST /books invalid inputs", function () {
        test("invalid inputs create", async function () {
            let response = await request(app)
                .post("/books/")
                .send({
                    "isbn": "sdf",
                    "amazon_url": 34,
                    "author": 35,
                    "language": 36,
                    "pages": "sdf",
                    "publisher": 25,
                    "title": 79,
                    "year": "1985"
                });


            let book = response.body;
            console.log('post invalid response')
            console.log(book)
            expect(response.statusCode).toBe(400)
            expect(book.error).toEqual(['instance.book.isbn is not of a type(s) integer',
                'instance.book.amazon_url is not of a type(s) string',
                'instance.book.author is not of a type(s) string',
                'instance.book.language is not of a type(s) string',
                'instance.book.pages is not of a type(s) integer',
                'instance.book.publisher is not of a type(s) string',
                'instance.book.title is not of a type(s) string',
                'instance.book.year is not of a type(s) integer'])
        });
    });



    describe("PUT /books/<id>", () => {
        test("can update", async () => {
            let response = await request(app)
                .put("/books/111")
                .send({
                    "amazon_url": "www.amzon2.com",
                    "author": "karmen2",
                    "language": "japanese2",
                    "pages": 123,
                    "publisher": "me",
                    "title": "the me",
                    "year": 1985

                })

            expect(response.statusCode).toBe(200)
            let book = response.body;

            expect(book).toEqual({
                "book": {
                    "isbn": "111",
                    "amazon_url": "www.amzon2.com",
                    "author": "karmen2",
                    "language": "japanese2",
                    "pages": 123,
                    "publisher": "me",
                    "title": "the me",
                    "year": 1985
                }

            });
        })
    })

    describe("PUT /books/ empty", () => {
        test('no id put', async () => {
            let response = await request(app)
                .put("/books/")
                .send({
                    "amazon_url": "www.amzon2.com",
                    "author": "karmen2",
                    "language": "japanese2",
                    "pages": 123,
                    "publisher": "me",
                    "title": "the me",
                    "year": 1985

                })

            let book = response.body;
            expect(response.statusCode).toBe(404)
            expect(book.error.message).toEqual('Not Found')

        })
    })

    describe("PUT /books/ string", () => {
        test('invalid put', async () => {
            let response = await request(app)
                .put("/books/sdf")
                .send({
                    "amazon_url": "www.amzon2.com",
                    "author": "karmen2",
                    "language": "japanese2",
                    "pages": 123,
                    "publisher": "me",
                    "title": "the me",
                    "year": 1985

                })

            let book = response.body;

            expect(response.statusCode).toBe(400)
            expect(book.error.isbnError[0]).toEqual(
                "instance.id is not of a type(s) integer"
            )

        })
    })

    describe("DELETE /books/<id>", () => {
        test("can delete", async () => {
            let response = await request(app)
                .delete("/books/111")

            let book = response.body;
            expect(book).toEqual({
                "message":
                    "Book deleted"

            })
        })
    })

    describe("DELETE /books/string", () => {
        test('invalid delete', async () => {
            let response = await request(app)
                .delete("/books/asd")

            let book = response.body;

            expect(response.statusCode).toBe(400)
            expect(book).toEqual({
                'error': ["instance.id is not of a type(s) integer"]
            })

        })
    })

    describe("DELETE /books/ empty", () => {
        test('no id delete', async () => {
            let response = await request(app)
                .delete("/books/")

            let book = response.body;

            expect(response.statusCode).toBe(404)
            expect(book.error.message).toEqual('Not Found')

        })
    })
})