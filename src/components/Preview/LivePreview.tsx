import { useRef, useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { BackgroundRenderer } from '@/components/Effects';
import type { Slide, OverlayObject } from '@/types';

/* ------------------------------------------------------------------ */
/*  Utility: render **bold** fragments with accent color               */
/* ------------------------------------------------------------------ */

function renderBoldText(
  text: string,
  accentColor: string,
): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ color: accentColor }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/* ------------------------------------------------------------------ */
/*  Shared color bag passed to every template renderer                 */
/* ------------------------------------------------------------------ */

interface KV {
  accentColor: string;
  primaryColor: string;
  secondaryColor: string;
}

/* ================================================================== */
/*  1. TITLE                                                          */
/* ================================================================== */

function TitleSlideContent({
  data,
  kv,
}: {
  data: Record<string, unknown>;
  kv: KV;
}) {
  const tag = (data.tag as string) || '';
  const title = (data.title as string) || '';
  const subtitle = (data.subtitle as string) || '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '5%',
        textAlign: 'center',
      }}
    >
      {tag && (
        <div
          style={{
            padding: '8px 24px',
            border: `2px solid ${kv.accentColor}`,
            borderRadius: 6,
            color: kv.accentColor,
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.15em',
            marginBottom: 40,
          }}
        >
          {tag}
        </div>
      )}
      <h1
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: kv.primaryColor,
          lineHeight: 1.2,
          marginBottom: 20,
          letterSpacing: '-0.02em',
        }}
      >
        {renderBoldText(title, kv.accentColor)}
      </h1>
      {subtitle && (
        <p style={{ fontSize: 24, color: kv.secondaryColor, fontWeight: 400 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ================================================================== */
/*  2. SECTION-COVER                                                  */
/* ================================================================== */

function SectionCoverSlideContent({
  data,
  kv,
}: {
  data: Record<string, unknown>;
  kv: KV;
}) {
  const number = (data.number as string) || '';
  const title = (data.title as string) || '';
  const subtitle = (data.subtitle as string) || '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '5%',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      {number && (
        <div
          style={{
            fontSize: 200,
            fontWeight: 900,
            color: kv.primaryColor,
            opacity: 0.08,
            position: 'absolute',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {number}
        </div>
      )}
      <h1
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: kv.primaryColor,
          lineHeight: 1.2,
          marginBottom: 16,
          letterSpacing: '-0.02em',
          position: 'relative',
        }}
      >
        {renderBoldText(title, kv.accentColor)}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: 22,
            color: kv.secondaryColor,
            fontWeight: 500,
            letterSpacing: '0.1em',
            position: 'relative',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/* ================================================================== */
/*  3. CONTENT                                                        */
/* ================================================================== */

function ContentSlideContent({
  data,
  kv,
}: {
  data: Record<string, unknown>;
  kv: KV;
}) {
  const tag = (data.tag as string) || '';
  const title = (data.title as string) || '';
  const body = (data.body as string) || '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '5%',
      }}
    >
      {tag && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: kv.accentColor,
            letterSpacing: '0.15em',
            marginBottom: 12,
          }}
        >
          {tag}
        </div>
      )}
      <h2
        style={{
          fontSize: 44,
          fontWeight: 800,
          color: kv.primaryColor,
          marginBottom: 24,
          letterSpacing: '-0.02em',
        }}
      >
        {renderBoldText(title, kv.accentColor)}
      </h2>
      <div
        style={{
          fontSize: 22,
          color: kv.secondaryColor,
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
        }}
      >
        {renderBoldText(body, kv.accentColor)}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  4. TWO-COLUMN                                                     */
/* ================================================================== */

