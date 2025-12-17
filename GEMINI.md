
# GEMINI.md

## Project Overview

This is a web application for managing employee holidays and leave requests. It's built with a modern frontend stack and uses Supabase for its backend.

**Main Technologies:**

*   **Framework:** React (with Vite)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS with shadcn-ui components
*   **Backend:** Supabase
*   **Routing:** React Router
*   **State Management:** React Query

**Architecture:**

The application is structured as a single-page application (SPA). The frontend is composed of various React components, and it communicates with a Supabase backend for data persistence. The UI is built using shadcn-ui, which provides a set of accessible and customizable components.

## Building and Running

**Prerequisites:**

*   Node.js and npm (or a compatible package manager)

**Key Commands:**

*   **Install dependencies:**
    ```bash
    npm install
    ```
*   **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:8080`.
*   **Build for production:**
    ```bash
    npm run build
    ```
*   **Lint the code:**
    ```bash
    npm run lint
    ```
*   **Preview the production build:**
    ```bash
    npm run preview
    ```

## Development Conventions

*   **Component-Based:** The application follows a component-based architecture. UI elements are broken down into reusable components.
*   **Styling:** Styling is done using Tailwind CSS utility classes.
*   **State Management:** React Query is used for managing server state, caching, and data fetching.
*   **Routing:** React Router is used for client-side routing.
*   **Code Quality:** ESLint is used for static code analysis to enforce code quality and consistency.
*   **Path Aliases:** The project uses a path alias `@` which resolves to the `src` directory.
*   **Semantic Code (DDD-lite):** Code should describe the *business intent* (what it does), not just the implementation (how it does it).
    *   Avoid raw DB calls in main business logic flows. Extract them to helper functions with descriptive names (e.g., `getUserVacationBalance` instead of a raw `select`).
    *   Use specific types/interfaces for inputs and outputs.
