import React from 'react';

/**
 * Funzione che trova gli URL in un testo e li converte in link cliccabili.
 * @param text Il testo da processare
 * @returns Un array di stringhe e componenti React
 */
export function linkify(text: string): React.ReactNode {
    if (!text) return text;

    // Regex per trovare URL che iniziano con http://, https:// o www.
    const urlRegex = /((?:https?:\/\/|www\.)[^\s]+[^\s.,!?;:])/g;

    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
        if (part.match(urlRegex)) {
            const href = part.startsWith('www.') ? `https://${part}` : part;
            return (
                <a
                    key={index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pwa-link text-primary-500 hover:underline break-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {part}
                </a>
            );
        }
        return part;
    });
}
