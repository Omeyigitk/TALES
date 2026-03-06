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

// ---- AUTH ENDPOINT'LERI ----

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
    const { campaignName } = req.body; // Join by name for simplicity or we can use ID
    const campaign = await Campaign.findOne({ name: campaignName });
    if (!campaign) return res.status(404).json({ error: 'Kampanya bulunamadı' });

    if (!campaign.players.includes(req.user.id)) {
      campaign.players.push(req.user.id);
      await campaign.save();
    }
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
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
      query.classes = req.query.class; // MongoDB array contains match
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
    res.json(items);
  } catch (error) {
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
      url = `${process.env.BASE_URL || `http://localhost:${PORT}`}/uploads/${req.file.filename}`;
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
    } catch (err) {
      console.error(err);
    }

    socket.to(campaignId).emit('user_joined', { userId, role });
  });

  socket.on('update_character_stat', async ({ campaignId, characterId, stat, value }) => {
    try {
      // Veritabanı güncellemesi
      await Character.findByIdAndUpdate(characterId, { [stat]: value });
      // Diğerlerine yansıt
      io.to(campaignId).emit('character_stat_updated', { characterId, stat, value });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('update_encounter', async ({ campaignId, encounterData }) => {
    // Veritabanına da kaydedilebilir
    io.to(campaignId).emit('encounter_updated', encounterData);
  });

  socket.on('roll_dice', ({ campaignId, id, playerName, rollResult, type, isHidden }) => {
    io.to(campaignId).emit('dice_rolled', { id, playerName, rollResult, type, isHidden });
  });

  socket.on('reveal_dice', ({ campaignId, rollId }) => {
    io.to(campaignId).emit('dice_revealed', { rollId });
  });

  socket.on('whisper_player', ({ campaignId, targetPlayerName, message }) => {
    io.to(campaignId).emit('whisper_received', { targetPlayerName, message });
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


  socket.on('disconnect', () => {
    console.log(`Bağlantı koptu: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor.`);
});