function TwoColumnSlideContent({
  data,
  kv,
}: {
  data: Record<string, unknown>;
  kv: KV;
}) {
  const tag = (data.tag as string) || '';
  const title = (data.title as string) || '';
  const leftTitle = (data.leftTitle as string) || '';
  const leftBody = (data.leftBody as string) || '';
  const rightTitle = (data.rightTitle as string) || '';
  const rightBody = (data.rightBody as string) || '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '4%',
      }}
    >
      {tag && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: kv.accentColor,
            letterSpacing: '0.15em',
            marginBottom: 12,
          }}
        >
          {tag}
        </div>
      )}
      <h2
        style={{
          fontSize: 44,
          fontWeight: 800,
          color: kv.primaryColor,
          marginBottom: 32,
          letterSpacing: '-0.02em',
        }}
      >
        {renderBoldText(title, kv.accentColor)}
      </h2>
      <div style={{ display: 'flex', flex: 1, gap: 32 }}>
        {/* Left column */}
        <div style={{ flex: 1 }}>
          {leftTitle && (
            <h3
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: kv.primaryColor,
                marginBottom: 12,
              }}
            >
              {leftTitle}
            </h3>
          )}
          <div
            style={{
              fontSize: 18,
              color: kv.secondaryColor,
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}
          >
            {renderBoldText(leftBody, kv.accentColor)}
          </div>
        </div>
        {/* Right column */}
        <div style={{ flex: 1 }}>
          {rightTitle && (
            <h3
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: kv.primaryColor,
                marginBottom: 12,
              }}
            >
              {rightTitle}
            </h3>
          )}
          <div
            style={{
              fontSize: 18,
              color: kv.secondaryColor,
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
            }}
          >
            {renderBoldText(rightBody, kv.accentColor)}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  5. COMPARISON                                                     */
/* ================================================================== */

