export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black text-[#b8ffc9] font-mono">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background:repeating-linear-gradient(0deg,#fff_0_1px,transparent_1px_3px)]" />
      <h1 className="text-5xl sm:text-7xl font-bold tracking-[0.15em] text-[#8dffab] drop-shadow-[0_0_24px_rgba(96,255,140,0.35)]">
        ☢ NUKE MY CITY
      </h1>
      <p className="mt-5 max-w-md text-center text-sm opacity-70 leading-relaxed">
        Satellite strike console. Pick a warhead, click anywhere on Earth,
        watch it burn. Your craters stay on the map.
      </p>
      <a
        href="/game/index.html"
        className="mt-10 border border-[#60ff8c]/50 bg-[#143c1c]/60 px-8 py-3 text-sm tracking-[0.2em] transition hover:bg-[#28503a]/80"
      >
        ► LAUNCH CONSOLE
      </a>
      <p className="mt-8 text-[10px] opacity-40 tracking-wider">
        arcade satire · no people, only craters
      </p>
    </main>
  );
}
