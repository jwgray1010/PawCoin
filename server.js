const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

// --- Accessibility and Haptics (for completeness, logs only in Node.js) ---
function announceForAccessibility(message) {
  console.log(`[ACCESSIBILITY] ${message}`);
}
function hapticFeedback(type) {
  console.log(`[HAPTICS] ${type}`);
}
// --------------------------------------------------------------------------

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = process.env.ANCHOR_DATA_FILE || './anchors.json';
const AUTH_TOKEN = process.env.ANCHOR_API_TOKEN || 'my-secret-token';

// Helper to load/save anchors from disk
function loadAnchors() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    return [];
  } catch (e) {
    console.error('Error loading anchors:', e);
    return [];
  }
}

function saveAnchors(anchors) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(anchors, null, 2));
    announceForAccessibility('Anchors saved.');
    hapticFeedback('Success');
  } catch (e) {
    console.error('Error saving anchors:', e);
    announceForAccessibility('Failed to save anchors.');
    hapticFeedback('Error');
  }
}

// Authentication middleware
function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${AUTH_TOKEN}`) {
    announceForAccessibility('Unauthorized access attempt.');
    hapticFeedback('Warning');
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Log middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// GET all anchors
app.get('/anchors', authenticate, (req, res) => {
  try {
    const anchors = loadAnchors();
    announceForAccessibility('Anchors loaded.');
    hapticFeedback('Light');
    res.json(anchors);
  } catch (e) {
    announceForAccessibility('Failed to load anchors.');
    hapticFeedback('Error');
    res.status(500).json({ error: 'Failed to load anchors' });
  }
});

// POST (replace all) anchors
app.post('/anchors', authenticate, (req, res) => {
  const anchors = req.body;
  if (!Array.isArray(anchors)) {
    announceForAccessibility('Invalid anchors payload.');
    hapticFeedback('Error');
    return res.status(400).json({ error: 'Expected an array of anchors' });
  }
  try {
    saveAnchors(anchors);
    announceForAccessibility('Anchors updated.');
    hapticFeedback('Success');
    res.json({ success: true });
  } catch (e) {
    announceForAccessibility('Failed to save anchors.');
    hapticFeedback('Error');
    res.status(500).json({ error: 'Failed to save anchors' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  announceForAccessibility('Health check OK.');
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  announceForAccessibility(`Anchor backend running at http://localhost:${PORT}`);
  console.log(`Anchor backend running at http://localhost:${PORT}`);
});

// Handle server shutdown
process.on('SIGINT', () => {
  announceForAccessibility('Shutting down server...');
  console.log('Shutting down server...');
  process.exit();
});