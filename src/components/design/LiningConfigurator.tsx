import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FabricEntry } from '@/data/fabricStore';

export type LiningCoverage = 'yoke' | 'full-body' | 'custom-length';
export type LiningFinish = 'bound-edges' | 'french-seam' | 'overlocked' | 'raw';

export interface LiningConfig {
  enabled: boolean;
  coverage: LiningCoverage;
  customLength?: string;
  includeSleeves: boolean;
  fabricId?: string;
  finish: LiningFinish;
}

export interface SlipConfig {
  enabled: boolean;
  silhouetteId?: string;
  fabricId?: string;
  length?: string;
}

interface LiningConfiguratorProps {
  liningConfig: LiningConfig;
  onLiningChange: (config: LiningConfig) => void;
  slipConfig?: SlipConfig;
  onSlipChange?: (config: SlipConfig) => void;
  availableFabrics: FabricEntry[];
  showSlip?: boolean;
}

const COVERAGE_LABELS: Record<LiningCoverage, string> = {
  'yoke': 'Yoke Only',
  'full-body': 'Full Body',
  'custom-length': 'Custom Length',
};

const FINISH_LABELS: Record<LiningFinish, string> = {
  'bound-edges': 'Bound Edges',
  'french-seam': 'French Seam',
  'overlocked': 'Overlocked',
  'raw': 'Raw Edges',
};

export const LiningConfigurator = ({
  liningConfig,
  onLiningChange,
  slipConfig,
  onSlipChange,
  availableFabrics,
  showSlip = false,
}: LiningConfiguratorProps) => {
  const liningFabrics = availableFabrics.filter(f => 
    f.componentType === 'lining' || f.fabricName?.toLowerCase().includes('lining')
  );
  
  const slipFabrics = availableFabrics.filter(f => 
    f.componentType === 'slip' || f.fabricName?.toLowerCase().includes('slip')
  );

  return (
    <div className="space-y-4">
      {/* Lining Configuration */}
      <Card className="p-4 space-y-4 bg-card/50 border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Lining</Label>
            <p className="text-sm text-muted-foreground">Add lining to the garment</p>
          </div>
          <Switch
            checked={liningConfig.enabled}
            onCheckedChange={(enabled) => onLiningChange({ ...liningConfig, enabled })}
          />
        </div>

        {liningConfig.enabled && (
          <div className="space-y-4 pt-3 border-t border-border">
            {/* Coverage */}
            <div className="space-y-2">
              <Label className="text-sm">Coverage *</Label>
              <RadioGroup
                value={liningConfig.coverage}
                onValueChange={(value) => onLiningChange({ 
                  ...liningConfig, 
                  coverage: value as LiningCoverage 
                })}
                className="grid grid-cols-3 gap-2"
              >
                {(Object.keys(COVERAGE_LABELS) as LiningCoverage[]).map((coverage) => (
                  <div key={coverage} className="flex items-center space-x-2">
                    <RadioGroupItem value={coverage} id={`coverage-${coverage}`} />
                    <Label htmlFor={`coverage-${coverage}`} className="text-sm cursor-pointer">
                      {COVERAGE_LABELS[coverage]}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              {liningConfig.coverage === 'custom-length' && (
                <Input
                  placeholder="e.g., 3 inches shorter than shirt"
                  value={liningConfig.customLength || ''}
                  onChange={(e) => onLiningChange({ 
                    ...liningConfig, 
                    customLength: e.target.value 
                  })}
                  className="mt-2"
                />
              )}
            </div>

            {/* Sleeve Lining */}
            <div className="flex items-center space-x-2">
              <Switch
                id="sleeve-lining"
                checked={liningConfig.includeSleeves}
                onCheckedChange={(includeSleeves) => onLiningChange({ 
                  ...liningConfig, 
                  includeSleeves 
                })}
              />
              <Label htmlFor="sleeve-lining" className="text-sm cursor-pointer">
                Include Sleeve Lining
              </Label>
            </div>

            {/* Fabric Selection */}
            <div className="space-y-2">
              <Label className="text-sm">Lining Fabric</Label>
              <Select
                value={liningConfig.fabricId || ''}
                onValueChange={(value) => onLiningChange({ 
                  ...liningConfig, 
                  fabricId: value 
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lining fabric" />
                </SelectTrigger>
                <SelectContent>
                  {liningFabrics.length > 0 ? (
                    liningFabrics.map((fabric) => (
                      <SelectItem key={fabric.id} value={fabric.id}>
                        {fabric.fabricName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No lining fabrics inducted</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Finish */}
            <div className="space-y-2">
              <Label className="text-sm">Finish</Label>
              <Select
                value={liningConfig.finish}
                onValueChange={(value) => onLiningChange({ 
                  ...liningConfig, 
                  finish: value as LiningFinish 
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FINISH_LABELS) as LiningFinish[]).map((finish) => (
                    <SelectItem key={finish} value={finish}>
                      {FINISH_LABELS[finish]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </Card>

      {/* Slip Configuration */}
      {showSlip && slipConfig && onSlipChange && (
        <Card className="p-4 space-y-4 bg-card/50 border-border">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">Slip</Label>
              <p className="text-sm text-muted-foreground">Add an inner slip</p>
            </div>
            <Switch
              checked={slipConfig.enabled}
              onCheckedChange={(enabled) => onSlipChange({ ...slipConfig, enabled })}
            />
          </div>

          {slipConfig.enabled && (
            <div className="space-y-4 pt-3 border-t border-border">
              {/* Slip Fabric */}
              <div className="space-y-2">
                <Label className="text-sm">Slip Fabric</Label>
                <Select
                  value={slipConfig.fabricId || ''}
                  onValueChange={(value) => onSlipChange({ 
                    ...slipConfig, 
                    fabricId: value 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select slip fabric" />
                  </SelectTrigger>
                  <SelectContent>
                    {slipFabrics.length > 0 ? (
                      slipFabrics.map((fabric) => (
                        <SelectItem key={fabric.id} value={fabric.id}>
                          {fabric.fabricName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>No slip fabrics inducted</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Slip Length */}
              <div className="space-y-2">
                <Label className="text-sm">Slip Length</Label>
                <Input
                  placeholder="e.g., 2 inches shorter than main garment"
                  value={slipConfig.length || ''}
                  onChange={(e) => onSlipChange({ 
                    ...slipConfig, 
                    length: e.target.value 
                  })}
                />
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
