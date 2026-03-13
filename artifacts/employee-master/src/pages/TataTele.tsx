import { useState } from "react";
import { useListTataTele, useCreateTataTele, useUpdateTataTele, useDeleteTataTele } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2, PhoneCall } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const emptyForm = { employeeId: "", employeeName: "", department: "", designation: "", mobileNumber: "", simNumber: "", plan: "", status: "Active" };

export default function TataTele() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListTataTele();
  const createMutation = useCreateTataTele();
  const updateMutation = useUpdateTataTele();
  const deleteMutation = useDeleteTataTele();

  const handleOpenForm = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ employeeId: item.employeeId, employeeName: item.employeeName, department: item.department || "", designation: item.designation || "", mobileNumber: item.mobileNumber || "", simNumber: item.simNumber || "", plan: item.plan || "", status: item.status || "Active" });
    } else {
      setEditingId(null);
      setFormData({ ...emptyForm });
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData } as any, {
        onSuccess: () => { toast({ title: "Updated" }); queryClient.invalidateQueries({ queryKey: ["/api/tata-tele"] }); setIsFormOpen(false); }
      });
    } else {
      createMutation.mutate({ data: formData } as any, {
        onSuccess: () => { toast({ title: "Created" }); queryClient.invalidateQueries({ queryKey: ["/api/tata-tele"] }); setIsFormOpen(false); }
      });
    }
  };

  return (
    <AppLayout title="Tata Tele">
      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center text-muted-foreground"><PhoneCall className="w-5 h-5 mr-2 text-primary" /><span>Manage Tata Tele SIM and mobile assignments</span></div>
          <Button onClick={() => handleOpenForm()}><Plus className="w-4 h-4 mr-2" /> Add Record</Button>
        </div>
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>SIM Number</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center h-32"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : !data?.length ? (
                <TableRow><TableCell colSpan={8} className="text-center h-32 text-muted-foreground">No Tata Tele records found</TableCell></TableRow>
              ) : data.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.employeeId}</TableCell>
                  <TableCell>{item.employeeName}</TableCell>
                  <TableCell>{item.department || '-'}</TableCell>
                  <TableCell>{item.mobileNumber || '-'}</TableCell>
                  <TableCell>{item.simNumber || '-'}</TableCell>
                  <TableCell>{item.plan || '-'}</TableCell>
                  <TableCell><Badge variant={item.status === 'Active' ? 'default' : 'secondary'}>{item.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(item)}><Edit className="w-4 h-4 text-amber-600" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: item.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/tata-tele"] }) }); }}><Trash2 className="w-4 h-4 text-rose-600" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit Tata Tele Record" : "Add Tata Tele Record"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Employee ID *</Label><Input value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} /></div>
              <div className="space-y-2"><Label>Employee Name *</Label><Input value={formData.employeeName} onChange={e => setFormData({ ...formData, employeeName: e.target.value })} /></div>
              <div className="space-y-2"><Label>Department</Label><Input value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} /></div>
              <div className="space-y-2"><Label>Designation</Label><Input value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} /></div>
              <div className="space-y-2"><Label>Mobile Number</Label><Input value={formData.mobileNumber} onChange={e => setFormData({ ...formData, mobileNumber: e.target.value })} /></div>
              <div className="space-y-2"><Label>SIM Number</Label><Input value={formData.simNumber} onChange={e => setFormData({ ...formData, simNumber: e.target.value })} /></div>
              <div className="space-y-2"><Label>Plan</Label><Input value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })} /></div>
              <div className="space-y-2"><Label>Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
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
