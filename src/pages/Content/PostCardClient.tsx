import { useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { MoreDotIcon, PencilIcon, TrashBinIcon, PaperPlaneIcon } from "../../icons";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import { Client, Format, Media, Post, PostMediaLink } from "./ContentKanban";

interface PostCardProps {
    post: Post;
    formats?: Format[];
    clients?: Client[];
    medias?: Media[];
    postMedias?: PostMediaLink[];
    movePost?: (id: number, date: string) => void;
    onEdit: (post: Post) => void;
    onDelete: (post: Post) => void;
    onPublish?: (post: Post) => void;
}

export default function PostCard({ post, formats, clients, medias, postMedias, onEdit, onDelete, onPublish }: PostCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: "POST",
        item: { id: post.id, date: post.post_date },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    drag(ref);

    const getStatusLabel = (status?: number) => {
        switch (status) {
            case 1: return { label: "A CRIAR", color: "bg-gray-100 text-gray-600" };
            case 2: return { label: "RASCUNHO", color: "bg-gray-200 text-gray-800" };
            case 3: return { label: "AGENDADO", color: "bg-blue-100 text-blue-800" };
            case 4: return { label: "ENVIADO", color: "bg-indigo-100 text-indigo-800" };
            case 5: return { label: "PENDENTE", color: "bg-orange-100 text-orange-800" };
            case 6: return { label: "PAUSADO", color: "bg-yellow-100 text-yellow-800" };
            case 7: return { label: "FINALIZADO", color: "bg-teal-100 text-teal-800" };
            case 8: return { label: "APROVADO", color: "bg-cyan-100 text-cyan-800" };
            case 9: return { label: "ENVIANDO", color: "bg-purple-100 text-purple-800" };
            case 10: return { label: "PUBLICADO", color: "bg-green-100 text-green-800" };
            case 11: return { label: "CANCELADO", color: "bg-red-100 text-red-800" };
            case 12: return { label: "CORREÇÃO", color: "bg-red-100 text-red-800" };
            default: return { label: "DESCONHECIDO", color: "bg-gray-100 text-gray-800" };
        }
    };

    const statusInfo = getStatusLabel(post.status);
    const formatName = formats?.find(f => f.id === post.post_format)?.name;
    const platformName = formats?.find(f => f.id === post.post_format)?.platform;

    // Resolve Client Name
    const clientName = clients?.find(c => c.id === post.client)?.name || "Cliente";

    // Resolve Media
    // 1. Check for legacy single media field
    // 2. Check for linked postMedias (preferred)
    let displayMedia: Media | string | null = null;
    let displayMediaType: 'image' | 'video' | 'pdf' | 'unknown' = 'unknown';

    if (postMedias && medias) {
        // Find FIRST linked media
        const link = postMedias.find(pm => pm.post === post.id);
        if (link) {
            const mediaObj = medias.find(m => m.id === link.media);
            if (mediaObj) {
                displayMedia = mediaObj;
                // Determine type
                const ext = mediaObj.media.split('?')[0].split('.').pop()?.toLowerCase();
                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) displayMediaType = 'image';
                else if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext || '')) displayMediaType = 'video';
                else if (['pdf'].includes(ext || '')) displayMediaType = 'pdf';
            }
        }
    }

    if (!displayMedia && post.media) {
        displayMedia = post.media;
        const ext = post.media.split('?')[0].split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) displayMediaType = 'image';
        else if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext || '')) displayMediaType = 'video';
        else if (['pdf'].includes(ext || '')) displayMediaType = 'pdf';
    }


    const renderMediaContent = () => {
        if (!displayMedia) {
            return (
                <div className="h-24 w-full bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-400">Sem mídia</span>
                </div>
            );
        }

        const url = typeof displayMedia === 'string' ? displayMedia : displayMedia.media;

        switch (displayMediaType) {
            case 'video':
                return (
                    <div className="relative w-full bg-black rounded-lg overflow-hidden flex items-center justify-center group">
                        <video src={url} className="w-full h-auto object-cover opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                                    <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                );
            case 'pdf':
                return (
                    <div className="h-24 w-full bg-red-50 dark:bg-white/5 rounded-lg border border-red-100 dark:border-red-500/20 flex flex-col items-center justify-center p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center">
                            {url.split('/').pop()}
                        </span>
                    </div>
                );
            default: // image
                return (
                    <div className="w-full rounded-lg overflow-hidden bg-gray-100">
                        <img src={url} alt="Media" className="w-full h-auto object-cover" />
                    </div>
                );
        }
    };


    return (
        <div
            ref={ref}
            className={`relative p-4 mb-3 bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700 shadow-sm cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50" : "opacity-100"
                }`}
            onClick={() => onEdit(post)}
        >
            <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
                <button
                    className="dropdown-toggle text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <MoreDotIcon className="w-5 h-5 rotate-90" />
                </button>
                <Dropdown
                    isOpen={isDropdownOpen}
                    onClose={() => setIsDropdownOpen(false)}
                    className="w-40 right-0 top-full"
                >
                    {onPublish && post.status !== 10 && (
                        <DropdownItem
                            className="flex items-center gap-2 px-4 py-2 text-sm text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-white/5 cursor-pointer"
                            onClick={() => { setIsDropdownOpen(false); onPublish(post); }}
                        >
                            <PaperPlaneIcon className="w-4 h-4" />
                            Publicar
                        </DropdownItem>
                    )}
                    <DropdownItem
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 cursor-pointer"
                        onClick={() => { setIsDropdownOpen(false); onEdit(post); }}
                    >
                        <PencilIcon className="w-4 h-4" />
                        Editar
                    </DropdownItem>
                    <DropdownItem
                        className="flex items-center gap-2 px-4 py-2 text-sm text-error-500 hover:bg-red-50 dark:hover:bg-white/5 cursor-pointer"
                        onClick={() => { setIsDropdownOpen(false); onDelete(post); }}
                    >
                        <TrashBinIcon className="w-4 h-4" />
                        Excluir
                    </DropdownItem>
                </Dropdown>
            </div>

            {/* Format Badge */}
            {(formatName || platformName) && (
                <div className="mb-2 flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                    <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">
                        {platformName && formatName ? `${platformName} - ${formatName}` : (platformName || formatName)}
                    </span>
                </div>
            )}

            {/* Title: Client Name */}
            <h4 className="mb-3 text-sm font-bold text-gray-800 dark:text-white/90 pr-6 truncate">
                {clientName}
            </h4>

            {/* Content: Media (Replaces text description) */}
            <div className="mb-3">
                {renderMediaContent()}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400 mt-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusInfo.color}`}>
                    {statusInfo.label}
                </span>
                <span>{post.post_time.slice(0, 5)}</span>
            </div>

            {/* Template Link — shown when post was created from editorial calendar */}
            {post.template_link && (
                <a
                    href={post.template_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 flex items-center gap-1.5 w-full justify-center py-1.5 px-3 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[11px] font-semibold hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Ver Template
                    {post.template_page && (
                        <span className="ml-1 bg-brand-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none">
                            p.{post.template_page}
                        </span>
                    )}
                </a>
            )}
        </div>
    );
}
