import { useEffect, useState } from "react";
import { Heart, Shield, Zap } from "lucide-react";
import { GameItem } from "@/types/game";

interface GameStartAlertProps {
  item: GameItem;
  label: string;
  imageMode?: "contain" | "cover";
  onDone: () => void;
}

const GameStartAlert = ({ item, label, imageMode = "cover", onDone }: GameStartAlertProps) => {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setClosing(true);
      setTimeout(onDone, 300);
    }, 2800);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${closing ? "" : "animate-alert-backdrop"}`}
      style={{
        backgroundColor: "rgba(15, 8, 12, 0.92)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        className={`relative w-full max-w-sm sm:max-w-md ${closing ? "animate-alert-panel-out" : "animate-alert-panel"} animate-pulse-pink`}
        style={{
          clipPath: "polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))",
          background: "linear-gradient(135deg, hsl(340 15% 8%) 0%, hsl(340 15% 12%) 100%)",
          border: "1px solid hsl(340 82% 52% / 0.6)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ clipPath: "inherit" }}>
          <div className="animate-scan-line absolute left-0 right-0 h-8 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent, hsl(340 82% 52% / 0.06), transparent)" }}
          />
        </div>

        <div className="animate-corner absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary" />
        <div className="animate-corner absolute top-0 right-5 w-6 h-6 border-t-2 border-r-2 border-primary" />
        <div className="animate-corner absolute bottom-5 left-0 w-6 h-6 border-b-2 border-l-2 border-primary" />
        <div className="animate-corner absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary" />

        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

        <div className="px-6 pt-6 pb-5 flex flex-col items-center gap-4">
          <div className="animate-sub-text flex items-center gap-2 bg-primary/10 border border-primary/30 px-3 py-1 rounded-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-display tracking-[0.25em] text-xs uppercase">
              Permainan Dimulai
            </span>
          </div>

          <div
            className="animate-glitch relative rounded-lg overflow-hidden"
            style={{
              width: 110,
              height: 110,
              background: `radial-gradient(circle, ${item.color}25 0%, ${item.color}08 70%)`,
              border: `2px solid ${item.color}80`,
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              className={`w-full h-full ${imageMode === "contain" ? "object-contain p-2" : "object-cover"}`}
            />
          </div>

          <div className="text-center">
            <p className="animate-sub-text text-muted-foreground text-xs tracking-widest uppercase mb-1">
              {label} Rahasiamu
            </p>
            <h2
              className="animate-text-reveal font-display text-4xl sm:text-5xl uppercase text-foreground"
              style={{ color: item.color || "hsl(0 0% 95%)" }}
            >
              {item.name}
            </h2>
            {item.subtitle && (
              <p className="animate-sub-text text-muted-foreground text-sm mt-1 flex items-center justify-center gap-1.5">
                {item.subtitle}
                {item.detail && <span className="opacity-60">· {item.detail}</span>}
              </p>
            )}
          </div>

          <div className="w-full flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <Shield className="w-3 h-3 text-primary/50" />
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="animate-sub-text text-center space-y-1">
            <p className="text-muted-foreground text-xs tracking-wide">
              Jangan beritahu siapa pun! Sembunyikan layarmu.
            </p>
            <div className="flex items-center justify-center gap-1.5 text-accent text-xs">
              <Zap className="w-3 h-3" />
              <span>Eliminasi lewat tanya jawab</span>
              <Zap className="w-3 h-3" />
            </div>
          </div>

          <div className="w-full h-0.5 bg-border rounded-full overflow-hidden">
            <div className="animate-countdown h-full bg-primary rounded-full" style={{ transformOrigin: "left" }} />
          </div>
        </div>

        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <Heart className="w-96 h-96 text-primary" />
      </div>
    </div>
  );
};

export default GameStartAlert;
