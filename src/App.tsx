import { useState } from 'react';
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

export const updateSheet = (data: string[], loadedSheet: LoadedSheet | undefined, setLoadedSheet: (loadedSheet: LoadedSheet) => void) => 
  gapi.client.request({
    path: `https://sheets.googleapis.com/v4/spreadsheets/${loadedSheet?.id}/values:batchUpdate`,
    method: 'POST',
    body: {
      data: [
        {
          range: 'A1',
          values: [[loadedSheet !== undefined ? loadedSheet.row + 1 : 1]]
        },
        {
          range: `A${loadedSheet?.row}:E${loadedSheet?.row}`,
          values: [data]
        }
      ],
      includeValuesInResponse: true,
      valueInputOption: 'USER_ENTERED'
    }
  }).then(r => 
    setLoadedSheet({...loadedSheet, row: r.result.responses[0].updatedData.values[0][0] as number})
  );



function App() {

  const [obtainedToken, setObtainedToken] = useState<SuccessTokenResponse>();
  const [loadedSheet, setLoadedSheet] = useState<LoadedSheet>();
  const [code, setCode] = useState<string>('');

  return (
    <Routes>
      <Route path='/' element={<Auth 
        obtainedToken={obtainedToken} 
        setObtainedToken={setObtainedToken}
        loadedSheet={loadedSheet}
        setLoadedSheet={setLoadedSheet} ></Auth>} />
      <Route path='/scan' element={<Scan
        code={code}
        setCode={setCode} ></Scan>} />
      <Route path='/book' element={<Book
        obtainedToken={obtainedToken}
        setObtainedToken={setObtainedToken}
        code={code}
        setCode={setCode} ></Book>} />
    </Routes>
  );
}

export default App;
