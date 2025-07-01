import "./globals.css";

export const metadata = {
  title: "Soundverse Voice Assistant",
  description: "A modular Next.js voice assistant app with real-time audio processing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