function ComparisonSlideContent({
  data,
  kv,
}: {
  data: Record<string, unknown>;
  kv: KV;
}) {
  const tag = (data.tag as string) || '';
  const title = (data.title as string) || '';
  const leftLabel = (data.leftLabel as string) || 'OPTION A';
  const leftContent = (data.leftContent as string) || '';
  const leftMetricValue = (data.leftMetricValue as string) || '';
  const leftMetricLabel = (data.leftMetricLabel as string) || '';
  const rightLabel = (data.rightLabel as string) || 'OPTION B';
  const rightContent = (data.rightContent as string) || '';
  const rightMetricValue = (data.rightMetricValue as string) || '';
  const rightMetricLabel = (data.rightMetricLabel as string) || '';
  const winner = (data.winner as string) || 'none';

  const panelStyle = (isWinner: boolean): React.CSSProperties => ({
    flex: 1,
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    border: isWinner
      ? `2px solid ${kv.accentColor}`
      : '1px solid rgba(255,255,255,0.08)',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    gap: 12,
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '4%',
      }}
    >
      {tag && (
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: kv.accentColor,
            letterSpacing: '0.2em',
            marginBottom: 16,
          }}
        >
          {tag}
        </div>
      )}
      <h2
        style={{
          fontSize: 48,
          fontWeight: 800,
          color: kv.primaryColor,
          textAlign: 'center',
          marginBottom: 40,
          letterSpacing: '-0.02em',
        }}
      >
        {renderBoldText(title, kv.accentColor)}
      </h2>
      <div style={{ display: 'flex', flex: 1, gap: 20 }}>
        {/* Left option */}
        <div style={panelStyle(winner === 'left')}>
          {winner === 'left' && (
            <span
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: kv.accentColor,
                color: '#000',
                padding: '4px 12px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              WIN
            </span>
          )}
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: kv.accentColor,
              letterSpacing: '0.1em',
            }}
          >
            {leftLabel}
          </span>
          {leftContent && (
            <p
              style={{
                fontSize: 16,
                color: kv.secondaryColor,
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              {leftContent}
            </p>
          )}
          {leftMetricValue && (
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: kv.primaryColor,
                }}
              >
                {leftMetricValue}
              </div>
              {leftMetricLabel && (
                <div style={{ fontSize: 14, color: kv.secondaryColor }}>
                  {leftMetricLabel}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right option */}
        <div style={panelStyle(winner === 'right')}>
          {winner === 'right' && (
            <span
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: kv.accentColor,
                color: '#000',
                padding: '4px 12px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              WIN
            </span>
          )}
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: kv.accentColor,
              letterSpacing: '0.1em',
            }}
          >
            {rightLabel}
          </span>
          {rightContent && (
            <p
              style={{
                fontSize: 16,
                color: kv.secondaryColor,
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              {rightContent}
            </p>
          )}
          {rightMetricValue && (
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: kv.primaryColor,
                }}
              >
                {rightMetricValue}
              </div>
              {rightMetricLabel && (
                <div style={{ fontSize: 14, color: kv.secondaryColor }}>
                  {rightMetricLabel}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  6. METRICS                                                        */
/* ================================================================== */

function MetricsSlideContent({
  data,
  kv,
}: {
  data: Record<string, unknown>;
  kv: KV;
}) {
  const tag = (data.tag as string) || '';
  const title = (data.title as string) || '';
  const metrics =
    (data.metrics as { value: string; label: string }[]) || [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '5%',
      }}
    >
      {tag && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: kv.accentColor,
            letterSpacing: '0.15em',
            marginBottom: 12,
          }}
        >
          {tag}
        </div>
      )}
      <h2
        style={{
          fontSize: 44,
          fontWeight: 800,
          color: kv.primaryColor,
          marginBottom: 40,
          letterSpacing: '-0.02em',
        }}
      >
        {renderBoldText(title, kv.accentColor)}
      </h2>
      <div
        style={{
          display: 'flex',
          flex: 1,
          gap: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {metrics.map((m, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: 24,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: kv.accentColor,
                marginBottom: 8,
              }}
            >
              {m.value}
            </div>
            <div style={{ fontSize: 16, color: kv.secondaryColor }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  7. QUOTE                                                          */
/* ================================================================== */

function QuoteSlideContent({
  data,
  kv,
}: {
  data: Record<string, unknown>;
  kv: KV;
}) {
  const quote = (data.quote as string) || '';
  const attribution = (data.attribution as string) || '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '8%',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: 120,
          color: kv.accentColor,
          lineHeight: 1,
          marginBottom: 16,
          opacity: 0.4,
          userSelect: 'none',
        }}
      >
        &ldquo;
      </div>
      <p
        style={{
          fontSize: 36,
          fontWeight: 600,
          color: kv.primaryColor,
          lineHeight: 1.5,
          fontStyle: 'italic',
          marginBottom: 32,
          maxWidth: '80%',
        }}
      >
        {quote}
      </p>
      {attribution && (
        <p style={{ fontSize: 20, color: kv.secondaryColor }}>
          {attribution}
        </p>
      )}
    </div>
  );
}

/* ================================================================== */
/*  8. IMAGE-TEXT                                                      */
/* ================================================================== */

function ImageTextSlideContent({
  data,
  kv,
}: {
  data: Record<string, unknown>;
  kv: KV;
}) {
  const tag = (data.tag as string) || '';
  const title = (data.title as string) || '';
  const body = (data.body as string) || '';
  const imageUrl = (data.imageUrl as string) || '';
  const imagePosition = (data.imagePosition as string) || 'left';

  const imagePanel = (
    <div
      style={{
        flex: 1,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        minHeight: 200,
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          style={{
            color: kv.secondaryColor,
            opacity: 0.4,
            fontSize: 48,
            userSelect: 'none',
          }}
        >
          ◻
        </div>
      )}
    </div>
  );

  const textPanel = (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 16px',
      }}
    >
      {tag && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: kv.accentColor,
            letterSpacing: '0.15em',
            marginBottom: 12,
          }}
        >
          {tag}
        </div>
      )}
      <h2
        style={{
          fontSize: 36,
          fontWeight: 800,
          color: kv.primaryColor,
          marginBottom: 16,
          letterSpacing: '-0.02em',
        }}
      >
        {renderBoldText(title, kv.accentColor)}
      </h2>
      <div
        style={{
          fontSize: 18,
          color: kv.secondaryColor,
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
        }}
      >
        {renderBoldText(body, kv.accentColor)}
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        padding: '4%',
        gap: 32,
        alignItems: 'stretch',
      }}
    >
      {imagePosition === 'right' ? (
        <>
          {textPanel}
          {imagePanel}
        </>
      ) : (
        <>
          {imagePanel}
          {textPanel}
        </>
      )}
    </div>
  );
}

/* ================================================================== */
/*  9. CARDS                                                          */
/* ================================================================== */

