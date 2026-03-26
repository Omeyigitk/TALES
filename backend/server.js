require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');

console.log('====================================');
console.log('SURUM: 1.0.3 - LATEST DEBUG');
console.log('MONGODB_URI AYARI:', process.env.MONGODB_URI ? 'VALIYOR' : 'BULUNAMADI (NULL)');
console.log('MEVCUT ANAHTARLAR:', Object.keys(process.env).filter(k => k.includes('MON') || k.includes('URI')));
console.log('====================================');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd_app';
const JWT_SECRET = process.env.JWT_SECRET || 'gizli_anahtar';
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || '*';

// Modeller
const Monster = require('./models/Monster');
const Spell = require('./models/Spell');
const Race = require('./models/Race');
const Class = require('./models/Class');
const Campaign = require('./models/Campaign');
const Character = require('./models/Character');
const SharedMedia = require('./models/SharedMedia');
const NPC = require('./models/NPC');
const Note = require('./models/Note');
const Item = require('./models/Item');
const User = require('./models/User');
const Feat = require('./models/Feat');
const Whisper = require('./models/Whisper');
const DiceRoll = require('./models/DiceRoll');
const Quest = require('./models/Quest');
const SessionNote = require('./models/SessionNote');
const Faction = require('./models/Faction');

const app = express();
app.use(cors({
  origin: CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Uploads dizini ayarları
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// Multer Ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Veritabanı Bağlantısı
const maskedUri = MONGODB_URI.replace(/\/\/.*@/, "//<user:password>@") || "NOT_SET";
console.log(`Veritabanına bağlanılıyor: ${maskedUri}`);

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB bağlandı.'))
  .catch(err => {
    console.error('❌ MongoDB bağlantı hatası:', err.message);
    console.error('Lütfen MONGODB_URI değişkenini ve Atlas IP izinlerini kontrol edin.');
  });

// ---- AUTH MIDDLEWARE ----
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Yetkisiz erişim' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Geçersiz token' });
    req.user = user;
    next();
  });
};

// ---- NEW FEATURES API ROUTES ----

