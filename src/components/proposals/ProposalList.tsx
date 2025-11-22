'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import type { Proposal } from '@/types/database';
import Link from 'next/link';
import { deleteProposal, duplicateProposal } from '@/app/actions/proposals';
import { useRouter } from 'next/navigation';

interface ProposalListProps {
  proposals: Proposal[];
  workspaceId: string;
}

export function ProposalList({ proposals: initialProposals, workspaceId }: ProposalListProps) {
  const router = useRouter();
  const [proposals, setProposals] = useState(initialProposals);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

  // Filter proposals based on status and search
  const filteredProposals = proposals.filter(proposal => {
    const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) {
      return;
    }

    setIsDeleting(id);
    const result = await deleteProposal(id);
    
    if (result.success) {
      setProposals(prev => prev.filter(p => p.id !== id));
    } else {
      alert(`Error: ${result.error.message}`);
    }
    
    setIsDeleting(null);
  };

  const handleDuplicate = async (id: string) => {
    setIsDuplicating(id);
    const result = await duplicateProposal(id);
    
    if (result.success) {
      setProposals(prev => [result.data, ...prev]);
      router.refresh();
    } else {
      alert(`Error: ${result.error.message}`);
    }
    
    setIsDuplicating(null);
  };

  const getStatusBadge = (status: Proposal['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    const labels = {
      draft: 'In Progress',
      sent: 'Ready',
      accepted: 'Under Review',
      rejected: 'Archived',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by title or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="draft">In Progress</option>
            <option value="sent">Ready</option>
            <option value="accepted">Under Review</option>
            <option value="rejected">Archived</option>
          </select>
        </div>
      </div>

      {/* Proposals List */}
      {filteredProposals.length === 0 ? (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex items-center justify-center !pt-16 pb-16">
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'No proposals match your filters'
                : 'No proposals yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredProposals.map((proposal) => (
            <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      <Link 
                        href={`/workspace/${workspaceId}/proposals/${proposal.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {proposal.title}
                      </Link>
                    </CardTitle>
                    {proposal.clientName && (
                      <CardDescription>
                        Client: {proposal.clientName}
                      </CardDescription>
                    )}
                  </div>
                  <div>
                    {getStatusBadge(proposal.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    <p>Created: {new Date(proposal.createdAt).toLocaleDateString('en-US')}</p>
                    <p>Updated: {new Date(proposal.updatedAt).toLocaleDateString('en-US')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/workspace/${workspaceId}/proposals/${proposal.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(proposal.id)}
                      disabled={isDuplicating === proposal.id}
                    >
                      {isDuplicating === proposal.id ? 'Duplicating...' : 'Duplicate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(proposal.id)}
                      disabled={isDeleting === proposal.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {isDeleting === proposal.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
