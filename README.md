# Book Inventory

Simple React-based app for creating an inventory of books using Google Sheets.

## Features & functionality

* Client-side only, no need to use specialized server
* Stores book data (title, authors, publisher, year of publication and ISBN code) in Google Sheet files, making them easily accessible
* Ability to scan ISBN code through device camera (using `zxing` library) and\or insert manually or through barcode scanner
* Retrieve book data from different databases: [Openlibrary](https://openlibrary.org) and [Google Books](https://books.google.com)
* Ability to edit retrieved information