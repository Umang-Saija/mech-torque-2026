const fs = require('fs');

let code = fs.readFileSync('model3d.js', 'utf8');
code = code.replace(
    "calloutLine.setAttribute('y2', y);\r\n                }\r\n                } else {",
    "calloutLine.setAttribute('y2', y);\r\n                } else {"
);
// Also in case of LF
code = code.replace(
    "calloutLine.setAttribute('y2', y);\n                }\n                } else {",
    "calloutLine.setAttribute('y2', y);\n                } else {"
);

fs.writeFileSync('model3d.js', code, 'utf8');
console.log('Fixed extra brace successfully!');
