import { useState } from 'react';
import { SuccessTokenResponse } from 'google-oauth-gsi';
import Auth from './pages/Auth';
import { Route, Routes } from 'react-router-dom';

export interface LoadedSheet {
  id?: string | undefined,
  row: number
}

export const updateSheet = (data: any, loadedSheet: LoadedSheet | undefined, setLoadedSheet: (loadedSheet: LoadedSheet) => void) => 
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

  return (
    <Routes>
      <Route path='/' element={<Auth 
        obtainedToken={obtainedToken} 
        setObtainedToken={setObtainedToken}
        loadedSheet={loadedSheet}
        setLoadedSheet={setLoadedSheet} ></Auth>} />
    </Routes>
  );
}

export default App;
