const nodemailer = require('nodemailer');
const { logger } = require('./logger');

class EmailService {
  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.fromEmail = process.env.FROM_EMAIL || 'noreply@ri.gym.pro';
    this.companyName = 'ri.gym.pro';
  }

  // Send order confirmation email
  async sendOrderConfirmation(orderData) {
    try {
      const { customer, order, items } = orderData;
      
      const itemsHtml = items.map(item => `
        <tr>
          <td>${item.productName}</td>
          <td>${item.quantity}</td>
          <td>${this.formatPrice(item.unitPrice)}</td>
          <td>${this.formatPrice(item.totalPrice)}</td>
        </tr>
      `).join('');

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Confirmation de commande</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .order-details { background-color: #f8f9fa; padding: 15px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f9fa; }
            .total { font-weight: bold; font-size: 1.2em; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${this.companyName}</h1>
            <h2>Confirmation de votre commande</h2>
          </div>
          
          <div class="content">
            <p>Bonjour ${customer.firstName} ${customer.lastName},</p>
            <p>Nous avons bien reçu votre commande. Voici les détails :</p>
            
            <div class="order-details">
              <p><strong>Numéro de commande :</strong> ${order.orderNumber}</p>
              <p><strong>Date :</strong> ${this.formatDate(order.createdAt)}</p>
              <p><strong>Statut :</strong> ${this.getStatusText(order.status)}</p>
              <p><strong>Méthode de paiement :</strong> ${this.getPaymentMethodText(order.paymentMethod)}</p>
            </div>

            <h3>Articles commandés :</h3>
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="order-details">
              <p><strong>Sous-total :</strong> ${this.formatPrice(order.subtotal)}</p>
              <p><strong>Frais de livraison :</strong> ${this.formatPrice(order.shippingAmount)}</p>
              <p class="total"><strong>Total :</strong> ${this.formatPrice(order.totalAmount)}</p>
            </div>

            <h3>Adresse de livraison :</h3>
            <div class="order-details">
              <p>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</p>
              <p>${order.shippingAddress.addressLine1}</p>
              ${order.shippingAddress.addressLine2 ? `<p>${order.shippingAddress.addressLine2}</p>` : ''}
              <p>${order.shippingAddress.city}, ${order.shippingAddress.stateProvince}</p>
              <p>Téléphone : ${order.shippingAddress.phone}</p>
            </div>

            <p>Nous vous enverrons un email de confirmation dès que votre commande sera expédiée.</p>
            <p>Merci pour votre confiance !</p>
          </div>

          <div class="footer">
            <p>&copy; 2025 ${this.companyName}. Tous droits réservés.</p>
            <p>Si vous avez des questions, contactez-nous à support@ri.gym.pro</p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: this.fromEmail,
        to: customer.email,
        subject: `Confirmation de commande ${order.orderNumber} - ${this.companyName}`,
        html
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Order confirmation email sent to ${customer.email} for order ${order.orderNumber}`);

    } catch (error) {
      logger.error('Send order confirmation email error:', error);
      throw error;
    }
  }

  // Send order status update email
  async sendOrderStatusUpdate(orderData) {
    try {
      const { customer, order, oldStatus, newStatus } = orderData;
      
      const statusMessages = {
        confirmed: 'Votre commande a été confirmée et est en cours de préparation.',
        processing: 'Votre commande est en cours de traitement.',
        shipped: `Votre commande a été expédiée. ${order.trackingNumber ? `Numéro de suivi : ${order.trackingNumber}` : ''}`,
        delivered: 'Votre commande a été livrée. Merci pour votre achat !',
        cancelled: 'Votre commande a été annulée.'
      };

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Mise à jour de votre commande</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .status-update { background-color: #d4edda; border: 1px solid #c3e6cb; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .order-details { background-color: #f8f9fa; padding: 15px; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${this.companyName}</h1>
            <h2>Mise à jour de votre commande</h2>
          </div>
          
          <div class="content">
            <p>Bonjour ${customer.firstName} ${customer.lastName},</p>
            
            <div class="status-update">
              <h3>📦 Statut mis à jour</h3>
              <p><strong>Commande :</strong> ${order.orderNumber}</p>
              <p><strong>Nouveau statut :</strong> ${this.getStatusText(newStatus)}</p>
              <p>${statusMessages[newStatus] || 'Votre commande a été mise à jour.'}</p>
            </div>

            ${order.trackingNumber ? `
              <div class="order-details">
                <p><strong>Numéro de suivi :</strong> ${order.trackingNumber}</p>
                <p>Vous pouvez suivre votre colis avec ce numéro.</p>
              </div>
            ` : ''}

            <p>Merci pour votre patience et votre confiance !</p>
          </div>

          <div class="footer">
            <p>&copy; 2025 ${this.companyName}. Tous droits réservés.</p>
            <p>Si vous avez des questions, contactez-nous à support@ri.gym.pro</p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: this.fromEmail,
        to: customer.email,
        subject: `Mise à jour commande ${order.orderNumber} - ${this.getStatusText(newStatus)}`,
        html
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Order status update email sent to ${customer.email} for order ${order.orderNumber}`);

    } catch (error) {
      logger.error('Send order status update email error:', error);
      throw error;
    }
  }

  // Send order cancellation email
  async sendOrderCancellation(orderData) {
    try {
      const { customer, order, reason } = orderData;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Annulation de commande</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .cancellation { background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .order-details { background-color: #f8f9fa; padding: 15px; margin: 20px 0; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${this.companyName}</h1>
            <h2>Annulation de commande</h2>
          </div>
          
          <div class="content">
            <p>Bonjour ${customer.firstName} ${customer.lastName},</p>
            
            <div class="cancellation">
              <h3>❌ Commande annulée</h3>
              <p><strong>Commande :</strong> ${order.orderNumber}</p>
              <p><strong>Montant :</strong> ${this.formatPrice(order.totalAmount)}</p>
              ${reason ? `<p><strong>Raison :</strong> ${reason}</p>` : ''}
            </div>

            <p>Votre commande a été annulée avec succès. Si un paiement a été effectué, le remboursement sera traité dans les plus brefs délais.</p>
            
            <p>Nous espérons vous revoir bientôt sur notre site !</p>
          </div>

          <div class="footer">
            <p>&copy; 2025 ${this.companyName}. Tous droits réservés.</p>
            <p>Si vous avez des questions, contactez-nous à support@ri.gym.pro</p>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: this.fromEmail,
        to: customer.email,
        subject: `Annulation commande ${order.orderNumber} - ${this.companyName}`,
        html
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Order cancellation email sent to ${customer.email} for order ${order.orderNumber}`);

    } catch (error) {
      logger.error('Send order cancellation email error:', error);
      throw error;
    }
  }

  // Helper methods
  formatPrice(amount) {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount / 100); // Assuming amounts are stored in centimes
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusText(status) {
    const statusTexts = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      processing: 'En traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      refunded: 'Remboursée'
    };
    return statusTexts[status] || status;
  }

  getPaymentMethodText(method) {
    const methodTexts = {
      cash_on_delivery: 'Paiement à la livraison',
      bank_transfer: 'Virement bancaire',
      stripe: 'Carte bancaire'
    };
    return methodTexts[method] || method;
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      logger.info('Email service configured successfully');
      return true;
    } catch (error) {
      logger.error('Email service configuration error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
