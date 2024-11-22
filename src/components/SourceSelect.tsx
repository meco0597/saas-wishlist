import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SourceSelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export default function SourceSelect({ value, onValueChange }: SourceSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select Source" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Webflow">Webflow</SelectItem>
        <SelectItem value="Shopify">Shopify</SelectItem>
        <SelectItem value="Azure">Azure</SelectItem>
      </SelectContent>
    </Select>
  );
}