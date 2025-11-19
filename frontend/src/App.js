import logo from './logo.svg';
import './App.css';
import api from './utils/api';
import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState({});

  const fetchData = async () => {
    const response = await api.get('api/test/');
    setUser(response.data);
  }

  useEffect(() => {
    fetchData();
  }, [])
  
  return (
    <div className="App">
      <header className="App-header">
        <p>Hi {user.user}, Welcome to eTron3D.</p>
      </header>
    </div>
  );
}

export default App;
