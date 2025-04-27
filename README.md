# MEET Flow

A modern video conferencing solution built with React and powered by mediasoup SFU.

## Features

- High-quality real-time video and audio communication
- Screen sharing capabilities
- Text chat during calls
- Room-based meeting system
- Low-latency media transmission
- Responsive design for desktop and mobile devices
- Custom video layouts
- User presence indicators

## Security Notice

MEET Flow uses SSL for secure communications. For development and testing purposes, users will need to manually import the server's SSL certificate to their browsers. This is a one-time setup step required for proper functioning of the application.

To import the certificate:

1. Download it from [Here](https://drive.google.com/file/d/1Cfy0aRSmdQIMBi8YaO8agymQd-ycjhuw/view?usp=sharing)
2. For Chrome, Go to Browser Settings > Privacy & Security > Security > Manage Certificates > Installed by you > Import Trusted Certificate
3. Restart the Browser.

## Prerequisites

- Node.js (v16 or higher)
- NPM or Yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/meet-flow.git
   cd meet-flow
   ```

2. Install dependencies:

   ```
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:

   Create the `.env` file with following configuration settings.

   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_bm90ZWQtZHJha2UtOTkuY2xlcmsuYWNjb3VudHMuZGV2JA
   VITE_MEDIASOUP_SERVER_URL= https://57.155.67.41:8000/
   ```

4. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

## Architecture

MEET Flow uses a Selective Forwarding Unit (SFU) architecture with mediasoup for efficient video routing:

- **Client-side**: React application handling media capture and UI
- **Server-side**: Node.js application with mediasoup for WebRTC routing
- **Communication**: WebSockets for signaling, WebRTC for media transport

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [mediasoup](https://mediasoup.org/) - WebRTC SFU
- [React](https://reactjs.org/) - UI library

## Contact

Project Link: [https://github.com/Tauqeer-Ahmed-99/meet-flow](https://github.com/Tauqeer-Ahmed-99/meet-flow)
