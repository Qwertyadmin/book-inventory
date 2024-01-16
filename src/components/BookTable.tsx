import { TextField } from "@mui/material";
import React from "react";
import { SBook } from "../pages/Book";


interface BookTableProps {
    book : SBook,
    setBook: (book: SBook) => void,
    index: number,
    value: number
}

const BookTable: React.FC<BookTableProps> = (props) => {

    return (
        <div role="tabpanel" hidden={props.value !== props.index} id={`tabpanel-${props.index}`}>
            {props.value === props.index && <>
                <TextField label='Titolo' value={props.book.title} onChange={(e) => {props.setBook({...props.book, title: e.target.value})}} fullWidth margin="dense" />
                <TextField label='Autori' value={props.book.author} onChange={(e) => {props.setBook({...props.book, author: e.target.value})}} fullWidth margin="dense" />
                <TextField label='Editore' value={props.book.publisher} onChange={(e) => {props.setBook({...props.book, publisher: e.target.value})}} fullWidth margin="dense" />
                <TextField label='Anno di pubblicazione' value={props.book.year} onChange={(e) => {props.setBook({...props.book, year: e.target.value})}} fullWidth margin="dense" />
                <TextField label='ISBN' disabled={true} value={props.book.isbn} onChange={(e) => {props.setBook({...props.book, isbn: e.target.value})}} fullWidth margin="dense" />
            </>}
        </div>
    )
}

export default BookTable;