const fs = require('fs');
['src/PersonalChatWindow.tsx', 'src/ChannelChatPage.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');

  // Add onContextMenu
  const target = 'id={`msg-${msg.id}`} className={`flex gap-3 ${isMine ? \'flex-row-reverse\' : \'flex-row\'}`}>\n                  {!isMine && (';
  
  const repl = 'id={`msg-${msg.id}`} \n                  onContextMenu={(e) => {\n                    if (isEditable) {\n                      e.preventDefault();\n                      startEditing(msg);\n                    }\n                  }}\n                  className={`flex gap-3 ${isMine ? \'flex-row-reverse\' : \'flex-row\'}`}>\n                  {!isMine && (';
  
  code = code.replace(target, repl);
  fs.writeFileSync(file, code);
});
