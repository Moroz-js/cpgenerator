'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ProposalBlock, WorkspaceBrandSettings } from '@/types/database';
import type { BlockType } from '@/lib/builder/block-types';
import { BlocksSidebar } from './builder/BlocksSidebar';
import { BlocksCanvas } from './builder/BlocksCanvas';
import { AddBlockModal } from './builder/AddBlockModal';
import { BlockSettingsPanel } from './builder/BlockSettingsPanel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Copy, ExternalLink, Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  reorderProposalBlocks,
  createProposalBlock,
  deleteProposalBlock,
  duplicateProposalBlock,
  updateProposalBlock,
} from '@/app/actions/proposal-blocks';
import { updateProposal } from '@/app/actions/proposals';
import { publishProposal } from '@/app/actions/publish';
import { getDefaultProps } from '@/lib/builder/blocks-registry';

interface ProposalBuilderPageProps {
  proposal: any; // TODO: Add proper Proposal type
  initialBlocks: ProposalBlock[];
  brand: WorkspaceBrandSettings | null;
  availableCases?: Array<{
    id: string;
    title: string;
    description?: string;
    technologies?: string[];
    images?: string[];
    links?: Array<{
      type?: string;
      url: string;
      label?: string;
    }>;
  }>;
  availableFAQItems?: Array<{
    id: string;
    question: string;
    answer: string;
    category?: string;
  }>;
}

