const express = require('express');
const app = express();

app.use(express.json());

// --- Routes MVC ---
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/utilisateurs', require('./routes/utilisateur.routes'));

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
