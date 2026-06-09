module.exports = (err, req, res, next) => {
  console.error(err);
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
  }
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with this value already exists' });
  }
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
};