function CardsSlideContent({
  data,
  kv,
}: {
  data: Record<string, unknown>;
  kv: KV;
}) {
  const tag = (data.tag as string) || '';
  const title = (data.title as string) || '';
  const cards =
    (data.cards as { title: string; body: string; highlight: boolean }[]) ||
    [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '4%',
      }}
    >
      {tag && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: kv.accentColor,
            letterSpacing: '0.15em',
            marginBottom: 12,
          }}
        >
          {tag}
        </div>
      )}
      <h2
        style={{
          fontSize: 44,
          fontWeight: 800,
          color: kv.primaryColor,
          marginBottom: 32,
          letterSpacing: '-0.02em',
        }}
      >
        {renderBoldText(title, kv.accentColor)}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(cards.length, 4)}, 1fr)`,
          gap: 20,
          flex: 1,
          alignItems: 'stretch',
        }}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            style={{
              background: card.highlight
                ? `${kv.accentColor}18`
                : 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              border: card.highlight
                ? `1px solid ${kv.accentColor}60`
                : '1px solid rgba(255,255,255,0.08)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <h3
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: card.highlight ? kv.accentColor : kv.primaryColor,
                marginBottom: 12,
              }}
            >
              {card.title}
            </h3>
            <p
              style={{
                fontSize: 16,
                color: kv.secondaryColor,
                lineHeight: 1.6,
              }}
            >
              {renderBoldText(card.body, kv.accentColor)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  10. TIMELINE                                                      */
/* ================================================================== */

function TimelineSlideContent({
  data,
  kv,
}: {
  data: Record<string, unknown>;
  kv: KV;
}) {
  const tag = (data.tag as string) || '';
  const title = (data.title as string) || '';
  const steps =
    (data.steps as {
      stage: string;
      title: string;
      detail: string;
      metric: string;
      highlight: boolean;
    }[]) || [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '4%',
      }}
    >
      {tag && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: kv.accentColor,
            letterSpacing: '0.15em',
            marginBottom: 12,
          }}
        >
          {tag}
        </div>
      )}
      <h2
        style={{
          fontSize: 44,
          fontWeight: 800,
          color: kv.primaryColor,
          marginBottom: 40,
          letterSpacing: '-0.02em',
        }}
      >
        {renderBoldText(title, kv.accentColor)}
      </h2>
      <div
        style={{
          display: 'flex',
          flex: 1,
          gap: 16,
          alignItems: 'stretch',
        }}
      >
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: step.highlight
                ? `${kv.accentColor}18`
                : 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              border: step.highlight
                ? `2px solid ${kv.accentColor}`
                : '1px solid rgba(255,255,255,0.08)',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: step.highlight ? kv.accentColor : kv.secondaryColor,
                letterSpacing: '0.15em',
              }}
            >
              {step.stage}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: step.highlight ? kv.accentColor : kv.primaryColor,
              }}
            >
              {step.title}
            </div>
            <div
              style={{
                fontSize: 14,
                color: kv.secondaryColor,
                lineHeight: 1.5,
                flex: 1,
              }}
            >
              {step.detail}
            </div>
            {step.metric && (
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: step.highlight ? kv.accentColor : kv.primaryColor,
                  marginTop: 8,
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  paddingTop: 8,
                }}
              >
                {step.metric}
              </div>
            )}
            {/* connector arrow (except last) */}
            {i < steps.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  right: -12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 16,
                  color: kv.secondaryColor,
                  opacity: 0.4,
                  zIndex: 1,
                }}
              >
                ›
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  11. BIG-NUMBER                                                    */
/* ================================================================== */

function BigNumberSlideContent({
  data,
  kv,
}: {
  data: Record<string, unknown>;
  kv: KV;
}) {
  const tag = (data.tag as string) || '';
  const number = (data.number as string) || '';
  const title = (data.title as string) || '';
  const body = (data.body as string) || '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '5%',
        textAlign: 'center',
      }}
    >
      {tag && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: kv.accentColor,
            letterSpacing: '0.15em',
            marginBottom: 24,
          }}
        >
          {tag}
        </div>
      )}
      <div
        style={{
          fontSize: 120,
          fontWeight: 900,
          color: kv.accentColor,
          lineHeight: 1,
          marginBottom: 24,
          letterSpacing: '-0.04em',
        }}
      >
        {number}
      </div>
      <h2
        style={{
          fontSize: 40,
          fontWeight: 800,
          color: kv.primaryColor,
          marginBottom: 16,
          letterSpacing: '-0.02em',
        }}
      >
        {renderBoldText(title, kv.accentColor)}
      </h2>
      {body && (
        <p
          style={{
            fontSize: 20,
            color: kv.secondaryColor,
            lineHeight: 1.6,
            maxWidth: '70%',
          }}
        >
          {renderBoldText(body, kv.accentColor)}
        </p>
      )}
    </div>
  );
}

/* ================================================================== */
/*  12. STATS                                                         */
/* ================================================================== */

function StatsSlideContent({
  data,
  kv,
}: {
  data: Record<string, unknown>;
  kv: KV;
}) {
  const tag = (data.tag as string) || '';
  const title = (data.title as string) || '';
  const metrics =
    (data.metrics as { value: string; label: string }[]) || [];
  const body = (data.body as string) || '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '5%',
      }}
    >
      {tag && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: kv.accentColor,
            letterSpacing: '0.15em',
            marginBottom: 12,
          }}
        >
          {tag}
        </div>
      )}
      <h2
        style={{
          fontSize: 44,
          fontWeight: 800,
          color: kv.primaryColor,
          marginBottom: 40,
          letterSpacing: '-0.02em',
        }}
      >
        {renderBoldText(title, kv.accentColor)}
      </h2>
      <div
        style={{
          display: 'flex',
          gap: 20,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
        }}
      >
        {metrics.map((m, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: 24,
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                color: kv.accentColor,
                marginBottom: 8,
              }}
            >
              {m.value}
            </div>
            <div style={{ fontSize: 16, color: kv.secondaryColor }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>
      {body && (
        <div
          style={{
            fontSize: 20,
            color: kv.secondaryColor,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
          }}
        >
          {renderBoldText(body, kv.accentColor)}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  13. VIDEO                                                         */
/* ================================================================== */

function VideoSlideContent({
  data,
  kv,
}: {
  data: Record<string, unknown>;
  kv: KV;
}) {
  const tag = (data.tag as string) || '';
  const title = (data.title as string) || '';
  const videoUrl = (data.videoUrl as string) || '';
  const body = (data.body as string) || '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '4%',
      }}
    >
      {tag && (
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: kv.accentColor,
            letterSpacing: '0.15em',
            marginBottom: 12,
          }}
        >
          {tag}
        </div>
      )}
      <h2
        style={{
          fontSize: 40,
          fontWeight: 800,
          color: kv.primaryColor,
          marginBottom: 24,
          letterSpacing: '-0.02em',
        }}
      >
        {renderBoldText(title, kv.accentColor)}
      </h2>
      <div
        style={{
          flex: 1,
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          marginBottom: 16,
        }}
      >
        {videoUrl ? (
          <video
            src={videoUrl}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            controls={false}
            muted
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              color: kv.secondaryColor,
              opacity: 0.5,
            }}
          >
            <span style={{ fontSize: 56 }}>▶</span>
            <span style={{ fontSize: 16 }}>Video Placeholder</span>
          </div>
        )}
      </div>
      {body && (
        <p
          style={{
            fontSize: 18,
            color: kv.secondaryColor,
            lineHeight: 1.6,
          }}
        >
          {renderBoldText(body, kv.accentColor)}
        </p>
      )}
    </div>
  );
}

/* ================================================================== */
/*  14. OUTRO                                                         */
/* ================================================================== */

function OutroSlideContent({
  data,
  kv,
}: {
  data: Record<string, unknown>;
  kv: KV;
}) {
  const title = (data.title as string) || 'Thank You';
  const subtitle = (data.subtitle as string) || '';
  const contactInfo = (data.contactInfo as string) || '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '8%',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: kv.primaryColor,
          lineHeight: 1.2,
          marginBottom: 24,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: 24,
            color: kv.secondaryColor,
            marginBottom: 32,
            fontWeight: 400,
          }}
        >
          {subtitle}
        </p>
      )}
      {contactInfo && (
        <p
          style={{
            fontSize: 20,
            color: kv.accentColor,
            fontWeight: 600,
          }}
        >
          {contactInfo}
        </p>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Overlay renderer                                                  */
/* ================================================================== */

function OverlayRenderer({
  overlay,
}: {
  overlay: OverlayObject;
}) {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${overlay.x}%`,
    top: `${overlay.y}%`,
    width: `${overlay.width}%`,
    height: `${overlay.height}%`,
    opacity: overlay.opacity,
    borderRadius: overlay.borderRadius,
    overflow: 'hidden',
  };

  switch (overlay.type) {
    case 'text':
      return (
        <div
          style={{
            ...baseStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: overlay.color,
            fontSize: overlay.fontSize,
            fontWeight: overlay.fontWeight,
            backgroundColor: overlay.backgroundColor || 'transparent',
          }}
        >
          {overlay.content}
        </div>
      );

    case 'shape':
      return (
        <div
          style={{
            ...baseStyle,
            backgroundColor: overlay.backgroundColor || 'rgba(255,255,255,0.1)',
          }}
        />
      );

    case 'image':
      return (
        <div style={baseStyle}>
          {overlay.content ? (
            <img
              src={overlay.content}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: overlay.borderRadius,
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor:
                  overlay.backgroundColor || 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.3)',
                fontSize: 32,
              }}
            >
              ◻
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}

