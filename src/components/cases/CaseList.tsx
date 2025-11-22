'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { CaseCard } from './CaseCard';
import type { Case } from '@/types/database';

interface CaseListProps {
  cases: Case[];
  workspaceId: string;
}

export function CaseList({ cases, workspaceId }: CaseListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = cases.filter((caseItem) =>
    caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    caseItem.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search cases by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Cases Grid */}
      {filteredCases.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {searchQuery ? 'No Cases Found' : 'No Cases Yet'}
            </CardTitle>
            <CardDescription>
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Create your first case to get started'}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              case={caseItem}
              workspaceId={workspaceId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
