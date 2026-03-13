import { useState } from "react";
import { useListAcronis, useCreateAcronis, useUpdateAcronis, useDeleteAcronis } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2, Database } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const emptyForm = { employeeId: "", employeeName: "", department: "", designation: "", email: "", hostname: "", backupPlan: "", monthlyFullBackupDate: "", backupPlanName: "", backupTime: "", incrementalBackup: "", cpuPriority: "Normal", installationStatus: "Pending", policyAssign: "", backupStatus: "Active", leftEncryptionPassword: "" };

export default function Acronis() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ ...emptyForm });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListAcronis();
  const createMutation = useCreateAcronis();
  const updateMutation = useUpdateAcronis();
  const deleteMutation = useDeleteAcronis();

  const handleOpenForm = (item?: any) => {
    if (item) {
      setEditingId(item.id);
      setFormData({ employeeId: item.employeeId, employeeName: item.employeeName, department: item.department || "", designation: item.designation || "", email: item.email || "", hostname: item.hostname || "", backupPlan: item.backupPlan || "", monthlyFullBackupDate: item.monthlyFullBackupDate || "", backupPlanName: item.backupPlanName || "", backupTime: item.backupTime || "", incrementalBackup: item.incrementalBackup || "", cpuPriority: item.cpuPriority || "Normal", installationStatus: item.installationStatus || "Pending", policyAssign: item.policyAssign || "", backupStatus: item.backupStatus || "Active", leftEncryptionPassword: "" });
    } else {
      setEditingId(null);
      setFormData({ ...emptyForm });
    }
    setIsFormOpen(true);
  };

  const f = (field: keyof typeof emptyForm, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData } as any, {
        onSuccess: () => { toast({ title: "Updated" }); queryClient.invalidateQueries({ queryKey: ["/api/acronis"] }); setIsFormOpen(false); }
      });
    } else {
      createMutation.mutate({ data: formData } as any, {
        onSuccess: () => { toast({ title: "Created" }); queryClient.invalidateQueries({ queryKey: ["/api/acronis"] }); setIsFormOpen(false); }
      });
    }
  };

  return (
    <AppLayout title="Acronis Backup">
      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center text-muted-foreground"><Database className="w-5 h-5 mr-2 text-primary" /><span>Manage Acronis backup configurations</span></div>
          <Button onClick={() => handleOpenForm()}><Plus className="w-4 h-4 mr-2" /> Add Record</Button>
        </div>
        <div className="border rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Backup Plan</TableHead>
                <TableHead>Installation</TableHead>
                <TableHead>Backup Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center h-32"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : !data?.length ? (
                <TableRow><TableCell colSpan={7} className="text-center h-32 text-muted-foreground">No Acronis records found</TableCell></TableRow>
              ) : data.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.employeeId}</TableCell>
                  <TableCell>{item.employeeName}</TableCell>
                  <TableCell>{item.department || '-'}</TableCell>
                  <TableCell>{item.backupPlan || '-'}</TableCell>
                  <TableCell><Badge variant={item.installationStatus === 'Installed' ? 'default' : 'secondary'}>{item.installationStatus || '-'}</Badge></TableCell>
                  <TableCell><Badge variant={item.backupStatus === 'Active' ? 'default' : 'destructive'}>{item.backupStatus || '-'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(item)}><Edit className="w-4 h-4 text-amber-600" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete?")) deleteMutation.mutate({ id: item.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/acronis"] }) }); }}><Trash2 className="w-4 h-4 text-rose-600" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? "Edit Acronis Record" : "Add Acronis Record"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Employee ID *</Label><Input value={formData.employeeId} onChange={e => f('employeeId', e.target.value)} /></div>
              <div className="space-y-2"><Label>Employee Name *</Label><Input value={formData.employeeName} onChange={e => f('employeeName', e.target.value)} /></div>
              <div className="space-y-2"><Label>Department</Label><Input value={formData.department} onChange={e => f('department', e.target.value)} /></div>
              <div className="space-y-2"><Label>Designation</Label><Input value={formData.designation} onChange={e => f('designation', e.target.value)} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={formData.email} onChange={e => f('email', e.target.value)} /></div>
              <div className="space-y-2"><Label>Hostname</Label><Input value={formData.hostname} onChange={e => f('hostname', e.target.value)} /></div>
              <div className="space-y-2"><Label>Backup Plan</Label><Input value={formData.backupPlan} onChange={e => f('backupPlan', e.target.value)} /></div>
              <div className="space-y-2"><Label>Backup Plan Name</Label><Input value={formData.backupPlanName} onChange={e => f('backupPlanName', e.target.value)} /></div>
              <div className="space-y-2"><Label>Monthly Full Backup Date</Label><Input value={formData.monthlyFullBackupDate} onChange={e => f('monthlyFullBackupDate', e.target.value)} /></div>
              <div className="space-y-2"><Label>Backup Time</Label><Input value={formData.backupTime} onChange={e => f('backupTime', e.target.value)} /></div>
              <div className="space-y-2"><Label>Incremental Backup</Label><Input value={formData.incrementalBackup} onChange={e => f('incrementalBackup', e.target.value)} /></div>
              <div className="space-y-2"><Label>CPU Priority</Label>
                <Select value={formData.cpuPriority} onValueChange={v => f('cpuPriority', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Low">Low</SelectItem><SelectItem value="Normal">Normal</SelectItem><SelectItem value="High">High</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Installation Status</Label>
                <Select value={formData.installationStatus} onValueChange={v => f('installationStatus', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Pending">Pending</SelectItem><SelectItem value="Installed">Installed</SelectItem><SelectItem value="Failed">Failed</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Policy Assign</Label><Input value={formData.policyAssign} onChange={e => f('policyAssign', e.target.value)} /></div>
              <div className="space-y-2"><Label>Backup Status</Label>
                <Select value={formData.backupStatus} onValueChange={v => f('backupStatus', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem><SelectItem value="Failed">Failed</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2"><Label>Left Encryption Password</Label><Input type="password" value={formData.leftEncryptionPassword} onChange={e => f('leftEncryptionPassword', e.target.value)} /></div>
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
