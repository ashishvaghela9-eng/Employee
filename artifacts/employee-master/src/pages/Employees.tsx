import { useState, useRef } from "react";
import { useListEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, useImportEmployees } from "@workspace/api-client-react";
import type { Employee } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Search, Plus, Upload, Download, Edit, Trash2, Loader2,
  FileSpreadsheet, AlertCircle, CheckCircle2, X, Eye, EyeOff
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { ACCESS_ITEMS } from "@/lib/access-items";

// ── Template / CSV map ────────────────────────────────────────────────────────
const TEMPLATE_COLS = [
  "Employee Code", "Name", "Status", "Department", "Designation",
  "Contact Number", "State", "Branch", "Joining Date", "Email ID",
  "Password", "Requester", "Approver", "Creator",
  "Exit Initiator", "Exit Date", "User Exit Status",
];

const CSV_MAP: Record<string, string> = {
  "Employee Code":    "employeeCode",
  "Name":            "name",
  "Status":          "status",
  "Department":      "department",
  "Designation":     "designation",
  "Contact Number":  "contactNumber",
  "State":           "state",
  "Branch":          "branch",
  "Joining Date":    "joiningDate",
  "Email ID":        "email",
  "Password":        "password",
  "Requester":       "requester",
  "Approver":        "approver",
  "Creator":         "creator",
  "Exit Initiator":  "exitInitiator",
  "Exit Date":       "exitDate",
  "User Exit Status":"userExitStatus",
};

const EMPTY_FORM = {
  employeeCode: "", name: "", status: "Active", department: "", designation: "",
  contactNumber: "", state: "", branch: "", joiningDate: "", email: "",
  password: "", requester: "", approver: "", creator: "",
  exitInitiator: "", exitDate: "", userExitStatus: "No",
};

