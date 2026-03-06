import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMemory, updateMemory, deleteMemory, createShareLink } from "../../api/memory";
import type { Memory } from "../../api/memory";
import { deleteImage, getImageUrl } from "../../api/images";
import DetailMemoryHeader from "../components/detail/DetailMemoryHeader";
import MemoryDetailSheetFuturo from "../components/detail/MemoryDetailSheetFuturo";
import MemoryEditSheet from "../components/detail/MemoryEditSheet";
import DetailGalleryUploadSheet from "../components/detail/DetailGalleryUploadSheet";
import DetailInfoSection from "../components/detail/DetailInfoSection";
import DetailGallerySection from "../components/detail/DetailGallerySection";
import DetailMemoryEventoViaggioLayout from "../components/detail/DetailMemoryEventoViaggioLayout";
import { DetailMemorySkeleton } from "../components/skeletons";
import PwaBottomSheet from "../components/ui/BottomSheet";
import { invalidateOnMemoryChange } from "../utils/queryInvalidations";
import PhotoOverlay, { PhotoOverlayImage } from "../components/shared/PhotoOverlay";

export default function DetailMemoryMobile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [photoOverlayOpen, setPhotoOverlayOpen] = useState(false);
  const [photoOverlayIndex, setPhotoOverlayIndex] = useState(0);

  const { data: memory, isLoading, error } = useQuery({
    queryKey: ["memory", id],
    queryFn: async () => {
      const res = await getMemory(id!);
      return res.data;
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
    placeholderData: () => {
      const memories = queryClient.getQueryData<Memory[]>(["memories"]);
      return memories?.find((item) => String(item.id) === id);
    },
  });

  const handleBack = () => navigate(-1);
  const handleEdit = () => setEditSheetOpen(true);
  const handleDelete = () => setDeleteConfirmOpen(true);

  const handleShare = async () => {
    if (!id || !memory) return;

    try {
      const response = await createShareLink(id);
      const shareUrl = response.data.url;

      if (navigator.share) {
        await navigator.share({
          title: memory.title,
          text: `Guarda questo ricordo su SORE: ${memory.title}`,
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        window.alert("Link di condivisione copiato negli appunti.");
        return;
      }

      window.prompt("Copia questo link:", shareUrl);
    } catch (err) {
      console.error(err);
      window.alert("Impossibile creare il link di condivisione.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await deleteMemory(id);
      await invalidateOnMemoryChange(queryClient, id);
      setDeleteConfirmOpen(false);
      navigate(-1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <DetailMemorySkeleton />;
  }

  if (error || !memory) {
    return (
      <section className="pwa-page">
        <header className="pwa-page-header">
          <h1 className="pwa-page-title">Errore</h1>
          <p className="pwa-page-subtitle">
            Ricordo non trovato o non disponibile.
          </p>
        </header>
        <div className="pwa-page-card">
          <button
            type="button"
            className="pwa-idea-detail-btn pwa-idea-detail-btn-cancel"
            onClick={() => navigate(-1)}
          >
            Indietro
          </button>
        </div>
      </section>
    );
  }

  const memoryImages = memory.images ?? [];

  const overlayImages: PhotoOverlayImage[] = [...memoryImages].reverse().map((img) => ({
    id: img.id,
    fullUrl: getImageUrl(img.webp_path ?? img.thumb_big_path ?? ""),
    thumbUrl: getImageUrl(img.thumb_big_path ?? img.webp_path ?? ""),
    createdAt: img.created_at,
  }));

  const openPhotoOverlayByImageId = (imageId: number) => {
    const index = overlayImages.findIndex((img) => img.id === imageId);
    if (index === -1) return;
    setPhotoOverlayIndex(index);
    setPhotoOverlayOpen(true);
  };

  const handleDeletePhoto = async (image: PhotoOverlayImage) => {
    if (!id) return;
    try {
      await deleteImage(String(image.id));
      await invalidateOnMemoryChange(queryClient, id);
      setPhotoOverlayOpen(false);
    } catch (err) {
      console.error(err);
      window.alert("Impossibile eliminare la foto.");
    }
  };

  const handleSaveMemory = async (data: Partial<Memory>) => {
    if (!id) return;
    await updateMemory(id, data);
    await invalidateOnMemoryChange(queryClient, id);
    setEditSheetOpen(false);
  };

  const isFuturo = memory.type?.toUpperCase() === "FUTURO";
  if (isFuturo) {
    return (
      <>
        <PwaBottomSheet open onClose={handleBack}>
          <MemoryDetailSheetFuturo
            memory={memory}
            onClose={handleBack}
            onSave={handleSaveMemory}
            onDelete={handleDelete}
            onShare={handleShare}
          />
        </PwaBottomSheet>
        {deleteConfirmOpen && (
          <PwaBottomSheet
            open={deleteConfirmOpen}
            onClose={() => !isDeleting && setDeleteConfirmOpen(false)}
          >
            <div
              className="pwa-idea-detail-sheet"
              role="alertdialog"
              aria-labelledby="delete-memory-title"
              aria-describedby="delete-memory-desc"
            >
              <h2 id="delete-memory-title" className="pwa-memory-edit-sheet-title">
                Elimina ricordo
              </h2>
              <p id="delete-memory-desc" className="pwa-idea-detail-desc">
                Vuoi eliminare &quot;{memory.title}&quot;? Questa azione non si può annullare.
              </p>
              <div className="pwa-idea-detail-actions">
                <button
                  type="button"
                  className="pwa-idea-detail-btn pwa-idea-detail-btn-cancel"
                  onClick={() => setDeleteConfirmOpen(false)}
                  disabled={isDeleting}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  className="pwa-idea-detail-btn pwa-idea-detail-btn-save"
                  style={{ background: "var(--pwa-accent-red, #dc2626)" }}
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Eliminazione..." : "Elimina"}
                </button>
              </div>
            </div>
          </PwaBottomSheet>
        )}
      </>
    );
  }

  const isSimple = memory.type === "SEMPLICE";

  return (
    <>
      {editSheetOpen && (
        <PwaBottomSheet
          open={editSheetOpen}
          onClose={() => setEditSheetOpen(false)}
        >
          <MemoryEditSheet
            memory={memory}
            onClose={() => setEditSheetOpen(false)}
            onSave={handleSaveMemory}
          />
        </PwaBottomSheet>
      )}
      {uploadSheetOpen && (
        <PwaBottomSheet
          open={uploadSheetOpen}
          onClose={() => setUploadSheetOpen(false)}
        >
          <DetailGalleryUploadSheet
            memoryId={memory.id}
            onClose={() => setUploadSheetOpen(false)}
          />
        </PwaBottomSheet>
      )}
      {deleteConfirmOpen && (
        <PwaBottomSheet
          open={deleteConfirmOpen}
          onClose={() => !isDeleting && setDeleteConfirmOpen(false)}
        >
          <div
            className="pwa-idea-detail-sheet"
            role="alertdialog"
            aria-labelledby="delete-memory-title"
            aria-describedby="delete-memory-desc"
          >
            <h2 id="delete-memory-title" className="pwa-memory-edit-sheet-title">
              Elimina ricordo
            </h2>
            <p id="delete-memory-desc" className="pwa-idea-detail-desc">
              Vuoi eliminare &quot;{memory.title}&quot;? Questa azione non si può annullare.
            </p>
            <div className="pwa-idea-detail-actions">
              <button
                type="button"
                className="pwa-idea-detail-btn pwa-idea-detail-btn-cancel"
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={isDeleting}
              >
                Annulla
              </button>
              <button
                type="button"
                className="pwa-idea-detail-btn pwa-idea-detail-btn-save"
                style={{ background: "var(--pwa-accent-red, #dc2626)" }}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminazione..." : "Elimina"}
              </button>
            </div>
          </div>
        </PwaBottomSheet>
      )}
      <PhotoOverlay
        isOpen={photoOverlayOpen}
        images={overlayImages}
        initialIndex={photoOverlayIndex}
        memoryTitle={memory.title}
        locationLabel={memory.location}
        onClose={() => setPhotoOverlayOpen(false)}
        onDeletePhoto={handleDeletePhoto}
      />
      {isSimple ? (
        <section className="pwa-page pwa-page-detail-memory">
          <DetailMemoryHeader
            memory={memory}
            onBack={handleBack}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onShare={handleShare}
          />
          <div className="pwa-page-card">
            <DetailInfoSection memory={memory} />
            <DetailGallerySection
              memory={memory}
              memoryId={id}
              onAddPhotos={() => setUploadSheetOpen(true)}
              onImageClick={openPhotoOverlayByImageId}
            />
          </div>
        </section>
      ) : (
        <DetailMemoryEventoViaggioLayout
          memory={memory}
          memoryId={id!}
          onBack={handleBack}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onShare={handleShare}
          onAddPhotos={() => setUploadSheetOpen(true)}
          onOpenPhotoOverlay={openPhotoOverlayByImageId}
        />
      )}
    </>
  );
}
