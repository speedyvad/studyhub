const { io } = require('socket.io-client');

// Teste do WebSocket
const socket = io('http://localhost:3001', {
  auth: {
    token: 'test-token' // Substitua por um token válido
  }
});

socket.on('connect', () => {
  console.log('✅ Conectado ao WebSocket');
  
  // Teste: Entrar em um grupo
  socket.emit('join_group', { groupId: 'test-group' });
});

socket.on('joined_group', (data) => {
  console.log('✅ Entrou no grupo:', data);
  
  // Teste: Enviar mensagem
  socket.emit('send_message', {
    groupId: 'test-group',
    content: 'Olá, esta é uma mensagem de teste!'
  });
});

socket.on('new_message', (message) => {
  console.log('📨 Nova mensagem:', message);
});

socket.on('error', (error) => {
  console.error('❌ Erro:', error);
});

socket.on('disconnect', () => {
  console.log('🔌 Desconectado');
});

// Teste de digitação
setTimeout(() => {
  socket.emit('typing_start', { groupId: 'test-group' });
  
  setTimeout(() => {
    socket.emit('typing_stop', { groupId: 'test-group' });
  }, 3000);
}, 2000);

console.log('🚀 Iniciando teste do WebSocket...');
