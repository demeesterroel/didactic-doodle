# Simple Notes Application

This is a simple Notes application built with Next.js and Supabase.

**Focus:** The main focus of this project is learning how to implement Supabase Auth.

## Features

- **Authentication**: User sign-up, login, and secure session management using Supabase Auth.
- **Notes Management**: Create, read, update, and delete notes.
- **Row Level Security**: Secure data access policies to ensure users can only manage their own notes (and view public ones).

## Tech Stack

- Next.js (App Router)
- Supabase (Auth & Database)
- Tailwind CSS
- shadcn/ui

## Getting Started

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables in `.env.local`:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-project-url
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
