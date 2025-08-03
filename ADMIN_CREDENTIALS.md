# Admin User Credentials

## Default Admin Account

A default admin user has been created for accessing the admin panel:

### Login Credentials
- **Email:** `admin@ri.gym.pro`
- **Password:** `admin123`
- **Role:** `super_admin`

### Admin Panel Access
- **URL:** `http://localhost:3000/admin`
- **Features:** Full access to all admin functions

### Admin Capabilities
The super_admin role has access to:
- 📊 **Dashboard** - Overview statistics and metrics
- 📦 **Orders Management** - View and manage all orders
- 👥 **Users Management** - Manage user accounts and roles
- 🛍️ **Products Management** - Add, edit, and manage products
- 📈 **Analytics** - View sales and performance analytics
- 📝 **Content Management** - Manage banners, categories, and site content
- ⚙️ **System Settings** - Configure system settings and admin users

### Security Notes
- This is a default admin account for development/testing
- **Change the password** before deploying to production
- Consider creating additional admin users with specific roles for team members

### Scripts Available
- `scripts/create-admin-user.js` - Create/update admin user
- `scripts/show-admin-credentials.js` - Display current admin users

### Changing Admin Password
To change the admin password, you can either:
1. Use the admin panel settings (recommended)
2. Run the `create-admin-user.js` script with new credentials
3. Use the user profile update API endpoint

---
*Generated on: 2025-07-08*
