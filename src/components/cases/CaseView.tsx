import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Case, CaseLink } from '@/types/database';

interface CaseViewProps {
  case: Case;
}

const linkTypeLabels: Record<CaseLink['type'], string> = {
  website: 'Website',
  github: 'GitHub',
  app_store: 'App Store',
  google_play: 'Google Play',
  demo: 'Demo',
  other: 'Link',
};

const linkTypeIcons: Record<CaseLink['type'], string> = {
  website: '🌐',
  github: '💻',
  app_store: '📱',
  google_play: '📱',
  demo: '🎮',
  other: '🔗',
};

export function CaseView({ case: caseItem }: CaseViewProps) {
  return (
    <div className="space-y-6">
      {/* Technologies */}
      {caseItem.technologies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Technologies Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {caseItem.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Links */}
      {caseItem.links && caseItem.links.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Links & Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {caseItem.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">{linkTypeIcons[link.type]}</span>
                  <div>
                    <div className="font-medium">{link.title}</div>
                    <div className="text-sm text-gray-500">{linkTypeLabels[link.type]}</div>
                  </div>
                  <div className="ml-auto text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      {caseItem.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Screenshots & Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {caseItem.images.map((url, index) => (
                <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={url}
                    alt={`${caseItem.title} screenshot ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => window.open(url, '_blank')}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {caseItem.results && (
        <Card>
          <CardHeader>
            <CardTitle>Results & Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{caseItem.results}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Case Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <div>{new Date(caseItem.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Last Updated:</span>
              <div>{new Date(caseItem.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
