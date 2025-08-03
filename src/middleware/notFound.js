const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} non trouvée`,
      path: req.originalUrl,
      method: req.method
    }
  });
};

module.exports = notFound;
