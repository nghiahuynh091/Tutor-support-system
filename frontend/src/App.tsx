import { useState } from "react";
import { Button } from "@/components/ui/button";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="container mx-auto p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Tutor Support System</h1>
        <p className="text-xl text-muted-foreground mb-8">
          A full-stack application built with Node.js, React, TypeScript,
          TailwindCSS, ShadCN UI, and Supabase
        </p>

        <div className="space-y-4">
          <div className="flex justify-center gap-4">
            <Button
              variant="default"
              onClick={() => setCount((count) => count + 1)}
            >
              Count is {count}
            </Button>
            <Button variant="outline" onClick={() => setCount(0)}>
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Backend</h3>
              <p className="text-muted-foreground">
                Node.js + Express + TypeScript
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Frontend</h3>
              <p className="text-muted-foreground">
                React + Vite + TailwindCSS + ShadCN UI
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Database</h3>
              <p className="text-muted-foreground">Supabase</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
