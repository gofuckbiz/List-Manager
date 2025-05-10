const express = require('express');
const router = express.Router();

// Get paginated items
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 20;
  const search = req.query.search || '';
  
  let items = [...global.itemsState.itemOrder];
  
  // Apply search filter if provided
  if (search) {
    items = items.filter(item => item.toString().includes(search));
  }
  
  // Get total count before pagination
  const total = items.length;
  
  // Apply pagination
  const startIndex = page * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  // Add selection status to each item
  const result = paginatedItems.map(item => ({
    id: item,
    value: item,
    selected: global.itemsState.selectedItems.has(item)
  }));
  
  res.json({
    items: result,
    total,
    page,
    limit
  });
});

// Update selection
router.post('/selection', (req, res) => {
  const { id, selected } = req.body;
  
  if (selected) {
    global.itemsState.selectedItems.add(id);
  } else {
    global.itemsState.selectedItems.delete(id);
  }
  
  res.json({ success: true });
});

// Update items order
router.post('/reorder', (req, res) => {
  const { newOrder } = req.body;
  
  // Create a map of the current order for efficient lookup
  const currentOrderMap = new Map();
  global.itemsState.itemOrder.forEach((id, index) => {
    currentOrderMap.set(id, index);
  });
  
  // Update the order based on the reordered items
  newOrder.forEach((id, newIndex) => {
    const oldIndex = currentOrderMap.get(id);
    if (oldIndex !== undefined && oldIndex !== newIndex) {
      // Remove the item from its old position
      const [removed] = global.itemsState.itemOrder.splice(oldIndex, 1);
      // Insert it at the new position
      global.itemsState.itemOrder.splice(newIndex, 0, removed);
      
      // Update the map with new positions for efficient future updates
      global.itemsState.itemOrder.forEach((id, index) => {
        currentOrderMap.set(id, index);
      });
    }
  });
  
  res.json({ success: true });
});

module.exports = router; 