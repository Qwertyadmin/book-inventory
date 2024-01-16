import { MutableRefObject, useRef, useState } from 'react';
import { SuccessTokenResponse } from 'google-oauth-gsi';
import Auth from './pages/Auth';
import { Route, Routes } from 'react-router-dom';
import Scan from './pages/Scan';
import Book from './pages/Book';
import './App.css'

export interface LoadedSheet {
  id?: string | undefined,
  row: number
}

export const updateSheet = (data: string[], loadedSheet: MutableRefObject<LoadedSheet>) => {
  let row = loadedSheet.current.row;
  gapi.client.request({
    path: `https://sheets.googleapis.com/v4/spreadsheets/${loadedSheet.current.id}/values:batchUpdate`,
    method: 'POST',
    body: {
      data: [
        {
          range: 'A1',
          values: [[++row]]
        },
        {
          range: `A${loadedSheet.current.row}:E${loadedSheet.current.row}`,
          values: [data]
        }
      ],
      includeValuesInResponse: true,
      valueInputOption: 'USER_ENTERED'
    }
  }).then(r => 
    loadedSheet.current = {...loadedSheet.current, row: r.result.responses[0].updatedData.values[0][0] as number}
  );
}



function App() {

  const obtainedToken = useRef<SuccessTokenResponse>({access_token: '', expires_in: 0, prompt: '', token_type: '', scope: ''});
  const loadedSheet = useRef<LoadedSheet>({id: '', row: 1});
  const [code, setCode] = useState<string>('');

  return (
    <Routes>
      <Route path='/' element={<Auth 
        obtainedToken={obtainedToken} 
        loadedSheet={loadedSheet} ></Auth>} />
      <Route path='/scan' element={<Scan
        code={code}
        setCode={setCode} ></Scan>} />
      <Route path='/book' element={<Book
        obtainedToken={obtainedToken}
        loadedSheet={loadedSheet}
        code={code}
        setCode={setCode} ></Book>} />
    </Routes>
  );
}

export default App;