// Quest Routes
app.get('/api/quests/:campaignId', authenticate, async (req, res) => {
  try {
    const quests = await Quest.find({ campaignId: req.params.campaignId });
    res.json(quests);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/quests', authenticate, async (req, res) => {
  try {
    const quest = new Quest(req.body);
    await quest.save();
    res.status(201).json(quest);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/quests/:id', authenticate, async (req, res) => {
  try {
    const quest = await Quest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(quest);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/quests/:id', authenticate, async (req, res) => {
  try {
    await Quest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Görev silindi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Session Note Routes
app.get('/api/session-notes/:campaignId', authenticate, async (req, res) => {
  try {
    const notes = await SessionNote.find({ campaignId: req.params.campaignId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/session-notes', authenticate, async (req, res) => {
  try {
    const note = new SessionNote(req.body);
    await note.save();
    res.status(201).json(note);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Faction Routes
app.get('/api/factions/:campaignId', authenticate, async (req, res) => {
  try {
    const factions = await Faction.find({ campaignId: req.params.campaignId });
    res.json(factions);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/factions', authenticate, async (req, res) => {
  try {
    const faction = new Faction(req.body);
    await faction.save();
    res.status(201).json(faction);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/factions/:id', authenticate, async (req, res) => {
  try {
    const faction = await Faction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(faction);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/factions/:id', authenticate, async (req, res) => {
  try {
    await Faction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fraksiyon silindi' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ---- AUTH ENDPOINT'LERI ----

// ---- ADMIN & SYSTEM ENDPOINT'LERI ----

// Bulut Veritabanını Doldurma (Seeding)
app.post('/api/admin/seed', authenticate, async (req, res) => {
  if (req.user.role !== 'DM') return res.status(403).json({ error: 'Yetkisiz erişim' });

  try {
    const dataPath = path.join(__dirname, 'data');
    console.log('Seeding process started...');

    // 1. Irklar
    if (fs.existsSync(path.join(dataPath, 'races.json'))) {
      const races = JSON.parse(fs.readFileSync(path.join(dataPath, 'races.json'), 'utf8'));
      await Race.deleteMany({});
      await Race.insertMany(races, { ordered: false });
      console.log('Races seeded.');
    }

    // 2. Sınıflar
    if (fs.existsSync(path.join(dataPath, 'classes.json'))) {
      const classes = JSON.parse(fs.readFileSync(path.join(dataPath, 'classes.json'), 'utf8'));
      await Class.deleteMany({});
      await Class.insertMany(classes, { ordered: false });
      console.log('Classes seeded.');
    }

    // 3. Büyüler
    if (fs.existsSync(path.join(dataPath, 'spells_hybrid.json'))) {
      const spellsJson = JSON.parse(fs.readFileSync(path.join(dataPath, 'spells_hybrid.json'), 'utf8'));
      const spellsList = Object.values(spellsJson);
      await Spell.deleteMany({});
      await Spell.insertMany(spellsList, { ordered: false });
      console.log(`Spells seeded: ${spellsList.length}`);
    }

    // 4. Canavarlar
    if (fs.existsSync(path.join(dataPath, 'monster_data_clean.json'))) {
      const monstersDataRaw = fs.readFileSync(path.join(dataPath, 'monster_data_clean.json'), 'utf8');
      const monstersJson = JSON.parse(monstersDataRaw);
      const monstersList = Object.entries(monstersJson).map(([name, data]) => ({ name, ...data }));
      await Monster.deleteMany({});
      await Monster.insertMany(monstersList, { ordered: false });
      console.log('Monsters seeded.');
    }

    // 5. Eşyalar (Optimized Bulk Seeding)
    console.log('Seeding Items...');
    const itemMap = new Map();

    // Translation helpers (re-defined or imported if lost in context)
    const validEnums = ['Weapon', 'Armor', 'Adventuring Gear', 'Tools', 'Mounts and Vehicles', 'Magic Item', 'Ammunition', 'Equipment', 'Staff', 'Wondrous Item', 'Holy Symbol', 'Silah', 'Zırh', 'Eşya', 'Büyülü Eşya', 'Araçlar', 'Binek ve Araçlar'];
    const safeTranslateCategory = (cat) => {
      if (!cat) return 'Eşya';
      const map = {
        'Weapon': 'Silah',
        'Armor': 'Zırh',
        'Adventuring Gear': 'Eşya',
        'Tools': 'Araçlar',
        'Mounts and Vehicles': 'Binek ve Araçlar',
        'Magic Item': 'Büyülü Eşya'
      };
      const translated = map[cat] || cat;
      if (validEnums.includes(translated)) return translated;
      if (validEnums.includes(cat)) return cat;
      return 'Eşya';
    };

    const validRarities = ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact', 'Varies', 'Unique', 'None'];
    const safeRarity = (r) => validRarities.includes(r) ? r : 'Uncommon';


    // SRD Items
    if (fs.existsSync(path.join(dataPath, 'items.json'))) {
      const srdItems = JSON.parse(fs.readFileSync(path.join(dataPath, 'items.json'), 'utf8'));
      for (const item of srdItems) {
        itemMap.set(item.name, {
          ...item,
          name_tr: item.name_tr || item.name,
          category: safeTranslateCategory(item.equipment_category ? (item.equipment_category.name || item.equipment_category) : 'Adventuring Gear'),
          rarity: safeRarity(item.rarity),
          type: item.subcategory || item.equipment_category || 'Wondrous Item'
        });
      }
    }

    // Magic Item Batches (Legacy/Original)
    const batchFiles = fs.readdirSync(dataPath).filter(f => f.startsWith('wondrous_details_batch_') && (f.endsWith('_tr.json') || f.endsWith('.json')));
    for (const file of batchFiles) {
      if (file.startsWith('enriched_')) continue; // Skip enriched here
      const items = JSON.parse(fs.readFileSync(path.join(dataPath, file), 'utf8'));
      for (const itemData of items) {
        const name = itemData.name;
        const existing = itemMap.get(name) || {};
        const safeCat = itemData.equipment_category || existing.category || 'Adventuring Gear';
        itemMap.set(name, {
          ...existing,
          ...itemData,
          name: name,
          name_tr: itemData.name_tr || existing.name_tr || name,
          description: itemData.original_desc || existing.description || '',
          description_tr: itemData.desc_tr || existing.description_tr || '',
          category: safeTranslateCategory(safeCat),
          cost: itemData.cost || existing.cost || { quantity: 0, unit: 'gp' },
          weight: itemData.weight !== undefined ? itemData.weight : existing.weight,
          rarity: safeRarity(itemData.rarity || existing.rarity),
          type: itemData.type || existing.type || 'Wondrous Item',
          effects: itemData.effects || existing.effects || []
        });
      }
    }

    // ENRICHED Item Batches (Priority)
    const enrichedFiles = fs.readdirSync(dataPath).filter(f => f.startsWith('enriched_items_batch_') && f.endsWith('.json'));
    for (const file of enrichedFiles) {
      const items = JSON.parse(fs.readFileSync(path.join(dataPath, file), 'utf8'));
      for (const itemData of items) {
        const existing = itemMap.get(itemData.name) || {};
        
        let newDesc = itemData.description || existing.description;
        let newDescTr = itemData.description_tr || existing.description_tr;
        
        // Enriched files often put the translated rich text straight into 'description'
        if (itemData.description && (itemData.description.includes('**[') || itemData.description.includes('Mekanik Bilgiler') || itemData.description.includes('Atmosfer'))) {
            newDescTr = itemData.description;
        }

        itemMap.set(itemData.name, {
          ...existing,
          ...itemData,
          name_tr: itemData.name_tr || existing.name_tr || itemData.name,
          description: newDesc,
          description_tr: newDescTr,
          category: itemData.category || existing.category || 'Büyülü Eşya'
        });
      }
    }

    const finalItems = Array.from(itemMap.values());

    console.log(`Prepared ${finalItems.length} items. Deleting old records...`);
    await Item.deleteMany({});

    if (finalItems.length > 0) {
      // Chunking to avoid timeouts on large inserts
      const chunkSize = 25;
      for (let i = 0; i < finalItems.length; i += chunkSize) {
        const chunk = finalItems.slice(i, i + chunkSize);
        await Item.insertMany(chunk, { ordered: false }).catch(e => console.error('Partial item insert error:', e.message));
        console.log(`Seeded items ${i + chunk.length}/${finalItems.length}`);
      }
    }

    let feats = [];
    if (fs.existsSync(path.join(dataPath, 'feats.json'))) {
      feats = JSON.parse(fs.readFileSync(path.join(dataPath, 'feats.json'), 'utf8'));
      await Feat.deleteMany({});
      await Feat.insertMany(feats, { ordered: false });
    }

    console.log('Finalizing seed process...');
    res.json({
      message: 'Veritabanı başarıyla güncellendi.',
      details: {
        items: finalItems.length,
        monsters: monstersList.length,
        spells: spells.length,
        feats: feats.length
      }
    });

  } catch (err) {
    console.error('CRITICAL Seeding error:', err);
    res.status(500).json({
      error: 'Veritabanı güncellenirken hata oluştu',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Harita Dosyası Yükleme
app.post('/api/campaigns/:campaignId/map-upload', authenticate, upload.single('map'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Dosya seçilmedi' });

    const { campaignId } = req.params;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['host'];
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign bulunamadı' });

    if (!campaign.mapData) {
      campaign.mapData = { bgUrl: imageUrl, gridSize: 50, showGrid: true, tokens: [] };
    } else {
      campaign.mapData.bgUrl = imageUrl;
    }

    await campaign.save();

    // Socket ile tüm odaya bildir
    io.to(campaignId).emit('map_updated', campaign.mapData);

    res.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error('Background upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Arkaplan Dosyası Yükleme
app.post('/api/campaigns/:campaignId/background-upload', authenticate, upload.single('background'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Dosya seçilmedi' });

    const { campaignId } = req.params;
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['host'];
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign bulunamadı' });

    if (!campaign.activeEnvironment) {
        campaign.activeEnvironment = { type: 'clear', severity: 'medium', backgroundUrl: imageUrl };
    } else {
        campaign.activeEnvironment.backgroundUrl = imageUrl;
    }

    await campaign.save();

    // Socket ile tüm odaya bildir
    io.to(campaignId).emit('environment_updated', campaign.activeEnvironment);

    res.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error('Background upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tüm kullanıcıları listele (Sadece SystemAdmin)
app.get('/api/admin/users', authenticate, async (req, res) => {
  if (req.user.username !== 'SystemAdmin') return res.status(403).json({ error: 'Yetkisiz erişim. Sadece SystemAdmin bu işlemi yapabilir.' });
  try {
    const users = await User.find({}, 'username role').sort({ username: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Şifre Sıfırlama (Sadece SystemAdmin)
app.post('/api/admin/reset-password', authenticate, async (req, res) => {
  if (req.user.username !== 'SystemAdmin') return res.status(403).json({ error: 'Yetkisiz erişim. Sadece SystemAdmin bu işlemi yapabilir.' });
  try {
    const { targetUserId, newPassword } = req.body;
    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Şifre başarıyla güncellendi!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcı Adı Değiştirme (Sadece SystemAdmin)
app.put('/api/admin/users/:id', authenticate, async (req, res) => {
  if (req.user.username !== 'SystemAdmin') return res.status(403).json({ error: 'Yetkisiz erişim' });
  try {
    const { newUsername } = req.body;
    if (!newUsername) return res.status(400).json({ error: 'Yeni kullanıcı adı gerekli' });

    // Çakışma kontrolü
    const existing = await User.findOne({ username: newUsername });
    if (existing) return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış' });

    const user = await User.findByIdAndUpdate(req.params.id, { username: newUsername }, { new: true });
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcı Silme (Sadece SystemAdmin)
app.delete('/api/admin/users/:id', authenticate, async (req, res) => {
  if (req.user.username !== 'SystemAdmin') return res.status(403).json({ error: 'Yetkisiz erişim' });
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    res.json({ success: true, message: 'Kullanıcı silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = new User({ username, password, role });
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }
    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, process.env.JWT_SECRET || 'gizli_anahtar');
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---- CAMPAIGN MANAGEMENT ----

app.get('/api/campaigns', authenticate, async (req, res) => {
  try {
    let campaigns;
    if (req.user.role === 'DM') {
      campaigns = await Campaign.find({ dmId: req.user.id });
    } else {
      campaigns = await Campaign.find({ players: req.user.id });
    }
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/campaigns', authenticate, async (req, res) => {
  if (req.user.role !== 'DM') return res.status(403).json({ error: 'Sadece DM kampanya oluşturabilir' });
  try {
    const campaign = new Campaign({ ...req.body, dmId: req.user.id });
    await campaign.save();
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/campaigns/join', authenticate, async (req, res) => {
  try {
    const { campaignName } = req.body;
    // Case-insensitive search
    const campaign = await Campaign.findOne({ name: { $regex: new RegExp(`^${campaignName}$`, 'i') } });
    if (!campaign) return res.status(404).json({ error: 'Kampanya bulunamadı' });

    // Ensure player is not already in the campaign (comparing IDs as strings for reliability)
    const isPlayerInCampaign = campaign.players.some(playerId => playerId.toString() === req.user.id);

    if (!isPlayerInCampaign) {
      campaign.players.push(req.user.id);
      await campaign.save();
    }
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/campaigns/:id', authenticate, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Kampanya bulunamadı' });

    if (campaign.dmId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Bu kampanyayı silme yetkiniz yok' });
    }

    await Campaign.findByIdAndDelete(req.params.id);
    await Character.deleteMany({ campaignId: req.params.id });
    await NPC.deleteMany({ campaignId: req.params.id });
    await Note.deleteMany({ campaignId: req.params.id });
    await SharedMedia.deleteMany({ campaignId: req.params.id });

    res.json({ success: true, message: 'Kampanya ve tüm verileri silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/characters/:id', authenticate, async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    if (!character) return res.status(404).json({ error: 'Karakter bulunamadı' });

    // For NPC characters, allow DMs to delete directly
    if (character.isNpc && req.user.role === 'DM') {
      await Character.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'NPC başarıyla silindi' });
    }

    const campaign = await Campaign.findById(character.campaignId);
    if (!campaign) return res.status(404).json({ error: 'Kampanya bulunamadı' });

    const isOwner = character.userId && character.userId.toString() === req.user.id;
    const isDM = campaign.dmId.toString() === req.user.id;

    if (!isOwner && !isDM) {
      return res.status(403).json({ error: 'Bu karakteri silme yetkiniz yok' });
    }

    await Character.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Karakter başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---- REST API ENDPOINT'LERI ----

app.get('/api/monsters', async (req, res) => {
  try {
    const monsters = await Monster.find({});
    res.json(monsters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/spells', async (req, res) => {
  try {
    const query = {};
    if (req.query.class) {
      // Case-insensitive class search
      query.classes = { $regex: new RegExp(`^${req.query.class}$`, 'i') };
    }
    if (req.query.max_level) {
      query.level_int = { $lte: parseInt(req.query.max_level) };
    }
    if (req.query.names) {
      const names = req.query.names.split(',').map(n => n.trim());
      query.name = { $in: names };
    }
    const spells = await Spell.find(query).sort({ level_int: 1, name: 1 });
    res.json(spells);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/spells/batch', authenticate, async (req, res) => {
  try {
    const { names } = req.body;
    if (!names || !Array.isArray(names)) {
      return res.status(400).json({ error: 'Büyü isimleri listesi (names) gerekli' });
    }
    const spells = await Spell.find({ name: { $in: names } });
    res.json(spells);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/feats', async (req, res) => {
  try {
    const feats = await Feat.find({}).sort({ name: 1 });
    res.json(feats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/classes', async (req, res) => {
  try {
    const classes = await Class.find({});
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/races', async (req, res) => {
  try {
    const races = await Race.find({});
    res.json(races);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Character Creator Endpoint'i
app.post('/api/characters', authenticate, async (req, res) => {
  try {
    const newChar = new Character({ ...req.body, userId: req.user.id });
    await newChar.save();
    res.json(newChar);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Character Getir (campaignId ile)
app.get('/api/characters/byCampaign/:campaignId', authenticate, async (req, res) => {
  try {
    const query = { campaignId: req.params.campaignId, isNpc: false };
    if (req.user.role === 'Player') {
      query.userId = req.user.id;
    }
    const char = await Character.findOne(query)
      .populate('raceRef')
      .populate('classRef');
    if (!char) return res.status(404).json({ error: 'Karakter bulunamadı' });
    res.json(char);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// NPC'leri Getir (campaignId ile)
app.get('/api/characters/npcs/:campaignId', authenticate, async (req, res) => {
  try {
    const npcs = await Character.find({ campaignId: req.params.campaignId, isNpc: true })
      .populate('raceRef')
      .populate('classRef');
    res.json(npcs);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Character Getir (id ile)
app.get('/api/characters/:id', authenticate, async (req, res) => {
  try {
    const char = await Character.findById(req.params.id)
      .populate('raceRef')
      .populate('classRef');
    if (!char) return res.status(404).json({ error: 'Karakter bulunamadı' });

    // Authorization: User must own the character or be the DM
    // For simplicity, we'll allow it if they are authenticated for now, 
    // but in a production app we'd check req.user.id === char.userId

    res.json(char);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Items API
app.get('/api/items', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const items = await Item.find(filter).sort({ category: 1, name: 1 });
    console.log(`[DEBUG] /api/items called. Filter: ${JSON.stringify(filter)}, Count found: ${items.length}`);
    res.json(items);
  } catch (error) {
    console.error(`[ERROR] /api/items failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/items/:name', async (req, res) => {
  try {
    const item = await Item.findOne({ name: req.params.name });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Character Güncelle (Level-up, HP, backstory vb.)
app.put('/api/characters/:id', async (req, res) => {
  try {
    const updated = await Character.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: false }
    ).populate('raceRef').populate('classRef');
    if (!updated) return res.status(404).json({ error: 'Karakter bulunamadı' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---- SPELL API ENDPOINT'LERI ----
// Removed duplicate endpoint

// ---- MEDIA API ENDPOINT'LERI ----

app.get('/api/campaigns/:id/media', async (req, res) => {
  try {
    const media = await SharedMedia.find({ campaignId: req.params.id }).sort({ createdAt: -1 });
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/campaigns/:id/media', upload.single('file'), async (req, res) => {
  try {
    const campaignId = req.params.id;
    let url = req.body.url;
    let type = req.body.type || 'link';
    let name = req.body.name || 'Paylaşılan Medya';

    if (req.file) {
      url = `/uploads/${req.file.filename}`;
      type = 'image';
      name = req.file.originalname;
    }

    if (!url) return res.status(400).json({ error: 'URL veya Dosya gerekli' });

    const newMedia = new SharedMedia({ campaignId, url, type, name });
    await newMedia.save();

    // Broadcast to room directly because we're inside the express route and we have `io` below. 
    // Wait, `io` is defined below. Let's just return the newMedia. The client can emit the socket event.

    res.json(newMedia);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/media/:mediaId', async (req, res) => {
  try {
    const media = await SharedMedia.findByIdAndDelete(req.params.mediaId);
    if (media && media.url.includes('/uploads/')) {
      const filename = media.url.split('/uploads/')[1];
      const filePath = path.join(__dirname, 'uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.json({ success: true, media });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---- LORE & DOCUMENTATION API ENDPOINT'LERI ----

app.get('/api/campaigns/:id/npcs', async (req, res) => {
  try {
    const npcs = await NPC.find({ campaignId: req.params.id }).sort({ createdAt: -1 });
    res.json(npcs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/campaigns/:id/npcs', async (req, res) => {
  try {
    const newNpc = new NPC({ ...req.body, campaignId: req.params.id });
    await newNpc.save();
    res.json(newNpc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/npcs/:id', async (req, res) => {
  try {
    const updatedNpc = await NPC.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedNpc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/npcs/:id', async (req, res) => {
  try {
    await NPC.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---- BACKUP / RESTORE API ENDPOINT'LERI ----

app.get('/api/campaigns/:id/export', async (req, res) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

    const characters = await Character.find({ campaignId });
    const npcs = await NPC.find({ campaignId });
    const notes = await Note.find({ campaignId });
    const media = await SharedMedia.find({ campaignId });

    const exportData = {
      campaign,
      characters,
      npcs,
      notes,
      media
    };

    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/campaigns/:id/import', async (req, res) => {
  try {
    const campaignId = req.params.id;
    const { campaign, characters, npcs, notes, media } = req.body;

    // Optional: Overwrite Campaign data
    if (campaign && campaign.mapData) {
      await Campaign.findByIdAndUpdate(campaignId, { mapData: campaign.mapData });
    }

    // Restore Characters
    if (characters && characters.length > 0) {
      await Character.deleteMany({ campaignId });
      const charsToInsert = characters.map(c => ({ ...c, _id: undefined, campaignId })); // Create new IDs to avoid conflicts, or keep old?
      // Actually, to preserve relationships it's better to keep old IDs if possible, but MongoDB handles `_id` on insertMany. We'll strip _id so it regenerates or let it overwrite. 
      // Safest is to just drop and insert with same payload, removing _id so it inserts cleanly.
      await Character.insertMany(characters.map(c => { delete c._id; return { ...c, campaignId }; }));
    }

    // Restore NPCs
    if (npcs && npcs.length > 0) {
      await NPC.deleteMany({ campaignId });
      await NPC.insertMany(npcs.map(n => { delete n._id; return { ...n, campaignId }; }));
    }

    // Restore Notes
    if (notes && notes.length > 0) {
      await Note.deleteMany({ campaignId });
      await Note.insertMany(notes.map(n => { delete n._id; return { ...n, campaignId }; }));
    }

    // Restore Media
    if (media && media.length > 0) {
      await SharedMedia.deleteMany({ campaignId });
      await SharedMedia.insertMany(media.map(m => { delete m._id; return { ...m, campaignId }; }));
    }

    res.json({ success: true, message: "Campaign restored successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.get('/api/campaigns/:id/npcs', async (req, res) => {
  try {
    const npcs = await NPC.find({ campaignId: req.params.id }).sort({ createdAt: -1 });
    res.json(npcs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/campaigns/:id/notes', async (req, res) => {
  try {
    const notes = await Note.find({ campaignId: req.params.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/campaigns/:id/notes', async (req, res) => {
  try {
    const newNote = new Note({ ...req.body, campaignId: req.params.id });
    await newNote.save();
    res.json(newNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/characters/:id', authenticate, async (req, res) => {
  try {
    const updatedChar = await Character.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedChar);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---- SOCKET.IO BAĞLANTILARI ----
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Yetkilendirme gerekli'));
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Geçersiz token'));
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`Yeni bağlantı: ${socket.id}`);

  socket.on('join_campaign', async ({ campaignId, role, userId }) => {
    socket.join(campaignId);
    console.log(`User ${userId} (${role}) joined campaign ${campaignId}`);

    // Send initial map data
    try {
      const campaign = await Campaign.findById(campaignId);
      if (campaign && campaign.mapData) {
        socket.emit('map_updated', campaign.mapData);
      }

      const diceHistory = await DiceRoll.find({ campaignId }).sort({ createdAt: -1 }).limit(30);
      socket.emit('dice_history', diceHistory.reverse());

      // Send Party Gold
      socket.emit('party_gold_updated', campaign.partyGold || 0);

      // Send Party Inventory
      socket.emit('party_inventory_updated', campaign.sharedInventory || []);

      // Send Fog of War
      socket.emit('fog_updated', campaign.fogOfWar || []);

      // Send Encounter Status
      socket.emit('encounter_updated', campaign.activeEncounter || { participants: [], round: 1, turnIndex: 0, isActive: false });

      // Send active environment
      socket.emit('environment_updated', campaign.activeEnvironment || { type: 'clear', severity: 'medium' });

      // Send initial data for new features
      const quests = await Quest.find({ campaignId });
      socket.emit('quests_sync', quests);

      const factions = await Faction.find({ campaignId });
      socket.emit('factions_sync', factions);

      const sessionNotes = await SessionNote.find({ campaignId }).sort({ createdAt: -1 });
      socket.emit('session_notes_sync', sessionNotes);

      // Add inspiration to party sync
      const characters = await Character.find({ campaignId, isNpc: false });
      const statsMap = {};
      characters.forEach(c => {
        statsMap[c.name] = {
          characterId: c._id,
          level: c.level,
          subclass: c.subclass,
          currentHp: c.currentHp,
          maxHp: c.maxHp,
          conditions: c.conditions || [],
          inspiration: c.inspiration || false,
          spellSlotsUsed: c.spellSlotsUsed || {}
        };
      });
      socket.emit('party_sync', statsMap);

      // Send whisper history
      const userCharacter = await Character.findOne({ campaignId, userId: socket.user.id });
      const charName = userCharacter ? userCharacter.name : (role === 'DM' ? 'DM' : null);

      if (charName) {
        const history = await Whisper.find({
          campaignId,
          $or: [
            { senderName: charName },
            { targetName: charName }
          ]
        }).sort({ createdAt: 1 }).limit(100);
        socket.emit('whisper_history', history);
      }

    } catch (err) {
      console.error(err);
    }

    socket.to(campaignId).emit('user_joined', { userId, role });
  });

  socket.on('update_character_stat', async ({ campaignId, characterId, stat, value }) => {
    try {
      // Veritabanı güncellemesi
      const updatedChar = await Character.findByIdAndUpdate(characterId, { [stat]: value }, { new: true });
      if (!updatedChar) return;

      // Diğerlerine yansıt - Frontend'de Name üzerinden indexlediği için ismi de gönderiyoruz
      io.to(campaignId).emit('character_stat_updated', {
        characterId,
        name: updatedChar.name,
        stat,
        value
      });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('update_encounter', async ({ campaignId, encounterData }) => {
    try {
      const update = {
        'activeEncounter.participants': encounterData.participants || [],
        'activeEncounter.isActive': encounterData.isActive !== undefined ? encounterData.isActive : (encounterData.participants?.length > 0),
        'activeEncounter.round': encounterData.round || 1,
        'activeEncounter.turnIndex': encounterData.turnIndex || 0
      };
      const campaign = await Campaign.findByIdAndUpdate(campaignId, { $set: update }, { new: true });
      io.to(campaignId).emit('encounter_updated', campaign.activeEncounter);
    } catch (err) {
      console.error('Encounter sync error:', err);
    }
  });

  socket.on('next_turn', async ({ campaignId }) => {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign || !campaign.activeEncounter.isActive) return;

      let nextIndex = (campaign.activeEncounter.turnIndex + 1) % campaign.activeEncounter.participants.length;
      let nextRound = campaign.activeEncounter.round;
      
      if (nextIndex === 0) {
        nextRound += 1;
      }

      campaign.activeEncounter.turnIndex = nextIndex;
      campaign.activeEncounter.round = nextRound;
      await campaign.save();

      io.to(campaignId).emit('encounter_updated', campaign.activeEncounter);
    } catch (err) {
      console.error('Next turn error:', err);
    }
  });

  socket.on('request_item_use', ({ campaignId, characterId, characterName, itemName, itemId }) => {
    // Notify DM
    io.to(campaignId).emit('item_use_requested', { characterId, characterName, itemName, itemId });
  });

  socket.on('approve_item_use', async ({ campaignId, characterId, action, value }) => {
    // action: 'heal', 'damage', 'message'
    // value: amount or text
    if (action === 'heal') {
        const char = await Character.findById(characterId);
        if (char) {
            const newHp = Math.min(char.maxHp, char.currentHp + parseInt(value));
            await Character.findByIdAndUpdate(characterId, { currentHp: newHp });
            io.to(campaignId).emit('character_stat_updated', { characterId, name: char.name, stat: 'currentHp', value: newHp });
        }
    }
    io.to(campaignId).emit('item_use_approved', { characterId, action, value });
  });

  socket.on('update_environment', async ({ campaignId, environmentData }) => {
    try {
        // Build a partial $set using dot-notation so we only overwrite the provided fields,
        // leaving the rest of activeEnvironment (e.g. type, severity, backgroundUrl) intact.
        const setFields = {};
        for (const [key, value] of Object.entries(environmentData)) {
            setFields[`activeEnvironment.${key}`] = value;
        }
        const campaign = await Campaign.findByIdAndUpdate(campaignId, { $set: setFields }, { new: true });
        io.to(campaignId).emit('environment_updated', campaign.activeEnvironment);
    } catch (err) {
        console.error('Environment sync error:', err);
    }
  });

  socket.on('roll_dice', async ({ campaignId, id, playerName, rollResult, type, isHidden }) => {
    try {
      const newRoll = new DiceRoll({
        campaignId,
        playerName,
        rollResult,
        type,
        isHidden: !!isHidden
      });
      const savedRoll = await newRoll.save();
      io.to(campaignId).emit('dice_rolled', {
        id: savedRoll._id,
        playerName: savedRoll.playerName,
        rollResult: savedRoll.rollResult,
        type: savedRoll.type,
        isHidden: savedRoll.isHidden
      });
    } catch (err) {
      console.error('Dice roll save error:', err);
    }
  });

  socket.on('reveal_dice', async ({ campaignId, rollId }) => {
    try {
      await DiceRoll.findByIdAndUpdate(rollId, { isHidden: false });
      io.to(campaignId).emit('dice_revealed', { rollId });
    } catch (err) {
      console.error('Dice reveal error:', err);
    }
  });

  socket.on('whisper_player', async ({ campaignId, targetPlayerName, message, senderName }) => {
    try {
      // Save whisper to database
      const newWhisper = new Whisper({
        campaignId,
        senderName,
        targetName: targetPlayerName,
        message
      });
      await newWhisper.save();

      // Find target sockets
      const sockets = io.sockets.adapter.rooms.get(campaignId);
      if (sockets) {
        for (const socketId of sockets) {
          const targetSocket = io.sockets.sockets.get(socketId);
          if (targetPlayerName === 'DM') {
            if (targetSocket.user.role === 'DM') {
              targetSocket.emit('whisper_received', newWhisper);
            }
          } else {
            // Check if socket's user owns the target character
            // We'll need a way to verify character name for socket
            // For now, simpler: check if targetSocket.user is playing target character
            const targetChar = await Character.findOne({ campaignId, name: targetPlayerName });
            if (targetChar && targetSocket.user.id === targetChar.userId.toString()) {
              targetSocket.emit('whisper_received', newWhisper);
            }
          }

          // Also send to sender so they see it in their history/log immediately
          if (targetSocket.id === socket.id) {
            targetSocket.emit('whisper_received', newWhisper);
          }
        }
      }
    } catch (err) {
      console.error('Whisper save error:', err);
    }
  });

  socket.on('share_media', ({ campaignId, url, type }) => {
    io.to(campaignId).emit('media_shared', { url, type });
  });

  socket.on('update_map', async ({ campaignId, mapData }) => {
    try {
      await Campaign.findByIdAndUpdate(campaignId, { mapData });
      io.to(campaignId).emit('map_updated', mapData);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('update_party_gold', async ({ campaignId, gold }) => {
    try {
      await Campaign.findByIdAndUpdate(campaignId, { partyGold: gold });
      io.to(campaignId).emit('party_gold_updated', gold);
    } catch (err) { console.error(err); }
  });

  socket.on('update_party_inventory', async ({ campaignId, inventory }) => {
    try {
      await Campaign.findByIdAndUpdate(campaignId, { sharedInventory: inventory });
      io.to(campaignId).emit('party_inventory_updated', inventory);
    } catch (err) { console.error(err); }
  });

  socket.on('update_fog', async ({ campaignId, fogOfWar }) => {
    try {
      await Campaign.findByIdAndUpdate(campaignId, { fogOfWar });
      io.to(campaignId).emit('fog_updated', fogOfWar);
    } catch (err) { console.error(err); }
  });

  socket.on('toggle_inspiration', async ({ campaignId, characterId, value }) => {
    try {
      const updatedChar = await Character.findByIdAndUpdate(characterId, { inspiration: value }, { new: true });
      if (updatedChar) {
        io.to(campaignId).emit('character_stat_updated', {
          characterId,
          name: updatedChar.name,
          stat: 'inspiration',
          value
        });
      }
    } catch (err) { console.error(err); }
  });

  socket.on('move_token', ({ campaignId, tokenId, x, y }) => {
    socket.to(campaignId).emit('token_moved', { tokenId, x, y });
  });

  socket.on('show_image', ({ campaignId, url }) => {
    io.to(campaignId).emit('show_image', { url });
  });

  // DM → tüm odaya level değiştirme izni ver/al
  socket.on('grant_level_permission', ({ campaignId, granted }) => {
    io.to(campaignId).emit('level_permission_updated', { granted });
  });

  socket.on('publish_shop', ({ campaignId, shopItems, isPublished }) => {
    io.to(campaignId).emit('shop_published', { shopItems, isPublished });
  });

  socket.on('play_sound', ({ campaignId, soundUrl, volume, loop }) => {
    io.to(campaignId).emit('sound_played', { soundUrl, volume, loop });
  });

  socket.on('stop_sound', ({ campaignId, soundUrl }) => {
    io.to(campaignId).emit('sound_stopped', { soundUrl });
  });


  socket.on('disconnect', () => {
    console.log(`Bağlantı koptu: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor.`);
});

function translateName(name) {
  const map = {
    'Club': 'Sopa',
    'Dagger': 'Hançer',
    'Greatclub': 'Büyük Sopa',
    'Handaxe': 'El Baltası',
    'Javelin': 'Cirit',
    'Light Hammer': 'Hafif Çekiç',
    'Mace': 'Gürz',
    'Quarterstaff': 'Asa',
    'Sickle': 'Orak',
    'Spear': 'Mızrak',
    'Crossbow, Light': 'Hafif Arbalet',
    'Shortbow': 'Kısa Yay',
    'Sling': 'Sapan',
    'Battleaxe': 'Savaş Baltası',
    'Flail': 'Topuzlu Kamçı',
    'Glaive': 'Glaive',
    'Greataxe': 'Büyük Balta',
    'Greatsword': 'Büyük Kılıç',
    'Halberd': 'Halberd',
    'Longsword': 'Uzun Kılıç',
    'Maul': 'Maul',
    'Morningstar': 'Sabah Yıldızı',
    'Pike': 'Kargı',
    'Rapier': 'Mekik Kılıç',
    'Shortsword': 'Kısa Kılıç',
    'Warhammer': 'Savaş Çekici',
    'Whip': 'Kamçı',
    'Padded': 'Dolgulu Zırh',
    'Leather': 'Deri Zırh',
    'Studded Leather': 'Çivili Deri Zırh',
    'Hide': 'Post Zırh',
    'Chain Shirt': 'Zincir Gömlek',
    'Scale Mail': 'Pullu Zırh',
    'Breastplate': 'Göğüs Zırhı',
    'Half Plate': 'Yarım Plaka',
    'Ring Mail': 'Halkalı Zırh',
    'Chain Mail': 'Zincir Zırh',
    'Splint': 'Parçalı Zırh',
    'Plate': 'Plaka Zırh',
    'Shield': 'Kalkan',
    'Backpack': 'Sırt Çantası',
    'Bedroll': 'Yatak',
    'Crowbar': 'Levye'
  };
  return map[name] || name;
}

function translateCategory(cat) {
  const map = {
    'Weapon': 'Silah',
    'Armor': 'Zırh',
    'Adventuring Gear': 'Eşya',
    'Magic Item': 'Büyülü Eşya'
  };
  return map[cat] || cat;
}
