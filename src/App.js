import './App.css';
import PersonForm from './components/PersonForm';

function App() {
  return (
    <div className="App">
      <div className="w-full bg-gray-900 overflow-hidden ">
        <h1 className="text-white text-2xl mt-20">Mal Cast Overlap</h1>
        <PersonForm></PersonForm>
      </div>
    </div>
  );
}

export default App;
