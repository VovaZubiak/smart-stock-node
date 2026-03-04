import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, AlertCircle, X, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { generateStockReportPDF } from '../utils/pdfGenerator';

const ProductsPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | 'all'>('all');

  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', sku: '', categoryId: '', min_threshold: 5 });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('accessToken');
      const role = localStorage.getItem('userRole');
      if (!token) { navigate('/login'); return; }
      if (role !== 'Admin') {
        navigate('/transactions'); 
      }

      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: '10',
        });
        
        if (debouncedSearch) queryParams.append('search', debouncedSearch);
        if (filterCategory !== 'all') queryParams.append('categoryId', filterCategory.toString());

        const response = await fetch(`http://localhost:3000/products?${queryParams.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Помилка завантаження товарів');
        
        const result = await response.json();
        setProducts(result.data);
        setTotalPages(result.lastPage);

        if (categories.length === 0) {
          const catRes = await fetch('http://localhost:3000/categories', { headers: { 'Authorization': `Bearer ${token}` } });
          setCategories(await catRes.json());
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, filterCategory, debouncedSearch, navigate]);

  const openAddModal = () => {
    setEditingProductId(null);
    setFormData({ name: '', sku: '', categoryId: categories.length > 0 ? categories[0].id : '', min_threshold: 5 });
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProductId(product.id);
    setFormData({ name: product.name, sku: product.sku, categoryId: product.category?.id || '', min_threshold: product.min_threshold });
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Видалити товар?')) return;
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`http://localhost:3000/products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
      setCurrentPage(prev => prev); 
      setProducts(products.filter(p => p.id !== id));
    } catch (err: any) { alert(err.message); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('accessToken');
    const isEditing = editingProductId !== null;
    const url = isEditing ? `http://localhost:3000/products/${editingProductId}` : 'http://localhost:3000/products';
    const method = isEditing ? 'PATCH' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, categoryId: Number(formData.categoryId) })
      });
      setIsModalOpen(false);
      setProducts([]);
      setCurrentPage(isEditing ? currentPage : 1);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    const token = localStorage.getItem('accessToken');

    try {
      const response = await fetch('http://localhost:3000/products?limit=1000', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const allProducts = data.data || [];

      await generateStockReportPDF(allProducts);

    } catch (err) {
      alert('Помилка при генерації PDF');
      console.error(err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.sidebar}>
        <h2 style={{color: '#FFD700'}}>SmartStock</h2>
        <ul style={styles.menu}>
          <li style={styles.menuItem} onClick={() => navigate('/dashboard')}>Головна</li>
          <li style={styles.menuItemActive}>Товари</li>
          <li style={styles.menuItem} onClick={() => navigate('/transactions')}>Транзакції</li>
        </ul>
      </nav>

      <main style={styles.content}>
        <header style={styles.header}>
          <h1>Управління товарами</h1>
          <div style={styles.controls}>
            <div style={styles.searchBox}>
              <Search size={18} color="#888" />
              <input 
                type="text" 
                placeholder="Пошук (SKU, назва)..." 
                style={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              style={styles.pdfButton} 
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
            >
              <Download size={20} />
              {isGeneratingPDF ? 'Генерація...' : 'Завантажити PDF'}
            </button>
            <button style={styles.addButton} onClick={openAddModal}>
              <Plus size={20} /> Додати
            </button>
          </div>
        </header>

        <div style={styles.categoryTabs}>
          <button style={filterCategory === 'all' ? styles.activeTab : styles.tab} onClick={() => setFilterCategory('all')}>
            Всі товари
          </button>
          {categories.map(cat => (
            <button key={cat.id} style={filterCategory === cat.id ? styles.activeTab : styles.tab} onClick={() => setFilterCategory(cat.id)}>
              {cat.name}
            </button>
          ))}
        </div>

        <div style={styles.tableSection}>
          {loading ? (
            <div style={{ padding: '40px', color: '#888', textAlign: 'center' }}>Завантаження даних із сервера...</div>
          ) : error ? (
            <div style={{ padding: '20px', color: '#FF4444' }}>{error}</div>
          ) : (
            <>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHead}>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Назва</th>
                    <th style={styles.th}>Артикул (SKU)</th>
                    <th style={styles.th}>Категорія</th>
                    <th style={styles.th}>Залишок</th>
                    <th style={styles.th}>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const isLowStock = product.current_quantity <= product.min_threshold;
                    return (
                      <tr key={product.id} style={styles.tableRow}>
                        <td style={styles.td}>{product.id}</td>
                        <td style={{...styles.td, fontWeight: 'bold', color: '#FFF'}}>{product.name}</td>
                        <td style={{...styles.td, color: '#888'}}>{product.sku}</td>
                        <td style={styles.td}>{product.category?.name || 'Без категорії'}</td>
                        <td style={{...styles.td, color: isLowStock ? '#FF4444' : '#00C851', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'}}>
                          {product.current_quantity} шт.
                          {isLowStock && <AlertCircle size={16} color="#FF4444" />}
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionButtons}>
                            <button style={styles.iconBtn} title="Редагувати" onClick={() => openEditModal(product)}><Edit size={18} /></button>
                            <button style={{...styles.iconBtn, color: '#FF4444'}} title="Видалити" onClick={() => handleDeleteProduct(product.id)}><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {products.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Нічого не знайдено</td></tr>
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button 
                    style={styles.pageBtn} 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span style={{ color: '#888', fontSize: '0.9rem' }}>
                    Сторінка {currentPage} з {totalPages}
                  </span>
                  <button 
                    style={styles.pageBtn} 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {isModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h2>{editingProductId ? 'Редагувати товар' : 'Новий товар'}</h2>
                <button style={styles.closeBtn} onClick={() => setIsModalOpen(false)}><X size={24} color="#888" /></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={styles.inputGroup}><label style={styles.label}>Назва товару</label><input type="text" required style={styles.input} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                <div style={styles.inputGroup}><label style={styles.label}>Артикул (SKU)</label><input type="text" required style={styles.input} value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} /></div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Категорія</label>
                  <select required style={styles.input} value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
                    <option value="" disabled>Оберіть категорію...</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
                <div style={styles.inputGroup}><label style={styles.label}>Мін. залишок</label><input type="number" min="0" required style={styles.input} value={formData.min_threshold} onChange={(e) => setFormData({...formData, min_threshold: parseInt(e.target.value) || 0})} /></div>
                <button type="submit" style={{...styles.submitBtn, opacity: isSubmitting ? 0.7 : 1}} disabled={isSubmitting}>{isSubmitting ? 'Збереження...' : 'Зберегти'}</button>
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
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
  controls: { display: 'flex', gap: '15px', alignItems: 'center' },
  categoryTabs: { display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto' as const, paddingBottom: '5px' },
  tab: { padding: '8px 16px', backgroundColor: '#1E1E1E', color: '#888', border: '1px solid #333', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap' as const, transition: 'all 0.2s', fontSize: '0.9rem' },
  activeTab: { padding: '8px 16px', backgroundColor: '#FFD700', color: '#000', border: '1px solid #FFD700', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap' as const, fontWeight: 'bold' as const, fontSize: '0.9rem' },
  searchBox: { display: 'flex', alignItems: 'center', backgroundColor: '#1E1E1E', border: '1px solid #333', borderRadius: '6px', padding: '8px 12px', width: '250px' },
  searchInput: { backgroundColor: 'transparent', border: 'none', color: '#FFF', outline: 'none', marginLeft: '8px', width: '100%', fontSize: '0.95rem' },
  pdfButton: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFD700', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' },
  addButton: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFD700', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' },
  tableSection: { backgroundColor: '#1E1E1E', borderRadius: '8px', border: '1px solid #333', overflow: 'hidden', paddingBottom: '10px' },
  table: { width: '100%', borderCollapse: 'collapse' as const, textAlign: 'left' as const },
  tableHead: { backgroundColor: '#2A2A2A', borderBottom: '2px solid #333' },
  th: { color: '#AAA', padding: '16px', fontSize: '0.9rem', fontWeight: 'normal' },
  tableRow: { borderBottom: '1px solid #2A2A2A', transition: 'background-color 0.2s', ':hover': { backgroundColor: '#252525' } },
  td: { padding: '16px', fontSize: '0.95rem', color: '#DDD' },
  actionButtons: { display: 'flex', gap: '15px' },
  iconBtn: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0, display: 'flex', transition: 'color 0.2s', opacity: 0.8, ':hover': { opacity: 1 } },
  
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px', padding: '10px' },
  pageBtn: { background: '#2A2A2A', border: '1px solid #333', color: '#FFF', padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  modalOverlay: { position: 'fixed' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#1E1E1E', padding: '30px', borderRadius: '12px', width: '400px', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.9rem' },
  input: { width: '100%', padding: '12px', backgroundColor: '#2A2A2A', border: '1px solid #333', borderRadius: '6px', color: '#FFF', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' as const },
  submitBtn: { width: '100%', padding: '14px', backgroundColor: '#FFD700', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold' as const, fontSize: '1rem', cursor: 'pointer', marginTop: '10px' }
};

export default ProductsPage;
