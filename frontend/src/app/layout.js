import './globals.css';

export const metadata = {
    title: 'NailFlow — Beauty Booking',
    description: 'Book your nail appointment with ease. Premium nail art services with secure deposit payment.',
    keywords: 'nail salon booking, nail art, manicure, pedicure, appointment booking',
    openGraph: {
        title: 'NailFlow — Beauty Booking',
        description: 'Book your nail appointment with ease.',
        type: 'website',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body>{children}</body>
        </html>
    );
}
