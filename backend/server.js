const express = require('express');
const cors = require('cors');
const itemsRouter = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Store for items state (in-memory storage as per requirements)
global.itemsState = {
  selectedItems: new Set(),
  itemOrder: Array.from({ length: 1000000 }, (_, i) => i + 1)
};

// Routes
app.use('/api/items', itemsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 