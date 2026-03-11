'use client';

export default function MobileContainer({ children }) {
    return (
        <div className="min-h-screen bg-[#FAF3F0] flex md:items-center justify-center font-sans antialiased p-0 md:p-8 lg:p-12">
            <main className="w-full max-w-md md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto min-h-screen md:min-h-[600px] md:h-[85vh] shadow-2xl shadow-primary/10 bg-white md:rounded-[3rem] relative overflow-hidden flex flex-col md:flex-row">
                {/* Desktop Left Side - Brand Image */}
                <div className="hidden md:flex md:w-1/2 lg:w-[45%] bg-stone-100 relative items-center justify-center p-12 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-[#A66C81]/50 z-10 mix-blend-multiply"></div>
                    <img
                        src="https://images.unsplash.com/photo-1604654894610-df490668711d?q=80&w=1200&auto=format&fit=crop"
                        alt="NailFlow Studio Experience"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="relative z-20 text-center text-white p-8 rounded-[2rem] backdrop-blur-sm bg-black/10 border border-white/20">
                        <h2 className="font-display italic text-4xl lg:text-5xl mb-4 drop-shadow-lg">Descubre tu<br />mejor versión</h2>
                        <div className="w-12 h-1 bg-white/60 mx-auto rounded-full mb-4"></div>
                        <p className="text-white/90 font-medium tracking-wide drop-shadow-sm text-sm">Reserva tu cita en segundos y disfruta de una experiencia premium.</p>
                    </div>
                </div>

                {/* Right Side - Booking Flow */}
                <div className="flex-1 flex flex-col h-full bg-white relative overflow-y-auto w-full md:w-1/2 lg:w-[55%] pb-12 md:pb-0 hide-scrollbar">
                    <div className="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-3xl px-4 md:px-12 xl:px-16 h-full flex flex-col">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
