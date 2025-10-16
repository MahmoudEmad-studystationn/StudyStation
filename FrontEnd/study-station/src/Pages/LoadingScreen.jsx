import React from 'react';
import { MDBSpinner } from 'mdb-react-ui-kit';

export default function App() {
  return (
    <div className='vh-100 d-flex align-items-center justify-content-center'>
      <MDBSpinner role='status' style={{ color: '#b5b5b5ff' }}>
        <span className='visually-hidden'>Loading...</span>
      </MDBSpinner>
    </div>
  );
}