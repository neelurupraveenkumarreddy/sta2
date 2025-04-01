import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Home from './components/Home';
import ExamSeating from './components/ExamSeating';
import CreateRooms from './components/CreateRooms';
import Register from './components/Register';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound';
import NotAccessable from './components/NotAccessable';
import Logout from './components/Logout';
import PrintAllotments from './components/PrintAllotments';
//hello
const App = () => {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route exact path="/examseating" element={<ProtectedRoute><ExamSeating/></ProtectedRoute>}/>
          <Route exact path="/rooms" element={<ProtectedRoute><CreateRooms/></ProtectedRoute>}/>
          <Route exact path='/register' element={<ProtectedRoute><Register/></ProtectedRoute>}/>
          <Route exact path='/printallotments' element={<ProtectedRoute><PrintAllotments/></ProtectedRoute>}/>
          <Route exact path="/notaccessable" element={<NotAccessable/>}/>
          <Route exact path="/login" element={<Login/>} />
          <Route exact path="/logout" element={<Logout/>} />
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </BrowserRouter>
    )
  }

export default App;