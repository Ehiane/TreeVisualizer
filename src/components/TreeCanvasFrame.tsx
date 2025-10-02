import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Info, ZoomIn, ZoomOut } from 'lucide-react';
import styles from '../styles/app.module.css';
import { useTreeStore } from '../state/useTreeStore';
import { TreeCanvas } from './TreeCanvas';
import { BTreeCanvas } from './BTreeCanvas';
import { BPlusTreeCanvas } from './BPlusTreeCanvas';
import { InfoModal } from './InfoModal';

export function TreeCanvasFrame() {
  const { root, steps, index, playing, next, prev, play, pause, reset, playbackSpeed, setPlaybackSpeed, treeType, activeAction } = useTreeStore();
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const prevIndexRef = useRef(index);

  const currentStep = index >= 0 && index < steps.length ? steps[index] : null;
  const highlightIds = currentStep?.highlightIds || [];
  const highlightKeys = currentStep?.highlightKeys || [];
  const remainingValues = currentStep?.remainingValues || [];
  const currentValue = currentStep?.currentValue;

  // Use tree from step if available (for incremental building), otherwise use main root
  // For B-Trees, use btree field, for B+ Trees use bplustree field, for binary trees use tree field
  const displayTree = treeType === 'b-tree'
    ? (currentStep?.btree !== undefined ? currentStep.btree : root)
    : treeType === 'b-plus-tree'
    ? (currentStep?.bplustree !== undefined ? currentStep.bplustree : root)
    : (currentStep?.tree !== undefined ? currentStep.tree : root);

  const canGoPrev = index > -1;
  const canGoNext = index < steps.length - 1;
  const hasSteps = steps.length > 0;

  const treeData = treeType === 'b-tree'
    ? BTreeCanvas({ root: displayTree, highlightIds, activeAction })
    : treeType === 'b-plus-tree'
    ? BPlusTreeCanvas({ root: displayTree, highlightIds, highlightKeys, activeAction })
    : TreeCanvas({ root: displayTree, highlightIds, activeAction });

  // Handle mouse drag to pan the SVG
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!svgRef.current) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, pan]);

  // Reset pan position when step changes
  useEffect(() => {
    if (prevIndexRef.current !== index) {
      setPan({ x: 0, y: 0 });
      prevIndexRef.current = index;
    }
  }, [index]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.1));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <>
      <div className={styles.card}>
        <div
          ref={canvasRef}
          className={styles.canvasWrap}
          style={{
            overflow: 'hidden',
            position: 'relative',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
        >
          <svg
            ref={svgRef}
            className={styles.svg}
            role="img"
            aria-label="Tree visualization canvas"
            viewBox={treeData.viewBox}
            style={{
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            {treeData.content}
          </svg>

          {/* Show remaining values as floating circles */}
          {remainingValues.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
                maxWidth: '200px',
              }}
            >
              {remainingValues.map((val, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--gray-3)',
                    border: '2px solid var(--gray-6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: 'var(--gray-12)',
                  }}
                >
                  {val}
                </div>
              ))}
            </div>
          )}

          {/* Show current value being inserted */}
          {currentValue !== undefined && (
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-3)',
                  border: '3px solid var(--accent-9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--accent-11)',
                  animation: 'pulse 1s ease-in-out infinite',
                }}
              >
                {currentValue}
              </div>
              <p style={{ fontSize: '11px', textAlign: 'center', marginTop: '4px', color: 'var(--gray-11)' }}>
                Inserting
              </p>
            </div>
          )}

          {/* Zoom controls */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              display: 'flex',
              gap: '8px',
              flexDirection: 'column',
            }}
          >
            <button
              className={`${styles.btn} ${styles.btnIcon}`}
              onClick={handleZoomIn}
              disabled={zoom >= 2}
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
              aria-label="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
            <button
              className={`${styles.btn} ${styles.btnIcon}`}
              onClick={handleZoomReset}
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                fontSize: '10px',
                fontWeight: '600',
              }}
              aria-label="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              className={`${styles.btn} ${styles.btnIcon}`}
              onClick={handleZoomOut}
              disabled={zoom <= 0.1}
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
              aria-label="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
          </div>

          {/* Info button */}
          <button
            className={`${styles.btn} ${styles.btnIcon}`}
            onClick={() => setIsInfoModalOpen(true)}
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
            aria-label="Learn more about this tree"
          >
            <Info size={16} />
          </button>
        </div>
      </div>

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        treeType={treeType}
      />

      <div className={styles.card}>
        <div className={styles.transport}>
          <button
            className={styles.btn}
            disabled={!canGoPrev}
            aria-label="Previous step"
            onClick={prev}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            className={styles.btn}
            disabled={!hasSteps}
            aria-label={playing ? 'Pause animation' : 'Play animation'}
            onClick={playing ? pause : play}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button
            className={styles.btn}
            disabled={!canGoNext}
            aria-label="Next step"
            onClick={next}
          >
            <ChevronRight size={16} />
          </button>

          <button
            className={styles.btn}
            disabled={!hasSteps}
            aria-label="Reset to beginning"
            onClick={reset}
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {hasSteps && (
          <>
            <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '12px', color: 'var(--gray-11)' }}>
              Step {index + 1} of {steps.length}
            </div>

            {/* Speed control */}
            <div style={{ marginTop: '12px', padding: '0 16px' }}>
              <label style={{ fontSize: '12px', color: 'var(--gray-11)', display: 'block', marginBottom: '6px' }}>
                Speed: {playbackSpeed === 500 ? '2x' : playbackSpeed === 1000 ? '1x' : playbackSpeed === 1500 ? '0.75x' : '0.5x'}
              </label>
              <input
                type="range"
                min="500"
                max="2000"
                step="500"
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--gray-10)', marginTop: '4px' }}>
                <span>Fast</span>
                <span>Slow</span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
