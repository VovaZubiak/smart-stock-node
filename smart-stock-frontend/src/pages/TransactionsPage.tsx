import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Trash2, ArrowDownRight, ArrowUpRight, Search, Eye, Package, LogOut } from 'lucide-react';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [productSearch, setProductSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<{
    type: 'IN' | 'OUT';
    comment: string;
    items: { product: any; quantity: number }[];
  }>({
    type: 'IN',
    comment: '',
    items: []
  });

  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const fetchData = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { navigate('/login'); return; }

    setLoading(true);
    try {
      const [txRes, prodRes] = await Promise.all([
        fetch('http://localhost:3000/transactions', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('http://localhost:3000/products?limit=1000', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (!txRes.ok || !prodRes.ok) throw new Error('Помилка завантаження даних');

      const txData = await txRes.json();
      const prodData = await prodRes.json();

      const sortedTx = txData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setTransactions(sortedTx);
      setProducts(prodData.data || []);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const filteredProductsForDropdown = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleAddProductToTransaction = (product: any) => {
    const exists = formData.items.find(item => item.product.id === product.id);
    if (exists) {
      alert('Цей товар вже додано до накладної. Змініть його кількість.');
      setIsDropdownOpen(false);
      setProductSearch('');
      return;
    }

    setFormData({
      ...formData,
      items: [...formData.items, { product, quantity: 1 }]
    });
    setProductSearch('');
    setIsDropdownOpen(false);
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setFormData({
      ...formData,
      items: formData.items.map(item => 
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    });
  };

  const handleRemoveItem = (productId: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.product.id !== productId)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert('Додайте хоча б один товар до транзакції!');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('accessToken');

    try {
      const payload = {
        type: formData.type,
        comment: formData.comment,
        items: formData.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      };

      const response = await fetch('http://localhost:3000/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Помилка при створенні транзакції');
      }

      setIsCreateModalOpen(false);
      setFormData({ type: 'IN', comment: '', items: [] });
      fetchData();
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.sidebar}>
        <h2 style={{color: '#FFD700'}}>SmartStock</h2>
        <ul style={styles.menu}>
          {userRole === 'Admin' && (
            <>
              <li style={styles.menuItem} onClick={() => navigate('/dashboard')}>Головна</li>
              <li style={styles.menuItem} onClick={() => navigate('/products')}>Товари</li>
            </>
          )}
          <li style={styles.menuItemActive}>Транзакції</li>
        </ul>
      </nav>

      <main style={styles.content}>
        <header style={styles.header}>
          <h1>Історія транзакцій</h1>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button style={styles.addButton} onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={20} /> Створити накладну
          </button>
          <button onClick={handleLogout} style={styles.logoutButton} >Вийти</button>
          </div>
        </header>

        <div style={styles.tableSection}>
          {loading ? (
            <div style={{ padding: '40px', color: '#888', textAlign: 'center' }}>Завантаження історії...</div>
          ) : error ? (
            <div style={{ padding: '20px', color: '#FF4444' }}>{error}</div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHead}>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Тип операції</th>
                  <th style={styles.th}>Товари (Позицій)</th>
                  <th style={styles.th}>Коментар</th>
                  <th style={styles.th}>Дата</th>
                  <th style={styles.th}>Дії</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const itemsCount = tx.items?.length || 0;
                  const totalQuantity = tx.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                  
                  return (
                    <tr key={tx.id} style={styles.tableRow}>
                      <td style={styles.td}>#{tx.id}</td>
                      <td style={styles.td}>
                        {tx.type === 'IN' ? (
                          <span style={styles.badgeIn}><ArrowDownRight size={16} /> Прихід</span>
                        ) : (
                          <span style={styles.badgeOut}><ArrowUpRight size={16} /> Розхід</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <div style={{ color: '#FFF', fontWeight: 'bold' }}>{itemsCount} найменувань</div>
                        <div style={{ color: '#888', fontSize: '0.85rem' }}>Загалом: {totalQuantity} шт.</div>
                      </td>
                      <td style={styles.td}>{tx.comment || '-'}</td>
                      <td style={styles.td}>{new Date(tx.createdAt).toLocaleString('uk-UA')}</td>
                      <td style={styles.td}>
                        <button 
                          style={styles.iconBtn} 
                          title="Переглянути деталі"
                          onClick={() => setViewingTransaction(tx)}
                        >
                          <Eye size={20} color="#FFD700" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {transactions.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Транзакцій ще немає.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {viewingTransaction && (
          <div style={styles.modalOverlay} onClick={() => setViewingTransaction(null)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2>Деталі транзакції #{viewingTransaction.id}</h2>
                <button style={styles.closeBtn} onClick={() => setViewingTransaction(null)}><X size={24} color="#888" /></button>
              </div>
              
              <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', color: '#AAA', fontSize: '0.9rem' }}>
                <div><strong>Тип:</strong> {viewingTransaction.type === 'IN' ? 'Прихід' : 'Розхід'}</div>
                <div><strong>Дата:</strong> {new Date(viewingTransaction.createdAt).toLocaleString('uk-UA')}</div>
                <div><strong>Користувач:</strong> {viewingTransaction.user?.username || 'Система'}</div>
              </div>
              
              {viewingTransaction.comment && (
                <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#2A2A2A', borderRadius: '6px' }}>
                  <strong>Коментар:</strong> {viewingTransaction.comment}
                </div>
              )}

              <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#FFF' }}>Список товарів:</h3>
              <div style={styles.itemsListContainer}>
                {viewingTransaction.items.map((item: any) => (
                  <div key={item.id} style={styles.viewItemRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <Package size={24} color="#888" />
                      <div>
                        <div style={{ color: '#FFF', fontWeight: 'bold' }}>{item.product.name}</div>
                        <div style={{ color: '#888', fontSize: '0.85rem' }}>SKU: {item.product.sku}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: viewingTransaction.type === 'IN' ? '#00C851' : '#FF4444' }}>
                      {viewingTransaction.type === 'IN' ? '+' : '-'}{item.quantity} шт.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {isCreateModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={{...styles.modalContent, width: '700px'}}>
              <div style={styles.modalHeader}>
                <h2>Нова накладна</h2>
                <button style={styles.closeBtn} onClick={() => setIsCreateModalOpen(false)}><X size={24} color="#888" /></button>
              </div>

              <form onSubmit={handleSubmit}>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={styles.label}>Тип операції</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      style={formData.type === 'IN' ? styles.typeBtnActiveIn : styles.typeBtn}
                      onClick={() => setFormData({ ...formData, type: 'IN' })}
                    >
                      <ArrowDownRight size={18} /> Прихід (Поповнення)
                    </button>
                    <button
                      type="button"
                      style={formData.type === 'OUT' ? styles.typeBtnActiveOut : styles.typeBtn}
                      onClick={() => setFormData({ ...formData, type: 'OUT' })}
                    >
                      <ArrowUpRight size={18} /> Розхід (Списання)
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={styles.label}>Коментар (Опціонально)</label>
                  <input 
                    type="text" 
                    placeholder="Наприклад: Поповнення запасів на складі"
                    style={styles.input} 
                    value={formData.comment} 
                    onChange={(e) => setFormData({...formData, comment: e.target.value})} 
                  />
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #333', margin: '20px 0' }} />

                <div style={{ marginBottom: '20px', position: 'relative' }} ref={dropdownRef}>
                  <label style={styles.label}>Додати товар</label>
                  <div style={styles.searchContainer}>
                    <Search size={18} color="#888" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                    <input 
                      type="text"
                      placeholder="Почніть вводити назву або артикул (SKU)..."
                      style={{ ...styles.input, paddingLeft: '40px' }}
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                    />
                  </div>

                  {isDropdownOpen && productSearch && (
                    <div style={styles.customDropdown}>
                      {filteredProductsForDropdown.length > 0 ? (
                        filteredProductsForDropdown.map(p => (
                          <div 
                            key={p.id} 
                            style={styles.dropdownItem}
                            onClick={() => handleAddProductToTransaction(p)}
                          >
                            <div>
                              <div style={{ color: '#FFF', fontWeight: 'bold' }}>{p.name}</div>
                              <div style={{ color: '#888', fontSize: '0.85rem' }}>SKU: {p.sku} | Категорія: {p.category?.name}</div>
                            </div>
                            <div style={{ color: '#FFD700', fontSize: '0.9rem' }}>Залишок: {p.current_quantity}</div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '15px', color: '#888', textAlign: 'center' }}>Товарів не знайдено</div>
                      )}
                    </div>
                  )}
                </div>

                <div style={styles.selectedItemsContainer}>
                  <h3 style={{ fontSize: '1rem', color: '#FFF', marginBottom: '15px' }}>
                    Товари в накладній ({formData.items.length})
                  </h3>
                  
                  {formData.items.length === 0 ? (
                    <div style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
                      Знайдіть товар вище і клікніть по ньому, щоб додати сюди.
                    </div>
                  ) : (
                    formData.items.map((item) => (
                      <div key={item.product.id} style={styles.selectedItemRow}>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#FFF', fontWeight: 'bold' }}>{item.product.name}</div>
                          <div style={{ color: '#888', fontSize: '0.85rem' }}>Залишок на складі: {item.product.current_quantity}</div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#121212', borderRadius: '6px', border: '1px solid #333' }}>
                            <button type="button" style={styles.qtyBtn} onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}>-</button>
                            <input 
                              type="number"
                              min="1"
                              style={styles.qtyInput}
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value) || 1)}
                            />
                            <button type="button" style={styles.qtyBtn} onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}>+</button>
                          </div>
                          
                          <button 
                            type="button" 
                            style={styles.removeItemBtn}
                            onClick={() => handleRemoveItem(item.product.id)}
                            title="Видалити"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button type="submit" style={{...styles.submitBtn, opacity: (isSubmitting || formData.items.length === 0) ? 0.5 : 1}} disabled={isSubmitting || formData.items.length === 0}>
                  {isSubmitting ? 'Проведення...' : 'Зберегти транзакцію'}
                 </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

const styles = {
  container: { display: 'flex', backgroundColor: '#121212', minHeight: '100vh', color: '#FFF', fontFamily: 'Arial, sans-serif' },
  sidebar: { width: '250px', backgroundColor: '#1E1E1E', padding: '20px', borderRight: '1px solid #333' },
  menu: { listStyle: 'none', padding: 0, marginTop: '40px' },
  menuItem: { padding: '12px 0', color: '#888', cursor: 'pointer', transition: 'color 0.2s' },
  menuItemActive: { padding: '12px 0', color: '#FFD700', fontWeight: 'bold' as const, cursor: 'default' },
  content: { flex: 1, padding: '30px', position: 'relative' as const },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' },
  addButton: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFD700', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' },
  logoutButton: { backgroundColor: 'transparent', color: '#FF4444', border: '1px solid #FF4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  tableSection: { backgroundColor: '#1E1E1E', borderRadius: '8px', border: '1px solid #333', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'left' as const },
  tableHead: { backgroundColor: '#2A2A2A', borderBottom: '2px solid #333' },
  th: { color: '#AAA', padding: '16px', fontSize: '0.9rem', fontWeight: 'normal' },
  tableRow: { borderBottom: '1px solid #2A2A2A', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#252525' } },
  td: { padding: '16px', fontSize: '0.95rem', color: '#DDD' },
  
  badgeIn: { display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(0, 200, 81, 0.1)', color: '#00C851', padding: '6px 10px', borderRadius: '20px', fontWeight: 'bold' as const, fontSize: '0.85rem' },
  badgeOut: { display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(255, 68, 68, 0.1)', color: '#FF4444', padding: '6px 10px', borderRadius: '20px', fontWeight: 'bold' as const, fontSize: '0.85rem' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', transition: 'background-color 0.2s', ':hover': { backgroundColor: 'rgba(255,215,0,0.1)' } },

  modalOverlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#1E1E1E', padding: '30px', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' as const, width: '600px' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' },
  label: { display: 'block', marginBottom: '10px', color: '#888', fontSize: '0.9rem' },
  input: { width: '100%', padding: '12px 14px', backgroundColor: '#121212', border: '1px solid #333', borderRadius: '6px', color: '#FFF', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' as const, transition: 'border 0.2s' },
  submitBtn: { width: '100%', padding: '14px', backgroundColor: '#FFD700', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold' as const, fontSize: '1rem', cursor: 'pointer', marginTop: '20px' },
  
  typeBtn: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: '#121212', border: '1px solid #333', color: '#888', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' as const, fontSize: '0.95rem' },
  typeBtnActiveIn: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'rgba(0, 200, 81, 0.1)', border: '1px solid #00C851', color: '#00C851', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' as const, fontSize: '0.95rem' },
  typeBtnActiveOut: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'rgba(255, 68, 68, 0.1)', border: '1px solid #FF4444', color: '#FF4444', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' as const, fontSize: '0.95rem' },

  searchContainer: { position: 'relative' as const },
  customDropdown: { position: 'absolute' as const, top: '100%', left: 0, right: 0, backgroundColor: '#2A2A2A', border: '1px solid #444', borderRadius: '6px', marginTop: '4px', maxHeight: '250px', overflowY: 'auto' as const, zIndex: 10, boxShadow: '0 4px 15px rgba(0,0,0,0.5)' },
  dropdownItem: { padding: '12px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', cursor: 'pointer', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#333' } },
  
  selectedItemsContainer: { backgroundColor: '#1A1A1A', padding: '20px', borderRadius: '8px', border: '1px solid #333' },
  selectedItemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#222', padding: '15px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #333' },
  qtyBtn: { background: 'none', border: 'none', color: '#FFD700', padding: '10px 15px', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' as const },
  qtyInput: { width: '50px', backgroundColor: 'transparent', border: 'none', borderLeft: '1px solid #333', borderRight: '1px solid #333', color: '#FFF', textAlign: 'center' as const, fontSize: '1rem', outline: 'none', MozAppearance: 'textfield' as any },
  removeItemBtn: { background: 'none', border: 'none', color: '#FF4444', cursor: 'pointer', display: 'flex', padding: '8px', borderRadius: '6px', backgroundColor: 'rgba(255,68,68,0.1)' },

  itemsListContainer: { backgroundColor: '#121212', borderRadius: '8px', border: '1px solid #333', overflow: 'hidden' },
  viewItemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #2A2A2A' }
};

export default TransactionsPage;