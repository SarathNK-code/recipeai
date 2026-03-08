import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAddUtensil,
  useDeleteUtensil,
  useGetUserUtensils,
  useUpdateUtensil,
} from "@/hooks/useQueries";
import { cn } from "@/lib/utils";
import {
  ChefHat,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Utensil } from "../backend.d";

const UTENSIL_TYPES = [
  "spoon",
  "pan",
  "pot",
  "bowl",
  "measuring",
  "utensil",
  "baking",
  "knife",
  "other",
];

const utensilEmoji: Record<string, string> = {
  spoon: "🥄",
  pan: "🍳",
  pot: "🫕",
  bowl: "🥣",
  measuring: "🥛",
  utensil: "🍴",
  baking: "🍞",
  knife: "🔪",
  other: "🧑‍🍳",
};

// Color-coded badge palette per type
const utensilTypeBadge: Record<string, string> = {
  spoon: "bg-sky-100 text-sky-700 border-sky-200",
  pan: "bg-orange-100 text-orange-700 border-orange-200",
  pot: "bg-amber-100 text-amber-700 border-amber-200",
  bowl: "bg-teal-100 text-teal-700 border-teal-200",
  measuring: "bg-violet-100 text-violet-700 border-violet-200",
  utensil: "bg-rose-100 text-rose-700 border-rose-200",
  baking: "bg-yellow-100 text-yellow-700 border-yellow-200",
  knife: "bg-red-100 text-red-700 border-red-200",
  other: "bg-muted text-muted-foreground border-border",
};

interface UtensilForm {
  name: string;
  type: string;
  size: string;
}

const emptyForm: UtensilForm = { name: "", type: "spoon", size: "" };

export function MyUtensils() {
  const { data: utensils, isLoading } = useGetUserUtensils();
  const addUtensil = useAddUtensil();
  const updateUtensil = useUpdateUtensil();
  const deleteUtensil = useDeleteUtensil();

  const [showForm, setShowForm] = useState(false);
  const [editingUtensil, setEditingUtensil] = useState<Utensil | null>(null);
  const [form, setForm] = useState<UtensilForm>(emptyForm);

  const handleOpenAdd = () => {
    setEditingUtensil(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleOpenEdit = (utensil: Utensil) => {
    setEditingUtensil(utensil);
    setForm({ name: utensil.name, type: utensil.type, size: utensil.size });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingUtensil(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.size.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (editingUtensil) {
        await updateUtensil.mutateAsync({
          id: editingUtensil.id,
          name: form.name.trim(),
          type: form.type,
          size: form.size.trim(),
        });
        toast.success("Utensil updated!");
      } else {
        await addUtensil.mutateAsync({
          name: form.name.trim(),
          type: form.type,
          size: form.size.trim(),
        });
        toast.success("Utensil added!");
      }
      handleCloseForm();
    } catch {
      toast.error("Failed to save utensil");
    }
  };

  const handleDelete = async (id: bigint, name: string) => {
    try {
      await deleteUtensil.mutateAsync(id);
      toast.success(`"${name}" removed`);
    } catch {
      toast.error("Failed to delete utensil");
    }
  };

  const isPending = addUtensil.isPending || updateUtensil.isPending;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page header with decorative background */}
      <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-card via-accent/5 to-primary/5 border border-border p-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/8 to-transparent rounded-tr-full" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Utensils className="w-5 h-5 text-accent" />
              <h1 className="font-fraunces text-3xl font-bold">My Utensils</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              Manage your kitchen tools for accurate recipe measurements
            </p>
          </div>
          <Button
            data-ocid="utensil_manager.add_button"
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Utensil
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl bg-muted h-32"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-muted via-muted-foreground/10 to-muted animate-shimmer bg-[length:200%_100%]" />
            </div>
          ))}
        </div>
      ) : !utensils || utensils.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 border border-dashed border-border rounded-2xl bg-card"
        >
          <div className="relative inline-flex items-center justify-center mb-5">
            <div className="absolute w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-xl" />
            <ChefHat className="relative w-14 h-14 text-muted-foreground/60" />
          </div>
          <h3 className="font-fraunces text-xl font-semibold mb-2">
            No utensils yet
          </h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            Add your kitchen tools to get recipe measurements tailored to your
            specific utensil sizes
          </p>
          <Button
            onClick={handleOpenAdd}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Utensil
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <AnimatePresence>
            {utensils.map((utensil, i) => (
              <motion.div
                key={utensil.id.toString()}
                data-ocid={`utensil_manager.item.${i + 1}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border p-5 shadow-card group hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  {/* Larger emoji circle with gradient */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl shadow-sm">
                    {utensilEmoji[utensil.type] || "🍴"}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      data-ocid={`utensil_manager.edit_button.${i + 1}`}
                      onClick={() => handleOpenEdit(utensil)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      aria-label="Edit utensil"
                    >
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      data-ocid={`utensil_manager.delete_button.${i + 1}`}
                      onClick={() => handleDelete(utensil.id, utensil.name)}
                      disabled={deleteUtensil.isPending}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                      aria-label="Delete utensil"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-base leading-tight mb-2">
                  {utensil.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {/* Color-coded type badge */}
                  <span
                    className={cn(
                      "text-xs px-2.5 py-0.5 rounded-full border font-medium capitalize",
                      utensilTypeBadge[utensil.type] || utensilTypeBadge.other,
                    )}
                  >
                    {utensil.type}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 bg-accent/10 rounded-full text-accent font-medium border border-accent/20">
                    {utensil.size}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={showForm}
        onOpenChange={(open) => !open && handleCloseForm()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-fraunces">
              {editingUtensil ? "Edit Utensil" : "Add New Utensil"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="utensil-name">Name</Label>
              <Input
                id="utensil-name"
                data-ocid="utensil_manager.name_input"
                placeholder="e.g. My Large Frying Pan"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="utensil-type">Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
              >
                <SelectTrigger
                  id="utensil-type"
                  data-ocid="utensil_manager.type_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UTENSIL_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {utensilEmoji[t] || "🍴"} {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="utensil-size">Size / Capacity</Label>
              <Input
                id="utensil-size"
                data-ocid="utensil_manager.size_input"
                placeholder="e.g. 240ml, 30cm, 2 cups"
                value={form.size}
                onChange={(e) =>
                  setForm((f) => ({ ...f, size: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              data-ocid="utensil_manager.save_button"
              onClick={handleSave}
              disabled={isPending}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isPending ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCloseForm}
              className="flex gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
