import { useState } from "react";
import { useListSystemUsers, useCreateSystemUser, useUpdateSystemUser, useDeleteSystemUser } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2, UserCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function SystemUsers() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "User" });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListSystemUsers();
  const createMutation = useCreateSystemUser();
  const updateMutation = useUpdateSystemUser();
  const deleteMutation = useDeleteSystemUser();

  const handleOpenForm = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ name: item.name, email: item.email, password: "", role: item.role });
    } else {
      setEditingId(null);
      setFormData({ name: "", email: "", password: "", role: "User" });
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    const payload = { ...formData };
    if (editingId && !payload.password) delete (payload as any).password; // Don't send empty pass on update
    
    const mutation = editingId ? updateMutation : createMutation;
    const args = editingId ? { id: editingId, data: payload } : { data: payload };
    
    mutation.mutate(args as any, {
      onSuccess: () => {
        toast({ title: "Success", description: "User saved successfully." });
        queryClient.invalidateQueries({ queryKey: ["/api/system-users"] });
        setIsFormOpen(false);
      }
    });
  };

  return (
    <AppLayout title="System Admin Users">
      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center text-muted-foreground">
            <UserCircle className="w-5 h-5 mr-2 text-primary" />
            <span>Manage people who can log into this HR portal</span>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="w-4 h-4 mr-2" /> Add User
          </Button>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center h-32"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : data?.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    <Badge variant={item.role === 'Admin' ? 'default' : 'secondary'}>{item.role}</Badge>
                  </TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(item)}><Edit className="w-4 h-4 text-amber-600" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      if (confirm("Delete this user?")) deleteMutation.mutate({id: item.id}, { onSuccess: () => queryClient.invalidateQueries({queryKey: ["/api/system-users"]})})
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
          <DialogHeader><DialogTitle>{editingId ? "Edit User" : "Add User"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div className="space-y-2"><Label>{editingId ? "Password (leave blank to keep current)" : "Password *"}</Label><Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} /></div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={formData.role} onValueChange={v => setFormData({...formData, role: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
