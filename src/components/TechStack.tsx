import { cn } from "@/lib/utils";

const technologies = [
  { name: "Vision AI", category: "OCR & Analysis" },
  { name: "MesoNet", category: "Deepfake Detection" },
  { name: "Whisper", category: "Speech-to-Text" },
  { name: "Pinecone", category: "Vector Database" },
  { name: "FastAPI", category: "Backend" },
  { name: "React Native", category: "Frontend" },
];

export const TechStack = () => {
  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Powered By</h2>
        <p className="text-muted-foreground">Enterprise-grade AI infrastructure</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {technologies.map((tech, index) => (
          <div
            key={index}
            className="glass rounded-xl p-4 text-center opacity-0 animate-fade-in hover:bg-card/80 transition-colors"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-sm font-semibold text-foreground mb-1">{tech.name}</div>
            <div className="text-xs text-muted-foreground">{tech.category}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
