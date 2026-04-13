import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AnimatedStaggerProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedStagger({ children, className }: AnimatedStaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.38,
            when: "beforeChildren",
            staggerChildren: 0.08
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedItem({ children, className }: AnimatedStaggerProps) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 220, damping: 20 } }
      }}
    >
      {children}
    </motion.div>
  );
}
