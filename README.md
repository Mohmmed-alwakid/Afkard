# AfkarD - Research Study Platform

AfkarD is a comprehensive platform for researchers to create, manage, and analyze research studies, while providing participants with a seamless experience to join and complete studies.

## Features

### For Researchers
- Create and manage research studies
- Track participant recruitment and progress
- Analyze study results
- Manage participant payments

### For Participants
- Browse and join research studies
- Complete studies and surveys
- Track earnings and payment history
- Manage profile and preferences

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Shadcn/Radix UI
- **State Management**: Zustand, React Query
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Validation**: Zod
- **Styling**: Tailwind CSS, Shadcn UI components

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/afkard.git
   cd afkard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

1. Create a new project in Supabase
2. Run the database migrations:
   ```bash
   npm run db:migrate
   ```

## Project Structure

```
afkard/
├── public/            # Static assets
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   │   ├── auth/      # Authentication components
│   │   ├── dashboard/ # Dashboard components
│   │   ├── studies/   # Study-related components
│   │   └── ui/        # UI components (Shadcn)
│   ├── lib/           # Utility functions and services
│   │   ├── stores/    # Zustand stores
│   │   └── supabase/  # Supabase client and utilities
│   └── types/         # TypeScript type definitions
├── supabase/          # Supabase configuration and migrations
├── .env.example       # Example environment variables
└── next.config.js     # Next.js configuration
```

## Development Workflow

1. Create a feature branch from `develop`
2. Implement your changes
3. Write tests for your changes
4. Submit a pull request to `develop`
5. After review, changes will be merged to `main` for deployment

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
