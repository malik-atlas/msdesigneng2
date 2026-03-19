import Flatpickr from "react-flatpickr";
import { Portuguese } from "flatpickr/dist/l10n/pt";

import { Modal } from "../../components/ui/modal";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Button from "../../components/ui/button/Button";
import { Format } from "./ContentKanban";

import Select from "../../components/form/Select";

interface CreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    loading: boolean;
    formats: Format[];
    mediaFiles?: File[];
    clients?: { id: number; name: string }[];
    selectedClient?: string | number;
    onClientChange?: (val: string) => void;
    userRole?: string;
}

export default function CreatePostModal({
    isOpen,
    onClose,
    onSubmit,
    formData,
    handleInputChange,
    handleFileChange,
    loading,
    formats,
    mediaFiles = [],
    clients = [],
    selectedClient,
    onClientChange,
    userRole
}: CreatePostModalProps) {
    const isClient = userRole === 'client';
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] m-4">
            <div className="w-full bg-white rounded-2xl p-6 dark:bg-gray-900">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Criar Novo Post</h3>
                <form onSubmit={onSubmit} className="space-y-4">
                    {!isClient && clients && onClientChange && (
                        <div>
                            <Label>Cliente</Label>
                            <Select
                                options={clients.map(c => ({ value: String(c.id), label: c.name }))}
                                placeholder="Selecione um cliente"
                                defaultValue={String(selectedClient || '')}
                                onChange={onClientChange}
                                className="w-full"
                            />
                        </div>
                    )}
                    <div>
                        <Label>Assunto</Label>
                        <Input name="subject" value={formData.subject} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <Label>Conteúdo</Label>
                        <textarea
                            name="content"
                            rows={4}
                            className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            value={formData.content}
                            onChange={handleInputChange as any}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Data</Label>
                            <Flatpickr
                                value={formData.post_date}
                                onChange={([date]) => {
                                    const value = date ? date.toISOString().split('T')[0] : "";
                                    handleInputChange({ target: { name: 'post_date', value } } as any);
                                }}
                                options={{
                                    locale: Portuguese,
                                    dateFormat: "Y-m-d",
                                    altInput: true,
                                    altFormat: "d/m/Y",
                                }}
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Selecione a data"
                            />
                        </div>
                        <div>
                            <Label>Hora</Label>
                            <Flatpickr
                                value={formData.post_time}
                                onChange={([date]) => {
                                    // Manually construct HH:mm
                                    if (date) {
                                        const hours = String(date.getHours()).padStart(2, '0');
                                        const minutes = String(date.getMinutes()).padStart(2, '0');
                                        const value = `${hours}:${minutes}`;
                                        handleInputChange({ target: { name: 'post_time', value } } as any);
                                    } else {
                                        handleInputChange({ target: { name: 'post_time', value: "" } } as any);
                                    }
                                }}
                                options={{
                                    enableTime: true,
                                    noCalendar: true,
                                    dateFormat: "H:i",
                                    time_24hr: true,
                                    locale: Portuguese,
                                }}
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                placeholder="Selecione a hora"
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Formato</Label>
                        <select
                            name="post_format"
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-brand-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            value={formData.post_format}
                            onChange={handleInputChange as any}
                            required
                        >
                            <option value="" disabled>Selecione...</option>
                            {formats.map(f => (
                                <option key={f.id} value={f.id}>{f.platform} - {f.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label>Mídias (Arquivos)</Label>
                        <div className="relative">
                            <input
                                type="file"
                                multiple
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-500/10 dark:file:text-brand-400"
                                onChange={handleFileChange}
                            />
                        </div>
                        {mediaFiles.length > 0 && (
                            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                <p className="font-medium mb-1">Arquivos selecionados:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    {mediaFiles.map((file, idx) => (
                                        <li key={idx}>{file.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
                        <Button type="submit" disabled={loading}>{loading ? "Criando..." : "Criar Post"}</Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
