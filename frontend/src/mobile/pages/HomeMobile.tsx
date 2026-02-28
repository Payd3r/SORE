import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IoNotificationsOutline } from 'react-icons/io5';
import { getMemories, type Memory } from '../../api/memory';
import { checkIdea, getIdeas, type Idea } from '../../api/ideas';
import { usePullToRefresh } from '../gestures';
import { useNotificationsSummaryQuery } from '../hooks/useNotificationsQuery';
import DetailIdeaModal from '../../desktop/components/Idee/DetailIdeaModal';
import { MobileHeader, MobilePageWrapper } from '../components/layout';
import { SearchBar, SegmentedControl, Button } from '../components/ui';
import MemoryCard from '../components/MemoryCard';
import IdeaCard from '../components/IdeaCard';

type HomeTab = 'ricordi' | 'idee';
type MemorySort = 'newest' | 'oldest' | 'random';
type IdeaStateFilter = 'all' | 'checked' | 'unchecked';

export default function HomeMobile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<HomeTab>('ricordi');
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [memorySort, setMemorySort] = useState<MemorySort>('newest');
  const [ideaStateFilter, setIdeaStateFilter] = useState<IdeaStateFilter>('all');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  const { data: notificationsSummary } = useNotificationsSummaryQuery(true);
  const unreadCount = notificationsSummary?.unread ?? 0;

  const { data: memories = [], isLoading: memoriesLoading, refetch: refetchMemories } = useQuery<Memory[]>({
    queryKey: ['memories'],
    queryFn: getMemories,
  });

  const { data: ideas = [], isLoading: ideasLoading, refetch: refetchIdeas } = useQuery<Idea[]>({
    queryKey: ['ideas'],
    queryFn: getIdeas,
  });

  const checkIdeaMutation = useMutation({
    mutationFn: ({ ideaId, checked }: { ideaId: number; checked: boolean }) => checkIdea(ideaId, checked),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['ideas'] });
    },
  });

  const refreshAll = async () => {
    await Promise.all([refetchMemories(), refetchIdeas()]);
  };

  const pullToRefresh = usePullToRefresh({
    enabled: activeTab === 'ricordi',
    onRefresh: refreshAll,
  });

  const filteredMemories = useMemo(() => {
    let list = [...memories];

    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter((memory) => memory.title.toLowerCase().includes(query));
    }

    if (memorySort === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (memorySort === 'oldest') {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      list.sort(() => Math.random() - 0.5);
    }

    return list;
  }, [memories, memorySort, search]);

  const filteredIdeas = useMemo(() => {
    let list = [...ideas];

    if (ideaStateFilter === 'checked') {
      list = list.filter((idea) => Boolean(idea.checked));
    } else if (ideaStateFilter === 'unchecked') {
      list = list.filter((idea) => !idea.checked);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter((idea) => idea.title.toLowerCase().includes(query));
    }

    return list;
  }, [ideas, ideaStateFilter, search]);

  const featuredMemories = filteredMemories.slice(0, 6);
  const planningMemories = filteredMemories.filter((memory) => memory.type.toUpperCase() === 'FUTURO').slice(0, 6);

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto"
      onTouchStart={(e) => pullToRefresh.onTouchStart(e, scrollRef.current?.scrollTop ?? 0)}
      onTouchMove={(e) => pullToRefresh.onTouchMove(e, scrollRef.current?.scrollTop ?? 0)}
      onTouchEnd={pullToRefresh.onTouchEnd}
    >
      <MobilePageWrapper accentBg className="pb-24">
        <div
          className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-[var(--color-primary)]/30 transition-all"
          style={{ transform: `scaleX(${Math.min(1, pullToRefresh.pullDistance / 56)})` }}
        />

        <MobileHeader
          showBack={false}
          leftSlot={
            <div className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-semibold">
                S
              </span>
              <span className="text-base font-semibold text-[var(--text-primary)]">SORE</span>
            </div>
          }
          rightActions={
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('sore:open-notifications'))}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-input)] text-[var(--text-primary)]"
              aria-label="Notifiche"
            >
              <IoNotificationsOutline className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 rounded-full bg-[var(--color-accent-pink)] px-1.5 text-[10px] text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          }
        />

        <div className="mt-4 space-y-3">
          <SearchBar
            placeholder={activeTab === 'ricordi' ? 'Cerca ricordi...' : 'Cerca idee...'}
            value={search}
            onChange={setSearch}
            onFilterClick={() => setIsFilterOpen((prev) => !prev)}
          />

          <SegmentedControl<HomeTab>
            options={[
              { key: 'ricordi', label: 'Ricordi' },
              { key: 'idee', label: 'Idee' },
            ]}
            value={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {isFilterOpen && (
          <div className="mt-3 rounded-card border border-[var(--border-default)] bg-[var(--bg-card)] p-3 shadow-[var(--shadow-sm)]">
            {activeTab === 'ricordi' ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase text-[var(--text-tertiary)]">Ordinamento</p>
                <div className="flex flex-wrap gap-2">
                  {(['newest', 'oldest', 'random'] as MemorySort[]).map((sort) => (
                    <Button
                      key={sort}
                      size="sm"
                      variant={memorySort === sort ? 'primary' : 'secondary'}
                      onClick={() => setMemorySort(sort)}
                    >
                      {sort === 'newest' ? 'Più recenti' : sort === 'oldest' ? 'Meno recenti' : 'Casuale'}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase text-[var(--text-tertiary)]">Stato idee</p>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'checked', 'unchecked'] as IdeaStateFilter[]).map((state) => (
                    <Button
                      key={state}
                      size="sm"
                      variant={ideaStateFilter === state ? 'primary' : 'secondary'}
                      onClick={() => setIdeaStateFilter(state)}
                    >
                      {state === 'all' ? 'Tutte' : state === 'checked' ? 'Completate' : 'Da completare'}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ricordi' ? (
          <div className="mt-6 space-y-6">
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Ricordi in evidenza
              </h2>
              {memoriesLoading ? (
                <p className="text-sm text-[var(--text-tertiary)]">Caricamento ricordi...</p>
              ) : featuredMemories.length === 0 ? (
                <p className="text-sm text-[var(--text-tertiary)]">Nessun ricordo trovato.</p>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {featuredMemories.map((memory) => (
                    <MemoryCard key={memory.id} memory={memory} onClick={(memoryId) => navigate(`/ricordo/${memoryId}`)} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Pianifica la prossima
              </h2>
              {planningMemories.length === 0 ? (
                <p className="text-sm text-[var(--text-tertiary)]">Nessun ricordo futuro in questo momento.</p>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {planningMemories.map((memory) => (
                    <MemoryCard key={memory.id} memory={memory} onClick={(memoryId) => navigate(`/ricordo/${memoryId}`)} />
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {ideasLoading ? (
              <p className="text-sm text-[var(--text-tertiary)]">Caricamento idee...</p>
            ) : filteredIdeas.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)]">Nessuna idea trovata.</p>
            ) : (
              filteredIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  onOpen={setSelectedIdea}
                  onToggleChecked={(currentIdea, checked) => {
                    checkIdeaMutation.mutate({ ideaId: currentIdea.id, checked });
                  }}
                />
              ))
            )}
          </div>
        )}
      </MobilePageWrapper>

      <DetailIdeaModal
        idea={selectedIdea}
        isOpen={Boolean(selectedIdea)}
        onClose={() => setSelectedIdea(null)}
      />
    </div>
  );
}
