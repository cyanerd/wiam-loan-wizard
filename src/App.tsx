import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WizardLayout } from './features/loan-wizard/WizardLayout';
import { Step1Personal } from './features/loan-wizard/steps/Step1Personal';
import { Step2Address } from './features/loan-wizard/steps/Step2Address';
import { Step3Loan } from './features/loan-wizard/steps/Step3Loan';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WizardLayout />}>
          <Route index element={<Navigate to="step-1" replace />} />
          <Route path="step-1" element={<Step1Personal />} />
          <Route path="step-2" element={<Step2Address />} />
          <Route path="step-3" element={<Step3Loan />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
