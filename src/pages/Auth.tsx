import React, { MutableRefObject, useEffect, useState } from 'react';
import { gapi } from 'google-api-javascript-client';
import { ErrorTokenResponse, GoogleOAuthProvider, SuccessTokenResponse } from 'google-oauth-gsi';
import { Alert, Backdrop, Box, Button, CircularProgress, Snackbar } from '@mui/material';
import { Google } from '@mui/icons-material';
import { LoadedSheet, updateSheet } from '../App';
import { useNavigate } from 'react-router-dom';
import FileSelector, { Spreadsheet } from '../components/FileSelector';

interface AuthProps {
    obtainedToken: MutableRefObject<SuccessTokenResponse>,
    loadedSheet: MutableRefObject<LoadedSheet>
}

interface GSpreadsheet {
    id: string,
    kind: string,
    mimeType: string,
    name: string
}

const Auth: React.FC<AuthProps> = (props) => {

  const [loginState, setLoginState] = useState(0);
  const [loginError, setLoginError] = useState<ErrorTokenResponse>();
  const [open, setOpen] = useState(false);

  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([{id: '', label: ''}]);
  const [spreadsheet, setSpreadsheet] = useState<Spreadsheet | null>({id: '', label: ''});

  const navigate = useNavigate();


  gapi.load('client', () => {
    gapi.client.init({
      apiKey: process.env.REACT_APP_API_KEY,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4', 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    });
  });
  
  const googleProvider = new GoogleOAuthProvider({clientId: process.env.REACT_APP_CLIENT_ID as string});

  const handleLogin = () => {
    setOpen(true);
    googleProvider.useGoogleLogin({
        flow: 'implicit',
        onSuccess(tokenResponse) {
          props.obtainedToken.current = tokenResponse;
          setLoginState(1);
          setOpen(true);
        },
        onError(errorResponse) {
          setLoginError(errorResponse);
          setLoginState(2);
          setOpen(true);
        },
        scope: process.env.REACT_APP_SCOPES
      })();
  };


  useEffect(() => {
    if (props.obtainedToken.current.access_token !== '') {
      gapi.client.request({
        path: 'https://www.googleapis.com/drive/v3/files',
        method: 'GET',
        params: {
            includeItemsFromAllDrives: false,
            q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false"
        }
      }).then(r => {
          setSpreadsheets(r.result.files.map((f: GSpreadsheet) => {return {label: f.name, id: f.id}}));
      });
    }
  }, [props.obtainedToken.current]);


  const createSpreadsheet = () => {
    gapi.client.request({
        path: 'https://sheets.googleapis.com/v4/spreadsheets',
        method: 'POST',
        body: {
          properties: {
            title: spreadsheet?.label,
            locale: 'it_IT',
            timeZone: 'Europe/Rome',
          }
        }
    }).then(r => { 
      setSpreadsheet({id: r.result.spreadsheetId, label: r.result.properties.title});
      props.loadedSheet.current = {id: r.result.spreadsheetId, row: 3};
      updateSheet(['Titolo', 'Autori', 'Editore', 'Anno pubblicazione', 'ISBN'], props.loadedSheet);
    })
  }


  const loadSpreadsheet = () => {
    gapi.client.request({
      path: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet?.id}/values/A1`,
      method: 'GET'
    }).then(r => {
      props.loadedSheet.current = {id: spreadsheet?.id, row: r.result.values[0][0] as number}
    })
  }


  const handleClick = () => {
    if (spreadsheet?.id === '')
      createSpreadsheet();
    else
      loadSpreadsheet();
    navigate('/scan');
  }


  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };


  return (
    <Box className='materialBox'>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loginState === 0 && open}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <h1>Book Inventory</h1>
        {loginState !== 1 && <Button onClick={handleLogin} disabled={loginState === 1} variant='contained' startIcon={<Google />} fullWidth>Accedi</Button>}
        <Snackbar open={loginState === 1 && open} onClose={handleClose} autoHideDuration={3000}>
          <Alert onClose={handleClose} severity='success'>Login effettuato con successo</Alert>
        </Snackbar>
        <Snackbar open={loginState === 2 && open} onClose={handleClose} autoHideDuration={3000}>
          <Alert onClose={handleClose} severity='error'>ERRORE: {loginError?.error}</Alert>
        </Snackbar>
        {loginState === 1 && <>
          <FileSelector spreadsheet={spreadsheet} setSpreadsheet={setSpreadsheet} spreadsheets={spreadsheets} loginState={loginState} />
          <Alert severity='warning'>Seleziona solo file creati dall'applicazione</Alert>
          <Button className='materialButton' disabled={spreadsheet === null} onClick={handleClick} variant='contained' fullWidth>{spreadsheet?.id !== '' ? 'Seleziona file' : 'Crea file'}</Button>
        </>}
    </Box>
  );
}

export default Auth;
