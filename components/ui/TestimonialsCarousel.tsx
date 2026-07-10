"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const reviews = [
  {
    name: "Sarah M.",
    location: "Vancouver, BC",
    rating: 5,
    text: "Honestly the best decision I've made for my weekly routine. They pick up Tuesday, it's back Thursday, perfectly folded. I don't even think about laundry anymore.",
    initial: "S",
  },
  {
    name: "Ahmed K.",
    location: "Toronto, ON",
    rating: 5,
    text: "Used them for my suit dry cleaning before a big meeting. Came back looking brand new. The WhatsApp updates throughout the process were a really nice touch.",
    initial: "A",
  },
  {
    name: "Jessica T.",
    location: "Calgary, AB",
    rating: 5,
    text: "I was skeptical at first but booking was so easy. Driver was on time, clothes came back smelling amazing. 100% recommend to anyone.",
    initial: "J",
  },
  {
    name: "Marcus L.",
    location: "Edmonton, AB",
    rating: 5,
    text: "Starex Club member for 3 months now. The recurring pickup alone has saved me so much time every week. Worth every penny.",
    initial: "M",
  },
];

export default function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const reduced = useReducedMotion();

  const variants = {
    enter: (d: number) => ({ x: reduced ? 0 : d * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: reduced ? 0 : d * -60, opacity: 0 }),
  };

  const go = (next: number) => {
    setDir(next > idx ? 1 : -1);
    setIdx(next);
  };
  const prev = () => go((idx - 1 + reviews.length) % reviews.length);
  const next = () => go((idx + 1) % reviews.length);

  return (
    <div className="relative">
      {/* Desktop: 3-column grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {reviews.slice(0, 3).map((r, i) => (
          <ReviewCard key={r.name} r={r} delay={i * 0.1} />
        ))}
      </div>

      {/* Mobile: swipeable single card */}
      <div className="md:hidden">
        <div className="overflow-hidden rounded-2xl">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={idx}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) next();
                else if (info.offset.x > 50) prev();
              }}
            >
              <ReviewCard r={reviews[idx]} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={prev}
            className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand hover:text-brand transition-colors"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex gap-2">
            {reviews.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => go(i)}
                animate={{ width: i === idx ? 24 : 8, backgroundColor: i === idx ? "#1E5FA0" : "#CBD5E1" }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-brand hover:text-brand transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ r, delay = 0 }: { r: (typeof reviews)[0]; delay?: number }) {
  return (
    <motion.div
      className="card select-none cursor-grab active:cursor-grabbing"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, boxShadow: "0 20px 60px -10px rgba(30,95,160,0.15)" }}
    >
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: r.rating }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.06, type: "spring", stiffness: 400, damping: 12 }}
          >
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
          </motion.div>
        ))}
      </div>
      <p className="text-gray-700 text-sm leading-relaxed mb-5">&ldquo;{r.text}&rdquo;</p>
      <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
        <div className="h-9 w-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
          {r.initial}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{r.name}</p>
          <p className="text-xs text-gray-400">{r.location}</p>
        </div>
      </div>
    </motion.div>
  );
}
