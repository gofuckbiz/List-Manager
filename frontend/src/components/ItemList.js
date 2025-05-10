import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import '../styles/ItemList.css';

const API_URL = 'http://localhost:5000/api';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState(() => {
    
    return localStorage.getItem('itemListSearch') || '';
  });
  const [total, setTotal] = useState(0);
  const [sortConfig, setSortConfig] = useState(() => {
   
    const savedSort = localStorage.getItem('itemListSort');
    return savedSort ? JSON.parse(savedSort) : { key: null, direction: 'asc' };
  });
  const [draggedItem, setDraggedItem] = useState(null);
  const observer = useRef();

  useEffect(() => {
    localStorage.setItem('itemListSort', JSON.stringify(sortConfig));
  }, [sortConfig]);

  useEffect(() => {
    localStorage.setItem('itemListSearch', search);
  }, [search]);

  const fetchItems = useCallback(async (pageNum = 0, searchTerm = '') => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/items`, {
        params: {
          page: pageNum,
          limit: 20,
          search: searchTerm
        }
      });
      
      const { items: newItems, total } = response.data;
      
      setTotal(total);
      
      if (pageNum === 0) {
        let itemsToSet = newItems;
        
        if (sortConfig.key) {
          itemsToSet = [...itemsToSet].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
              return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
              return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
          });
        }
        
        setItems(itemsToSet);
      } else {
        setItems(prev => {
          const combined = [...prev, ...newItems];
          
          if (sortConfig.key) {
            return combined.sort((a, b) => {
              if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? -1 : 1;
              }
              if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'asc' ? 1 : -1;
              }
              return 0;
            });
          }
          
          return combined;
        });
      }
      
      setHasMore(newItems.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }, [sortConfig]);

  useEffect(() => {
    fetchItems(0, search);
  }, [fetchItems, search]);

  const lastItemRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        fetchItems(page + 1, search);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page, fetchItems, search]);

  const handleItemSelect = async (id, selected) => {
    try {
      await axios.post(`${API_URL}/items/selection`, { id, selected });
      
      setItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, selected } : item
        )
      );
    } catch (error) {
      console.error('Error updating selection:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedItems = [...items].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setItems(sortedItems);
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    return false;
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.target.closest('.table-row')?.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.target.closest('.table-row')?.classList.remove('drag-over');
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    document.querySelectorAll('.table-row').forEach(row => {
      row.classList.remove('drag-over');
      row.classList.remove('dragging');
    });
    
    if (draggedItem === null || draggedItem === dropIndex) return;
    
    const reorderedItems = [...items];
    const [removed] = reorderedItems.splice(draggedItem, 1);
    reorderedItems.splice(dropIndex, 0, removed);
    
    setItems(reorderedItems);
    
    try {
      await axios.post(`${API_URL}/items/reorder`, {
        newOrder: reorderedItems.map(item => item.id)
      });
    } catch (error) {
      console.error('Error updating item order:', error);
    }
    
    setDraggedItem(null);
  };

  const handleDragEnd = (e) => {
    document.querySelectorAll('.table-row').forEach(row => {
      row.classList.remove('drag-over');
      row.classList.remove('dragging');
    });
  };

  return (
    <div className="item-list-container">
      <div className="controls">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={handleSearchChange}
          className="search-input"
        />
        <div className="info">
          Showing {items.length} of {total} items
          {items.length > 0 && <span className="drag-hint"> (Перетащите строки для изменения порядка)</span>}
        </div>
      </div>
      
      <div className="items-table">
        <div className="table-header">
          <div className="cell select">Select</div>
          <div 
            className="cell id sortable"
            onClick={() => handleSort('id')}
          >
            ID {getSortIndicator('id')}
          </div>
          <div 
            className="cell value sortable"
            onClick={() => handleSort('value')}
          >
            Value {getSortIndicator('value')}
          </div>
        </div>

        <div className="items-list">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="table-row"
              ref={index === items.length - 1 ? lastItemRef : null}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="cell select">
                <input
                  type="checkbox"
                  checked={item.selected || false}
                  onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                />
              </div>
              <div className="cell id">{item.id}</div>
              <div className="cell value">{item.value}</div>
            </div>
          ))}
        </div>
        
        {loading && <div className="loading">Loading more items...</div>}
      </div>
    </div>
  );
};

export default ItemList; 