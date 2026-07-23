const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatsPage.tsx', 'utf8');
code = code.replace("import { useNavigate } from 'react-router-dom';", "import { useNavigate, useLocation } from 'react-router-dom';");
fs.writeFileSync('src/PersonalChatsPage.tsx', code);
