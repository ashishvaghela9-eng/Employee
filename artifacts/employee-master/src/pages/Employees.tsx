import { useState } from "react";
import { useListEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, useUpdateEmployeeAccess, Employee, useImportEmployees } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, Upload, Download, Edit, Eye, Trash2, Loader2, FileSpreadsheet } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Papa from "papaparse";

export default function Employees() {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAccessOpen, setIsAccessOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: employees, isLoading } = useListEmployees({ search: search || undefined });
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();
  const accessMutation = useUpdateEmployeeAccess();
  const importMutation = useImportEmployees();

  // Form State
  const [formData, setFormData] = useState<any>({
    employeeCode: "", name: "", status: "Active", department: "", designation: "",
    contactNumber: "", state: "", branch: "", joiningDate: "", email: "",
    requester: "", approver: "", creator: "", exitInitiator: "", exitDate: "", userExitStatus: "No"
  });

  // Access State
  const [accessData, setAccessData] = useState<any>({});

  const handleOpenForm = (emp?: Employee) => {
    if (emp) {
      setEditingId(emp.id);
      setFormData({
        employeeCode: emp.employeeCode, name: emp.name, status: emp.status,
        department: emp.department || "", designation: emp.designation || "",
        contactNumber: emp.contactNumber || "", state: emp.state || "", branch: emp.branch || "",
        joiningDate: emp.joiningDate || "", email: emp.email || "", requester: emp.requester || "",
        approver: emp.approver || "", creator: emp.creator || "", exitInitiator: emp.exitInitiator || "",
        exitDate: emp.exitDate || "", userExitStatus: emp.userExitStatus || "No"
      });
    } else {
      setEditingId(null);
      setFormData({
        employeeCode: "", name: "", status: "Active", department: "", designation: "",
        contactNumber: "", state: "", branch: "", joiningDate: "", email: "",
        requester: "", approver: "", creator: "", exitInitiator: "", exitDate: "", userExitStatus: "No"
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData }, {
        onSuccess: () => {
          toast({ title: "Updated", description: "Employee updated successfully." });
          queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
          setIsFormOpen(false);
        }
      });
    } else {
      createMutation.mutate({ data: formData }, {
        onSuccess: () => {
          toast({ title: "Created", description: "Employee created successfully." });
          queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
          setIsFormOpen(false);
        }
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Deleted", description: "Employee deleted." });
          queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
        }
      });
    }
  };

  const handleOpenAccess = (emp: Employee) => {
    setSelectedEmp(emp);
    setAccessData(emp.access || {});
    setIsAccessOpen(true);
  };

  const handleSaveAccess = () => {
    if (!selectedEmp) return;
    accessMutation.mutate({ id: selectedEmp.id, data: { access: accessData } }, {
      onSuccess: () => {
        toast({ title: "Access Updated", description: "System access checklist saved." });
        queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
        setIsAccessOpen(false);
      }
    });
  };

  const handleImport = () => {
    if (!importFile) return;
    Papa.parse(importFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const payload = results.data.map((row: any) => ({
          employeeCode: row['Employee Code'] || '',
          name: row['Name'] || '',
          status: row['Status'] || 'Active',
          department: row['Department'],
          designation: row['Designation'],
          branch: row['Branch'],
        }));
        
        importMutation.mutate({ data: { employees: payload, updateOnDuplicate: true } }, {
          onSuccess: (res) => {
            toast({ title: "Import Complete", description: `Imported ${res.imported}, Updated ${res.updated}` });
            queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
            setIsImportOpen(false);
          }
        });
      }
    });
  };

  const accessKeys = [
    "zohoEmail", "microsoftEmail", "microsoftOffice", "finfluxBmDashboard", 
    "mobiliteField", "mobiliteCredit", "hoDashboard", "lightMoney", 
    "zohoProjects", "jira", "bitbucket", "adobeAcrobat", "assetcuez", 
    "exotel", "godaddy", "bluehost", "hostinger", "emailHosting", 
    "awsConsole", "msg91", "dmsAlfresco"
  ];

  return (
    <AppLayout title="Employee Master">
      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 flex flex-col h-[calc(100vh-120px)]">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search employee by name or code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-11 bg-background"
            />
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button variant="outline" className="h-11" onClick={() => setIsImportOpen(true)}>
              <Upload className="w-4 h-4 mr-2" /> Import
            </Button>
            <Button className="h-11 shadow-md shadow-primary/20" onClick={() => handleOpenForm()}>
              <Plus className="w-4 h-4 mr-2" /> Add Employee
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto border rounded-xl">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : employees?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                employees?.map(emp => (
                  <TableRow key={emp.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">{emp.employeeCode}</TableCell>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.department || '-'}</TableCell>
                    <TableCell>{emp.branch || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                        emp.status === 'In Service' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                        'bg-rose-500/10 text-rose-600 border-rose-500/20'
                      }>
                        {emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100" onClick={() => handleOpenAccess(emp)}>
                          <ShieldAlert className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 bg-amber-50 hover:bg-amber-100" onClick={() => handleOpenForm(emp)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 bg-rose-50 hover:bg-rose-100" onClick={() => handleDelete(emp.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Employee" : "Add Employee"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
            <div className="space-y-2"><Label>Employee Code *</Label><Input value={formData.employeeCode} onChange={e => setFormData({...formData, employeeCode: e.target.value})} /></div>
            <div className="space-y-2"><Label>Name *</Label><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="In Service">In Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Department</Label><Input value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} /></div>
            <div className="space-y-2"><Label>Designation</Label><Input value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} /></div>
            <div className="space-y-2"><Label>Branch</Label><Input value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} /></div>
            <div className="space-y-2"><Label>Email ID</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div className="space-y-2"><Label>Joining Date</Label><Input type="date" value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} /></div>
            <div className="space-y-2"><Label>Contact Number</Label><Input value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} /></div>
            <div className="space-y-2"><Label>State</Label><Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Access Checklist Dialog */}
      <Dialog open={isAccessOpen} onOpenChange={setIsAccessOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>System Access Checklist - {selectedEmp?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-6">
            {accessKeys.map((key) => (
              <div key={key} className="flex items-center space-x-3 p-3 rounded-lg border bg-muted/20 hover:bg-muted/50 transition-colors">
                <Checkbox 
                  id={key}
                  checked={!!accessData[key]}
                  onCheckedChange={(c) => setAccessData({...accessData, [key]: c})}
                />
                <Label htmlFor={key} className="text-sm font-medium cursor-pointer">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAccessOpen(false)}>Close</Button>
            <Button onClick={handleSaveAccess} disabled={accessMutation.isPending}>Save Access</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Employees</DialogTitle>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/20">
              <FileSpreadsheet className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Upload CSV or Excel file</p>
              <Input type="file" accept=".csv" className="mt-4" onChange={e => setImportFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
            <Button onClick={handleImport} disabled={!importFile || importMutation.isPending}>
              {importMutation.isPending ? "Importing..." : "Start Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
