import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CaseCard } from './CaseCard';
import type { Case } from '@/types/database';

interface CaseListProps {
  cases: Case[];
  workspaceId: string;
  onCaseClick?: (caseId: string) => void;
}

export function CaseList({ cases, workspaceId, onCaseClick }: CaseListProps) {
  if (cases.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Cases Yet</CardTitle>
          <CardDescription>Create your first case to get started</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cases.map((caseItem) => (
        <CaseCard
          key={caseItem.id}
          case={caseItem}
          onClick={() => onCaseClick?.(caseItem.id)}
        />
      ))}
    </div>
  );
}
