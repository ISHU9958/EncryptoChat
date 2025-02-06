import { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import PrivateRoute from '../components/PrivateRoute';
import PublicRoute from '../components/PublicRoute';
import ThanksBackupPage from '../pages/ThanksBackupPage';
import WantedBackUpOrNot from '../pages/WantedBackUpOrNot';
import AccessDenied from '../pages/AccessDenied';

function App() {

    // const [backupKey,setBackupKey]=useState('');
  return (
    <>
      <BrowserRouter>
      <Routes>
          <Route path='/login' element={<PublicRoute><Login></Login></PublicRoute> } />


          <Route path='/register' element={<PublicRoute><Register></Register></PublicRoute>} />


          <Route path='/user/:username' element={<PrivateRoute><Home ></Home></PrivateRoute>} />


          <Route path='/' element={<PrivateRoute><Home takeuser={true} ></Home></PrivateRoute>} />

          <Route path='/thanks' element={<PrivateRoute> <ThanksBackupPage ></ThanksBackupPage> </PrivateRoute>} />

          <Route path='/wantedRecovery' element={<PrivateRoute> <WantedBackUpOrNot></WantedBackUpOrNot> </PrivateRoute>} />

          <Route path="*" element={<AccessDenied />} />


      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
