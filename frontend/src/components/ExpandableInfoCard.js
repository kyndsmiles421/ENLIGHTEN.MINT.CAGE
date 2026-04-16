/**
 * ExpandableInfoCard.js — Universal interactive content block.
 * NO card wrapper. Content sits directly on the plane.
 * Tap to expand. Built-in Deep Dive for progressive exploration.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BookOpen } from 'lucide-react';
import DeepDive from './DeepDive';

export function ExpandableInfoCard({ title, subtitle, description, color = '#A78BFA', icon, children, testId, category, context }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = icon || BookOpen;

  return (
    <motion.div layout
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left py-3 cursor-pointer"
      style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}
      data-testid={testId}>
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}10`, border: `1px solid ${color}15` }}>
          <Icon size={13} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: expanded ? color : 'rgba(248,250,252,0.85)', textShadow: '0 1px 6px rgba(0,0,0,0.15)' }}>
            {title}
          </p>
          {subtitle && <p className="text-[9px] mt-0.5" style={{ color: 'rgba(248,250,252,0.35)', textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>{subtitle}</p>}
        </div>
        <ChevronRight size={12} style={{
          color: expanded ? color : 'rgba(248,250,252,0.2)',
          transform: expanded ? 'rotate(90deg)' : 'none',
          transition: 'transform 0.2s, color 0.2s',
          flexShrink: 0,
          marginTop: 4,
        }} />
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="mt-3 pt-3 pl-10" style={{ borderTop: `1px solid ${color}10` }}>
              {description && (
                <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(248,250,252,0.55)', textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
                  {description}
                </p>
              )}
              {children}
              <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                <DeepDive
                  topic={title}
                  category={category || 'knowledge'}
                  context={context}
                  color={color}
                  label={`Explore ${title} deeper`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function InfoCardGrid({ items, color, columns = 1, category, context }) {
  return (
    <div className={columns === 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-0' : ''}>
      {items.map((item, i) => (
        <ExpandableInfoCard
          key={item.title || i}
          title={item.title}
          subtitle={item.subtitle}
          description={item.description}
          color={item.color || color}
          icon={item.icon}
          testId={`info-card-${i}`}
          category={item.category || category}
          context={item.context || context}
        />
      ))}
    </div>
  );
}
