import { useState } from "react";
import { Calendar, MapPin, Heart, Share2, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/atoms/Button";
import { Badge } from "@/shared/components/atoms/Badge";
import { cn } from "@/core/utils/cn";

export interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  price: string;
  image: string;
  category: string;
  interested: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "danger" | "warning" | "success" | "outline";
}

export interface EventCardProps {
  event: EventData;
}

export function EventCard({ event }: EventCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -4 }}
      className="group bg-surface rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden bg-surface-2 border-b border-border">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center bg-surface-2 text-text-muted">
            <span className="text-sm font-medium">No Image Available</span>
          </div>
        ) : (
          <img 
            src={event.image} 
            alt={event.title} 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Top Left: Category & Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-700 shadow-sm">
            {event.category}
          </div>
          {event.badge && (
            <Badge variant={event.badgeVariant} className="shadow-sm shadow-black/10">
              {event.badge}
            </Badge>
          )}
        </div>

        {/* Top Right: Actions */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button 
            onClick={(e) => { e.preventDefault(); setIsFavorite(!isFavorite); }}
            className="w-8 h-8 rounded-full bg-surface/90 backdrop-blur-sm flex items-center justify-center text-text-secondary hover:text-danger hover:scale-110 transition-all shadow-sm"
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-danger text-danger")} />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); }}
            className="w-8 h-8 rounded-full bg-surface/90 backdrop-blur-sm flex items-center justify-center text-text-secondary hover:text-primary-600 hover:scale-110 transition-all shadow-sm"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-text-primary leading-tight mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {event.title}
        </h3>
        
        {/* Social Proof */}
        <div className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 font-medium mb-3 bg-primary-50 dark:bg-primary-900/30 w-fit px-2 py-0.5 rounded-full">
          <Users className="w-3.5 h-3.5" />
          <span>{event.interested} người quan tâm</span>
        </div>
        
        <div className="space-y-2 mb-5 mt-auto">
          <div className="flex items-start gap-2 text-sm text-text-secondary">
            <Calendar className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{event.time} - {event.date}</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-text-secondary">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{event.venue}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted mb-0.5">Giá vé từ</p>
            <p className="text-lg font-bold text-primary-600">{event.price}</p>
          </div>
          <Button size="sm" className="rounded-xl shadow-sm">
            Mua vé
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
