import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../utils/cn";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "ghost" | "danger";
}

export function Button({ className, variant = "primary", children, ...props }: ButtonProps) {
  const styles = {
    primary:
      "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_10px_24px_rgba(6,182,212,0.32)] hover:shadow-[0_14px_32px_rgba(6,182,212,0.45)]",
    ghost: "bg-transparent border border-white/15 text-slate-200 hover:border-cyan-300/50 hover:bg-cyan-400/10",
    danger: "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:shadow-[0_14px_28px_rgba(239,68,68,0.4)]"
  } as const;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
