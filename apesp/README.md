# pAIse: AI-Powered Expense Management

`pAIse` is a next-generation, AI-powered expense management application designed for scalability, performance, and a rich feature-set. It handles complex social interactions (friend requests), intricate expense models (multi-payer, multi-split), and instantaneous, high-performance balance calculations, all powered by a robust backend architecture.

## Features

- **Secure Authentication:** Modern JWT-based authentication with short-lived access tokens and long-lived refresh tokens.
- **Social Graph:** Full friend request and management workflow (pending, accepted, blocked).
- **Group Management:** Create and manage groups with Role-Based Access Control (Admin, Member).
- **Complex Expense Splitting:** Supports multiple payers and various split types (equal, exact, percentage, share).
- **Real-time Balance Calculation:** High-performance, denormalized balance system for instantaneous updates.
- **Debt Simplification:** Smart algorithm to minimize the number of transactions needed to settle group debts.
- **AI-Powered Expense Entry:**
  - **Receipt Scanning (OCR):** Scan receipts to automatically create draft expenses.
  - **Voice-Powered Entry:** Create draft expenses from voice commands.
- **AI Financial Chatbot:** A natural language interface to query your financial data.
- **Personal Finance Tools:** Manage budgets, subscriptions, and savings goals.


## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **API Client:** [Axios](https://axios-http.com/) & [SWR](https://swr.vercel.app/)


## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v20.x or later recommended)
- [npm](https://www.npmjs.com/) (or yarn/pnpm)
- [PostgreSQL](https://www.postgresql.org/download/) database

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/atiujjwal/pAIse.git
    cd apesp
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Refer .env.example to create a `.env` file in the root of the `apesp` directory and add your database connection string:
    ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    ```

4.  **Run database migrations:**
    This will sync the Prisma schema with your database and create the necessary tables.
    ```sh
    npx prisma migrate dev
    ```
    
5.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

---

