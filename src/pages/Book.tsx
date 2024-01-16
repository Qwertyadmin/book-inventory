import { SuccessTokenResponse } from "google-oauth-gsi";
import { gapi } from 'google-api-javascript-client';
import { Box, Button, Stack, Tab, Tabs } from "@mui/material";
import { MutableRefObject, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import BookTable from "../components/BookTable";
import { LoadedSheet, updateSheet } from "../App";
import { useNavigate } from "react-router-dom";

interface BookProps {
    obtainedToken: MutableRefObject<SuccessTokenResponse>,
    loadedSheet: MutableRefObject<LoadedSheet>,
    code: string | undefined,
    setCode: (code: string) => void
}

export interface SBook {
    title: string,
    author: string,
    publisher: string,
    year: string,
    isbn: string
}

const Book: React.FC<BookProps> = (props) => {

    const [gBook, setGBook] = useState<SBook>({title: '', author: '', publisher: '', year: '', isbn: ''})
    const [oBook, setOBook] = useState<SBook>({title: '', author: '', publisher: '', year: '', isbn: ''})
    const [tabIndex, setTabIndex] = useState(0);

    const navigate = useNavigate();

    gapi.load('client', () => {
        gapi.client.init({
          apiKey: process.env.REACT_APP_API_KEY,
          discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4', 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        }).then(() => gapi.client.setToken({access_token: props.obtainedToken.current.access_token}))
      });

    const reqDispatcher = axios.create({
        baseURL: process.env.REACT_APP_BASE_API_URL,
    })

    const searchOpenlibrary = () => {
        reqDispatcher.get('/api/books', {
            params: {
                bibkeys: `ISBN:${props.code}`,
                format: 'json'
            }
        }).then((r: AxiosResponse) => {
            if (Reflect.ownKeys(r.data).length > 0) {
                reqDispatcher.get(`/books/${Reflect.get(r.data, Reflect.ownKeys(r.data)[0]).info_url.split('/')[4]}.json`).then(r => {
                    const book = r.data;
                    setOBook({title: book.title, author: book.by_statement, publisher: book.publishers.join(', '), year: book.publish_date, isbn: props.code as string});
                })
            }
        })
    }

    const searchGoogleBooks = () => {
        gapi.client.request({
            path: 'https://www.googleapis.com/books/v1/volumes',
            method: 'GET',
            params: {
                q: `isbn:${props.code}`
            }
          }).then((r: gapi.client.HttpRequestFulfilled<any>) => {
            if (r.result.totalItems > 0) {
                const book = r.result.items[0];
                setGBook({title: book.volumeInfo.title, author: book.volumeInfo.authors.join(', '), publisher: '', year: book.volumeInfo.publishedDate, isbn: props.code as string});
                if (oBook.title === '')
                    setTabIndex(1);
            }
          })
    }

    const handleUpdate = () => {
        if (tabIndex === 0) 
            updateSheet([oBook.title, oBook.author, oBook.publisher, oBook.year, oBook.isbn], props.loadedSheet);
        if (tabIndex === 1) 
            updateSheet([gBook.title, gBook.author, gBook.publisher, gBook.year, gBook.isbn], props.loadedSheet);
    }

    useEffect(() => {
        searchOpenlibrary();
        searchGoogleBooks();
    }, [props.code])
    
    return (
        <Box sx={{width: '100%'}}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabIndex} onChange={(e, v) => {setTabIndex(v);}} variant="fullWidth" >
                    <Tab label='Openlibrary.org' id="tab-0" />
                    <Tab label='Google Books' id="tab-1" />
                </Tabs>
            </Box>
            <BookTable book={oBook} setBook={setOBook} value={tabIndex} index={0} />
            <BookTable book={gBook} setBook={setGBook} value={tabIndex} index={1} />
            <Stack spacing={2} sx={{marginTop: '20px'}}>
                <Button onClick={handleUpdate} variant="contained" fullWidth>Aggiungi all'inventario</Button>
                <Button onClick={() => navigate('/scan')} variant="contained" fullWidth>Aggiungi un'altro libro</Button>
            </Stack>
        </Box>
    );
}

export default Book;