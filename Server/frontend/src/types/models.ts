export type Position = {
    latitude: number;
    longitude: number;
    placeName?: string;
};

export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
    biography?: string;
    coupleId: string;
    themePreference: 'light' | 'dark';
    createdMemories: string[];
    uploadedImages: string[];
    proposedIdeas: string[];
    profilePicture?: string;
};

export type Couple = {
    id: string;
    name: string;
    createdAt: string;
    members: string[];
    sharedMemories: string[];
    sharedImages: string[];
    sharedIdeas: string[];
};

export type Memory = {
    id: string;
    title: string;
    type: 'Viaggio' | 'Evento' | 'Semplice';
    startDate: string;
    endDate?: string;
    associatedSong?: string;
    location?: Position;
    tags: ('Compleanno' | 'Regalo' | 'Anniversario')[];
    creatorId: string;
    images: string[];
};

export type Image = {
    id: string;
    fileName: string;
    takenAt: string;
    location?: Position;
    type: 'Paesaggio' | 'Coppia' | 'Persona' | 'Evento';
    uploaderId: string;
    memoryId?: string;
    url: string;
    uploadDate: string;
};

export type Idea = {
    id: string;
    title: string;
    description: string;
    type: 'Viaggio' | 'Ristorante' | 'Generica' | 'Challenge';
    createdAt: string;
    status: 'Completata' | 'Da fare';
    completedAt?: string;
    creatorId: string;
};
