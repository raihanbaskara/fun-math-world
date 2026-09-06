import React from 'react';

export interface FractionProps {
  num: number | string;
  den: number | string;
  whole?: number | string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

/**
 * Fraction component renders stacked fractions (numerator over horizontal line over denominator)
 * Matching formal mathematical typography without using inline slashes (1/2).
 */
export const Fraction: React.FC<FractionProps> = ({
  num,
  den,
  whole,
  size = 'md',
  className = '',
}) => {
  const sizeConfig = {
    xs: { wholeText: 'text-xs', fracText: 'text-[9.5px]', lineH: 'h-[1px]', px: 'px-0.5' },
    sm: { wholeText: 'text-sm', fracText: 'text-xs', lineH: 'h-[1.5px]', px: 'px-1' },
    md: { wholeText: 'text-base', fracText: 'text-sm', lineH: 'h-[2px]', px: 'px-1.5' },
    lg: { wholeText: 'text-xl', fracText: 'text-base', lineH: 'h-[2px]', px: 'px-2' },
    xl: { wholeText: 'text-2xl', fracText: 'text-lg', lineH: 'h-[2.5px]', px: 'px-2.5' },
    '2xl': { wholeText: 'text-4xl', fracText: 'text-2xl', lineH: 'h-[3px]', px: 'px-3' },
  };

  const cfg = sizeConfig[size] || sizeConfig.md;
  const hasWhole = whole !== undefined && whole !== null && String(whole) !== '0' && String(whole) !== '';

  return (
    <span className={`inline-flex items-center align-middle font-mono font-black select-none ${className}`}>
      {hasWhole && (
        <span className={`${cfg.wholeText} mr-1 font-black leading-none`}>
          {whole}
        </span>
      )}
      <span className={`inline-flex flex-col items-center justify-center leading-none ${cfg.px} min-w-[1.2em]`}>
        <span className={`${cfg.fracText} font-black text-center block`}>
          {num}
        </span>
        <span className={`w-full ${cfg.lineH} bg-current rounded-full my-0.5 block opacity-90`} />
        <span className={`${cfg.fracText} font-black text-center block`}>
          {den}
        </span>
      </span>
    </span>
  );
};

/**
 * Universal helper that parses text containing inline fraction notation (e.g., 3/4, 2 1/2, (2x2)/(3x2), (a+b)/c)
 * and renders formal stacked <Fraction /> components inline.
 */
export function renderFormattedMathText(text: string, size: 'xs' | 'sm' | 'md' = 'xs') {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, lIdx) => {
        // Regex matches:
        // 1. Mixed fractions: e.g. 2 1/2
        // 2. Parenthesis/algebraic fractions: e.g. (2×2)/(3×2), (1×1)/4, (a+b)/c
        // 3. Simple fractions: e.g. 3/4, a/b, 50/100
        const parts = line.split(/(\d+\s+\d+\/\d+|\([^\)]+\)\/\([^\)]+\)|\([^\)]+\)\/[a-zA-Z0-9_]+|[a-zA-Z0-9_]+\/\([^\)]+\)|[a-zA-Z0-9_\-\+\*×÷]+\/[a-zA-Z0-9_\-\+\*×÷]+)/g);

        return (
          <React.Fragment key={lIdx}>
            {lIdx > 0 && <br />}
            {parts.map((part, i) => {
              if (!part) return null;

              // Case 1: Mixed fraction e.g. 2 1/2
              const mixedMatch = part.match(/^(\d+)\s+(\d+)\/(\d+)$/);
              if (mixedMatch) {
                return (
                  <Fraction
                    key={i}
                    whole={mixedMatch[1]}
                    num={mixedMatch[2]}
                    den={mixedMatch[3]}
                    size={size}
                    className="mx-1 font-bold text-slate-900"
                  />
                );
              }

              // Case 2: Parenthesis numerator/denominator e.g. (2×2)/(3×2) or (1×1)/4 or (a+b)/c
              const parenMatch = part.match(/^(?:\(([^\)]+)\)|([^\/]+))\/(?:\(([^\)]+)\)|([^\/]+))$/);
              if (parenMatch) {
                const rawNum = parenMatch[1] || parenMatch[2];
                const rawDen = parenMatch[3] || parenMatch[4];
                if (rawNum && rawDen && !rawNum.includes(' ') && !rawDen.includes(' ')) {
                  return (
                    <Fraction
                      key={i}
                      num={rawNum.trim()}
                      den={rawDen.trim()}
                      size={size}
                      className="mx-1 font-bold text-brand-700"
                    />
                  );
                }
              }

              // Case 3: Simple fraction e.g. 3/4 or a/b
              const fracMatch = part.match(/^([a-zA-Z0-9_\-\+\*×÷]+)\/([a-zA-Z0-9_\-\+\*×÷]+)$/);
              if (fracMatch) {
                return (
                  <Fraction
                    key={i}
                    num={fracMatch[1]}
                    den={fracMatch[2]}
                    size={size}
                    className="mx-1 font-bold text-brand-700"
                  />
                );
              }

              return part;
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}

export default Fraction;
