import React, { ChangeEvent, useEffect, useState } from 'react';
import { gapi } from 'google-api-javascript-client';
import { ErrorTokenResponse, GoogleOAuthProvider, SuccessTokenResponse } from 'google-oauth-gsi';
import { Alert, Autocomplete, AutocompleteInputChangeReason, Button, TextField } from '@mui/material';
import { Google } from '@mui/icons-material';
import { LoadedSheet, updateSheet } from '../App';

interface AuthProps {
    obtainedToken: SuccessTokenResponse | undefined,
    setObtainedToken: (obtainedToken: SuccessTokenResponse) => void,
    loadedSheet: LoadedSheet | undefined,
    setLoadedSheet: (loadedSheet: LoadedSheet) => void
}

interface GSpreadsheet {
    id: string,
    kind: string,
    mimeType: string,
    name: string
}

interface Spreadsheet {
    id: string,
    label: string,
    inputValue?: string
}

const Auth: React.FC<AuthProps> = (props) => {

  const [loginState, setLoginState] = useState(0);
  const [loginError, setLoginError] = useState<ErrorTokenResponse>();

  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([{id: '', label: ''}]);
  const [spreadsheet, setSpreadsheet] = useState<Spreadsheet | null>({id: '', label: ''});


  gapi.load('client', () => {
    gapi.client.init({
      apiKey: process.env.REACT_APP_API_KEY,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4', 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    });
  });
  
  const googleProvider = new GoogleOAuthProvider({clientId: process.env.REACT_APP_CLIENT_ID as string});

  const handleLogin = () => {
    googleProvider.useGoogleLogin({
        flow: 'implicit',
        onSuccess(tokenResponse) {
          props.setObtainedToken(tokenResponse);
          setLoginState(1);
        },
        onError(errorResponse) {
          setLoginError(errorResponse);
          setLoginState(2);
        },
        scope: process.env.REACT_APP_SCOPES
      })();
  };


  useEffect(() => {
    if (props.obtainedToken) {
      gapi.client.request({
        path: 'https://www.googleapis.com/drive/v3/files',
        method: 'GET',
        params: {
            includeItemsFromAllDrives: false,
            trashed: false,
            q: "mimeType='application/vnd.google-apps.spreadsheet'"
        }
      }).then(r => {
          setSpreadsheets(r.result.files.map((f: GSpreadsheet) => {return {label: f.name, id: f.id}}));
      });
    }
  }, [props.obtainedToken]);


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
      props.setLoadedSheet({id: r.result.spreadsheetId, row: 3});
      updateSheet(['Titolo', 'Autori', 'Editore', 'Anno pubblicazione', 'ISBN'], {id: r.result.spreadsheetId, row: 3}, props.setLoadedSheet);
    })
  }


  return (
    <div>
        <h1>Book Inventory</h1>
        <Button onClick={handleLogin} variant='contained' startIcon={<Google />}>Accedi</Button>
        {loginState === 1 && <Alert severity='success'>Login effettuato con successo</Alert>}
        {loginState === 2 && <Alert severity='error'>ERRORE: {loginError?.error}</Alert>}
        <Autocomplete 
            id='spreadsheets-combo' 
            disablePortal
            freeSolo
            autoSelect
            disabled={loginState !== 1 ? true : false}
            options={spreadsheets as Spreadsheet[]} 
            renderInput={(params) => <TextField {...params} label="Seleziona un file esistente..." />}
            value={spreadsheet}
            onChange={(event: any, newValue) => {
              if (typeof newValue === 'string') {
                setSpreadsheet({
                  id: '',
                  label: newValue,
                });
              } else if (newValue && newValue.inputValue) {
                setSpreadsheet({
                  id: '',
                  label: newValue.inputValue,
                });
              } else {
                setSpreadsheet(newValue);
              }
            }} />
        <p>ID: {spreadsheet?.id}</p>
        <p>NAME: {spreadsheet?.label}</p>
        <Button onClick={createSpreadsheet} variant='contained'>{spreadsheet?.id === '' ? 'Crea file' : 'Seleziona file'}</Button>
    </div>
  );
}

export default Auth;
