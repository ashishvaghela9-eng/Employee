import { useState } from "react";
import { useListAssetcuez, useCreateAssetcuez, useUpdateAssetcuez, useDeleteAssetcuez } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2, MonitorSmartphone } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AssetCuez() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ employeeId: "", firstName: "", lastName: "", contactNumber: "", activationStatus: "" });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListAssetcuez();
  const createMutation = useCreateAssetcuez();
  const updateMutation = useUpdateAssetcuez();
  const deleteMutation = useDeleteAssetcuez();

  const handleOpenForm = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ employeeId: item.employeeId, firstName: item.firstName, lastName: item.lastName || "", contactNumber: item.contactNumber || "", activationStatus: item.activationStatus || "" });
    } else {
      setEditingId(null);
      setFormData({ employeeId: "", firstName: "", lastName: "", contactNumber: "", activationStatus: "" });
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    const mutation = editingId ? updateMutation : createMutation;
    const args = editingId ? { id: editingId, data: formData } : { data: formData };
    
    mutation.mutate(args as any, {
      onSuccess: () => {
        toast({ title: "Success", description: "Record saved successfully." });
        queryClient.invalidateQueries({ queryKey: ["/api/assetcuez"] });
        setIsFormOpen(false);
      }
    });
  };

  return (
    <AppLayout title="AssetCuez">
      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center text-muted-foreground">
            <MonitorSmartphone className="w-5 h-5 mr-2 text-primary" />
            <span>Manage AssetCuez assignments</span>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="w-4 h-4 mr-2" /> Add Record
          </Button>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Emp ID</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center h-32"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : data?.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.employeeId}</TableCell>
                  <TableCell>{item.firstName}</TableCell>
                  <TableCell>{item.lastName || '-'}</TableCell>
                  <TableCell>{item.contactNumber || '-'}</TableCell>
                  <TableCell>{item.activationStatus || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(item)}><Edit className="w-4 h-4 text-amber-600" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      if (confirm("Delete this record?")) deleteMutation.mutate({id: item.id}, { onSuccess: () => queryClient.invalidateQueries({queryKey: ["/api/assetcuez"]})})
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
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2"><Label>Employee ID *</Label><Input value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})} /></div>
            <div className="space-y-2"><Label>First Name *</Label><Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} /></div>
            <div className="space-y-2"><Label>Last Name</Label><Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} /></div>
            <div className="space-y-2"><Label>Contact Number</Label><Input value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} /></div>
            <div className="col-span-2 space-y-2"><Label>Activation Status</Label><Input value={formData.activationStatus} onChange={e => setFormData({...formData, activationStatus: e.target.value})} /></div>
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
