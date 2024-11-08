import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tests from './pages/Tests';
import Labs from './pages/Labs';
import SigninLab from './pages/SigninLab';
import SignUpLab from './pages/SignUpLab';
import SignupPatient from './pages/SignUpPatients';
import SigninPatient from './pages/SigninPatients';
import Cart from './components/Cart';
import { RecoilRoot } from 'recoil';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<div>Page not found</div>} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/signinlab" element={<RecoilRoot><SigninLab /></RecoilRoot>} />
        <Route path="/signuplab" element={<SignUpLab />} />
        <Route path="/signupuser" element={<RecoilRoot><SignupPatient /></RecoilRoot>} />
        <Route path="/signinuser" element={<RecoilRoot><SigninPatient /></RecoilRoot>} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </BrowserRouter>
  );
}