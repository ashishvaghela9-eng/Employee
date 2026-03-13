import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Mail, Shield } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();

  return (
    <AppLayout title="Profile & Settings">
      <div className="max-w-2xl mx-auto mt-8">
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/80 to-accent/80" />
          <CardHeader className="relative pt-0">
            <div className="absolute -top-12 left-6 w-24 h-24 bg-card rounded-full flex items-center justify-center border-4 border-card shadow-lg">
              <UserCircle className="w-16 h-16 text-primary" />
            </div>
            <div className="pt-14">
              <CardTitle className="text-2xl">{user?.name}</CardTitle>
              <CardDescription className="text-base mt-1">{user?.role} Account</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="flex items-center space-x-4 p-4 rounded-xl border bg-muted/20">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                <p className="text-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-xl border bg-muted/20">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Permissions</p>
                <p className="text-foreground">Full access to HR management modules</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
