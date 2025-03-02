# Afkar - Your Ultimate User Research Platform

![Afkar Logo](public/logo.svg)

Afkar is a comprehensive platform designed to streamline the user research process for researchers, participants, and admins. Our mission is to provide an intuitive, secure, and efficient solution that empowers researchers to conduct high-quality studies, engages participants effectively, and enables admins to manage the entire process seamlessly.

## 🚀 Features

- **AI-Powered Analytics**: Get instant insights with our AI-powered analysis tools
- **User Testing**: Conduct remote usability tests with real Saudi users
- **Target Audience**: Access our diverse pool of participants or bring your own
- **Project Management**: Organize and track research projects efficiently
- **Team Collaboration**: Work seamlessly with your team members
- **Real-time Analytics**: Monitor research progress and participant engagement

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Authentication**: [Supabase Auth](https://supabase.com/auth)
- **Database**: [Supabase](https://supabase.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Form Validation**: [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)
- **Charts**: [Recharts](https://recharts.org/)

## 📦 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # Reusable UI components
├── contexts/             # React contexts
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and configurations
│   └── supabase/       # Supabase client setup
├── styles/             # Global styles
└── types/              # TypeScript type definitions
```

## 🔐 Authentication Flow

1. **Sign Up**:
   - Email/password registration
   - Email verification
   - Profile creation

2. **Sign In**:
   - Email/password authentication
   - Remember me functionality
   - Password reset flow

3. **Protected Routes**:
   - Middleware-based route protection
   - Role-based access control
   - Session management

## 🗄️ Database Schema

- **Profiles**: User profiles and preferences
- **Organizations**: Research organizations
- **Projects**: Research projects
- **Tasks**: Project tasks and assignments
- **Comments**: Task comments and discussions
- **Activity Logs**: System-wide activity tracking

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/afkar.git
   cd afkar
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials and other required variables.

4. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the application.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Team](https://nextjs.org/)
- [Shadcn](https://twitter.com/shadcn)
- [Supabase Team](https://supabase.com/)
- All our contributors and users

---

Built with ❤️ for the Saudi research community
