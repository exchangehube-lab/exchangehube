const fs = require('fs');

function patch(file) {
  let code = fs.readFileSync(file, 'utf8');
  if (!code.includes("localStorage.setItem('last_chat_path'")) {
    code = code.replace(
      "import { useParams, useNavigate } from 'react-router-dom';",
      "import { useParams, useNavigate, useLocation } from 'react-router-dom';"
    );
    // Find where the component starts and add useLocation and useEffect
    const target1 = "const navigate = useNavigate();";
    const replace1 = "const navigate = useNavigate();\n  const location = useLocation();\n  useEffect(() => {\n    localStorage.setItem('last_chat_path', location.pathname);\n  }, [location.pathname]);";
    code = code.replace(target1, replace1);
    fs.writeFileSync(file, code);
  }
}

patch('src/ChannelChatPage.tsx');
patch('src/PersonalChatWindow.tsx');
try { patch('src/PersonalChatsPage.tsx'); } catch (e) {} // and for the messages homepage

