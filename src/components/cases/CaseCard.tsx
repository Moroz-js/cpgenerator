'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Case } from '@/types/database';

interface CaseCardProps {
  case: Case;
  onClick?: () => void;
}

export function CaseCard({ case: caseItem, onClick }: CaseCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="line-clamp-2">{caseItem.title}</CardTitle>
        {caseItem.description && (
          <CardDescription className="line-clamp-3">
            {caseItem.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {caseItem.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {caseItem.technologies.slice(0, 5).map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
              >
                {tech}
              </span>
            ))}
            {caseItem.technologies.length > 5 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                +{caseItem.technologies.length - 5} more
              </span>
            )}
          </div>
        )}
        <div className="flex gap-4 text-sm text-gray-500">
          {caseItem.images.length > 0 && (
            <span>
              {caseItem.images.length} image{caseItem.images.length > 1 ? 's' : ''}
            </span>
          )}
          {caseItem.links.length > 0 && (
            <span>
              {caseItem.links.length} link{caseItem.links.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
