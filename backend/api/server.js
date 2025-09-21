const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🍽️  School Cafeteria Server running on port ${PORT}`);
  console.log(`📱 Frontend available at http://localhost:${PORT}`);
});