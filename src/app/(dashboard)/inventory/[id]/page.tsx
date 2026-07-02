"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { InventoryService } from "@/services/InventoryService";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InventoryLibrary, InventoryItem } from "@/lib/db";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import Link from "next/link";

export default function InventoryLibraryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { workspaceId, inventoryLibraries, refreshData } = useAppStore();
  
  const [library, setLibrary] = useState<InventoryLibrary | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [editingName, setEditingName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!workspaceId) return;
      const lib = inventoryLibraries.find(l => l.id === params.id);
      if (lib) {
        setLibrary(lib);
        setEditingName(lib.name);
        const fetchedItems = await InventoryService.getItems(lib.id);
        setItems(fetchedItems);
      }
      setIsLoading(false);
    };
    loadData();
  }, [params.id, workspaceId, inventoryLibraries]);

  const handleNameSave = async () => {
    if (editingName.trim() && editingName !== library?.name && library) {
      await InventoryService.updateLibrary(library.id, { name: editingName.trim() });
      await refreshData();
      toast('Library renamed', 'success');
    }
  };

  const handleDeleteLibrary = async () => {
    if (library) {
      await InventoryService.deleteLibrary(library.id);
      await refreshData();
      toast('Library deleted', 'success');
      router.push('/inventory');
    }
  };

  const handleAddItem = async () => {
    if (!workspaceId || !library) return;
    const newItem = await InventoryService.addItem(workspaceId, library.id, "");
    setItems([...items, newItem]);
  };

  const handleUpdateItem = async (id: string, text: string) => {
    await InventoryService.updateItem(id, text);
    setItems(items.map(i => i.id === id ? { ...i, text } : i));
  };

  const handleDeleteItem = async (id: string) => {
    await InventoryService.deleteItem(id);
    setItems(items.filter(i => i.id !== id));
    toast('Item deleted', 'success');
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <LoadingSkeleton variant="text" className="h-10 w-48 mb-2" />
        <LoadingSkeleton variant="page" />
      </div>
    );
  }

  if (!library) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center py-24">
        <h1 className="text-2xl font-semibold mb-2">Library not found</h1>
        <p className="text-[var(--muted)] mb-6">This library may have been deleted or you don&apos;t have access.</p>
        <Link href="/inventory" className="text-blue-500 hover:underline">Return to Inventory</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3 w-full">
          <button type="button" 
            onClick={() => router.push('/inventory')}
            className="p-2 -ml-2 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] rounded-md transition"
            aria-label="Back to inventory"
          >
            <ArrowLeft size={20} />
          </button>
          <input
            aria-label="Library name"
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="text-3xl font-semibold tracking-tight bg-transparent border-none outline-none focus:ring-0 w-full"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button type="button" 
            onClick={() => setIsDeleting(true)}
            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition"
            title="Delete Library"
            aria-label="Delete library"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="group bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex gap-3 focus-within:border-[var(--text)] transition-colors shadow-sm">
            <div className="pt-2 text-[var(--muted)] cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical size={16} />
            </div>
            <div className="flex-1 space-y-2">
              <textarea
                aria-label="Inventory item text"
                value={item.text}
                onChange={(e) => {
                  const newItems = [...items];
                  newItems[index].text = e.target.value;
                  setItems(newItems);
                }}
                onBlur={(e) => handleUpdateItem(item.id, e.target.value)}
                placeholder="Write your content snippet here..."
                className="w-full min-h-[100px] bg-transparent border-none outline-none resize-y text-[var(--text)] placeholder:text-[var(--muted)]"
              />
            </div>
            <div className="pt-1">
              <button type="button" 
                onClick={() => handleDeleteItem(item.id)}
                className="p-1.5 text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 rounded-md transition opacity-0 group-hover:opacity-100"
                aria-label="Delete inventory item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        
        <button type="button" 
          onClick={handleAddItem}
          className="w-full p-4 border border-[var(--border)] border-dashed rounded-2xl text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--text)] hover:bg-[var(--surface)] transition flex flex-col items-center justify-center gap-2"
        >
          <Plus size={24} />
          <span className="font-medium">Add New Item</span>
        </button>
      </div>

      <ConfirmDialog
        isOpen={isDeleting}
        title="Delete Library?"
        message={`Are you sure you want to delete "${library.name}"? All items inside will be permanently lost.`}
        confirmLabel="Delete Library"
        isDestructive
        onConfirm={handleDeleteLibrary}
        onCancel={() => setIsDeleting(false)}
      />
    </div>
  );
}
