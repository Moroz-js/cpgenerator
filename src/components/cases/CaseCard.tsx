'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, Link as LinkIcon, FileText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Case } from '@/types/database';

interface CaseCardProps {
  case: Case;
  workspaceId: string;
}

// Extract plain text from Tiptap JSON
function extractTextFromTiptap(jsonString: string): string {
  try {
    const doc = JSON.parse(jsonString);
    let text = '';
    
    const extractFromNode = (node: any): void => {
      if (node.type === 'text') {
        text += node.text;
      }
      if (node.content) {
        node.content.forEach(extractFromNode);
      }
    };
    
    extractFromNode(doc);
    return text.trim();
  } catch {
    return jsonString; // Return as-is if not valid JSON
  }
}

export function CaseCard({ case: caseItem, workspaceId }: CaseCardProps) {
  const firstImage = caseItem.images[0];
  const descriptionText = caseItem.description 
    ? extractTextFromTiptap(caseItem.description)
    : '';

  return (
    <Link href={`/workspace/${workspaceId}/cases/${caseItem.id}`}>
      <Card 
        className="cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden group h-full"
      >
      {/* Image Header */}
      {firstImage ? (
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <Image
            src={firstImage}
            alt={caseItem.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-lg line-clamp-2">
              {caseItem.title}
            </h3>
          </div>
        </div>
      ) : (
        <div className="relative h-48 w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <FileText className="w-16 h-16 text-white/30" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-lg line-clamp-2">
              {caseItem.title}
            </h3>
          </div>
        </div>
      )}

      <CardContent className="pt-4">
        {/* Description */}
        {descriptionText && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">
            {descriptionText}
          </p>
        )}

        {/* Technologies */}
        {caseItem.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {caseItem.technologies.slice(0, 4).map((tech, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tech}
              </Badge>
            ))}
            {caseItem.technologies.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{caseItem.technologies.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {caseItem.images.length > 0 && (
            <div className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              <span>{caseItem.images.length}</span>
            </div>
          )}
          {caseItem.links.length > 0 && (
            <div className="flex items-center gap-1">
              <LinkIcon className="w-3 h-3" />
              <span>{caseItem.links.length}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}
