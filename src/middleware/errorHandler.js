const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Multer errors
  if (err.name === 'MulterError') {
    const message = err.code === 'LIMIT_FILE_SIZE' 
      ? 'Fichier trop volumineux (max 5MB)'
      : err.code === 'LIMIT_FILE_COUNT'
      ? 'Trop de fichiers (max 5)'
      : 'Erreur lors du téléchargement';
    error = { message, statusCode: 400 };
    return res.status(400).json({
      success: false,
      error: { message }
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Ressource non trouvée';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Ressource dupliquée';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré';
    error = { message, statusCode: 401 };
  }

  // Supabase errors
  if (err.code && err.code.startsWith('PGRST')) {
    const message = 'Erreur de base de données';
    error = { message, statusCode: 500 };
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erreur serveur interne';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
