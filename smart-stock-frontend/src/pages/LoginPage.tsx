import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Невірний логін або пароль');
      }

      const data = await response.json();
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('userRole', data.role);
      
      if (data.role === 'Admin') {
        navigate('/dashboard');
      } else {
        navigate('/transactions');
      }

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={handleLogin}>
        <h1 style={styles.title}>Smart<span style={{color: '#FFD700'}}>Stock</span></h1>
        <p style={styles.subtitle}>Система складського обліку</p>
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.inputGroup}>
          <User size={20} color="#FFD700" style={styles.icon} />
          <input 
            type="text" 
            placeholder="Логін" 
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <Lock size={20} color="#FFD700" style={styles.icon} />
          <input 
            type="password" 
            placeholder="Пароль" 
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" style={styles.button}>Увійти</button>
      </form>
    </div>
  );
};

const styles = {
  container: { backgroundColor: '#121212', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Arial, sans-serif' },
  card: { backgroundColor: '#1E1E1E', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', width: '350px', textAlign: 'center' as const, border: '1px solid #333' },
  title: { color: '#FFF', fontSize: '2rem', marginBottom: '8px', margin: 0 },
  subtitle: { color: '#888', marginBottom: '30px', marginTop: '5px' },
  error: { color: '#FF4444', marginBottom: '15px', fontSize: '0.9rem', backgroundColor: 'rgba(255, 68, 68, 0.1)', padding: '8px', borderRadius: '4px' },
  inputGroup: { display: 'flex', alignItems: 'center', backgroundColor: '#2A2A2A', borderRadius: '8px', marginBottom: '15px', padding: '0 10px' },
  icon: { marginRight: '10px' },
  input: { backgroundColor: 'transparent', border: 'none', color: '#FFF', padding: '12px', width: '100%', outline: 'none' },
  button: { backgroundColor: '#FFD700', color: '#000', border: 'none', padding: '12px', width: '100%', borderRadius: '8px', fontWeight: 'bold' as const, cursor: 'pointer', marginTop: '10px', fontSize: '1rem' }
};

export default LoginPage;