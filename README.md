# Tele2 Platform

A comprehensive web application for network management, fiber ordering, and design engineering. This platform streamlines the process from initial fiber orders to network design and customer engineering.

## 🚀 Features

- **Interactive Dashboard**: Real-time overview of network status, active alerts, and fiber order locations on an interactive map.
- **Fiber Ordering**: Manage and track fiber orders with detailed status and delivery estimates.
- **Network Design & Engineering**: 
  - **Design & Customer Eng.**: detailed technical specifications, hardware requirements, and pricing.
  - **NaaS Pre-Design**: AI-assisted preliminary network design and feasibility assessment.
- **Site Management**: Comprehensive view of site parameters, location types, and customer requirements.
- **Local Data Mode**: Runs entirely on local CSV data, eliminating the need for a live backend connection for development and demonstration.

## 🛠️ Tech Stack

- **Frontend Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Maps**: [React Leaflet](https://react-leaflet.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tele2-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## 📂 Project Structure

- `src/api`: Mock API client and data handling logic.
- `src/components`: Reusable UI components and feature-specific widgets.
- `src/data`: CSV files containing the local dataset (FiberOrder, NetworkDesign, etc.).
- `src/pages`: Main application pages (Home, FiberOrdering, NaasPreDesign, etc.).
- `src/utils`: Utility functions, including the CSV parser.

## 🔧 Data Management

The application uses a **Mock API Client** (`src/api/mockBase44Client.js`) that reads data directly from CSV files located in `src/data`. 

- **Data Persistence**: Changes made in the UI (e.g., editing site parameters) are stored in-memory during the session but will reset when the page is reloaded.
- **CSV Parsing**: A custom CSV parser (`src/utils/csvParser.js`) handles data loading, including support for multiline fields and JSON parsing for complex data structures.

## 📝 License

[Add License Information Here]
