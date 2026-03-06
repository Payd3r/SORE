import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { isPwa } from '../utils/isPwa';

const IsPwaContext = createContext<boolean>(false);

export function IsPwaProvider({ children }: { children: ReactNode }) {
    const [isPwaMode, setIsPwaMode] = useState<boolean>(isPwa());

    useEffect(() => {
        const media = window.matchMedia('(display-mode: standalone), (display-mode: fullscreen)');
        const handler = () => setIsPwaMode(isPwa());
        media.addEventListener('change', handler);
        return () => media.removeEventListener('change', handler);
    }, []);

    return (
        <IsPwaContext.Provider value={isPwaMode}>
            {children}
        </IsPwaContext.Provider>
    );
}

/** Hook: leggi isPwa da context — zero listener ridondanti */
export function useIsPwaContext(): boolean {
    return useContext(IsPwaContext);
}
