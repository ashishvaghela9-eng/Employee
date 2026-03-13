import { useState } from "react";
import { useListEmployees } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileBarChart, Download, Loader2 } from "lucide-react";
import Papa from "papaparse";

export default function Reports() {
  const [tab, setTab] = useState<"Active" | "Exited">("Active");
  
  const { data: employees, isLoading } = useListEmployees();

  const filteredData = employees?.filter(e => {
    if (tab === "Active") return e.status !== "Inactive";
    return e.status === "Inactive";
  }) || [];

  const handleExport = () => {
    if (!filteredData.length) return;
    const csv = Papa.unparse(filteredData.map(e => ({
      'Employee Code': e.employeeCode,
      'Name': e.name,
      'Status': e.status,
      'Department': e.department,
      'Designation': e.designation,
      'Branch': e.branch,
      'Joining Date': e.joiningDate,
      'Exit Date': e.exitDate,
    })));
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${tab}_Employees_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout title="Reports & Analytics">
      <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-6 flex flex-col h-[calc(100vh-120px)]">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b pb-4">
          <div className="flex space-x-1 bg-muted p-1 rounded-xl">
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'Active' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setTab("Active")}
            >
              Active Employees
            </button>
            <button 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'Exited' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setTab("Exited")}
            >
              Exited Employees
            </button>
          </div>
          <Button onClick={handleExport} variant="outline" className="h-10 border-primary/20 text-primary hover:bg-primary/10">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

        <div className="flex-1 overflow-auto border rounded-xl">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Joining Date</TableHead>
                {tab === 'Exited' && <TableHead>Exit Date</TableHead>}
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="h-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="h-32 text-center text-muted-foreground">No records found for this report.</TableCell></TableRow>
              ) : (
                filteredData.map(emp => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.employeeCode}</TableCell>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.department || '-'}</TableCell>
                    <TableCell>{emp.branch || '-'}</TableCell>
                    <TableCell>{emp.joiningDate || '-'}</TableCell>
                    {tab === 'Exited' && <TableCell>{emp.exitDate || '-'}</TableCell>}
                    <TableCell>
                      <Badge variant="outline" className={emp.status === 'Active' ? 'text-emerald-600 border-emerald-500/20' : 'text-rose-600 border-rose-500/20'}>
                        {emp.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
