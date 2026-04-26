/**
 * ExpandableInfoCard.js — Universal interactive content block.
 * ZERO-STACK: No card wrapper. Content on the plane.
 * Built-in: DeepDive for progressive exploration + XP rewards for gamification.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, BookOpen } from 'lucide-react';
import DeepDive from './DeepDive';
import { useExplorationReward, RewardToast } from './ExplorationReward';

export function ExpandableInfoCard({ title, subtitle, description, color = '#A78BFA', icon, children, testId, category, context }) {
  const [expanded, setExpanded] = useState(false);
  const { reward, triggerReward } = useExplorationReward();
  const Icon = icon || BookOpen;

  const handleExpand = () => {
    if (!expanded) triggerReward('explored', 5);
    setExpanded(!expanded);
  };

  return (
    <motion.div layout
      onClick={handleExpand}
      className="w-full text-left py-3 cursor-pointer"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      data-testid={testId}>
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}20` }}>
          <Icon size={13} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: expanded ? color : 'rgba(255,255,255,0.9)' }}>
            {title}
          </p>
          {subtitle && <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{subtitle}</p>}
        </div>
        <ChevronRight size={12} style={{
          color: expanded ? color : 'rgba(255,255,255,0.3)',
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
            <div className="mt-3 pt-3 pl-10" style={{ borderTop: `1px solid ${color}12` }}>
              {description && (
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {description}
                </p>
              )}
              {children}
              <RewardToast reward={reward} />
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
