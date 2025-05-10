const express = require('express');
const cors = require('cors');
const path = require('path'); // Добавьте этот импорт
const itemsRouter = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


global.itemsState = {
  selectedItems: new Set(),
  itemOrder: Array.from({ length: 1000000 }, (_, i) => i + 1)
};


app.use('/api/items', itemsRouter);


app.use(express.static(path.join(__dirname, '../frontend/build')));


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