export function ProposalBuilderPage({
  proposal,
  initialBlocks,
  brand,
  availableCases = [],
  availableFAQItems = [],
}: ProposalBuilderPageProps) {
  const router = useRouter();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<ProposalBlock[]>(initialBlocks);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [changedBlockIds, setChangedBlockIds] = useState<Set<string>>(new Set());
  const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);
  const [loomUrl, setLoomUrl] = useState<string | null>(proposal.loom_url || null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(proposal.title);
  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editedClient, setEditedClient] = useState(proposal.client_name || '');
  const [status, setStatus] = useState<'draft' | 'sent' | 'accepted' | 'rejected'>(proposal.status);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  console.log('ProposalBuilderPage render:', {
    proposalId: proposal.id,
    blocksCount: blocks.length,
    selectedBlockId,
    hasBrand: !!brand,
  });

  // Auto-save every 15 seconds if there are unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const interval = setInterval(() => {
      console.log('Auto-saving...');
      handleSaveAll();
      setLastAutoSave(new Date());
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [hasUnsavedChanges]);

  const handleReorderBlocks = async (newOrder: string[]) => {
    console.log('Reorder blocks:', newOrder);
    
    // Optimistic update
    const reorderedBlocks = newOrder
      .map((id) => blocks.find((b) => b.id === id))
      .filter((b): b is ProposalBlock => b !== undefined);
    
    const previousBlocks = blocks;
    setBlocks(reorderedBlocks);
    setIsSaving(true);

    try {
      const result = await reorderProposalBlocks(proposal.id, newOrder);
      
      if (!result.success) {
        // Rollback on error
        setBlocks(previousBlocks);
        console.error('Reorder failed:', result.error.message);
        toast.error(`Ошибка: ${result.error.message}`);
      }
    } catch (error) {
      // Rollback on error
      setBlocks(previousBlocks);
      console.error('Reorder error:', error);
      toast.error('Не удалось изменить порядок блоков');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBlock = useCallback(async (blockId: string, props: Record<string, unknown>) => {
    console.log('Update block (local only):', blockId, props);
    
    // Update block in local state only (no server call)
    // Use functional update to ensure we have the latest state
    setBlocks((prevBlocks) => 
      prevBlocks.map((b) => 
        b.id === blockId ? { ...b, props: { ...b.props, ...props } } : b
      )
    );
    
    // Track this block as changed
    setChangedBlockIds(prev => new Set(prev).add(blockId));
    setHasUnsavedChanges(true);
  }, []);

  const handleSaveAll = async () => {
    console.log('Saving changes for blocks:', Array.from(changedBlockIds));
    setIsSaving(true);

    try {
      // Save only changed blocks
      const changedBlocks = blocks.filter(b => changedBlockIds.has(b.id));
      
      for (const block of changedBlocks) {
        console.log('Saving block:', block.id, block.props);
        const result = await updateProposalBlock(block.id, block.props as any);
        if (!result.success) {
          console.error('Update block failed:', result.error.message);
          alert(`Ошибка сохранения блока: ${result.error.message}`);
          setIsSaving(false);
          return;
        }
      }

      setHasUnsavedChanges(false);
      setChangedBlockIds(new Set());
      toast.success('Все изменения сохранены');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Не удалось сохранить изменения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateLoomUrl = async (url: string) => {
    console.log('Update loom URL:', url);
    setLoomUrl(url);
    setIsSaving(true);

    try {
      const result = await updateProposal({
        id: proposal.id,
        loomUrl: url || null,
      });

      if (!result.success) {
        console.error('Update loom URL failed:', result.error.message);
        alert(`Ошибка: ${result.error.message}`);
      }
    } catch (error) {
      console.error('Update loom URL error:', error);
      alert('Не удалось обновить ссылку на видео');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) {
      toast.error('Название не может быть пустым');
      setEditedTitle(proposal.title);
      setIsEditingTitle(false);
      return;
    }

    if (editedTitle === proposal.title) {
      setIsEditingTitle(false);
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateProposal({
        id: proposal.id,
        title: editedTitle.trim(),
      });

      if (result.success) {
        proposal.title = editedTitle.trim();
        toast.success('Название обновлено');
        setIsEditingTitle(false);
        router.refresh();
      } else {
        console.error('Update title failed:', result.error.message);
        toast.error(`Ошибка: ${result.error.message}`);
        setEditedTitle(proposal.title);
      }
    } catch (error) {
      console.error('Update title error:', error);
      toast.error('Не удалось обновить название');
      setEditedTitle(proposal.title);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEditTitle = () => {
    setEditedTitle(proposal.title);
    setIsEditingTitle(false);
  };

  const handleSaveClient = async () => {
    const trimmedClient = editedClient.trim();

    if (trimmedClient === (proposal.client_name || '')) {
      setIsEditingClient(false);
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateProposal({
        id: proposal.id,
        clientName: trimmedClient || null,
      });

      if (result.success) {
        proposal.client_name = trimmedClient || null;
        toast.success('Имя клиента обновлено');
        setIsEditingClient(false);
        router.refresh();
      } else {
        console.error('Update client failed:', result.error.message);
        toast.error(`Ошибка: ${result.error.message}`);
        setEditedClient(proposal.client_name || '');
      }
    } catch (error) {
      console.error('Update client error:', error);
      toast.error('Не удалось обновить имя клиента');
      setEditedClient(proposal.client_name || '');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEditClient = () => {
    setEditedClient(proposal.client_name || '');
    setIsEditingClient(false);
  };

  const handleStatusChange = async (newStatus: 'draft' | 'sent' | 'accepted' | 'rejected') => {
    if (newStatus === status) return;

    setIsSaving(true);

    try {
      const result = await updateProposal({
        id: proposal.id,
        status: newStatus,
      });

      if (result.success) {
        setStatus(newStatus);
        proposal.status = newStatus;
        toast.success('Статус обновлен');
        router.refresh();
      } else {
        console.error('Update status failed:', result.error.message);
        toast.error(`Ошибка: ${result.error.message}`);
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Не удалось обновить статус');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    console.log('Publishing proposal...');
    setIsPublishing(true);

    try {
      // Save any unsaved changes first
      if (hasUnsavedChanges) {
        await handleSaveAll();
      }

      const result = await publishProposal(proposal.id);

      if (result.success) {
        const fullUrl = `${window.location.origin}/p/${result.data.slug}`;
        setPublishedUrl(fullUrl);
        setPublishDialogOpen(true);
      } else {
        console.error('Publish failed:', result.error.message);
        toast.error(`Ошибка публикации: ${result.error.message}`);
      }
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Не удалось опубликовать КП');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDownloadPDF = async () => {
    console.log('Generating PDF...');
    setIsGeneratingPDF(true);

    try {
      const response = await fetch(`/api/proposals/${proposal.id}/pdf`);

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Не удалось сгенерировать PDF');
        return;
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${proposal.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF скачан успешно!');
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Не удалось скачать PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleCopyUrl = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl);
      toast.success('Ссылка скопирована!');
    }
  };

  const handleAddBlock = async (type: BlockType) => {
    console.log('Add block type:', type);
    setIsSaving(true);

    try {
      // Get default props for this block type
      const defaultProps = getDefaultProps(type);
      if (!defaultProps) {
        console.error('No default props found for block type:', type);
        alert('Неизвестный тип блока');
        setIsSaving(false);
        return;
      }

      const result = await createProposalBlock(proposal.id, type, defaultProps);

      if (result.success) {
        // Add new block to state
        setBlocks([...blocks, result.data]);
        // Select the new block
        setSelectedBlockId(result.data.id);
        // Close modal is handled by AddBlockModal
      } else {
        console.error('Create block failed:', result.error.message);
        alert(`Ошибка: ${result.error.message}`);
      }
    } catch (error) {
      console.error('Create block error:', error);
      alert('Не удалось создать блок');
    } finally {
      setIsSaving(false);
    }
  };

  if (!blocks) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Загрузка билдера...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/workspace/${proposal.workspace_id}/proposals`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <div className="flex-1">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveTitle();
                    } else if (e.key === 'Escape') {
                      handleCancelEditTitle();
                    }
                  }}
                  className="text-2xl font-bold h-10"
                  autoFocus
                  disabled={isSaving}
                />
                <Button
                  size="sm"
                  onClick={handleSaveTitle}
                  disabled={isSaving}
                >
                  Сохранить
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEditTitle}
                  disabled={isSaving}
                >
                  Отмена
                </Button>
              </div>
            ) : (
              <h1
                className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors"
                onClick={() => setIsEditingTitle(true)}
                title="Нажмите, чтобы изменить название"
              >
                {proposal.title}
              </h1>
            )}
            {isEditingClient ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={editedClient}
                  onChange={(e) => setEditedClient(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveClient();
                    } else if (e.key === 'Escape') {
                      handleCancelEditClient();
                    }
                  }}
                  className="text-sm h-8"
                  placeholder="Имя клиента"
                  autoFocus
                  disabled={isSaving}
                />
                <Button
                  size="sm"
                  onClick={handleSaveClient}
                  disabled={isSaving}
                >
                  Сохранить
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEditClient}
                  disabled={isSaving}
                >
                  Отмена
                </Button>
              </div>
            ) : (
              <p
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={() => setIsEditingClient(true)}
                title="Нажмите, чтобы изменить имя клиента"
              >
                {proposal.client_name || 'Нажмите, чтобы добавить клиента'}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Status selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Статус:</span>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as any)}
              disabled={isSaving}
              className="text-sm border rounded-md px-3 py-1.5 bg-background hover:bg-accent transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="draft">Черновик</option>
              <option value="sent">Отправлено</option>
              <option value="accepted">Принято</option>
              <option value="rejected">Отклонено</option>
            </select>
          </div>

          {/* Save status indicator */}
          <div className="flex items-center gap-2 text-sm">
            {isSaving && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Сохранение...</span>
              </>
            )}
            {!isSaving && hasUnsavedChanges && (
              <>
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                <span className="text-muted-foreground">Есть несохраненные изменения</span>
              </>
            )}
            {!isSaving && !hasUnsavedChanges && (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground">Все сохранено</span>
              </>
            )}
          </div>
          
          {/* Save button */}
          <Button
            variant={hasUnsavedChanges ? 'default' : 'outline'}
            onClick={handleSaveAll}
            disabled={isSaving || !hasUnsavedChanges}
            size="sm"
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
          
          {/* Publish button */}
          <Button 
            onClick={handlePublish} 
            disabled={isPublishing || hasUnsavedChanges}
            size="sm"
          >
            {isPublishing ? 'Публикация...' : 'Опубликовать'}
          </Button>

          {/* Download PDF button */}
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGeneratingPDF ? 'Генерация...' : 'Скачать PDF'}
          </Button>
        </div>
      </header>

      {/* Main content - 3 columns */}
      <div className="flex-1 grid grid-cols-[20%_50%_30%] overflow-hidden">
        {/* Sidebar - left */}
        <BlocksSidebar
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={setSelectedBlockId}
          onDuplicateBlock={async (blockId) => {
            console.log('Duplicate block:', blockId);
            setIsSaving(true);

            try {
              const result = await duplicateProposalBlock(blockId);

              if (result.success) {
                // Add duplicated block to state
                setBlocks([...blocks, result.data]);
                // Select the new block
                setSelectedBlockId(result.data.id);
              } else {
                console.error('Duplicate block failed:', result.error.message);
                alert(`Ошибка: ${result.error.message}`);
              }
            } catch (error) {
              console.error('Duplicate block error:', error);
              alert('Не удалось дублировать блок');
            } finally {
              setIsSaving(false);
            }
          }}
          onDeleteBlock={async (blockId) => {
            console.log('Delete block:', blockId);

            // Confirm deletion
            if (!confirm('Удалить этот блок?')) {
              return;
            }

            setIsSaving(true);

            try {
              const result = await deleteProposalBlock(blockId);

              if (result.success) {
                // Remove block from state
                setBlocks(blocks.filter((b) => b.id !== blockId));
                // Deselect if this block was selected
                if (selectedBlockId === blockId) {
                  setSelectedBlockId(null);
                }
              } else {
                console.error('Delete block failed:', result.error.message);
                alert(`Ошибка: ${result.error.message}`);
              }
            } catch (error) {
              console.error('Delete block error:', error);
              alert('Не удалось удалить блок');
            } finally {
              setIsSaving(false);
            }
          }}
          onAddBlock={() => setIsAddBlockModalOpen(true)}
          onReorderBlocks={handleReorderBlocks}
        />

        {/* Canvas - center */}
        <BlocksCanvas
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          brand={brand}
          onSelectBlock={setSelectedBlockId}
          loomUrl={loomUrl}
          availableCases={availableCases}
          availableFAQItems={availableFAQItems}
        />

        {/* Settings - right */}
        <BlockSettingsPanel
          block={blocks.find((b) => b.id === selectedBlockId) || null}
          brand={brand}
          onUpdate={handleUpdateBlock}
          loomUrl={loomUrl}
          onUpdateLoomUrl={handleUpdateLoomUrl}
          workspaceId={proposal.workspace_id}
          availableCases={availableCases}
          availableFAQItems={availableFAQItems}
        />
      </div>

      {/* Add Block Modal */}
      <AddBlockModal
        isOpen={isAddBlockModalOpen}
        onClose={() => setIsAddBlockModalOpen(false)}
        onAddBlock={handleAddBlock}
      />

      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>КП опубликовано!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ваше коммерческое предложение опубликовано и доступно по ссылке:
            </p>
            <div className="flex items-center gap-2">
              <Input value={publishedUrl || ''} readOnly className="flex-1" />
              <Button variant="outline" size="icon" onClick={handleCopyUrl}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => publishedUrl && window.open(publishedUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
