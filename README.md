# Charity & Donation Management Portal

A full-stack web application for managing charity donations and contributions between NGOs and donors.

## Features

- **User Authentication**: Role-based login (NGO/Donor)
- **Donation Management**: NGOs can create and manage donation requests
- **Contribution System**: Donors can browse and contribute to donations
- **Dashboard**: Personalized dashboards for both NGOs and Donors
- **Leaderboard**: Top contributors ranking system
- **Real-time Updates**: Live status tracking of donations and contributions

## Tech Stack

### Frontend

- Angular 16
- Angular Material
- TypeScript
- RxJS

### Backend

- Node.js
- Express.js
- TypeScript
- MySQL
- JWT Authentication
- bcryptjs

## Prerequisites

1. Node.js (v16 or higher)
2. MySQL Server
3. Angular CLI

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/madhanmohanreddyperam06/Donation-and-Charity-Management-Portal.git
cd "Charity & Donation Management Portal"
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Database Setup

1. Start MySQL Server
2. Create database:

```sql
CREATE DATABASE charity_donation_portal;
```

3. Run the database schema:

```bash
mysql -u root -p charity_donation_portal < src/database.sql
```

#### Environment Configuration

Create `.env` file in backend directory:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Madhan@41310
DB_NAME=charity_donation_portal
JWT_SECRET=1d78e82ccc7bf74fbe1d4c666f70d1e8
PORT=3000
```

#### Start Backend Server

```bash
npm run build
npm start
```

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Start Development Server

```bash
node_modules\.bin\ng serve
```

## Usage

1. **Register**: Create an account as either NGO or Donor
2. **Login**: Use your credentials to access the platform
3. **NGO Dashboard**:
   - Create donation requests
   - Manage existing donations
   - View contribution statistics
4. **Donor Dashboard**:
   - Browse available donations
   - Track contribution history
   - View personal statistics
5. **Leaderboard**: View top contributors and rankings

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Donations

- `GET /api/donations` - Get all donations
- `GET /api/donations/:id` - Get donation by ID
- `POST /api/donations` - Create new donation (NGO only)
- `PUT /api/donations/:id` - Update donation (NGO only)
- `DELETE /api/donations/:id` - Cancel donation (NGO only)

### Contributions

- `GET /api/contributions/donor/:donorId` - Get donor contributions
- `GET /api/contributions/donation/:donationId` - Get donation contributions
- `POST /api/contributions` - Create contribution (Donor only)
- `PUT /api/contributions/:id/status` - Update contribution status

## Database Schema

### Users Table

- id (Primary Key)
- name
- email
- password (hashed)
- role (NGO/Donor)
- created_at

### Donations Table

- id (Primary Key)
- ngo_id (Foreign Key)
- donation_type
- quantity_or_amount
- location
- pickup_date_time
- status
- priority
- description
- created_at

### Contributions Table

- id (Primary Key)
- donation_id (Foreign Key)
- donor_id (Foreign Key)
- contribution_amount
- notes
- status
- created_at

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Input validation and sanitization
- CORS protection

## Development

### Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development

```bash
cd frontend
node_modules\.bin\ng serve
```

## Production Deployment

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
ng build --configuration production
```

Deploy the `dist/frontend` directory to your web server.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For any issues or questions, please contact the development team.

## Contact

- Peram Madhan Mohan Reddy[emailID: madhanmohanreddyperam06@gmail.com, Mobile : +91 9110395993]
- Narukula Chiru Venkata Mohan [emailID: chiruvenkat09@gmail.com]
- Ande Shireesha[emailID: madhanmohanreddyperam06@gmail.com]
- Nikhilashree[emailID: nikilashree.m@gmail.com]
