import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { DarkModeProvider } from '@/components/DarkModeProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aplicație Sănătate Mentală",
  description: "Platformă pentru testări psihologice",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body className={inter.className}>
        <AntdRegistry>
          <DarkModeProvider>
            {children}
          </DarkModeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

