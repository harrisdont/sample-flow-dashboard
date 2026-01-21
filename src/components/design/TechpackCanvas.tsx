import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Pencil, Eraser, Type, Undo2, Redo2, Trash2, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface DrawAction {
  type: 'pencil' | 'eraser' | 'number';
  points?: Point[];
  position?: Point;
  number?: number;
  color: string;
  lineWidth: number;
}

interface TechpackCanvasProps {
  imageUrl?: string;
  width?: number;
  height?: number;
  fabricNumbers?: { number: number; color: string }[];
  onAnnotationsChange?: (dataUrl: string) => void;
}

const PENCIL_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Purple', value: '#a855f7' },
];

export const TechpackCanvas = ({
  imageUrl,
  width = 600,
  height = 500,
  fabricNumbers = [],
  onAnnotationsChange,
}: TechpackCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'number'>('pencil');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [selectedNumber, setSelectedNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [undoneActions, setUndoneActions] = useState<DrawAction[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);

  // Load background image
  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setBackgroundImage(img);
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  // Redraw canvas whenever actions or background changes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image if exists
    if (backgroundImage) {
      const scale = Math.min(canvas.width / backgroundImage.width, canvas.height / backgroundImage.height);
      const x = (canvas.width - backgroundImage.width * scale) / 2;
      const y = (canvas.height - backgroundImage.height * scale) / 2;
      ctx.drawImage(backgroundImage, x, y, backgroundImage.width * scale, backgroundImage.height * scale);
    } else {
      // Draw placeholder grid
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
    }

    // Replay all actions
    actions.forEach((action) => {
      if (action.type === 'pencil' && action.points && action.points.length > 0) {
        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(action.points[0].x, action.points[0].y);
        action.points.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      } else if (action.type === 'eraser' && action.points) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(255,255,255,1)';
        ctx.lineWidth = action.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        if (action.points.length > 0) {
          ctx.moveTo(action.points[0].x, action.points[0].y);
          action.points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
          });
        }
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      } else if (action.type === 'number' && action.position && action.number !== undefined) {
        // Draw number marker
        const radius = 14;
        ctx.beginPath();
        ctx.arc(action.position.x, action.position.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = action.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw number text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(action.number.toString(), action.position.x, action.position.y);
      }
    });

    // Draw current path if drawing
    if (currentPath.length > 0 && isDrawing) {
      if (tool === 'pencil') {
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        currentPath.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      } else if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(255,255,255,1)';
        ctx.lineWidth = lineWidth * 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        currentPath.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  }, [actions, backgroundImage, currentPath, isDrawing, tool, color, lineWidth]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Notify parent of changes
  useEffect(() => {
    if (onAnnotationsChange && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onAnnotationsChange(dataUrl);
    }
  }, [actions, onAnnotationsChange]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (tool === 'number') {
      // Place number marker
      const newAction: DrawAction = {
        type: 'number',
        position: pos,
        number: selectedNumber,
        color: fabricNumbers[selectedNumber - 1]?.color || color,
        lineWidth: 0,
      };
      setActions([...actions, newAction]);
      setUndoneActions([]);
    } else {
      setIsDrawing(true);
      setCurrentPath([pos]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    setCurrentPath((prev) => [...prev, pos]);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentPath.length > 0) {
      const newAction: DrawAction = {
        type: tool as 'pencil' | 'eraser',
        points: [...currentPath],
        color,
        lineWidth: tool === 'eraser' ? lineWidth * 3 : lineWidth,
      };
      setActions([...actions, newAction]);
      setUndoneActions([]);
    }
    setCurrentPath([]);
  };

  const handleUndo = () => {
    if (actions.length === 0) return;
    const lastAction = actions[actions.length - 1];
    setActions(actions.slice(0, -1));
    setUndoneActions([...undoneActions, lastAction]);
  };

  const handleRedo = () => {
    if (undoneActions.length === 0) return;
    const lastUndone = undoneActions[undoneActions.length - 1];
    setUndoneActions(undoneActions.slice(0, -1));
    setActions([...actions, lastUndone]);
  };

  const handleClear = () => {
    setActions([]);
    setUndoneActions([]);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `techpack-annotated-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  return (
    <Card className="p-4 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Tool Selection */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={tool === 'pencil' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('pencil')}
            title="Pencil"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('eraser')}
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <Button
            variant={tool === 'number' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTool('number')}
            title="Fabric Number Marker"
          >
            <Type className="h-4 w-4" />
          </Button>
        </div>

        {/* Color Selection for Pencil */}
        {tool === 'pencil' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                />
                Color
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3">
              <div className="flex gap-2">
                {PENCIL_COLORS.map((c) => (
                  <button
                    key={c.value}
                    className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                      color === c.value ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                    }`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setColor(c.value)}
                    title={c.name}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Line Width */}
        {(tool === 'pencil' || tool === 'eraser') && (
          <div className="flex items-center gap-2 px-2">
            <Label className="text-xs whitespace-nowrap">Size:</Label>
            <Slider
              value={[lineWidth]}
              onValueChange={([value]) => setLineWidth(value)}
              min={1}
              max={10}
              step={1}
              className="w-20"
            />
            <span className="text-xs text-muted-foreground w-4">{lineWidth}</span>
          </div>
        )}

        {/* Fabric Number Selection */}
        {tool === 'number' && (
          <div className="flex items-center gap-2">
            <Label className="text-xs">Fabric #:</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((num) => {
                const fabricColor = fabricNumbers[num - 1]?.color || PENCIL_COLORS[(num - 1) % PENCIL_COLORS.length].value;
                return (
                  <button
                    key={num}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white transition-transform hover:scale-110 ${
                      selectedNumber === num ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: fabricColor }}
                    onClick={() => setSelectedNumber(num)}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={actions.length === 0}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={undoneActions.length === 0}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            title="Clear All"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 2}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative overflow-auto border border-border rounded-lg bg-muted/30"
        style={{ maxHeight: '500px' }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            cursor: tool === 'pencil' ? 'crosshair' : tool === 'eraser' ? 'cell' : 'pointer',
          }}
          className="bg-white"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Legend */}
      {fabricNumbers.length > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Label className="text-xs text-muted-foreground">Fabric Legend:</Label>
          <div className="flex flex-wrap gap-2">
            {fabricNumbers.map((fabric, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="gap-1"
                style={{ borderColor: fabric.color }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: fabric.color }}
                />
                <span>#{idx + 1}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
