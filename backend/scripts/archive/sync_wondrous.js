const fs = require('fs');
const path = require('path');

const src = "C:\\Users\\Ömer Yiğit\\.gemini\\antigravity\\brain\\6538484c-9e3f-47da-81ab-a3b99624f34a\\browser\\wondrous_raw.json";
const dest = path.join(__dirname, "wondrous_raw.json");

try {
    const data = fs.readFileSync(src, 'utf8');
    fs.writeFileSync(dest, data);
    console.log(`Successfully synced ${JSON.parse(data).length} items to ${dest}`);
} catch (err) {
    console.error("Sync failed:", err.message);
    process.exit(1);
}
