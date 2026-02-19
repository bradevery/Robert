'use client';
import { useEffect } from 'react';

function BootstrapClient() {
  useEffect(() => {
    require('bootstrap/js/dist/modal');
  }, []);
  return null;
}

export default BootstrapClient;
