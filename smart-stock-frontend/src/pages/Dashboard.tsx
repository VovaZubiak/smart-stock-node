import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, TrendingUp, Layers } from 'lucide-react';

const Dashboard = () => {
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      const token = localStorage.getItem('accessToken');
      const role = localStorage.getItem('userRole');
      if (!token) {
        navigate('/login');
        return;
      }
      if (role !== 'Admin') {
        navigate('/transactions'); 
      }

      try {
        const response = await fetch('http://localhost:3000/dashboard/summary', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('accessToken');
            navigate('/login');
            throw new Error('Сесія закінчилась, увійдіть знову');
          }
          throw new Error('Помилка завантаження даних');
        }

        const data = await response.json();
        setSummary(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchSummary();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div style={dashboardStyles.container}>
      <nav style={dashboardStyles.sidebar}>
        <h2 style={{color: '#FFD700'}}>SmartStock</h2>
        <ul style={dashboardStyles.menu}>
          <li style={dashboardStyles.menuItemActive}>Головна</li>
          <li style={dashboardStyles.menuItem} onClick={() => navigate('/products')}>Товари</li>
          <li style={dashboardStyles.menuItem} onClick={() => navigate('/transactions')}>Транзакції</li>
        </ul>
      </nav>

      <main style={dashboardStyles.content}>
        <header style={dashboardStyles.header}>
          <h1>Дашборд</h1>
          <div style={dashboardStyles.userSection}>
            <div style={dashboardStyles.userInfo}>Адміністратор</div>
            <button onClick={handleLogout} style={dashboardStyles.logoutButton}>Вийти</button>
          </div>
        </header>

        {error ? (
          <div style={{ color: '#FF4444', padding: '50px', textAlign: 'center' }}>{error}</div>
        ) : !summary ? (
          <div style={{ color: '#888', padding: '50px', textAlign: 'center', fontSize: '1.2rem' }}>
            Завантаження аналітики...
          </div>
        ) : (
          <>
            <div style={dashboardStyles.statsGrid}>
              <StatCard icon={<Layers color="#000"/>} title="Унікальних товарів" value={summary.overview.totalProducts} color="#FFD700" />
              <StatCard icon={<Package color="#000"/>} title="Одиниць на складі" value={summary.overview.totalItemsInStock} color="#FFD700" />
              <StatCard icon={<AlertTriangle color="#FFF"/>} title="Критичний запас" value={summary.overview.lowStockAlerts} color={summary.overview.lowStockAlerts > 0 ? "#FF4444" : "#00C851"} />
              <StatCard icon={<TrendingUp color="#000"/>} title="Останніх операцій" value={summary.recentTransactions.length} color="#FFD700" />
            </div>

            <div style={dashboardStyles.tableSection}>
              <h2 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>Останні транзакції</h2>
              <table style={dashboardStyles.table}>
                <thead>
                  <tr style={dashboardStyles.tableHead}>
                    <th style={dashboardStyles.th}>Тип</th>
                    <th style={dashboardStyles.th}>Коментар</th>
                    <th style={dashboardStyles.th}>Користувач</th>
                    <th style={dashboardStyles.th}>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentTransactions.map((tx: any) => (
                    <tr key={tx.id} style={dashboardStyles.tableRow}>
                      <td style={{...dashboardStyles.td, color: tx.type === 'IN' ? '#00C851' : '#FF4444', fontWeight: 'bold'}}>
                        {tx.type === 'IN' ? 'ПРИХІД' : 'РОЗХІД'}
                      </td>
                      <td style={dashboardStyles.td}>{tx.comment || '-'}</td>
                      <td style={dashboardStyles.td}>{tx.user?.username || 'Невідомо'}</td>
                      <td style={dashboardStyles.td}>{new Date(tx.createdAt).toLocaleString('uk-UA')}</td>
                    </tr>
                  ))}
                  {summary.recentTransactions.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{...dashboardStyles.td, textAlign: 'center', color: '#888'}}>
                        Транзакцій поки немає
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }: any) => (
  <div style={{...dashboardStyles.card, borderLeft: `5px solid ${color}`}}>
    <div style={{...dashboardStyles.iconBox, backgroundColor: color}}>{icon}</div>
    <div>
      <div style={{color: '#888', fontSize: '0.9rem'}}>{title}</div>
      <div style={{color: '#FFF', fontSize: '1.5rem', fontWeight: 'bold'}}>{value}</div>
    </div>
  </div>
);

const dashboardStyles = {
  container: { display: 'flex', backgroundColor: '#121212', minHeight: '100vh', color: '#FFF', fontFamily: 'Arial, sans-serif' },
  sidebar: { width: '250px', backgroundColor: '#1E1E1E', padding: '20px', borderRight: '1px solid #333' },
  menu: { listStyle: 'none', padding: 0, marginTop: '40px' },
  menuItem: { padding: '12px 0', color: '#888', cursor: 'pointer' },
  menuItemActive: { padding: '12px 0', color: '#FFD700', fontWeight: 'bold' as const },
  content: { flex: 1, padding: '30px' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' },
  userSection: { display: 'flex', alignItems: 'center', gap: '15px' },
  userInfo: { backgroundColor: '#2A2A2A', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem' },
  logoutButton: { backgroundColor: 'transparent', color: '#FF4444', border: '1px solid #FF4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  card: { backgroundColor: '#1E1E1E', padding: '20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px' },
  iconBox: { padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  tableSection: { marginTop: '40px', backgroundColor: '#1E1E1E', padding: '20px', borderRadius: '8px' },
  table: { width: '100%', borderCollapse: 'collapse' as const },
  tableHead: { borderBottom: '2px solid #333' },
  th: { color: '#888', textAlign: 'left' as const, padding: '12px', fontWeight: 'normal' },
  tableRow: { borderBottom: '1px solid #2A2A2A' },
  td: { color: '#FFF', padding: '12px', fontSize: '0.9rem' }
};

export default Dashboard;