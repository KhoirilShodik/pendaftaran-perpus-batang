import React from 'react';
import { CheckCircle2, Clock, XCircle, Circle } from 'lucide-react';

export type StepState = 'pending' | 'active' | 'done' | 'rejected';

export interface Step {
  label: string;
  state: StepState;
}

interface ProgressStepsProps {
  steps: Step[];
}

export function ProgressSteps({ steps }: ProgressStepsProps) {
  const Icon = ({ s }: { s: StepState }) => {
    if (s === 'done') return <CheckCircle2 size={20} className="text-emerald-500" />;
    if (s === 'active') return <Clock size={20} className="text-[#1e3a5f] animate-pulse" />;
    if (s === 'rejected') return <XCircle size={20} className="text-rose-500" />;
    return <Circle size={20} className="text-gray-200" />;
  };

  const labelColor = (s: StepState) => {
    if (s === 'done') return 'text-emerald-600 font-bold';
    if (s === 'active') return 'text-[#1e3a5f] font-black';
    if (s === 'rejected') return 'text-rose-600 font-bold';
    return 'text-gray-300 font-medium';
  };

  return (
    <div className="flex items-center gap-0 pt-4 px-2">
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center flex-1 space-y-3">
            <div className={`p-2 rounded-xl transition-all duration-500 ${
              step.state === 'active' ? 'bg-blue-50 shadow-inner' : 'bg-transparent'
            }`}>
              <Icon s={step.state} />
            </div>
            <span className={`text-[9px] uppercase tracking-[0.1em] text-center leading-tight transition-colors duration-500 ${labelColor(step.state)}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-[0.5] h-[2px] bg-gray-100 -mt-8 relative overflow-hidden rounded-full">
               <div className={`absolute inset-0 bg-[#1e3a5f] transition-all duration-1000 ${
                 step.state === 'done' ? 'translate-x-0' : '-translate-x-full'
               }`} />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
