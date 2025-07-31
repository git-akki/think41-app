const API_BASE_URL = 'http://localhost:3000/api';

async function simpleTest() {
  try {
    const fetch = (await import('node-fetch')).default;
    
    console.log('Testing departments API...');
    const response = await fetch(`${API_BASE_URL}/departments`);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

simpleTest(); 