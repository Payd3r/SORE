import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import {
    IoCalendarOutline,
    IoLocationOutline,
    IoMusicalNotesOutline,
    IoChevronBack,
    IoChevronForward,
    IoShareOutline,
    IoTrashOutline,
    IoCreateOutline
} from 'react-icons/io5';
import { FaSpotify } from 'react-icons/fa';
import { motion, AnimatePresence, useMotionValue, useAnimation } from 'framer-motion';
import { getMemory, getMemoryCarousel, updateMemory, deleteMemory, type Memory } from '../../api/memory';
import { getImageUrl } from '../../api/images';
import { getTrackDetails, SpotifyTrack } from '../../api/spotify';
import Loader from '../../desktop/components/Layout/Loader';
import InfoRicordoMobile from '../components/InfoRicordoMobile';
import GalleriaRicordoMobile from '../components/GalleriaRicordoMobile';
import CronologiaRicordoMobile from '../components/CronologiaRicordoMobile';
import MemoryEditModal from '../../desktop/components/Memory/MemoryEditModal';
import DeleteModal from '../../desktop/components/Memory/DeleteModal';

// Interfacce
interface CarouselImage {
    image: string;
    created_at: string;
    processedUrl: string;
}

// Extended Memory con informazioni aggiuntive restituite dall'API
interface ExtendedMemory extends Memory {
    created_by_name: string;
    created_by_user_id: number;
}

// Tipo di tab che può essere selezionato
type TabType = 'galleria' | 'info' | 'cronologia';

