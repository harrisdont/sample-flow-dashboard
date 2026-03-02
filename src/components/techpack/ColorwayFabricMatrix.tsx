import { Colorway, ComponentFinish } from '@/data/designStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const COMPONENT_ROWS = ['shirt', 'lowers', 'dupatta', 'other'];
const COMPONENT_LABELS: Record<string, string> = {
  shirt: 'SHIRT', lowers: 'LOWERS', dupatta: 'DUPATTA', other: 'OTHER',
};

interface ColorwayFabricMatrixProps {
  colorways: Colorway[];
  sectionNumber: string;
}

export const ColorwayFabricMatrix = ({ colorways, sectionNumber }: ColorwayFabricMatrixProps) => {
  if (!colorways || colorways.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {sectionNumber} · Colorway & Fabric Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border px-3 py-2 text-left font-semibold w-24" rowSpan={2}>Component</th>
                <th className="border border-border px-3 py-2 text-left font-semibold w-20" rowSpan={2}>Field</th>
                {colorways.map(cw => (
                  <th key={cw.id} className="border border-border px-3 py-2 text-center font-semibold bg-primary/5">
                    {cw.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPONENT_ROWS.map((comp) => {
                const hasData = colorways.some(cw => cw.fabrics[comp]);
                if (!hasData) return null;

                return ['CODE', 'COMPOSITION', 'COLOUR', 'LABELS', 'TRIMS'].map((field, fi) => (
                  <tr key={`${comp}-${field}`} className={fi === 0 ? 'border-t-2 border-t-border' : ''}>
                    {fi === 0 && (
                      <td className="border border-border px-3 py-2 font-bold text-primary bg-muted/20 align-top" rowSpan={5}>
                        {COMPONENT_LABELS[comp]}
                      </td>
                    )}
                    <td className="border border-border px-3 py-1.5 text-muted-foreground font-medium bg-muted/10">
                      {field}
                    </td>
                    {colorways.map(cw => {
                      const fabric = cw.fabrics[comp];
                      let cellValue = '—';
                      if (field === 'CODE') cellValue = fabric?.fabricCode || '—';
                      else if (field === 'COMPOSITION') cellValue = fabric?.composition || '—';
                      else if (field === 'COLOUR') cellValue = fabric?.colour || '—';
                      else if (field === 'LABELS') cellValue = cw.labels[comp]?.join(', ') || '—';
                      else if (field === 'TRIMS') cellValue = cw.trims[comp]?.join(', ') || '—';

                      return (
                        <td key={cw.id} className="border border-border px-3 py-1.5">
                          {cellValue}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

interface ComponentFinishesProps {
  componentFinishes?: Record<string, ComponentFinish>;
  componentTechniques?: Record<string, string>;
  componentLabels?: Record<string, string[]>;
  sectionNumber: string;
}

export const ComponentFinishesSection = ({ componentFinishes, componentTechniques, componentLabels, sectionNumber }: ComponentFinishesProps) => {
  const hasFinishes = componentFinishes && Object.keys(componentFinishes).length > 0;
  const hasTechniques = componentTechniques && Object.keys(componentTechniques).length > 0;
  const hasLabels = componentLabels && Object.keys(componentLabels).length > 0;

  if (!hasFinishes && !hasTechniques && !hasLabels) return null;

  const allComponents = Array.from(new Set([
    ...Object.keys(componentFinishes || {}),
    ...Object.keys(componentTechniques || {}),
    ...Object.keys(componentLabels || {}),
  ]));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {sectionNumber} · Per-Component Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border px-3 py-2 text-left font-semibold w-28">Component</th>
                <th className="border border-border px-3 py-2 text-left font-semibold">Hem Finish</th>
                <th className="border border-border px-3 py-2 text-left font-semibold">Seam Finish</th>
                <th className="border border-border px-3 py-2 text-left font-semibold">Neckline Finish</th>
                <th className="border border-border px-3 py-2 text-left font-semibold">Technique</th>
                <th className="border border-border px-3 py-2 text-left font-semibold">Labels</th>
              </tr>
            </thead>
            <tbody>
              {allComponents.map((comp, i) => {
                const finish = componentFinishes?.[comp];
                const technique = componentTechniques?.[comp];
                const labels = componentLabels?.[comp];

                return (
                  <tr key={comp} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                    <td className="border border-border px-3 py-2 font-bold text-primary uppercase">
                      {COMPONENT_LABELS[comp] || comp}
                    </td>
                    <td className="border border-border px-3 py-2">{finish?.hem || '—'}</td>
                    <td className="border border-border px-3 py-2">{finish?.seams || '—'}</td>
                    <td className="border border-border px-3 py-2">{finish?.necklineFinish || '—'}</td>
                    <td className="border border-border px-3 py-2">{technique || '—'}</td>
                    <td className="border border-border px-3 py-2">
                      {labels && labels.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {labels.map((l, j) => (
                            <Badge key={j} variant="outline" className="text-[10px]">{l}</Badge>
                          ))}
                        </div>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

interface SpecialInstructionsProps {
  instructions?: string;
  sectionNumber: string;
}

export const SpecialInstructionsSection = ({ instructions, sectionNumber }: SpecialInstructionsProps) => {
  if (!instructions) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {sectionNumber} · Special Instructions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
          <p className="text-sm whitespace-pre-wrap">{instructions}</p>
        </div>
      </CardContent>
    </Card>
  );
};
