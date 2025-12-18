const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'prompt-secret',
    resave: false,
    saveUninitialized: false,
  })
);

const productsPath = path.join(__dirname, 'data', 'products.json');
const membershipsPath = path.join(__dirname, 'data', 'memberships.json');

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function requireAdmin(req, res, next) {
  if (req.session.isAdmin) return next();
  res.redirect('/admin');
}

app.get('/', (req, res) => {
  const products = readJson(productsPath).slice(0, 3);
  res.render('home', {
    products,
    isAdmin: req.session.isAdmin,
  });
});

app.get('/products', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  let products = readJson(productsPath);

  if (q) {
    products = products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  }

  res.render('products', { products, q, isAdmin: req.session.isAdmin });
});

app.get('/products/:id', (req, res) => {
  const products = readJson(productsPath);
  const product = products.find((p) => p.id === req.params.id);

  if (!product) {
    return res.status(404).render('not-found');
  }

  res.render('product-detail', { product, isAdmin: req.session.isAdmin });
});

app.get('/membership', (req, res) => {
  res.render('membership', { joined: false, isAdmin: req.session.isAdmin });
});

app.post('/membership', (req, res) => {
  const { name, email, plan } = req.body;
  const memberships = readJson(membershipsPath);
  memberships.push({ id: uuid(), name, email, plan, createdAt: new Date().toISOString() });
  writeJson(membershipsPath, memberships);

  res.render('membership', {
    joined: true,
    name,
    plan,
    isAdmin: req.session.isAdmin,
  });
});

app.get('/admin', (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { error: null });
});

app.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect('/admin/dashboard');
  }
  res.render('admin/login', { error: 'Mật khẩu không đúng. Vui lòng thử lại.' });
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.get('/admin/dashboard', requireAdmin, (req, res) => {
  const products = readJson(productsPath);
  const memberships = readJson(membershipsPath);
  res.render('admin/dashboard', { products, memberships });
});

app.post('/admin/products', requireAdmin, (req, res) => {
  const { title, price, category, description, tags, deliverable, coverImage } = req.body;
  const products = readJson(productsPath);

  const product = {
    id: uuid(),
    title,
    price: parseFloat(price) || 0,
    category,
    description,
    deliverable,
    coverImage: coverImage || '/images/default.jpg',
    tags: (tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  };

  products.unshift(product);
  writeJson(productsPath, products);

  res.redirect('/admin/dashboard');
});

app.post('/admin/products/:id/delete', requireAdmin, (req, res) => {
  const { id } = req.params;
  let products = readJson(productsPath);
  products = products.filter((p) => p.id !== id);
  writeJson(productsPath, products);
  res.redirect('/admin/dashboard');
});

app.use((req, res) => {
  res.status(404).render('not-found');
});

app.listen(PORT, () => {
  console.log(`Prompt printable store running on http://localhost:${PORT}`);
});
