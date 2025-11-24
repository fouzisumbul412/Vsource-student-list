import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">
        Welcome to VSource Admin
      </h1>
      <p className="text-sm text-slate-600">
        Use the sidebar to manage student registrations, payments, invoices and
        employees.
      </p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-primary">
            0
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-secondary">
            0
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invoices Generated</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-800">
            0
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Employees</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-800">
            0
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
