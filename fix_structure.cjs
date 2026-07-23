const fs = require('fs');
let code = fs.readFileSync('src/PersonalChatWindow.tsx', 'utf8');

// I will just count divs and balance it. Or I can restore it.
// Actually I can just add another closing div before {showSharedMedia}
// Wait, if I just do this:
code = code.replace(
`      )}
      </div>
      {showSharedMedia && (`,
`      )}
      {showSharedMedia && (`
);

code = code.replace(
`      )}
      </div>
    </DashboardLayout>`,
`      )}
      </div>
      </div>
    </DashboardLayout>`
);

fs.writeFileSync('src/PersonalChatWindow.tsx', code);
