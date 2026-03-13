import { useState } from "react";
import { useListBranchFileStation, useCreateBranchFileStation, useUpdateBranchFileStation, useDeleteBranchFileStation } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2, FolderTree } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function BranchFileStation() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ username: "", password: "", groupEmail: "", branchName: "" });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListBranchFileStation();
  const createMutation = useCreateBranchFileStation();
  const updateMutation = useUpdateBranchFileStation();
  const deleteMutation = useDeleteBranchFileStation();

  const handleOpenForm = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ username: item.username, password: item.password || "", groupEmail: item.groupEmail || "", branchName: item.branchName });
    } else {
      setEditingId(null);
      setFormData({ username: "", password: "", groupEmail: "", branchName: "" });
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    const mutation = editingId ? updateMutation : createMutation;
    const args = editingId ? { id: editingId, data: formData } : { data: formData };
    
    mutation.mutate(args as any, {
      onSuccess: () => {
        toast({ title: "Success", description: "Record saved successfully." });
        queryClient.invalidateQueries({ queryKey: ["/api/branch-file-station"] });
        setIsFormOpen(false);
      }
    });
  };

  return (
    <AppLayout title="Branch File Station">
      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center text-muted-foreground">
            <FolderTree className="w-5 h-5 mr-2 text-primary" />
            <span>Manage branch file station credentials and access</span>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="w-4 h-4 mr-2" /> Add Record
          </Button>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Group Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={4} className="text-center h-32"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : data?.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.branchName}</TableCell>
                  <TableCell>{item.username}</TableCell>
                  <TableCell>{item.groupEmail || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(item)}><Edit className="w-4 h-4 text-amber-600" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      if (confirm("Delete this record?")) deleteMutation.mutate({id: item.id}, { onSuccess: () => queryClient.invalidateQueries({queryKey: ["/api/branch-file-station"]})})
                    }}><Trash2 className="w-4 h-4 text-rose-600" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? "Edit Record" : "Add Record"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Branch Name *</Label><Input value={formData.branchName} onChange={e => setFormData({...formData, branchName: e.target.value})} /></div>
            <div className="space-y-2"><Label>Username *</Label><Input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} /></div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
            <div className="space-y-2"><Label>Group Email</Label><Input value={formData.groupEmail} onChange={e => setFormData({...formData, groupEmail: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
