import { useState } from 'react';
import { SuccessTokenResponse } from 'google-oauth-gsi';
import Auth from './pages/Auth';
import { Route, Routes } from 'react-router-dom';

function App() {

  const [obtainedToken, setObtainedToken] = useState<SuccessTokenResponse>();

  return (
    <Routes>
      <Route path='/' element={<Auth obtainedToken={obtainedToken} setObtainedToken={setObtainedToken}></Auth>} />
    </Routes>
  );
}

export default App;
