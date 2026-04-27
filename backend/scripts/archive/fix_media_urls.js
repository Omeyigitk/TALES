const mongoose = require('mongoose');

// MongoDB Connection Strings (adjust if needed, usually comes from .env)
const mongoURI = 'mongodb://localhost:27017/dnd-app';

const sharedMediaSchema = new mongoose.Schema({
    url: String
});
const SharedMedia = mongoose.model('SharedMedia', sharedMediaSchema, 'sharedmedias');

async function migrate() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for migration.');

        const mediaItems = await SharedMedia.find({ url: { $regex: /http:\/\/localhost:5000\/uploads\// } });
        console.log(`Found ${mediaItems.length} items to fix.`);

        for (const item of mediaItems) {
            const oldUrl = item.url;
            const newUrl = oldUrl.replace('http://localhost:5000', '');
            item.url = newUrl;
            await item.save();
            console.log(`Updated: ${oldUrl} -> ${newUrl}`);
        }

        console.log('Migration complete.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
