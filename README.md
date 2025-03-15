
# Audio Labels Prototype

A mobile web application that allows users to create QR codes with audio attachments. Users can record voice messages or enter text for text-to-speech conversion, generate QR codes linked to this audio content, and later scan these codes to play back the audio information.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- React Router DOM
- Framer Motion

## Running the project locally

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup and Installation

1. Clone the repository to your local machine:
   ```
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install the dependencies:
   ```
   npm install
   # or if using yarn
   yarn install
   ```

3. Start the development server:
   ```
   npm run dev
   # or if using yarn
   yarn dev
   ```

4. Open your browser and navigate to the URL shown in the terminal (typically http://localhost:5173)

### Building for Production

To create a production build:

```
npm run build
# or if using yarn
yarn build
```

The build output will be in the `dist` directory.

To locally preview the production build:

```
npm run preview
# or if using yarn
yarn preview
```

## Running in VSCode

1. Open the project folder in VSCode
2. Make sure you have the following extensions installed:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - TypeScript and JavaScript Language Features

3. Open a terminal in VSCode (Terminal > New Terminal) and run:
   ```
   npm install
   npm run dev
   ```

4. The development server will start and show you a local URL (usually http://localhost:5173)
5. You can now open this URL in your browser or use the "Open in Browser" extension to open it directly from VSCode

## Accessing the Camera

- When running locally, the application must be served over HTTPS or from localhost for camera access to work properly in most browsers.
- On mobile devices, make sure to allow camera permissions when prompted.

## Offline Capabilities

This application stores all data locally on your device and can function without an internet connection after the initial load.
