# Eco Chain

Eco Chain is a web application designed to streamline urban waste management in India by connecting waste generators directly with informal waste pickers, aiming to improve recycling rates and empower the picker community with fair opportunities.

## Problem Addressed

The project tackles inefficiencies in current urban waste management systems, low recycling rates, and the challenges faced by informal waste pickers, such as lack of direct access to waste generators and fair compensation.

## Features

The platform provides distinct functionalities for two main user roles:

### For Waste Generators:
*   **Authentication:** Secure sign-up and login with email/password.
*   **Profile Management:** Save and edit personal details, including address.
*   **Schedule Pickups:** Easily schedule waste pickups by selecting multiple waste types, specifying quantity, preferred date, and location (address is auto-filled from profile).
*   **View Scheduled Pickups:** Track scheduled pickups with their current status (Pending, Assigned, Completed, Cancelled). Statuses are clearly indicated with styled badges and dates are formatted for readability.
*   **Cancel Pickups:** Ability to cancel "Pending" pickup requests through a confirmation modal.
*   **Rate Pickers:** Provide ratings for waste pickers after a pickup is marked as "Completed".

### For Waste Pickers:
*   **Authentication:** Secure sign-up and login with email/password.
*   **Profile Management:** Save and edit personal details, including their service Pincode.
*   **Set Availability:** Toggle their status between "Available" and "Unavailable" to receive pickup requests.
*   **View Pending Pickups:** Access a list of pending pickup requests. *(Functionality to filter by their Pincode and nearby Pincodes is in progress).*
*   **Accept Pickups:** Accept available "Pending" pickup requests, which then move to their "Assigned" list.
*   **View Assigned Pickups:** Manage and track all accepted pickup jobs.
*   **Mark Pickups as Complete:** Mark "Assigned" pickups as "Completed" via a confirmation modal.
*   **Rate Generators:** Provide ratings for waste generators after a pickup is marked as "Completed".

### General UI/UX Enhancements:
*   **Loading States:** Visual feedback during data fetching operations.
*   **Toast Notifications:** User-friendly notifications for actions and feedback.
*   **Empty State Displays:** Clear messages when lists or data are empty.
*   **Confirmation Modals:** Safeguards for critical actions like cancellations or marking tasks as complete.

## Tech Stack

*   **Frontend:** React, TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS, custom CSS
*   **Backend & Database:** Firebase (Authentication, Firestore)
*   **State Management:** React Context API, Custom Hooks

## Architecture & Design

![Architecture Diagram](https://github.com/akhi-543/SafaiSetu/blob/main/Img_repo/Editor%20_%20Mermaid%20Chart-2025-04-26-050924.png)

![Connectivity Diagram](https://github.com/akhi-543/SafaiSetu/blob/main/Img_repo/Editor%20_%20Mermaid%20Chart-2025-04-26-053254.png)

![DataFlow Diagram](https://github.com/akhi-543/SafaiSetu/blob/main/Img_repo/mermaid-ai-diagram-2025-04-26-054612.png)

## Working Screenshots

### Generator Dashboard
![Generator Dashboard](https://github.com/akhi-543/SafaiSetu/blob/main/Img_repo/WhatsApp%20Image%202025-05-07%20at%2019.28.41_1320c2a1.jpg)

![Generator Dashboard](https://github.com/akhi-543/SafaiSetu/blob/main/Img_repo/WhatsApp%20Image%202025-05-07%20at%2019.28.59_de7810b9.jpg)

![Generator Dashboard](https://github.com/akhi-543/SafaiSetu/blob/main/Img_repo/WhatsApp%20Image%202025-05-07%20at%2019.29.17_6fc4c0e7.jpg)

### Picker Dashboard
![Generator Dashboard](https://github.com/akhi-543/SafaiSetu/blob/main/Img_repo/WhatsApp%20Image%202025-05-07%20at%2019.29.37_344a9d45.jpg)

![Generator Dashboard](https://github.com/akhi-543/SafaiSetu/blob/main/Img_repo/WhatsApp%20Image%202025-05-07%20at%2019.29.57_e9a492d3.jpg)
## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/akhi-543/SafaiSetu.git
    cd SafaiSetu
    ```
2.  **Install NPM packages:**
    ```sh
    npm install
    # or
    # yarn install
    ```
3.  **Set up Firebase:**
    *   Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   Enable Email/Password authentication in the "Authentication" section.
    *   Set up Firestore database.
    *   Obtain your Firebase project configuration (apiKey, authDomain, projectId, etc.).
    *   Create a `.env` file in the root of your project by copying `.env.example` (if it exists, otherwise create it manually).
    *   Add your Firebase configuration to the `.env` file:
        ```env
        VITE_FIREBASE_API_KEY=your_api_key
        VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
        VITE_FIREBASE_PROJECT_ID=your_project_id
        VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
        VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
        VITE_FIREBASE_APP_ID=your_app_id
        ```

### Running the Application

```sh
npm run dev
# or
# yarn dev
```
This will start the development server, typically at `http://localhost:5173`.

## Available Scripts

In the project directory, you can run:

*   `npm run dev`: Runs the app in development mode.
*   `npm run build`: Builds the app for production to the `dist` folder.
*   `npm run lint`: Lints the codebase using ESLint.
*   `npm run preview`: Serves the production build locally for preview.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
