// This page is sample page. Please remove it.
import logo from "@/assets/logo.svg";
import reactLogo from "@/assets/react.svg";

export function ExamplePage() {
  return (
    <div className="grid place-items-center min-w-[320px] min-h-screen relative m-0">
      <div className="max-w-7xl mx-auto p-8 text-center relative z-10">
        <div className="flex justify-center items-center gap-8 mb-8">
          <img
            src={logo}
            alt="Bun Logo"
            className="h-24 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] scale-120"
          />
          <img
            src={reactLogo}
            alt="React Logo"
            className="h-24 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] animate-spin animation-duration-[4s]"
          />
        </div>

        <h1 className="text-5xl font-bold my-4 leading-tight">Bun + React</h1>
        <p>
          Edit{" "}
          <code className="bg-[#f1f1f1] dark:bg-[#1a1a1a] px-2 py-1 rounded font-mono">
            src/pages/home.tsx
          </code>{" "}
          and save to test HMR
        </p>
      </div>
    </div>
  );
}
