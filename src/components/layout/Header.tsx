'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Settings, FileText, FolderOpen, HelpCircle } from 'lucide-react';
import { signOut } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

interface HeaderProps {
  user?: {
    email: string;
    fullName?: string;
  };
  showBackButton?: boolean;
  backHref?: string;
  backLabel?: string;
  workspaceId?: string;
  workspaceName?: string;
}

export function Header({ user, showBackButton, backHref = '/', backLabel = 'Back', workspaceId, workspaceName }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  const isActive = (path: string) => {
    if (path === `/workspace/${workspaceId}`) {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700">
              Proposal Generator
            </Link>
            
            {workspaceId && (
              <nav className="flex items-center gap-1">
                <Link href={`/workspace/${workspaceId}`}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={cn(
                      "gap-2",
                      isActive(`/workspace/${workspaceId}`) && pathname === `/workspace/${workspaceId}` && "bg-gray-100"
                    )}
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link href={`/workspace/${workspaceId}/proposals`}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={cn(
                      "gap-2",
                      isActive(`/workspace/${workspaceId}/proposals`) && "bg-gray-100"
                    )}
                  >
                    <FileText className="w-4 h-4" />
                    Proposals
                  </Button>
                </Link>
                <Link href={`/workspace/${workspaceId}/cases`}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={cn(
                      "gap-2",
                      isActive(`/workspace/${workspaceId}/cases`) && "bg-gray-100"
                    )}
                  >
                    <FolderOpen className="w-4 h-4" />
                    Cases
                  </Button>
                </Link>
                <Link href={`/workspace/${workspaceId}/faq`}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={cn(
                      "gap-2",
                      isActive(`/workspace/${workspaceId}/faq`) && "bg-gray-100"
                    )}
                  >
                    <HelpCircle className="w-4 h-4" />
                    FAQ
                  </Button>
                </Link>
              </nav>
            )}
            
            {showBackButton && !workspaceId && (
              <>
                <span className="text-gray-300">|</span>
                <Link href={backHref} className="text-sm text-gray-600 hover:text-gray-900">
                  ← {backLabel}
                </Link>
              </>
            )}
          </div>
          
          {user && (
            <div className="flex items-center gap-3">
              {workspaceId && (
                <Link href={`/workspace/${workspaceId}/settings`}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <span className="text-sm text-gray-600">
                {user.fullName || user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
