import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { useState , useEffect} from 'react'
import axios from 'axios'

function App() {
  const [rows, setRows] = useState([]);
  const [input, setInput] = useState("");
  
  const fetchDATA = async () => {
    const response = await axios.get("http://localhost:8080/api");
    setRows(response.data);
    console.log(response.data);
  }

  useEffect(() => {
    fetchDATA();
  },[]);

  const handleInsert = async () => {
    if (!input.trim()) return;
    try {
      await axios.post("http://localhost:8080/api", { name: input });
      setInput("");      // clear input
      fetchDATA();       // refresh list
    } catch (error) {
      console.error("Error inserting data:", error);
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <div>
        <h1>Data from MySQL</h1>
          <ul>
            {rows.map((row) => (
              <li key={row.id}>{row.name}</li>
            ))}
          </ul>
      </div>
      <div>
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder='input'/>
        <button type="button" onClick={handleInsert} >Try</button>
      </div>
    </>
  )
}

export default App
