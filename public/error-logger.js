window.addEventListener('error', function(e) {
  fetch('http://localhost:5173', { method: 'POST', body: e.error ? e.error.stack : e.message }).catch(()=>null);
});
console.log('Error logger loaded');
