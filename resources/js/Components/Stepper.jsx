import { Check } from 'lucide-react';

/**
 * Stepper — horizontal workflow steps.
 *
 * Reuses existing `.stepper`, `.step`, `.step-line`, `.step-num`,
 * `.step-label` classes from app.css.
 *
 * Each step has:
 *  - `label` (required) — bold title.
 *  - `sub` (optional) — small caption beneath the label.
 *  - `status` — `'done' | 'current' | 'pending'` (default `'pending'`).
 *
 * `done` steps show a check mark; `current` shows the step number with
 * primary fill; `pending` shows a muted number.
 *
 * @param {{
 *   steps: Array<{ label: React.ReactNode, sub?: React.ReactNode, status?: 'done'|'current'|'pending' }>,
 *   compact?: boolean,
 *   className?: string,
 *   style?: React.CSSProperties,
 * }} props
 */
export default function Stepper({ steps = [], compact = false, className, style }) {
    return (
        <div
            className={`stepper${compact ? ' stepper-compact' : ''} ${className || ''}`}
            style={style}
        >
            {steps.map((s, i) => {
                const status = s.status || 'pending';
                const stepClass =
                    status === 'done'
                        ? 'step done'
                        : status === 'current'
                            ? 'step active'
                            : 'step';
                return (
                    <Step
                        key={i}
                        index={i}
                        step={s}
                        stepClass={stepClass}
                        isLast={i === steps.length - 1}
                        prevDone={i > 0 && steps[i - 1]?.status === 'done'}
                        compact={compact}
                    />
                );
            })}
        </div>
    );
}

function Step({ index, step, stepClass, isLast, prevDone, compact }) {
    const status = step.status || 'pending';
    return (
        <>
            {index > 0 && (
                <div
                    className="step-line"
                    style={prevDone ? { background: 'var(--primary-soft-2)' } : undefined}
                />
            )}
            <div className={stepClass}>
                <div className="step-num">
                    {status === 'done'
                        ? <Check size={12} strokeWidth={2.5} />
                        : index + 1}
                </div>
                {!compact && (
                    <div className="step-label">
                        <strong>{step.label}</strong>
                        {step.sub != null && <span>{step.sub}</span>}
                    </div>
                )}
                {compact && step.label && (
                    <div className="step-label">
                        <strong>{step.label}</strong>
                    </div>
                )}
            </div>
        </>
    );
}
