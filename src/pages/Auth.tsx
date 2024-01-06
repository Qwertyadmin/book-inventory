import React, { useState } from 'react';
import { gapi } from 'google-api-javascript-client';
import { ErrorTokenResponse, GoogleOAuthProvider, SuccessTokenResponse } from 'google-oauth-gsi';
import { Alert, Autocomplete, Button, TextField } from '@mui/material';
import { Google } from '@mui/icons-material';

interface AuthProps {
    obtainedToken: SuccessTokenResponse | undefined,
    setObtainedToken: React.Dispatch<React.SetStateAction<SuccessTokenResponse | undefined>>
}

interface GSpreadsheet {
    id: string,
    kind: string,
    mimeType: string,
    name: string
}

interface Spreadsheet {
    id: string,
    label: string
}

const Auth: React.FC<AuthProps> = ({obtainedToken, setObtainedToken}) => {

  const [loginState, setLoginState] = useState(0);
  const [loginError, setLoginError] = useState<ErrorTokenResponse>();

  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>();
  const [spreadsheet, setSpreadsheet] = useState<Spreadsheet | null>();

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
          setObtainedToken(tokenResponse);
          setLoginState(1);
        },
        onError(errorResponse) {
          setLoginError(errorResponse);
          setLoginState(2);
        },
        scope: process.env.REACT_APP_SCOPES
      })();
    gapi.client.setToken(obtainedToken as gapi.client.TokenObject);
  };

  const listSpreadsheets = () => {
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

  return (
    <div>
        <h1>Book Inventory</h1>
        <Button onClick={handleLogin} variant='contained' startIcon={<Google />}>Accedi</Button>
        {loginState === 1 && <Alert severity='success' onClose={() => {}}>Login effettuato con successo</Alert>}
        {loginState === 2 && <Alert severity='error' onClose={() => {}}>ERRORE: {loginError !== undefined ? loginError.error : ''}</Alert>}
        <Button onClick={listSpreadsheets} variant='contained'>Richiedi file</Button>
        <Autocomplete 
            id='spreadsheets-combo' 
            disablePortal 
            options={spreadsheets as Spreadsheet[]} 
            renderInput={(params) => <TextField {...params} label="Seleziona un file..." />}
            value={spreadsheet}
            onChange={(event: any, newValue: Spreadsheet | null) => {setSpreadsheet(newValue)}} />
        <p>ID: {spreadsheet !== undefined ? (spreadsheet !== null ? spreadsheet.id : '') : ''}</p>
    </div>
  );
}

export default Auth;