function StatusBadge({ status }: { status?: string }) {
  const cls =
    status === "Active"     ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
    status === "In Service" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                              "bg-rose-500/10 text-rose-600 border-rose-500/20";
  return <Badge variant="outline" className={cls}>{status || "—"}</Badge>;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Employees() {
  const [search,       setSearch]       = useState("");
  const [isFormOpen,   setIsFormOpen]   = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingId,    setEditingId]    = useState<number | null>(null);
  const [formData,     setFormData]     = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM });
  const [accessData,   setAccessData]   = useState<Record<string, boolean>>({});
  const [showPwd,      setShowPwd]      = useState(false);

  // import state
  const [importRows,      setImportRows]      = useState<any[]>([]);
  const [importHeaders,   setImportHeaders]   = useState<string[]>([]);
  const [columnMap,       setColumnMap]       = useState<Record<string, string>>({});
  const [updateDuplicate, setUpdateDuplicate] = useState(true);
  const [importProgress,  setImportProgress]  = useState(0);
  const [importResult,    setImportResult]    = useState<{
    imported: number; updated: number; failed: number;
    errors: { row: number; error: string }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient    = useQueryClient();
  const { toast }      = useToast();
  const { data: employees, isLoading } = useListEmployees({ search: search || undefined });

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();
  const importMutation = useImportEmployees();

  // ── form helpers ────────────────────────────────────────────────────────────
  const setF = (k: keyof typeof EMPTY_FORM, v: string) => {
    setFormData(p => {
      const next = { ...p, [k]: v };
      // when exit status flipped to Yes, clear all service access in UI too
      if (k === "userExitStatus" && v === "Yes") {
        setAccessData({});
      }
      return next;
    });
  };

  const handleOpenForm = (emp?: Employee) => {
    setShowPwd(false);
    if (emp) {
      setEditingId(emp.id);
      setFormData({
        employeeCode:   emp.employeeCode,
        name:           emp.name,
        status:         emp.status,
        department:     emp.department     || "",
        designation:    emp.designation    || "",
        contactNumber:  emp.contactNumber  || "",
        state:          emp.state          || "",
        branch:         emp.branch         || "",
        joiningDate:    emp.joiningDate    || "",
        email:          emp.email          || "",
        password:       "",
        requester:      emp.requester      || "",
        approver:       emp.approver       || "",
        creator:        emp.creator        || "",
        exitInitiator:  emp.exitInitiator  || "",
        exitDate:       emp.exitDate       || "",
        userExitStatus: emp.userExitStatus || "No",
      });
      setAccessData((emp.access as Record<string, boolean>) || {});
    } else {
      setEditingId(null);
      setFormData({ ...EMPTY_FORM });
      setAccessData({});
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.employeeCode || !formData.name) {
      toast({ title: "Validation Error", description: "Employee Code and Name are required.", variant: "destructive" });
      return;
    }
    const payload: any = { ...formData };
    if (!payload.password) delete payload.password;

    // include access — if exit=Yes, server will auto-clear, but we also clear locally
    payload.access = formData.userExitStatus === "Yes" ? {} : accessData;

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          toast({ title: "Updated", description: "Employee updated successfully." });
          queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
          setIsFormOpen(false);
        },
        onError: (e: any) => toast({ title: "Error", description: e?.message || "Update failed", variant: "destructive" }),
      });
    } else {
      createMutation.mutate({ data: payload }, {
        onSuccess: () => {
          toast({ title: "Created", description: "Employee added successfully." });
          queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
          setIsFormOpen(false);
        },
        onError: (e: any) => toast({ title: "Error", description: e?.message || "Create failed", variant: "destructive" }),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Deleted" });
        queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      },
    });
  };

  // ── import helpers ──────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target!.result as ArrayBuffer);
      const wb   = XLSX.read(data, { type: "array" });
      const ws   = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });
      if (!rows.length) { toast({ title: "Empty file", variant: "destructive" }); return; }
      const headers = Object.keys(rows[0]);
      setImportHeaders(headers);
      setImportRows(rows);
      const autoMap: Record<string, string> = {};
      headers.forEach(h => { if (CSV_MAP[h]) autoMap[h] = CSV_MAP[h]; });
      setColumnMap(autoMap);
      setImportResult(null);
      setImportProgress(0);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleStartImport = () => {
    if (!importRows.length) return;
    const payload = importRows.map(row => {
      const emp: any = {};
      Object.entries(columnMap).forEach(([csvCol, fieldKey]) => {
        if (fieldKey) emp[fieldKey] = String(row[csvCol] || "").trim();
      });
      return emp;
    });
    setImportProgress(30);
    importMutation.mutate({ data: { employees: payload, updateOnDuplicate: updateDuplicate } }, {
      onSuccess: (res) => {
        setImportProgress(100);
        setImportResult(res);
        toast({ title: "Import Complete", description: `Imported ${res.imported}, Updated ${res.updated}, Failed ${res.failed}` });
        queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      },
      onError: (e: any) => {
        setImportProgress(0);
        toast({ title: "Import Failed", description: e?.message, variant: "destructive" });
      },
    });
  };

  const downloadErrorReport = () => {
    if (!importResult?.errors?.length) return;
    const ws = XLSX.utils.json_to_sheet(importResult.errors);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Errors");
    XLSX.writeFile(wb, "import_errors.xlsx");
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_COLS, []]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "employee_import_template.xlsx");
  };

  const resetImport = () => {
    setImportRows([]); setImportHeaders([]); setColumnMap({});
    setImportResult(null); setImportProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fieldOptions = [
    { value: "", label: "— Skip —" },
    ...Object.entries(CSV_MAP).map(([, v]) => ({ value: v, label: v.replace(/([A-Z])/g, ' $1').trim() })),
  ];

  const enabledCount = Object.values(accessData).filter(Boolean).length;

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <AppLayout title="Employee Master">
      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 flex flex-col" style={{ minHeight: "calc(100vh - 120px)" }}>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or employee code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-11 bg-background"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="h-10" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-1.5" /> Template
            </Button>
            <Button variant="outline" size="sm" className="h-10" onClick={() => { resetImport(); setIsImportOpen(true); }}>
              <Upload className="w-4 h-4 mr-1.5" /> Import
            </Button>
            <Button size="sm" className="h-10 shadow-md shadow-primary/20" onClick={() => handleOpenForm()}>
              <Plus className="w-4 h-4 mr-1.5" /> Add Employee
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto border rounded-xl">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Joining Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Exit Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={10} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                </TableCell></TableRow>
              ) : !employees?.length ? (
                <TableRow><TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                  No employees found
                </TableCell></TableRow>
              ) : employees.map((emp, idx) => (
                <TableRow key={emp.id} className="hover:bg-muted/30">
                  <TableCell className="text-muted-foreground text-sm">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-sm font-medium">{emp.employeeCode}</TableCell>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.department || "—"}</TableCell>
                  <TableCell>{emp.designation || "—"}</TableCell>
                  <TableCell>{emp.branch || "—"}</TableCell>
                  <TableCell>{emp.joiningDate || "—"}</TableCell>
                  <TableCell><StatusBadge status={emp.status} /></TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      emp.userExitStatus === "Yes"        ? "bg-rose-500/10 text-rose-600 border-rose-200" :
                      emp.userExitStatus === "In Service" ? "bg-amber-500/10 text-amber-600 border-amber-200" :
                                                           "bg-muted/50 text-muted-foreground"
                    }>
                      {emp.userExitStatus || "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 bg-amber-50 hover:bg-amber-100" title="Edit" onClick={() => handleOpenForm(emp)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600 bg-rose-50 hover:bg-rose-100" title="Delete" onClick={() => handleDelete(emp.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Add / Edit Dialog ──────────────────────────────────────────────── */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Employee" : "Add Employee"}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="services">
                Services
                {enabledCount > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 leading-none">
                    {enabledCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* ── Basic Information Tab ── */}
            <TabsContent value="basic">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="col-span-2"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Basic Information</p><Separator /></div>

                <div className="space-y-1.5"><Label>Employee Code *</Label><Input value={formData.employeeCode} onChange={e => setF("employeeCode", e.target.value)} placeholder="e.g. LF001" /></div>
                <div className="space-y-1.5"><Label>Name *</Label><Input value={formData.name} onChange={e => setF("name", e.target.value)} placeholder="Full name" /></div>

                <div className="space-y-1.5">
                  <Label>Status *</Label>
                  <Select value={formData.status} onValueChange={v => setF("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="In Service">In Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5"><Label>Department</Label><Input value={formData.department} onChange={e => setF("department", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Designation</Label><Input value={formData.designation} onChange={e => setF("designation", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Branch</Label><Input value={formData.branch} onChange={e => setF("branch", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>State</Label><Input value={formData.state} onChange={e => setF("state", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Contact Number</Label><Input value={formData.contactNumber} onChange={e => setF("contactNumber", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Joining Date</Label><Input type="date" value={formData.joiningDate} onChange={e => setF("joiningDate", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Email ID</Label><Input type="email" value={formData.email} onChange={e => setF("email", e.target.value)} /></div>

                <div className="space-y-1.5">
                  <Label>Password {editingId ? "(leave blank to keep)" : ""}</Label>
                  <div className="relative">
                    <Input type={showPwd ? "text" : "password"} value={formData.password} onChange={e => setF("password", e.target.value)} placeholder={editingId ? "••••••••" : "Set password"} />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPwd(p => !p)}>
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="col-span-2 mt-2"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Request Initiator</p><Separator /></div>

                <div className="space-y-1.5"><Label>Requester</Label><Input value={formData.requester} onChange={e => setF("requester", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Approver</Label><Input value={formData.approver} onChange={e => setF("approver", e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Creator</Label><Input value={formData.creator} onChange={e => setF("creator", e.target.value)} /></div>

                <div className="col-span-2 mt-2"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Exit Details</p><Separator /></div>

                <div className="space-y-1.5"><Label>Exit Initiator (HR / Team)</Label><Input value={formData.exitInitiator} onChange={e => setF("exitInitiator", e.target.value)} /></div>

                <div className="space-y-1.5">
                  <Label>User Exit Status</Label>
                  <Select value={formData.userExitStatus} onValueChange={v => setF("userExitStatus", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Yes">Yes (will mark Inactive)</SelectItem>
                      <SelectItem value="In Service">In Service</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.userExitStatus === "Yes" && (
                    <p className="text-xs text-rose-600 mt-1">⚠ Employee will be marked Inactive and all service access will be removed.</p>
                  )}
                </div>

                <div className="space-y-1.5"><Label>Exit Date</Label><Input type="date" value={formData.exitDate} onChange={e => setF("exitDate", e.target.value)} /></div>
              </div>
            </TabsContent>

            {/* ── Services Tab ── */}
            <TabsContent value="services">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">System Access / Services</p>
                    <p className="text-xs text-muted-foreground">Select the services this employee has access to.</p>
                  </div>
                  <Badge variant="outline" className="text-primary border-primary/30">
                    {enabledCount} / {ACCESS_ITEMS.length} enabled
                  </Badge>
                </div>

                {formData.userExitStatus === "Yes" && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Exit status is "Yes" — all services will be cleared on save.
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ACCESS_ITEMS.map(({ key, label }) => {
                    const checked = !!accessData[key];
                    const disabled = formData.userExitStatus === "Yes";
                    return (
                      <label
                        key={key}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors
                          ${disabled ? "opacity-40 cursor-not-allowed" :
                            checked  ? "bg-primary/5 border-primary/30 hover:bg-primary/10" :
                                       "bg-muted/20 border-border hover:bg-muted/40"}`}
                      >
                        <Checkbox
                          id={key}
                          checked={checked}
                          disabled={disabled}
                          onCheckedChange={c => setAccessData(p => ({ ...p, [key]: !!c }))}
                        />
                        <span className="text-sm font-medium leading-tight">{label}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => {
                    const all: Record<string, boolean> = {};
                    ACCESS_ITEMS.forEach(i => { all[i.key] = true; });
                    setAccessData(all);
                  }} disabled={formData.userExitStatus === "Yes"}>Select All</Button>
                  <Button variant="outline" size="sm" onClick={() => setAccessData({})} disabled={formData.userExitStatus === "Yes"}>Clear All</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : "Save Employee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Import Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={isImportOpen} onOpenChange={v => { if (!v) resetImport(); setIsImportOpen(v); }}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Employees</DialogTitle>
            <p className="text-sm text-muted-foreground">Upload CSV or Excel (.xlsx). Map columns, then start import.</p>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div
              className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium text-sm">Click to upload CSV or Excel file</p>
              <p className="text-xs text-muted-foreground mt-1">.csv, .xlsx, .xls supported</p>
              {importRows.length > 0 && <Badge className="mt-3 bg-primary/10 text-primary border-primary/20">{importRows.length} rows loaded</Badge>}
              <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFileChange} />
            </div>

            {importHeaders.length > 0 && !importResult && (
              <div className="space-y-3">
                <p className="text-sm font-semibold">Column Mapping</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  {importHeaders.map(h => (
                    <div key={h} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 border">
                      <span className="text-xs font-mono bg-background px-2 py-1 rounded border flex-shrink-0 max-w-[130px] truncate" title={h}>{h}</span>
                      <span className="text-muted-foreground text-xs">→</span>
                      <Select value={columnMap[h] || ""} onValueChange={v => setColumnMap(p => ({ ...p, [h]: v }))}>
                        <SelectTrigger className="h-8 text-xs flex-1"><SelectValue placeholder="Skip" /></SelectTrigger>
                        <SelectContent>
                          {fieldOptions.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border bg-muted/20">
                  <Switch checked={updateDuplicate} onCheckedChange={setUpdateDuplicate} id="update-dup" />
                  <label htmlFor="update-dup" className="text-sm cursor-pointer">
                    <span className="font-medium">Update on duplicate Employee Code</span>
                    <p className="text-xs text-muted-foreground">Update existing record if employee code already exists.</p>
                  </label>
                </div>
              </div>
            )}

            {importMutation.isPending && (
              <div className="space-y-2">
                <Progress value={importProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">Importing… please wait</p>
              </div>
            )}

            {importResult && (
              <div className="rounded-xl border bg-muted/10 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <p className="font-semibold text-sm">Import Complete</p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-emerald-500/10 p-3"><p className="text-2xl font-bold text-emerald-600">{importResult.imported}</p><p className="text-xs text-muted-foreground">Imported</p></div>
                  <div className="rounded-lg bg-blue-500/10 p-3"><p className="text-2xl font-bold text-blue-600">{importResult.updated}</p><p className="text-xs text-muted-foreground">Updated</p></div>
                  <div className="rounded-lg bg-rose-500/10 p-3"><p className="text-2xl font-bold text-rose-600">{importResult.failed}</p><p className="text-xs text-muted-foreground">Failed</p></div>
                </div>
                {importResult.errors.length > 0 && (
                  <div>
                    <p className="text-xs text-rose-600 flex items-center gap-1 mb-2"><AlertCircle className="w-3.5 h-3.5" />{importResult.errors.length} rows had errors</p>
                    <div className="max-h-32 overflow-y-auto rounded-lg border bg-background text-xs divide-y">
                      {importResult.errors.map((e, i) => (
                        <div key={i} className="flex gap-2 px-3 py-1.5"><span className="text-muted-foreground">Row {e.row}:</span><span className="text-rose-600">{e.error}</span></div>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="mt-2 h-8 text-xs" onClick={downloadErrorReport}>
                      <Download className="w-3.5 h-3.5 mr-1" /> Download Error Report
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" size="sm" onClick={resetImport} disabled={!importRows.length || importMutation.isPending}><X className="w-4 h-4 mr-1" /> Clear</Button>
            <Button variant="outline" onClick={() => { resetImport(); setIsImportOpen(false); }}>Close</Button>
            {!importResult && (
              <Button onClick={handleStartImport} disabled={!importRows.length || importMutation.isPending}>
                {importMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Importing…</> : `Import ${importRows.length} Rows`}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
