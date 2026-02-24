# SafeHands Unified Dashboard Template

A comprehensive React + TypeScript template designed to run seamlessly as a web application, a mobile Progressive Web App (PWA), and a desktop Electron application.

This project implements a multi-tenant dashboard architecture modeled for a Health and Security platform ("SafeHands"), establishing different UI flows based on user roles.

## 🚀 Features

*   **Unified Codebase**: Write once in React (`src/`), run anywhere.
*   **Desktop App (Electron)**: Dedicated `electron/` folder setup for native OS windowing.
*   **Mobile Web App (PWA)**: Built-in Vite PWA plugin for installable mobile experiences with offline caching.
*   **Role-Based Routing**: Dynamically renders distinct application layouts based on the authenticated user's role (Super Admin, Tenant Admin, Family Portal, Field Executive).
*   **Modern Design System**: Custom Vanilla CSS implementation featuring glassmorphism, responsive grids, and CSS variable-driven light/dark themes.
*   **No External UI Libraries**: Built from scratch using native HTML/CSS and Lucide React icons for maximum customization and minimal bloat.

## 📱 Dashboards Included

The application currently features 4 distinct dashboard layouts:

1.  **Family Portal**: A mobile-first PWA design for end-users to monitor health vitals, home security, and live camera feeds of their loved ones. Features a bottom navigation bar.
2.  **Field Executive App**: A responsive, mobile-first interface for nurses and security guards to view their daily itineraries, check-in to locations, and send emergency SOS alerts.
3.  **Tenant Admin Dashboard**: A desktop-focused admin panel for local care agencies to manage their enrolled families, assign field executives, and review service reports.
4.  **Super Admin Dashboard**: The top-level platform management tool for monitoring global system health, tenant MRR, and platform-wide security emergencies with data tables and global maps.

## 🛠 Tech Stack

*   **Core**: React 18 + TypeScript
*   **Build Tool**: Vite
*   **Styling**: Vanilla CSS (Variables, Flexbox, Grid)
*   **Desktop Environment**: Electron
*   **Mobile Web**: Vite PWA Plugin
*   **Icons**: Lucide React
*   **Routing**: React Router DOM (v6)

## 📦 Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn

### Installation

1.  Clone the repository and navigate into the project directory:
    ```bash
    git clone <repository-url>
    cd safehands-dash
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Available Scripts

#### Web / PWA Development
To start the standard Vite development server:
```bash
npm run dev
```
*(Runs on `http://localhost:5173` by default)*

#### Electron Development
To launch the application as a standalone desktop window using Electron:
```bash
npm run electron
```

#### Production Builds
To build the application for web/PWA deployment:
```bash
npm run build
```

*(Note: Electron packager scripts are not yet fully configured in this template but can be added via `electron-builder`)*

## 🔑 Beta Access Credentials

The application currently uses a mock authentication system. You can test the different dashboard layouts by using the following email addresses on the Login screen (any password will work):

*   **Family Portal**: `family@safehands.com`
*   **Field Executive / Nurse App**: `field@safehands.com`
*   **Tenant Admin Dashboard**: `admin@oakridge.com`
*   **Super Admin Dashboard**: `admin@safehands.com`

---
*Built as a proof-of-concept template for multi-platform, multi-tenant React applications.*
