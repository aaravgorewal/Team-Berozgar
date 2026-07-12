import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepartmentsTab } from "@/components/organization/departments-tab";
import { CategoriesTab } from "@/components/organization/categories-tab";
import { EmployeesTab } from "@/components/organization/employees-tab";
import { getDepartments, getCategories, getEmployees } from "@/app/actions/organization";

export default async function OrganizationPage() {
  const [departments, categories, employees] = await Promise.all([
    getDepartments(),
    getCategories(),
    getEmployees(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Organization Setup</h2>
        <p className="text-muted-foreground">
          Manage departments, asset categories, and the employee directory.
        </p>
      </div>

      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="departments" className="m-0">
            <DepartmentsTab initialData={departments} />
          </TabsContent>
          <TabsContent value="categories" className="m-0">
            <CategoriesTab initialData={categories} />
          </TabsContent>
          <TabsContent value="employees" className="m-0">
            <EmployeesTab initialData={employees} departments={departments} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