export default function DetailMemoryMobile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Stati per i dati del ricordo e carosello
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<TabType>('info');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [spotifyData, setSpotifyData] = useState<SpotifyTrack | null>(null);
    const [isLoadingTrack, setIsLoadingTrack] = useState(false);

    // Stati per la UI e animazioni
    const [infoExpanded, setInfoExpanded] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isAtScrollTop, setIsAtScrollTop] = useState(true);
    const contentScrollRef = useRef<HTMLDivElement>(null);

    // Refs per la gestione dei gesti touch
    const infoRef = useRef<HTMLDivElement>(null);
    const touchStartY = useRef(0);
    const touchEndY = useRef(0);
    const touchStartTime = useRef(0);
    const minSwipeDistance = 60;
    const isSwipingRef = useRef(false);

    // Per le transizioni fluide
    const infoY = useMotionValue(0);
    const infoControls = useAnimation();

    // React Query per il fetching del ricordo
    const { data: memory, isLoading } = useQuery<ExtendedMemory>({
        queryKey: ['memory', id],
        queryFn: async () => {
            const response = await getMemory(id!);
            return response.data as ExtendedMemory;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minuti
    });

    // React Query per il fetching delle immagini del carousel
    const { data: carouselImages = [] } = useQuery<CarouselImage[]>({
        queryKey: ['memoryCarousel', id],
        queryFn: async () => {
            const response = await getMemoryCarousel(id!);
            return response.data.map((img: any) => ({
                ...img,
                processedUrl: getImageUrl(img.image)
            }));
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minuti
        gcTime: 10 * 60 * 1000, // 10 minuti
        refetchOnWindowFocus: false, // Evita ricaricamenti non necessari
    });

    // Effetto per monitorare la posizione dello scroll
    useEffect(() => {
        const scrollContainer = contentScrollRef.current;
        if (!scrollContainer) return;

        const handleScroll = () => {
            setIsAtScrollTop(scrollContainer.scrollTop < 10);
        };

        scrollContainer.addEventListener('scroll', handleScroll);
        return () => {
            scrollContainer.removeEventListener('scroll', handleScroll);
        };
    }, [activeTab]);

    // Effetto per caricare i dati Spotify se il ricordo ha una canzone
    useEffect(() => {
        if (memory?.song) {
            setIsLoadingTrack(true);
            getTrackDetails(memory.song.split(' - ')[0]) // Prendi solo il titolo prima del trattino
                .then(data => {
                    setSpotifyData(data);
                })
                .catch(error => {
                    console.error('Errore nel caricamento dei dati Spotify:', error);
                })
                .finally(() => {
                    setIsLoadingTrack(false);
                });
        }
    }, [memory?.song]);

    // Forza un re-render quando le immagini del carosello sono caricate
    const [forceUpdate, setForceUpdate] = useState(0);
    useEffect(() => {
        if (carouselImages.length > 0) {
            // Forza un re-render dopo un breve ritardo per garantire che il blur funzioni correttamente
            // ma solo una volta e solo se necessario
            const timer = setTimeout(() => {
                // Limitiamo il numero di aggiornamenti per evitare loop
                if (forceUpdate < 2) {
                    setForceUpdate(prev => prev + 1);
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [carouselImages.length, forceUpdate]);

    // Effetto per nascondere la downbar quando il componente è montato
    useEffect(() => {
        // Controlla se la classe è già presente (potrebbe essere stata aggiunta da HomeMobile)
        if (!document.body.classList.contains('detail-memory-active')) {
            // Aggiungi una classe CSS temporanea per nascondere la downbar
            document.body.classList.add('detail-memory-active');

            // Aggiungi stile inline per nascondere la downbar e blocccare lo scrolling
            const styleElement = document.createElement('style');
            styleElement.innerHTML = `
          /* Nasconde la barra di navigazione inferiore */
          body.detail-memory-active .fixed.bottom-0.left-0.right-0.z-50.backdrop-blur-xl {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
          }
          body.detail-memory-active {
            overflow: hidden !important;
          }
        `;
            document.head.appendChild(styleElement);

            // Mantieni riferimento allo styleElement per rimuoverlo al dismount
            return () => {
                document.body.classList.remove('detail-memory-active');
                if (styleElement.parentNode) {
                    document.head.removeChild(styleElement);
                }
            };
        }
        
        // Se la classe era già presente, rimuoviamola solo al dismount
        return () => {
            document.body.classList.remove('detail-memory-active');
            // Non rimuoviamo lo stile perché potrebbe essere stato aggiunto da un'altra istanza
        };
    }, []);

    // Chiudi il modale e torna alla home
    const handleClose = () => {
        navigate(-1);
    };

    // Gestisce il tap sulla tab
    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        setIsAtScrollTop(true); // Reset dello stato all'inizio della visualizzazione
        
        // Assicuriamo che lo scroll torni in cima quando cambiamo tab
        if (contentScrollRef.current) {
            contentScrollRef.current.scrollTop = 0;
        }
    };


    // Refs per tracciare la posizione iniziale del touch verticale
    const verticalTouchStartX = useRef(0);
    const verticalTouchEndX = useRef(0);

    // Gestione dello swipe per chiudere la pagina o espandere le info
    const handleTouchStart = (e: React.TouchEvent) => {
        // Se siamo nella tab cronologia e non siamo all'inizio dello scroll, non iniziare lo swipe
        if (activeTab === 'cronologia' && !isAtScrollTop) {
            return;
        }
        
        // Se lo swipe è iniziato sul carosello, ignoralo
        if (carouselSwipeStarted.current) {
            isSwipingRef.current = false;
            return;
        }
        
        touchStartY.current = e.touches[0].clientY;
        verticalTouchStartX.current = e.touches[0].clientX;
        touchStartTime.current = Date.now();
        isSwipingRef.current = true;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isSwipingRef.current) return;
        
        // Se siamo nella tab cronologia e non siamo all'inizio dello scroll, non gestire lo swipe
        if (activeTab === 'cronologia' && !isAtScrollTop) {
            return;
        }

        // Se lo swipe del carosello è attivo, ignora questo movimento
        if (carouselSwipeStarted.current || isCarouselSwipe.current) {
            isSwipingRef.current = false;
            return;
        }

        touchEndY.current = e.touches[0].clientY;
        verticalTouchEndX.current = e.touches[0].clientX;

        const deltaY = touchEndY.current - touchStartY.current;
        const deltaX = Math.abs(verticalTouchEndX.current - verticalTouchStartX.current);
        const deltaYAbs = Math.abs(deltaY);

        // Se il movimento orizzontale è maggiore di quello verticale, ignora (è uno swipe orizzontale)
        if (deltaX > deltaYAbs && deltaX > 10) {
            isSwipingRef.current = false;
            return;
        }

        // Swipe verso il basso: chiude la pagina o contrae le info
        if (deltaY > 0) {
            if (infoExpanded) {
                // Se le info sono espanse, riduciamo l'espansione
                const moveY = deltaY * 0.5; // Resistance per rendere il movimento più naturale
                infoY.set(Math.min(moveY - 200, 0)); // -200 perché partiamo da -200 in posizione espansa
            } else {
                // Altrimenti, prepariamoci a chiudere la pagina
                const resistance = 0.4;
                const moveY = deltaY * resistance;

                if (moveY > 50) {
                    setShowControls(false);
                }

                infoY.set(moveY);
            }
        }

        // Swipe verso l'alto: espande le informazioni
        if (deltaY < 0) {
            if (!infoExpanded) {
                // Se le info non sono ancora espanse, espandiamole
                const moveY = Math.max(deltaY, -220); // Limit the upward movement
                infoY.set(moveY);
            }
        }
    };

    const handleTouchEnd = () => {
        if (!isSwipingRef.current) return;
        
        // Se lo swipe del carosello è attivo, ignora
        if (carouselSwipeStarted.current || isCarouselSwipe.current) {
            isSwipingRef.current = false;
            return;
        }
        
        isSwipingRef.current = false;
        
        // Se siamo nella tab cronologia e non siamo all'inizio dello scroll, non gestire lo swipe
        if (activeTab === 'cronologia' && !isAtScrollTop) {
            return;
        }

        const deltaY = touchEndY.current - touchStartY.current;
        const deltaX = Math.abs(verticalTouchEndX.current - verticalTouchStartX.current);
        const deltaYAbs = Math.abs(deltaY);

        // Se il movimento orizzontale è maggiore di quello verticale, ignora
        if (deltaX > deltaYAbs && deltaX > 10) {
            return;
        }

        // Chiusura pagina (swipe verso il basso quando info non espanse)
        if (deltaY > minSwipeDistance && !infoExpanded) {
            handleClose();
        }
        // Contrazione delle info (swipe verso il basso quando info espanse)
        else if (deltaY > minSwipeDistance && infoExpanded) {
            setInfoExpanded(false);
            infoControls.start({
                y: 0,
                transition: {
                    type: 'spring',
                    damping: 20,
                    stiffness: 300,
                    velocity: 0.5
                }
            });
        }
        // Espansione info (swipe verso l'alto quando info non espanse)
        else if (deltaY < -minSwipeDistance && !infoExpanded) {
            setInfoExpanded(true);
            infoControls.start({
                y: -200,
                transition: {
                    type: 'spring',
                    damping: 20,
                    stiffness: 300,
                    velocity: 0.5
                }
            });
        }
        // Piccoli movimenti: ritorno alla posizione iniziale
        else {
            infoControls.start({
                y: infoExpanded ? -200 : 0,
                transition: {
                    type: 'spring',
                    damping: 25,
                    stiffness: 400,
                    velocity: 0.5
                }
            });
            setShowControls(true);
            infoY.set(infoExpanded ? -200 : 0);
        }
    };

    // Gestisce l'edit del ricordo
    const openEditModal = () => {
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleUpdateMemory = async (updatedData: Partial<Memory>) => {
        if (!id) return;

        try {
            await updateMemory(id, updatedData);
            // Invalida la query per ricaricare i dati aggiornati
            queryClient.invalidateQueries({ queryKey: ['memory', id] });
            closeEditModal();
        } catch (error) {
            console.error('Errore durante l\'aggiornamento del ricordo:', error);
        }
    };

    // Gestisce l'eliminazione del ricordo
    const openDeleteModal = () => {
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
    };

    const handleDelete = async () => {
        if (!id) return;

        setIsDeleting(true);
        try {
            await deleteMemory(id);
            queryClient.invalidateQueries({ queryKey: ['memories'] });
            navigate('/');
        } catch (error) {
            console.error('Errore durante l\'eliminazione:', error);
        } finally {
            setIsDeleting(false);
            closeDeleteModal();
        }
    };

    // Formatta l'intervallo di date
    const formatDateRange = (startDate: string | null, endDate: string | null) => {
        if (!startDate) return '';

        try {
            const start = format(parseISO(startDate), 'd MMM', { locale: it });

            if (!endDate) return start;

            // Se le date sono uguali, mostra solo una data
            if (format(parseISO(startDate), 'yyyy-MM-dd') === format(parseISO(endDate), 'yyyy-MM-dd')) {
                return start;
            }

            // Se il mese è lo stesso, mostra solo il giorno per la prima data
            if (format(parseISO(startDate), 'MM-yyyy') === format(parseISO(endDate), 'MM-yyyy')) {
                return `${format(parseISO(startDate), 'd')} - ${format(parseISO(endDate), 'd MMM', { locale: it })}`;
            }

            // Se i mesi sono diversi, mostra il mese per entrambe le date
            return `${start} - ${format(parseISO(endDate), 'd MMM', { locale: it })}`;
        } catch (error) {
            return '';
        }
    };

    // Naviga tra le immagini del carosello
    const handlePrevImage = useCallback(() => {
        if (carouselImages.length <= 1) return;
        setCurrentImageIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
    }, [carouselImages.length]);

    const handleNextImage = useCallback(() => {
        if (carouselImages.length <= 1) return;
        setCurrentImageIndex((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
    }, [carouselImages.length]);

    // Gestione dello swipe per navigare tra le immagini
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const touchEndX = useRef(0);
    const touchEndY = useRef(0);
    const isCarouselSwipe = useRef(false);
    const carouselSwipeStarted = useRef(false);

    const handleCarouselTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        carouselSwipeStarted.current = true;
        isCarouselSwipe.current = false;
        e.stopPropagation();
    }, []);

    const handleCarouselTouchMove = useCallback((e: React.TouchEvent) => {
        if (!carouselSwipeStarted.current) return;
        
        touchEndX.current = e.touches[0].clientX;
        touchEndY.current = e.touches[0].clientY;

        const deltaX = Math.abs(touchEndX.current - touchStartX.current);
        const deltaY = Math.abs(touchEndY.current - touchStartY.current);

        // Determina se lo swipe è principalmente orizzontale o verticale
        // Se il movimento orizzontale è maggiore del verticale, è uno swipe orizzontale
        if (deltaX > deltaY && deltaX > 10) {
            isCarouselSwipe.current = true;
            e.preventDefault(); // Previene lo scroll verticale durante swipe orizzontale
        } else if (deltaY > deltaX && deltaY > 10) {
            isCarouselSwipe.current = false;
        }

        e.stopPropagation();
    }, []);

    const handleCarouselTouchEnd = useCallback((e: React.TouchEvent) => {
        if (!carouselSwipeStarted.current) return;

        const swipeDistanceX = touchEndX.current - touchStartX.current;
        const swipeDistanceY = Math.abs(touchEndY.current - touchStartY.current);
        const swipeDistance = Math.abs(swipeDistanceX);

        // Solo se lo swipe è principalmente orizzontale e supera la distanza minima
        if (isCarouselSwipe.current && swipeDistance > minSwipeDistance && swipeDistance > swipeDistanceY) {
            if (swipeDistanceX > 0) {
                handlePrevImage();
            } else {
                handleNextImage();
            }
        }

        // Reset dei flag
        carouselSwipeStarted.current = false;
        isCarouselSwipe.current = false;
        e.stopPropagation();
    }, [handlePrevImage, handleNextImage, minSwipeDistance]);
    
    // Memoizziamo gli indicatori del carousel per evitare ri-renderizzazioni non necessarie
    const carouselIndicators = useMemo(() => {
        if (carouselImages.length <= 1) return null;
        
        return (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                {carouselImages.map((_, index) => (
                    <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all ${index === currentImageIndex
                            ? 'w-6 bg-white'
                            : 'w-1.5 bg-white/40'
                            }`}
                    />
                ))}
            </div>
        );
    }, [carouselImages.length, currentImageIndex]);

    // Memoizziamo il player Spotify per evitare ri-renderizzazioni non necessarie
    const spotifyPlayer = useMemo(() => {
        if (!memory?.song) return null;
        
        return (
            <div className="absolute left-4 right-4 bottom-4 bg-black/40 backdrop-blur-md rounded-xl overflow-hidden shadow-lg z-10">
                {isLoadingTrack ? (
                    <div className="animate-pulse h-16 bg-gray-700/50"></div>
                ) : spotifyData ? (
                    <div className="flex items-center gap-3 py-2 px-3">
                        {spotifyData.album?.images?.[0]?.url && (
                            <img
                                src={spotifyData.album.images[0].url}
                                alt={`${spotifyData.name} album cover`}
                                className="w-12 h-12 rounded-md shadow-sm"
                                loading="lazy"
                            />
                        )}
                        <div className="flex-grow min-w-0">
                            <p className="text-sm text-white font-medium truncate">{spotifyData.name}</p>
                            <p className="text-xs text-white/70 truncate">
                                {spotifyData.artists.map(artist => artist.name).join(', ')}
                            </p>
                        </div>
                        {spotifyData.external_urls?.spotify && (
                            <a
                                href={spotifyData.external_urls.spotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1DB954] text-white"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <FaSpotify className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-3 py-3 px-4">
                        <IoMusicalNotesOutline className="w-5 h-5 text-white/80" />
                        <p className="text-sm text-white truncate">{memory.song}</p>
                    </div>
                )}
            </div>
        );
    }, [memory?.song, isLoadingTrack, spotifyData]);

    // Main UI render
    if (isLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-[100000]">
                <Loader />
            </div>
        );
    }

    if (!memory) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-[100000]">
                <p className="text-center text-gray-600 dark:text-gray-400">
                    Ricordo non trovato o errore di caricamento.
                </p>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 flex flex-col overflow-hidden bg-white dark:bg-gray-900"
            style={{
                position: 'fixed',
                zIndex: 100000,
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            }}
        >
            <div
                className="absolute top-0 left-0 right-0 z-10 pointer-events-none h-[120px]"
                style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)'
                }}
            ></div>
            {/* Carosello in alto con mappa/immagini */}
            <motion.div
                className="relative w-full shrink-0"
                style={{
                    height: infoExpanded ? '35%' : '70%',
                }}
                animate={infoControls}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
                {/* Safe area per la notch */}
                <div className="absolute inset-x-0 top-0 h-[env(safe-area-inset-top)] bg-transparent"></div>

                {/* Controlli e bottoni */}
                <AnimatePresence>
                    {showControls && (
                        <motion.div
                            className="absolute top-0 left-0 right-0 z-10 px-4 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-4 flex justify-between items-center z-1000"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <button
                                onClick={handleClose}
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-lg text-white"
                            >
                                <IoChevronBack className="w-5 h-5" />
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={openEditModal}
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-lg text-white"
                                >
                                    <IoCreateOutline className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={openDeleteModal}
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-lg text-white"
                                >
                                    <IoTrashOutline className="w-5 h-5" />
                                </button>
                                <button
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-lg text-white"
                                >
                                    <IoShareOutline className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Carosello di immagini */}
                <div
                    className="w-full h-full"
                    style={{
                        touchAction: 'pan-x',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        WebkitTouchCallout: 'none'
                    }}
                    onTouchStart={handleCarouselTouchStart}
                    onTouchMove={handleCarouselTouchMove}
                    onTouchEnd={handleCarouselTouchEnd}
                >
                    {carouselImages.length > 0 ? (
                        <div 
                            className="w-full h-full relative" 
                            key={`carousel-${forceUpdate}`}
                            style={{
                                touchAction: 'pan-x',
                                userSelect: 'none',
                                WebkitUserSelect: 'none'
                            }}
                        >
                            <img
                                src={carouselImages[currentImageIndex]?.processedUrl}
                                alt={memory.title}
                                className="w-full h-full object-cover"
                                style={{
                                    touchAction: 'pan-x',
                                    userSelect: 'none',
                                    WebkitUserSelect: 'none',
                                    WebkitTouchCallout: 'none',
                                    pointerEvents: 'auto',
                                    willChange: 'transform',
                                    backfaceVisibility: 'hidden',
                                    WebkitBackfaceVisibility: 'hidden'
                                }}
                                draggable={false}
                                loading={currentImageIndex === 0 ? "eager" : "lazy"}
                                fetchPriority={currentImageIndex === 0 ? "high" : "auto"}
                                decoding={currentImageIndex === 0 ? "sync" : "async"}
                                onLoad={(e) => {
                                    // Impostare l'elemento immagine come prioritario nel DOM
                                    if (currentImageIndex === 0) {
                                        const img = e.target as HTMLImageElement;
                                        img.style.display = 'block';
                                        // Forziamo un reflow per assicurare che il blur funzioni correttamente
                                        document.body.offsetHeight;
                                        setForceUpdate(prev => prev + 1);
                                    }
                                }}
                            />
                            
                            {/* Precarica le immagini successive per rendere più fluido lo swipe */}
                            {carouselImages.length > 1 && currentImageIndex < carouselImages.length - 1 && (
                                <link 
                                    rel="prefetch" 
                                    href={carouselImages[currentImageIndex + 1]?.processedUrl} 
                                    as="image" 
                                />
                            )}

                            {/* Indicatori del carosello */}
                            {carouselIndicators}

                            {/* Bottoni di navigazione */}
                            {carouselImages.length > 1 && (
                                <>
                                    {/* Bottone freccia sinistra */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handlePrevImage();
                                        }}
                                        onTouchStart={(e) => e.stopPropagation()}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md text-white z-20 pointer-events-auto hover:bg-black/60 active:bg-black/70 transition-all"
                                        aria-label="Immagine precedente"
                                    >
                                        <IoChevronBack className="w-6 h-6" />
                                    </button>

                                    {/* Bottone freccia destra */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleNextImage();
                                        }}
                                        onTouchStart={(e) => e.stopPropagation()}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md text-white z-20 pointer-events-auto hover:bg-black/60 active:bg-black/70 transition-all"
                                        aria-label="Immagine successiva"
                                    >
                                        <IoChevronForward className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-white/70">Nessuna immagine disponibile</p>
                        </div>
                    )}
                </div>

                {/* Player Spotify (solo se presente una canzone) */}
                {spotifyPlayer}
            </motion.div>

            {/* Sezione info (che può espandersi) */}
            <motion.div
                ref={infoRef}
                className="relative w-full bg-white dark:bg-gray-900 flex flex-col flex-grow overflow-hidden z-20"
                style={{
                    y: infoY,
                    height: infoExpanded ? '90%' : '90%',
                    minHeight: '90%'
                }}
                animate={infoControls}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Pill di drag */}
                <div className="w-full h-8 flex items-center justify-center mt-2">
                    <div className="w-20 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>

                {/* Header con titolo e controllo espansione */}
                <div className="px-5 pb-2 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            {memory.title}
                        </h1>

                        {/* Info base con data e località */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            {memory.start_date && (
                                <div className="flex items-center gap-1.5">
                                    <IoCalendarOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {formatDateRange(memory.start_date, memory.end_date || null)}
                                    </span>
                                </div>
                            )}

                            {memory.location && (
                                <div className="flex items-center gap-1.5">
                                    <IoLocationOutline className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">
                                        {memory.location}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Contenuto scrollabile con padding per evitare che finisca sotto i tabs */}
                <div 
                    ref={contentScrollRef}
                    className="flex-grow overflow-auto px-5 pb-0"
                >
                    {activeTab === 'info' && (
                        <InfoRicordoMobile memory={memory} onVisitGallery={() => handleTabChange('galleria')} />
                    )}

                    {activeTab === 'galleria' && (
                        <GalleriaRicordoMobile 
                            memory={memory} 
                            onImagesUploaded={() => {
                                queryClient.invalidateQueries({ queryKey: ['memory', id] });
                                queryClient.invalidateQueries({ queryKey: ['memoryCarousel', id] });
                            }}
                        />
                    )}

                    {activeTab === 'cronologia' && (
                        <CronologiaRicordoMobile memory={memory} />
                    )}
                </div>
            </motion.div>

            {/* Tabs in fondo (fissati) - spostati fuori dal contenitore di info */}
            <div
                className="fixed bottom-0 left-0 right-0 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 z-[100020]"
                style={{
                    background: 'transparent'
                }}
            >
                <div className="flex items-center justify-center px-4">
                    <div className="inline-flex items-center rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md p-1 shadow-sm w-full">
                        <button
                            onClick={() => handleTabChange('info')}
                            className={`flex-1 py-2 px-4 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                                activeTab === 'info'
                                    ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm font-semibold'
                                    : 'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-white/10 dark:hover:bg-gray-700/20'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Info</span>
                        </button>
                        <button
                            onClick={() => handleTabChange('galleria')}
                            className={`flex-1 py-2 px-4 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                                activeTab === 'galleria'
                                    ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm font-semibold'
                                    : 'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-white/10 dark:hover:bg-gray-700/20'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Galleria</span>
                        </button>
                        <button
                            onClick={() => handleTabChange('cronologia')}
                            className={`flex-1 py-2 px-4 rounded-full text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                                activeTab === 'cronologia'
                                    ? 'bg-white dark:bg-gray-700 text-black dark:text-white shadow-sm font-semibold'
                                    : 'text-gray-600 dark:text-gray-400 bg-transparent hover:bg-white/10 dark:hover:bg-gray-700/20'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Cronologia</span>
                        </button>
                    </div>
                </div>
            </div>
            {/* Modali */}
            {isEditModalOpen && (
                <MemoryEditModal
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    memory={memory}
                    onSave={handleUpdateMemory}
                />
            )}

            {isDeleteModalOpen && (
                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={closeDeleteModal}
                    onDelete={handleDelete}
                    isDeleting={isDeleting}
                />
            )}
        </div>
    );
}