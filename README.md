# DijiBill - Invoice Management Platform

A modern invoice management platform built with Next.js that helps businesses create, manage, and track invoices with ease.

## Features

### Core Invoice Management
- **Create & Edit Invoices**: Build professional invoices with itemized line items, quantities, and rates
- **Invoice Status Tracking**: Monitor invoice status (Paid/Pending) with visual indicators
- **Client Management**: Store and manage client information including names, emails, and addresses
- **Invoice Numbering**: Automatic invoice numbering system for organized record-keeping
- **Due Date Management**: Set and track payment due dates with Net terms
- **Currency Support**: Multi-currency support for international invoicing
- **Notes & Terms**: Add custom notes and payment terms to invoices

### Dashboard & Analytics
- **Real-time Dashboard**: Comprehensive overview of invoice metrics and performance
- **Revenue Tracking**: Monitor total revenue across all invoices
- **Invoice Statistics**: Track total issued, paid, and pending invoices
- **Financial Charts**: Visual line charts showing revenue trends over time
- **Recent Activity**: View recent invoices with client avatars and amounts
- **Quick Actions**: Fast access to common invoice operations

### Communication & Automation
- **Email Reminders**: Send automated reminder emails to clients for unpaid invoices
- **PDF Generation**: Download professional PDF invoices with formatted layouts
- **Email Notifications**: Automated email system for invoice updates and reminders
- **Client Communication**: Integrated email functionality for client correspondence

### User Experience
- **Secure Authentication**: NextAuth.js integration with multiple provider support
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Mode Support**: Built-in theme switching for comfortable viewing
- **Modern UI/UX**: Clean, intuitive interface using Radix UI components
- **Loading States**: Smooth loading animations and skeleton screens
- **Toast Notifications**: Real-time feedback for user actions

### Advanced Features
- **Bulk Operations**: Mark multiple invoices as paid or perform batch actions
- **Invoice Actions**: Edit, download, delete, and manage individual invoices
- **Search & Filter**: Find invoices quickly with advanced filtering options
- **Data Validation**: Form validation using Zod schemas for data integrity
- **Type Safety**: Full TypeScript implementation for better development experience

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Prisma adapter
- **Email**: Mailtrap for email services
- **Charts**: Recharts for data visualization
- **PDF Generation**: jsPDF

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- Mailtrap account (for email services)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd invoiceplatform
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/invoiceplatform"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
MAILTRAP_TOKEN="your-mailtrap-token"
```

5. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

6. Run the development server:
```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   ├── components/        # Page components
│   ├── dashboard/         # Dashboard pages
│   └── utils/             # Utility functions
├── components/            # Reusable components
│   └── ui/               # UI components
├── lib/                   # Library utilities
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Available Scripts

- `bun dev` - Start development server with Turbopack
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint
- `bun check` - Install dependencies and build

## Database Schema

The application uses PostgreSQL with the following main entities:
- **Users**: User accounts with authentication
- **Invoices**: Invoice records with line items and status tracking
- **Authentication**: NextAuth.js session management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.