/* ================================================================== */
/*  SlideContentRenderer  (exported)                                  */
/* ================================================================== */

export function SlideContentRenderer({ slide }: { slide: Slide }) {
  const kv = useProjectStore((s) => s.project.keyVisual);
  const colors: KV = {
    accentColor: kv.accentColor,
    primaryColor: kv.primaryColor,
    secondaryColor: kv.secondaryColor,
  };

  switch (slide.template) {
    case 'title':
      return <TitleSlideContent data={slide.data} kv={colors} />;
    case 'section-cover':
      return <SectionCoverSlideContent data={slide.data} kv={colors} />;
    case 'content':
      return <ContentSlideContent data={slide.data} kv={colors} />;
    case 'two-column':
      return <TwoColumnSlideContent data={slide.data} kv={colors} />;
    case 'comparison':
      return <ComparisonSlideContent data={slide.data} kv={colors} />;
    case 'metrics':
      return <MetricsSlideContent data={slide.data} kv={colors} />;
    case 'quote':
      return <QuoteSlideContent data={slide.data} kv={colors} />;
    case 'image-text':
      return <ImageTextSlideContent data={slide.data} kv={colors} />;
    case 'cards':
      return <CardsSlideContent data={slide.data} kv={colors} />;
    case 'timeline':
      return <TimelineSlideContent data={slide.data} kv={colors} />;
    case 'big-number':
      return <BigNumberSlideContent data={slide.data} kv={colors} />;
    case 'stats':
      return <StatsSlideContent data={slide.data} kv={colors} />;
    case 'video':
      return <VideoSlideContent data={slide.data} kv={colors} />;
    case 'outro':
      return <OutroSlideContent data={slide.data} kv={colors} />;
    case 'blank':
      return null;
    default:
      return null;
  }
}

