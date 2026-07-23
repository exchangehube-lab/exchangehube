const fs = require('fs');

const code = `
import React from 'react';

export function SupabaseVerification() {
  return null;
}
`;

fs.writeFileSync('src/components/SupabaseVerification.tsx', code);
