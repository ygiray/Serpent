const { createApp } = require('./app');
const { openDb } = require('./db');

const PORT = process.env.PORT || 3001;
const app = createApp(openDb());

app.listen(PORT, () => {
  console.log(`Serpent API running on http://localhost:${PORT}`);
});
