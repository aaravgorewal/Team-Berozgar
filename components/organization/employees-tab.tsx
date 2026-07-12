"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserCog } from "lucide-react";
import { updateEmployeeRole } from "@/app/actions/organization";

import { CreateEmployeeDialog } from "./create-employee-dialog";

export function EmployeesTab({ initialData, departments }: { initialData: any[], departments: any[] }) {
  const [editingUser, setEditingUser] = useState<any>(null);
  const [role, setRole] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("none");
  const [isLoading, setIsLoading] = useState(false);

  async function handleUpdate() {
    if (!editingUser) return;
    setIsLoading(true);
    try {
      await updateEmployeeRole(
        editingUser.id,
        role as any,
        departmentId === "none" ? undefined : departmentId
      );
      setEditingUser(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  function openEdit(user: any) {
    setEditingUser(user);
    setRole(user.role);
    setDepartmentId(user.departmentId || "none");
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>View all registered employees and promote them to managerial roles.</CardDescription>
        </div>
        <CreateEmployeeDialog departments={departments} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.department?.name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {user.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                      <UserCog className="h-4 w-4 mr-2" />
                      Manage Role
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Employee Role</DialogTitle>
              <DialogDescription>
                Update role and department for {editingUser?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                    <SelectItem value="DEPARTMENT_HEAD">Department Head</SelectItem>
                    <SelectItem value="ASSET_MANAGER">Asset Manager</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
