import { BrowserRouter as Router } from 'react-router-dom';
import { ProgressoProvider } from './context/ProgressoContext';
import AppRoutes from './AppRoutes';

function App() {
  return (
    <Router>
      <ProgressoProvider>
        <AppRoutes />
      </ProgressoProvider>
    </Router>
  );
}

export default App;