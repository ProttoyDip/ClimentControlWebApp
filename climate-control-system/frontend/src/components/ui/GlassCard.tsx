import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../utils/cn";

export function GlassCard({ className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={cn("glass-card gradient-border relative rounded-2xl p-5", className)}
      {...props}
    />
  );
}