/* ================================================================== */
/*  LivePreview  (exported)                                           */
/* ================================================================== */

export function LivePreview({ slide }: { slide: Slide | null }) {
  const project = useProjectStore((s) => s.project);
  const storeBackgroundEffect = useProjectStore((s) => s.backgroundEffect);
  const kv = project.keyVisual;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const slideW = project.screen.widthPx;
  const slideH = project.screen.heightPx;

  /* ---- ResizeObserver for responsive scaling ---- */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const update = () => {
      const rect = container.getBoundingClientRect();
      const scaleX = rect.width / slideW;
      const scaleY = rect.height / slideH;
      setScale(Math.min(scaleX, scaleY));
    };

    const ro = new ResizeObserver(update);
    ro.observe(container);
    update();
    return () => ro.disconnect();
  }, [slideW, slideH]);

  /* ---- Background resolution ---- */
  const bg =
    slide?.backgroundColor && slide.backgroundColor !== '__theme__'
      ? slide.backgroundColor
      : kv.gradientCss || kv.backgroundColor;

  /* ---- Background effect resolution ---- */
  const effect =
    slide?.backgroundEffect && slide.backgroundEffect !== ''
      ? slide.backgroundEffect
      : kv.backgroundEffect ?? storeBackgroundEffect;

  return (
    <div className="live-preview-panel">
      <div className="live-preview-header">LIVE PREVIEW</div>
      <div className="live-preview-container" ref={containerRef}>
        <div
          className="live-preview-slide"
          style={{
            width: slideW,
            height: slideH,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            background: bg,
            color: kv.primaryColor,
            fontFamily: kv.fontFamily,
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <BackgroundRenderer effect={effect} />

          {/* Slide template content */}
          {slide && <SlideContentRenderer slide={slide} />}

          {/* Overlay objects */}
          {slide?.overlays.map((ov) => (
            <OverlayRenderer key={ov.id} overlay={ov} />
          ))}
        </div>
      </div>
    </div>
  );
}
